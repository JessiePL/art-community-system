import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useCachedImageUrls } from "../hooks/useCachedImageUrls";
import type { ProductEditorDraft } from "../hooks/useMerchState";
import "../styles/merch.css";
import type { Product, ShirtSize } from "../types/app";

type CartItem = Product & {
  quantity: number;
  subtotal: number;
};

type ShopPageProps = {
  products: Product[];
  isAdmin: boolean;
  isLoggedIn: boolean;
  cartItems: CartItem[];
  cartTotal: number;
  onAddToCart: (product: Product, selectedSize?: ShirtSize) => boolean;
  onIncreaseCartItem: (product: Product) => void;
  onDecreaseCartItem: (product: Product) => void;
  onRemoveCartItem: (product: Product) => void;
  onBuyNow: (product: Product, selectedSize?: ShirtSize) => void;
  onCartCheckout: () => void;
  onRequireLogin: () => void;
  onSaveProduct: (productId: string, draft: ProductEditorDraft) => Promise<Product>;
  onUploadProductImage: (file: File) => Promise<string>;
};

const shirtSizes: ShirtSize[] = ["S", "M", "L", "XL"];

const merchCopy: Record<
  Product["category"],
  {
    eyebrow: string;
    detail: string;
  }
> = {
  "T-shirt": {
    eyebrow: "Wearable drop",
    detail:
      "A front-led apparel piece designed for daily styling, event wear, and statement fan looks.",
  },
  Mug: {
    eyebrow: "Desk collectible",
    detail:
      "A practical display item for home setups, shelves, and daily use without losing the anime visual identity.",
  },
  "Canvas Bag": {
    eyebrow: "Carry essential",
    detail:
      "A roomy convention-ready tote built for sketchbooks, small purchases, and everyday fandom styling.",
  },
};

export default function ShopPage({
  products,
  isAdmin,
  isLoggedIn,
  cartItems,
  cartTotal,
  onAddToCart,
  onIncreaseCartItem,
  onDecreaseCartItem,
  onRemoveCartItem,
  onBuyNow,
  onCartCheckout,
  onRequireLogin,
  onSaveProduct,
  onUploadProductImage,
}: ShopPageProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ShirtSize>("M");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editDraft, setEditDraft] = useState<ProductEditorDraft>({
    name: "",
    price: "",
    lead: "",
    note: "",
    detail: "",
    image: "",
    stock: "",
    S: "",
    M: "",
    L: "",
    XL: "",
  });
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const activeProduct = products[activeIndex] ?? products[0];
  const previousProduct = products[(activeIndex - 1 + products.length) % products.length];
  const nextProduct = products[(activeIndex + 1) % products.length];
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const resolveImageSrc = useCachedImageUrls(products.map((product) => product.image));

  if (!activeProduct) {
    return null;
  }

  const activeCopy = {
    eyebrow: activeProduct.lead ?? merchCopy[activeProduct.category].eyebrow,
    detail: activeProduct.detail ?? merchCopy[activeProduct.category].detail,
  };
  const activeStock =
    activeProduct.category === "T-shirt"
      ? activeProduct.sizeStock?.[selectedSize] ?? 0
      : activeProduct.stock;
  const isSoldOut = activeStock <= 0;
  const selectedPurchaseSize = activeProduct.category === "T-shirt" ? selectedSize : undefined;
  const sizeStockSummary =
    activeProduct.category === "T-shirt"
      ? shirtSizes.map((size) => ({
          size,
          stock: activeProduct.sizeStock?.[size] ?? 0,
        }))
      : [];

  useEffect(() => {
    setEditDraft({
      name: activeProduct.name,
      price: String(activeProduct.price),
      lead: activeCopy.eyebrow,
      note: activeProduct.note,
      detail: activeCopy.detail,
      image: activeProduct.image,
      stock: String(activeProduct.stock),
      S: String(activeProduct.sizeStock?.S ?? 0),
      M: String(activeProduct.sizeStock?.M ?? 0),
      L: String(activeProduct.sizeStock?.L ?? 0),
      XL: String(activeProduct.sizeStock?.XL ?? 0),
    });
    setSaveError("");
  }, [
    activeProduct.id,
    activeProduct.image,
    activeProduct.name,
    activeProduct.note,
    activeProduct.price,
    activeProduct.sizeStock?.L,
    activeProduct.sizeStock?.M,
    activeProduct.sizeStock?.S,
    activeProduct.sizeStock?.XL,
    activeProduct.stock,
    activeCopy.detail,
    activeCopy.eyebrow,
  ]);

  const handlePrevious = () => {
    setActiveIndex((current) => (current - 1 + products.length) % products.length);
  };

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % products.length);
  };

  const handleAddToCart = () => {
    if (isSoldOut) {
      return;
    }

    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }

    const added = onAddToCart(activeProduct, selectedPurchaseSize);
    if (added) {
      setIsCartOpen(true);
    }
  };

  const handleBuyNow = () => {
    if (isSoldOut) {
      return;
    }

    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }

    onBuyNow(activeProduct, selectedPurchaseSize);
  };

  const handleCartToggle = () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }

    setIsCartOpen((current) => !current);
  };

  const handlePayNow = () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }

    onCartCheckout();
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploadingImage(true);
      setSaveError("");
      const imageUrl = await onUploadProductImage(file);
      setEditDraft((current) => ({ ...current, image: imageUrl }));
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const handleSaveProduct = async () => {
    try {
      setIsSavingProduct(true);
      setSaveError("");
      await onSaveProduct(activeProduct.id, editDraft);
      setIsEditOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Product save failed.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  return (
    <div className="page-stack merch-page">
      <section className="merch-carousel-shell">
        <button
          className="merch-switch merch-switch-left"
          type="button"
          aria-label="Previous product"
          onClick={handlePrevious}
        >
          &#8249;
        </button>

        <article key={activeProduct.id} className="glass-card merch-feature-card">
          <div className="merch-peek merch-peek-left" aria-hidden="true">
            <img src={resolveImageSrc(previousProduct.image)} alt="" />
            <span>{previousProduct.name}</span>
          </div>

          <div className="merch-peek merch-peek-right" aria-hidden="true">
            <img src={resolveImageSrc(nextProduct.image)} alt="" />
            <span>{nextProduct.name}</span>
          </div>

          {!isAdmin ? (
            <div className="merch-drag-hint" aria-hidden="true">
              Hover to browse more drops
            </div>
          ) : null}

          <div className="merch-feature">
            <div className="merch-visual-panel">
              <img src={resolveImageSrc(activeProduct.image)} alt={activeProduct.name} />
            </div>

            <div className="merch-copy-panel">
              <div className="merch-copy-block">
                <p className="eyebrow">{activeProduct.category}</p>
                <div className="merch-admin-heading">
                  <h3>{activeProduct.name}</h3>
                  {isAdmin ? (
                    <button
                      className="ghost-button merch-admin-open-button"
                      type="button"
                      onClick={() => setIsEditOpen(true)}
                    >
                      <img src="/edit.png" alt="" />
                      Edit product
                    </button>
                  ) : null}
                </div>
                <p className="merch-copy-lead">{activeCopy.eyebrow}</p>
                <p>{activeProduct.note}</p>
                <p>{activeCopy.detail}</p>
              </div>

              <div className="merch-meta-row">
                <span>${activeProduct.price}</span>
                {!isAdmin ? (
                  <span>{isSoldOut ? "Sold out" : `Stock ${activeStock}${selectedPurchaseSize ? ` (${selectedPurchaseSize})` : ""}`}</span>
                ) : activeProduct.category === "T-shirt" ? (
                  sizeStockSummary.map((entry) => (
                    <span key={entry.size}>{entry.size} {entry.stock}</span>
                  ))
                ) : (
                  <span>{activeProduct.stock <= 0 ? "Sold out" : `Stock ${activeProduct.stock}`}</span>
                )}
              </div>

              {!isAdmin ? (
                <div className="merch-purchase-stack">
                  {activeProduct.category === "T-shirt" ? (
                    <div className="merch-size-group" aria-label="T-shirt size options">
                      {shirtSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          className={selectedSize === size ? "merch-size-chip active" : "merch-size-chip"}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="merch-size-group merch-size-group-placeholder" aria-hidden="true" />
                  )}

                  <div className="merch-actions">
                    <button
                      className="primary-button"
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isSoldOut}
                    >
                      {isSoldOut ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={handleBuyNow}
                      disabled={isSoldOut}
                    >
                      {isSoldOut ? "Unavailable" : "Buy Now"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </article>

        <button
          className="merch-switch merch-switch-right"
          type="button"
          aria-label="Next product"
          onClick={handleNext}
        >
          &#8250;
        </button>
      </section>

      {!isAdmin ? (
        <div className={isCartOpen ? "merch-cart-dock open" : "merch-cart-dock"}>
          <button className="merch-cart-fab" type="button" onClick={handleCartToggle} aria-label="Open cart">
            <span className="merch-cart-icon">
              <img src="/carts.png" alt="" />
            </span>
            {isLoggedIn && cartItemCount > 0 ? <span className="merch-cart-badge">{cartItemCount}</span> : null}
          </button>

          {isCartOpen ? (
            <section className="glass-card merch-cart-panel">
              <div className="merch-cart-header">
                <div>
                  <p className="eyebrow">Shopping Cart</p>
                  <h3>{cartItemCount} item(s)</h3>
                </div>
                <button className="ghost-button" type="button" onClick={() => setIsCartOpen(false)}>
                  Close
                </button>
              </div>

              <div className="merch-cart-items">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <article key={`${item.id}-${item.selectedSize ?? "default"}`} className="merch-cart-row">
                      <div className="merch-cart-item-main">
                        <img src={resolveImageSrc(item.image)} alt={item.name} />
                        <div className="merch-cart-copy">
                          <strong>{item.name}</strong>
                          <span>
                            Qty {item.quantity} · ${item.subtotal}
                            {item.selectedSize ? ` · Size ${item.selectedSize}` : ""}
                          </span>
                        </div>
                      </div>
                      <div className="merch-cart-item-controls">
                        <button className="merch-cart-icon-button" type="button" onClick={() => onDecreaseCartItem(item)}>
                          -
                        </button>
                        <span className="merch-cart-quantity">{item.quantity}</span>
                        <button className="merch-cart-icon-button" type="button" onClick={() => onIncreaseCartItem(item)}>
                          +
                        </button>
                        <button className="merch-cart-icon-button remove" type="button" onClick={() => onRemoveCartItem(item)}>
                          <img src="/bin.png" alt="Remove" />
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="merch-cart-empty">Your cart is empty.</p>
                )}
              </div>

              <div className="merch-cart-footer">
                <strong>Total ${cartTotal}</strong>
                <button className="primary-button merch-cart-pay-button" type="button" onClick={handlePayNow}>
                  Pay Now
                </button>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {isAdmin && isEditOpen ? (
        <div className="auth-modal-backdrop" onClick={() => setIsEditOpen(false)}>
          <section
            className="auth-modal glass-card merch-admin-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="auth-modal-header">
              <div>
                <p className="eyebrow">Product Edit</p>
                <h3>{activeProduct.name}</h3>
              </div>
              <button className="ghost-button" type="button" onClick={() => setIsEditOpen(false)}>
                Close
              </button>
            </div>

            <div className="merch-admin-image-panel">
              <img src={resolveImageSrc(editDraft.image || activeProduct.image)} alt={activeProduct.name} />
              <div className="merch-admin-image-actions">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => void handleImageUpload(event)}
                />
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploadingImage}
                >
{isUploadingImage ? "Uploading..." : "Upload new image"}
                </button>
              </div>
            </div>

            <div className="merch-admin-form-grid">
              <label>
                <span>Name</span>
                <input
                  value={editDraft.name}
                  onChange={(event) => setEditDraft((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
              <label>
                <span>Price</span>
                <input
                  type="number"
                  min="0"
                  value={editDraft.price}
                  onChange={(event) => setEditDraft((current) => ({ ...current, price: event.target.value }))}
                />
              </label>
              <label>
                <span>Lead</span>
                <input
                  value={editDraft.lead}
                  onChange={(event) => setEditDraft((current) => ({ ...current, lead: event.target.value }))}
                />
              </label>
              <label>
                <span>Note</span>
                <textarea
                  value={editDraft.note}
                  onChange={(event) => setEditDraft((current) => ({ ...current, note: event.target.value }))}
                />
              </label>
              <label>
                <span>Detail</span>
                <textarea
                  value={editDraft.detail}
                  onChange={(event) => setEditDraft((current) => ({ ...current, detail: event.target.value }))}
                />
              </label>
            </div>

            {activeProduct.category === "T-shirt" ? (
              <div className="merch-admin-size-grid">
                {shirtSizes.map((size) => (
                  <label key={size}>
                    <span>{size} stock</span>
                    <input
                      type="number"
                      min="0"
                      value={editDraft[size]}
                      onChange={(event) => setEditDraft((current) => ({ ...current, [size]: event.target.value }))}
                    />
                  </label>
                ))}
              </div>
            ) : (
              <label className="merch-admin-stock-field">
                <span>Stock</span>
                <input
                  type="number"
                  min="0"
                  value={editDraft.stock}
                  onChange={(event) => setEditDraft((current) => ({ ...current, stock: event.target.value }))}
                />
              </label>
            )}

            {saveError ? <p className="muted-copy">{saveError}</p> : null}

            <div className="auth-actions merch-admin-actions">
              <button className="primary-button" type="button" onClick={handleSaveProduct} disabled={isSavingProduct || isUploadingImage}>
                {isSavingProduct ? "Saving..." : "Save product"}
              </button>
              <button className="ghost-button" type="button" onClick={() => setIsEditOpen(false)} disabled={isSavingProduct || isUploadingImage}>
                Cancel
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
