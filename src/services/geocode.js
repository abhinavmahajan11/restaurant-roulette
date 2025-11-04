import axios from "axios";

export async function geocodeAddress(address) {
  if (!address?.trim()) return null;
  const url = "https://nominatim.openstreetmap.org/search";
  const { data } = await axios.get(url, {
    params: { q: address, format: "json", limit: 1, addressdetails: 1 },
    headers: { Accept: "application/json" },
  });
  if (!Array.isArray(data) || data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

export async function reverseGeocode(lat, lon) {
  const url = "https://nominatim.openstreetmap.org/reverse";
  const { data } = await axios.get(url, {
    params: { lat, lon, format: "json", zoom: 14, addressdetails: 1 },
    headers: { Accept: "application/json" },
  });
  return data?.display_name || "";
}
