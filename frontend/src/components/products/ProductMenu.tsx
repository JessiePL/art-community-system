import type { ProductType } from "../../pages/Products";

interface Props {
  active: ProductType;
  onSelect: (type: ProductType) => void;
}

export default function ProductMenu({ active, onSelect }: Props) {
  return (
    <div className="product-menu">
      <button
        className={active === "tshirt" ? "active" : ""}
        onClick={() => onSelect("tshirt")}
      >
        T-Shirt
      </button>

      <button
        className={active === "bag" ? "active" : ""}
        onClick={() => onSelect("bag")}
      >
        Bag
      </button>

      <button
        className={active === "mug" ? "active" : ""}
        onClick={() => onSelect("mug")}
      >
        Mug
      </button>
    </div>
  );
}
