import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for handling pointer events and routing them to edges
 * Extracts complex pointer/edge routing logic from node components
 */
export function useEdgePointerRouting() {
  const pointerStateRef = useRef({
    active: false,
    wrapper: null,
    pointerId: null,
    previousValue: "",
    capturedTarget: null,
  });

  const lastFrameRef = useRef(0);
  const rafRef = useRef(null);

  const endPointerPassThrough = useCallback(() => {
    const state = pointerStateRef.current;
    if (state.capturedTarget && typeof state.pointerId === "number" && state.pointerId >= 0) {
      state.capturedTarget.releasePointerCapture?.(state.pointerId);
    }
    if (!state.active || !state.wrapper) {
      state.capturedTarget = null;
      state.pointerId = null;
      return;
    }
    state.wrapper.style.pointerEvents = state.previousValue;
    state.active = false;
    state.capturedTarget = null;
    state.wrapper = null;
    state.pointerId = null;
    state.previousValue = "";
  }, []);

  // Global pointer end handlers
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleGlobalPointerEnd = (event) => {
      if (pointerStateRef.current.pointerId === (event.pointerId ?? "mouse")) {
        endPointerPassThrough();
      }
    };
    window.addEventListener("pointerup", handleGlobalPointerEnd, true);
    window.addEventListener("pointercancel", handleGlobalPointerEnd, true);
    return () => {
      window.removeEventListener("pointerup", handleGlobalPointerEnd, true);
      window.removeEventListener("pointercancel", handleGlobalPointerEnd, true);
      // Cancel any pending RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [endPointerPassThrough]);

  /**
   * Determines if an event should be routed to edges
   * Returns true when we SHOULD route the event through
   */
  const shouldRouteEvent = useCallback((event, wrapper) => {
    if (!wrapper) return false;
    const target = event.target;
    if (!(target instanceof Element)) return false;

    // Allow drag handles & interactive elements to keep their events
    if (target.closest('.drag-handle')) return false;
    if (target.closest('.react-flow__handle')) return false;
    if (target.closest("[data-group-interactive='true']")) return false;

    const nodeWrapper = target.closest('.react-flow__node');
    if (nodeWrapper && nodeWrapper !== wrapper) {
      // Allow service nodes to handle their own drag
      if (nodeWrapper.classList.contains('react-flow__node-service')) return false;
    }

    // Check if we're on a service node
    const serviceNode = target.closest('.react-flow__node-service');
    if (serviceNode) return false;

    // Check if we're on the drag handle
    const dragHandle = target.closest('.drag-handle');
    if (dragHandle) return false;

    // Don't interfere during active dragging (primary button pressed)
    if (event.buttons === 1 && (event.type === 'pointermove' || event.type === 'mousemove')) {
      return false;
    }

    // Don't interfere with pointerdown on drag handle or service nodes
    if (event.type === 'pointerdown' || event.type === 'mousedown') {
      const isDragHandle = target.closest('.drag-handle');
      const isServiceNode = target.closest('.react-flow__node-service');
      if (isDragHandle || isServiceNode) return false;
    }

    return true;
  }, []);

  /**
   * Routes pointer events to underlying edge elements
   */
  const routeEventToEdge = useCallback((event, wrapper) => {
    if (typeof window === "undefined" || typeof document === "undefined" || !wrapper) {
      return false;
    }

    const state = pointerStateRef.current;

    const previous = wrapper.style.pointerEvents;
    wrapper.style.pointerEvents = "none";
    const underlying = document.elementFromPoint(event.clientX, event.clientY);
    wrapper.style.pointerEvents = previous;

    if (!underlying) return false;

    const updater = underlying.closest(".react-flow__edgeupdater");
    const targetEdge = updater || underlying.closest(".react-flow__edge");

    if (!targetEdge) {
      wrapper.style.cursor = "";
      return false;
    }

    const cursor = window.getComputedStyle(targetEdge).cursor;
    wrapper.style.cursor = cursor && cursor !== "auto" ? cursor : "pointer";

    const supportsPointerEvent =
      typeof window.PointerEvent !== "undefined" &&
      event instanceof window.PointerEvent;

    const eventInit = {
      bubbles: true,
      cancelable: true,
      clientX: event.clientX,
      clientY: event.clientY,
      buttons: event.buttons ?? 0,
      button: event.button ?? 0,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
    };

    if (supportsPointerEvent) {
      eventInit.pointerId = event.pointerId ?? 1;
      eventInit.pointerType = event.pointerType ?? "mouse";
      eventInit.isPrimary = event.isPrimary ?? true;
      eventInit.width = event.width ?? 1;
      eventInit.height = event.height ?? 1;
      eventInit.pressure = event.pressure ?? 0.5;
    }

    const eventType = event.type;
    let synthetic;

    if (supportsPointerEvent && eventType.startsWith("pointer")) {
      synthetic = new PointerEvent(eventType, eventInit);
    } else {
      synthetic = new MouseEvent(eventType, eventInit);
    }

    targetEdge.dispatchEvent(synthetic);

    // Handle pointer capture for drag operations
    if (eventType === "pointerdown") {
      state.active = true;
      state.wrapper = wrapper;
      state.previousValue = previous;
      state.pointerId = event.pointerId ?? "mouse";
      state.capturedTarget = event.target;
      event.target?.setPointerCapture?.(state.pointerId);
    }

    return true;
  }, []);

  /**
   * Throttled version of routeEventToEdge using RAF
   */
  const routeEventToEdgeThrottled = useCallback((event, wrapper) => {
    // For non-move events, process immediately
    if (event.type !== 'pointermove' && event.type !== 'mousemove') {
      return routeEventToEdge(event, wrapper);
    }

    // Throttle move events to ~60fps
    const now = performance.now();
    if (now - lastFrameRef.current < 16) return false;
    lastFrameRef.current = now;

    return routeEventToEdge(event, wrapper);
  }, [routeEventToEdge]);

  /**
   * Main pointer event handler - combines shouldRouteEvent check with routing
   */
  const handlePointerEvent = useCallback((event, wrapper) => {
    if (!shouldRouteEvent(event, wrapper)) return;

    const handled = routeEventToEdgeThrottled(event, wrapper);
    if (!handled && wrapper) {
      wrapper.style.cursor = "";
    }
    if (event.type === "pointerup" || event.type === "pointerleave") {
      endPointerPassThrough();
    }
  }, [shouldRouteEvent, routeEventToEdgeThrottled, endPointerPassThrough]);

  return {
    handlePointerEvent,
    routeEventToEdge: routeEventToEdgeThrottled,
    endPointerPassThrough,
    shouldRouteEvent,
    pointerStateRef,
  };
}

export default useEdgePointerRouting;
