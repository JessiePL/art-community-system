import type { RefObject } from "react";
import type { CharacterProfile } from "../types/app";

type HomePageProps = {
  isCarouselPaused: boolean;
  loopCharacters: CharacterProfile[];
  selectedCharacterId: string;
  selectedRenderIndex: number | null;
  stripRef: RefObject<HTMLDivElement | null>;
  onCharacterSelect: (characterId: string, renderIndex: number) => void;
  onScrollGallery: (direction: "left" | "right") => void;
};

export default function HomePage({
  isCarouselPaused,
  loopCharacters,
  selectedCharacterId,
  selectedRenderIndex,
  stripRef,
  onCharacterSelect,
  onScrollGallery,
}: HomePageProps) {
  return (
    <div className="home-stage">
      <div className="home-backdrop" />

      <section className="glass-card home-intro">
        <div className="intro-copy">
          <p className="eyebrow">ART-COMMUNITY</p>
          <h1>Demon Slayer</h1>
          <p className="hero-text">
            The homepage is now built from two visual zones: a cinematic intro on
            top and a horizontal character gallery below. Click any character to
            stop the motion and open their profile.
          </p>
        </div>
      </section>

      <section className="glass-card gallery-stage">
        <button
          className="gallery-side-button gallery-side-button-left"
          aria-label="Scroll left"
          onClick={() => onScrollGallery("left")}
        />
        <button
          className="gallery-side-button gallery-side-button-right"
          aria-label="Scroll right"
          onClick={() => onScrollGallery("right")}
        />

        <div className="carousel-shell">
          <div
            className={
              isCarouselPaused ? "character-strip focus-mode" : "character-strip"
            }
            ref={stripRef}
          >
            {loopCharacters.map((character, index) => (
              <button
                key={`${character.id}-${index}`}
                type="button"
                data-character-id={character.id}
                data-render-index={index}
                className={
                  isCarouselPaused &&
                  selectedRenderIndex === index &&
                  character.id === selectedCharacterId
                    ? "character-tile active"
                    : "character-tile"
                }
                onClick={() => onCharacterSelect(character.id, index)}
              >
                <span className="tile-media">
                  <img src={character.image} alt={character.name} />
                </span>
                {isCarouselPaused &&
                selectedRenderIndex === index &&
                character.id === selectedCharacterId ? (
                  <span className="tile-expanded">
                    <span
                      className="tile-detail-card"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span className="tile-copy expanded-copy">
                        <strong>{character.name}</strong>
                        <span className="tile-credit">@米花糖挂嘴边</span>
                        <em>{character.subtitle}</em>
                      </span>
                      <span className="tile-detail-text">
                        <span>{character.summary}</span>
                        <span className="tile-spotlight">{character.spotlight}</span>
                      </span>
                      <span className="tag-row tile-tags">
                        {character.abilities.map((ability) => (
                          <span key={ability} className="tag">
                            {ability}
                          </span>
                        ))}
                      </span>
                    </span>
                  </span>
                ) : (
                  <span className="tile-copy">
                    <strong>{character.name}</strong>
                    <span className="tile-credit">@米花糖挂嘴边</span>
                    <em>{character.subtitle}</em>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
