import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { COLOR_PALETTES, getPalette } from '@/constants/colorPalettes';

/**
 * Color Palette Store
 *
 * Manages the current color palette selection across the application.
 * Provides methods to switch palettes and retrieve palette colors.
 */
const useColorPaletteStore = create(
  persist(
    (set, get) => ({
      // Current active palette ID
      currentPaletteId: 'default',

      // All available palettes
      palettes: COLOR_PALETTES,

      /**
       * Set the current active palette
       * @param {string} paletteId - The ID of the palette to activate
       */
      setCurrentPalette: (paletteId) => {
        if (COLOR_PALETTES[paletteId]) {
          set({ currentPaletteId: paletteId });
        } else {
          console.warn(`Palette "${paletteId}" not found. Using default palette.`);
          set({ currentPaletteId: 'default' });
        }
      },

      /**
       * Get the current active palette object
       * @returns {Object} The current palette with all color arrays
       */
      getCurrentPalette: () => {
        const { currentPaletteId } = get();
        return getPalette(currentPaletteId);
      },

      /**
       * Get node colors from the current palette
       * @returns {string[]} Array of node background colors
       */
      getNodeColors: () => {
        const palette = get().getCurrentPalette();
        return palette.nodeColors;
      },

      /**
       * Get border colors from the current palette
       * @returns {string[]} Array of border colors
       */
      getBorderColors: () => {
        const palette = get().getCurrentPalette();
        return palette.borderColors;
      },

      /**
       * Get text colors from the current palette
       * @returns {string[]} Array of text colors
       */
      getTextColors: () => {
        const palette = get().getCurrentPalette();
        return palette.textColors;
      },

      /**
       * Get edge colors from the current palette
       * @returns {string[]} Array of edge colors
       */
      getEdgeColors: () => {
        const palette = get().getCurrentPalette();
        return palette.edgeColors;
      },

      /**
       * Get all available palettes metadata
       * @returns {Object[]} Array of palette metadata (id, name, description)
       */
      getAllPalettesMetadata: () => {
        return Object.values(COLOR_PALETTES).map(({ id, name, description }) => ({
          id,
          name,
          description,
        }));
      },

      /**
       * Get a specific palette by ID
       * @param {string} paletteId - The palette ID
       * @returns {Object} The palette object
       */
      getPaletteById: (paletteId) => {
        return getPalette(paletteId);
      },

      /**
       * Reset to default palette
       */
      resetPalette: () => {
        set({ currentPaletteId: 'default' });
      },
    }),
    {
      name: 'color-palette-storage', // localStorage key
      // Only persist the current palette ID, not the entire palettes object
      partialize: (state) => ({
        currentPaletteId: state.currentPaletteId,
      }),
    }
  )
);

export default useColorPaletteStore;
