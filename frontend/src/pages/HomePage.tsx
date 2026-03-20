import "../styles/home.css";
import type { RefObject } from "react";
import type { CharacterProfile } from "../types/app";

type CharacterEffect =
  | "music"
  | "water"
  | "wind-ripple"
  | "snow"
  | "sakura"
  | "hearts"
  | "butterfly";

type HomePageProps = {
  isCarouselPaused: boolean;
  loopCharacters: CharacterProfile[];
  effectBurstKey: number;
  selectedCharacterId: string;
  selectedRenderIndex: number | null;
  stripRef: RefObject<HTMLDivElement | null>;
  onCharacterSelect: (characterId: string, renderIndex: number) => void;
  onScrollGallery: (direction: "left" | "right") => void;
};

export default function HomePage({
  isCarouselPaused,
  loopCharacters,
  effectBurstKey,
  selectedCharacterId,
  selectedRenderIndex,
  stripRef,
  onCharacterSelect,
  onScrollGallery,
}: HomePageProps) {
  const selectedEffect = getCharacterEffect(selectedCharacterId);

  return (
    <div className="home-stage">
      <div className="home-backdrop" />

      {isCarouselPaused && effectBurstKey > 0 && selectedEffect && (
        <div
          key={`${selectedEffect}-${effectBurstKey}`}
          className={`effect-burst effect-burst-${selectedEffect}`}
          aria-hidden="true"
        >
          {renderEffectBurst(selectedEffect)}
        </div>
      )}

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

function getCharacterEffect(characterId: string): CharacterEffect | null {
  switch (characterId) {
    case "tengen-uzui":
      return "music";
    case "giyu-tomioka":
      return "water";
    case "sanemi-shinazugawa":
      return "wind-ripple";
    case "muichiro-tokito":
      return "snow";
    case "mitsuri-kanroji":
      return "hearts";
    case "kanae-kocho":
    case "kanao-tsuyuri":
    case "shinobu-kocho":
      return "butterfly";
    default:
      return null;
  }
}

function renderEffectBurst(effect: CharacterEffect) {
  switch (effect) {
    case "music":
      return renderTextPieces(
        "music-note effect-float-piece",
        [
          ["♪", "8%", "24%", "2rem", "0ms"],
          ["♫", "16%", "14%", "2.6rem", "80ms"],
          ["♩", "24%", "66%", "1.9rem", "150ms"],
          ["♬", "34%", "22%", "3rem", "110ms"],
          ["♪", "43%", "72%", "2rem", "200ms"],
          ["♬", "56%", "18%", "2.4rem", "120ms"],
          ["♫", "68%", "46%", "3.1rem", "250ms"],
          ["♩", "78%", "12%", "1.8rem", "170ms"],
          ["♪", "86%", "62%", "2.7rem", "320ms"],
        ],
      );
    case "water":
      return renderRipplePieces([
        ["16%", "22%", "132px", "0ms"],
        ["40%", "50%", "184px", "90ms"],
        ["64%", "20%", "152px", "150ms"],
        ["72%", "62%", "210px", "220ms"],
        ["24%", "70%", "170px", "280ms"],
      ], "effect-ripple-piece");
    case "wind-ripple":
      return renderRipplePieces([
        ["16%", "22%", "132px", "0ms"],
        ["40%", "50%", "184px", "90ms"],
        ["64%", "20%", "152px", "150ms"],
        ["72%", "62%", "210px", "220ms"],
        ["24%", "70%", "170px", "280ms"],
      ], "effect-ripple-piece effect-ripple-piece-green");
    case "snow":
      return renderTextPieces(
        "effect-snow effect-float-piece",
        [
          ["❄", "8%", "12%", "3.1rem", "0ms"],
          ["❅", "18%", "32%", "3.8rem", "110ms"],
          ["❄", "30%", "16%", "2.8rem", "220ms"],
          ["❅", "44%", "54%", "4rem", "60ms"],
          ["❄", "58%", "22%", "3rem", "150ms"],
          ["❅", "70%", "14%", "3.5rem", "260ms"],
          ["❄", "82%", "46%", "3.2rem", "200ms"],
          ["❅", "88%", "20%", "3.9rem", "320ms"],
        ],
      );
    case "hearts":
      return renderTextPieces(
        "effect-heart effect-float-piece",
        [
          ["♡", "8%", "18%", "2.9rem", "0ms"],
          ["♥", "16%", "66%", "2.6rem", "120ms"],
          ["♡", "26%", "14%", "2.3rem", "60ms"],
          ["♥", "38%", "72%", "3.2rem", "220ms"],
          ["♡", "50%", "24%", "2.7rem", "100ms"],
          ["♥", "60%", "64%", "2.4rem", "190ms"],
          ["♡", "72%", "18%", "3rem", "260ms"],
          ["♥", "82%", "56%", "2.8rem", "320ms"],
          ["♡", "90%", "22%", "2.5rem", "380ms"],
        ],
      );
    case "butterfly":
      return renderTextPieces(
        "effect-butterfly effect-float-piece",
        [
          ["🦋", "8%", "18%", "2rem", "0ms"],
          ["🦋", "18%", "64%", "2.4rem", "180ms"],
          ["🦋", "34%", "26%", "1.8rem", "90ms"],
          ["🦋", "48%", "70%", "2.8rem", "260ms"],
          ["🦋", "62%", "22%", "2.2rem", "130ms"],
          ["🦋", "76%", "58%", "1.9rem", "220ms"],
          ["🦋", "88%", "14%", "2.5rem", "320ms"],
        ],
      );
  }
}

function renderTextPieces(
  className: string,
  pieces: Array<[string, string, string, string, string]>,
) {
  return pieces.map(([symbol, left, top, fontSize, animationDelay], index) => (
    <span
      key={`${symbol}-${left}-${top}-${index}`}
      className={className}
      style={{ left, top, fontSize, animationDelay }}
    >
      {symbol}
    </span>
  ));
}

function renderRipplePieces(
  pieces: Array<[string, string, string, string]>,
  className: string,
) {
  return pieces.map(([left, top, size, animationDelay], index) => (
    <span
      key={`${left}-${top}-${size}-${index}`}
      className={className}
      style={{ left, top, width: size, height: size, animationDelay }}
    />
  ));
}
