import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import "../styles/merch.css";
import type { Product } from "../types/app";

type CartItem = Product & {
  quantity: number;
  subtotal: number;
};

type ShirtSize = "S" | "M" | "L" | "XL";

type ShopPageProps = {
  products: Product[];
  isAdmin: boolean;
  isLoggedIn: boolean;
  cartItems: CartItem[];
  cartTotal: number;
  onAddToCart: (product: Product) => void;
  onIncreaseCartItem: (product: Product) => void;
  onDecreaseCartItem: (product: Product) => void;
  onRemoveCartItem: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onCartCheckout: () => void;
  onUpdateProductField: (productId: string, field: keyof Product, value: string | number) => void;
  onRestockProduct: (productId: string, amount: number, size?: ShirtSize) => void;
  onUpdateProductImage: (productId: string, imageUrl: string) => void;
  onUpdateProductSizeStock: (productId: string, size: ShirtSize, stock: number) => void;
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
  onUpdateProductField,
  onUpdateProductImage,
  onUpdateProductSizeStock,
}: ShopPageProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ShirtSize>("M");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState({
    name: "",
    price: "",
    lead: "",
    note: "",
    detail: "",
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

  if (!activeProduct) {
    return null;
  }

  const activeCopy = {
    eyebrow: activeProduct.lead ?? merchCopy[activeProduct.category].eyebrow,
    detail: activeProduct.detail ?? merchCopy[activeProduct.category].detail,
  };

  useEffect(() => {
    setEditDraft({
      name: activeProduct.name,
      price: String(activeProduct.price),
      lead: activeCopy.eyebrow,
      note: activeProduct.note,
      detail: activeCopy.detail,
      stock: String(activeProduct.stock),
      S: String(activeProduct.sizeStock?.S ?? 0),
      M: String(activeProduct.sizeStock?.M ?? 0),
      L: String(activeProduct.sizeStock?.L ?? 0),
      XL: String(activeProduct.sizeStock?.XL ?? 0),
    });
  }, [activeProduct.id, activeProduct.name, activeProduct.price, activeProduct.note, activeProduct.stock, activeCopy.eyebrow, activeCopy.detail, activeProduct.sizeStock?.S, activeProduct.sizeStock?.M, activeProduct.sizeStock?.L, activeProduct.sizeStock?.XL]);

  const handlePrevious = () => {
    setActiveIndex((current) => (current - 1 + products.length) % products.length);
  };

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % products.length);
  };

  const handleAddToCart = () => {
    onAddToCart(activeProduct);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    onBuyNow(activeProduct);
    setIsCartOpen(true);
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const nextImageUrl = URL.createObjectURL(file);
    onUpdateProductImage(activeProduct.id, nextImageUrl);
  };

  const handleSaveProduct = () => {
    onUpdateProductField(activeProduct.id, "name", editDraft.name.trim());
    onUpdateProductField(activeProduct.id, "price", Number(editDraft.price) || activeProduct.price);
    onUpdateProductField(activeProduct.id, "lead", editDraft.lead.trim());
    onUpdateProductField(activeProduct.id, "note", editDraft.note.trim());
    onUpdateProductField(activeProduct.id, "detail", editDraft.detail.trim());

    if (activeProduct.category === "T-shirt") {
      shirtSizes.forEach((size) => {
        onUpdateProductSizeStock(activeProduct.id, size, Number(editDraft[size]) || 0);
      });
    } else {
      onUpdateProductField(activeProduct.id, "stock", Number(editDraft.stock) || activeProduct.stock);
    }

    setIsEditOpen(false);
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
            <img src={previousProduct.image} alt="" />
            <span>{previousProduct.name}</span>
          </div>

          <div className="merch-peek merch-peek-right" aria-hidden="true">
            <img src={nextProduct.image} alt="" />
            <span>{nextProduct.name}</span>
          </div>

          {!isAdmin ? (
            <div className="merch-drag-hint" aria-hidden="true">
              Hover to browse more drops
            </div>
          ) : null}

          <div className="merch-feature">
            <div className="merch-visual-panel">
              <img src={activeProduct.image} alt={activeProduct.name} />
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
                <span>Stock {activeProduct.stock}</span>
              </div>

              {!isAdmin ? (
                <div className="merch-purchase-stack">
                  {activeProduct.category === "T-shirt" ? (
                    <div className="merch-size-group" aria-label="T-shirt size options">
                      {shirtSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          className={
                            selectedSize === size ? "merch-size-chip active" : "merch-size-chip"
                          }
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
                    >
                      Add to Cart
                    </button>
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={handleBuyNow}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ) : null}

              {!isAdmin && !isLoggedIn ? (
                <div className="merch-footer-note">
                  <span>
                    {activeProduct.category === "T-shirt"
                      ? `Selected Size ${selectedSize}`
                      : "Single standard edition"}
                  </span>
                  <span>Total in cart ${cartTotal}</span>
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
        <aside className={isCartOpen ? "merch-cart-dock open" : "merch-cart-dock"}>
          {isCartOpen && (
            <div className="glass-card merch-cart-panel">
              <div className="merch-cart-header">
                <div>
                  <p className="eyebrow">Shopping Cart</p>
                  <strong>{cartItemCount} item(s)</strong>
                </div>
                <span>Total ${cartTotal}</span>
              </div>

              {cartItems.length > 0 ? (
                <div className="merch-cart-list">
                  {cartItems.map((item) => (
                    <article key={item.id} className="merch-cart-row">
                      <div className="merch-cart-item-main">
                        <img src={item.image} alt={item.name} />
                        <div className="merch-cart-copy">
                          <strong>{item.name}</strong>
                          <span>
                            Qty {item.quantity} · ${item.subtotal}
                          </span>
                        </div>
                      </div>

                      <div className="merch-cart-item-controls" aria-label={`Adjust ${item.name}`}>
                        <button
                          className="merch-cart-icon-button"
                          type="button"
                          aria-label={`Decrease ${item.name}`}
                          onClick={() => onDecreaseCartItem(item)}
                        >
                          -
                        </button>
                        <span className="merch-cart-quantity" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          className="merch-cart-icon-button"
                          type="button"
                          aria-label={`Increase ${item.name}`}
                          onClick={() => onIncreaseCartItem(item)}
                        >
                          +
                        </button>
                        <button
                          className="merch-cart-icon-button remove"
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => onRemoveCartItem(item)}
                        >
                          <img src="/bin.png" alt="" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="merch-cart-empty">Your cart is empty for now.</p>
              )}

              <button
                className="primary-button merch-cart-pay-button"
                type="button"
                onClick={onCartCheckout}
                disabled={cartItems.length === 0}
              >
                Pay Now
              </button>
            </div>
          )}

          <button
            className="merch-cart-fab"
            type="button"
            aria-expanded={isCartOpen}
            aria-label={isCartOpen ? "Hide shopping cart" : "Show shopping cart"}
            onClick={() => setIsCartOpen((current) => !current)}
          >
            <span className="merch-cart-icon" aria-hidden="true">
              <img src="/carts.png" alt="" />
            </span>
            <span className="merch-cart-badge">{cartItemCount}</span>
          </button>
        </aside>
      ) : null}

      {isAdmin && isEditOpen ? (
        <div className="auth-modal-backdrop" onClick={() => setIsEditOpen(false)}>
          <section
            className="auth-modal glass-card merch-admin-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="auth-modal-header">
              <div>
                <p className="eyebrow">Product editor</p>
                <h3>{activeProduct.name}</h3>
                <p className="muted-copy">Update product basics, stock, sizes, and image in one place.</p>
              </div>
              <button className="ghost-button" type="button" onClick={() => setIsEditOpen(false)}>
                Close
              </button>
            </div>

            <div className="auth-form merch-admin-form">
              <label className="auth-field">
                <span>Name</span>
                <input
                  value={editDraft.name}
                  onChange={(event) => setEditDraft((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
              <label className="auth-field">
                <span>Price</span>
                <input
                  type="number"
                  value={editDraft.price}
                  onChange={(event) => setEditDraft((current) => ({ ...current, price: event.target.value }))}
                />
              </label>
              <label className="auth-field">
                <span>Lead</span>
                <input
                  value={editDraft.lead}
                  onChange={(event) => setEditDraft((current) => ({ ...current, lead: event.target.value }))}
                />
              </label>
              <label className="auth-field">
                <span>Note</span>
                <input
                  value={editDraft.note}
                  onChange={(event) => setEditDraft((current) => ({ ...current, note: event.target.value }))}
                />
              </label>
              <label className="auth-field">
                <span>Detail</span>
                <input
                  value={editDraft.detail}
                  onChange={(event) => setEditDraft((current) => ({ ...current, detail: event.target.value }))}
                />
              </label>

              {activeProduct.category === "T-shirt" ? (
                <div className="merch-admin-size-grid">
                  {shirtSizes.map((size) => (
                    <label key={size} className="auth-field">
                      <span>{size} stock</span>
                      <input
                        type="number"
                        value={editDraft[size]}
                        onChange={(event) =>
                          setEditDraft((current) => ({ ...current, [size]: event.target.value }))
                        }
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <label className="auth-field">
                  <span>Stock</span>
                  <input
                    type="number"
                    value={editDraft.stock}
                    onChange={(event) => setEditDraft((current) => ({ ...current, stock: event.target.value }))}
                  />
                </label>
              )}

              <div className="merch-admin-image-row">
                <input
                  ref={imageInputRef}
                  className="merch-admin-hidden-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                >
                  Update image
                </button>
              </div>
            </div>

            <div className="auth-actions merch-admin-actions">
              <button className="primary-button" type="button" onClick={handleSaveProduct}>
                Save product
              </button>
              <button className="ghost-button" type="button" onClick={() => setIsEditOpen(false)}>
                Cancel
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
