import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function AddressAutocomplete({ value, onChange, onPick }) {
  const [q, setQ] = useState(value || "");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  useEffect(() => { setQ(value || ""); }, [value]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!q || q.length < 3) { setItems([]); return; }
    timer.current = setTimeout(async () => {
      try {
        const { data } = await axios.get("https://nominatim.openstreetmap.org/search", {
          params: { q, format: "json", addressdetails: 1, limit: 5 },
          headers: { Accept: "application/json" }
        });
        setItems(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch { /* ignore */ }
    }, 300);
    return () => timer.current && clearTimeout(timer.current);
  }, [q]);

  function pick(item){
    const label = item.display_name;
    onChange?.(label);
    onPick?.({ lat: parseFloat(item.lat), lon: parseFloat(item.lon), label });
    setOpen(false);
  }

  return (
    <div style={{ position: "relative" }}>
      <input className="input" placeholder="City, ZIP, address…" value={q}
             onChange={e => { setQ(e.target.value); onChange?.(e.target.value); }} />
      {open && items.length > 0 && (
        <div style={{
          position: "absolute", top: "110%", left: 0, right: 0,
          background: "white", border: "1px solid #eee", borderRadius: 12,
          boxShadow: "0 8px 20px rgba(0,0,0,.08)", zIndex: 10
        }}>
          {items.map(it => (
            <div key={it.place_id}
                 onClick={() => pick(it)}
                 style={{ padding: 10, cursor: "pointer", borderBottom: "1px solid #f3f3f3" }}>
              {it.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
