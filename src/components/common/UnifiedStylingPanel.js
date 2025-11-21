'use client';

import { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Tabs,
  Tab,
  Divider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PaletteIcon from '@mui/icons-material/Palette';
import StyleIcon from '@mui/icons-material/Style';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ColorPickerGrid from './ColorPickerGrid';

/**
 * UnifiedStylingPanel Component
 * Comprehensive reusable styling panel for all diagram types
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether panel is open
 * @param {function} props.onClose - Callback to close panel
 * @param {Object} props.selectedElement - Currently selected element (node/edge/text)
 * @param {function} props.onStyleChange - Callback when styles change
 * @param {string} props.elementType - Type: 'node', 'edge', 'text', or 'global'
 */
export default function UnifiedStylingPanel({
  open = false,
  onClose,
  selectedElement,
  onStyleChange,
  elementType = 'node'
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [styles, setStyles] = useState({
    // Node styles
    backgroundColor: selectedElement?.backgroundColor || '#FFFFFF',
    borderColor: selectedElement?.borderColor || '#3B82F6',
    borderWidth: selectedElement?.borderWidth || 2,
    borderStyle: selectedElement?.borderStyle || 'solid',
    borderRadius: selectedElement?.borderRadius || 8,
    textColor: selectedElement?.textColor || '#1F2937',
    animation: selectedElement?.animation || 'none',

    // Edge styles
    stroke: selectedElement?.stroke || '#3B82F6',
    strokeWidth: selectedElement?.strokeWidth || 2,
    strokeDasharray: selectedElement?.strokeDasharray || '0',
    animated: selectedElement?.animated || false,
    edgeAnimation: selectedElement?.edgeAnimation || 'none',

    // Text styles
    fontFamily: selectedElement?.fontFamily || 'Arial, sans-serif',
    fontSize: selectedElement?.fontSize || 16,
    fontWeight: selectedElement?.fontWeight || '400',
    fontStyle: selectedElement?.fontStyle || 'normal',
    textDecoration: selectedElement?.textDecoration || 'none',
    textAnimation: selectedElement?.textAnimation || 'none',
  });

  const handleStyleChange = (key, value) => {
    const newStyles = { ...styles, [key]: value };
    setStyles(newStyles);
    if (onStyleChange) {
      onStyleChange(newStyles);
    }
  };

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

  const textAnimations = [
    { value: 'none', label: 'None' },
    { value: 'fade-in', label: 'Fade In' },
    { value: 'slide-in-left', label: 'Slide Left' },
    { value: 'slide-in-right', label: 'Slide Right' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'pulse', label: 'Pulse' },
    { value: 'shake', label: 'Shake' },
    { value: 'glow', label: 'Glow' },
  ];

  const fontFamilies = [
    'Arial, sans-serif',
    'Georgia, serif',
    'Times New Roman, serif',
    'Courier New, monospace',
    'Verdana, sans-serif',
    'Comic Sans MS, cursive',
    'Trebuchet MS, sans-serif',
    'Impact, sans-serif',
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          bgcolor: '#F9FAFB',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: '#FFFFFF',
          borderBottom: '2px solid #E5E7EB',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaletteIcon sx={{ color: '#3B82F6' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
            Diagram Styling
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
          },
        }}
      >
        <Tab icon={<StyleIcon />} label="Styling" />
        <Tab icon={<HelpOutlineIcon />} label="Guide" />
      </Tabs>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Node Styling */}
            {(elementType === 'node' || elementType === 'global') && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>
                  Node Styling
                </Typography>

                {/* Background Color */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#4B5563' }}>
                    Background Color
                  </Typography>
                  <ColorPickerGrid
                    colorType="node"
                    selectedColor={styles.backgroundColor}
                    onColorSelect={(color) => handleStyleChange('backgroundColor', color)}
                  />
                </Box>

                {/* Border Color */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#4B5563' }}>
                    Border Color
                  </Typography>
                  <ColorPickerGrid
                    colorType="border"
                    selectedColor={styles.borderColor}
                    onColorSelect={(color) => handleStyleChange('borderColor', color)}
                  />
                </Box>

                {/* Border Width */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                    Border Width: {styles.borderWidth}px
                  </Typography>
                  <Slider
                    value={styles.borderWidth}
                    onChange={(e, value) => handleStyleChange('borderWidth', value)}
                    min={1}
                    max={10}
                    marks
                    sx={{ color: '#3B82F6' }}
                  />
                </Box>

                {/* Border Style */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                    Border Style
                  </Typography>
                  <ToggleButtonGroup
                    value={styles.borderStyle}
                    exclusive
                    onChange={(e, value) => value && handleStyleChange('borderStyle', value)}
                    fullWidth
                    size="small"
                  >
                    <ToggleButton value="solid">Solid</ToggleButton>
                    <ToggleButton value="dashed">Dashed</ToggleButton>
                    <ToggleButton value="dotted">Dotted</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* Border Radius */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                    Border Radius: {styles.borderRadius}px
                  </Typography>
                  <Slider
                    value={styles.borderRadius}
                    onChange={(e, value) => handleStyleChange('borderRadius', value)}
                    min={0}
                    max={50}
                    marks
                    sx={{ color: '#3B82F6' }}
                  />
                </Box>

                {/* Text Color */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#4B5563' }}>
                    Text Color
                  </Typography>
                  <ColorPickerGrid
                    colorType="text"
                    selectedColor={styles.textColor}
                    onColorSelect={(color) => handleStyleChange('textColor', color)}
                  />
                </Box>

                {/* Animation */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                    Animation
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={styles.animation}
                      onChange={(e) => handleStyleChange('animation', e.target.value)}
                    >
                      {nodeAnimations.map((anim) => (
                        <MenuItem key={anim.value} value={anim.value}>
                          {anim.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Divider />
              </>
            )}

            {/* Edge Styling */}
            {(elementType === 'edge' || elementType === 'global') && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>
                  Edge Styling
                </Typography>

                {/* Edge Color */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#4B5563' }}>
                    Edge Color
                  </Typography>
                  <ColorPickerGrid
                    colorType="edge"
                    selectedColor={styles.stroke}
                    onColorSelect={(color) => handleStyleChange('stroke', color)}
                  />
                </Box>

                {/* Edge Width */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                    Edge Width: {styles.strokeWidth}px
                  </Typography>
                  <Slider
                    value={styles.strokeWidth}
                    onChange={(e, value) => handleStyleChange('strokeWidth', value)}
                    min={1}
                    max={10}
                    marks
                    sx={{ color: '#3B82F6' }}
                  />
                </Box>

                {/* Edge Style */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                    Edge Style
                  </Typography>
                  <ToggleButtonGroup
                    value={styles.strokeDasharray === '0' ? 'solid' : styles.strokeDasharray === '5,5' ? 'dashed' : 'dotted'}
                    exclusive
                    onChange={(e, value) => {
                      if (value) {
                        const dashValue = value === 'solid' ? '0' : value === 'dashed' ? '5,5' : '2,2';
                        handleStyleChange('strokeDasharray', dashValue);
                      }
                    }}
                    fullWidth
                    size="small"
                  >
                    <ToggleButton value="solid">Solid</ToggleButton>
                    <ToggleButton value="dashed">Dashed</ToggleButton>
                    <ToggleButton value="dotted">Dotted</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* Edge Animation */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                    Animation
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={styles.edgeAnimation}
                      onChange={(e) => handleStyleChange('edgeAnimation', e.target.value)}
                    >
                      {edgeAnimations.map((anim) => (
                        <MenuItem key={anim.value} value={anim.value}>
                          {anim.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Divider />
              </>
            )}

            {/* Text Styling */}
            {(elementType === 'text' || elementType === 'global') && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>
                  Text Styling
                </Typography>

                {/* Font Family */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                    Font Family
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={styles.fontFamily}
                      onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                    >
                      {fontFamilies.map((font) => (
                        <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                          {font.split(',')[0]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Font Size */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                    Font Size: {styles.fontSize}px
                  </Typography>
                  <Slider
                    value={styles.fontSize}
                    onChange={(e, value) => handleStyleChange('fontSize', value)}
                    min={10}
                    max={48}
                    marks
                    sx={{ color: '#3B82F6' }}
                  />
                </Box>

                {/* Text Style */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                    Text Style
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant={styles.fontWeight === '700' ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleStyleChange('fontWeight', styles.fontWeight === '700' ? '400' : '700')}
                      sx={{ flex: 1 }}
                    >
                      Bold
                    </Button>
                    <Button
                      variant={styles.fontStyle === 'italic' ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleStyleChange('fontStyle', styles.fontStyle === 'italic' ? 'normal' : 'italic')}
                      sx={{ flex: 1 }}
                    >
                      Italic
                    </Button>
                    <Button
                      variant={styles.textDecoration === 'underline' ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleStyleChange('textDecoration', styles.textDecoration === 'underline' ? 'none' : 'underline')}
                      sx={{ flex: 1 }}
                    >
                      Underline
                    </Button>
                  </Box>
                </Box>

                {/* Text Animation */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                    Animation
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={styles.textAnimation}
                      onChange={(e) => handleStyleChange('textAnimation', e.target.value)}
                    >
                      {textAnimations.map((anim) => (
                        <MenuItem key={anim.value} value={anim.value}>
                          {anim.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <StylingGuide />
        )}
      </Box>
    </Drawer>
  );
}

// Styling Guide Component
function StylingGuide() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
        Complete Styling Guide
      </Typography>

      <Typography variant="body2" sx={{ color: '#6B7280' }}>
        Complete guide to customizing your diagrams with colors, styles, and animations.
      </Typography>

      <Divider />

      {/* Node Animations */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600 }}>🎬 Node Animations</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <AnimationItem
              name="Pulse"
              description="Gentle scaling breathing effect"
              duration="2s"
              useCase="Highlight important nodes"
            />
            <AnimationItem
              name="Float"
              description="Smooth up and down motion"
              duration="3s"
              useCase="Create floating effect"
            />
            <AnimationItem
              name="Glow"
              description="Glowing shadow effect"
              duration="2s"
              useCase="Emphasize critical nodes"
            />
            <AnimationItem
              name="Shake"
              description="Attention-grabbing shake"
              duration="0.5s"
              useCase="Alert or warning states"
            />
            <AnimationItem
              name="Rotate"
              description="Continuous rotation"
              duration="4s"
              useCase="Loading or processing"
            />
            <AnimationItem
              name="Bounce"
              description="Bouncing motion"
              duration="2s"
              useCase="Playful, energetic feel"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Edge Animations */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600 }}>🔗 Edge Animations</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <AnimationItem
              name="Flow"
              description="Animated flow along edge"
              duration="1s"
              useCase="Show data flow"
            />
            <AnimationItem
              name="Pulse"
              description="Pulsing thickness"
              duration="2s"
              useCase="Active connections"
            />
            <AnimationItem
              name="Glow"
              description="Glowing effect"
              duration="2s"
              useCase="Highlight paths"
            />
            <AnimationItem
              name="Dash Flow"
              description="Animated dashed line"
              duration="1s"
              useCase="Indicate movement"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Text Animations */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600 }}>📝 Text Animations</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <AnimationItem
              name="Fade In"
              description="Smooth fade entrance"
              duration="1s"
              useCase="Subtle appearance"
            />
            <AnimationItem
              name="Slide Left"
              description="Slide from left"
              duration="0.8s"
              useCase="Dynamic entry"
            />
            <AnimationItem
              name="Slide Right"
              description="Slide from right"
              duration="0.8s"
              useCase="Dynamic entry"
            />
            <AnimationItem
              name="Bounce"
              description="Bouncing effect"
              duration="2s"
              useCase="Fun, playful"
            />
            <AnimationItem
              name="Pulse"
              description="Scale pulsing"
              duration="2s"
              useCase="Breathing effect"
            />
            <AnimationItem
              name="Shake"
              description="Shaking motion"
              duration="0.8s"
              useCase="Attention"
            />
            <AnimationItem
              name="Glow"
              description="Text shadow glow"
              duration="2s"
              useCase="Emphasis"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Color Palette */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600 }}>🎨 Color Palette</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ColorSection title="Primary Colors" colors={[
              { name: 'Blue', hex: '#3B82F6', description: 'Main brand color' },
              { name: 'Purple', hex: '#8B5CF6', description: 'Accent color' },
            ]} />
            <ColorSection title="Accent Colors" colors={[
              { name: 'Emerald', hex: '#10B981', description: 'Success' },
              { name: 'Rose', hex: '#F43F5E', description: 'Error' },
              { name: 'Amber', hex: '#F59E0B', description: 'Warning' },
            ]} />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Tips */}
      <Box
        sx={{
          bgcolor: '#EFF6FF',
          border: '1px solid #DBEAFE',
          borderRadius: 2,
          p: 2,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#1E40AF' }}>
          💡 Pro Tips
        </Typography>
        <Typography variant="body2" sx={{ color: '#1E40AF', fontSize: '13px' }}>
          • Use subtle animations for professional diagrams<br />
          • Combine colors from the same palette for harmony<br />
          • Use high contrast for important elements<br />
          • Test animations before finalizing
        </Typography>
      </Box>
    </Box>
  );
}

// Helper component for animation items
function AnimationItem({ name, description, duration, useCase }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
          {name}
        </Typography>
        <Chip label={duration} size="small" sx={{ height: 20, fontSize: '11px' }} />
      </Box>
      <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '13px', mb: 0.5 }}>
        {description}
      </Typography>
      <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '12px', fontStyle: 'italic' }}>
        Use case: {useCase}
      </Typography>
    </Box>
  );
}

// Helper component for color sections
function ColorSection({ title, colors }) {
  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {colors.map((color) => (
          <Box key={color.hex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: color.hex,
                border: '2px solid #E5E7EB',
              }}
            />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                {color.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                {color.hex} • {color.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
