import { useState } from "react";
import "../styles/admin.css";


export default function Projects() {
  // Active tech toggles
  const [openTechs, setOpenTechs] = useState<string[]>([]);

  // Toggle a single tech (left column)
  const toggleTech = (tech: string) => {
    setOpenTechs((prev) =>
      prev.includes(tech)
        ? prev.filter((t) => t !== tech)
        : [...prev, tech]
    );
  };

  // Toggle a whole section (right column header)
  const toggleSection = (techs: string[]) => {
    setOpenTechs((prev) => {
      const isOpen = techs.some((t) => prev.includes(t));

      if (isOpen) {
        // close section
        return prev.filter((t) => !techs.includes(t));
      } else {
        // open section
        const next = [...prev];
        techs.forEach((t) => {
          if (!next.includes(t)) next.push(t);
        });
        return next;
      }
    });
  };

  return (
    <div className="projects-page">
      <div className="projects-grid">
        {/* ===== Left column: Tech ===== */}
        <aside className="projects-left">
          <h3 className="tech-title">Tech</h3>

          <div className="tech-grid">
          {techStack.map((tech) => (
            <button
              key={tech}
              className={`tech-selections ${
                openTechs.includes(tech) ? "active" : ""
              }`}
              onClick={() => toggleTech(tech)}
            >
              {tech}
            </button>
          ))}
        </div>
        </aside>

        {/* ===== Right column: Projects ===== */}
        <main className="projects-right">
          <h1>Projects</h1>

          {projectSections.map((section) => {
            const isOpen = section.techs.some((t) =>
              openTechs.includes(t)
            );

            return (
              <section
                key={section.title}
                className="project-section"
              >
                <div
                  className="project-section-header"
                  onClick={() => toggleSection(section.techs)}
                >
                  <h3>{section.title}</h3>
                  <span className="section-indicator">
                    {isOpen ? "▾" : "▸"}
                  </span>
                </div>
        {isOpen && (
              <div className="project-list">
          {section.projects.map((project) => (
            <div
              key={project.name}
              className="project-item"
            >
              <h4>{project.name}</h4>

              <p>
                <strong>User Persona:</strong>{" "}
                {project.userPersona}
              </p>

              <p>
                <strong>Solved Problem:</strong>{" "}
                {project.solvedProblem}
              </p>

              {project.links?.web && (
                <p>
                  <strong>Web:</strong>{" "}
                  <a
                    href={project.links.web}
                    target="_blank"
                    rel="noreferrer"
                  >
                    link
                  </a>
                </p>
              )}
              {project.links?.github && (
                <p>
                  <strong>Github:</strong>{" "}
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                   sourceCode 
                  </a>
                </p>
              )}
              {project.links?.youtube && (
                <p>
                  <strong>Youtube:</strong>{" "}
                  <a
                    href={project.links.youtube}
                    target="_blank"
                    rel="noreferrer"
                  >
                    introduction
                  </a>
                </p>
              )}

              <p>
                <strong>Description:</strong>{" "}
                {project.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}

