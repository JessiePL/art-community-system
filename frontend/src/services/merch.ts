import { apiFormRequest, apiRequest } from "./api";
import type { AddressRecord, AdminOrderRecord, OrderRecord, Product, ShirtSize } from "../types/app";

type ProductApiResponse = Product;

type UpdateProductPayload = {
  name: string;
  price: number;
  image: string;
  note: string;
  lead: string;
  detail: string;
  stock: number;
  sizeStock?: Partial<Record<ShirtSize, number>>;
  version: number;
};

type CheckoutPayload = {
  address: Omit<AddressRecord, "id" | "isPrimary"> | null;
  items: Array<{
    productId: string;
    quantity: number;
    selectedSize?: ShirtSize;
  }>;
};

type CheckoutResponse = {
  orders: OrderRecord[];
  products: Product[];
};

export function getProducts() {
  return apiRequest<ProductApiResponse[]>("/api/products");
}

export function updateProduct(productId: string, payload: UpdateProductPayload, token: string) {
  return apiRequest<ProductApiResponse>(`/api/products/${productId}`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export function getMyOrders(token: string) {
  return apiRequest<OrderRecord[]>("/api/orders/me", { token });
}

export function getAdminOrders(token: string) {
  return apiRequest<AdminOrderRecord[]>("/api/orders/admin", { token });
}

export function checkout(payload: CheckoutPayload, token: string) {
  return apiRequest<CheckoutResponse>("/api/orders/checkout", {
    method: "POST",
    body: payload,
    token,
  });
}

export function confirmReceipt(orderId: string, token: string) {
  return apiRequest<OrderRecord[]>(`/api/orders/${orderId}/confirm-receipt`, {
    method: "POST",
    token,
  });
}

export function requestReturn(orderId: string, returnTrackingNumber: string, token: string) {
  return apiRequest<OrderRecord[]>(`/api/orders/${orderId}/request-return`, {
    method: "POST",
    body: { returnTrackingNumber },
    token,
  });
}

export function shipOrder(orderId: string, trackingNumber: string, token: string) {
  return apiRequest<AdminOrderRecord[]>(`/api/orders/${orderId}/ship`, {
    method: "POST",
    body: { trackingNumber },
    token,
  });
}

export function refundOrder(orderId: string, token: string) {
  return apiRequest<AdminOrderRecord[]>(`/api/orders/${orderId}/refund`, {
    method: "POST",
    token,
  });
}


type UploadProductImageResponse = {
  imageUrl: string;
};

export async function uploadProductImage(file: File, token: string) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFormRequest<UploadProductImageResponse>("/api/products/upload-image", formData, token);
  return response.imageUrl;
}
