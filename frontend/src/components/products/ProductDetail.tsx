import type { ProductType } from "../../pages/Products";

const productData = {
  tshirt: {
    name: "Classic T-Shirt",
    description: "Soft cotton T-shirt with minimal design.",
    image: "/public/t-shirt.png",
    sizes: ["S", "M", "L", "XL"],
  },
  bag: {
    name: "Canvas Bag",
    description: "Durable canvas tote bag for daily use.",
    image: "/public/bag.png",
    sizes: [],
  },
  mug: {
    name: "Ceramic Mug",
    description: "Minimal ceramic mug for coffee or tea.",
    image: "/public/mug.png",
    sizes: [],
  },
};

interface Props {
  productType: ProductType;
}

export default function ProductDetail({ productType }: Props) {
  const product = productData[productType];

  return (
    <div className="product-detail">
      <h1>Products</h1>
      <img
        src={product.image}
        alt={product.name}
        className="product-image"
      />

      <h2>{product.name}</h2>
      <p className="product-description">{product.description}</p>

      {product.sizes.length > 0 && (
        <div className="size-selector">
          <span>Size</span>
          <div className="sizes">
            {product.sizes.map((size) => (
              <button key={size}>{size}</button>
            ))}
          </div>
        </div>
      )}

      <button className="buy-button">Buy Now</button>
    </div>
  );
}
