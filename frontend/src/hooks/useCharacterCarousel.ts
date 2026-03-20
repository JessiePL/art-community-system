import { useEffect, useRef, useState } from "react";
import type { CharacterProfile, Page } from "../types/app";

type UseCharacterCarouselArgs = {
  page: Page;
  onStatusChange: (message: string) => void;
};

export function useCharacterCarousel({
  page,
  onStatusChange,
}: UseCharacterCarouselArgs) {
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [selectedRenderIndex, setSelectedRenderIndex] = useState<number | null>(
    null,
  );
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [effectBurstKey, setEffectBurstKey] = useState(0);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const manualScrollTimeoutRef = useRef<number | null>(null);
  const isManualScrollingRef = useRef(false);

  const loopCharacters =
    characters.length > 0 ? [...characters, ...characters, ...characters] : [];

  useEffect(() => {
    let isMounted = true;

    fetch("/data/character-gallery.json")
      .then((response) => response.json())
      .then((data: CharacterProfile[]) => {
        if (!isMounted) {
          return;
        }

        setCharacters(data);
        setSelectedCharacterId(data[0]?.id ?? "");
        setSelectedRenderIndex(data.length > 0 ? data.length : 0);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        onStatusChange("Character gallery data could not be loaded.");
      });

    return () => {
      isMounted = false;
    };
  }, [onStatusChange]);

  useEffect(() => {
    const strip = stripRef.current;

    if (!strip || characters.length === 0) {
      return;
    }

    const loopWidth = strip.scrollWidth / 3;
    strip.scrollLeft = loopWidth;
  }, [characters.length]);

  useEffect(() => {
    if (page !== "home" || isCarouselPaused || characters.length === 0) {
      return;
    }

    let frameId = 0;
    let lastTimestamp = 0;

    const animate = (timestamp: number) => {
      const strip = stripRef.current;

      if (!strip) {
        return;
      }

      if (isManualScrollingRef.current) {
        frameId = window.requestAnimationFrame(animate);
        return;
      }

      if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
      }

      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      const loopWidth = strip.scrollWidth / 3;
      const speed = 0.055;

      strip.scrollLeft += delta * speed;

      if (strip.scrollLeft >= loopWidth * 2) {
        strip.scrollLeft -= loopWidth;
      }

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, [characters, isCarouselPaused, page]);

  useEffect(() => {
    if (
      !isCarouselPaused ||
      !selectedCharacterId ||
      selectedRenderIndex === null ||
      !stripRef.current
    ) {
      return;
    }

    const scrollToCurrent = () => {
      const strip = stripRef.current;
      const currentCard = strip?.querySelector<HTMLElement>(
        `[data-render-index="${selectedRenderIndex}"]`,
      );

      if (!strip || !currentCard) {
        return;
      }

      const leftInset = 36;
      const targetLeft = currentCard.offsetLeft - leftInset;

      strip.scrollTo({
        left: Math.max(targetLeft, 0),
        behavior: "smooth",
      });
    };

    scrollToCurrent();
    const firstFrame = window.requestAnimationFrame(scrollToCurrent);
    const secondFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToCurrent);
    });
    const timeout = window.setTimeout(scrollToCurrent, 220);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(timeout);
    };
  }, [isCarouselPaused, selectedCharacterId, selectedRenderIndex]);

  useEffect(() => {
    return () => {
      if (manualScrollTimeoutRef.current !== null) {
        window.clearTimeout(manualScrollTimeoutRef.current);
      }
    };
  }, []);

  const handleCharacterSelect = (characterId: string, renderIndex: number) => {
    if (
      selectedCharacterId === characterId &&
      selectedRenderIndex === renderIndex &&
      isCarouselPaused
    ) {
      setIsCarouselPaused(false);
      onStatusChange("Character card collapsed. Carousel motion resumed.");
      return;
    }

    setSelectedCharacterId(characterId);
    setSelectedRenderIndex(renderIndex);
    setIsCarouselPaused(true);
    setEffectBurstKey((current) => current + 1);
    onStatusChange("Welcome in. Take a look around and enjoy the character spotlight.");
  };

  const scrollGallery = (direction: "left" | "right") => {
    const strip = stripRef.current;

    if (!strip) {
      return;
    }

    const distance = Math.max(strip.clientWidth * 0.42, 260);
    const loopWidth = strip.scrollWidth / 3;
    let baseLeft = strip.scrollLeft;

    if (direction === "right" && baseLeft >= loopWidth * 2 - distance) {
      baseLeft -= loopWidth;
      strip.scrollLeft = baseLeft;
    }

    if (direction === "left" && baseLeft <= loopWidth + distance) {
      baseLeft += loopWidth;
      strip.scrollLeft = baseLeft;
    }

    let left = direction === "right" ? baseLeft + distance : baseLeft - distance;

    while (left >= loopWidth * 2) {
      left -= loopWidth;
    }

    while (left < loopWidth) {
      left += loopWidth;
    }

    isManualScrollingRef.current = true;

    if (manualScrollTimeoutRef.current !== null) {
      window.clearTimeout(manualScrollTimeoutRef.current);
    }

    strip.scrollTo({
      left,
      behavior: "smooth",
    });

    manualScrollTimeoutRef.current = window.setTimeout(() => {
      isManualScrollingRef.current = false;
      manualScrollTimeoutRef.current = null;
    }, 420);
  };

  return {
    isCarouselPaused,
    loopCharacters,
    effectBurstKey,
    selectedCharacterId,
    selectedRenderIndex,
    stripRef,
    handleCharacterSelect,
    scrollGallery,
  };
}
