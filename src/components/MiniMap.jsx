import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* Leaflet default marker fix (so icons show up in Vite) */
import L from "leaflet";
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: shadow
});

export default function MiniMap({ lat, lon }) {
  if (!lat || !lon) return null;
  return (
    <div style={{ height: 220, borderRadius: 12, overflow: "hidden", marginTop: 12 }}>
      <MapContainer center={[lat, lon]} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={[lat, lon]}>
          <Popup>Selected restaurant</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
