import { apiRequest } from "./api";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth";

export function register(requestBody: RegisterRequest) {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: requestBody,
  });
}

export function login(requestBody: LoginRequest) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: requestBody,
  });
}

export function getMe(token: string) {
  return apiRequest<AuthResponse["user"]>("/api/auth/me", { token });
}

export function updateProfile(requestBody: { name: string; avatarUrl: string }, token: string) {
  return apiRequest<AuthResponse["user"]>("/api/auth/profile", {
    method: "PUT",
    body: requestBody,
    token,
  });
}

export function changePassword(requestBody: { currentPassword: string; newPassword: string }, token: string) {
  return apiRequest<{ message: string }>("/api/auth/password", {
    method: "PUT",
    body: requestBody,
    token,
  });
}

export function saveAddress(requestBody: {
  id?: string;
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  isPrimary: boolean;
}, token: string) {
  return apiRequest<AuthResponse["user"]>("/api/auth/addresses", {
    method: "PUT",
    body: requestBody,
    token,
  });
}

export function deleteAddress(addressId: string, token: string) {
  return apiRequest<AuthResponse["user"]>(`/api/auth/addresses/${addressId}`, {
    method: "DELETE",
    token,
  });
}

export function setPrimaryAddress(addressId: string, token: string) {
  return apiRequest<AuthResponse["user"]>(`/api/auth/addresses/${addressId}/primary`, {
    method: "POST",
    token,
  });
}
