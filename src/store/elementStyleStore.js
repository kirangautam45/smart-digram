// Zustand store for individual element (node/edge) styling with localStorage persistence

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useElementStyleStore = create(
  persist(
    (set, get) => ({
      // Store for individual node styles
      // Key format: "diagramType:nodeId"
      nodeStyles: {},

      // Store for individual edge styles
      // Key format: "diagramType:edgeId"
      edgeStyles: {},

      // Set style for a specific node
      setNodeStyle: (diagramType, nodeId, styles) =>
        set((state) => ({
          nodeStyles: {
            ...state.nodeStyles,
            [`${diagramType}:${nodeId}`]: {
              ...state.nodeStyles[`${diagramType}:${nodeId}`],
              ...styles,
            },
          },
        })),

      // Get style for a specific node
      getNodeStyle: (diagramType, nodeId) => {
        const state = get();
        return state.nodeStyles[`${diagramType}:${nodeId}`] || {};
      },

      // Set style for a specific edge
      setEdgeStyle: (diagramType, edgeId, styles) =>
        set((state) => ({
          edgeStyles: {
            ...state.edgeStyles,
            [`${diagramType}:${edgeId}`]: {
              ...state.edgeStyles[`${diagramType}:${edgeId}`],
              ...styles,
            },
          },
        })),

      // Get style for a specific edge
      getEdgeStyle: (diagramType, edgeId) => {
        const state = get();
        return state.edgeStyles[`${diagramType}:${edgeId}`] || {};
      },

      // Remove node style
      removeNodeStyle: (diagramType, nodeId) =>
        set((state) => {
          const newNodeStyles = { ...state.nodeStyles };
          delete newNodeStyles[`${diagramType}:${nodeId}`];
          return { nodeStyles: newNodeStyles };
        }),

      // Remove edge style
      removeEdgeStyle: (diagramType, edgeId) =>
        set((state) => {
          const newEdgeStyles = { ...state.edgeStyles };
          delete newEdgeStyles[`${diagramType}:${edgeId}`];
          return { edgeStyles: newEdgeStyles };
        }),

      // Clear all styles for a specific diagram type
      clearDiagramStyles: (diagramType) =>
        set((state) => {
          const newNodeStyles = {};
          const newEdgeStyles = {};

          // Keep only styles that don't belong to this diagram type
          Object.keys(state.nodeStyles).forEach((key) => {
            if (!key.startsWith(`${diagramType}:`)) {
              newNodeStyles[key] = state.nodeStyles[key];
            }
          });

          Object.keys(state.edgeStyles).forEach((key) => {
            if (!key.startsWith(`${diagramType}:`)) {
              newEdgeStyles[key] = state.edgeStyles[key];
            }
          });

          return {
            nodeStyles: newNodeStyles,
            edgeStyles: newEdgeStyles,
          };
        }),

      // Clear all styles
      clearAllStyles: () =>
        set({
          nodeStyles: {},
          edgeStyles: {},
        }),
    }),
    {
      name: "element-styles-storage",
    }
  )
);

// Create selectors for better performance
const createSelectors = (_store) => {
  const store = _store;
  store.use = {};
  for (const k of Object.keys(store.getState())) {
    store.use[k] = () => store((s) => s[k]);
  }
  return store;
};

export const useElementStyles = createSelectors(useElementStyleStore);
