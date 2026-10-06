export function loadExportMediaElement<
  T extends HTMLImageElement | HTMLMediaElement,
>(element: T, url: string, checkIsCancelled: () => boolean): Promise<T> {
  return new Promise((resolve, reject) => {
    const event = element instanceof HTMLImageElement ? "load" : "loadeddata";
    const cleanup = () => {
      clearTimeout(timeout);
      clearInterval(cancellation);
      element.removeEventListener(event, loaded);
      element.removeEventListener("error", failed);
    };
    const loaded = () => {
      cleanup();
      resolve(element);
    };
    const failed = () => {
      cleanup();
      reject(
        new Error(
          "A media file could not be loaded for export. Check the file and try again.",
        ),
      );
    };
    const timeout = setTimeout(failed, 30_000);
    const cancellation = setInterval(() => {
      if (checkIsCancelled()) {
        cleanup();
        element.src = "";
        reject(new Error("EXPORT_CANCELLED"));
      }
    }, 100);
    element.addEventListener(event, loaded, { once: true });
    element.addEventListener("error", failed, { once: true });
    element.src = url;
  });
}
