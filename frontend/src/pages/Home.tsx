import "../styles/home.css";
import TypingText from "../components/TypingText.tsx";

const codeTexts = [
  "L IS MORE THAN A LETTER",
  "L FOR LIAR",
  "L FOR LOST",
  "IT ALL BEGINS WITH THE FIRST TOUCH",
  ];


export default function Home() {
  return (
    <div className="home">
      <div className="home-split">
        {/* Left: Image */}
        <div className="home-image">
          <img src="/DearL.png" alt="DearL" />
        </div>

        {/* Right: Content */}
        <div className="home-content">
            <TypingText texts={codeTexts} speed={100} pause={2000}/>
        </div>
      </div>
    </div>
  );
}

