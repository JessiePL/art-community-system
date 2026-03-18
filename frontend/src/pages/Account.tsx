import "../styles/account.css";

const EMAIL = "jessiepl646@gmail.com";

export default function Contact() {
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      const toast = document.getElementById("copy-toast");
      if (toast) {
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 1500);
      }
    } catch (err) {
      console.error("Failed to copy email");
    }
  };

  return (
    <section className="contact-page">
      <div className="contact-grid">
        {/* Left column (2) — intentionally empty */}
        <div className="contact-left" />

        {/* Right column (5) */}
        <div className="contact-right">
          <h1 className="contact-title">Contact</h1>

          <div className="contact-icons">
            {/* Gmail */}
            <div
              className="contact-icon"
              onClick={copyEmail}
              title={EMAIL}
            >
              <img src="gmail.png" alt="Email" />
              <span className="tooltip">{EMAIL}</span>
            </div>

            {/* LinkedIn */}
            <a
              className="contact-icon"
              href="https://www.linkedin.com/in/lin-p-9462a0346/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="linkedin.png" alt="LinkedIn" />
              <span className="tooltip">Lin Pan</span>
            </a>

            {/* Twitter / X */}
            <a
              className="contact-icon"
              href="https://x.com/JessiePL0624"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="twitter.png" alt="X" />
              <span className="tooltip">@JessiePL0624</span>
            </a>

            {/* Instagram */}
            <a
              className="contact-icon"
              href="https://www.instagram.com/gdjessiepl/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="instagram.png" alt="Instagram" />
              <span className="tooltip">@gdjessiepl</span>
            </a>
          </div>

          {/* Copy feedback */}
          <div id="copy-toast">Email copied ✓</div>
        </div>
      </div>
    </section>
  );
}

