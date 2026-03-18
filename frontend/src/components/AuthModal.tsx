import { useState } from "react";
import "../styles/authModal.css";

type AuthModalProps = {
  onClose: () => void;
  onLoginSuccess?: (role: "admin" | "member") => void;
};

type AuthMode = "login" | "register";

export default function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "login") {
      const role = email.includes("admin") ? "admin" : "member";
      onLoginSuccess?.(role);
      onClose();
    } else {
      alert("Account created successfully. Please sign in.");
      setMode("login");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{mode === "login" ? "Sign In" : "Create Account"}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="primary-btn">
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="modal-switch">
          {mode === "login" ? (
            <>
              Don’t have an account?
              <button onClick={() => setMode("register")}>
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?
              <button onClick={() => setMode("login")}>
                Sign in
              </button>
            </>
          )}
        </div>

        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}

