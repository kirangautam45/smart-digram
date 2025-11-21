import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * @typedef {Object} NodeStyle
 * @property {string} backgroundColor
 * @property {string} borderColor
 * @property {number} borderWidth
 * @property {string} borderStyle
 * @property {number} borderRadius
 * @property {string} textColor
 * @property {string} fontSize
 * @property {string} fontWeight
 * @property {string} fontFamily
 * @property {string} boxShadow
 * @property {string} animation
 */

/**
 * @typedef {Object} EdgeStyle
 * @property {string} stroke
 * @property {number} strokeWidth
 * @property {string} strokeDasharray
 * @property {boolean} animated
 * @property {string} markerColor
 * @property {string} labelBgColor
 * @property {string} labelTextColor
 * @property {string} animation
 */

/**
 * @typedef {Object} DiagramStyles
 * @property {NodeStyle} node
 * @property {EdgeStyle} edge
 */

/**
 * @typedef {Object} IndividualNodeStyle
 * Individual node styling properties
 */

/**
 * @typedef {Object} IndividualEdgeStyle
 * Individual edge styling properties
 */

/**
 * @typedef {Object} ElementStyles
 * @property {Record<string, IndividualNodeStyle>} nodes - nodeId -> style
 * @property {Record<string, IndividualEdgeStyle>} edges - edgeId -> style
 */

/**
 * Default global diagram styles
 * @type {DiagramStyles}
 */
const defaultGlobalStyles = {
  node: {
    backgroundColor: '#FFFFFF',
    borderColor: '#8B5CF6',
    borderWidth: 2,
    borderStyle: 'solid',
    borderRadius: 8,
    textColor: '#1F2937',
    fontSize: '14',
    fontWeight: '600',
    fontFamily: 'inherit',
    boxShadow: 'none',
    animation: 'none',
  },
  edge: {
    stroke: '#8B5CF6',
    strokeWidth: 2,
    strokeDasharray: '',
    animated: false,
    markerColor: '#8B5CF6',
    labelBgColor: '#F3E8FF',
    labelTextColor: '#8B5CF6',
    animation: 'none',
  },
};

/**
 * Zustand store for managing diagram styles
 *
 * Store structure:
 * - globalStyles: Shared diagram styles across all pages
 * - pageStyles: Individual element styles per page
 *
 * @returns {Object} Diagram store with state and actions
 */
export const useDiagramStore = create(
  persist(
    (set, get) => ({
      // ========================================================================
      // STATE
      // ========================================================================

      /** @type {DiagramStyles} Global diagram styles (shared across all pages) */
      globalStyles: defaultGlobalStyles,

      /** @type {Record<string, ElementStyles>} Individual element styles per page */
      pageStyles: {},

      // ========================================================================
      // ACTIONS
      // ========================================================================

      /**
       * Set global diagram styles
       * @param {DiagramStyles} styles - New global styles
       */
      setGlobalStyles: (styles) => {
        set({ globalStyles: styles });
      },

      /**
       * Set individual node style for a specific page
       * @param {string} pageName - Name of the page
       * @param {string} nodeId - ID of the node
       * @param {IndividualNodeStyle} style - Style object for the node
       */
      setNodeStyle: (pageName, nodeId, style) => {
        set((state) => ({
          pageStyles: {
            ...state.pageStyles,
            [pageName]: {
              nodes: {
                ...(state.pageStyles[pageName]?.nodes || {}),
                [nodeId]: style,
              },
              edges: state.pageStyles[pageName]?.edges || {},
            },
          },
        }));
      },

      /**
       * Set individual edge style for a specific page
       * @param {string} pageName - Name of the page
       * @param {string} edgeId - ID of the edge
       * @param {IndividualEdgeStyle} style - Style object for the edge
       */
      setEdgeStyle: (pageName, edgeId, style) => {
        set((state) => ({
          pageStyles: {
            ...state.pageStyles,
            [pageName]: {
              nodes: state.pageStyles[pageName]?.nodes || {},
              edges: {
                ...(state.pageStyles[pageName]?.edges || {}),
                [edgeId]: style,
              },
            },
          },
        }));
      },

      /**
       * Get individual node style for a specific page
       * @param {string} pageName - Name of the page
       * @param {string} nodeId - ID of the node
       * @returns {IndividualNodeStyle | undefined} Node style or undefined
       */
      getNodeStyle: (pageName, nodeId) => {
        const pageStyle = get().pageStyles[pageName];
        return pageStyle?.nodes[nodeId];
      },

      /**
       * Get individual edge style for a specific page
       * @param {string} pageName - Name of the page
       * @param {string} edgeId - ID of the edge
       * @returns {IndividualEdgeStyle | undefined} Edge style or undefined
       */
      getEdgeStyle: (pageName, edgeId) => {
        const pageStyle = get().pageStyles[pageName];
        return pageStyle?.edges[edgeId];
      },

      /**
       * Clear all styles for a specific page
       * @param {string} pageName - Name of the page to clear
       */
      clearPageStyles: (pageName) => {
        set((state) => {
          const newPageStyles = { ...state.pageStyles };
          delete newPageStyles[pageName];
          return { pageStyles: newPageStyles };
        });
      },

      /**
       * Clear all styles (reset to default)
       */
      clearAllStyles: () => {
        set({
          globalStyles: defaultGlobalStyles,
          pageStyles: {},
        });
      },
    }),
    {
      name: 'diagram-styles-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
