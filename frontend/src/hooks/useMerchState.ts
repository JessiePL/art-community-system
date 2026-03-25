import { useEffect, useMemo, useState } from "react";
import { merchandiseCatalog } from "../data/site";
import { getCart, saveCart as persistCart, type PersistedCartItem } from "../services/cart";
import { getProducts, updateProduct } from "../services/merch";
import type { Product, ShirtSize } from "../types/app";

type CartEntry = {
  productId: string;
  quantity: number;
  selectedSize?: ShirtSize;
};

type CartItem = Product & {
  quantity: number;
  subtotal: number;
};

export type ProductEditorDraft = {
  name: string;
  price: string;
  lead: string;
  note: string;
  detail: string;
  image: string;
  stock: string;
  S: string;
  M: string;
  L: string;
  XL: string;
};

const buildCartKey = (productId: string, selectedSize?: ShirtSize) =>
  productId + "::" + (selectedSize ?? "default");

const fallbackProducts: Product[] = merchandiseCatalog.map((product) => ({
  ...product,
  version: 1,
  updatedAtUtc: new Date(0).toISOString(),
}));

const buildCartRecord = (items: PersistedCartItem[]) =>
  items.reduce<Record<string, CartEntry>>((current, item) => {
    current[buildCartKey(item.productId, item.selectedSize)] = {
      productId: item.productId,
      quantity: item.quantity,
      selectedSize: item.selectedSize,
    };
    return current;
  }, {});

const mapCartEntries = (cart: Record<string, CartEntry>): PersistedCartItem[] =>
  Object.values(cart).map((entry) => ({
    productId: entry.productId,
    quantity: entry.quantity,
    selectedSize: entry.selectedSize,
  }));

export function useMerchState(setMessage: (message: string) => void, token: string | null) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [cart, setCart] = useState<Record<string, CartEntry>>({});
  const [cartLoaded, setCartLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadProducts = async (silent: boolean) => {
      try {
        const nextProducts = await getProducts();
        if (isActive) {
          setProducts(nextProducts);
        }
      } catch {
        if (!silent && isActive) {
          setMessage("Using local merch data because the backend products API is unavailable right now.");
        }
      }
    };

    void loadProducts(false);

    const timer = window.setInterval(() => {
      void loadProducts(true);
    }, 10000);

    return () => {
      isActive = false;
      window.clearInterval(timer);
    };
  }, [setMessage]);

  useEffect(() => {
    let isActive = true;

    if (!token) {
      setCart({});
      setCartLoaded(false);
      return () => {
        isActive = false;
      };
    }

    void getCart(token)
      .then((items) => {
        if (!isActive) {
          return;
        }

        setCart(buildCartRecord(items));
        setCartLoaded(true);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setCart({});
        setCartLoaded(true);
        setMessage("Your saved cart could not be loaded from MongoDB right now.");
      });

    return () => {
      isActive = false;
    };
  }, [setMessage, token]);

  useEffect(() => {
    if (!token || !cartLoaded) {
      return;
    }

    const timer = window.setTimeout(() => {
      void persistCart(mapCartEntries(cart), token).catch(() => {
        setMessage("Your cart changes could not be saved to MongoDB right now.");
      });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [cart, cartLoaded, setMessage, token]);

  const cartItems = useMemo(
    () =>
      Object.values(cart).reduce<CartItem[]>((items, entry) => {
        const product = products.find((item) => item.id === entry.productId);

        if (!product) {
          return items;
        }

        items.push({
          ...product,
          selectedSize: entry.selectedSize,
          quantity: entry.quantity,
          subtotal: entry.quantity * product.price,
        });

        return items;
      }, []),
    [cart, products],
  );

  const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  const addToCart = (product: Product, selectedSize?: ShirtSize) => {
    const cartKey = buildCartKey(product.id, selectedSize);

    setCart((current) => ({
      ...current,
      [cartKey]: {
        productId: product.id,
        quantity: (current[cartKey]?.quantity ?? 0) + 1,
        selectedSize,
      },
    }));

    setMessage(`${product.name}${selectedSize ? ` (${selectedSize})` : ""} added to the cart queue.`);
  };

  const saveProduct = async (productId: string, draft: ProductEditorDraft) => {
    if (!token) {
      throw new Error("Admin login is required before saving merch changes.");
    }

    const currentProduct = products.find((product) => product.id === productId);
    if (!currentProduct) {
      throw new Error("Product not found.");
    }

    const updatedProduct = await updateProduct(productId, {
      name: draft.name.trim(),
      price: Number(draft.price) || 0,
      image: draft.image.trim(),
      note: draft.note.trim(),
      lead: draft.lead.trim(),
      detail: draft.detail.trim(),
      stock: Number(draft.stock) || 0,
      sizeStock: currentProduct.category === "T-shirt"
        ? {
            S: Number(draft.S) || 0,
            M: Number(draft.M) || 0,
            L: Number(draft.L) || 0,
            XL: Number(draft.XL) || 0,
          }
        : undefined,
      version: currentProduct.version,
    }, token);

    setProducts((current) =>
      current.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)),
    );

    setMessage(`${updatedProduct.name} was saved to MongoDB and synced back to the page.`);
    return updatedProduct;
  };

  const applyServerProducts = (updatedProducts: Product[]) => {
    if (updatedProducts.length === 0) {
      return;
    }

    setProducts((current) =>
      current.map((product) => updatedProducts.find((item) => item.id === product.id) ?? product),
    );
  };

  const increaseCartItem = (product: Product) => {
    const cartKey = buildCartKey(product.id, product.selectedSize);

    setCart((current) => ({
      ...current,
      [cartKey]: {
        productId: product.id,
        quantity: (current[cartKey]?.quantity ?? 0) + 1,
        selectedSize: product.selectedSize,
      },
    }));
    setMessage(`${product.name}${product.selectedSize ? ` (${product.selectedSize})` : ""} quantity increased in your cart.`);
  };

  const decreaseCartItem = (product: Product) => {
    const cartKey = buildCartKey(product.id, product.selectedSize);

    setCart((current) => {
      const entry = current[cartKey];
      const nextQuantity = Math.max((entry?.quantity ?? 0) - 1, 0);

      if (nextQuantity === 0) {
        const { [cartKey]: _removed, ...remaining } = current;
        return remaining;
      }

      return {
        ...current,
        [cartKey]: {
          productId: product.id,
          quantity: nextQuantity,
          selectedSize: product.selectedSize,
        },
      };
    });

    setMessage(`${product.name}${product.selectedSize ? ` (${product.selectedSize})` : ""} quantity reduced in your cart.`);
  };

  const removeCartItem = (product: Product) => {
    const cartKey = buildCartKey(product.id, product.selectedSize);

    setCart((current) => {
      const { [cartKey]: _removed, ...remaining } = current;
      return remaining;
    });
    setMessage(`${product.name}${product.selectedSize ? ` (${product.selectedSize})` : ""} removed from your cart.`);
  };

  const completeCheckout = (items: CartItem[], updatedProducts: Product[]) => {
    applyServerProducts(updatedProducts);

    setCart((current) => {
      const nextCart = { ...current };
      items.forEach((item) => {
        delete nextCart[buildCartKey(item.id, item.selectedSize)];
      });
      return nextCart;
    });
  };

  return {
    products,
    cartItems,
    cartTotal,
    addToCart,
    saveProduct,
    increaseCartItem,
    decreaseCartItem,
    removeCartItem,
    completeCheckout,
    applyServerProducts,
  };
}
