const PRODUCT_IMAGE_CACHE = "art-community-product-images-v1";

const inFlightRequests = new Map<string, Promise<string>>();
const sessionObjectUrls = new Map<string, string>();

const isRemoteImage = (source: string) => /^https?:\/\//i.test(source);

const canUseBrowserCache = () =>
  typeof window !== "undefined" &&
  typeof window.fetch === "function" &&
  "caches" in window;

const buildObjectUrl = async (response: Response, source: string) => {
  const blob = await response.blob();

  if (blob.size === 0) {
    return source;
  }

  const existingObjectUrl = sessionObjectUrls.get(source);
  if (existingObjectUrl) {
    return existingObjectUrl;
  }

  const objectUrl = URL.createObjectURL(blob);
  sessionObjectUrls.set(source, objectUrl);
  return objectUrl;
};

const fetchAndCacheImage = async (source: string) => {
  const cache = await window.caches.open(PRODUCT_IMAGE_CACHE);
  const cachedResponse = await cache.match(source);

  if (cachedResponse) {
    return buildObjectUrl(cachedResponse, source);
  }

  const networkResponse = await fetch(source, {
    mode: "cors",
    credentials: "omit",
  });

  if (!networkResponse.ok) {
    throw new Error(`Image request failed with status ${networkResponse.status}.`);
  }

  await cache.put(source, networkResponse.clone());
  return buildObjectUrl(networkResponse, source);
};

export async function resolveCachedImageUrl(source: string) {
  if (!source || !isRemoteImage(source) || !canUseBrowserCache()) {
    return source;
  }

  const existingObjectUrl = sessionObjectUrls.get(source);
  if (existingObjectUrl) {
    return existingObjectUrl;
  }

  const activeRequest = inFlightRequests.get(source);
  if (activeRequest) {
    return activeRequest;
  }

  const request = fetchAndCacheImage(source)
    .catch(() => source)
    .finally(() => {
      inFlightRequests.delete(source);
    });

  inFlightRequests.set(source, request);
  return request;
}
