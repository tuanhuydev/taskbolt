import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";
import { useElementSize } from "@/shared/composables/useElementSize";

let observeCallback: ResizeObserverCallback | null = null;
let disconnectSpy: ReturnType<typeof vi.fn>;

class MockResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    observeCallback = callback;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = disconnectSpy;
}

function TestComponent(initial?: { width: number; height: number }) {
  return defineComponent({
    setup() {
      const el = ref<HTMLElement | null>(null);
      const { width, height } = useElementSize(el, initial);
      return () => h("div", { ref: el }, `${width.value}x${height.value}`);
    },
  });
}

describe("useElementSize", () => {
  beforeEach(() => {
    observeCallback = null;
    disconnectSpy = vi.fn();
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("seeds width/height with the default before any measurement", () => {
    const wrapper = mount(TestComponent());
    expect(wrapper.text()).toBe("300x150");
  });

  it("seeds width/height with a custom initial size", () => {
    const wrapper = mount(TestComponent({ width: 500, height: 200 }));
    expect(wrapper.text()).toBe("500x200");
  });

  it("updates when ResizeObserver reports a new content box size", async () => {
    const wrapper = mount(TestComponent());

    observeCallback?.(
      [
        {
          contentBoxSize: [{ inlineSize: 640, blockSize: 320 }],
          contentRect: { width: 640, height: 320 },
        } as unknown as ResizeObserverEntry,
      ],
      {} as ResizeObserver,
    );
    await nextTick();

    expect(wrapper.text()).toBe("640x320");
  });

  it("falls back to contentRect when contentBoxSize is unavailable", async () => {
    const wrapper = mount(TestComponent());

    observeCallback?.(
      [
        {
          contentBoxSize: undefined,
          contentRect: { width: 420, height: 210 },
        } as unknown as ResizeObserverEntry,
      ],
      {} as ResizeObserver,
    );
    await nextTick();

    expect(wrapper.text()).toBe("420x210");
  });

  it("ignores a zero-size report (keeps the last known dimensions)", async () => {
    const wrapper = mount(TestComponent());

    observeCallback?.(
      [
        {
          contentBoxSize: [{ inlineSize: 0, blockSize: 0 }],
          contentRect: { width: 0, height: 0 },
        } as unknown as ResizeObserverEntry,
      ],
      {} as ResizeObserver,
    );
    await nextTick();

    expect(wrapper.text()).toBe("300x150");
  });

  it("disconnects the observer on unmount", () => {
    const wrapper = mount(TestComponent());
    wrapper.unmount();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
