'use client';

import { useState, useEffect } from 'react';
import { colors } from '@/components/theme/theme';
import useColorPaletteStore from '@/store/colorPaletteStore';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import IconPickerGrid from '@/components/common/IconPickerGrid';

/**
 * @typedef {Object} IndividualNodeStyle
 * @property {string} [backgroundColor]
 * @property {string} [borderColor]
 * @property {number} [borderWidth]
 * @property {'solid' | 'dashed' | 'dotted'} [borderStyle]
 * @property {number} [borderRadius]
 * @property {string} [textColor]
 * @property {string} [fontSize]
 * @property {string} [fontFamily]
 * @property {string} [fontWeight]
 * @property {string} [animation]
 */

/**
 * @typedef {Object} IndividualEdgeStyle
 * @property {string} [stroke]
 * @property {number} [strokeWidth]
 * @property {string} [strokeDasharray]
 * @property {boolean} [animated]
 * @property {string} [animation]
 */

// Color options will be loaded from palette store dynamically

const animations = [
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
 * NodeEditorPanel Component
 * Panel for editing individual node and edge styles OR creating new services
 *
 * @param {Object} props
 * @param {Object|null} props.selectedNode - Selected node from React Flow
 * @param {Object|null} props.selectedEdge - Selected edge from React Flow
 * @param {boolean} props.createMode - Whether in service creation mode
 * @param {Array} props.availableGroups - List of groups for service creation
 * @param {Function} props.onNodeStyleChange - Callback for node style changes
 * @param {Function} props.onEdgeStyleChange - Callback for edge style changes
 * @param {Function} props.onNodeDataChange - Callback for node data changes (like label)
 * @param {Function} props.onNodeDelete - Callback to delete the node
 * @param {Function} props.onServiceCreate - Callback to create new service
 * @param {Function} props.onClose - Callback to close the panel
 */
export default function NodeEditorPanel({
  selectedNode,
  selectedEdge,
  createMode = false,
  preSelectedGroup = '',
  availableGroups = [],
  onNodeStyleChange,
  onEdgeStyleChange,
  onNodeDataChange,
  onNodeDelete,
  onServiceCreate,
  onClose,
}) {
  // Get color palette from store
  const getNodeColors = useColorPaletteStore((state) => state.getNodeColors);
  const getBorderColors = useColorPaletteStore((state) => state.getBorderColors);
  const getTextColors = useColorPaletteStore((state) => state.getTextColors);
  const getEdgeColors = useColorPaletteStore((state) => state.getEdgeColors);

  // Combine node and border colors for a comprehensive color palette
  const colorOptions = [
    ...getNodeColors(),
    ...getBorderColors(),
  ].filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

  const [nodeStyle, setNodeStyle] = useState({
    backgroundColor: selectedNode?.data?.individualStyle?.backgroundColor || '#FFFFFF',
    borderColor: selectedNode?.data?.individualStyle?.borderColor || '#8B5CF6',
    borderWidth: selectedNode?.data?.individualStyle?.borderWidth || 2,
    borderStyle: selectedNode?.data?.individualStyle?.borderStyle || 'solid',
    borderRadius: selectedNode?.data?.individualStyle?.borderRadius || 8,
    textColor: selectedNode?.data?.individualStyle?.textColor || '#1F2937',
    fontSize: selectedNode?.data?.individualStyle?.fontSize || '14px',
    fontWeight: selectedNode?.data?.individualStyle?.fontWeight || '400',
    animation: selectedNode?.data?.individualStyle?.animation || 'none',
  });

  const [edgeStyle, setEdgeStyle] = useState({
    stroke: selectedEdge?.data?.individualStyle?.stroke || '#8B5CF6',
    strokeWidth: selectedEdge?.data?.individualStyle?.strokeWidth || 2,
    strokeDasharray: selectedEdge?.data?.individualStyle?.strokeDasharray || '0',
    animated: selectedEdge?.data?.individualStyle?.animated || false,
    animation: selectedEdge?.data?.individualStyle?.animation || 'none',
    markerStart: selectedEdge?.data?.individualStyle?.markerStart || false,
    markerEnd: selectedEdge?.data?.individualStyle?.markerEnd !== false,
    edgeType: selectedEdge?.data?.individualStyle?.edgeType || selectedEdge?.type || 'smoothstep',
  });

  const [nodeLabel, setNodeLabel] = useState(
    selectedNode?.data?.nodeType === 'group'
      ? selectedNode?.data?.groupData?.label || ''
      : selectedNode?.data?.serviceData?.label || ''
  );

  // Service edit form state (for editing existing services)
  const [serviceType, setServiceType] = useState(
    selectedNode?.data?.nodeType === 'service'
      ? selectedNode?.data?.serviceData?.type || 'API'
      : 'API'
  );

  const [serviceIcon, setServiceIcon] = useState(
    selectedNode?.data?.nodeType === 'service'
      ? selectedNode?.data?.serviceData?.icon || ''
      : ''
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Service creation form state
  const [newServiceData, setNewServiceData] = useState({
    type: 'API',
    label: '',
    group: preSelectedGroup || '',
    icon: '', // Custom icon selection (optional)
  });

  // Update newServiceData when preSelectedGroup changes
  useEffect(() => {
    if (preSelectedGroup) {
      setNewServiceData((prev) => ({ ...prev, group: preSelectedGroup }));
    }
  }, [preSelectedGroup]);

  // Update state when selected node changes
  useEffect(() => {
    if (selectedNode) {
      const newLabel = selectedNode.data.nodeType === 'group'
        ? selectedNode.data.groupData?.label || ''
        : selectedNode.data.serviceData?.label || '';
      setNodeLabel(newLabel);

      // Update service type and icon for service nodes
      if (selectedNode.data.nodeType === 'service') {
        setServiceType(selectedNode.data.serviceData?.type || 'API');
        setServiceIcon(selectedNode.data.serviceData?.icon || '');
      }

      // Update node style
      setNodeStyle({
        backgroundColor: selectedNode.data.individualStyle?.backgroundColor || '#FFFFFF',
        borderColor: selectedNode.data.individualStyle?.borderColor || '#8B5CF6',
        borderWidth: selectedNode.data.individualStyle?.borderWidth || 2,
        borderStyle: selectedNode.data.individualStyle?.borderStyle || 'solid',
        borderRadius: selectedNode.data.individualStyle?.borderRadius || 8,
        textColor: selectedNode.data.individualStyle?.textColor || '#1F2937',
        fontSize: selectedNode.data.individualStyle?.fontSize || '14px',
        fontWeight: selectedNode.data.individualStyle?.fontWeight || '400',
        animation: selectedNode.data.individualStyle?.animation || 'none',
      });
    }
  }, [selectedNode]);

  // Update edge style when selected edge changes
  useEffect(() => {
    if (selectedEdge) {
      setEdgeStyle({
        stroke: selectedEdge.data?.individualStyle?.stroke || '#8B5CF6',
        strokeWidth: selectedEdge.data?.individualStyle?.strokeWidth || 2,
        strokeDasharray: selectedEdge.data?.individualStyle?.strokeDasharray || '0',
        animated: selectedEdge.data?.individualStyle?.animated || false,
        animation: selectedEdge.data?.individualStyle?.animation || 'none',
        markerStart: selectedEdge.data?.individualStyle?.markerStart || false,
        markerEnd: selectedEdge.data?.individualStyle?.markerEnd !== false,
        edgeType: selectedEdge.data?.individualStyle?.edgeType || selectedEdge.type || 'smoothstep',
      });
    }
  }, [selectedEdge]);

  const updateNodeStyle = (updates) => {
    const newStyle = { ...nodeStyle, ...updates };
    setNodeStyle(newStyle);
    if (selectedNode) {
      onNodeStyleChange(selectedNode.id, newStyle);
    }
  };

  const updateEdgeStyle = (updates) => {
    const newStyle = { ...edgeStyle, ...updates };
    setEdgeStyle(newStyle);
    if (selectedEdge) {
      onEdgeStyleChange(selectedEdge.id, newStyle);
    }
  };

  const updateNodeLabel = (newLabel) => {
    setNodeLabel(newLabel);
    if (selectedNode && onNodeDataChange) {
      onNodeDataChange(selectedNode.id, { label: newLabel });
    }
  };

  const updateServiceType = (newType) => {
    setServiceType(newType);
    if (selectedNode && selectedNode.data.nodeType === 'service' && onNodeDataChange) {
      onNodeDataChange(selectedNode.id, { type: newType });
    }
  };

  const updateServiceIcon = (newIcon) => {
    setServiceIcon(newIcon);
    if (selectedNode && selectedNode.data.nodeType === 'service' && onNodeDataChange) {
      onNodeDataChange(selectedNode.id, { icon: newIcon });
    }
  };

  if (!createMode && !selectedNode && !selectedEdge) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '0',
        right: '0',
        width: '400px',
        height: '100vh',
        overflowY: 'auto',
        background: colors.background.white,
        boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
        zIndex: 2000,
        borderLeft: `3px solid ${colors.primary[500]}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: colors.background.white,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>
            {createMode
              ? 'Create New Service'
              : selectedNode
              ? `Edit ${selectedNode.data.nodeType === 'group' ? 'Group' : 'Service'}`
              : 'Edit Edge'}
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            {selectedNode && onNodeDelete && (
              <button
                onClick={() => setDeleteDialogOpen(true)}
                style={{
                  background: '#ffffff',
                  border: 'none',
                  color: '#ef4444',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#ef4444';
                }}
              >
                <DeleteIcon style={{ fontSize: '24px' }} />
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: '#ffffff',
                border: 'none',
                color: '#667eea',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '24px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ×
            </button>
          </div>
        </div>
        {createMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              value={newServiceData.label}
              onChange={(e) => setNewServiceData({ ...newServiceData, label: e.target.value })}
              placeholder="Service name (e.g., API Client)"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '18px',
                fontWeight: '500',
                color: '#ffffff',
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
                e.target.style.borderColor = 'rgba(255,255,255,0.6)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            />
            <select
              value={newServiceData.type}
              onChange={(e) => setNewServiceData({ ...newServiceData, type: e.target.value })}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '16px',
                color: '#ffffff',
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="API" style={{ background: '#667eea', color: '#ffffff' }}>API</option>
              <option value="Database" style={{ background: '#667eea', color: '#ffffff' }}>Database</option>
              <option value="Queue" style={{ background: '#667eea', color: '#ffffff' }}>Queue</option>
              <option value="Storage" style={{ background: '#667eea', color: '#ffffff' }}>Storage</option>
              <option value="Cache" style={{ background: '#667eea', color: '#ffffff' }}>Cache</option>
              <option value="Server" style={{ background: '#667eea', color: '#ffffff' }}>Server</option>
              <option value="Cloud" style={{ background: '#667eea', color: '#ffffff' }}>Cloud</option>
            </select>
            <select
              value={newServiceData.group}
              onChange={(e) => setNewServiceData({ ...newServiceData, group: e.target.value })}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '16px',
                color: '#ffffff',
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="" style={{ background: '#667eea', color: '#ffffff' }}>No Group (Standalone)</option>
              {availableGroups.map((group) => (
                <option key={group.id} value={group.id} style={{ background: '#667eea', color: '#ffffff' }}>
                  {group.label}
                </option>
              ))}
            </select>

            {/* Icon Selection */}
            <div style={{ marginTop: '4px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ffffff',
                  opacity: 0.9,
                }}
              >
                Service Icon (Optional)
              </label>
              <IconPickerGrid
                selectedIconType={newServiceData.icon || newServiceData.type.toLowerCase()}
                onIconSelect={(iconKey) => setNewServiceData({ ...newServiceData, icon: iconKey })}
                iconSize={40}
              />
              <p
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#ffffff',
                  opacity: 0.7,
                }}
              >
                {newServiceData.icon
                  ? 'Custom icon selected'
                  : 'Defaults to service type icon'}
              </p>
            </div>

            <button
              onClick={() => {
                if (newServiceData.label && onServiceCreate) {
                  onServiceCreate(newServiceData);
                  setNewServiceData({ type: 'API', label: '', group: '', icon: '' });
                  onClose();
                }
              }}
              disabled={!newServiceData.label}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#ffffff',
                background: newServiceData.label
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'rgba(255,255,255,0.3)',
                border: 'none',
                borderRadius: '10px',
                cursor: newServiceData.label ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (newServiceData.label) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Create Service
            </button>
          </div>
        ) : selectedNode && (
          <input
            type="text"
            value={nodeLabel}
            onChange={(e) => updateNodeLabel(e.target.value)}
            placeholder={selectedNode.data.nodeType === 'group' ? 'Group name' : 'Service name'}
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: '18px',
              fontWeight: '500',
              color: '#ffffff',
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '10px',
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)';
              e.target.style.borderColor = 'rgba(255,255,255,0.6)';
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
          />
        )}

        {/* Service Type and Icon Selection (Edit Mode for Services Only) */}
        {!createMode && selectedNode && selectedNode.data.nodeType === 'service' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <select
              value={serviceType}
              onChange={(e) => updateServiceType(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '16px',
                color: '#ffffff',
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="API" style={{ background: '#667eea', color: '#ffffff' }}>API</option>
              <option value="Database" style={{ background: '#667eea', color: '#ffffff' }}>Database</option>
              <option value="Queue" style={{ background: '#667eea', color: '#ffffff' }}>Queue</option>
              <option value="Storage" style={{ background: '#667eea', color: '#ffffff' }}>Storage</option>
              <option value="Cache" style={{ background: '#667eea', color: '#ffffff' }}>Cache</option>
              <option value="Server" style={{ background: '#667eea', color: '#ffffff' }}>Server</option>
              <option value="Cloud" style={{ background: '#667eea', color: '#ffffff' }}>Cloud</option>
            </select>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ffffff',
                  opacity: 0.9,
                }}
              >
                Service Icon
              </label>
              <IconPickerGrid
                selectedIconType={serviceIcon || serviceType.toLowerCase()}
                onIconSelect={updateServiceIcon}
                iconSize={40}
              />
              <p
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#ffffff',
                  opacity: 0.7,
                }}
              >
                {serviceIcon
                  ? 'Custom icon selected'
                  : 'Using default type icon'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '24px' }}>
        {/* Node Editing */}
        {!createMode && selectedNode && (
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Background Color */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '10px',
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
                {colorOptions.map((color, index) => (
                  <button
                    key={`bg-color-${index}`}
                    onClick={() => updateNodeStyle({ backgroundColor: color })}
                    title={color}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '8px',
                      background: color,
                      border:
                        nodeStyle.backgroundColor === color
                          ? `4px solid ${colors.primary[500]}`
                          : `2px solid ${colors.neutral[300]}`,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s',
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
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '10px',
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
                {colorOptions.map((color, index) => (
                  <button
                    key={`border-color-${index}`}
                    onClick={() => updateNodeStyle({ borderColor: color })}
                    title={color}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '8px',
                      background: color,
                      border:
                        nodeStyle.borderColor === color
                          ? `4px solid ${colors.accent.emerald[500]}`
                          : `2px solid ${colors.neutral[300]}`,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '10px',
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
                {colorOptions.map((color, index) => (
                  <button
                    key={`text-color-${index}`}
                    onClick={() => updateNodeStyle({ textColor: color })}
                    title={color}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '8px',
                      background: color,
                      border:
                        nodeStyle.textColor === color
                          ? `4px solid ${colors.accent.rose[500]}`
                          : `2px solid ${colors.neutral[300]}`,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
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
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '10px',
                  color: colors.neutral[700],
                }}
              >
                Border Width: {nodeStyle.borderWidth}px
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={nodeStyle.borderWidth}
                onChange={(e) => updateNodeStyle({ borderWidth: parseInt(e.target.value) })}
                style={{ width: '100%', height: '6px' }}
              />
            </div>

            {/* Border Style */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '10px',
                  color: colors.neutral[700],
                }}
              >
                Border Style
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['solid', 'dashed', 'dotted'].map((style) => (
                  <button
                    key={style}
                    onClick={() => updateNodeStyle({ borderStyle: style })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: `2px solid ${
                        nodeStyle.borderStyle === style ? colors.primary[500] : colors.neutral[300]
                      }`,
                      background:
                        nodeStyle.borderStyle === style ? colors.primary[50] : colors.background.white,
                      color: nodeStyle.borderStyle === style ? colors.primary[700] : colors.neutral[700],
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
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
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '10px',
                  color: colors.neutral[700],
                }}
              >
                Border Radius: {nodeStyle.borderRadius}px
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={nodeStyle.borderRadius}
                onChange={(e) => updateNodeStyle({ borderRadius: parseInt(e.target.value) })}
                style={{ width: '100%', height: '6px' }}
              />
            </div>

            {/* Animation */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '10px',
                  color: colors.neutral[700],
                }}
              >
                Animation
              </label>
              <select
                value={nodeStyle.animation}
                onChange={(e) => updateNodeStyle({ animation: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${colors.neutral[300]}`,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                {animations.map((anim) => (
                  <option key={anim.value} value={anim.value}>
                    {anim.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview */}
            <div
              style={{
                marginTop: '10px',
                paddingTop: '20px',
                borderTop: `2px solid ${colors.neutral[200]}`,
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: colors.neutral[700],
                }}
              >
                Preview
              </label>
              <div
                className={nodeStyle.animation !== 'none' ? nodeStyle.animation : ''}
                style={{
                  background: nodeStyle.backgroundColor,
                  border: `${nodeStyle.borderWidth}px ${nodeStyle.borderStyle} ${nodeStyle.borderColor}`,
                  borderRadius: `${nodeStyle.borderRadius}px`,
                  padding: '20px',
                  textAlign: 'center',
                  color: nodeStyle.textColor,
                  fontSize: nodeStyle.fontSize,
                  fontWeight: nodeStyle.fontWeight,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                }}
              >
                {nodeLabel || (selectedNode.data.nodeType === 'group' ? 'Unnamed Group' : 'Unnamed Service')}
              </div>
            </div>
          </div>
        )}

        {/* Edge Editing */}
        {selectedEdge && (
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Edge Color */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '10px',
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
                {colorOptions.map((color, index) => (
                  <button
                    key={`edge-color-${index}`}
                    onClick={() => updateEdgeStyle({ stroke: color })}
                    title={color}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '8px',
                      background: color,
                      border:
                        edgeStyle.stroke === color
                          ? `4px solid ${colors.primary[500]}`
                          : `2px solid ${colors.neutral[300]}`,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
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
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '10px',
                  color: colors.neutral[700],
                }}
              >
                Edge Width: {edgeStyle.strokeWidth}px
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={edgeStyle.strokeWidth}
                onChange={(e) => updateEdgeStyle({ strokeWidth: parseInt(e.target.value) })}
                style={{ width: '100%', height: '6px' }}
              />
            </div>

            {/* Edge Style */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '10px',
                  color: colors.neutral[700],
                }}
              >
                Edge Style
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => updateEdgeStyle({ strokeDasharray: '0' })}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${
                      edgeStyle.strokeDasharray === '0' ? colors.primary[500] : colors.neutral[300]
                    }`,
                    background:
                      edgeStyle.strokeDasharray === '0' ? colors.primary[50] : colors.background.white,
                    color: edgeStyle.strokeDasharray === '0' ? colors.primary[700] : colors.neutral[700],
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}
                >
                  Solid
                </button>
                <button
                  onClick={() => updateEdgeStyle({ strokeDasharray: '5,5' })}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${
                      edgeStyle.strokeDasharray === '5,5' ? colors.primary[500] : colors.neutral[300]
                    }`,
                    background:
                      edgeStyle.strokeDasharray === '5,5' ? colors.primary[50] : colors.background.white,
                    color: edgeStyle.strokeDasharray === '5,5' ? colors.primary[700] : colors.neutral[700],
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}
                >
                  Dashed
                </button>
                <button
                  onClick={() => updateEdgeStyle({ strokeDasharray: '2,2' })}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${
                      edgeStyle.strokeDasharray === '2,2' ? colors.primary[500] : colors.neutral[300]
                    }`,
                    background:
                      edgeStyle.strokeDasharray === '2,2' ? colors.primary[50] : colors.background.white,
                    color: edgeStyle.strokeDasharray === '2,2' ? colors.primary[700] : colors.neutral[700],
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}
                >
                  Dotted
                </button>
              </div>
            </div>

            {/* Edge Type */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '10px',
                  color: colors.neutral[700],
                }}
              >
                Edge Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {['smoothstep', 'bezier', 'straight', 'step'].map((type) => (
                  <button
                    key={type}
                    onClick={() => updateEdgeStyle({ edgeType: type })}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: `2px solid ${
                        edgeStyle.edgeType === type ? colors.primary[500] : colors.neutral[300]
                      }`,
                      background:
                        edgeStyle.edgeType === type ? colors.primary[50] : colors.background.white,
                      color: edgeStyle.edgeType === type ? colors.primary[700] : colors.neutral[700],
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Arrow Direction */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '10px',
                  color: colors.neutral[700],
                }}
              >
                Arrow Direction
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `2px solid ${colors.neutral[300]}`,
                    background: colors.background.white,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={edgeStyle.markerStart}
                    onChange={(e) => updateEdgeStyle({ markerStart: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: '500', color: colors.neutral[700] }}>
                    ← Start Arrow
                  </span>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `2px solid ${colors.neutral[300]}`,
                    background: colors.background.white,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={edgeStyle.markerEnd}
                    onChange={(e) => updateEdgeStyle({ markerEnd: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: '500', color: colors.neutral[700] }}>
                    End Arrow →
                  </span>
                </label>
              </div>
            </div>

            {/* Animated Toggle */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={edgeStyle.animated}
                  onChange={(e) => updateEdgeStyle({ animated: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.neutral[700],
                  }}
                >
                  Animated Flow
                </span>
              </label>
            </div>

            {/* Animation */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '10px',
                  color: colors.neutral[700],
                }}
              >
                Animation Effect
              </label>
              <select
                value={edgeStyle.animation}
                onChange={(e) => updateEdgeStyle({ animation: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${colors.neutral[300]}`,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                {edgeAnimations.map((anim) => (
                  <option key={anim.value} value={anim.value}>
                    {anim.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview */}
            <div
              style={{
                marginTop: '10px',
                paddingTop: '20px',
                borderTop: `2px solid ${colors.neutral[200]}`,
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: colors.neutral[700],
                }}
              >
                Preview
              </label>
              <div
                style={{
                  padding: '20px',
                  background: colors.neutral[50],
                  borderRadius: '8px',
                }}
              >
                <svg width="100%" height="60">
                  <line
                    className={edgeStyle.animation !== 'none' ? edgeStyle.animation : ''}
                    x1="10"
                    y1="30"
                    x2="90%"
                    y2="30"
                    stroke={edgeStyle.stroke}
                    strokeWidth={edgeStyle.strokeWidth}
                    strokeDasharray={edgeStyle.strokeDasharray}
                  />
                  <circle cx="95%" cy="30" r="4" fill={edgeStyle.stroke} />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {selectedNode && (
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            style: {
              backgroundColor: '#1f2937',
              color: '#ffffff',
              borderRadius: '12px',
              minWidth: '400px',
            },
          }}
        >
       
          <DialogContent>
            <p style={{ margin: 0, fontSize: '16px' }}>
              Are you sure you want to delete this {selectedNode.data.nodeType}?
            </p>
          </DialogContent>
          <DialogActions style={{ padding: '16px 24px' }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              style={{
                backgroundColor: '#374151',
                color: '#ffffff',
                textTransform: 'none',
                borderRadius: '8px',
                padding: '8px 32px',
                fontSize: '15px',
                fontWeight: '500',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                onNodeDelete(selectedNode.id);
                setDeleteDialogOpen(false);
                onClose();
              }}
              style={{
                backgroundColor: '#6ee7b7',
                color: '#1f2937',
                textTransform: 'none',
                borderRadius: '8px',
                padding: '8px 32px',
                fontSize: '15px',
                fontWeight: '500',
              }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
