// src/services/overpass.js
import axios from "axios";

export async function fetchRestaurantsOSM({ lat, lon, radiusMiles, cuisinesCSV }) {
  const meters = Math.max(100, Math.round(radiusMiles * 1609.34));

  // Normalize cuisine filters (comma-separated -> array)
  const cuisineList = (cuisinesCSV || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // Overpass query (JSON output + include tags + centers)
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="restaurant"](around:${meters},${lat},${lon});
      way["amenity"="restaurant"](around:${meters},${lat},${lon});
      relation["amenity"="restaurant"](around:${meters},${lat},${lon});
    );
    out center tags;
  `;

  // Call Netlify Function (backend) instead of hitting Overpass directly
  const resp = await axios.get("/.netlify/functions/overpass", { params: { q: query } });

  // The function returns application/json, but body is text; guard both cases
  let payload = resp.data;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      payload = { elements: [] };
    }
  }

  const elements = Array.isArray(payload?.elements) ? payload.elements : [];

  // Map OSM elements to a uniform restaurant shape
  let items = elements.map((el) => {
    const center = el.type === "node" ? { lat: el.lat, lon: el.lon } : el.center;
    const name = el.tags?.name || "Unnamed Restaurant";
    const cuisineTag = (el.tags?.cuisine || "").toLowerCase();

    // Synthetic rating (3.5–5.0) for demo, deterministic per ID
    const rating = 3.5 + ((Math.abs(hashCode(String(el.id))) % 16) / 10);

    return {
      id: el.id,
      name,
      address:
        [el.tags?.["addr:housenumber"], el.tags?.["addr:street"], el.tags?.["addr:city"]]
          .filter(Boolean)
          .join(" ") || el.tags?.["addr:full"] || "Address not listed",
      cuisineTag,
      lat: center?.lat,
      lon: center?.lon,
      rating: Math.min(5, Math.round(rating * 10) / 10),
    };
  });

  // Optional cuisine filtering (by name or cuisine tag)
  if (cuisineList.length) {
    items = items.filter((it) => {
      const hay = (it.name + " " + it.cuisineTag).toLowerCase();
      return cuisineList.some((c) => hay.includes(c));
    });
  }

  return items;
}

// Simple deterministic hash for mock ratings
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}
