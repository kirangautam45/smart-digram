import { Position } from '@xyflow/react';

/**
 * Handle positions for nodes - used by both GroupNode and ServiceNode
 */
export const HANDLE_POSITIONS = [
  { position: Position.Top, id: 'top' },
  { position: Position.Bottom, id: 'bottom' },
  { position: Position.Left, id: 'left' },
  { position: Position.Right, id: 'right' },
];

/**
 * Default text sizes for nodes
 */
export const DEFAULT_TEXT_SIZES = {
  group: {
    typeFontSize: "14px",
    labelFontSize: "20px",
    nodeFontSize: "12px",
    handleSize: 10,
  },
  service: {
    iconSize: 64,
    providerFontSize: "10px",
    typeFontSize: "11px",
    labelFontSize: "14px",
    nodeFontSize: "12px",
    handleSize: 8,
  },
};

/**
 * Default handle style
 */
export const DEFAULT_HANDLE_STYLE = {
  background: "#667eea",
  pointerEvents: "auto",
  transition: "opacity 0.2s",
};

/**
 * Creates handle style based on visibility state
 */
export const createHandleStyle = (isVisible, size = 10, color = "#667eea") => ({
  background: color,
  width: size,
  height: size,
  pointerEvents: "auto",
  opacity: isVisible ? 1 : 0,
  transition: "opacity 0.2s",
  border: "1px solid white",
});

/**
 * Default node dimensions
 */
export const DEFAULT_DIMENSIONS = {
  group: {
    minWidth: 180,
    minHeight: 140,
    defaultWidth: 600,
    defaultHeight: 400,
  },
  service: {
    minWidth: 180,
    minHeight: 100,
    defaultWidth: 180,
    defaultHeight: 100,
  },
};

/**
 * Event types for pointer routing
 */
export const CAPTURE_EVENTS = [
  "pointerover",
  "pointerout",
  "pointerenter",
  "pointerleave",
];

export const BUBBLE_EVENTS = [
  "pointerdown",
  "pointermove",
  "pointerup",
  "mousedown",
  "mousemove",
  "mouseup",
  "click",
];
