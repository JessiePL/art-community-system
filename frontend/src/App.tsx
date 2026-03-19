import { useState } from "react";
import PageTopbar from "./components/PageTopbar";
import {
  creatorMoments,
  merchandiseCatalog,
  profileSnapshots,
} from "./data/site";
import { useCharacterCarousel } from "./hooks/useCharacterCarousel";
import AppLayout from "./layout/AppLayout";
import CreatorPage from "./pages/CreatorPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ShopPage from "./pages/ShopPage";
import type { Page, Product, ProductCategory, UserRole } from "./types/app";

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

  const {
    isCarouselPaused,
    loopCharacters,
    selectedCharacterId,
    selectedRenderIndex,
    stripRef,
    handleCharacterSelect,
    scrollGallery,
  } = useCharacterCarousel({
    page,
    onStatusChange: setMessage,
  });

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
  const snapshot = profileSnapshots[role] ?? profileSnapshots.guest;

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

  return (
    <AppLayout
      page={page}
      isLoggedIn={isLoggedIn}
      navItems={primaryNav}
      onNavigate={setPage}
      onLogin={handleLogin}
      onRegister={handleRegister}
      onLogout={handleLogout}
      topbar={
        page !== "home" ? <PageTopbar page={page} message={message} /> : undefined
      }
    >
      {page === "home" && (
        <HomePage
          isCarouselPaused={isCarouselPaused}
          loopCharacters={loopCharacters}
          selectedCharacterId={selectedCharacterId}
          selectedRenderIndex={selectedRenderIndex}
          stripRef={stripRef}
          onCharacterSelect={handleCharacterSelect}
          onScrollGallery={scrollGallery}
        />
      )}

      {page === "creator" && <CreatorPage moments={creatorMoments} />}

      {page === "shop" && (
        <ShopPage
          products={products}
          selectedCategory={selectedCategory}
          cartItems={cartItems}
          cartTotal={cartTotal}
          onCategoryChange={setSelectedCategory}
          onAddToCart={addToCart}
          onCheckout={handleCheckout}
        />
      )}

      {page === "profile" && (
        <ProfilePage role={role} snapshot={snapshot} onRoleChange={setRole} />
      )}
    </AppLayout>
  );
}
