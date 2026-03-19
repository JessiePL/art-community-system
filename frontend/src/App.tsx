import { useEffect, useRef, useState } from "react";
import {
  creatorMoments,
  merchandiseCatalog,
  profileSnapshots,
} from "./data/site";

type Page = "home" | "creator" | "shop" | "profile";
type UserRole = "guest" | "fan" | "member" | "admin";
type ProductCategory = "T-shirt" | "Mug" | "Canvas Bag";

type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  image: string;
  note: string;
};

type CharacterProfile = {
  id: string;
  order: number;
  name: string;
  subtitle: string;
  affiliation: string;
  image: string;
  summary: string;
  abilities: string[];
  spotlight: string;
};

const primaryNav: Array<{ id: "home" | "creator" | "shop"; label: string }> = [
  { id: "home", label: "Home" },
  { id: "creator", label: "Creator" },
  { id: "shop", label: "Merch" },
];

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [role, setRole] = useState<UserRole>("guest");
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | "All"
  >("All");
  const [cart, setCart] = useState<Record<string, number>>({
    "merch-hashira-shirt": 1,
    "merch-nezuko-mug": 1,
  });
  const [message, setMessage] = useState(
    "A visual-first anime art community MVP centered on a cinematic character gallery.",
  );
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [selectedRenderIndex, setSelectedRenderIndex] = useState<number | null>(null);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const manualScrollTimeoutRef = useRef<number | null>(null);
  const isManualScrollingRef = useRef(false);

  const products =
    selectedCategory === "All"
      ? merchandiseCatalog
      : merchandiseCatalog.filter(
          (product) => product.category === selectedCategory,
        );

  const cartItems = merchandiseCatalog
    .filter((product) => cart[product.id])
    .map((product) => ({
      ...product,
      quantity: cart[product.id],
      subtotal: cart[product.id] * product.price,
    }));

  const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const isLoggedIn = role !== "guest";
  const isMember = role === "member" || role === "admin";
  const loopCharacters =
    characters.length > 0 ? [...characters, ...characters, ...characters] : [];

  useEffect(() => {
    let isMounted = true;

    fetch("/data/character-gallery.json")
      .then((response) => response.json())
      .then((data: CharacterProfile[]) => {
        if (!isMounted) {
          return;
        }

        setCharacters(data);
        setSelectedCharacterId(data[0]?.id ?? "");
        setSelectedRenderIndex(data.length > 0 ? data.length : 0);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setMessage("Character gallery data could not be loaded.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const strip = stripRef.current;

    if (!strip || characters.length === 0) {
      return;
    }

    const loopWidth = strip.scrollWidth / 3;
    strip.scrollLeft = loopWidth;
  }, [characters.length]);

  useEffect(() => {
    if (page !== "home" || isCarouselPaused || characters.length === 0) {
      return;
    }

    let frameId = 0;
    let lastTimestamp = 0;

    const animate = (timestamp: number) => {
      const strip = stripRef.current;

      if (!strip) {
        return;
      }

      if (isManualScrollingRef.current) {
        frameId = window.requestAnimationFrame(animate);
        return;
      }

      if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
      }

      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      const loopWidth = strip.scrollWidth / 3;
      const speed = 0.055;

      strip.scrollLeft += delta * speed;

      if (strip.scrollLeft >= loopWidth * 2) {
        strip.scrollLeft -= loopWidth;
      }

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, [characters, isCarouselPaused, page]);

  useEffect(() => {
    if (
      !isCarouselPaused ||
      !selectedCharacterId ||
      selectedRenderIndex === null ||
      !stripRef.current
    ) {
      return;
    }

    const scrollToCurrent = () => {
      const strip = stripRef.current;
      const currentCard = strip?.querySelector<HTMLElement>(
        `[data-render-index="${selectedRenderIndex}"]`,
      );

      if (!strip || !currentCard) {
        return;
      }

      const leftInset = 36;
      const targetLeft = currentCard.offsetLeft - leftInset;

      strip.scrollTo({
        left: Math.max(targetLeft, 0),
        behavior: "smooth",
      });
    };

    scrollToCurrent();
    const firstFrame = window.requestAnimationFrame(scrollToCurrent);
    const secondFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToCurrent);
    });
    const timeout = window.setTimeout(scrollToCurrent, 220);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(timeout);
    };
  }, [isCarouselPaused, selectedCharacterId, selectedRenderIndex]);

  const addToCart = (product: Product) => {
    setCart((current) => ({
      ...current,
      [product.id]: (current[product.id] ?? 0) + 1,
    }));
    setMessage(`${product.name} added to the cart queue.`);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      setMessage("Sign in first so your member status can be checked.");
      return;
    }

    if (!isMember) {
      setMessage("Only members can place merchandise orders in this MVP.");
      return;
    }

    setMessage(
      "Checkout rule passed: member order accepted. Backend order flow can connect here next.",
    );
  };

  const handleLogin = () => {
    setRole("fan");
    setMessage("Signed in demo user. Profile access is now available.");
  };

  const handleRegister = () => {
    setRole("fan");
    setMessage("Registration demo complete. Your profile is now available.");
  };

  const handleLogout = () => {
    setRole("guest");
    setPage("home");
    setMessage("Signed out. Public browsing mode restored.");
  };

  const handleCharacterSelect = (characterId: string, renderIndex: number) => {
    if (
      selectedCharacterId === characterId &&
      selectedRenderIndex === renderIndex &&
      isCarouselPaused
    ) {
      setIsCarouselPaused(false);
      setMessage("Character card collapsed. Carousel motion resumed.");
      return;
    }

    setSelectedCharacterId(characterId);
    setSelectedRenderIndex(renderIndex);
    setIsCarouselPaused(true);
    setMessage("Character card expanded. Carousel motion paused.");
  };

  const scrollGallery = (direction: "left" | "right") => {
    const strip = stripRef.current;

    if (!strip) {
      return;
    }

    const distance = Math.max(strip.clientWidth * 0.42, 260);
    const loopWidth = strip.scrollWidth / 3;
    let baseLeft = strip.scrollLeft;

    // Keep manual navigation inside the middle copy so smooth scrolling
    // never chooses the opposite direction across the seam.
    if (direction === "right" && baseLeft >= loopWidth * 2 - distance) {
      baseLeft -= loopWidth;
      strip.scrollLeft = baseLeft;
    }

    if (direction === "left" && baseLeft <= loopWidth + distance) {
      baseLeft += loopWidth;
      strip.scrollLeft = baseLeft;
    }

    let left = direction === "right" ? baseLeft + distance : baseLeft - distance;

    while (left >= loopWidth * 2) {
      left -= loopWidth;
    }

    while (left < loopWidth) {
      left += loopWidth;
    }

    isManualScrollingRef.current = true;

    if (manualScrollTimeoutRef.current !== null) {
      window.clearTimeout(manualScrollTimeoutRef.current);
    }

    strip.scrollTo({
      left,
      behavior: "smooth",
    });

    manualScrollTimeoutRef.current = window.setTimeout(() => {
      isManualScrollingRef.current = false;
      manualScrollTimeoutRef.current = null;
    }, 420);
  };

  useEffect(() => {
    return () => {
      if (manualScrollTimeoutRef.current !== null) {
        window.clearTimeout(manualScrollTimeoutRef.current);
      }
    };
  }, []);

  const renderHome = () => (
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
          onClick={() => scrollGallery("left")}
        />
        <button
          className="gallery-side-button gallery-side-button-right"
          aria-label="Scroll right"
          onClick={() => scrollGallery("right")}
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
                onClick={() => handleCharacterSelect(character.id, index)}
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

  const renderCreator = () => (
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
        {creatorMoments.map((moment) => (
          <article key={moment.year} className="timeline-item">
            <p className="muted-label">{moment.year}</p>
            <h3>{moment.title}</h3>
            <p>{moment.description}</p>
          </article>
        ))}
      </section>
    </div>
  );

  const renderShop = () => (
    <div className="page-stack">
      <section className="shop-toolbar glass-card">
        <div>
          <p className="eyebrow">Merch Shop</p>
          <h2>Only three categories, just like the architecture requires.</h2>
        </div>
        <div className="filter-row">
          {(["All", "T-shirt", "Mug", "Canvas Bag"] as const).map((category) => (
            <button
              key={category}
              className={
                selectedCategory === category ? "filter-chip active" : "filter-chip"
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>
      <section className="card-grid">
        {products.map((product) => (
          <article key={product.id} className="glass-card product-card">
            <img src={product.image} alt={product.name} />
            <div className="product-copy">
              <p className="muted-label">{product.category}</p>
              <h3>{product.name}</h3>
              <p>{product.note}</p>
            </div>
            <div className="product-footer">
              <span>${product.price}</span>
              <span>Stock {product.stock}</span>
            </div>
            <button className="primary-button" onClick={() => addToCart(product)}>
              Add to Cart
            </button>
          </article>
        ))}
      </section>

      <section className="checkout-panel glass-card">
        <div>
          <p className="eyebrow">Checkout Rule</p>
          <h2>Only members can place an order.</h2>
          <p>
            This mirrors the architecture note: browsing is public, but the final
            order action must be member-gated.
          </p>
        </div>
        <div className="cart-summary">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-line">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>${item.subtotal}</span>
            </div>
          ))}
          <div className="cart-line total">
            <span>Total</span>
            <span>${cartTotal}</span>
          </div>
          <button className="primary-button" onClick={handleCheckout}>
            Try Checkout
          </button>
        </div>
      </section>
    </div>
  );

  const renderProfile = () => {
    const snapshot = profileSnapshots[role] ?? profileSnapshots.guest;

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
                onClick={() => setRole(option)}
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
  };

  return (
    <div className="app-shell">
      <aside className="sidebar glass-card">
        <div className="brand-mark">
          <p className="eyebrow">ACS</p>
          <h2>Demon Slayer Art Community</h2>
          <p className="muted-copy">
            Visual showcase, creator storytelling, and merch in one focused system.
          </p>
        </div>

        <nav className="nav-stack">
          {primaryNav.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? "nav-link active" : "nav-link"}
              onClick={() => setPage(item.id)}
            >
              {item.label}
            </button>
          ))}

          {isLoggedIn ? (
            <>
              <button
                className={page === "profile" ? "nav-link active" : "nav-link"}
                onClick={() => setPage("profile")}
              >
                Profile
              </button>
              <button className="nav-link auth-link" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="nav-link auth-link" onClick={handleLogin}>
                Login
              </button>
              <button className="nav-link auth-link" onClick={handleRegister}>
                Register
              </button>
            </>
          )}
        </nav>
      </aside>

      <main className={page === "home" ? "main-panel home-panel" : "main-panel"}>
        {page !== "home" && (
          <header className="topbar glass-card">
            <div>
              <p className="eyebrow">ART-COMMUNITY</p>
              <h1>{getPageTitle(page)}</h1>
            </div>
            <p className="topbar-message">{message}</p>
          </header>
        )}

        {page === "home" && renderHome()}
        {page === "creator" && renderCreator()}
        {page === "shop" && renderShop()}
        {page === "profile" && renderProfile()}
      </main>
    </div>
  );
}

function getPageTitle(page: Exclude<Page, "home">) {
  switch (page) {
    case "creator":
      return "Creator Story";
    case "shop":
      return "Merch Shop";
    case "profile":
      return "Profile & Access";
  }
}
