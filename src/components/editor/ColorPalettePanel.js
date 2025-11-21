"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Button,
  IconButton,
  Typography,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Predefined color palette (matching your screenshot colors)
const colorPalette = [
  // Row 1 - Light colors
  "#FFFFFF", "#E8E8E8", "#C5D9ED", "#F5D5D5",
  // Row 2 - Pastel colors
  "#FFF9D1", "#D5F5E3", "#E8DAEF", "#FAE5F0",
  // Row 3 - Vibrant colors
  "#7C3AED", "#3B82F6", "#10B981", "#EF4444",
  // Row 4 - Warm colors
  "#F59E0B", "#EC4899", "#374151", "#000000",
];

const ColorPalettePanel = ({
  open,
  onClose,
  elementType, // "node" or "edge"
  currentStyles = {},
  onApplyStyles,
  elementData,
  onTextChange, // NEW: callback for text editing
}) => {
  // Node states
  const [backgroundColor, setBackgroundColor] = useState(
    currentStyles.backgroundColor || "#FFFFFF"
  );
  const [borderColor, setBorderColor] = useState(
    currentStyles.borderColor || "#3B82F6"
  );
  const [textColor, setTextColor] = useState(
    currentStyles.textColor || "#000000"
  );
  const [borderWidth, setBorderWidth] = useState(
    currentStyles.borderWidth || 2
  );
  const [borderRadius, setBorderRadius] = useState(
    currentStyles.borderRadius || 5
  );
  const [nodeAnimation, setNodeAnimation] = useState(
    currentStyles.nodeAnimation || "none"
  );
  const [nodeText, setNodeText] = useState(
    elementData?.label || elementData?.data?.label || ""
  );

  // Edge states
  const [edgeColor, setEdgeColor] = useState(
    currentStyles.edgeColor || "#3B82F6"
  );
  const [edgeWidth, setEdgeWidth] = useState(
    currentStyles.edgeWidth || 2
  );
  const [edgeStyle, setEdgeStyle] = useState(
    currentStyles.edgeStyle || "solid"
  );
  const [animatedFlow, setAnimatedFlow] = useState(
    currentStyles.animatedFlow || false
  );
  const [animationEffect, setAnimationEffect] = useState(
    currentStyles.animationEffect || "none"
  );

  const handleApply = () => {
    if (elementType === "node") {
      onApplyStyles({
        backgroundColor,
        borderColor,
        textColor,
        borderWidth,
        borderRadius,
        nodeAnimation,
        text: nodeText,
      });
      if (onTextChange && nodeText !== (elementData?.label || elementData?.data?.label)) {
        onTextChange(nodeText);
      }
    } else if (elementType === "edge") {
      onApplyStyles({
        edgeColor,
        edgeWidth,
        edgeStyle,
        animatedFlow,
        animationEffect,
      });
    }
    onClose();
  };

  const ColorGrid = ({ selectedColor, onColorSelect }) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 1.5,
        mb: 2,
      }}
    >
      {colorPalette.map((color) => (
        <Box
          key={color}
          onClick={() => onColorSelect(color)}
          sx={{
            width: "100%",
            aspectRatio: "1",
            backgroundColor: color,
            border:
              selectedColor === color
                ? "3px solid #3B82F6"
                : "2px solid #E5E7EB",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              transform: "scale(1.1)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
          }}
        />
      ))}
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#3B82F6",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
        }}
      >
        <Typography variant="h6" fontWeight="600">
          {elementType === "node"
            ? `Edit Node: ${elementData?.label || elementData?.id || ""}`
            : "Edit Edge"
          }
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Customize this {elementType} individually
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, mt: 2, maxHeight: '70vh', overflowY: 'auto' }}>
        {elementType === "node" ? (
          // Node Customization
          <>
            {/* Text Editor - Enhanced */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" fontWeight="600" mb={1}>
                ✏️ Node Text
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={nodeText}
                onChange={(e) => setNodeText(e.target.value)}
                placeholder="Enter node text..."
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#3B82F6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3B82F6',
                    },
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Edit the label that appears on this node
              </Typography>
            </Box>

            <Typography variant="body1" fontWeight="600" mb={2}>
              🎨 Background Color
            </Typography>
            <ColorGrid
              selectedColor={backgroundColor}
              onColorSelect={setBackgroundColor}
            />

            <Typography variant="body1" fontWeight="600" mb={2} mt={3}>
              🖍️ Border Color
            </Typography>
            <ColorGrid
              selectedColor={borderColor}
              onColorSelect={setBorderColor}
            />

            <Typography variant="body1" fontWeight="600" mb={2} mt={3}>
              📝 Text Color
            </Typography>
            <ColorGrid
              selectedColor={textColor}
              onColorSelect={setTextColor}
            />

            <Divider sx={{ my: 3 }} />

            {/* Border Width */}
            <Typography variant="body1" fontWeight="600" mb={1}>
              📏 Border Width: {borderWidth}px
            </Typography>
            <Slider
              value={borderWidth}
              onChange={(_, val) => setBorderWidth(val)}
              min={0}
              max={10}
              step={0.5}
              marks
              valueLabelDisplay="auto"
              sx={{
                color: borderColor,
                mb: 3,
                "& .MuiSlider-thumb": {
                  bgcolor: borderColor,
                },
              }}
            />

            {/* Border Radius */}
            <Typography variant="body1" fontWeight="600" mb={1}>
              ⭕ Border Radius: {borderRadius}px
            </Typography>
            <Slider
              value={borderRadius}
              onChange={(_, val) => setBorderRadius(val)}
              min={0}
              max={50}
              step={1}
              marks={[
                { value: 0, label: "0" },
                { value: 25, label: "25" },
                { value: 50, label: "50" },
              ]}
              valueLabelDisplay="auto"
              sx={{
                color: borderColor,
                mb: 3,
                "& .MuiSlider-thumb": {
                  bgcolor: borderColor,
                },
              }}
            />

            {/* Node Animation */}
            <Typography variant="body1" fontWeight="600" mb={1}>
              🎬 Node Animation
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <Select
                value={nodeAnimation}
                onChange={(e) => setNodeAnimation(e.target.value)}
                displayEmpty
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="fadeIn">Fade In</MenuItem>
                <MenuItem value="slideInLeft">Slide In Left</MenuItem>
                <MenuItem value="slideInRight">Slide In Right</MenuItem>
                <MenuItem value="scaleUp">Scale Up</MenuItem>
                <MenuItem value="pulse">Pulse (Loop)</MenuItem>
                <MenuItem value="bounce">Bounce (Loop)</MenuItem>
              </Select>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            {/* Preview */}
            <Typography variant="body1" fontWeight="600" mb={2}>
              👁️ Preview
            </Typography>
            <Box
              sx={{
                p: 3,
                backgroundColor,
                border: `${borderWidth}px solid ${borderColor}`,
                borderRadius: `${borderRadius}px`,
                color: textColor,
                textAlign: "center",
                fontWeight: "500",
                minHeight: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: nodeAnimation !== "none"
                  ? `${nodeAnimation} ${nodeAnimation === "pulse" || nodeAnimation === "bounce" ? "2s" : "0.5s"} ${nodeAnimation === "pulse" || nodeAnimation === "bounce" ? "infinite" : "ease-in"}`
                  : "none",
              }}
            >
              {nodeText || "Preview Text"}
            </Box>
          </>
        ) : (
          // Edge Customization
          <>
            <Typography variant="body1" fontWeight="600" mb={2}>
              🌈 Edge Color
            </Typography>
            <ColorGrid
              selectedColor={edgeColor}
              onColorSelect={setEdgeColor}
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="body1" fontWeight="600" mb={1}>
              📐 Edge Width: {edgeWidth}px
            </Typography>
            <Slider
              value={edgeWidth}
              onChange={(_, val) => setEdgeWidth(val)}
              min={1}
              max={10}
              step={0.5}
              marks
              valueLabelDisplay="auto"
              sx={{
                color: edgeColor,
                mb: 3,
                "& .MuiSlider-thumb": {
                  bgcolor: edgeColor,
                },
              }}
            />

            <Typography variant="body1" fontWeight="600" mb={1}>
              〰️ Edge Style
            </Typography>
            <ToggleButtonGroup
              value={edgeStyle}
              exclusive
              onChange={(_, val) => val && setEdgeStyle(val)}
              fullWidth
              sx={{ mb: 3 }}
            >
              <ToggleButton value="solid">Solid</ToggleButton>
              <ToggleButton value="dashed">Dashed</ToggleButton>
              <ToggleButton value="dotted">Dotted</ToggleButton>
            </ToggleButtonGroup>

            <Typography variant="body1" fontWeight="600" mb={1}>
              ✨ Animation
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={animatedFlow}
                  onChange={(e) => setAnimatedFlow(e.target.checked)}
                />
              }
              label="Enable Animated Flow"
              sx={{ mb: 2 }}
            />

            {animatedFlow && (
              <FormControl fullWidth sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight="600" mb={1}>
                  🎭 Animation Effect
                </Typography>
                <Select
                  value={animationEffect}
                  onChange={(e) => setAnimationEffect(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="dashdraw">Dash Draw</MenuItem>
                  <MenuItem value="flow">Flow Effect</MenuItem>
                  <MenuItem value="pulse">Pulse</MenuItem>
                </Select>
              </FormControl>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Preview */}
            <Typography variant="body1" fontWeight="600" mb={2}>
              🎥 Preview
            </Typography>
            <Box
              sx={{
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <svg width="100%" height="80">
                <defs>
                  {edgeStyle === "dashed" && (
                    <pattern
                      id="dashed-pattern"
                      patternUnits="userSpaceOnUse"
                      width="10"
                      height="10"
                    >
                      <line
                        x1="0"
                        y1="0"
                        x2="10"
                        y2="0"
                        stroke={edgeColor}
                        strokeWidth={edgeWidth}
                        strokeDasharray="5,5"
                      />
                    </pattern>
                  )}
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3, 0 6"
                      fill={edgeColor}
                    />
                  </marker>
                </defs>
                <line
                  x1="10%"
                  y1="40"
                  x2="90%"
                  y2="40"
                  stroke={edgeColor}
                  strokeWidth={edgeWidth}
                  strokeDasharray={
                    edgeStyle === "dashed"
                      ? "10,5"
                      : edgeStyle === "dotted"
                      ? "2,2"
                      : "0"
                  }
                  markerEnd="url(#arrowhead)"
                  style={{
                    animation: animatedFlow
                      ? `${animationEffect} 1s linear infinite`
                      : "none",
                  }}
                />
                <circle cx="10%" cy="40" r="8" fill={edgeColor} />
                <circle cx="90%" cy="40" r="8" fill={edgeColor} />
              </svg>
            </Box>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              border: "1px solid #CBD5E1",
              color: "#64748B",
              "&:hover": {
                bgcolor: "#F1F5F9",
                borderColor: "#94A3B8",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              bgcolor: "#3B82F6",
              color: "white",
              "&:hover": {
                bgcolor: "#2563EB",
              },
            }}
          >
            Apply
          </Button>
        </Box>
      </DialogContent>

      <style jsx global>{`
        /* Edge animations */
        @keyframes dashdraw {
          to {
            stroke-dashoffset: -20;
          }
        }
        @keyframes flow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%,
          100% {
            stroke-width: ${edgeWidth}px;
          }
          50% {
            stroke-width: ${edgeWidth + 2}px;
          }
        }

        /* Node animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </Dialog>
  );
};

export default ColorPalettePanel;
