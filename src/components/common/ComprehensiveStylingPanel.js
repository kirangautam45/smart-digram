'use client';

import { useState, useEffect } from 'react';
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
  Switch,
  FormControlLabel,
  TextField,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PaletteIcon from '@mui/icons-material/Palette';
import StyleIcon from '@mui/icons-material/Style';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ColorPickerGrid from './ColorPickerGrid';
import useColorPaletteStore from '@/store/colorPaletteStore';
import { colors } from '@/components/theme/theme';

/**
 * ComprehensiveStylingPanel Component
 * Ultimate reusable styling panel combining ALL features from:
 * - DiagramStylePanel
 * - NodeEditorPanel
 * - TextStylePanel
 * - ColorPaletteSelectorPanel
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether panel is open
 * @param {function} props.onClose - Callback to close panel
 * @param {Object} props.selectedElement - Currently selected element (node/edge/text)
 * @param {function} props.onStyleChange - Callback when styles change
 * @param {string} props.mode - Mode: 'global', 'node', 'edge', 'text'
 * @param {Object} props.initialStyles - Initial style values
 */
export default function ComprehensiveStylingPanel({
  open = false,
  onClose,
  selectedElement,
  onStyleChange,
  mode = 'global',
  initialStyles = {}
}) {
  const [activeTab, setActiveTab] = useState(0);

  // Initialize styles from initialStyles or selectedElement
  const [styles, setStyles] = useState({
    // Node styles
    backgroundColor: initialStyles.backgroundColor || selectedElement?.backgroundColor || '#FFFFFF',
    borderColor: initialStyles.borderColor || selectedElement?.borderColor || '#8B5CF6',
    borderWidth: initialStyles.borderWidth || selectedElement?.borderWidth || 2,
    borderStyle: initialStyles.borderStyle || selectedElement?.borderStyle || 'solid',
    borderRadius: initialStyles.borderRadius || selectedElement?.borderRadius || 8,
    textColor: initialStyles.textColor || selectedElement?.textColor || '#1F2937',
    fontSize: initialStyles.fontSize || selectedElement?.fontSize || '14',
    fontWeight: initialStyles.fontWeight || selectedElement?.fontWeight || '600',
    fontFamily: initialStyles.fontFamily || selectedElement?.fontFamily || 'inherit',
    boxShadow: initialStyles.boxShadow || selectedElement?.boxShadow || 'none',
    animation: initialStyles.animation || selectedElement?.animation || 'none',

    // Edge styles
    stroke: initialStyles.stroke || selectedElement?.stroke || '#8B5CF6',
    strokeWidth: initialStyles.strokeWidth || selectedElement?.strokeWidth || 2,
    strokeDasharray: initialStyles.strokeDasharray || selectedElement?.strokeDasharray || '',
    animated: initialStyles.animated || selectedElement?.animated || false,
    markerColor: initialStyles.markerColor || selectedElement?.markerColor || '#8B5CF6',
    labelBgColor: initialStyles.labelBgColor || selectedElement?.labelBgColor || '#F3E8FF',
    labelTextColor: initialStyles.labelTextColor || selectedElement?.labelTextColor || '#8B5CF6',
    edgeAnimation: initialStyles.edgeAnimation || selectedElement?.edgeAnimation || 'none',

    // Text styles
    textFontFamily: initialStyles.textFontFamily || selectedElement?.textFontFamily || 'Arial, sans-serif',
    textFontSize: initialStyles.textFontSize || selectedElement?.textFontSize || '16px',
    textFontWeight: initialStyles.textFontWeight || selectedElement?.textFontWeight || '400',
    textFontStyle: initialStyles.textFontStyle || selectedElement?.textFontStyle || 'normal',
    textDecoration: initialStyles.textDecoration || selectedElement?.textDecoration || 'none',
    textAnimation: initialStyles.textAnimation || selectedElement?.textAnimation || 'none',
  });

  // Update styles when selectedElement changes
  useEffect(() => {
    if (selectedElement) {
      setStyles(prev => ({
        ...prev,
        ...selectedElement
      }));
    }
  }, [selectedElement]);

  const handleStyleChange = (key, value) => {
    const newStyles = { ...styles, [key]: value };
    setStyles(newStyles);
    if (onStyleChange) {
      onStyleChange(newStyles);
    }
  };

  // Animation options
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
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' },
    { value: 'inherit', label: 'Geist Sans' },
    { value: 'monospace', label: 'Geist Mono' },
  ];

  const fontSizes = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];

  const showNodeTab = mode === 'global' || mode === 'node';
  const showEdgeTab = mode === 'global' || mode === 'edge';
  const showTextTab = mode === 'global' || mode === 'text';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 450 },
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
          p: 2.5,
          bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          color: 'white',
        }}
      >
       

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
        sx={{
          bgcolor: '#FFFFFF',
          borderBottom: '2px solid #E5E7EB',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '13px',
          },
        }}
      >
        <Tab icon={<StyleIcon fontSize="small" />} label="Styles" iconPosition="start" />
        <Tab icon={<ColorLensIcon fontSize="small" />} label="Palettes" iconPosition="start" />
        <Tab icon={<HelpOutlineIcon fontSize="small" />} label="Guide" iconPosition="start" />
      </Tabs>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
        {/* TAB 1: STYLES */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* NODE STYLING */}
            {showNodeTab && (
              <>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#F0F9FF', border: '1px solid #BFDBFE' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E40AF', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StyleIcon fontSize="small" />
                    Node Styling
                  </Typography>

                  {/* Background Color */}
                  <Box sx={{ mb: 2.5 }}>
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
                  <Box sx={{ mb: 2.5 }}>
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
                  <Box sx={{ mb: 2.5 }}>
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
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                      Border Style
                    </Typography>
                   <ToggleButton value="solid" sx={{ color: '#0284C7', borderColor: '#0284C7' }}>
  Solid
</ToggleButton>
<ToggleButton value="dashed" sx={{ color: '#CA8A04', borderColor: '#CA8A04' }}>
  Dashed
</ToggleButton>
<ToggleButton value="dotted" sx={{ color: '#DC2626', borderColor: '#DC2626' }}>
  Dotted
</ToggleButton>

                  </Box>

                  {/* Border Radius */}
                  <Box sx={{ mb: 2.5 }}>
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
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#4B5563' }}>
                      Text Color
                    </Typography>
                    <ColorPickerGrid
                      colorType="text"
                      selectedColor={styles.textColor}
                      onColorSelect={(color) => handleStyleChange('textColor', color)}
                    />
                  </Box>

                  {/* Font Size */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                      Font Size
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={styles.fontSize}
                        onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                      >
                        {['10', '12', '14', '16', '18', '20', '24'].map((size) => (
                          <MenuItem key={size} value={size}>{size}px</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Font Weight */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                      Font Weight
                    </Typography>
                    <ToggleButtonGroup
                      value={styles.fontWeight}
                      exclusive
                      onChange={(e, value) => value && handleStyleChange('fontWeight', value)}
                      fullWidth
                      size="small"
                    >
                      <ToggleButton value="400">Normal</ToggleButton>
                      <ToggleButton value="600">Semibold</ToggleButton>
                      <ToggleButton value="700">Bold</ToggleButton>
                    </ToggleButtonGroup>
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

                  {/* Preview */}
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #BFDBFE' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#4B5563' }}>
                      Preview
                    </Typography>
                    <Box
                      className={styles.animation !== 'none' ? styles.animation : ''}
                      sx={{
                        background: styles.backgroundColor,
                        border: `${styles.borderWidth}px ${styles.borderStyle} ${styles.borderColor}`,
                        borderRadius: `${styles.borderRadius}px`,
                        padding: 2,
                        textAlign: 'center',
                        color: styles.textColor,
                        fontSize: `${styles.fontSize}px`,
                        fontWeight: styles.fontWeight,
                      }}
                    >
                      Sample Node
                    </Box>
                  </Box>
                </Paper>
              </>
            )}

            {/* EDGE STYLING */}
            {showEdgeTab && (
              <>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#166534', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StyleIcon fontSize="small" />
                    Edge Styling
                  </Typography>

                  {/* Edge Color */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#4B5563' }}>
                      Edge Color
                    </Typography>
                    <ColorPickerGrid
                      colorType="edge"
                      selectedColor={styles.stroke}
                      onColorSelect={(color) => {
                        handleStyleChange('stroke', color);
                        handleStyleChange('markerColor', color);
                      }}
                    />
                  </Box>

                  {/* Edge Width */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                      Edge Width: {styles.strokeWidth}px
                    </Typography>
                    <Slider
                      value={styles.strokeWidth}
                      onChange={(e, value) => handleStyleChange('strokeWidth', value)}
                      min={1}
                      max={10}
                      marks
                      sx={{ color: '#10B981' }}
                    />
                  </Box>

                  {/* Edge Style */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                      Edge Style
                    </Typography>
                    <ToggleButtonGroup
                      value={styles.strokeDasharray === '' || styles.strokeDasharray === '0' ? 'solid' : styles.strokeDasharray === '5,5' ? 'dashed' : 'dotted'}
                      exclusive
                      onChange={(e, value) => {
                        if (value) {
                          const dashValue = value === 'solid' ? '' : value === 'dashed' ? '5,5' : '2,2';
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

                  {/* Animated Toggle */}
                  <Box sx={{ mb: 2.5 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={styles.animated}
                          onChange={(e) => handleStyleChange('animated', e.target.checked)}
                          color="success"
                        />
                      }
                      label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#4B5563' }}>Animated Flow</Typography>}
                    />
                  </Box>

                  {/* Edge Animation */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                      Animation Effect
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

                  {/* Label Colors */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#4B5563' }}>
                      Label Background Color
                    </Typography>
                    <ColorPickerGrid
                      colorType="node"
                      selectedColor={styles.labelBgColor}
                      onColorSelect={(color) => handleStyleChange('labelBgColor', color)}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#4B5563' }}>
                      Label Text Color
                    </Typography>
                    <ColorPickerGrid
                      colorType="text"
                      selectedColor={styles.labelTextColor}
                      onColorSelect={(color) => handleStyleChange('labelTextColor', color)}
                    />
                  </Box>

                  {/* Preview */}
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #BBF7D0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#4B5563' }}>
                      Preview
                    </Typography>
                    <Box sx={{ p: 2, background: '#F9FAFB', borderRadius: 2 }}>
                      <svg width="100%" height="60">
                        <line
                          className={styles.edgeAnimation !== 'none' ? styles.edgeAnimation : ''}
                          x1="10"
                          y1="30"
                          x2="90%"
                          y2="30"
                          stroke={styles.stroke}
                          strokeWidth={styles.strokeWidth}
                          strokeDasharray={styles.strokeDasharray}
                        />
                        <circle cx="95%" cy="30" r="4" fill={styles.markerColor} />
                      </svg>
                    </Box>
                  </Box>
                </Paper>
              </>
            )}

            {/* TEXT STYLING */}
            {showTextTab && (
              <>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#FEF3C7', border: '1px solid #FDE047' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#92400E', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextFieldsIcon fontSize="small" />
                    Text Styling
                  </Typography>

                  {/* Font Family */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                      Font Family
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={styles.textFontFamily}
                        onChange={(e) => handleStyleChange('textFontFamily', e.target.value)}
                      >
                        {fontFamilies.map((font) => (
                          <MenuItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                            {font.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Font Size */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                      Font Size
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={styles.textFontSize}
                        onChange={(e) => handleStyleChange('textFontSize', e.target.value)}
                      >
                        {fontSizes.map((size) => (
                          <MenuItem key={size} value={size}>{size}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Text Color */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#4B5563' }}>
                      Text Color
                    </Typography>
                    <ColorPickerGrid
                      colorType="text"
                      selectedColor={styles.textColor}
                      onColorSelect={(color) => handleStyleChange('textColor', color)}
                    />
                  </Box>

                  {/* Text Style */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#4B5563' }}>
                      Text Style
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant={styles.textFontWeight === '700' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleStyleChange('textFontWeight', styles.textFontWeight === '700' ? '400' : '700')}
                        sx={{ flex: 1 }}
                      >
                        Bold
                      </Button>
                      <Button
                        variant={styles.textFontStyle === 'italic' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleStyleChange('textFontStyle', styles.textFontStyle === 'italic' ? 'normal' : 'italic')}
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

                  {/* Preview */}
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #FDE047' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#4B5563' }}>
                      Preview
                    </Typography>
                    <Box
                      className={styles.textAnimation !== 'none' ? styles.textAnimation : ''}
                      sx={{
                        p: 2,
                        background: '#FFFFFF',
                        borderRadius: 2,
                        textAlign: 'center',
                        fontFamily: styles.textFontFamily,
                        fontSize: styles.textFontSize,
                        color: styles.textColor,
                        fontWeight: styles.textFontWeight,
                        fontStyle: styles.textFontStyle,
                        textDecoration: styles.textDecoration,
                      }}
                    >
                      Sample Text
                    </Box>
                  </Box>
                </Paper>
              </>
            )}
          </Box>
        )}

        {/* TAB 2: COLOR PALETTES */}
        {activeTab === 1 && (
          <ColorPaletteTab />
        )}

        {/* TAB 3: GUIDE */}
        {activeTab === 2 && (
          <StylingGuide />
        )}
      </Box>
    </Drawer>
  );
}

// Color Palette Tab Component
function ColorPaletteTab() {
  const currentPaletteId = useColorPaletteStore((state) => state.currentPaletteId);
  const setCurrentPalette = useColorPaletteStore((state) => state.setCurrentPalette);
  const getAllPalettesMetadata = useColorPaletteStore((state) => state.getAllPalettesMetadata);
  const getCurrentPalette = useColorPaletteStore((state) => state.getCurrentPalette);
  const getPaletteById = useColorPaletteStore((state) => state.getPaletteById);

  const palettes = getAllPalettesMetadata();
  const activePalette = getCurrentPalette();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
        Color Palettes
      </Typography>

      <Typography variant="body2" sx={{ color: '#6B7280' }}>
        Choose a color palette to apply across all color pickers in the styling panel.
      </Typography>

      {/* Active Palette Info */}
      <Paper elevation={0} sx={{ p: 2, bgcolor: '#EFF6FF', border: '1px solid #DBEAFE' }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Active Palette
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mt: 0.5 }}>
          {activePalette.name}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
          {activePalette.description}
        </Typography>
      </Paper>

      <Divider />

      {/* Palette Options */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {palettes.map((palette) => {
          const isActive = palette.id === currentPaletteId;
          const paletteColors = getPaletteById(palette.id);

          return (
            <Paper
              key={palette.id}
              elevation={isActive ? 3 : 0}
              onClick={() => setCurrentPalette(palette.id)}
              sx={{
                p: 2,
                cursor: 'pointer',
                border: isActive ? `3px solid ${colors.secondary[500]}` : '2px solid #E5E7EB',
                bgcolor: isActive ? colors.secondary[50] : '#FFFFFF',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: isActive ? colors.secondary[500] : colors.neutral[400],
                  bgcolor: isActive ? colors.secondary[50] : colors.neutral[50],
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#111827' }}>
                    {palette.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    {palette.description}
                  </Typography>
                </Box>
                {isActive && (
                  <Chip label="ACTIVE" size="small" color="secondary" sx={{ fontWeight: 700, fontSize: '10px' }} />
                )}
              </Box>

              {/* Color Preview */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0.5 }}>
                {paletteColors.edgeColors.slice(0, 8).map((color, index) => (
                  <Box
                    key={`preview-${palette.id}-${index}`}
                    sx={{
                      width: '100%',
                      height: 20,
                      borderRadius: 1,
                      background: color,
                      border: '1px solid #E5E7EB',
                    }}
                  />
                ))}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}

// Styling Guide Component (same as before, abbreviated here)
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
            <AnimationItem name="Pulse" description="Gentle scaling breathing effect" duration="2s" useCase="Highlight important nodes" />
            <AnimationItem name="Float" description="Smooth up and down motion" duration="3s" useCase="Create floating effect" />
            <AnimationItem name="Glow" description="Glowing shadow effect" duration="2s" useCase="Emphasize critical nodes" />
            <AnimationItem name="Shake" description="Attention-grabbing shake" duration="0.5s" useCase="Alert or warning states" />
            <AnimationItem name="Rotate" description="Continuous rotation" duration="4s" useCase="Loading or processing" />
            <AnimationItem name="Bounce" description="Bouncing motion" duration="2s" useCase="Playful, energetic feel" />
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
            <AnimationItem name="Flow" description="Animated flow along edge" duration="1s" useCase="Show data flow" />
            <AnimationItem name="Pulse" description="Pulsing thickness" duration="2s" useCase="Active connections" />
            <AnimationItem name="Glow" description="Glowing effect" duration="2s" useCase="Highlight paths" />
            <AnimationItem name="Dash Flow" description="Animated dashed line" duration="1s" useCase="Indicate movement" />
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
            <AnimationItem name="Fade In" description="Smooth fade entrance" duration="1s" useCase="Subtle appearance" />
            <AnimationItem name="Slide Left" description="Slide from left" duration="0.8s" useCase="Dynamic entry" />
            <AnimationItem name="Slide Right" description="Slide from right" duration="0.8s" useCase="Dynamic entry" />
            <AnimationItem name="Bounce" description="Bouncing effect" duration="2s" useCase="Fun, playful" />
            <AnimationItem name="Pulse" description="Scale pulsing" duration="2s" useCase="Breathing effect" />
            <AnimationItem name="Shake" description="Shaking motion" duration="0.8s" useCase="Attention" />
            <AnimationItem name="Glow" description="Text shadow glow" duration="2s" useCase="Emphasis" />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Pro Tips */}
      <Paper elevation={0} sx={{ bgcolor: '#EFF6FF', border: '1px solid #DBEAFE', p: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#1E40AF' }}>
          💡 Pro Tips
        </Typography>
        <Typography variant="body2" sx={{ color: '#1E40AF', fontSize: '13px', lineHeight: 1.6 }}>
          • Use subtle animations for professional diagrams<br />
          • Combine colors from the same palette for harmony<br />
          • Use high contrast for important elements<br />
          • Test animations before finalizing<br />
          • Limit animations on large diagrams for performance
        </Typography>
      </Paper>
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
