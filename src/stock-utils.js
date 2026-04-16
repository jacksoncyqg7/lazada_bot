export const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36";

export function detectStock(html, availableTexts, unavailableTexts) {
  const raw = html.toLowerCase();
  const text = normalizeHtml(html);

  for (const candidate of availableTexts) {
    const needle = candidate.toLowerCase();
    if (needle === "add to cart" && (text.includes(needle) || raw.includes(needle))) {
      return { status: "in_stock", match: candidate };
    }
  }

  for (const candidate of unavailableTexts) {
    const needle = candidate.toLowerCase();
    if (text.includes(needle) || raw.includes(needle)) {
      return { status: "out_of_stock", match: candidate };
    }
  }

  for (const candidate of availableTexts) {
    const needle = candidate.toLowerCase();
    if (text.includes(needle) || raw.includes(needle)) {
      return { status: "in_stock", match: candidate };
    }
  }

  return { status: "unknown", match: null };
}

export function inspectStockSignals(html, availableTexts, unavailableTexts) {
  const raw = html.toLowerCase();
  const text = normalizeHtml(html);

  return {
    htmlLength: html.length,
    normalizedLength: text.length,
    available: availableTexts.map((candidate) => inspectCandidate(candidate, raw, text)),
    unavailable: unavailableTexts.map((candidate) => inspectCandidate(candidate, raw, text)),
  };
}

export function normalizeHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export async function fetchPage(url, timeoutMs = 10000, userAgent = DEFAULT_USER_AGENT) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": userAgent,
        "accept-language": "en-SG,en;q=0.9",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        pragma: "no-cache",
        "cache-control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export function isAllowedLazadaUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "lazada.sg" || url.hostname.endsWith(".lazada.sg"));
  } catch {
    return false;
  }
}

function inspectCandidate(candidate, raw, text) {
  const needle = candidate.toLowerCase();
  const rawIndex = raw.indexOf(needle);
  const normalizedIndex = text.indexOf(needle);

  return {
    candidate,
    inRaw: rawIndex !== -1,
    inNormalized: normalizedIndex !== -1,
    rawSnippet: rawIndex !== -1 ? extractSnippet(raw, rawIndex, needle.length) : null,
    normalizedSnippet: normalizedIndex !== -1 ? extractSnippet(text, normalizedIndex, needle.length) : null,
  };
}

function extractSnippet(value, index, length) {
  const start = Math.max(0, index - 60);
  const end = Math.min(value.length, index + length + 60);
  return value.slice(start, end).replace(/\s+/g, " ").trim();
}
