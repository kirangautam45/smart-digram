'use client'

import { useState } from 'react'
import { colors, typography } from '@/components/theme/theme'
import useColorPaletteStore from '@/store/colorPaletteStore'

const fontFamilies = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' },
  { value: typography.fontFamily.sans, label: 'Geist Sans' },
  { value: typography.fontFamily.mono, label: 'Geist Mono' },
]

const fontSizes = [
  '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'
]

// Text colors will be loaded from palette store dynamically

const textAnimations = [
  { value: 'none', label: 'None' },
  { value: 'fade-in', label: 'Fade In' },
  { value: 'slide-in-left', label: 'Slide In Left' },
  { value: 'slide-in-right', label: 'Slide In Right' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'shake', label: 'Shake' },
  { value: 'glow', label: 'Glow' },
]

export default function TextStylePanel({ onStyleChange, initialStyle = {} }) {
  // Get text colors from palette store
  const getTextColors = useColorPaletteStore((state) => state.getTextColors);
  const textColors = getTextColors();

  const [style, setStyle] = useState({
    text: initialStyle.text || 'Sample Text',
    fontFamily: initialStyle.fontFamily || 'Arial, sans-serif',
    fontSize: initialStyle.fontSize || '16px',
    color: initialStyle.color || '#000000',
    fontWeight: initialStyle.fontWeight || '400',
    fontStyle: initialStyle.fontStyle || 'normal',
    textDecoration: initialStyle.textDecoration || 'none',
    animation: initialStyle.animation || 'none',
  })

  const [isOpen, setIsOpen] = useState(false)

  const updateStyle = (updates) => {
    const newStyle = { ...style, ...updates }
    setStyle(newStyle)
    onStyleChange(newStyle)
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '100px',
          right: '20px',
          zIndex: 1000,
          background: colors.background.white,
          border: `2px solid ${colors.primary[500]}`,
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
        <span style={{ fontSize: '18px' }}>T</span>
        Text Styling
      </button>

      {/* Style Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '150px',
            right: '20px',
            width: '280px',
            maxHeight: '80vh',
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
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `2px solid ${colors.neutral[200]}` }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: colors.neutral[900] }}>
                Text Styling
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: colors.neutral[500] }}>
                Customize text appearance
              </p>
            </div>

            {/* Text Content */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: colors.neutral[700] }}>
                Text Content
              </label>
              <textarea
                value={style.text}
                onChange={(e) => updateStyle({ text: e.target.value })}
                placeholder="Enter your text here..."
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '10px',
                  borderRadius: '6px',
                  border: `2px solid ${colors.neutral[300]}`,
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = colors.primary[500]}
                onBlur={(e) => e.target.style.borderColor = colors.neutral[300]}
              />
            </div>

            {/* Font Family */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: colors.neutral[700] }}>
                Font Family
              </label>
              <select
                value={style.fontFamily}
                onChange={(e) => updateStyle({ fontFamily: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1px solid ${colors.neutral[300]}`,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {fontFamilies.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: colors.neutral[700] }}>
                Font Size
              </label>
              <select
                value={style.fontSize}
                onChange={(e) => updateStyle({ fontSize: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1px solid ${colors.neutral[300]}`,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {fontSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Text Color */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: colors.neutral[700] }}>
                Text Color
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {textColors.map((color, index) => (
                  <button
                    key={`text-color-${index}`}
                    onClick={() => updateStyle({ color: color })}
                    title={color}
                    style={{
                      width: '100%',
                      height: '50px',
                      borderRadius: '10px',
                      background: color,
                      border: style.color === color
                        ? `4px solid ${colors.accent.rose[500]}`
                        : `2px solid ${colors.neutral[300]}`,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (style.color !== color) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Text Style */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: colors.neutral[700] }}>
                Text Style
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => updateStyle({ fontWeight: style.fontWeight === '700' ? '400' : '700' })}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: `2px solid ${style.fontWeight === '700' ? colors.primary[500] : colors.neutral[300]}`,
                    background: style.fontWeight === '700' ? colors.primary[50] : colors.background.white,
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '14px',
                  }}
                >
                  B
                </button>
                <button
                  onClick={() => updateStyle({ fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: `2px solid ${style.fontStyle === 'italic' ? colors.primary[500] : colors.neutral[300]}`,
                    background: style.fontStyle === 'italic' ? colors.primary[50] : colors.background.white,
                    cursor: 'pointer',
                    fontStyle: 'italic',
                    fontSize: '14px',
                  }}
                >
                  I
                </button>
                <button
                  onClick={() => updateStyle({ textDecoration: style.textDecoration === 'underline' ? 'none' : 'underline' })}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: `2px solid ${style.textDecoration === 'underline' ? colors.primary[500] : colors.neutral[300]}`,
                    background: style.textDecoration === 'underline' ? colors.primary[50] : colors.background.white,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '14px',
                  }}
                >
                  U
                </button>
              </div>
            </div>

            {/* Animation */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: colors.neutral[700] }}>
                Animation
              </label>
              <select
                value={style.animation}
                onChange={(e) => updateStyle({ animation: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1px solid ${colors.neutral[300]}`,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {textAnimations.map((anim) => (
                  <option key={anim.value} value={anim.value}>
                    {anim.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `2px solid ${colors.neutral[200]}` }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: colors.neutral[700] }}>
                Preview
              </label>
              <div
                style={{
                  padding: '16px',
                  background: colors.neutral[50],
                  borderRadius: '8px',
                  border: `1px solid ${colors.neutral[300]}`,
                  textAlign: 'center',
                  minHeight: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  className={style.animation !== 'none' ? style.animation : ''}
                  style={{
                    fontFamily: style.fontFamily,
                    fontSize: style.fontSize,
                    color: style.color,
                    fontWeight: style.fontWeight,
                    fontStyle: style.fontStyle,
                    textDecoration: style.textDecoration,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {style.text || 'Enter text above to preview'}
                </div>
              </div>
            </div>

            {/* Custom Styles Info */}
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: colors.primary[50],
              borderRadius: '8px',
              border: `1px solid ${colors.primary[200]}`
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: colors.primary[700] }}>
                Text Editor & Styling
              </h4>
              <p style={{ margin: 0, fontSize: '11px', color: colors.primary[600], lineHeight: '1.5' }}>
                Edit your text content and apply custom styling with colors, fonts, and animations for creative designs
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
