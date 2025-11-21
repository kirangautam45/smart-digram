"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Drawer,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from "@mui/material";
import {
  Palette as PaletteIcon,
  Close as CloseIcon,
  RestartAlt as ResetIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useStyleStore, useCurrentDiagramStyles } from "@/store/diagramStyleStore";
import { colors, themePresets, animations } from "@/config/diagramStyles";

const StyleControlPanel = () => {
  const [open, setOpen] = useState(false);
  const currentStyles = useCurrentDiagramStyles();
  const {
    activeDiagramType,
    setDiagramStyle,
    updateDiagramStyles,
    updateGlobalStyles,
    resetDiagramStyles,
    resetGlobalStyles,
  } = useStyleStore();

  const toggleDrawer = () => setOpen(!open);

  const handleStyleChange = (key, value) => {
    setDiagramStyle(activeDiagramType, key, value);
  };

  const handleApplyPreset = (presetKey) => {
    const preset = themePresets[presetKey];
    updateDiagramStyles(activeDiagramType, {
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      backgroundColor: preset.backgroundColor,
    });
  };

  const handleResetStyles = () => {
    resetDiagramStyles(activeDiagramType);
  };

  const handleResetAllStyles = () => {
    if (window.confirm("Are you sure you want to reset all diagram styles?")) {
      resetGlobalStyles();
    }
  };

  return (
    <>
      {/* Floating button to open panel */}
      <Tooltip title="Customize Styles" placement="left">
        <IconButton
          onClick={toggleDrawer}
          sx={{
            position: "fixed",
            right: 20,
            top: "50%",
            transform: "translateY(-50%)",
            bgcolor: "#FF3480",
            color: "white",
            boxShadow: 3,
            zIndex: 1000,
            "&:hover": {
              bgcolor: "#E11D48",
            },
          }}
        >
          <PaletteIcon />
        </IconButton>
      </Tooltip>

      {/* Style Control Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 400 },
            p: 3,
          },
        }}
      >
        <Box>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">
              Diagram Styles
            </Typography>
            <IconButton onClick={toggleDrawer} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary" mb={3}>
            Customize the appearance of your{" "}
            <strong>{activeDiagramType}</strong> diagram
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Theme Presets */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight="semibold">Theme Presets</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {Object.entries(themePresets).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant="outlined"
                    onClick={() => handleApplyPreset(key)}
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                      borderColor: "#CBD5E1",
                      "&:hover": {
                        borderColor: "#FF3480",
                        bgcolor: "#FFF4F8",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        bgcolor: preset.primaryColor,
                        mr: 2,
                        border: "1px solid #CBD5E1",
                      }}
                    />
                    {preset.name}
                  </Button>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Colors */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight="semibold">Colors</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" mb={1}>
                    Primary Color
                  </Typography>
                  <TextField
                    type="color"
                    fullWidth
                    value={currentStyles.primaryColor || colors.primary[500]}
                    onChange={(e) => handleStyleChange("primaryColor", e.target.value)}
                    sx={{ "& input": { cursor: "pointer" } }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" mb={1}>
                    Secondary Color
                  </Typography>
                  <TextField
                    type="color"
                    fullWidth
                    value={currentStyles.secondaryColor || colors.secondary[500]}
                    onChange={(e) => handleStyleChange("secondaryColor", e.target.value)}
                    sx={{ "& input": { cursor: "pointer" } }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" mb={1}>
                    Background Color
                  </Typography>
                  <TextField
                    type="color"
                    fullWidth
                    value={currentStyles.backgroundColor || colors.background.white}
                    onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                    sx={{ "& input": { cursor: "pointer" } }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" mb={1}>
                    Text Color
                  </Typography>
                  <TextField
                    type="color"
                    fullWidth
                    value={currentStyles.textColor || colors.neutral[900]}
                    onChange={(e) => handleStyleChange("textColor", e.target.value)}
                    sx={{ "& input": { cursor: "pointer" } }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" mb={1}>
                    Border Color
                  </Typography>
                  <TextField
                    type="color"
                    fullWidth
                    value={currentStyles.borderColor || colors.neutral[300]}
                    onChange={(e) => handleStyleChange("borderColor", e.target.value)}
                    sx={{ "& input": { cursor: "pointer" } }}
                  />
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Animations */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight="semibold">Animations</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Node Animation</InputLabel>
                  <Select
                    value={currentStyles.nodeAnimation || "none"}
                    label="Node Animation"
                    onChange={(e) => handleStyleChange("nodeAnimation", e.target.value)}
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

                <FormControl fullWidth>
                  <InputLabel>Edge Animation</InputLabel>
                  <Select
                    value={currentStyles.edgeAnimation || "none"}
                    label="Edge Animation"
                    onChange={(e) => handleStyleChange("edgeAnimation", e.target.value)}
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="dashdraw">Dash Draw</MenuItem>
                    <MenuItem value="flow">Flow Effect</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Text Animation</InputLabel>
                  <Select
                    value={currentStyles.textAnimation || "none"}
                    label="Text Animation"
                    onChange={(e) => handleStyleChange("textAnimation", e.target.value)}
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="textGlow">Text Glow</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ my: 3 }} />

          {/* Action Buttons */}
          <Stack spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ResetIcon />}
              onClick={handleResetStyles}
              sx={{
                borderColor: "#CBD5E1",
                color: "#64748B",
                "&:hover": {
                  borderColor: "#FF3480",
                  bgcolor: "#FFF4F8",
                },
              }}
            >
              Reset Current Diagram
            </Button>

            <Button
              variant="outlined"
              startIcon={<ResetIcon />}
              onClick={handleResetAllStyles}
              sx={{
                borderColor: "#EF4444",
                color: "#EF4444",
                "&:hover": {
                  borderColor: "#DC2626",
                  bgcolor: "#FEE2E2",
                },
              }}
            >
              Reset All Diagrams
            </Button>
          </Stack>

          {/* Info Box */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: "#F1F5F9",
              borderRadius: 2,
              border: "1px solid #CBD5E1",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              💡 <strong>Tip:</strong> All changes are automatically saved to localStorage
              and will persist across sessions.
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default StyleControlPanel;
