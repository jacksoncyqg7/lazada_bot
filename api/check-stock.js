import {
  DEFAULT_USER_AGENT,
  detectStock,
  fetchPage,
  isAllowedLazadaUrl,
} from "../src/stock-utils.js";

const AVAILABLE_TEXTS = splitListEnv("AVAILABLE_TEXTS", ["add to cart", "buy now"]);
const UNAVAILABLE_TEXTS = splitListEnv("UNAVAILABLE_TEXTS", ["sold out", "out of stock"]);
const REQUEST_TIMEOUT_MS = numberEnv("REQUEST_TIMEOUT_MS", 10000);
const USER_AGENT = process.env.USER_AGENT ?? DEFAULT_USER_AGENT;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const body = parseBody(req.body);
  const url = typeof body.url === "string" ? body.url.trim() : "";

  if (!isAllowedLazadaUrl(url)) {
    res.status(400).json({ error: "Enter a valid Lazada Singapore URL." });
    return;
  }

  try {
    const html = await fetchPage(url, REQUEST_TIMEOUT_MS, USER_AGENT);
    const result = detectStock(html, AVAILABLE_TEXTS, UNAVAILABLE_TEXTS);

    res.status(200).json({
      ok: true,
      url,
      status: result.status,
      match: result.match,
    });
  } catch (error) {
    res.status(502).json({
      ok: false,
      error: error?.message ?? "Stock check failed.",
    });
  }
}

function parseBody(body) {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body;
}

function splitListEnv(key, fallback) {
  const raw = process.env[key];
  if (!raw) {
    return fallback;
  }

  return raw
    .split("||")
    .map((value) => value.trim())
    .filter(Boolean);
}

function numberEnv(key, fallback) {
  const raw = process.env[key];
  if (!raw) {
    return fallback;
  }

  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}
