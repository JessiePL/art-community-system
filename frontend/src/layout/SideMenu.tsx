import MenuButton from "../components/MenuButton";
import type { Page } from "../App";
import "../styles/menu.css";

type SideMenuProps = {
  page: Page;
  navigate:(page:Page)=>void;
  isAuthenticated:boolean;
  role:"member"|"admin"|null;
  onSignOut:()=>void;
  onSignIn: () => void;
};

export default function SideMenu({page,navigate,isAuthenticated,role,onSignOut,onSignIn}:SideMenuProps) {
  return (
    <nav className="side-menu">
      <MenuButton
        label="Home"
        active={page === "home"}
        onClick={() => navigate("home")}
      />
      <MenuButton
        label="About"
        active={page === "about"}
        onClick={() => navigate("about")}
      />
      <MenuButton
        label="Products"
        active={page === "products"}
        onClick={() => navigate("products")}
      />
      <MenuButton
        label="Account"
        active={page === "account"}
        onClick={() => navigate("account")}
      />
    {role === "admin"&&(
      <MenuButton
        label="Admin"
        active={page === "admin"}
        onClick={() => navigate("admin")}
      />
    )}
    <MenuButton
        label="Admin"
        active={page === "admin"}
        onClick={() => navigate("admin")}
    />
    {!isAuthenticated?(
      <>
      <MenuButton
        label="Sign In/Register"
        active={false}
        onClick={onSignIn}
      />
      </>
    ):(
      <MenuButton
        label="Sign Out"
        active={false}
        onClick={onSignOut}
      />
    )}
    </nav>
  );
}

