# Lazada Stock Monitor

This project is a Vercel-friendly public stock checker for Lazada Singapore pages.

## What It Does

- Exposes `/api/check-stock`, which fetches a Lazada Singapore page server-side and returns the stock state.
- Serves `/pokemonscalpingview`, where a user can paste a Lazada URL, auto-poll every few seconds, and open the product page in a new tab when stock is detected.

## Setup

1. Copy `.env.example` to `.env`.
2. Adjust the detection strings if Lazada uses different wording on this listing.
3. Deploy to Vercel or run locally with your preferred static/serverless dev setup.

## Public Web App

Deploy this repo to Vercel. The public UI lives at:

```text
/pokemonscalpingview
```

Flow:

1. Paste a Lazada Singapore URL into the textbox.
2. Choose a polling interval in seconds.
3. Click `Start Monitoring`.
4. The page calls `/api/check-stock` on a loop.
5. If the API reports `in_stock`, the browser opens the Lazada page in a new tab.

The site cannot force a browser tab to open from the server. The popup is reserved from the user's button click on the client, then navigated only if the API confirms stock.

## Configuration

- `REQUEST_TIMEOUT_MS`: Timeout per request.
- `AVAILABLE_TEXTS`: `||`-separated list of text fragments that imply stock.
- `UNAVAILABLE_TEXTS`: `||`-separated list of text fragments that imply no stock.

## Notes

- Lazada may change its markup or render stock state dynamically, so you may need to tune `AVAILABLE_TEXTS` and `UNAVAILABLE_TEXTS`.
- If the page is heavily bot-protected, a plain HTTP fetch may not reflect the browser view.
