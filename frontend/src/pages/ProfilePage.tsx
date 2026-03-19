import type { UserRole } from "../types/app";

type SnapshotCard = {
  kicker: string;
  title: string;
  description: string;
};

type Snapshot = {
  title: string;
  description: string;
  cards: readonly SnapshotCard[];
};

type ProfilePageProps = {
  role: UserRole;
  snapshot: Snapshot;
  onRoleChange: (role: UserRole) => void;
};

export default function ProfilePage({
  role,
  snapshot,
  onRoleChange,
}: ProfilePageProps) {
  return (
    <div className="page-stack">
      <section className="profile-hero glass-card">
        <div>
          <p className="eyebrow">Profile</p>
          <h2>{snapshot.title}</h2>
          <p>{snapshot.description}</p>
        </div>
        <div className="role-switcher">
          {(["guest", "fan", "member", "admin"] as const).map((option) => (
            <button
              key={option}
              className={role === option ? "filter-chip active" : "filter-chip"}
              onClick={() => onRoleChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </section>
      <section className="profile-grid">
        {snapshot.cards.map((card) => (
          <article key={card.title} className="glass-card">
            <p className="card-kicker">{card.kicker}</p>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
