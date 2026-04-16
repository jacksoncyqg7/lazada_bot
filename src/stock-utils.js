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
