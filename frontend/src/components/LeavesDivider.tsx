// src/components/LeavesDivider.tsx

export default function LeavesDivider() {
  return (
    <div className="dot-divider">
      {Array.from({ length: 28 }).map((_, i) => (
        <span key={i} className="dot"/>
      ))}
    </div>
  );
}

