'use client';

import { useState } from 'react';
import { colors } from '@/components/theme/theme';
import useColorPaletteStore from '@/store/colorPaletteStore';

/**
 * ColorPaletteSelectorPanel Component
 * Allows users to switch between different color palettes
 *
 * This panel provides a UI to select from predefined color palettes
 * and updates the global palette state which affects all styling components.
 */
export default function ColorPaletteSelectorPanel() {
  const [isOpen, setIsOpen] = useState(false);

  // Get palette store functions and data
  const currentPaletteId = useColorPaletteStore((state) => state.currentPaletteId);
  const setCurrentPalette = useColorPaletteStore((state) => state.setCurrentPalette);
  const getAllPalettesMetadata = useColorPaletteStore((state) => state.getAllPalettesMetadata);
  const getCurrentPalette = useColorPaletteStore((state) => state.getCurrentPalette);

  const palettes = getAllPalettesMetadata();
  const activePalette = getCurrentPalette();

  const handlePaletteChange = (paletteId) => {
    setCurrentPalette(paletteId);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '180px',
          right: '20px',
          zIndex: 1000,
          background: colors.background.white,
          border: `2px solid ${colors.secondary[500]}`,
          borderRadius: '8px',
          padding: '12px 16px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '600',
          fontSize: '14px',
          color: colors.neutral[900],
        }}
      >
        <span style={{ fontSize: '18px' }}>🎨</span>
        Color Palette
      </button>

      {/* Palette Selector Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '230px',
            right: '20px',
            width: '320px',
            maxHeight: '75vh',
            overflowY: 'auto',
            background: colors.background.white,
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            zIndex: 1000,
            border: `2px solid ${colors.neutral[300]}`,
          }}
        >
          <div style={{ padding: '20px' }}>
            {/* Header */}
            <div
              style={{
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: `2px solid ${colors.neutral[200]}`,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '700',
                  color: colors.neutral[900],
                }}
              >
                Color Palette
              </h3>
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '12px',
                  color: colors.neutral[500],
                }}
              >
                Choose a color scheme for your diagrams
              </p>
            </div>

            {/* Current Palette Info */}
            <div
              style={{
                marginBottom: '20px',
                padding: '12px',
                background: colors.secondary[50],
                borderRadius: '8px',
                border: `1px solid ${colors.secondary[200]}`,
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: colors.secondary[700],
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '4px',
                }}
              >
                Active Palette
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.neutral[900],
                }}
              >
                {activePalette.name}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: colors.neutral[600],
                  marginTop: '2px',
                }}
              >
                {activePalette.description}
              </div>
            </div>

            {/* Palette Options */}
            <div style={{ display: 'grid', gap: '12px' }}>
              {palettes.map((palette) => {
                const isActive = palette.id === currentPaletteId;
                const paletteColors = useColorPaletteStore.getState().getPaletteById(palette.id);

                return (
                  <button
                    key={palette.id}
                    onClick={() => handlePaletteChange(palette.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '14px',
                      borderRadius: '10px',
                      border: isActive
                        ? `3px solid ${colors.secondary[500]}`
                        : `2px solid ${colors.neutral[300]}`,
                      background: isActive ? colors.secondary[50] : colors.background.white,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = colors.neutral[400];
                        e.currentTarget.style.background = colors.neutral[50];
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = colors.neutral[300];
                        e.currentTarget.style.background = colors.background.white;
                      }
                    }}
                  >
                    {/* Palette Name & Description */}
                    <div style={{ marginBottom: '10px', width: '100%' }}>
                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: '700',
                          color: colors.neutral[900],
                          marginBottom: '2px',
                        }}
                      >
                        {palette.name}
                        {isActive && (
                          <span
                            style={{
                              marginLeft: '8px',
                              fontSize: '11px',
                              fontWeight: '600',
                              color: colors.secondary[600],
                              background: colors.secondary[100],
                              padding: '2px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: colors.neutral[600],
                        }}
                      >
                        {palette.description}
                      </div>
                    </div>

                    {/* Color Preview Swatches */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(8, 1fr)',
                        gap: '4px',
                        width: '100%',
                      }}
                    >
                      {paletteColors.edgeColors.map((color, index) => (
                        <div
                          key={`preview-${palette.id}-${index}`}
                          style={{
                            width: '100%',
                            height: '20px',
                            borderRadius: '4px',
                            background: color,
                            border: `1px solid ${colors.neutral[300]}`,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Info Note */}
            <div
              style={{
                marginTop: '20px',
                padding: '12px',
                background: colors.primary[50],
                borderRadius: '8px',
                fontSize: '12px',
                color: colors.neutral[600],
                lineHeight: '1.5',
              }}
            >
              <strong style={{ color: colors.primary[700] }}>💡 Tip:</strong> Changing the palette
              will update all color pickers across the diagram styling panels. Your current style
              selections will be preserved.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
