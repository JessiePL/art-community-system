import { useEffect, useState } from "react";
import PaymentModal from "./components/PaymentModal";
import PageTopbar from "./components/PageTopbar";
import AppContent from "./components/AppContent";
import { useAuthState } from "./hooks/useAuthState";
import { useCharacterCarousel } from "./hooks/useCharacterCarousel";
import { useMerchState } from "./hooks/useMerchState";
import { useOrderHistory } from "./hooks/useOrderHistory";
import { uploadProductImage } from "./services/merch";
import AppLayout from "./layout/AppLayout";
import type { Page, Product, ShirtSize } from "./types/app";

type CheckoutItem = Product & {
  quantity: number;
  subtotal: number;
};

const primaryNav: Array<{ id: "home" | "creator" | "shop"; label: string }> = [
  { id: "home", label: "Home" },
  { id: "creator", label: "Creator" },
  { id: "shop", label: "Merch" },
];

const pageMessages: Record<Exclude<Page, "home">, string> = {
  creator: "Welcome in. Take a look around and enjoy the creator spotlight.",
  shop: "Welcome in. Have fun browsing and pick your favorite drop.",
  profile: "Welcome in. Take a look at your shopping details and profile access.",
  admin: "Welcome in. Review products, orders, and creator-side controls.",
};

type PaymentState = {
  title: string;
  amount: number;
  detail: string;
  items: CheckoutItem[];
  source: "buy-now" | "cart";
} | null;

const pathToPage = (pathname: string): Page => {
  switch (pathname) {
    case "/":
    case "/home":
      return "home";
    case "/creator":
      return "creator";
    case "/shop":
    case "/merch":
      return "shop";
    case "/profile":
      return "profile";
    case "/admin":
      return "admin";
    default:
      return "home";
  }
};

const pageToPath = (page: Page) => {
  switch (page) {
    case "home":
      return "/home";
    case "creator":
      return "/creator";
    case "shop":
      return "/shop";
    case "profile":
      return "/profile";
    case "admin":
      return "/admin";
  }
};

export default function App() {
  const [page, setPage] = useState<Page>(() => pathToPage(window.location.pathname));
  const [successToast, setSuccessToast] = useState("");
  const [message, setMessage] = useState(
    "A visual-first anime art community MVP centered on a cinematic character gallery.",
  );
  const [paymentState, setPaymentState] = useState<PaymentState>(null);

  const auth = useAuthState();
  const merch = useMerchState(setMessage, auth.token);
  const orderHistory = useOrderHistory(auth.token, auth.role);
  const carousel = useCharacterCarousel({
    page,
    onStatusChange: setMessage,
  });

  const addresses = auth.user?.addresses ?? [];
  const topbarMessage = page === "home" ? message : pageMessages[page];

  const navigateToPage = (nextPage: Page, historyMode: "push" | "replace" = "push") => {
    setPage(nextPage);
    const nextPath = pageToPath(nextPage);

    if (window.location.pathname === nextPath) {
      return;
    }

    if (historyMode === "replace") {
      window.history.replaceState({}, "", nextPath);
      return;
    }

    window.history.pushState({}, "", nextPath);
  };

  useEffect(() => {
    const normalizedPage = pathToPage(window.location.pathname);
    const normalizedPath = pageToPath(normalizedPage);

    if (window.location.pathname !== normalizedPath) {
      window.history.replaceState({}, "", normalizedPath);
    }

    const handlePopState = () => {
      setPage(pathToPage(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!successToast) {
      return;
    }

    const timer = window.setTimeout(() => setSuccessToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [successToast]);

  const openLoginFlow = () => {
    auth.openAuthModal("login");
    setMessage("Please log in first before adding items or continuing to payment.");
  };

  const handleAddToCart = (product: Product, selectedSize?: ShirtSize) => {
    if (!auth.isLoggedIn) {
      openLoginFlow();
      return false;
    }

    merch.addToCart(product, selectedSize);
    return true;
  };

  const handleBuyNow = (product: Product, selectedSize?: ShirtSize) => {
    const checkoutItem: CheckoutItem = {
      ...product,
      selectedSize,
      quantity: 1,
      subtotal: product.price,
    };

    setPaymentState({
      title: `Buy ${product.name}${selectedSize ? ` (${selectedSize})` : ""}`,
      amount: product.price,
      detail: "Choose a shipping address, then scan this QR code for the single product you selected.",
      items: [checkoutItem],
      source: "buy-now",
    });
    setMessage(`${product.name}${selectedSize ? ` (${selectedSize})` : ""} is ready for direct payment.`);
  };

  const handleCartCheckout = () => {
    if (merch.cartItems.length === 0) {
      setMessage("Your cart is empty. Add merchandise before checkout.");
      return;
    }

    setPaymentState({
      title: "Pay for Cart",
      amount: merch.cartTotal,
      detail: "Choose a shipping address, then scan this QR code to pay for every item currently in your cart.",
      items: merch.cartItems,
      source: "cart",
    });
    setMessage(`Cart payment is ready for ${merch.cartItems.length} item(s).`);
  };

  const handlePaymentSuccess = async (selectedAddressId: string | null) => {
    if (!paymentState) {
      return;
    }

    const selectedAddress =
      addresses.find((address) => address.id === selectedAddressId) ??
      addresses.find((address) => address.isPrimary) ??
      null;

    const checkoutResponse = await orderHistory.checkoutItems(paymentState.items, selectedAddress);
    merch.completeCheckout(paymentState.items, checkoutResponse.products);
    navigateToPage("profile");

    const orderCount = checkoutResponse.orders.length;
    const destinationLabel = selectedAddress ? ` to ${selectedAddress.label}` : "";
    const sourceLabel = paymentState.source === "cart" ? "cart" : "direct";

    setMessage(
      `${orderCount} paid order${orderCount > 1 ? "s were" : " was"} created from ${sourceLabel} checkout${destinationLabel}.`,
    );
  };

  const handleSaveProduct = async (productId: string, draft: import("./hooks/useMerchState").ProductEditorDraft) => {
    const product = await merch.saveProduct(productId, draft);
    setSuccessToast(`${product.name} saved successfully.`);
    return product;
  };

  const handleUploadProductImage = async (file: File) => {
    if (!auth.token) {
      throw new Error("Admin login is required before uploading a product image.");
    }

    return uploadProductImage(file, auth.token);
  };

  return (
    <>
      <AppLayout
        page={page}
        isLoggedIn={auth.isLoggedIn}
        role={auth.role}
        navItems={primaryNav}
        onNavigate={navigateToPage}
        authMode={auth.authMode}
        authError={auth.authError}
        onOpenAuth={auth.openAuthModal}
        onCloseAuth={auth.closeAuthModal}
        onSubmitAuth={(mode, draft) => auth.handleAuthSubmit(mode, draft, navigateToPage, setMessage)}
        onSwitchAuthMode={auth.setAuthMode}
        onLogout={() => auth.handleLogout(navigateToPage, setMessage)}
        showAuthModal={auth.showAuthModal}
        topbar={page !== "home" ? <PageTopbar page={page} message={topbarMessage} /> : undefined}
        toastMessage={successToast}
      >
        <AppContent
          page={page}
          role={auth.role}
          isLoggedIn={auth.isLoggedIn}
          carousel={carousel}
          user={auth.user}
          addresses={addresses}
          orders={orderHistory.orders}
          adminOrders={orderHistory.adminOrders}
          products={merch.products}
          cartItems={merch.cartItems}
          cartTotal={merch.cartTotal}
          onAddToCart={handleAddToCart}
          onIncreaseCartItem={merch.increaseCartItem}
          onDecreaseCartItem={merch.decreaseCartItem}
          onRemoveCartItem={merch.removeCartItem}
          onBuyNow={handleBuyNow}
          onCartCheckout={handleCartCheckout}
          onRequireLogin={openLoginFlow}
          onSaveAddress={auth.saveAddress}
          onRemoveAddress={auth.removeAddress}
          onSetPrimaryAddress={auth.setPrimaryAddress}
          onRequestReturn={orderHistory.requestReturn}
          onConfirmReceipt={orderHistory.confirmReceipt}
          onSaveProfile={auth.updateProfile}
          onChangePassword={auth.changePassword}
          onSaveProduct={handleSaveProduct}
          onUploadProductImage={handleUploadProductImage}
          onShipOrder={orderHistory.shipOrder}
          onRefundOrder={orderHistory.refundOrder}
        />
      </AppLayout>

      <PaymentModal
        isOpen={paymentState !== null}
        title={paymentState?.title ?? ""}
        amount={paymentState?.amount ?? 0}
        detail={paymentState?.detail ?? ""}
        addresses={addresses}
        onConfirmPayment={handlePaymentSuccess}
        onClose={() => setPaymentState(null)}
      />
    </>
  );
}
