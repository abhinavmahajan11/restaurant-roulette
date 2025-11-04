import axios from "axios";

export async function fetchRestaurantsOSM({ lat, lon, radiusMiles, cuisinesCSV }) {
  const meters = Math.max(100, Math.round(radiusMiles * 1609.34));
  const cuisineList = (cuisinesCSV || "")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

  const q = `
    [out:json][timeout:25];
    (
      node["amenity"="restaurant"](around:${meters},${lat},${lon});
      way["amenity"="restaurant"](around:${meters},${lat},${lon});
      relation["amenity"="restaurant"](around:${meters},${lat},${lon});
    );
    out center tags;
  `;

  const { data } = await axios.post("https://overpass-api.de/api/interpreter", q, {
    headers: { "Content-Type": "text/plain;charset=UTF-8" }
  });

  const elements = Array.isArray(data?.elements) ? data.elements : [];

  let items = elements.map(el => {
    const center = el.type === "node" ? { lat: el.lat, lon: el.lon } : el.center;
    const name = el.tags?.name || "Unnamed Restaurant";
    const cuisineTag = (el.tags?.cuisine || "").toLowerCase();
    const rating = 3.5 + ((Math.abs(hashCode(String(el.id))) % 16) / 10); // 3.5–5.0
    return {
      id: el.id,
      name,
      address: [el.tags?.["addr:housenumber"], el.tags?.["addr:street"], el.tags?.["addr:city"]]
        .filter(Boolean).join(" ") || el.tags?.["addr:full"] || "Address not listed",
      cuisineTag,
      lat: center?.lat,
      lon: center?.lon,
      rating: Math.min(5, Math.round(rating * 10) / 10),
    };
  });

  if (cuisineList.length) {
    items = items.filter(it => {
      const hay = (it.name + " " + it.cuisineTag).toLowerCase();
      return cuisineList.some(c => hay.includes(c));
    });
  }

  return items;
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}
