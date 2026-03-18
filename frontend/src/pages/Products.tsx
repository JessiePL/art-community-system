import { useState } from "react";
import ProductMenu from "../components/products/ProductMenu";
import ProductDetail from "../components/products/ProductDetail";
import "../styles/products.css";

export type ProductType = "tshirt" | "bag" | "mug";

export default function Products() {
  const [productType, setProductType] = useState<ProductType>("tshirt");

  return (
    <div className="products-page">
      <div className="products-layout">
        <div className="products-header-menu">
          <ProductMenu
            active={productType}
            onSelect={setProductType}
          />
        </div>

        <div className="products-detail-container">
        <ProductMenu
          active={productType}
          onSelect={setProductType}
        />
        </div>

        <ProductDetail productType={productType} />

      </div>
    </div>
  );
}
