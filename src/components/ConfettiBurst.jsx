const colors = ["#fda4af", "#93c5fd", "#86efac", "#fcd34d", "#c4b5fd", "#67e8f9"];

export default function ConfettiBurst({ show }) {
  if (!show) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 24 }).map((_, index) => {
        const left = (index * 4 + 8) % 100;
        const delay = (index % 6) * 0.09;
        const duration = 1.2 + (index % 4) * 0.24;
        const rotate = (index * 37) % 360;
        return (
          <span
            className="confetti-piece absolute top-0 h-3 w-2 rounded-sm"
            key={`${left}-${delay}`}
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              backgroundColor: colors[index % colors.length],
              transform: `rotate(${rotate}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
