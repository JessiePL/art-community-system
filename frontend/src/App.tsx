import { useState } from "react";
import PageTopbar from "./components/PageTopbar";
import {
  creatorCredits,
  merchandiseCatalog,
} from "./data/site";
import { useCharacterCarousel } from "./hooks/useCharacterCarousel";
import AppLayout from "./layout/AppLayout";
import AdminPage from "./pages/AdminPage";
import CreatorPage from "./pages/CreatorPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ShopPage from "./pages/ShopPage";
import type { AuthMode, AuthUser, Page, Product, UserRole } from "./types/app";

const primaryNav: Array<{ id: "home" | "creator" | "shop"; label: string }> = [
  { id: "home", label: "Home" },
  { id: "creator", label: "Creator" },
  { id: "shop", label: "Merch" },
];

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [role, setRole] = useState<UserRole>("guest");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [products, setProducts] = useState<Product[]>(merchandiseCatalog);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState("");
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
    effectBurstKey,
    selectedCharacterId,
    selectedRenderIndex,
    stripRef,
    handleCharacterSelect,
    scrollGallery,
  } = useCharacterCarousel({
    page,
    onStatusChange: setMessage,
  });

  const cartItems = products
    .filter((product) => cart[product.id])
    .map((product) => ({
      ...product,
      quantity: cart[product.id],
      subtotal: cart[product.id] * product.price,
    }));

  const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const isLoggedIn = role !== "guest";
  const isMember = role === "member" || role === "admin";
  const topbarMessage =
    page === "creator"
      ? "Welcome in. Take a look around and enjoy the creator spotlight."
      : page === "shop"
        ? "Welcome in. Have fun browsing and pick your favorite drop."
        : page === "profile"
          ? "Welcome in. Take a look at your shopping details and profile access."
          : page === "admin"
            ? "Welcome in. Review products, orders, and creator-side controls."
      : message;

  const inferRoleFromEmail = (
    email: string,
  ): Extract<UserRole, "fan" | "member" | "admin"> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail.endsWith("@admin.acs.com") ||
      normalizedEmail === "admin@acs.com" ||
      normalizedEmail === "admin@admin.com"
    ) {
      return "admin";
    }

    if (
      normalizedEmail.endsWith("@member.acs.com") ||
      normalizedEmail.includes("+member@")
    ) {
      return "member";
    }

    return "fan";
  };

  const getDisplayName = (name: string, email: string) => {
    const trimmedName = name.trim();

    if (trimmedName) {
      return trimmedName;
    }

    return email.split("@")[0].replace(/[._-]+/g, " ");
  };

  const addToCart = (product: Product) => {
    setCart((current) => ({
      ...current,
      [product.id]: (current[product.id] ?? 0) + 1,
    }));
    setMessage(`${product.name} added to the cart queue.`);
  };

  const updateProductField = (productId: string, field: keyof Product, value: string | number) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,
              [field]: field === "price" || field === "stock" ? Number(value) : value,
            }
          : product,
      ),
    );
  };

  const restockProduct = (productId: string, amount: number, size?: "S" | "M" | "L" | "XL") => {
    setProducts((current) =>
      current.map((product) => {
        if (product.id !== productId) {
          return product;
        }

        if (size) {
          const nextSizeStock = {
            ...product.sizeStock,
            [size]: Math.max((product.sizeStock?.[size] ?? 0) + amount, 0),
          };

          const totalStock = Object.values(nextSizeStock).reduce((sum, count) => sum + (count ?? 0), 0);

          return {
            ...product,
            sizeStock: nextSizeStock,
            stock: totalStock,
          };
        }

        return {
          ...product,
          stock: Math.max(product.stock + amount, 0),
        };
      }),
    );
  };

  const updateProductImage = (productId: string, imageUrl: string) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,
              image: imageUrl,
            }
          : product,
      ),
    );
  };

  const updateProductSizeStock = (productId: string, size: "S" | "M" | "L" | "XL", stock: number) => {
    setProducts((current) =>
      current.map((product) => {
        if (product.id !== productId) {
          return product;
        }

        const nextSizeStock = {
          ...product.sizeStock,
          [size]: Math.max(stock, 0),
        };

        return {
          ...product,
          sizeStock: nextSizeStock,
          stock: Object.values(nextSizeStock).reduce((sum, count) => sum + (count ?? 0), 0),
        };
      }),
    );
  };

  const increaseCartItem = (product: Product) => {
    setCart((current) => ({
      ...current,
      [product.id]: (current[product.id] ?? 0) + 1,
    }));
    setMessage(`${product.name} quantity increased in your cart.`);
  };

  const decreaseCartItem = (product: Product) => {
    setCart((current) => {
      const nextQuantity = Math.max((current[product.id] ?? 0) - 1, 0);

      if (nextQuantity === 0) {
        const { [product.id]: _removed, ...remaining } = current;
        return remaining;
      }

      return {
        ...current,
        [product.id]: nextQuantity,
      };
    });

    setMessage(`${product.name} quantity reduced in your cart.`);
  };

  const removeCartItem = (product: Product) => {
    setCart((current) => {
      const { [product.id]: _removed, ...remaining } = current;
      return remaining;
    });
    setMessage(`${product.name} removed from your cart.`);
  };

  const handleBuyNow = (product: Product) => {
    setCart((current) => ({
      ...current,
      [product.id]: Math.max(current[product.id] ?? 0, 1),
    }));

    if (!isLoggedIn) {
      setMessage(`${product.name} is ready, but sign in first before purchase can continue.`);
      return;
    }

    if (!isMember) {
      setMessage(`${product.name} is in your cart, but only members can complete checkout.`);
      return;
    }

    setMessage(`${product.name} moved straight into the member checkout flow.`);
  };

  const handleCartCheckout = () => {
    if (cartItems.length === 0) {
      setMessage("Your cart is empty. Add merchandise before checkout.");
      return;
    }

    if (!isLoggedIn) {
      setMessage("Your cart is ready, but sign in first before purchase can continue.");
      return;
    }

    if (!isMember) {
      setMessage("Your cart is saved, but only members can complete checkout.");
      return;
    }

    setMessage(`Checkout is ready for ${cartItems.length} cart item(s).`);
  };

  const openAuthModal = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthError("");
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthError("");
  };

  const handleAuthSubmit = (
    mode: AuthMode,
    draft: { name: string; email: string; password: string },
  ) => {
    const email = draft.email.trim().toLowerCase();
    const password = draft.password.trim();
    const name = getDisplayName(draft.name, email);
    const isDemoFanAccount = email === "test@test.com" && password === "123456";
    const isDemoAdminAccount = email === "admin@admin.com" && password === "123456";

    if (!email || !password) {
      setAuthError("Email and password are required.");
      return;
    }

    if (mode === "login" && !isDemoFanAccount && !isDemoAdminAccount) {
      setAuthError("Use test@test.com or admin@admin.com with password 123456 to log in.");
      return;
    }

    if (mode === "register" && !draft.name.trim()) {
      setAuthError("Name is required for registration.");
      return;
    }

    const nextRole = isDemoAdminAccount
      ? "admin"
      : isDemoFanAccount
        ? "fan"
        : inferRoleFromEmail(email);

    setUser({
      name,
      email,
      role: nextRole,
    });
    setRole(nextRole);
    setAuthError("");
    setShowAuthModal(false);
    setPage(nextRole === "admin" ? "admin" : "profile");

    if (nextRole === "fan") {
      setMessage("Signed in as a fan. Public browsing plus profile access is available.");
      return;
    }

    if (nextRole === "member") {
      setMessage("Signed in as a member. Member-only checkout is now available.");
      return;
    }

    setMessage("Signed in as an admin. Management-level access is now available.");
  };

  const handleLogout = () => {
    setRole("guest");
    setUser(null);
    setPage("home");
    setShowAuthModal(false);
    setAuthError("");
    setMessage("Signed out. Public browsing mode restored.");
  };

  return (
    <AppLayout
      page={page}
      isLoggedIn={isLoggedIn}
      role={role}
      navItems={primaryNav}
      onNavigate={setPage}
      authMode={authMode}
      authError={authError}
      onOpenAuth={openAuthModal}
      onCloseAuth={closeAuthModal}
      onSubmitAuth={handleAuthSubmit}
      onSwitchAuthMode={setAuthMode}
      onLogout={handleLogout}
      showAuthModal={showAuthModal}
      topbar={
        page !== "home" ? <PageTopbar page={page} message={topbarMessage} /> : undefined
      }
    >
      {page === "home" && (
        <HomePage
          isCarouselPaused={isCarouselPaused}
          loopCharacters={loopCharacters}
          effectBurstKey={effectBurstKey}
          selectedCharacterId={selectedCharacterId}
          selectedRenderIndex={selectedRenderIndex}
          stripRef={stripRef}
          onCharacterSelect={handleCharacterSelect}
          onScrollGallery={scrollGallery}
        />
      )}

      {page === "creator" && (
        <CreatorPage
          author={creatorCredits.author}
          studio={creatorCredits.studio}
        />
      )}

      {page === "shop" && (
        <ShopPage
          products={products}
          isAdmin={role === "admin"}
          isLoggedIn={isLoggedIn}
          cartItems={cartItems}
          cartTotal={cartTotal}
          onAddToCart={addToCart}
          onIncreaseCartItem={increaseCartItem}
          onDecreaseCartItem={decreaseCartItem}
          onRemoveCartItem={removeCartItem}
          onBuyNow={handleBuyNow}
          onCartCheckout={handleCartCheckout}
          onUpdateProductField={updateProductField}
          onRestockProduct={restockProduct}
          onUpdateProductImage={updateProductImage}
          onUpdateProductSizeStock={updateProductSizeStock}
        />
      )}

      {page === "profile" && (
        <ProfilePage
          user={user}
          cartItems={cartItems}
          onIncreaseCartItem={increaseCartItem}
          onDecreaseCartItem={decreaseCartItem}
          onRemoveCartItem={removeCartItem}
          onCartCheckout={handleCartCheckout}
        />
      )}

      {page === "admin" && <AdminPage />}
    </AppLayout>
  );
}
