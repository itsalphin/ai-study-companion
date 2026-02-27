export default function StatsCard({ icon, label, value, tone }) {
  return (
    <article className="glass-card rounded-2xl p-4">
      <span className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-xl ${tone}`}>
        {icon}
      </span>
      <p className="text-sm muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
    </article>
  );
}
