export default function StatCard({ icon, value, label }) {
  return (
    <div className="card">
      <div className="statIcon">{icon}</div>
      <p className="statValue">{value}</p>
      <p className="statTitle">{label}</p>
    </div>
  );
}
