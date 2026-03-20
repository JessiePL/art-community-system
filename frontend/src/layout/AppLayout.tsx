import { useEffect, useState, type FormEvent, type PropsWithChildren, type ReactNode } from "react";
import type { AuthMode, Page, UserRole } from "../types/app";

type NavItem = {
  id: "home" | "creator" | "shop";
  label: string;
};

type AuthDraft = {
  name: string;
  email: string;
  password: string;
};

type AppLayoutProps = PropsWithChildren<{
  page: Page;
  isLoggedIn: boolean;
  role: UserRole;
  navItems: NavItem[];
  authMode: AuthMode;
  authError: string;
  onNavigate: (page: Page) => void;
  onOpenAuth: (mode: AuthMode) => void;
  onCloseAuth: () => void;
  onSubmitAuth: (mode: AuthMode, draft: AuthDraft) => void;
  onSwitchAuthMode: (mode: AuthMode) => void;
  onLogout: () => void;
  showAuthModal: boolean;
  topbar?: ReactNode;
}>;

const emptyDraft: AuthDraft = {
  name: "",
  email: "",
  password: "",
};

export default function AppLayout({
  children,
  page,
  isLoggedIn,
  role,
  navItems,
  authMode,
  authError,
  onNavigate,
  onOpenAuth,
  onCloseAuth,
  onSubmitAuth,
  onSwitchAuthMode,
  onLogout,
  showAuthModal,
  topbar,
}: AppLayoutProps) {
  const [draft, setDraft] = useState<AuthDraft>(emptyDraft);

  useEffect(() => {
    if (showAuthModal) {
      setDraft(emptyDraft);
    }
  }, [showAuthModal, authMode]);

  const title = authMode === "login" ? "Login to ACS" : "Register for ACS";
  const description =
    authMode === "login"
      ? "Enter your email and password. The system will infer your access level from the email."
      : "Create an account with your name, email, and password. Email decides whether you are fan, member, or admin.";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmitAuth(authMode, draft);
  };

  return (
    <>
      <div className="wisteria-canopy" aria-hidden="true" />

      <div className="app-shell">
        <aside className="sidebar glass-card">
          <div className="brand-mark">
            <p className="eyebrow">ACS</p>
            <div className="brand-logo-frame">
              <img
                className="brand-logo"
                src="/Demon-Slayer-Emblem.png"
                alt="Demon Slayer Art Community"
              />
            </div>
            <p className="muted-copy">
              Visual showcase, creator storytelling, and merch in one focused system.
            </p>
          </div>

          <nav className="nav-stack">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={page === item.id ? "nav-link active" : "nav-link"}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
                <img
                  className={page === item.id ? "nav-crow is-visible" : "nav-crow"}
                  src="/—Pngtree—black silhouette of a crow_5048315.png"
                  alt=""
                  aria-hidden="true"
                />
              </button>
            ))}

            {isLoggedIn ? (
              <>
                <button
                  className={page === (role === "admin" ? "admin" : "profile") ? "nav-link active" : "nav-link"}
                  onClick={() => onNavigate(role === "admin" ? "admin" : "profile")}
                >
                  {role === "admin" ? "Admin" : "Profile"}
                  <img
                    className={
                      page === (role === "admin" ? "admin" : "profile")
                        ? "nav-crow is-visible"
                        : "nav-crow"
                    }
                    src="/—Pngtree—black silhouette of a crow_5048315.png"
                    alt=""
                    aria-hidden="true"
                  />
                </button>
                <button className="nav-link auth-link" onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : (
              <button className="nav-link auth-link" onClick={() => onOpenAuth("login")}>
                Login / Register
              </button>
            )}
          </nav>

          <div className="sidebar-socials" aria-label="Social links">
            <button className="sidebar-social-button" type="button" aria-label="Instagram">
              <img src="/instagram.png" alt="" />
            </button>
            <button className="sidebar-social-button" type="button" aria-label="LinkedIn">
              <img src="/linkedin.png" alt="" />
            </button>
            <button className="sidebar-social-button" type="button" aria-label="Gmail">
              <img src="/gmail.png" alt="" />
            </button>
            <button className="sidebar-social-button" type="button" aria-label="Twitter">
              <img src="/twitter.png" alt="" />
            </button>
          </div>

          <p className="sidebar-copyright">&copy; copyright JessiePL</p>
        </aside>

        <main className={page === "home" ? "main-panel home-panel" : "main-panel"}>
          {page !== "home" && topbar}
          {children}
        </main>
      </div>

      {showAuthModal ? (
        <div className="auth-modal-backdrop" onClick={onCloseAuth}>
          <section
            className="auth-modal glass-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="auth-modal-header">
              <div>
                <p className="eyebrow">Access</p>
                <h3>{title}</h3>
                <p className="muted-copy">{description}</p>
              </div>
              <button className="ghost-button auth-close-button" onClick={onCloseAuth}>
                Close
              </button>
            </div>

            <div className="auth-mode-switcher">
              <button
                className={authMode === "login" ? "filter-chip active" : "filter-chip"}
                onClick={() => onSwitchAuthMode("login")}
              >
                Login
              </button>
              <button
                className={authMode === "register" ? "filter-chip active" : "filter-chip"}
                onClick={() => onSwitchAuthMode("register")}
              >
                Register
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {authMode === "register" ? (
                <label className="auth-field">
                  <span>Name</span>
                  <input
                    value={draft.name}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Enter your display name"
                  />
                </label>
              ) : null}

              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  value={draft.email}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="name@member.acs.com"
                />
              </label>

              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  value={draft.password}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="Enter your password"
                />
              </label>

              {authError ? <p className="auth-error">{authError}</p> : null}

              <div className="auth-actions">
                <button type="submit" className="primary-button">
                  {authMode === "login" ? "Continue" : "Create Account"}
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => onSwitchAuthMode(authMode === "login" ? "register" : "login")}
                >
                  {authMode === "login" ? "Need to register?" : "Already have an account?"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
