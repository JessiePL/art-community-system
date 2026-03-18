// src/pages/About.tsx
import LeavesDivider from "../components/LeavesDivider";
import "../styles/about.css";

export const techStack = [
  "Beloved, L",
  "",
  "",
];

export default function About() {
  return (
    <div className="about-page">
    <div className="about-layout">
      {/* Left image */}
      <div className="about-image">
        <img
          src="wubao.png"
          alt="profile"
        />
      </div>

      {/* Right content */}
      <div className="about-content">
        {/* Intro */}
        <section className="about-section">
          <h1>About Jae Liu</h1>
          <p className="about-intro-text">
            I’m a Computer Systems Technology student with a background in
            business analysis and automation. I enjoy building clean,
            structured systems and turning complex problems into practical
            solutions.
          </p>
        </section>

        <LeavesDivider />

        {/* Tech */}
        <section className="about-section">
          <h3>Works</h3>

          <div className="tech-grid">
            {techStack.map((tech) => (
              <div key={tech} className="tech-item">
                {tech}
              </div>
            ))}
          </div>
        </section>

        <LeavesDivider />

        {/* Education */}
        <section className="about-section">
          <h3>Education</h3>
          <div className="education-item">
            <div className="education-row">
              <div className="education-school">
                British Columbia Institute of Technology (BCIT)
              </div>
              <div className="education-year">
                2024 – 2026
              </div>
            </div>
            <div className="education-program">
              Computer Systems Technology
            </div>
          </div>
          <div className="education-item">
            <div className="education-row">
              <div className="education-school">
                British Columbia Institute of Technology (BCIT)
              </div>
              <div className="education-year">
                2023 – 2025
              </div>
            </div>
            <div className="education-program">
              Computer Systems Technology
            </div>
          </div>
          <div className="education-item">
            <div className="education-row">
              <div className="education-school">
                British Columbia Institute of Technology (BCIT)
              </div>
              <div className="education-year">
                2023 – 2025
              </div>
            </div>
            <div className="education-program">
              Computer Systems Technology
            </div>
          </div>
        </section>
      </div>
    </div>
</div>
  );
}

