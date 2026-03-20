import type { CSSProperties } from "react";
import type { Page } from "../types/app";

type PageTopbarProps = {
  page: Exclude<Page, "home">;
  message: string;
};

export default function PageTopbar({ page, message }: PageTopbarProps) {
  const characterImageSrc =
    page === "creator"
      ? "/dage.png"
      : page === "shop"
        ? "/Nezuko-Cute-Chibi-Demon-Slayer-Anime-748.png"
        : page === "profile"
          ? "/693aebc11ce502fda14fda3648cbfb4d.png"
          : page === "admin"
            ? "/1f37dbee49b0b477e2f822619e0cc4d6.png"
        : null;
  const characterImageClassName =
    page === "creator"
      ? "topbar-character-peek topbar-character-peek-creator"
      : page === "profile"
        ? "topbar-character-peek topbar-character-peek-profile"
        : page === "admin"
          ? "topbar-character-peek topbar-character-peek-profile"
        : "topbar-character-peek";
  const characterFrameStyle =
    page === "shop"
      ? {
          width: "126px",
          justifyContent: "flex-start",
        }
      : page === "profile"
        ? {
            width: "124px",
            justifyContent: "flex-start",
          }
        : page === "admin"
          ? {
              width: "124px",
              justifyContent: "flex-start",
            }
      : undefined;
  const characterImageStyle =
    page === "shop"
      ? {
          width: "210px",
          maxWidth: "none",
          height: "100%",
          objectFit: "cover" as CSSProperties["objectFit"],
          objectPosition: "22% 18%" as CSSProperties["objectPosition"],
          marginRight: "0",
          marginTop: "0",
        }
      : page === "profile"
        ? {
            width: "80px",
            maxWidth: "none",
            height: "100%",
            objectFit: "cover" as CSSProperties["objectFit"],
            objectPosition: "18% 8%" as CSSProperties["objectPosition"],
            marginRight: "0",
            marginTop: "0",
          }
        : page === "admin"
          ? {
              width: "96px",
              maxWidth: "none",
              height: "100%",
              objectFit: "cover" as CSSProperties["objectFit"],
              objectPosition: "50% 12%" as CSSProperties["objectPosition"],
              marginRight: "0",
              marginTop: "0",
            }
      : undefined;

  return (
    <header className="topbar glass-card">
      <div className="topbar-primary">
        <p className="eyebrow">ART-COMMUNITY</p>
        <h1>{getPageTitle(page)}</h1>
      </div>

      <div className="topbar-secondary">
        <div className="topbar-character-aside">
          <p className="topbar-message">{message}</p>
          <div
            className="topbar-character-frame"
            aria-hidden="true"
            style={characterFrameStyle}
          >
            {characterImageSrc && (
              <img
                className={characterImageClassName}
                src={characterImageSrc}
                alt=""
                style={characterImageStyle}
              />
            )}
          </div>
        </div>
      </div>
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
      return "Profile";
    case "admin":
      return "Admin Center";
  }
}
