import { useEffect, useMemo, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { fetchRestaurantsOSM } from "../services/overpass";
import { geocodeAddress } from "../services/geocode";
import MiniMap from "../components/MiniMap";
import { useFavorites } from "../hooks/useFavorites";

function haversine(lat1, lon1, lat2, lon2){
  const R = 6371e3;
  const toRad = d => d * Math.PI / 180;
  const dφ = toRad(lat2 - lat1), dλ = toRad(lon2 - lon1);
  const a = Math.sin(dφ/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // meters
}

export default function Result() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);

  const [spin, setSpin] = useState(0);
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState(null);

  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const cuisines = qs.get("cuisines") || "";
  const radius = Number(qs.get("radius") || 5);
  const minRating = Number(qs.get("minRating") || 0);
  const lat = qs.get("lat");
  const lng = qs.get("lng");
  const address = qs.get("address") || "";

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        let coords = null;
        if (lat && lng) {
          coords = { lat: Number(lat), lon: Number(lng) };
        } else if (address) {
          coords = await geocodeAddress(address);
          if (!coords) throw new Error("Couldn't find that address.");
        } else {
          throw new Error("No location provided. Go back and set a location.");
        }

        let items = await fetchRestaurantsOSM({
          lat: coords.lat,
          lon: coords.lon,
          radiusMiles: radius,
          cuisinesCSV: cuisines
        });

        // OSM has no real ratings; our helper generates 3.5–5.0 in overpass.js
        items = items.filter(r => r.rating >= minRating);

        // Sort by distance (closest first)
        if (coords) {
          items.sort((a, b) => {
            const da = haversine(coords.lat, coords.lon, a.lat, a.lon);
            const db = haversine(coords.lat, coords.lon, b.lat, b.lon);
            return da - db;
          });
        }

        setOrigin(coords);
        setRestaurants(items);
      } catch (e) {
        setError(e.message || "Failed to load restaurants.");
      } finally {
        setLoading(false);
      }
    })();
  }, [search]);

  // Pick a random one, rerollable
  const pick = useMemo(() => {
    if (!restaurants.length) return null;
    const idx = Math.floor((Math.random() * restaurants.length + spin)) % restaurants.length;
    return restaurants[idx];
  }, [restaurants, spin]);

  // Document title polish
  useEffect(() => {
    document.title = pick ? `${pick.name} · Restaurant Roulette` : "Results · Restaurant Roulette";
  }, [pick]);

  const gmapLink = (r) =>
    r ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name} ${r.address}`)}` : "#";

  return (
    <main className="container" style={{ paddingTop: 32 }}>
      <div className="card" style={{ marginBottom: 14 }}>
        <h2 style={{ marginTop: 0 }}>Result</h2>
        <p>
          Cuisines: <b>{cuisines || "Any"}</b> · Radius: <b>{radius} mi</b> · Min rating:{" "}
          <b>{minRating.toFixed(1)}</b>
        </p>
      </div>

      {loading && <div className="shimmer" aria-busy="true" aria-label="Loading results" />}

      {!loading && error && (
        <div className="card">
          ❗ {error}{" "}
          <button className="smallBtn" onClick={() => window.location.reload()} aria-label="Retry">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && pick && (
        <>
          <div className="card" style={{ marginBottom: 14 }}>
            <h3 style={{ marginTop: 0 }}>{pick.name}</h3>
            <p>⭐ {pick.rating}</p>
            <p>{pick.address}</p>
            {origin && pick?.lat && pick?.lon && (
              <p>Distance: {(haversine(origin.lat, origin.lon, pick.lat, pick.lon)/1609.34).toFixed(1)} mi</p>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <a className="smallBtn linkBtn" href={gmapLink(pick)} target="_blank" rel="noreferrer">View on Maps</a>
              <button className="smallBtn linkBtn" onClick={() => setSpin(n => n + 1)} aria-label="Reroll">Reroll</button>
              <button className="smallBtn" onClick={() => navigate(-1)} aria-label="Go back">Back</button>
              <Link className="smallBtn" to="/" style={{ textDecoration: "none", display: "inline-block" }}>Home</Link>
              {!isFavorite(pick.id)
                ? <button className="smallBtn" onClick={() => addFavorite(pick)}>☆ Save</button>
                : <button className="smallBtn" onClick={() => removeFavorite(pick.id)}>★ Saved</button>}
            </div>

            <MiniMap lat={pick?.lat} lon={pick?.lon} />
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h4 style={{ margin: 0 }}>More nearby options</h4>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>
                {restaurants.length} found
              </span>
            </div>

            <ul style={{ listStyle: "none", padding: 0, marginTop: 10 }}>
              {restaurants.slice(0, 10).map(r => (
                <li key={r.id} style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.name}</div>
                      <div style={{ fontSize: 13, color: "var(--muted)" }}>
                        ⭐ {r.rating} · {r.address}
                      </div>
                    </div>
                    <a className="smallBtn" href={gmapLink(r)} target="_blank" rel="noreferrer">Maps</a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {!loading && !error && restaurants.length === 0 && (
        <div className="card">No restaurants found. Try widening the radius or removing filters.</div>
      )}
    </main>
  );
}
