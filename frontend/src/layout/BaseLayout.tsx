import SideMenu from "./SideMenu";
import type { Page } from "../App";
import "../styles/layout.css";

type BaseLayoutProps = {
  children: React.ReactNode;
  page: Page;
  navigate: (page: Page) => void;
  isAuthenticated: boolean;
  role: "member" | "admin" | null;
  onSignOut: () => void;
  onSignIn:()=>void;
};

export default function BaseLayout({
  children,
  page,
  navigate,
  isAuthenticated,
  role,
  onSignOut,
  onSignIn,
}: BaseLayoutProps) {
  return (
    <div className="layout">
      {/* Mobile menu (top) */}
      <header className="layout-header">
        <SideMenu
          page={page}
          navigate={navigate}
          isAuthenticated={isAuthenticated}
          role={role}
          onSignOut={onSignOut}
          onSignIn={onSignIn}
        />
      </header>

      {/* Main content */}
      <main className="layout-main">
        {children}
      </main>

      {/* Desktop menu (right) */}
      <aside className="layout-aside">
        <SideMenu
          page={page}
          navigate={navigate}
          isAuthenticated={isAuthenticated}
          role={role}
          onSignOut={onSignOut}
          onSignIn={onSignIn}
        />
      </aside>
    </div>
  );
}

