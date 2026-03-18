// Props definition for SectionTitle component
type SectionTitleProps = {
  // Title text displayed at the top of a page section
  title: string;

  // Optional subtitle displayed under the main title
  subtitle?: string;
};

// Reusable section title component
export default function SectionTitle({
  title,
  subtitle,
}: SectionTitleProps) {
  return (
    <header className="section-title">
      <h1 className="section-title-main">{title}</h1>

      {subtitle && (
        <p className="section-title-sub">{subtitle}</p>
      )}
    </header>
  );
}

