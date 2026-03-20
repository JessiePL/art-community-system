export type Page = "home" | "creator" | "shop" | "profile" | "admin";
export type UserRole = "guest" | "fan" | "member" | "admin";
export type ProductCategory = "T-shirt" | "Mug" | "Canvas Bag";

export type AuthMode = "login" | "register";

export type AuthUser = {
  name: string;
  email: string;
  role: Exclude<UserRole, "guest">;
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
  sizeStock?: Partial<Record<"S" | "M" | "L" | "XL", number>>;
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
