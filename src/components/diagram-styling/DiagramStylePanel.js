'use client';

import { useState } from 'react';
import { colors } from '@/components/theme/theme';
import useColorPaletteStore from '@/store/colorPaletteStore';

/**
 * @typedef {Object} NodeStyle
 * @property {string} backgroundColor
 * @property {string} borderColor
 * @property {number} borderWidth
 * @property {'solid' | 'dashed' | 'dotted'} borderStyle
 * @property {number} borderRadius
 * @property {string} textColor
 * @property {string} fontSize
 * @property {string} fontFamily
 * @property {string} fontWeight
 * @property {string} boxShadow
 * @property {string} [animation]
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
 * @property {string} [animation]
 */

/**
 * @typedef {Object} DiagramStyles
 * @property {NodeStyle} node
 * @property {EdgeStyle} edge
 */

// Animation options remain static as they don't depend on color palettes

const nodeAnimations = [
  { value: 'none', label: 'None' },
  { value: 'node-pulse', label: 'Pulse' },
  { value: 'node-float', label: 'Float' },
  { value: 'node-glow', label: 'Glow' },
  { value: 'node-shake', label: 'Shake' },
  { value: 'node-rotate', label: 'Rotate' },
  { value: 'node-bounce', label: 'Bounce' },
];

const edgeAnimations = [
  { value: 'none', label: 'None' },
  { value: 'edge-flow', label: 'Flow' },
  { value: 'edge-pulse', label: 'Pulse' },
  { value: 'edge-glow', label: 'Glow' },
  { value: 'edge-dash-flow', label: 'Dash Flow' },
];

/**
 * DiagramStylePanel Component
 * Global styling panel for diagram nodes and edges
 *
 * @param {Object} props
 * @param {Function} props.onStyleChange - Callback when styles change
 * @param {Partial<DiagramStyles>} [props.initialStyles] - Initial style values
 */
export default function DiagramStylePanel({ onStyleChange, initialStyles = {} }) {
  // Get color palette from store
  const getNodeColors = useColorPaletteStore((state) => state.getNodeColors);
  const getBorderColors = useColorPaletteStore((state) => state.getBorderColors);
  const getTextColors = useColorPaletteStore((state) => state.getTextColors);
  const getEdgeColors = useColorPaletteStore((state) => state.getEdgeColors);

  // Get current palette colors
  const nodeColors = getNodeColors();
  const borderColors = getBorderColors();
  const textColors = getTextColors();
  const edgeColors = getEdgeColors();

  const [styles, setStyles] = useState({
    node: {
      backgroundColor: initialStyles.node?.backgroundColor || '#FFFFFF',
      borderColor: initialStyles.node?.borderColor || '#8B5CF6',
      borderWidth: initialStyles.node?.borderWidth || 2,
      borderStyle: initialStyles.node?.borderStyle || 'solid',
      borderRadius: initialStyles.node?.borderRadius || 8,
      textColor: initialStyles.node?.textColor || '#1F2937',
      fontSize: initialStyles.node?.fontSize || '14px',
      fontFamily: initialStyles.node?.fontFamily || 'Arial, sans-serif',
      fontWeight: initialStyles.node?.fontWeight || '400',
      boxShadow: initialStyles.node?.boxShadow || '0 4px 10px rgba(0,0,0,0.1)',
      animation: initialStyles.node?.animation || 'none',
    },
    edge: {
      stroke: initialStyles.edge?.stroke || '#8B5CF6',
      strokeWidth: initialStyles.edge?.strokeWidth || 2,
      strokeDasharray: initialStyles.edge?.strokeDasharray || '0',
      animated: initialStyles.edge?.animated || false,
      markerColor: initialStyles.edge?.markerColor || '#8B5CF6',
      labelBgColor: initialStyles.edge?.labelBgColor || '#F3E8FF',
      labelTextColor: initialStyles.edge?.labelTextColor || '#8B5CF6',
      animation: initialStyles.edge?.animation || 'none',
    },
  });

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('nodes');

  const updateNodeStyle = (updates) => {
    const newStyles = {
      ...styles,
      node: { ...styles.node, ...updates },
    };
    setStyles(newStyles);
    onStyleChange(newStyles);
  };

  const updateEdgeStyle = (updates) => {
    const newStyles = {
      ...styles,
      edge: { ...styles.edge, ...updates },
    };
    setStyles(newStyles);
    onStyleChange(newStyles);
  };

  return (
    <>
     

      {/* Style Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            width: '320px',
            maxHeight: '85vh',
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
                Diagram Styling
              </h3>
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '12px',
                  color: colors.neutral[500],
                }}
              >
                Customize nodes and edges
              </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                onClick={() => setActiveTab('nodes')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '6px',
                  border: `2px solid ${
                    activeTab === 'nodes' ? colors.primary[500] : colors.neutral[300]
                  }`,
                  background: activeTab === 'nodes' ? colors.primary[50] : colors.background.white,
                  color: activeTab === 'nodes' ? colors.primary[700] : colors.neutral[600],
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Nodes
              </button>
              <button
                onClick={() => setActiveTab('edges')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '6px',
                  border: `2px solid ${
                    activeTab === 'edges' ? colors.primary[500] : colors.neutral[300]
                  }`,
                  background: activeTab === 'edges' ? colors.primary[50] : colors.background.white,
                  color: activeTab === 'edges' ? colors.primary[700] : colors.neutral[600],
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Edges
              </button>
            </div>

            {/* Node Styles */}
            {activeTab === 'nodes' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Background Color */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: colors.neutral[700],
                    }}
                  >
                    Background Color
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '10px',
                    }}
                  >
                    {nodeColors.map((color, index) => (
                      <button
                        key={`node-color-${index}`}
                        onClick={() => updateNodeStyle({ backgroundColor: color })}
                        title={color}
                        style={{
                          width: '100%',
                          height: '50px',
                          borderRadius: '10px',
                          background: color,
                          border:
                            styles.node.backgroundColor === color
                              ? `4px solid ${colors.primary[500]}`
                              : `2px solid ${colors.neutral[300]}`,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (styles.node.backgroundColor !== color) {
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

                {/* Border Color */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: colors.neutral[700],
                    }}
                  >
                    Border Color
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '10px',
                    }}
                  >
                    {borderColors.map((color, index) => (
                      <button
                        key={`border-color-${index}`}
                        onClick={() => updateNodeStyle({ borderColor: color })}
                        title={color}
                        style={{
                          width: '100%',
                          height: '50px',
                          borderRadius: '10px',
                          background: color,
                          border:
                            styles.node.borderColor === color
                              ? `4px solid ${colors.accent.emerald[500]}`
                              : `2px solid ${colors.neutral[300]}`,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (styles.node.borderColor !== color) {
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

                {/* Border Width */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: colors.neutral[700],
                    }}
                  >
                    Border Width: {styles.node.borderWidth}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={styles.node.borderWidth}
                    onChange={(e) => updateNodeStyle({ borderWidth: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Border Style */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: colors.neutral[700],
                    }}
                  >
                    Border Style
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['solid', 'dashed', 'dotted'].map((style) => (
                      <button
                        key={style}
                        onClick={() => updateNodeStyle({ borderStyle: style })}
                        style={{

                          flex: 1,
                          padding: '8px',
                          borderRadius: '6px',
                          border: `2px solid ${
                            styles.node.borderStyle === style
                              ? colors.primary[500]
                              : colors.neutral[300]
                          }`,
                          background:
                            styles.node.borderStyle === style
                              ? colors.primary[50]
                              : colors.background.white,
                          cursor: 'pointer',
                          fontSize: '12px',
                          textTransform: 'capitalize',
                        }}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Radius */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: colors.neutral[700],
                    }}
                  >
                    Border Radius: {styles.node.borderRadius}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={styles.node.borderRadius}
                    onChange={(e) => updateNodeStyle({ borderRadius: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Text Color */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: colors.neutral[700],
                    }}
                  >
                    Text Color
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '10px',
                    }}
                  >
                    {textColors.map((color, index) => (
                      <button
                        key={`text-color-${index}`}
                        onClick={() => updateNodeStyle({ textColor: color })}
                        title={color}
                        style={{
                          width: '100%',
                          height: '50px',
                          borderRadius: '10px',
                          background: color,
                          border:
                            styles.node.textColor === color
                              ? `4px solid ${colors.accent.rose[500]}`
                              : `2px solid ${colors.neutral[300]}`,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (styles.node.textColor !== color) {
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

                {/* Node Animation */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: colors.neutral[700],
                    }}
                  >
                    Animation
                  </label>
                  <select
                    value={styles.node.animation}
                    onChange={(e) => updateNodeStyle({ animation: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: `1px solid ${colors.neutral[300]}`,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {nodeAnimations.map((anim) => (
                      <option key={anim.value} value={anim.value}>
                        {anim.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Edge Styles */}
            {activeTab === 'edges' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Edge Color */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: colors.neutral[700],
                    }}
                  >
                    Edge Color
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '10px',
                    }}
                  >
                    {edgeColors.map((color, index) => (
                      <button
                        key={`edge-color-${index}`}
                        onClick={() =>
                          updateEdgeStyle({
                            stroke: color,
                            markerColor: color,
                          })
                        }
                        title={color}
                        style={{
                          width: '100%',
                          height: '50px',
                          borderRadius: '10px',
                          background: color,
                          border:
                            styles.edge.stroke === color
                              ? `4px solid ${colors.primary[500]}`
                              : `2px solid ${colors.neutral[300]}`,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (styles.edge.stroke !== color) {
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

                {/* Edge Width */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: colors.neutral[700],
                    }}
                  >
                    Edge Width: {styles.edge.strokeWidth}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={styles.edge.strokeWidth}
                    onChange={(e) => updateEdgeStyle({ strokeWidth: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Edge Style */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: colors.neutral[700],
                    }}
                  >
                    Edge Style
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => updateEdgeStyle({ strokeDasharray: '0' })}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: `2px solid ${
                          styles.edge.strokeDasharray === '0'
                            ? colors.primary[500]
                            : colors.neutral[300]
                        }`,
                        background:
                          styles.edge.strokeDasharray === '0'
                            ? colors.primary[50]
                            : colors.background.white,
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Solid
                    </button>
                    <button
                      onClick={() => updateEdgeStyle({ strokeDasharray: '5,5' })}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: `2px solid ${
                          styles.edge.strokeDasharray === '5,5'
                            ? colors.primary[500]
                            : colors.neutral[300]
                        }`,
                        background:
                          styles.edge.strokeDasharray === '5,5'
                            ? colors.primary[50]
                            : colors.background.white,
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Dashed
                    </button>
                    <button
                      onClick={() => updateEdgeStyle({ strokeDasharray: '2,2' })}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: `2px solid ${
                          styles.edge.strokeDasharray === '2,2'
                            ? colors.primary[500]
                            : colors.neutral[300]
                        }`,
                        background:
                          styles.edge.strokeDasharray === '2,2'
                            ? colors.primary[50]
                            : colors.background.white,
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Dotted
                    </button>
                  </div>
                </div>

                {/* Animated Toggle */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={styles.edge.animated}
                      onChange={(e) => updateEdgeStyle({ animated: e.target.checked })}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: colors.neutral[700],
                      }}
                    >
                      Animated Flow
                    </span>
                  </label>
                </div>

                {/* Edge Animation */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: colors.neutral[700],
                    }}
                  >
                    Animation Effect
                  </label>
                  <select
                    value={styles.edge.animation}
                    onChange={(e) => updateEdgeStyle({ animation: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: `1px solid ${colors.neutral[300]}`,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {edgeAnimations.map((anim) => (
                      <option key={anim.value} value={anim.value}>
                        {anim.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Preview */}
            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: `2px solid ${colors.neutral[200]}`,
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: colors.neutral[700],
                }}
              >
                Preview
              </label>
              {activeTab === 'nodes' ? (
                <div
                  className={styles.node.animation !== 'none' ? styles.node.animation : ''}
                  style={{
                    background: styles.node.backgroundColor,
                    border: `${styles.node.borderWidth}px ${styles.node.borderStyle} ${styles.node.borderColor}`,
                    borderRadius: `${styles.node.borderRadius}px`,
                    padding: '16px',
                    boxShadow: styles.node.boxShadow,
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      color: styles.node.textColor,
                      fontSize: styles.node.fontSize,
                      fontFamily: styles.node.fontFamily,
                      fontWeight: styles.node.fontWeight,
                    }}
                  >
                    Sample Node
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '20px',
                    background: colors.neutral[50],
                    borderRadius: '8px',
                  }}
                >
                  <svg width="100%" height="60">
                    <line
                      className={styles.edge.animation !== 'none' ? styles.edge.animation : ''}
                      x1="10"
                      y1="30"
                      x2="90%"
                      y2="30"
                      stroke={styles.edge.stroke}
                      strokeWidth={styles.edge.strokeWidth}
                      strokeDasharray={styles.edge.strokeDasharray}
                    />
                    <circle cx="95%" cy="30" r="4" fill={styles.edge.markerColor} />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
