import { useEffect, useMemo, useState } from "react";
import { resolveCachedImageUrl } from "../services/imageCache";

export function useCachedImageUrls(imageSources: string[]) {
  const [resolvedSources, setResolvedSources] = useState<Record<string, string>>({});
  const sourceKey = imageSources.join("||");

  const uniqueSources = useMemo(
    () => Array.from(new Set(imageSources.filter(Boolean))),
    [sourceKey],
  );

  useEffect(() => {
    let isActive = true;

    uniqueSources.forEach((source) => {
      void resolveCachedImageUrl(source).then((resolvedSource) => {
        if (!isActive) {
          return;
        }

        setResolvedSources((current) =>
          current[source] === resolvedSource
            ? current
            : {
                ...current,
                [source]: resolvedSource,
              },
        );
      });
    });

    return () => {
      isActive = false;
    };
  }, [uniqueSources]);

  return (source: string) => resolvedSources[source] ?? source;
}
