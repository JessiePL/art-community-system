import { useEffect, useState } from "react";
import { changePassword, deleteAddress, getMe, login, register, saveAddress, setPrimaryAddress, updateProfile } from "../services/auth";
import type { AuthMode, AuthUser, Page, UserRole } from "../types/app";
import type { AuthApiUser } from "../types/auth";

type AuthDraft = {
  name: string;
  email: string;
  password: string;
};

type AddressDraft = {
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
};

const roleMap: Record<string, Exclude<UserRole, "guest">> = {
  Admin: "admin",
  Customer: "user",
};

const TOKEN_STORAGE_KEY = "art-community-token";
const USER_STORAGE_KEY = "art-community-user";

const mapUser = (user: AuthApiUser): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
  role: roleMap[user.role] ?? "user",
  isMember: user.isMember,
  membershipLevel: user.membershipLevel,
  addresses: user.addresses ?? [],
});

const readStoredUser = (): AuthUser | null => {
  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export function useAuthState() {
  const [token, setToken] = useState<string | null>(() => window.localStorage.getItem(TOKEN_STORAGE_KEY));
  const [role, setRole] = useState<UserRole>(() => readStoredUser()?.role ?? "guest");
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState("");

  const applyUser = (nextApiUser: AuthApiUser) => {
    const nextUser = mapUser(nextApiUser);
    setUser(nextUser);
    setRole(nextUser.role);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    return nextUser;
  };

  const isLoggedIn = role !== "guest" && !!token;
  const isMember = user?.isMember ?? false;

  useEffect(() => {
    if (!token) {
      return;
    }

    void getMe(token)
      .then((me) => {
        applyUser(me);
      })
      .catch(() => {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(USER_STORAGE_KEY);
        setToken(null);
        setUser(null);
        setRole("guest");
      });
  }, [token]);

  const openAuthModal = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthError("");
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthError("");
  };

  const handleAuthSubmit = async (
    mode: AuthMode,
    draft: AuthDraft,
    setPage: (page: Page) => void,
    setMessage: (message: string) => void,
  ) => {
    const email = draft.email.trim().toLowerCase();
    const password = draft.password.trim();
    const name = draft.name.trim();

    if (!email || !password) {
      setAuthError("Email and password are required.");
      return;
    }

    if (mode === "register" && !name) {
      setAuthError("Name is required for registration.");
      return;
    }

    try {
      const authResponse =
        mode === "login"
          ? await login({ email, password })
          : await register({ name, email, password });

      const nextUser = applyUser(authResponse.user);

      setToken(authResponse.token);
      setAuthError("");
      setShowAuthModal(false);
      setPage(nextUser.role === "admin" ? "admin" : "profile");

      window.localStorage.setItem(TOKEN_STORAGE_KEY, authResponse.token);

      if (nextUser.role === "admin") {
        setMessage("Signed in successfully. Admin access is now available.");
        return;
      }

      if (nextUser.isMember) {
        setMessage("Signed in successfully. Member-only checkout is now available.");
        return;
      }

      setMessage("Signed in successfully. Standard user access is now available.");
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Authentication failed.";
      setAuthError(nextMessage);
    }
  };

  const persistProfile = async (name: string, avatarUrl: string) => {
    if (!token) {
      throw new Error("Login is required before updating your profile.");
    }

    const nextUser = await updateProfile({ name, avatarUrl }, token);
    applyUser(nextUser);
    return mapUser(nextUser);
  };

  const persistPassword = async (currentPassword: string, newPassword: string) => {
    if (!token) {
      throw new Error("Login is required before changing your password.");
    }

    return changePassword({ currentPassword, newPassword }, token);
  };

  const persistAddress = async (editingAddressId: string | null, draft: AddressDraft, fallbackName: string) => {
    if (!token) {
      throw new Error("Login is required before saving an address.");
    }

    const normalizedDraft = {
      label: draft.label.trim() || "New Address",
      recipient: draft.recipient.trim() || fallbackName,
      phone: draft.phone.trim(),
      line1: draft.line1.trim(),
      line2: draft.line2?.trim() || "",
      city: draft.city.trim(),
      region: draft.region.trim(),
      postalCode: draft.postalCode.trim(),
      isPrimary: !editingAddressId ? (user?.addresses.length ?? 0) === 0 : !!user?.addresses.find((address) => address.id === editingAddressId)?.isPrimary,
    };

    if (!normalizedDraft.line1 || !normalizedDraft.city || !normalizedDraft.region) {
      return false;
    }

    const nextUser = await saveAddress({
      id: editingAddressId ?? undefined,
      ...normalizedDraft,
    }, token);
    applyUser(nextUser);
    return true;
  };

  const removeStoredAddress = async (addressId: string) => {
    if (!token) {
      throw new Error("Login is required before removing an address.");
    }

    const nextUser = await deleteAddress(addressId, token);
    applyUser(nextUser);
  };

  const promotePrimaryAddress = async (addressId: string) => {
    if (!token) {
      throw new Error("Login is required before setting a primary address.");
    }

    const nextUser = await setPrimaryAddress(addressId, token);
    applyUser(nextUser);
  };

  const handleLogout = (setPage: (page: Page) => void, setMessage: (message: string) => void) => {
    setRole("guest");
    setUser(null);
    setToken(null);
    setPage("home");
    setShowAuthModal(false);
    setAuthError("");
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    setMessage("Signed out. Public browsing mode restored.");
  };

  return {
    token,
    role,
    user,
    authMode,
    authError,
    showAuthModal,
    isLoggedIn,
    isMember,
    setAuthMode,
    openAuthModal,
    closeAuthModal,
    handleAuthSubmit,
    handleLogout,
    updateProfile: persistProfile,
    changePassword: persistPassword,
    saveAddress: persistAddress,
    removeAddress: removeStoredAddress,
    setPrimaryAddress: promotePrimaryAddress,
  };
}
