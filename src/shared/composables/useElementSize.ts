import { onBeforeUnmount, onMounted, ref, type Ref } from "vue";

/**
 * Tracks an element's rendered pixel size via ResizeObserver, so charts can
 * render their SVG at true pixel dimensions instead of scaling a fixed
 * viewBox with preserveAspectRatio="none" — the latter stretches strokes,
 * circles, and text non-uniformly as the container's aspect ratio changes.
 *
 * Seeds width/height with `initial` so callers render something reasonable
 * immediately (before the first ResizeObserver callback fires) rather than
 * a blank 0x0 element — also keeps this usable in environments without a
 * real layout engine, e.g. component tests.
 */
export function useElementSize(
  target: Ref<HTMLElement | null>,
  initial: { width: number; height: number } = { width: 300, height: 150 },
) {
  const width = ref(initial.width);
  const height = ref(initial.height);

  let observer: ResizeObserver | null = null;

  onMounted(() => {
    if (!target.value || typeof ResizeObserver === "undefined") return;
    observer = new ResizeObserver(([entry]) => {
      const box = entry.contentBoxSize?.[0];
      const w = box ? box.inlineSize : entry.contentRect.width;
      const h = box ? box.blockSize : entry.contentRect.height;
      if (w > 0) width.value = w;
      if (h > 0) height.value = h;
    });
    observer.observe(target.value);
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
  });

  return { width, height };
}
