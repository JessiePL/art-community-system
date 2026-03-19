import type { PropsWithChildren, ReactNode } from "react";
import type { Page } from "../types/app";

type NavItem = {
  id: Page;
  label: string;
};

type AppLayoutProps = PropsWithChildren<{
  page: Page;
  isLoggedIn: boolean;
  navItems: NavItem[];
  onNavigate: (page: Page) => void;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  topbar?: ReactNode;
}>;

export default function AppLayout({
  children,
  page,
  isLoggedIn,
  navItems,
  onNavigate,
  onLogin,
  onRegister,
  onLogout,
  topbar,
}: AppLayoutProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar glass-card">
        <div className="brand-mark">
          <p className="eyebrow">ACS</p>
          <h2>Demon Slayer Art Community</h2>
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
            </button>
          ))}

          {isLoggedIn ? (
            <>
              <button
                className={page === "profile" ? "nav-link active" : "nav-link"}
                onClick={() => onNavigate("profile")}
              >
                Profile
              </button>
              <button className="nav-link auth-link" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="nav-link auth-link" onClick={onLogin}>
                Login
              </button>
              <button className="nav-link auth-link" onClick={onRegister}>
                Register
              </button>
            </>
          )}
        </nav>
      </aside>

      <main className={page === "home" ? "main-panel home-panel" : "main-panel"}>
        {page !== "home" && topbar}
        {children}
      </main>
    </div>
  );
}
