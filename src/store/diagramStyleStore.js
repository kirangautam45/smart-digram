// Zustand store for diagram styling with localStorage persistence

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultTheme } from "@/config/diagramStyles";

// Create separate stores for each diagram type to avoid conflicts
export const useDiagramStyleStore = create(
  persist(
    (set, get) => ({
      // Global styles (shared across all diagrams)
      globalStyles: {
        ...defaultTheme,
      },

      // Individual diagram styles (per diagram type)
      diagramStyles: {
        flowchart: {},
        erDiagram: {},
        sequenceDiagram: {},
        requirementDiagram: {},
        blockDiagram: {},
        architecture: {},
        userJourney: {},
      },

      // Active diagram type
      activeDiagramType: 'flowchart',

      // Actions
      setActiveDiagramType: (type) => set({ activeDiagramType: type }),

      // Global style actions
      setGlobalStyle: (key, value) =>
        set((state) => ({
          globalStyles: {
            ...state.globalStyles,
            [key]: value,
          },
        })),

      updateGlobalStyles: (styles) =>
        set((state) => ({
          globalStyles: {
            ...state.globalStyles,
            ...styles,
          },
        })),

      resetGlobalStyles: () =>
        set({
          globalStyles: { ...defaultTheme },
        }),

      // Individual diagram style actions
      setDiagramStyle: (diagramType, key, value) =>
        set((state) => ({
          diagramStyles: {
            ...state.diagramStyles,
            [diagramType]: {
              ...state.diagramStyles[diagramType],
              [key]: value,
            },
          },
        })),

      updateDiagramStyles: (diagramType, styles) =>
        set((state) => ({
          diagramStyles: {
            ...state.diagramStyles,
            [diagramType]: {
              ...state.diagramStyles[diagramType],
              ...styles,
            },
          },
        })),

      resetDiagramStyles: (diagramType) =>
        set((state) => ({
          diagramStyles: {
            ...state.diagramStyles,
            [diagramType]: {},
          },
        })),

      resetAllStyles: () =>
        set({
          globalStyles: { ...defaultTheme },
          diagramStyles: {
            flowchart: {},
            erDiagram: {},
            sequenceDiagram: {},
            requirementDiagram: {},
            blockDiagram: {},
            architecture: {},
            userJourney: {},
          },
        }),

      // Getter for merged styles (global + diagram-specific)
      getMergedStyles: (diagramType) => {
        const state = get();
        return {
          ...state.globalStyles,
          ...state.diagramStyles[diagramType],
        };
      },
    }),
    {
      name: "diagram-styles-storage",
      // Only persist what we need
      partialize: (state) => ({
        globalStyles: state.globalStyles,
        diagramStyles: state.diagramStyles,
      }),
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

export const useStyleStore = createSelectors(useDiagramStyleStore);

// Helper hook to get current diagram styles
export const useCurrentDiagramStyles = () => {
  const activeDiagramType = useStyleStore.use.activeDiagramType();
  const getMergedStyles = useStyleStore((state) => state.getMergedStyles);
  return getMergedStyles(activeDiagramType);
};
