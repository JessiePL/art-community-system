import { useEffect,useRef, useState } from "react";

type TypingTextProps = {
  texts: string[];
  speed?: number;
  pause?: number;
};

export default function TypingText({
  texts,
  speed = 60,
  pause = 1500,
}: TypingTextProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");

  const timeoutRef = useRef<number | null>(null);
  const currentText = texts[textIndex];

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (charIndex < currentText.length) {
      timeoutRef.current = window.setTimeout(() => {
        setDisplayed((prev) => prev + currentText[charIndex]);
        setCharIndex((i) => i + 1);
      }, speed);
    } else {
      timeoutRef.current = window.setTimeout(() => {
        setDisplayed("");
        setCharIndex(0);
        setTextIndex((i) => (i + 1) % texts.length);
      }, pause);
    }

    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, [charIndex, textIndex, currentText, speed, pause, texts.length]);

  return <pre className="home-code">{displayed}</pre>;
}



