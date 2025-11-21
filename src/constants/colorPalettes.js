/**
 * Color Palette Configuration System
 *
 * Centralized color palette definitions for the diagram styling system.
 * Each palette includes 16 colors (4x4 grid) for: nodes, borders, text, and edges.
 */

export const COLOR_PALETTES = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'Professional blue and purple theme',
    // Node background colors (16 colors - 4x4 grid)
    nodeColors: [
      '#FFFFFF', '#F8FAFC', '#DBEAFE', '#FCE7F3',
      '#FEF3C7', '#D1FAE5', '#E0E7FF', '#F3E8FF',
      '#8B5CF6', '#3B82F6', '#10B981', '#EF4444',
      '#F59E0B', '#EC4899', '#1F2937', '#000000',
    ],
    // Border colors (16 colors - 4x4 grid)
    borderColors: [
      '#FFFFFF', '#F8FAFC', '#DBEAFE', '#FCE7F3',
      '#FEF3C7', '#D1FAE5', '#E0E7FF', '#F3E8FF',
      '#8B5CF6', '#3B82F6', '#10B981', '#EF4444',
      '#F59E0B', '#EC4899', '#1F2937', '#000000',
    ],
    // Text colors (16 colors - 4x4 grid)
    textColors: [
      '#FFFFFF', '#F8FAFC', '#DBEAFE', '#FCE7F3',
      '#FEF3C7', '#D1FAE5', '#E0E7FF', '#F3E8FF',
      '#8B5CF6', '#3B82F6', '#10B981', '#EF4444',
      '#F59E0B', '#EC4899', '#1F2937', '#000000',
    ],
    // Edge colors (16 colors - 4x4 grid)
    edgeColors: [
      '#FFFFFF', '#F8FAFC', '#DBEAFE', '#FCE7F3',
      '#FEF3C7', '#D1FAE5', '#E0E7FF', '#F3E8FF',
      '#8B5CF6', '#3B82F6', '#10B981', '#EF4444',
      '#F59E0B', '#EC4899', '#1F2937', '#000000',
    ],
  },

  vibrant: {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Bold and energetic colors',
    nodeColors: [
      '#FFFFFF', '#FEF3C7', '#DBEAFE', '#FCE7F3',
      '#D1FAE5', '#E0E7FF', '#FEE2E2', '#D1F4FA',
      '#F59E0B', '#3B82F6', '#10B981', '#EF4444',
      '#EC4899', '#6366F1', '#06B6D4', '#8B5CF6',
    ],
    borderColors: [
      '#FFFFFF', '#FEF3C7', '#DBEAFE', '#FCE7F3',
      '#D1FAE5', '#E0E7FF', '#FEE2E2', '#D1F4FA',
      '#F59E0B', '#3B82F6', '#10B981', '#EF4444',
      '#EC4899', '#6366F1', '#06B6D4', '#8B5CF6',
    ],
    textColors: [
      '#FFFFFF', '#FEF3C7', '#DBEAFE', '#FCE7F3',
      '#92400E', '#1E40AF', '#065F46', '#9F1239',
      '#F59E0B', '#3B82F6', '#10B981', '#EF4444',
      '#4338CA', '#991B1B', '#0E7490', '#1F2937',
    ],
    edgeColors: [
      '#FFFFFF', '#FEF3C7', '#DBEAFE', '#FCE7F3',
      '#D1FAE5', '#E0E7FF', '#FEE2E2', '#D1F4FA',
      '#F59E0B', '#3B82F6', '#10B981', '#EF4444',
      '#EC4899', '#6366F1', '#06B6D4', '#8B5CF6',
    ],
  },

  pastel: {
    id: 'pastel',
    name: 'Pastel',
    description: 'Soft and gentle colors',
    nodeColors: [
      '#FFFFFF', '#FAF5FF', '#F0F9FF', '#F0FDF4',
      '#FFF7ED', '#FDF2F8', '#F0FDFA', '#FEF9C3',
      '#C4B5FD', '#93C5FD', '#86EFAC', '#FED7AA',
      '#F9A8D4', '#5EEAD4', '#FDE047', '#C7D2FE',
    ],
    borderColors: [
      '#FFFFFF', '#FAF5FF', '#F0F9FF', '#F0FDF4',
      '#FFF7ED', '#FDF2F8', '#F0FDFA', '#FEF9C3',
      '#C4B5FD', '#93C5FD', '#86EFAC', '#FED7AA',
      '#F9A8D4', '#5EEAD4', '#FDE047', '#C7D2FE',
    ],
    textColors: [
      '#FFFFFF', '#FAF5FF', '#F0F9FF', '#F0FDF4',
      '#4B5563', '#7C3AED', '#2563EB', '#059669',
      '#EA580C', '#DB2777', '#0D9488', '#CA8A04',
      '#C4B5FD', '#93C5FD', '#86EFAC', '#1F2937',
    ],
    edgeColors: [
      '#FFFFFF', '#FAF5FF', '#F0F9FF', '#F0FDF4',
      '#FFF7ED', '#FDF2F8', '#F0FDFA', '#FEF9C3',
      '#C4B5FD', '#93C5FD', '#86EFAC', '#FED7AA',
      '#F9A8D4', '#5EEAD4', '#FDE047', '#C7D2FE',
    ],
  },

  monochrome: {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Professional black and white',
    nodeColors: [
      '#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0',
      '#CBD5E1', '#94A3B8', '#64748B', '#475569',
      '#334155', '#1E293B', '#0F172A', '#000000',
      '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF',
    ],
    borderColors: [
      '#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0',
      '#CBD5E1', '#94A3B8', '#64748B', '#475569',
      '#334155', '#1E293B', '#0F172A', '#000000',
      '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF',
    ],
    textColors: [
      '#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0',
      '#CBD5E1', '#94A3B8', '#64748B', '#475569',
      '#334155', '#1E293B', '#0F172A', '#000000',
      '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF',
    ],
    edgeColors: [
      '#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0',
      '#CBD5E1', '#94A3B8', '#64748B', '#475569',
      '#334155', '#1E293B', '#0F172A', '#000000',
      '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF',
    ],
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Blues and teals inspired by the sea',
    nodeColors: [
      '#FFFFFF', '#F0F9FF', '#E0F2FE', '#ECFEFF',
      '#CFFAFE', '#F0FDFA', '#CCFBF1', '#E0E7FF',
      '#0EA5E9', '#06B6D4', '#14B8A6', '#3B82F6',
      '#6366F1', '#0284C7', '#0891B2', '#0D9488',
    ],
    borderColors: [
      '#FFFFFF', '#F0F9FF', '#E0F2FE', '#ECFEFF',
      '#CFFAFE', '#F0FDFA', '#CCFBF1', '#E0E7FF',
      '#0EA5E9', '#06B6D4', '#14B8A6', '#3B82F6',
      '#6366F1', '#0284C7', '#0891B2', '#0D9488',
    ],
    textColors: [
      '#FFFFFF', '#F0F9FF', '#E0F2FE', '#ECFEFF',
      '#0C4A6E', '#164E63', '#134E4A', '#1E3A8A',
      '#312E81', '#075985', '#155E75', '#115E59',
      '#0EA5E9', '#06B6D4', '#14B8A6', '#1F2937',
    ],
    edgeColors: [
      '#FFFFFF', '#F0F9FF', '#E0F2FE', '#ECFEFF',
      '#CFFAFE', '#F0FDFA', '#CCFBF1', '#E0E7FF',
      '#0EA5E9', '#06B6D4', '#14B8A6', '#3B82F6',
      '#6366F1', '#0284C7', '#0891B2', '#0D9488',
    ],
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm oranges, reds, and pinks',
    nodeColors: [
      '#FFFFFF', '#FFF7ED', '#FFEDD5', '#FEF2F2',
      '#FEE2E2', '#FFF1F2', '#FFE4E6', '#FEF3C7',
      '#F97316', '#EF4444', '#F43F5E', '#F59E0B',
      '#EA580C', '#DC2626', '#E11D48', '#D97706',
    ],
    borderColors: [
      '#FFFFFF', '#FFF7ED', '#FFEDD5', '#FEF2F2',
      '#FEE2E2', '#FFF1F2', '#FFE4E6', '#FEF3C7',
      '#F97316', '#EF4444', '#F43F5E', '#F59E0B',
      '#EA580C', '#DC2626', '#E11D48', '#D97706',
    ],
    textColors: [
      '#FFFFFF', '#FFF7ED', '#FFEDD5', '#FEF2F2',
      '#7C2D12', '#7F1D1D', '#881337', '#78350F',
      '#9A3412', '#991B1B', '#9F1239', '#92400E',
      '#F97316', '#EF4444', '#F43F5E', '#1F2937',
    ],
    edgeColors: [
      '#FFFFFF', '#FFF7ED', '#FFEDD5', '#FEF2F2',
      '#FEE2E2', '#FFF1F2', '#FFE4E6', '#FEF3C7',
      '#F97316', '#EF4444', '#F43F5E', '#F59E0B',
      '#EA580C', '#DC2626', '#E11D48', '#D97706',
    ],
  },

  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Natural greens and earthy tones',
    nodeColors: [
      '#FFFFFF', '#F0FDF4', '#DCFCE7', '#F0FDFA',
      '#CCFBF1', '#ECFDF5', '#D1FAE5', '#FEFCE8',
      '#22C55E', '#14B8A6', '#10B981', '#84CC16',
      '#16A34A', '#0D9488', '#059669', '#65A30D',
    ],
    borderColors: [
      '#FFFFFF', '#F0FDF4', '#DCFCE7', '#F0FDFA',
      '#CCFBF1', '#ECFDF5', '#D1FAE5', '#FEFCE8',
      '#22C55E', '#14B8A6', '#10B981', '#84CC16',
      '#16A34A', '#0D9488', '#059669', '#65A30D',
    ],
    textColors: [
      '#FFFFFF', '#F0FDF4', '#DCFCE7', '#F0FDFA',
      '#14532D', '#134E4A', '#064E3B', '#365314',
      '#166534', '#115E59', '#065F46', '#3F6212',
      '#22C55E', '#14B8A6', '#10B981', '#1F2937',
    ],
    edgeColors: [
      '#FFFFFF', '#F0FDF4', '#DCFCE7', '#F0FDFA',
      '#CCFBF1', '#ECFDF5', '#D1FAE5', '#FEFCE8',
      '#22C55E', '#14B8A6', '#10B981', '#84CC16',
      '#16A34A', '#0D9488', '#059669', '#65A30D',
    ],
  },

  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'Electric bright colors for dark mode',
    nodeColors: [
      '#1F2937', '#374151', '#4B5563', '#1E1B4B',
      '#581C87', '#831843', '#7C2D12', '#064E3B',
      '#A78BFA', '#60A5FA', '#34D399', '#FBBF24',
      '#F472B6', '#2DD4BF', '#FB923C', '#A3E635',
    ],
    borderColors: [
      '#1F2937', '#374151', '#4B5563', '#1E1B4B',
      '#581C87', '#831843', '#7C2D12', '#064E3B',
      '#A78BFA', '#60A5FA', '#34D399', '#FBBF24',
      '#F472B6', '#2DD4BF', '#FB923C', '#A3E635',
    ],
    textColors: [
      '#E5E7EB', '#D1D5DB', '#F9FAFB', '#A78BFA',
      '#60A5FA', '#34D399', '#FBBF24', '#F472B6',
      '#2DD4BF', '#FB923C', '#A3E635', '#FCD34D',
      '#C084FC', '#818CF8', '#1F2937', '#000000',
    ],
    edgeColors: [
      '#1F2937', '#374151', '#4B5563', '#1E1B4B',
      '#581C87', '#831843', '#7C2D12', '#064E3B',
      '#A78BFA', '#60A5FA', '#34D399', '#FBBF24',
      '#F472B6', '#2DD4BF', '#FB923C', '#A3E635',
    ],
  },
};

/**
 * Get all available palette IDs
 * @returns {string[]} Array of palette IDs
 */
export const getPaletteIds = () => Object.keys(COLOR_PALETTES);

/**
 * Get palette by ID
 * @param {string} paletteId - The palette ID
 * @returns {Object} The palette object
 */
export const getPalette = (paletteId) => COLOR_PALETTES[paletteId] || COLOR_PALETTES.default;

/**
 * Get all palettes as an array
 * @returns {Object[]} Array of palette objects
 */
export const getAllPalettes = () => Object.values(COLOR_PALETTES);

/**
 * Get palette metadata (without color arrays)
 * @returns {Object[]} Array of palette metadata
 */
export const getPaletteMetadata = () =>
  Object.values(COLOR_PALETTES).map(({ id, name, description }) => ({ id, name, description }));
