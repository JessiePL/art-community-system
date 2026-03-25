export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthPayload = RegisterRequest | LoginRequest;

export type AuthApiAddress = {
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

export type AuthApiUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  isMember: boolean;
  membershipLevel: number;
  addresses: AuthApiAddress[];
};

export type AuthResponse = {
  token: string;
  expiresAtUtc: string;
  user: AuthApiUser;
};
