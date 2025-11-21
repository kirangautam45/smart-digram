'use client';

import { Box } from '@mui/material';
import useColorPaletteStore from '@/store/colorPaletteStore';

/**
 * ColorPickerGrid Component
 * Reusable 4x4 grid color picker with 16 color swatches
 *
 * @param {string} selectedColor - Currently selected color
 * @param {function} onColorSelect - Callback when a color is selected
 * @param {string} colorType - Type of colors to display: 'border', 'node', 'text', 'edge' (default: 'border')
 */
export default function ColorPickerGrid({
  selectedColor,
  onColorSelect,
  colorType = 'border'
}) {
  // Get appropriate colors based on type
  const getBorderColors = useColorPaletteStore((state) => state.getBorderColors);
  const getNodeColors = useColorPaletteStore((state) => state.getNodeColors);
  const getTextColors = useColorPaletteStore((state) => state.getTextColors);
  const getEdgeColors = useColorPaletteStore((state) => state.getEdgeColors);

  const getColors = () => {
    switch (colorType) {
      case 'node':
        return getNodeColors();
      case 'text':
        return getTextColors();
      case 'edge':
        return getEdgeColors();
      case 'border':
      default:
        return getBorderColors();
    }
  };

  const colors = getColors();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
      }}
    >
      {colors.map((color, index) => (
        <Box
          key={`color-${colorType}-${index}`}
          onClick={() => onColorSelect(color)}
          sx={{
            width: '100%',
            height: '50px',
            borderRadius: '10px',
            background: color,
            border:
              selectedColor === color
                ? '4px solid #3B82F6'
                : '2px solid #D1D5DB',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: selectedColor !== color ? 'scale(1.05)' : 'scale(1)',
              boxShadow:
                selectedColor !== color
                  ? '0 4px 8px rgba(0,0,0,0.2)'
                  : '0 2px 6px rgba(0,0,0,0.15)',
            },
          }}
        />
      ))}
    </Box>
  );
}
