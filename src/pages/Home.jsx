import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import Switch from "../components/Switch";
import AddressAutocomplete from "../components/AddressAutocomplete";
import { reverseGeocode } from "../services/geocode";

export default function Home() {
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const [cuisines, setCuisines] = useState("");
  const [radius, setRadius] = useState(10);
  const [minRating, setMinRating] = useState(0);
  const [openNow, setOpenNow] = useState(false);
  const navigate = useNavigate();

  /* Persist filters across visits */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("rr_filters") || "null");
    if (saved) {
      setAddress(saved.address || "");
      setCuisines(saved.cuisines || "");
      setRadius(saved.radius ?? 10);
      setMinRating(saved.minRating ?? 0);
      setOpenNow(!!saved.openNow);
      setCoords(saved.coords || null);
    }
  }, []);
  useEffect(() => {
    const f = { address, cuisines, radius, minRating, openNow, coords };
    localStorage.setItem("rr_filters", JSON.stringify(f));
  }, [address, cuisines, radius, minRating, openNow, coords]);

  function useMyLocation() {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        (async () => {
          const label = await reverseGeocode(latitude, longitude);
          if (label) setAddress(label);
        })();
      },
      (e) => alert("Could not get location: " + e.message)
    );
  }

  function go() {
    const params = new URLSearchParams({
      cuisines: cuisines.trim(),
      radius: String(radius),
      minRating: String(minRating),
      openNow: String(openNow),
      lat: coords?.latitude ?? "",
      lng: coords?.longitude ?? "",
      address
    }).toString();
    navigate(`/result?${params}`);
  }

  return (
    <>
      <Hero />

      <main className="container">
        {/* Quick actions (Option B) */}
        <div className="row" style={{ marginBottom: 14 }}>
          <button className="primary" onClick={useMyLocation}>📍 Use My Location</button>
          <button className="smallBtn" onClick={() => setCuisines("Indian, Thai")}>🍛 Indian & Thai</button>
          <button className="smallBtn" onClick={() => setCuisines("Mexican")}>🌮 Mexican</button>
          <button
            className="smallBtn"
            onClick={() => { setRadius(5); setMinRating(4); }}
          >
            ⭐ Nearby, 4.0+
          </button>
        </div>

        {/* Favorites preview (Option D) */}
        {(() => {
          const stored = JSON.parse(localStorage.getItem("rr_favorites_v1") || "[]");
          if (!stored.length) return null;
          return (
            <div className="card" style={{ marginBottom: 20 }}>
              <b>Favorites</b>
              <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0" }}>
                {stored.slice(0, 4).map(f => (
                  <li key={f.id} style={{ padding: "6px 0", borderBottom: "1px solid #eee" }}>
                    {f.name} <span style={{ color: "var(--muted)" }}>· ⭐ {f.rating}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        <section className="filtersWrap">
          <div className="filtersHeader">
            <h3 className="filtersTitle">Filters</h3>
            <button className="favBtn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              ❤ Favorites
            </button>
          </div>

          <div className="card">
            <div className="field">
              <div className="label">📍 Location</div>
              <div className="inline">
                <AddressAutocomplete
                  value={address}
                  onChange={setAddress}
                  onPick={({ lat, lon, label }) => { setCoords({ latitude: lat, longitude: lon }); setAddress(label); }}
                />
                <button className="smallBtn linkBtn" onClick={useMyLocation}>Use My Location</button>
              </div>
            </div>

            <div className="field">
              <div className="label">🍽️ Cuisines</div>
              <input
                className="select"
                placeholder="Select cuisines…"
                value={cuisines}
                onChange={e => setCuisines(e.target.value)}
              />
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 6 }}>
                Tip: comma separate (e.g., Indian, Thai)
              </div>
            </div>

            <div className="field">
              <div className="label">📏 Radius</div>
              <div className="rangeRow">
                <input
                  className="slider"
                  type="range"
                  min="1"
                  max="25"
                  value={radius}
                  onChange={e => setRadius(+e.target.value)}
                />
                <div className="rangeVal">{radius} miles</div>
              </div>
            </div>

            <div className="field">
              <div className="label">⭐ Minimum Rating</div>
              <div className="rangeRow">
                <input
                  className="slider"
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={e => setMinRating(+e.target.value)}
                />
                <div className="rangeVal">{minRating.toFixed(1)}</div>
              </div>
            </div>

            <div className="field inline" style={{ justifyContent: "space-between" }}>
              <div className="label" style={{ margin: 0 }}>🕒 Open Now</div>
              <Switch checked={openNow} onChange={setOpenNow} />
            </div>

            <div className="field">
              <button className="primary" onClick={go} disabled={!coords && !address} aria-disabled={!coords && !address}>
                ✨ Generate Restaurant
              </button>
            </div>
          </div>

          <p className="helper">
            Ready to discover? Set your location and filters, then click generate to find your next meal.
          </p>
        </section>
      </main>
    </>
  );
}
