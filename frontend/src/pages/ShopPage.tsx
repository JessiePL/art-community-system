import type { Product, ProductCategory } from "../types/app";

type CartItem = Product & {
  quantity: number;
  subtotal: number;
};

type ShopPageProps = {
  products: Product[];
  selectedCategory: ProductCategory | "All";
  cartItems: CartItem[];
  cartTotal: number;
  onCategoryChange: (category: ProductCategory | "All") => void;
  onAddToCart: (product: Product) => void;
  onCheckout: () => void;
};

export default function ShopPage({
  products,
  selectedCategory,
  cartItems,
  cartTotal,
  onCategoryChange,
  onAddToCart,
  onCheckout,
}: ShopPageProps) {
  return (
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
              onClick={() => onCategoryChange(category)}
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
            <button className="primary-button" onClick={() => onAddToCart(product)}>
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
          <button className="primary-button" onClick={onCheckout}>
            Try Checkout
          </button>
        </div>
      </section>
    </div>
  );
}
