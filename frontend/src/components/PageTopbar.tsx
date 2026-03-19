import type { Page } from "../types/app";

type PageTopbarProps = {
  page: Exclude<Page, "home">;
  message: string;
};

export default function PageTopbar({ page, message }: PageTopbarProps) {
  return (
    <header className="topbar glass-card">
      <div>
        <p className="eyebrow">ART-COMMUNITY</p>
        <h1>{getPageTitle(page)}</h1>
      </div>
      <p className="topbar-message">{message}</p>
    </header>
  );
}

function getPageTitle(page: Exclude<Page, "home">) {
  switch (page) {
    case "creator":
      return "Creator Story";
    case "shop":
      return "Merch Shop";
    case "profile":
      return "Profile & Access";
  }
}
