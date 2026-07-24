import { onMounted, onUnmounted, ref } from "vue";

// Narrow-desktop/tablet band: below md (768px) the sidebar is an off-canvas
// overlay instead of a rail, so auto-collapse only needs to cover the range
// where a persistent rail is still shown but space is tight.
const NARROW_RAIL_QUERY = "(min-width: 768px) and (max-width: 1024px)";

/**
 * Mirrors mfex-shell's useAutoCollapse: the collapsed ref tracks the
 * narrow-rail media query on mount and whenever a resize crosses the
 * breakpoint, but a manual toggle() call in between crossings is left
 * alone — the query only updates state exactly at a crossing, not on
 * every resize tick.
 */
export function useAutoCollapse() {
  const collapsed = ref(
    typeof window !== "undefined" && window.matchMedia(NARROW_RAIL_QUERY).matches,
  );

  let mql: MediaQueryList | undefined;
  function handleChange(event: MediaQueryListEvent) {
    collapsed.value = event.matches;
  }

  onMounted(() => {
    mql = window.matchMedia(NARROW_RAIL_QUERY);
    mql.addEventListener("change", handleChange);
  });

  onUnmounted(() => {
    mql?.removeEventListener("change", handleChange);
  });

  function toggle() {
    collapsed.value = !collapsed.value;
  }

  return { collapsed, toggle };
}
