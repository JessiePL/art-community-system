import type { RefObject } from "react";
import { creatorCredits } from "../data/site";
import HomePage from "../pages/HomePage";
import CreatorPage from "../pages/CreatorPage";
import ShopPage from "../pages/ShopPage";
import ProfilePage from "../pages/ProfilePage";
import AdminPage from "../pages/AdminPage";
import type { AddressRecord, AdminOrderRecord, AuthUser, CharacterProfile, OrderRecord, Page, Product, ShirtSize, UserRole } from "../types/app";
import type { ProductEditorDraft } from "../hooks/useMerchState";

type CarouselProps = {
  isCarouselPaused: boolean;
  loopCharacters: CharacterProfile[];
  effectBurstKey: number;
  selectedCharacterId: string;
  selectedRenderIndex: number | null;
  stripRef: RefObject<HTMLDivElement | null>;
  handleCharacterSelect: (characterId: string, renderIndex: number) => void;
  scrollGallery: (direction: "left" | "right") => void;
};

type CartItem = Product & {
  quantity: number;
  subtotal: number;
};

type AppContentProps = {
  page: Page;
  role: UserRole;
  isLoggedIn: boolean;
  carousel: CarouselProps;
  user: AuthUser | null;
  addresses: AddressRecord[];
  orders: OrderRecord[];
  adminOrders: AdminOrderRecord[];
  products: Product[];
  cartItems: CartItem[];
  cartTotal: number;
  onAddToCart: (product: Product, selectedSize?: ShirtSize) => boolean;
  onIncreaseCartItem: (product: Product) => void;
  onDecreaseCartItem: (product: Product) => void;
  onRemoveCartItem: (product: Product) => void;
  onBuyNow: (product: Product, selectedSize?: ShirtSize) => void;
  onCartCheckout: () => void;
  onRequireLogin: () => void;
  onSaveAddress: (editingAddressId: string | null, draft: {
    label: string;
    recipient: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    region: string;
    postalCode: string;
  }, fallbackName: string) => Promise<boolean>;
  onRemoveAddress: (addressId: string) => Promise<void>;
  onSetPrimaryAddress: (addressId: string) => Promise<void>;
  onRequestReturn: (orderId: string, returnTrackingNumber: string) => Promise<unknown>;
  onConfirmReceipt: (orderId: string) => Promise<unknown>;
  onSaveProfile: (name: string, avatarUrl: string) => Promise<AuthUser>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<{ message: string }>;
  onSaveProduct: (productId: string, draft: ProductEditorDraft) => Promise<Product>;
  onUploadProductImage: (file: File) => Promise<string>;
  onShipOrder: (orderId: string, trackingNumber: string) => Promise<unknown>;
  onRefundOrder: (orderId: string) => Promise<unknown>;
};

export default function AppContent(props: AppContentProps) {
  const {
    page,
    role,
    isLoggedIn,
    carousel,
    user,
    addresses,
    orders,
    adminOrders,
    products,
    cartItems,
    cartTotal,
    onAddToCart,
    onIncreaseCartItem,
    onDecreaseCartItem,
    onRemoveCartItem,
    onBuyNow,
    onCartCheckout,
    onRequireLogin,
    onSaveAddress,
    onRemoveAddress,
    onSetPrimaryAddress,
    onRequestReturn,
    onConfirmReceipt,
    onSaveProfile,
    onChangePassword,
    onSaveProduct,
    onUploadProductImage,
    onShipOrder,
    onRefundOrder,
  } = props;

  if (page === "home") {
    return (
      <HomePage
        isCarouselPaused={carousel.isCarouselPaused}
        loopCharacters={carousel.loopCharacters}
        effectBurstKey={carousel.effectBurstKey}
        selectedCharacterId={carousel.selectedCharacterId}
        selectedRenderIndex={carousel.selectedRenderIndex}
        stripRef={carousel.stripRef}
        onCharacterSelect={carousel.handleCharacterSelect}
        onScrollGallery={carousel.scrollGallery}
      />
    );
  }

  if (page === "creator") {
    return <CreatorPage author={creatorCredits.author} studio={creatorCredits.studio} />;
  }

  if (page === "shop") {
    return (
      <ShopPage
        products={products}
        isAdmin={role === "admin"}
        isLoggedIn={isLoggedIn}
        cartItems={cartItems}
        cartTotal={cartTotal}
        onAddToCart={onAddToCart}
        onIncreaseCartItem={onIncreaseCartItem}
        onDecreaseCartItem={onDecreaseCartItem}
        onRemoveCartItem={onRemoveCartItem}
        onBuyNow={onBuyNow}
        onCartCheckout={onCartCheckout}
        onRequireLogin={onRequireLogin}
        onSaveProduct={onSaveProduct}
        onUploadProductImage={onUploadProductImage}
      />
    );
  }

  if (page === "profile") {
    return (
      <ProfilePage
        user={user}
        addresses={addresses}
        orders={orders}
        cartItems={cartItems}
        onIncreaseCartItem={onIncreaseCartItem}
        onDecreaseCartItem={onDecreaseCartItem}
        onRemoveCartItem={onRemoveCartItem}
        onCartCheckout={onCartCheckout}
        onSaveAddress={onSaveAddress}
        onRemoveAddress={onRemoveAddress}
        onSetPrimaryAddress={onSetPrimaryAddress}
        onRequestReturn={onRequestReturn}
        onConfirmReceipt={onConfirmReceipt}
        onSaveProfile={onSaveProfile}
        onChangePassword={onChangePassword}
      />
    );
  }

  return <AdminPage orders={adminOrders} onShipOrder={onShipOrder} onRefundOrder={onRefundOrder} />;
}
