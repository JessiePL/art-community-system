// Props definition for MenuButton component
type MenuButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

// Reusable menu button component
export default function MenuButton({
  label,
  active,
  onClick,
}: MenuButtonProps) {
  return (
    <button
      // Apply active style when this menu item is selected
      className={active ? "menu-btn active" : "menu-btn"}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

