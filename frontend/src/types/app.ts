export type Page = "home" | "creator" | "shop" | "profile" | "admin";
export type UserRole = "guest" | "user" | "admin";
export type ProductCategory = "T-shirt" | "Mug" | "Canvas Bag";
export type OrderStatus = "In cart" | "Paid" | "Shipped" | "Return requested" | "Completed" | "Refunded";
export type ShirtSize = "S" | "M" | "L" | "XL";

export type AuthMode = "login" | "register";

export type AddressRecord = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  isPrimary: boolean;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: Exclude<UserRole, "guest">;
  isMember: boolean;
  membershipLevel: number;
  addresses: AddressRecord[];
};

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  image: string;
  note: string;
  lead?: string;
  detail?: string;
  sizeStock?: Partial<Record<ShirtSize, number>>;
  selectedSize?: ShirtSize;
  version: number;
  updatedAtUtc: string;
};

export type OrderRecord = {
  id: string;
  orderNumber: string;
  trackingNumber?: string;
  returnTrackingNumber?: string;
  itemName: string;
  quantity: number;
  total: number;
  status: OrderStatus;
  eta: string;
  detail: string;
  image: string;
  selectedSize?: ShirtSize;
};

export type AdminOrderRecord = {
  id: string;
  buyerName: string;
  buyerEmail: string;
  itemName: string;
  quantity: number;
  total: number;
  status: Exclude<OrderStatus, "In cart">;
  orderNumber: string;
  trackingNumber?: string;
  returnTrackingNumber?: string;
  addressSummary: string;
  selectedSize?: ShirtSize;
};

export type CharacterProfile = {
  id: string;
  order: number;
  name: string;
  subtitle: string;
  affiliation: string;
  image: string;
  summary: string;
  abilities: string[];
  spotlight: string;
};
