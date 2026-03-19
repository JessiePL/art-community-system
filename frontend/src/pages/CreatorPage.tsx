type CreatorMoment = {
  year: string;
  title: string;
  description: string;
};

type CreatorPageProps = {
  moments: CreatorMoment[];
};

export default function CreatorPage({ moments }: CreatorPageProps) {
  return (
    <div className="page-stack">
      <section className="creator-hero glass-card">
        <div>
          <p className="eyebrow">Creator</p>
          <h2>Artist identity, process notes, and platform-ready credibility.</h2>
          <p>
            The creator page turns the project into a personal brand space:
            philosophy, portfolio direction, social channels, and production notes
            all in one place.
          </p>
        </div>
        <div className="social-row">
          <span>Instagram</span>
          <span>X / Twitter</span>
          <span>Behance</span>
          <span>Email</span>
        </div>
      </section>
      <section className="timeline">
        {moments.map((moment) => (
          <article key={moment.year} className="timeline-item">
            <p className="muted-label">{moment.year}</p>
            <h3>{moment.title}</h3>
            <p>{moment.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
