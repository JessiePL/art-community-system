import { apiRequest } from "./api";
import type { ShirtSize } from "../types/app";

export type PersistedCartItem = {
  productId: string;
  quantity: number;
  selectedSize?: ShirtSize;
};

export function getCart(token: string) {
  return apiRequest<PersistedCartItem[]>("/api/cart", { token });
}

export function saveCart(items: PersistedCartItem[], token: string) {
  return apiRequest<PersistedCartItem[]>("/api/cart", {
    method: "PUT",
    body: { items },
    token,
  });
}
