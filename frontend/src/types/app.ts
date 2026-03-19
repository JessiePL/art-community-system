export type Page = "home" | "creator" | "shop" | "profile";
export type UserRole = "guest" | "fan" | "member" | "admin";
export type ProductCategory = "T-shirt" | "Mug" | "Canvas Bag";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  image: string;
  note: string;
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
