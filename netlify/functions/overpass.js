// netlify/functions/overpass.js
// Tiny backend proxy for Overpass (avoids CORS + fulfills backend requirement)

export async function handler(event) {
  try {
    const q = event.queryStringParameters.q;
    if (!q) {
      return { statusCode: 400, body: "Missing q" };
    }

    const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(q);
    const res = await fetch(url, { headers: { "User-Agent": "RestaurantRoulette/1.0" } });

    // Overpass may return text/plain even when it's JSON
    const text = await res.text();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: text
    };
  } catch (e) {
    return { statusCode: 500, body: e.message || "Server error" };
  }
}
