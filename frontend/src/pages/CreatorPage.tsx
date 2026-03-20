import "../styles/creator.css";

type CreatorReference = {
  kicker: string;
  name: string;
  image: string;
  description: string;
  detail: string;
  tags: string[];
};

type CreatorPageProps = {
  author: CreatorReference;
  studio: CreatorReference;
};

export default function CreatorPage({ author, studio }: CreatorPageProps) {
  return (
    <div className="creator-page">
      <section className="creator-feature-card glass-card">
        <div className="creator-visual">
          <img src={author.image} alt={author.name} />
        </div>
        <div className="creator-copy">
          <p className="eyebrow">{author.kicker}</p>
          <h2>{author.name}</h2>
          <p>{author.description}</p>
          <p>{author.detail}</p>
          <div className="creator-meta">
            {author.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="creator-feature-card reverse glass-card">
        <div className="creator-copy">
          <p className="eyebrow">{studio.kicker}</p>
          <h2>{studio.name}</h2>
          <p>{studio.description}</p>
          <p>{studio.detail}</p>
          <div className="creator-meta">
            {studio.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
        <div className="creator-visual logo-panel">
          <img src={studio.image} alt={studio.name} />
        </div>
      </section>
    </div>
  );
}
