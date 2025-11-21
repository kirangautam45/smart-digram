"use client";

import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  TextField,
  Paper,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  ReactFlowProvider,
  Handle,
  Position,
  SimpleBezierEdge,
  useReactFlow,
  NodeResizeControl,
} from "reactflow";
import "reactflow/dist/style.css";
import { useStore } from "@/store";
import { ChartContext } from "@/app/layout";
import { useParams } from "next/navigation";
import { TextStylePanel, DiagramStylePanel } from "@/components/diagram-styling";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from "@mui/material";

const CustomEdge = (props) => {
  const isBidirectional = props.data?.bidirectional || false;
  const globalEdgeStyle = props.data?.diagramStyles?.edge || {};

  const edgeColor = props.data?.color || globalEdgeStyle.stroke || "#000000";
  const edgeWidth = props.data?.strokeWidth || globalEdgeStyle.strokeWidth || 2;
  const edgeAnimationClass = globalEdgeStyle.animation !== 'none' ? globalEdgeStyle.animation : '';

  return (
    <g className={edgeAnimationClass}>
      <SimpleBezierEdge
        {...props}
        style={{
          ...props.style,
          stroke: edgeColor,
          strokeWidth: edgeWidth,
          strokeDasharray: globalEdgeStyle.strokeDasharray || '0',
        }}
        animated={globalEdgeStyle.animated}
        markerStart={isBidirectional ? {
          type: "arrowclosed",
          color: edgeColor,
          width: 20,
          height: 20,
        } : undefined}
        markerEnd={{
          type: "arrowclosed",
          color: edgeColor,
          width: 20,
          height: 20,
        }}
      />
    </g>
  );
};

const edgeTypes = {
  custom: CustomEdge,
};
const ResizeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="#000"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      position: "absolute",
      right: "5px",
      bottom: "5px",
    }}
  >
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

const BlockNode = ({ data, selected }) => {
  const blockData = data.blockData;
  const globalNodeStyle = data.diagramStyles?.node || {};

  const getBlockStyle = () => {
    const baseStyle = {
      border: `${globalNodeStyle.borderWidth || 2}px ${globalNodeStyle.borderStyle || 'solid'} ${globalNodeStyle.borderColor || '#000000'}`,
      background: globalNodeStyle.backgroundColor || "#ffffff",
      borderRadius: `${globalNodeStyle.borderRadius || 4}px`,
      textAlign: "center",
      fontFamily: globalNodeStyle.fontFamily || "Arial, sans-serif",
      fontSize: globalNodeStyle.fontSize || "14px",
      fontWeight: globalNodeStyle.fontWeight || "bold",
      color: globalNodeStyle.textColor || "#000000",
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxShadow: selected
        ? "0 4px 8px rgba(0,0,0,0.3)"
        : (globalNodeStyle.boxShadow || "0 2px 4px rgba(0,0,0,0.2)"),
      minHeight: "60px",
      padding: "8px 12px",
      wordWrap: "break-word",
      whiteSpace: "normal",
      transition: "all 0.2s ease",
      width: "100%",
      height: "100%",
    };

    // Apply styles from Mermaid style definitions
    if (blockData?.style) {
      // Handle fill color
      if (blockData.style.fill) {
        baseStyle.background = blockData.style.fill;

        // Auto-adjust text color for better contrast
        if (blockData.style.fill.startsWith("#")) {
          const hex = blockData.style.fill.replace("#", "");
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          if (brightness < 128) {
            baseStyle.color = "#ffffff";
          } else {
            baseStyle.color = "#000000";
          }
        }
      }

      // Handle text color (override auto color if specified)
      if (blockData.style.color) {
        baseStyle.color = blockData.style.color;
      }

      // Handle opacity
      if (blockData.style.opacity) {
        baseStyle.opacity = blockData.style.opacity;
      }

      // Handle font size
      if (blockData.style["font-size"]) {
        baseStyle.fontSize = blockData.style["font-size"];
      }

      // Handle font weight
      if (blockData.style["font-weight"]) {
        baseStyle.fontWeight = blockData.style["font-weight"];
      }
    }

    // Shape-specific styles
    if (blockData?.shape === "circle") {
      return {
        ...baseStyle,
        width: "150px",
        height: "150px",
        borderRadius: "50%",
        border: "3px double #000000",
      };
    }

    if (blockData?.shape === "diamond") {
      return {
        ...baseStyle,
        width: "150px",
        height: "150px",
        borderRadius: "0px",
        transform: "rotate(45deg)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      };
    }

    if (blockData?.shape === "space") {
      return {
        ...baseStyle,
        width: blockData.span ? `${blockData.span * 120}px` : "120px",
        height: "40px",
        background: "transparent",
        border: "none",
        boxShadow: "none",
      };
    }

    const span = blockData?.span || 1;
    const baseWidth = 180;
    const width = blockData?.wide ? "200px" : `${baseWidth * span}px`;

    return {
      ...baseStyle,
      width,
      minHeight: "60px",
    };
  };

  // Get handle positions based on block shape
  const getHandlePositions = () => {
    const basePositions = ["top", "bottom", "left", "right"];

    if (blockData?.shape === "arrow") {
      // For arrows, only show handles in the direction of the arrow
      switch (blockData.direction) {
        case "right":
          return ["left", "right"]; // Input from left, output to right
        case "left":
          return ["right", "left"]; // Input from right, output to left
        case "down":
          return ["top", "bottom"]; // Input from top, output to bottom
        case "up":
          return ["bottom", "top"]; // Input from bottom, output to top
        default:
          return ["left", "right"];
      }
    }

    if (blockData?.shape === "space") {
      return []; // No handles for space blocks
    }

    return basePositions;
  };

  // Get handle offset based on shape and position
  const getHandleOffset = (position, shape) => {
    const baseOffset = { left: "50%", top: "50%" };

    if (shape === "circle") {
      // Place handles on the circumference
      const radius = 72;
      const angle = {
        top: -90,
        right: 0,
        bottom: 90,
        left: 180,
      }[position];

      const rad = (angle * Math.PI) / 180;
      return {
        left: `calc(50% + ${Math.cos(rad) * radius}px)`,
        top: `calc(50% + ${Math.sin(rad) * radius}px)`,
      };
    }

    if (shape === "diamond") {
      const offsets = {
        top: { left: "50%", top: "0%" },
        right: { left: "100%", top: "50%" },
        bottom: { left: "50%", top: "100%" },
        left: { left: "0%", top: "50%" },
      };
      return offsets[position];
    }

    if (shape === "cylinder") {
      // Custom handle positions for cylinder
      const offsets = {
        top: { left: "50%", top: "15%" },
        right: { left: "85%", top: "50%" },
        bottom: { left: "50%", top: "95%" },
        left: { left: "10%", top: "50%" },
      };
      return offsets[position];
    }

    // Default rectangle handles
    const offsets = {
      top: { left: "50%", top: "0%" },
      right: { left: "100%", top: "50%" },
      bottom: { left: "50%", top: "100%" },
      left: { left: "0%", top: "50%" },
    };
    return offsets[position];
  };

  // Cylinder block rendering
  if (blockData?.shape === "cylinder") {
    const width = 180;
    const height = 120;
    const ellipseHeight = 20;
    const bodyHeight = height - ellipseHeight;
    const handlePositions = getHandlePositions();

    return (
      <div
        style={{
          position: "relative",
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <svg
          width={width}
          height={height}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            filter: selected
              ? "drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
              : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
          }}
        >
          {/* Cylinder body */}
          <path
            d={`M 20,${ellipseHeight} 
                L 20,${bodyHeight} 
                Q 20,${height} ${width / 2},${height} 
                Q ${width - 20},${height} ${width - 20},${bodyHeight} 
                L ${width - 20},${ellipseHeight} 
                Q ${width - 20},0 ${width / 2},0 
                Q 20,0 20,${ellipseHeight} Z`}
            fill={blockData?.style?.fill || "#ffffff"}
            stroke={blockData?.style?.stroke || "#000000"}
            strokeWidth={blockData?.style?.["stroke-width"] || "2"}
          />

          {/* Top ellipse */}
          <ellipse
            cx={width / 2}
            cy={ellipseHeight / 2}
            rx={width / 2 - 20}
            ry={ellipseHeight / 2}
            fill={blockData?.style?.fill || "#ffffff"}
            stroke={blockData?.style?.stroke || "#000000"}
            strokeWidth={blockData?.style?.["stroke-width"] || "2"}
          />

          {/* Text */}
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={blockData?.style?.["font-size"] || "14"}
            fontWeight={blockData?.style?.["font-weight"] || "400"}
            fill={blockData?.style?.color || "#000000"}
          >
            {blockData?.label || ""}
          </text>
        </svg>

        {/* Add connection handles for cylinder */}
        {handlePositions.map((position) => {
          const offset = getHandleOffset(position, blockData?.shape);

          return (
            <React.Fragment key={position}>
              <Handle
                type="target"
                position={
                  Position[position.charAt(0).toUpperCase() + position.slice(1)]
                }
                id={position}
                style={{
                  background: "#000000",
                  width: 8,
                  height: 8,
                  border: "2px solid white",
                  zIndex: 10,
                  ...offset,
                }}
              />
              <Handle
                type="source"
                position={
                  Position[position.charAt(0).toUpperCase() + position.slice(1)]
                }
                id={position}
                style={{
                  background: "#000000",
                  width: 8,
                  height: 8,
                  border: "2px solid white",
                  zIndex: 10,
                  ...offset,
                }}
              />
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Arrow block rendering
  if (blockData?.shape === "arrow") {
    const getArrowDimensions = () => {
      switch (blockData.direction) {
        case "right":
        case "left":
          return { width: 180, height: 100 };
        case "down":
        case "up":
          return { width: 100, height: 180 };
        default:
          return { width: 160, height: 80 };
      }
    };

    const { width, height } = getArrowDimensions();

    const getArrowPath = () => {
      switch (blockData.direction) {
        case "right":
          return "M 0,20 L 100,20 L 100,0 L 180,50 L 100,100 L 100,80 L 0,80 Z";
        case "left":
          return "M 180,20 L 80,20 L 80,0 L 0,50 L 80,100 L 80,80 L 180,80 Z";
        case "down":
          return "M 20,0 L 80,0 L 80,100 L 100,100 L 50,180 L 0,100 L 20,100 Z";
        case "up":
          return "M 20,180 L 80,180 L 80,80 L 100,80 L 50,0 L 0,80 L 20,80 Z";
        default:
          return "M 0,20 L 100,20 L 100,0 L 160,40 L 100,80 L 100,60 L 0,60 Z";
      }
    };

    const getTextPosition = () => {
      switch (blockData.direction) {
        case "right":
          return { x: 60, y: 50, width: 80 };
        case "left":
          return { x: 120, y: 50, width: 80 };
        case "down":
          return { x: 50, y: 70, width: 60 };
        case "up":
          return { x: 50, y: 110, width: 60 };
        default:
          return { x: 70, y: 40, width: 100 };
      }
    };

    const textPos = getTextPosition();
    const handlePositions = getHandlePositions();

    return (
      <div
        style={{
          position: "relative",
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <svg
          width={width}
          height={height}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            filter: selected
              ? "drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
              : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
          }}
        >
          <path
            d={getArrowPath()}
            fill={blockData?.style?.fill || "#ffffff"}
            stroke={blockData?.style?.stroke || "#000000"}
            strokeWidth={blockData?.style?.["stroke-width"] || "2"}
            strokeLinejoin="round"
          />

          <text
            x={textPos.x}
            y={textPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={blockData?.style?.["font-size"] || "14"}
            fontWeight={blockData?.style?.["font-weight"] || "400"}
            fill={blockData?.style?.color || "#000000"}
            width={textPos.width}
          >
            {blockData?.label || ""}
          </text>
        </svg>

        {handlePositions.map((position, index) => {
          const isSource = index >= handlePositions.length / 2;
          const offset = getHandleOffset(position, "arrow");

          return (
            <Handle
              key={position}
              type={isSource ? "source" : "target"}
              position={
                Position[position.charAt(0).toUpperCase() + position.slice(1)]
              }
              id={position}
              style={{
                background: "#000000",
                width: 8,
                height: 8,
                border: "2px solid white",
                zIndex: 20,
                ...offset,
              }}
            />
          );
        })}
      </div>
    );
  }

  // Regular blocks (circle, diamond, rectangle, space)
  const style = getBlockStyle();
  const handlePositions = getHandlePositions();

  const renderContent = () => {
    if (blockData?.shape === "space") {
      return "";
    }

    if (blockData?.shape === "diamond") {
      return (
        <div
          style={{
            transform: "rotate(-45deg)",
            textAlign: "center",
            width: "100%",
            color: style.color,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
          }}
        >
          {blockData?.label || blockData?.id}
        </div>
      );
    }

    return blockData?.label || blockData?.id;
  };

  return (
    <>
      <NodeResizeControl
        style={{
          background: "transparent",
          border: "none",
        }}
        minWidth={100}
        minHeight={60}
      >
        <ResizeIcon />
      </NodeResizeControl>

      <div
        style={style}
        className={globalNodeStyle.animation !== 'none' ? globalNodeStyle.animation : ''}
      >
        {renderContent()}

        {handlePositions.map((position) => {
          const offset = getHandleOffset(position, blockData?.shape);

          return (
            <React.Fragment key={position}>
              <Handle
                type="target"
                position={
                  Position[position.charAt(0).toUpperCase() + position.slice(1)]
                }
                id={position}
                style={{
                  background: "#000000",
                  width: 8,
                  height: 8,
                  border: "2px solid white",
                  zIndex: 10,
                  ...offset,
                }}
              />
              <Handle
                type="source"
                position={
                  Position[position.charAt(0).toUpperCase() + position.slice(1)]
                }
                id={position}
                style={{
                  background: "#000000",
                  width: 8,
                  height: 8,
                  border: "2px solid white",
                  zIndex: 10,
                  ...offset,
                }}
              />
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};

const ContainerNode = ({ data, selected }) => {
  const containerData = data.containerData;
  const globalNodeStyle = data.diagramStyles?.node || {};

  return (
    <>
      <NodeResizeControl
        style={{
          background: "transparent",
          border: "none",
        }}
        minWidth={150}
        minHeight={150}
      >
        <ResizeIcon />
      </NodeResizeControl>

      <div
        style={{
          padding: "10px",
          border: `${globalNodeStyle.borderWidth || 2}px dashed ${globalNodeStyle.borderColor || '#000000'}`,
          borderWidth: selected ? "3px" : `${globalNodeStyle.borderWidth || 2}px`,
          borderRadius: `${globalNodeStyle.borderRadius || 4}px`,
          width: "100%",
          height: "100%",
          textAlign: "center",
          boxShadow: globalNodeStyle.boxShadow || "0 1px 3px rgba(0,0,0,0.3)",
          fontFamily: globalNodeStyle.fontFamily || "Arial, sans-serif",
          fontSize: globalNodeStyle.fontSize || "12px",
          color: globalNodeStyle.textColor || "#000000",
          position: "relative",
          boxSizing: "border-box",
          background: globalNodeStyle.backgroundColor || "rgba(240, 240, 240, 0.5)",
          overflow: "visible",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          minHeight: "150px",
        }}
        className={globalNodeStyle.animation !== 'none' ? globalNodeStyle.animation : ''}
      >
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
          {containerData?.label || containerData?.id}
        </div>

        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={{ background: "#000000", width: 8, height: 8, zIndex: 20 }}
        />
        <Handle
          type="source"
          position={Position.Top}
          id="top"
          style={{ background: "#000000", width: 8, height: 8, zIndex: 20 }}
        />
        <Handle
          type="target"
          position={Position.Bottom}
          id="bottom"
          style={{ background: "#000000", width: 8, height: 8, zIndex: 20 }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          style={{ background: "#000000", width: 8, height: 8, zIndex: 20 }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          style={{ background: "#000000", width: 8, height: 8, zIndex: 20 }}
        />
        <Handle
          type="source"
          position={Position.Left}
          id="left"
          style={{ background: "#000000", width: 8, height: 8, zIndex: 20 }}
        />
        <Handle
          type="target"
          position={Position.Right}
          id="right"
          style={{ background: "#000000", width: 8, height: 8, zIndex: 20 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          style={{ background: "#000000", width: 8, height: 8, zIndex: 20 }}
        />
      </div>
    </>
  );
};

const nodeTypes = {
  container: ContainerNode,
  block: BlockNode,
};

const StatusDisplay = ({ message, type = "info" }) => {
  if (!message) return null;

  const backgroundColor = type === "error" ? "#ffebee" : "#e8f5e8";
  const borderColor = type === "error" ? "#f44336" : "#4caf50";
  const textColor = type === "error" ? "#c62828" : "#2e7d32";

  return (
    <Paper
      sx={{
        position: "absolute",
        top: 80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        padding: "8px 16px",
        background: backgroundColor,
        border: `2px solid ${borderColor}`,
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        maxWidth: "400px",
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: textColor,
          fontWeight: 500,
          fontSize: "12px",
          textAlign: "center",
        }}
      >
        {message}
      </Typography>
    </Paper>
  );
};

const parseStyleString = (styleString) => {
  const styleProps = {};

  // Extract all CSS properties with better regex
  const properties = {
    fill: /fill\s*:\s*([^,;]+)/i,
    stroke: /stroke\s*:\s*([^,;]+)/i,
    "stroke-width": /stroke-width\s*:\s*([^,;]+)/i,
    "stroke-dasharray": /stroke-dasharray\s*:\s*([^,;]+)/i,
    color: /color\s*:\s*([^,;]+)/i,
    opacity: /opacity\s*:\s*([^,;]+)/i,
    "font-size": /font-size\s*:\s*([^,;]+)/i,
    "font-weight": /font-weight\s*:\s*([^,;]+)/i,
    "font-family": /font-family\s*:\s*([^,;]+)/i,
    "text-align": /text-align\s*:\s*([^,;]+)/i,
    background: /background\s*:\s*([^,;]+)/i,
    border: /border\s*:\s*([^,;]+)/i,
    "border-radius": /border-radius\s*:\s*([^,;]+)/i,
  };

  for (const [prop, regex] of Object.entries(properties)) {
    const match = styleString.match(regex);
    if (match) {
      styleProps[prop] = match[1].trim();
    }
  }

  // Also handle shorthand styles like "fill:#color,stroke:#color"
  const shorthandMatches = styleString.match(/(\w+)\s*:\s*([^,;]+)/g);
  if (shorthandMatches) {
    shorthandMatches.forEach((match) => {
      const [key, value] = match.split(":").map((s) => s.trim());
      if (key && value && !styleProps[key]) {
        styleProps[key] = value;
      }
    });
  }

  return styleProps;
};
const parseBlockElement = (element) => {
  if (element.startsWith("space")) {
    const spanMatch = element.match(/space:(\d+)/);
    const span = spanMatch ? parseInt(spanMatch[1]) : 1;
    return {
      id: `space_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "Space",
      label: "",
      shape: "space",
      span: span,
    };
  }

  const circleMatch = element.match(/^([^(]+)\(\(\s*"([^"]*)"\s*\)\)$/);
  if (circleMatch) {
    const [, id, label] = circleMatch;
    return {
      id: id.trim(),
      type:
        id.includes("Start") || id.includes("End") || id.includes("stop")
          ? "Terminator"
          : "Database",
      label: label || id,
      shape: "circle",
    };
  }

  const cylinderMatch = element.match(/^([^|]+)\|\s*"([^"]*)"\s*\|$/);
  if (cylinderMatch) {
    const [, id, label] = cylinderMatch;
    return {
      id: id.trim(),
      type: "Database",
      label: label || id,
      shape: "cylinder",
    };
  }

  const diamondMatch = element.match(/^([^{]+)\{\{\s*"([^"]*)"\s*\}\}$/);
  if (diamondMatch) {
    const [, id, label] = diamondMatch;
    return {
      id: id.trim(),
      type: "Decision",
      label: label || id,
      shape: "diamond",
    };
  }

  const arrowMatch = element.match(/^([^<]+)<\[\s*"([^"]*)"\s*\]>\(([^)]+)\)$/);
  if (arrowMatch) {
    const [, id, label, direction] = arrowMatch;
    return {
      id: id.trim(),
      type: "Arrow",
      label: label || " ",
      shape: "arrow",
      direction: direction.toLowerCase(),
    };
  }

  const rectMatch = element.match(/^([^\[]+)\[\s*"([^"]*)"\s*\](?::(\d+))?$/);
  if (rectMatch) {
    const [, id, label, width] = rectMatch;
    return {
      id: id.trim(),
      type: "Process",
      label: label || id,
      shape: "rectangle",
      span: width ? parseInt(width) : 1,
      wide: !!width,
    };
  }

  const widthMatch = element.match(/^([^:]+):(\d+)$/);
  if (
    widthMatch &&
    !element.includes('"') &&
    !element.includes("[") &&
    !element.includes("(")
  ) {
    const [, id, width] = widthMatch;
    return {
      id: id.trim(),
      type: "Process",
      label: id,
      shape: "rectangle",
      span: parseInt(width),
      wide: true,
    };
  }

  const simpleMatch = element.match(/^([^\s"\'\[\]\(\)\{\}]+)$/);
  if (simpleMatch) {
    const id = simpleMatch[1];
    return {
      id: id.trim(),
      type: "Process",
      label: id,
      shape: "rectangle",
    };
  }

  console.warn("Unparseable block element:", element);
  return null;
};

const parseBlockLine = (line) => {
  const blocks = [];
  let current = "";
  let inQuotes = false;
  let inBrackets = 0;
  let inParens = 0;
  let inBraces = 0;
  let inArrow = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' && !inBrackets && !inParens && !inBraces) {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === "[" && !inQuotes) {
      inBrackets++;
      current += char;
    } else if (char === "]" && !inQuotes) {
      inBrackets--;
      current += char;
    } else if (char === "(" && !inQuotes) {
      inParens++;
      current += char;
    } else if (char === ")" && !inQuotes) {
      inParens--;
      current += char;
    } else if (char === "{" && !inQuotes) {
      inBraces++;
      current += char;
    } else if (char === "}" && !inQuotes) {
      inBraces--;
      current += char;
    } else if (
      char === "<" &&
      !inQuotes &&
      inBrackets === 0 &&
      inParens === 0 &&
      inBraces === 0
    ) {
      inArrow = true;
      current += char;
    } else if (char === ">" && inArrow) {
      inArrow = false;
      current += char;
    } else if (
      char === " " &&
      !inQuotes &&
      inBrackets === 0 &&
      inParens === 0 &&
      inBraces === 0 &&
      !inArrow
    ) {
      if (current.trim()) {
        const block = parseBlockElement(current.trim());
        if (block) blocks.push(block);
      }
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    const block = parseBlockElement(current.trim());
    if (block) blocks.push(block);
  }

  return blocks;
};

const createMissingConnections = (result, allBlockIds) => {
  const blockIds = Array.from(allBlockIds);

  if (result.connections.length === 0 && blockIds.length > 1) {
    for (let i = 0; i < blockIds.length - 1; i++) {
      const sourceId = blockIds[i];
      const targetId = blockIds[i + 1];

      if (sourceId.includes("space") || targetId.includes("space")) continue;

      result.connections.push({
        sourceId,
        targetId,
        sourceSide: "right",
        targetSide: "left",
      });
    }
  }

  result.connections = result.connections.filter(
    (conn) => allBlockIds.has(conn.sourceId) && allBlockIds.has(conn.targetId)
  );
};
const generateUniversalLayout = (blockData) => {
  const positions = new Map();
  const connections = blockData.connections || [];
  const allBlocks = Array.from(blockData.blocks.values());

  const horizontalSpacing = 200;
  const verticalSpacing = 150;

  // Analyze the diagram structure to determine layout direction
  const determineLayoutDirection = () => {
    if (connections.length === 0) {
      // No connections - use compact grid for isolated nodes
      return 'grid';
    }

    // Count horizontal vs vertical connections
    let horizontalConnections = 0;
    let verticalConnections = 0;
    
    connections.forEach(conn => {
      const sourceNode = allBlocks.find(b => b.id === conn.sourceId);
      const targetNode = allBlocks.find(b => b.id === conn.targetId);
      
      if (sourceNode && targetNode) {
        // Check if this is likely a horizontal flow
        const sourceIndex = allBlocks.findIndex(b => b.id === conn.sourceId);
        const targetIndex = allBlocks.findIndex(b => b.id === conn.targetId);
        
        if (Math.abs(targetIndex - sourceIndex) === 1) {
          horizontalConnections++;
        } else {
          verticalConnections++;
        }
      }
    });

    // Also check block types for clues
    const hasManyDecisions = allBlocks.filter(b => b.shape === 'diamond').length > 2;
    const hasLinearFlow = connections.length === allBlocks.length - 1;

    if (hasManyDecisions || !hasLinearFlow) {
      return 'vertical'; // Complex flows work better vertically
    }

    return horizontalConnections > verticalConnections ? 'horizontal' : 'vertical';
  };

  const layoutDirection = determineLayoutDirection();

  // Find starting nodes (nodes with no incoming connections)
  const findStartNodes = () => {
    const allNodeIds = new Set(allBlocks.map(b => b.id));
    const targets = new Set(connections.map(conn => conn.targetId));
    return Array.from(allNodeIds).filter(nodeId => !targets.has(nodeId));
  };

  const startNodes = findStartNodes();

  if (layoutDirection === 'vertical') {
    // Vertical layout - top to bottom flow
    const visited = new Set();
    let currentLevel = [...startNodes];
    let level = 0;

    while (currentLevel.length > 0) {
      currentLevel.forEach((nodeId, indexInLevel) => {
        if (!visited.has(nodeId)) {
          const x = 300 + (indexInLevel - (currentLevel.length - 1) / 2) * horizontalSpacing;
          const y = 100 + level * verticalSpacing;
          positions.set(nodeId, { x, y });
          visited.add(nodeId);
        }
      });

      const nextLevel = [];
      currentLevel.forEach(nodeId => {
        const outgoing = connections.filter(conn => conn.sourceId === nodeId);
        outgoing.forEach(conn => {
          if (!visited.has(conn.targetId) && !nextLevel.includes(conn.targetId)) {
            nextLevel.push(conn.targetId);
          }
        });
      });

      currentLevel = nextLevel;
      level++;
    }
  } else if (layoutDirection === 'horizontal') {
    // Horizontal layout - left to right flow
    const visited = new Set();
    let currentColumn = [...startNodes];
    let column = 0;

    while (currentColumn.length > 0) {
      currentColumn.forEach((nodeId, indexInColumn) => {
        if (!visited.has(nodeId)) {
          const x = 100 + column * horizontalSpacing;
          const y = 300 + (indexInColumn - (currentColumn.length - 1) / 2) * verticalSpacing;
          positions.set(nodeId, { x, y });
          visited.add(nodeId);
        }
      });

      const nextColumn = [];
      currentColumn.forEach(nodeId => {
        const outgoing = connections.filter(conn => conn.sourceId === nodeId);
        outgoing.forEach(conn => {
          if (!visited.has(conn.targetId) && !nextColumn.includes(conn.targetId)) {
            nextColumn.push(conn.targetId);
          }
        });
      });

      currentColumn = nextColumn;
      column++;
    }
  } else {
    // Grid layout for disconnected nodes or complex structures
    allBlocks.forEach((block, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = 100 + col * horizontalSpacing;
      const y = 100 + row * verticalSpacing;
      positions.set(block.id, { x, y });
    });
  }

  // Fill in any missing positions
  allBlocks.forEach((block, index) => {
    if (!positions.has(block.id)) {
      const x = 100 + (index % 4) * horizontalSpacing;
      const y = 100 + Math.floor(index / 4) * verticalSpacing;
      positions.set(block.id, { x, y });
    }
  });

  return positions;
};
// const generateUniversalLayout = (blockData) => {
//   const positions = new Map();
//   const nodeOrder = new Map(); // Track node order for better positioning
//   let nodeIndex = 0;

//   const horizontalSpacing = 200;
//   const verticalSpacing = 150;

//   let currentRow = 0;
//   let currentCol = 0;
//   let maxCols = 0;

//   const lines = blockData.code.split('\n');
//   let inBlockBeta = false;
  
//   // First, collect all blocks in order
//   const allBlocksInOrder = [];
  
//   for (const line of lines) {
//     const trimmed = line.trim();

//     if (trimmed === 'block-beta') {
//       inBlockBeta = true;
//       continue;
//     }

//     if (!inBlockBeta) continue;
//     if (trimmed.startsWith('%%') || trimmed.startsWith('style') || trimmed.startsWith('columns')) continue;
//     if (!trimmed || trimmed === 'end') continue;

//     const blocksInLine = parseBlockLine(trimmed);
//     allBlocksInOrder.push(...blocksInLine);
//   }

//   // Create a better layout based on connections and block types
//   const connections = blockData.connections || [];
  
//   // Group by rows based on connections
//   const rows = [];
//   let currentRowBlocks = new Set();
  
//   // Simple sequential layout for now - you can enhance this based on connections
//   allBlocksInOrder.forEach((block, index) => {
//     if (!block) return;
    
//     const x = 100 + (index % 3) * horizontalSpacing;
//     const y = 100 + Math.floor(index / 3) * verticalSpacing;
    
//     positions.set(block.id, { x, y });
//   });

//   // If we have connections, try to organize based on flow
//   if (connections.length > 0) {
//     const visited = new Set();
//     let rowIndex = 0;
    
//     // Find starting nodes (nodes with no incoming connections)
//     const allNodes = new Set(allBlocksInOrder.map(b => b?.id).filter(Boolean));
//     const targets = new Set(connections.map(conn => conn.targetId));
//     const starters = Array.from(allNodes).filter(node => !targets.has(node));
    
//     if (starters.length > 0) {
//       // Layout starting from root nodes
//       starters.forEach((startId, index) => {
//         positions.set(startId, { x: 100 + index * horizontalSpacing, y: 100 });
//       });
      
//       // Simple BFS-like layout for connected nodes
//       let currentLevel = [...starters];
//       let level = 1;
      
//       while (currentLevel.length > 0) {
//         const nextLevel = [];
        
//         currentLevel.forEach((nodeId, index) => {
//           const outgoing = connections.filter(conn => conn.sourceId === nodeId);
          
//           outgoing.forEach((conn, connIndex) => {
//             if (!visited.has(conn.targetId)) {
//               const x = 100 + (nextLevel.length * horizontalSpacing);
//               const y = 100 + (level * verticalSpacing);
//               positions.set(conn.targetId, { x, y });
//               nextLevel.push(conn.targetId);
//               visited.add(conn.targetId);
//             }
//           });
//         });
        
//         currentLevel = nextLevel;
//         level++;
//       }
//     }
//   }

//   // Fill in any missing positions with a grid layout
//   allBlocksInOrder.forEach((block, index) => {
//     if (!block || positions.has(block.id)) return;
    
//     const row = Math.floor(index / 3);
//     const col = index % 3;
//     const x = 100 + col * horizontalSpacing;
//     const y = 100 + row * verticalSpacing;
    
//     positions.set(block.id, { x, y });
//   });

//   return positions;
// };
// const generateUniversalLayout = (blockData) => {
//   const positions = new Map();

//   const horizontalSpacing = 150;
//   const verticalSpacing = 120;

//   let currentRow = 0;
//   let currentCol = 0;
//   let maxCols = 0;

//   const lines = blockData.code.split("\n");
//   let inBlockBeta = false;

//   for (const line of lines) {
//     const trimmed = line.trim();

//     if (trimmed === "block-beta") {
//       inBlockBeta = true;
//       continue;
//     }

//     if (!inBlockBeta) continue;
//     if (
//       trimmed.startsWith("%%") ||
//       trimmed.startsWith("style") ||
//       trimmed.startsWith("columns")
//     )
//       continue;
//     if (!trimmed || trimmed === "end") continue;

//     const blocksInLine = parseBlockLine(trimmed);

//     currentCol = 0;

//     for (const block of blocksInLine) {
//       if (!block) continue;

//       const x = 100 + currentCol * horizontalSpacing;
//       const y = 100 + currentRow * verticalSpacing;

//       positions.set(block.id, { x, y });

//       const span = block.span || 1;
//       currentCol += span;

//       maxCols = Math.max(maxCols, currentCol);
//     }

//     currentRow++;
//   }

//   return positions;
// };
const parseBlockBetaCode = (text) => {
  const result = {
    containers: new Map(),
    blocks: new Map(),
    connections: [],
    positions: new Map(),
    sizes: new Map(),
    styles: new Map(),
    columns: 1,
    isBlockBeta: false,
    code: text,
  };

  if (!text || !text.trim()) return result;

  const lines = text.split("\n");
  let inBlockBeta = false;
  let currentContainer = null;
  let currentContainerBlocks = [];

  const allBlockIds = new Set();
  const processedBlocks = new Set(); // Track processed blocks to avoid duplicates

  // First pass: collect styles, positions, and sizes
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === "block-beta") {
      inBlockBeta = true;
      result.isBlockBeta = true;
      continue;
    }

    if (!inBlockBeta) continue;

    // Parse style definitions
    const styleMatch = line.match(/^style\s+([^\s]+)\s+(.+)$/);
    if (styleMatch) {
      const [, id, styleString] = styleMatch;
      const styleProps = parseStyleString(styleString);
      result.styles.set(id, styleProps);
      console.log(`Found style for ${id}:`, styleProps);
      continue;
    }

    // Parse positions
    const posMatch = line.match(
      /^%%\s*Position:\s*([^=\s]+)\s*=\s*\[(-?\d+),\s*(-?\d+)\]/
    );
    if (posMatch) {
      const [, id, x, y] = posMatch;
      result.positions.set(id, { x: parseInt(x), y: parseInt(y) });
      continue;
    }

    // Parse sizes
    const sizeMatch = line.match(
      /^%%\s*Size:\s*([^=\s]+)\s*=\s*\[(-?\d+),\s*(-?\d+)\]/
    );
    if (sizeMatch) {
      const [, id, width, height] = sizeMatch;
      result.sizes.set(id, { width: parseInt(width), height: parseInt(height) });
      continue;
    }

    // Parse columns
    const columnsMatch = line.match(/^columns\s+(\d+)/);
    if (columnsMatch) {
      result.columns = parseInt(columnsMatch[1]);
      continue;
    }
  }

  if (!result.isBlockBeta) {
    return result;
  }

  // Second pass: parse blocks (avoid duplicates)
  inBlockBeta = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (line === "block-beta") {
      inBlockBeta = true;
      continue;
    }

    if (!inBlockBeta) continue;
    if (!line) continue;

    // Skip comments in second pass
    if (line.startsWith("%%")) continue;

    // Skip style lines in second pass (already processed)
    if (line.startsWith("style")) continue;

    // Parse container blocks
    const containerMatch = line.match(/^block:([^\s]+)$/);
    if (containerMatch) {
      currentContainer = containerMatch[1];
      currentContainerBlocks = [];
      result.containers.set(currentContainer, {
        id: currentContainer,
        type: "Container",
        label: currentContainer,
        blocks: [],
      });
      continue;
    }

    // End container
    if (line === "end" && currentContainer) {
      const container = result.containers.get(currentContainer);
      if (container) container.blocks = [...currentContainerBlocks];
      currentContainer = null;
      currentContainerBlocks = [];
      continue;
    }

    // Parse connections - support both unidirectional (-->) and bidirectional (<-->)
    const bidirectionalMatch = line.match(/^([^\s-<>]+)\s*<-->\s*([^\s-<>]+)$/);
    const unidirectionalMatch = line.match(/^([^\s->]+)\s*-->\s*([^\s->]+)$/);

    if (
      (bidirectionalMatch || unidirectionalMatch) &&
      !line.includes("[") &&
      !line.includes("(") &&
      !line.includes("{")
    ) {
      const match = bidirectionalMatch || unidirectionalMatch;
      const [, sourceId, targetId] = match;
      result.connections.push({
        sourceId: sourceId.trim(),
        targetId: targetId.trim(),
        sourceSide: "bottom",
        targetSide: "top",
        bidirectional: !!bidirectionalMatch,
      });
      continue;
    }

    // Parse block definitions - skip if already processed
    const blocksInLine = parseBlockLine(line);

    for (const blockDef of blocksInLine) {
      if (!blockDef || processedBlocks.has(blockDef.id)) {
        console.log(`Skipping duplicate block: ${blockDef?.id}`);
        continue;
      }

      const { id, type, shape, label, direction, span, wide } = blockDef;

      // Mark as processed
      processedBlocks.add(id);
      allBlockIds.add(id);

      const blockData = {
        id,
        type: type || "Block",
        label: label || id,
        shape: shape || "rectangle",
        style: result.styles.get(id),
        container: currentContainer,
        span: span || 1,
        wide: wide || false,
      };

      if (direction) {
        blockData.direction = direction;
      }

      console.log(`Creating block ${id} with style:`, result.styles.get(id));
      result.blocks.set(id, blockData);

      if (currentContainer) {
        currentContainerBlocks.push(id);
      }
    }
  }

  createMissingConnections(result, allBlockIds);

  console.log("Final parsed blocks:");
  result.blocks.forEach((block, id) => {
    console.log(`- ${id}:`, block);
  });

  return result;
};

const createFlowElements = (blockData) => {
  const nodes = [];
  const edges = [];
  const nodeMap = new Map();

  const layoutPositions = generateUniversalLayout(blockData);

  blockData.blocks.forEach((block, id) => {
    const savedPosition = blockData.positions.get(id);
    const layoutPosition = layoutPositions.get(id);
    const position = savedPosition || layoutPosition || { x: 100, y: 100 };

    // Get saved size or default dimensions based on block shape
    const savedSize = blockData.sizes?.get(id);
    let defaultWidth = 180;
    let defaultHeight = 60;

    if (block.shape === "circle") {
      defaultWidth = 150;
      defaultHeight = 150;
    } else if (block.shape === "diamond") {
      defaultWidth = 150;
      defaultHeight = 150;
    } else if (block.shape === "cylinder") {
      defaultWidth = 180;
      defaultHeight = 120;
    } else if (block.shape === "arrow") {
      defaultWidth = block.direction === "right" || block.direction === "left" ? 180 : 100;
      defaultHeight = block.direction === "right" || block.direction === "left" ? 100 : 180;
    } else if (block.shape === "space") {
      defaultWidth = (block.span || 1) * 120;
      defaultHeight = 40;
    } else if (block.wide) {
      defaultWidth = 200;
    } else if (block.span && block.span > 1) {
      defaultWidth = 180 * block.span;
    }

    // Use saved size if available, otherwise use defaults
    const width = savedSize?.width || defaultWidth;
    const height = savedSize?.height || defaultHeight;

    const blockNode = {
      id,
      type: "block",
      position,
      data: {
        nodeType: "block",
        blockData: block,
      },
      style: {
        width,
        height,
      },
      draggable: true,
      resizable: true,
    };

    nodes.push(blockNode);
    nodeMap.set(id, blockNode);
  });

  blockData.connections.forEach((conn, index) => {
    const sourceNode = nodeMap.get(conn.sourceId);
    const targetNode = nodeMap.get(conn.targetId);

    if (sourceNode && targetNode) {
      const edge = {
        id: `edge-${index}-${conn.sourceId}-${conn.targetId}`,
        source: conn.sourceId,
        target: conn.targetId,
        sourceHandle: conn.sourceSide || "bottom",
        targetHandle: conn.targetSide || "top",
        type: "custom",
        style: { stroke: "#000000", strokeWidth: 2 },
        data: {
          bidirectional: conn.bidirectional || false,
          color: conn.color || "#000000",
          strokeWidth: conn.strokeWidth || 2,
          label: conn.label || "",
        },
      };
      edges.push(edge);
    }
  });

  return { nodes, edges };
};

const EditPanel = ({ selectedNode, onSave, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (selectedNode) {
      if (selectedNode.data.nodeType === "container") {
        setFormData({
          label:
            selectedNode.data.containerData?.label ||
            selectedNode.data.containerData?.id ||
            "",
          type: selectedNode.data.containerData?.type || "container",
        });
      } else if (selectedNode.data.nodeType === "block") {
        const blockData = selectedNode.data.blockData;
        setFormData({
          label: blockData?.label || blockData?.id || "",
          type: blockData?.type || "block",
          shape: blockData?.shape || "rectangle",
          span: blockData?.span || 1,
          wide: blockData?.wide || false,
        });
      }
    }
  }, [selectedNode]);

  const handleChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    if (onUpdate) {
      onUpdate(selectedNode.id, updatedData);
    }
  };

  const handleSave = () => {
    if (onSave && selectedNode) {
      onSave(selectedNode.id, formData, selectedNode.data.nodeType);
    }
  };

  if (!selectedNode) return null;

  const nodeType = selectedNode.data.nodeType;

  return (
    <Paper
      sx={{
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 1000,
        padding: "16px",
        minWidth: "300px",
        background: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        border: "2px solid #000000",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <h3 style={{ margin: 0, color: "#000000", fontSize: "14px" }}>
          Edit {nodeType}: {selectedNode.id}
        </h3>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Label"
          size="small"
          value={formData.label || ""}
          onChange={(e) => handleChange("label", e.target.value)}
        />

        {/* <TextField
          label="Type"
          size="small"
          value={formData.type || ""}
          onChange={(e) => handleChange("type", e.target.value)}
        /> */}

        {nodeType === "block" && (
          <>
            <TextField
              select
              label="Shape"
              size="small"
              value={formData.shape || "rectangle"}
              onChange={(e) => handleChange("shape", e.target.value)}
            >
              <MenuItem value="rectangle">Rectangle</MenuItem>
              <MenuItem value="circle">Circle</MenuItem>
              <MenuItem value="diamond">Diamond</MenuItem>
              <MenuItem value="arrow">Arrow</MenuItem>
              <MenuItem value="space">Space</MenuItem>
              <MenuItem value="cylinder">Cylinder</MenuItem>
            </TextField>
          </>
        )}

        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            size="small"
            onClick={onClose}
            sx={{ borderColor: "#000000", color: "#000000" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleSave}
            startIcon={<SaveIcon />}
            sx={{
              backgroundColor: "#000000",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#333333",
              },
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

const ContextMenu = ({ position, onAddBlock, onAddContainer, onClose }) => {
  if (!position) return null;

  return (
    <Paper
      sx={{
        position: "absolute",
        top: position.y,
        left: position.x,
        zIndex: 2000,
        padding: "8px",
        minWidth: "150px",
        background: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        border: "2px solid #000000",
      }}
    >
      <MenuItem
        onClick={() => {
          onAddBlock(position);
          onClose();
        }}
      >
        <AddIcon fontSize="small" sx={{ mr: 1 }} />
        Add Block
      </MenuItem>
      <MenuItem
        onClick={() => {
          onAddContainer(position);
          onClose();
        }}
      >
        <AddIcon fontSize="small" sx={{ mr: 1 }} />
        Add Container
      </MenuItem>
    </Paper>
  );
};

const BlockDiagramView = ({ color, fontSizes }) => {
  const { chartRef } = useContext(ChartContext);
  const code = useStore.use.code();
  const setCode = useStore.use.setCode();
  const setSvg = useStore.use.setSvg();
  const { id } = useParams();
  const { project, fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [hasFitView, setHasFitView] = useState(false);
  const [textStyle, setTextStyle] = useState({
    text: '',
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    color: '#000000',
    fontWeight: '400',
    fontStyle: 'normal',
    textDecoration: 'none',
    animation: 'none',
  });

  // Diagram styles state
  const [diagramStyles, setDiagramStyles] = useState({
    node: {
      backgroundColor: '#FFFFFF',
      borderColor: '#8B5CF6',
      borderWidth: 2,
      borderStyle: 'solid',
      borderRadius: 8,
      textColor: '#1F2937',
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      fontWeight: '400',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      animation: 'none',
    },
    edge: {
      stroke: '#8B5CF6',
      strokeWidth: 2,
      strokeDasharray: '0',
      animated: false,
      markerColor: '#8B5CF6',
      labelBgColor: '#F3E8FF',
      labelTextColor: '#8B5CF6',
      animation: 'none',
    },
  });

  // Drag and drop state
  const [dragConfirmDialog, setDragConfirmDialog] = useState(null);
  const [pendingDragOperation, setPendingDragOperation] = useState(null);

  const codeRef = useRef(code);
  codeRef.current = code;

  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
    setSelectedNode(null); // Deselect node when edge is selected
  }, []);
  const toggleBidirectional = useCallback(() => {
    if (!selectedEdge) return;

    const currentCode = codeRef.current;
    const lines = currentCode.split("\n");
    const isBidirectional = selectedEdge.data?.bidirectional || false;

    // Update the connection line in code
    const newLines = lines.map((line) => {
      const trimmed = line.trim();

      // Check for bidirectional arrow
      if (trimmed.includes("<-->")) {
        const match = trimmed.match(/^([^\s-<>]+)\s*<-->\s*([^\s-<>]+)$/);
        if (match) {
          const [, sourceId, targetId] = match;
          if (sourceId.trim() === selectedEdge.source && targetId.trim() === selectedEdge.target) {
            // Convert to unidirectional
            return line.replace("<-->", "-->");
          }
        }
      }

      // Check for unidirectional arrow
      if (trimmed.includes("-->")) {
        const match = trimmed.match(/^([^\s->]+)\s*-->\s*([^\s->]+)$/);
        if (match) {
          const [, sourceId, targetId] = match;
          if (sourceId.trim() === selectedEdge.source && targetId.trim() === selectedEdge.target) {
            // Convert to bidirectional
            return line.replace("-->", "<-->");
          }
        }
      }

      return line;
    });

    setCode(newLines.join("\n"));
    setStatusMessage(
      `Arrow ${isBidirectional ? "unidirectional" : "bidirectional"}: ${selectedEdge.source} ${isBidirectional ? "-->" : "<-->"} ${selectedEdge.target}`
    );
    setTimeout(() => setStatusMessage(""), 3000);
  }, [selectedEdge, setCode]);

  const deleteEdge = useCallback(() => {
    if (!selectedEdge) return;

    const currentCode = codeRef.current;
    const lines = currentCode.split("\n");

    // Remove the connection line from code (both unidirectional and bidirectional)
    const newLines = lines.filter((line) => {
      const trimmed = line.trim();

      // Check for bidirectional arrow
      if (trimmed.includes("<-->")) {
        const match = trimmed.match(/^([^\s-<>]+)\s*<-->\s*([^\s-<>]+)$/);
        if (match) {
          const [, sourceId, targetId] = match;
          if (sourceId.trim() === selectedEdge.source && targetId.trim() === selectedEdge.target) {
            return false; // Remove this connection line
          }
        }
      }

      // Check for unidirectional arrow
      if (trimmed.includes("-->")) {
        const match = trimmed.match(/^([^\s->]+)\s*-->\s*([^\s->]+)$/);
        if (match) {
          const [, sourceId, targetId] = match;
          if (sourceId.trim() === selectedEdge.source && targetId.trim() === selectedEdge.target) {
            return false; // Remove this connection line
          }
        }
      }

      return true;
    });

    setCode(newLines.join("\n"));
    setSelectedEdge(null);
    const arrowType = selectedEdge.data?.bidirectional ? "<-->" : "-->";
    setStatusMessage(
      `Deleted connection: ${selectedEdge.source} ${arrowType} ${selectedEdge.target}`
    );
    setTimeout(() => setStatusMessage(""), 3000);
  }, [selectedEdge, setCode]);
  useEffect(() => {
    if (code) {
      try {
        const blockData = parseBlockBetaCode(code);
        console.log("Parsed blocks:", Array.from(blockData.blocks.entries()));
        console.log("Parsed styles:", Array.from(blockData.styles.entries()));

        const { nodes: flowNodes, edges: flowEdges } =
          createFlowElements(blockData);

        // Add diagram styles to all nodes and edges
        const styledNodes = flowNodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            diagramStyles: diagramStyles,
          },
        }));

        const styledEdges = flowEdges.map(edge => ({
          ...edge,
          data: {
            ...edge.data,
            diagramStyles: diagramStyles,
          },
        }));

        setNodes(styledNodes);
        setEdges(styledEdges);
        setIsInitialized(true);
        setHasFitView(false);
      } catch (error) {
        console.error("Error parsing block-beta code:", error);
        setStatusMessage("Error parsing diagram code");
        setTimeout(() => setStatusMessage(""), 3000);
      }
    }
  }, [code, setNodes, setEdges, diagramStyles]);

  useEffect(() => {
    if (isInitialized && reactFlowInstance && !hasFitView) {
      const timer = setTimeout(() => {
        try {
          reactFlowInstance.fitView({
            padding: 0.2,
            duration: 800,
            includeHiddenNodes: false,
          });
          setHasFitView(true);
          console.log("Diagram fitted to view");
        } catch (error) {
          console.error("Error fitting view:", error);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isInitialized, reactFlowInstance, hasFitView]);

  const onNodeDrag = useCallback(
    (event, node) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, position: node.position } : n
        )
      );
    },
    [setNodes]
  );

  // Helper function to check if a block overlaps with a container
  const getContainerAtPosition = useCallback((blockPosition, blockId) => {
    const blockCenter = {
      x: blockPosition.x + 90, // approximate center
      y: blockPosition.y + 30,
    };

    for (const node of nodes) {
      if (node.type === "container" && node.id !== blockId) {
        const containerBounds = {
          left: node.position.x,
          right: node.position.x + (node.style?.width || 300),
          top: node.position.y,
          bottom: node.position.y + (node.style?.height || 200),
        };

        if (
          blockCenter.x >= containerBounds.left &&
          blockCenter.x <= containerBounds.right &&
          blockCenter.y >= containerBounds.top &&
          blockCenter.y <= containerBounds.bottom
        ) {
          return node;
        }
      }
    }
    return null;
  }, [nodes]);

  const onNodeDragStop = useCallback(
    (event, node) => {
      // Skip position update for containers
      if (node.type === "container") {
        const currentCode = codeRef.current;
        const lines = currentCode.split("\n");

        const newLines = lines.filter((line) => {
          const trimmed = line.trim();
          return !trimmed.startsWith(`%% Position: ${node.id}`);
        });

        const positionLine = `%% Position: ${node.id} = [${Math.round(
          node.position.x
        )}, ${Math.round(node.position.y)}]`;

        newLines.push(positionLine);
        setCode(newLines.join("\n"));
        setStatusMessage(`Position updated for container ${node.id}`);
        setTimeout(() => setStatusMessage(""), 2000);
        return;
      }

      // For blocks, check if dropped into a different container
      const currentContainer = node.data?.blockData?.container;
      const targetContainer = getContainerAtPosition(node.position, node.id);
      const targetContainerId = targetContainer?.id || null;

      // If moving between containers or out of a container, show confirmation
      if (currentContainer !== targetContainerId) {
        if (targetContainerId === null) {
          // Trying to move block outside any container - prevent this
          setStatusMessage("Blocks must be inside a container!");
          setTimeout(() => setStatusMessage(""), 3000);
          // Revert position - reload diagram
          const blockData = parseBlockBetaCode(codeRef.current);
          const { nodes: flowNodes, edges: flowEdges } = createFlowElements(blockData);
          setNodes(flowNodes);
          setEdges(flowEdges);
          return;
        }

        // Show confirmation dialog
        setPendingDragOperation({
          blockId: node.id,
          fromContainer: currentContainer,
          toContainer: targetContainerId,
          position: node.position,
        });
        setDragConfirmDialog({
          blockId: node.id,
          fromContainer: currentContainer || "no container",
          toContainer: targetContainerId,
        });
        return;
      }

      // Normal position update within same container
      const currentCode = codeRef.current;
      const lines = currentCode.split("\n");

      const newLines = lines.filter((line) => {
        const trimmed = line.trim();
        return !trimmed.startsWith(`%% Position: ${node.id}`);
      });

      const positionLine = `%% Position: ${node.id} = [${Math.round(
        node.position.x
      )}, ${Math.round(node.position.y)}]`;

      let insertIndex = newLines.length;
      for (let i = 0; i < newLines.length; i++) {
        const line = newLines[i];
        if (
          line.includes(node.id) &&
          !line.trim().startsWith("%%") &&
          !line.trim().startsWith("style")
        ) {
          insertIndex = i + 1;
          break;
        }
      }

      newLines.splice(insertIndex, 0, positionLine);
      const updatedCode = newLines.join("\n");

      setCode(updatedCode);
      setStatusMessage(`Position updated for ${node.id}`);
      setTimeout(() => setStatusMessage(""), 2000);
    },
    [setCode, getContainerAtPosition, nodes, setNodes, setEdges]
  );

  // Handle confirmation of moving block between containers
  const handleConfirmMove = useCallback(() => {
    if (!pendingDragOperation) return;

    const { blockId, fromContainer, toContainer, position } = pendingDragOperation;
    const currentCode = codeRef.current;
    const lines = currentCode.split("\n");

    let newLines = [];
    let inFromContainer = false;
    let inToContainer = false;
    let blockLineContent = "";
    let blockFound = false;

    // First pass: find and remove the block from its current location
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Track container context
      if (trimmed.startsWith("block:")) {
        const containerMatch = trimmed.match(/^block:([^\s]+)$/);
        if (containerMatch) {
          const containerId = containerMatch[1];
          inFromContainer = containerId === fromContainer;
          inToContainer = containerId === toContainer;
        }
      }

      if (trimmed === "end") {
        inFromContainer = false;
        inToContainer = false;
      }

      // Skip the block line if it's in the source container
      if (inFromContainer && (trimmed.includes(`${blockId}[`) || trimmed.includes(`${blockId}(`) || trimmed === blockId)) {
        blockLineContent = trimmed;
        blockFound = true;
        continue; // Skip adding this line
      }

      // Skip position comments for the moved block
      if (trimmed.startsWith(`%% Position: ${blockId}`)) {
        continue;
      }

      newLines.push(line);
    }

    if (!blockFound) {
      setStatusMessage("Error: Could not find block to move");
      setTimeout(() => setStatusMessage(""), 3000);
      setDragConfirmDialog(null);
      setPendingDragOperation(null);
      return;
    }

    // Second pass: insert the block into the target container
    const finalLines = [];
    inToContainer = false;
    let insertedBlock = false;

    for (let i = 0; i < newLines.length; i++) {
      const line = newLines[i];
      const trimmed = line.trim();

      // Track when we're in the target container
      if (trimmed.startsWith("block:")) {
        const containerMatch = trimmed.match(/^block:([^\s]+)$/);
        if (containerMatch && containerMatch[1] === toContainer) {
          inToContainer = true;
        }
      }

      finalLines.push(line);

      // Insert block at the beginning of target container (after block: line)
      if (inToContainer && !insertedBlock && trimmed.startsWith("block:")) {
        finalLines.push(`    ${blockLineContent}`);
        finalLines.push(`%% Position: ${blockId} = [${Math.round(position.x)}, ${Math.round(position.y)}]`);
        insertedBlock = true;
        inToContainer = false;
      }

      if (trimmed === "end") {
        inToContainer = false;
      }
    }

    setCode(finalLines.join("\n"));
    setStatusMessage(`Moved ${blockId} from ${fromContainer || "no container"} to ${toContainer}`);
    setTimeout(() => setStatusMessage(""), 3000);
    setDragConfirmDialog(null);
    setPendingDragOperation(null);
  }, [pendingDragOperation, setCode]);

  const handleCancelMove = useCallback(() => {
    // Revert the drag operation
    const blockData = parseBlockBetaCode(codeRef.current);
    const { nodes: flowNodes, edges: flowEdges } = createFlowElements(blockData);
    setNodes(flowNodes);
    setEdges(flowEdges);
    setDragConfirmDialog(null);
    setPendingDragOperation(null);
    setStatusMessage("Move cancelled");
    setTimeout(() => setStatusMessage(""), 2000);
  }, [setNodes, setEdges]);

  const onNodeResize = useCallback((event, { id: nodeId, width, height }) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              style: {
                ...node.style,
                width,
                height,
              },
            }
          : node
      )
    );
  }, [setNodes]);

  const onNodeResizeStop = useCallback(
    (event, { id: nodeId, width, height }) => {
      const currentCode = codeRef.current;
      const lines = currentCode.split("\n");

      // Remove existing size comment
      const newLines = lines.filter((line) => {
        const trimmed = line.trim();
        return !trimmed.startsWith(`%% Size: ${nodeId}`);
      });

      const sizeLine = `%% Size: ${nodeId} = [${Math.round(width)}, ${Math.round(
        height
      )}]`;

      let insertIndex = newLines.length;
      for (let i = 0; i < newLines.length; i++) {
        const line = newLines[i];
        if (
          line.includes(nodeId) &&
          !line.trim().startsWith("%%") &&
          !line.trim().startsWith("style")
        ) {
          insertIndex = i + 1;
          break;
        }
      }

      newLines.splice(insertIndex, 0, sizeLine);
      const updatedCode = newLines.join("\n");

      setCode(updatedCode);
      setStatusMessage(`Size updated for ${nodeId}: ${Math.round(width)}x${Math.round(height)}`);
      setTimeout(() => setStatusMessage(""), 2000);
    },
    [setCode]
  );

  const addNewBlock = useCallback(
    (position = { x: 200, y: 200 }) => {
      const blockId = `block_${Date.now()}`;
      const currentCode = codeRef.current;

      let newCode;
      if (currentCode.includes("block-beta")) {
        newCode = `${currentCode}\n${blockId}["New Block"]\n%% Position: ${blockId} = [${Math.round(
          position.x
        )}, ${Math.round(position.y)}]`;
      } else {
        newCode = `block-beta\n${blockId}["New Block"]\n%% Position: ${blockId} = [${Math.round(
          position.x
        )}, ${Math.round(position.y)}]`;
      }

      setCode(newCode);
      setStatusMessage(`Added new block: ${blockId}`);
      setTimeout(() => setStatusMessage(""), 3000);
    },
    [setCode]
  );

  const addNewContainer = useCallback(
    (position = { x: 200, y: 200 }) => {
      const containerId = `container_${Date.now()}`;
      const currentCode = codeRef.current;

      let newCode;
      if (currentCode.includes("block-beta")) {
        newCode = `${currentCode}\nblock:${containerId}\n  A["Block A"]\n  B["Block B"]\nend\n%% Position: ${containerId} = [${Math.round(
          position.x
        )}, ${Math.round(position.y)}]`;
      } else {
        newCode = `block-beta\nblock:${containerId}\n  A["Block A"]\n  B["Block B"]\nend\n%% Position: ${containerId} = [${Math.round(
          position.x
        )}, ${Math.round(position.y)}]`;
      }

      setCode(newCode);
      setStatusMessage(`Added new container: ${containerId}`);
      setTimeout(() => setStatusMessage(""), 3000);
    },
    [setCode]
  );

  const deleteNode = useCallback(() => {
    if (!selectedNode) return;

    const nodeId = selectedNode.id;
    const currentCode = codeRef.current;
    const lines = currentCode.split("\n");
    const newLines = [];

    let skipNextLines = false;
    let inContainer = false;
    let containerDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith(`block:${nodeId}`)) {
        inContainer = true;
        skipNextLines = true;
        containerDepth = 1;
        continue;
      }

      if (inContainer) {
        if (line === "end") {
          containerDepth--;
          if (containerDepth === 0) {
            inContainer = false;
            skipNextLines = false;
          }
          continue;
        } else if (line.startsWith("block:")) {
          containerDepth++;
        }
      }

      if (skipNextLines) continue;

      if (
        line.includes(nodeId) &&
        !line.startsWith("%% Position:") &&
        !line.startsWith("style")
      ) {
        continue;
      }

      newLines.push(lines[i]);
    }

    setCode(newLines.join("\n"));
    setSelectedNode(null);
    setStatusMessage(`Deleted ${selectedNode.data.nodeType}: ${nodeId}`);
    setTimeout(() => setStatusMessage(""), 3000);
  }, [selectedNode, setCode]);

  const updateNode = useCallback(
    (nodeId, newData, nodeType) => {
      const currentCode = codeRef.current;
      const lines = currentCode.split("\n");
      const newLines = [];
      let nodeUpdated = false;

      // Get the original style for this node
      const originalStyleLine = lines.find((line) =>
        line.trim().startsWith(`style ${nodeId}`)
      );

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip the old block definition if we haven't updated it yet
        if (
          !nodeUpdated &&
          nodeType === "block" &&
          line.includes(nodeId) &&
          !line.startsWith("%%") &&
          !line.startsWith("style")
        ) {
          // Update block definition while preserving the original format as much as possible
          if (newData.shape === "circle") {
            newLines.push(`${nodeId}(("${newData.label}"))`);
          } else if (newData.shape === "diamond") {
            newLines.push(`${nodeId}{{"${newData.label}"}}`);
          } else if (newData.shape === "arrow") {
            newLines.push(
              `${nodeId}<["${newData.label || " "}"]>(${
                newData.direction || "right"
              })`
            );
          } else if (newData.shape === "cylinder") {
            newLines.push(`${nodeId}|"${newData.label}"|`);
          } else if (newData.shape === "space") {
            newLines.push(`space${newData.span > 1 ? `:${newData.span}` : ""}`);
          } else {
            // For rectangles, preserve the original format if possible
            if (line.includes("[") && line.includes("]")) {
              // Keep the bracket format
              newLines.push(`${nodeId}["${newData.label}"]`);
            } else {
              // Simple format
              newLines.push(`${nodeId}["${newData.label}"]`);
            }
          }
          nodeUpdated = true;
        } else if (
          !nodeUpdated &&
          nodeType === "container" &&
          line.startsWith(`block:${nodeId}`)
        ) {
          newLines.push(line);
          const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
          if (
            nextLine &&
            !nextLine.startsWith(" ") &&
            !nextLine.startsWith("\t")
          ) {
            newLines.push(`  ${nodeId}["${newData.label}"]`);
          }
          nodeUpdated = true;
        } else {
          // Keep all other lines including style definitions
          newLines.push(lines[i]);
        }
      }

      // If we didn't find the node to update, add it at the end
      if (!nodeUpdated && nodeType === "block") {
        if (newData.shape === "circle") {
          newLines.push(`${nodeId}(("${newData.label}"))`);
        } else if (newData.shape === "diamond") {
          newLines.push(`${nodeId}{{"${newData.label}"}}`);
        } else if (newData.shape === "cylinder") {
          newLines.push(`${nodeId}|"${newData.label}"|`);
        } else {
          newLines.push(`${nodeId}["${newData.label}"]`);
        }

        // Add the style if it exists in the original
        if (originalStyleLine) {
          newLines.push(originalStyleLine);
        }
      }

      const updatedCode = newLines.join("\n");
      console.log("Updated code:", updatedCode);
      setCode(updatedCode);
      setShowEditPanel(false);
      setStatusMessage(`Updated ${nodeType}: ${nodeId}`);
      setTimeout(() => setStatusMessage(""), 3000);
    },
    [setCode]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setContextMenu(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setContextMenu(null);
  }, []);

  const onPaneContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      if (reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          flowPosition: position,
        });
      }
    },
    [reactFlowInstance]
  );

  const onConnect = useCallback(
    (params) => {
      const connectionLine = `${params.source} --> ${params.target}`;
      const updatedCode = codeRef.current + "\n" + connectionLine;
      setCode(updatedCode);
      setStatusMessage(`Connected ${params.source} to ${params.target}`);
      setTimeout(() => setStatusMessage(""), 3000);
    },
    [setCode]
  );

  // const initializeDiagram = useCallback(() => {
  //   if (!code) return;

  //   try {
  //     console.log("Initializing diagram with code:", code);
  //     const blockData = parseBlockBetaCode(code);

  //     if (blockData.blocks.size === 0 && !code.includes("block-beta")) {
  //       const defaultCode = `block-beta
  // Start(("Start"))
  // Process1["Process 1"]
  // Decision{{"Decision?"}}
  // Process2["Process 2"]
  // End(("End"))

  // Start --> Process1
  // Process1 --> Decision
  // Decision --> Process2
  // Process2 --> End`;

  //       const defaultBlockData = parseBlockBetaCode(defaultCode);
  //       const { nodes: flowNodes, edges: flowEdges } =
  //         createFlowElements(defaultBlockData);
  //       setNodes(flowNodes);
  //       setEdges(flowEdges);
  //       setCode(defaultCode);
  //     } else {
  //       const { nodes: flowNodes, edges: flowEdges } =
  //         createFlowElements(blockData);
  //       setNodes(flowNodes);
  //       setEdges(flowEdges);
  //     }

  //     setIsInitialized(true);
  //     setHasFitView(false);
  //   } catch (error) {
  //     console.error("Error parsing block-beta code:", error);
  //     setStatusMessage("Error parsing diagram code");
  //     setTimeout(() => setStatusMessage(""), 3000);
  //   }
  // }, [code, setCode, setNodes, setEdges]);
  const initializeDiagram = useCallback(() => {
    if (!code) return;
  
    try {
      console.log("Initializing diagram with code:", code);
      const blockData = parseBlockBetaCode(code);
  
      if (blockData.blocks.size === 0 && !code.includes("block-beta")) {
        const defaultCode = `block-beta
  Start(("Start"))
  Browse["Browse Products"]
  Cart["Add to Cart"]
  Checkout["Checkout"]
  Payment{{"Process Payment"}}
  Inventory|"Inventory DB"|
  Ship["Ship Order"]
  End(("End"))
  
  Start --> Browse
  Browse --> Cart
  Cart --> Checkout
  Checkout --> Payment
  Payment -->|Success| Inventory
  Payment -->|Failed| Checkout
  Inventory --> Ship
  Ship --> End`;
  
        const defaultBlockData = parseBlockBetaCode(defaultCode);
        const { nodes: flowNodes, edges: flowEdges } =
          createFlowElements(defaultBlockData);
        setNodes(flowNodes);
        setEdges(flowEdges);
        setCode(defaultCode);
      } else {
        const { nodes: flowNodes, edges: flowEdges } =
          createFlowElements(blockData);
        setNodes(flowNodes);
        setEdges(flowEdges);
      }
  
      setIsInitialized(true);
      setHasFitView(false);
    } catch (error) {
      console.error("Error parsing block-beta code:", error);
      setStatusMessage("Error parsing diagram code");
      setTimeout(() => setStatusMessage(""), 3000);
    }
  }, [code, setCode, setNodes, setEdges]);
  useEffect(() => {
    if (isInitialized && reactFlowInstance && !hasFitView && nodes.length > 0) {
      console.log("Fitting view with nodes:", nodes.length);

      const timer = setTimeout(() => {
        try {
          reactFlowInstance.fitView({
            padding: 0.3,
            duration: 1000,
            includeHiddenNodes: false,
            minZoom: 0.5,
            maxZoom: 1.5,
          });
          setHasFitView(true);
          console.log("Diagram fitted to view successfully");
        } catch (error) {
          console.error("Error fitting view:", error);
          setTimeout(() => {
            try {
              reactFlowInstance.fitView({
                padding: 0.3,
                duration: 1000,
              });
              setHasFitView(true);
            } catch (retryError) {
              console.error("Retry failed:", retryError);
            }
          }, 500);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isInitialized, reactFlowInstance, hasFitView, nodes.length]);

  useEffect(() => {
    if (code) {
      try {
        const blockData = parseBlockBetaCode(code);
        console.log("Parsed blocks:", Array.from(blockData.blocks.entries()));
        console.log("Parsed styles:", Array.from(blockData.styles.entries()));

        const { nodes: flowNodes, edges: flowEdges } =
          createFlowElements(blockData);

        setNodes(flowNodes);
        setEdges(flowEdges);
        setIsInitialized(true);
        setHasFitView(false);

        // Deselect edge when edges are updated
        setSelectedEdge(null);
      } catch (error) {
        console.error("Error parsing block-beta code:", error);
        setStatusMessage("Error parsing diagram code");
        setTimeout(() => setStatusMessage(""), 3000);
      }
    }
  }, [code, setNodes, setEdges]);
  useEffect(() => {
    initializeDiagram();
  }, [initializeDiagram]);

  return (
    <Box
      ref={chartRef}
      sx={{
        height: "100vh",
        position: "relative",
        background: "#ffffff",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <StatusDisplay message={statusMessage} />

      {showEditPanel && selectedNode && (
        <EditPanel
          selectedNode={selectedNode}
          onSave={updateNode}
          onUpdate={() => {}}
          onClose={() => setShowEditPanel(false)}
        />
      )}

      {contextMenu && (
        <ContextMenu
          position={contextMenu}
          onAddBlock={(pos) => addNewBlock(pos.flowPosition)}
          onAddContainer={(pos) => addNewContainer(pos.flowPosition)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Drag and Drop Confirmation Dialog */}
      <Dialog
        open={!!dragConfirmDialog}
        onClose={handleCancelMove}
        aria-labelledby="drag-confirm-dialog-title"
        aria-describedby="drag-confirm-dialog-description"
      >
        <DialogTitle id="drag-confirm-dialog-title">
          Confirm Block Move
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="drag-confirm-dialog-description">
            {dragConfirmDialog && (
              <>
                Do you want to move block <strong>{dragConfirmDialog.blockId}</strong>
                {" from "}
                <strong>{dragConfirmDialog.fromContainer}</strong>
                {" to "}
                <strong>{dragConfirmDialog.toContainer}</strong>?
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelMove} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmMove} color="primary" variant="contained" autoFocus>
            Confirm Move
          </Button>
        </DialogActions>
      </Dialog>

      {selectedEdge && !showEditPanel && (
        <Box
          sx={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 1000,
            display: "flex",
            gap: 1,
            background: "white",
            padding: "8px",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            alignItems: "center",
          }}
        >
          <Tooltip
            title={
              selectedEdge.data?.bidirectional
                ? "Make Unidirectional (-->)"
                : "Make Bidirectional (<-->)"
            }
          >
            <IconButton
              size="small"
              onClick={toggleBidirectional}
              sx={{
                backgroundColor: selectedEdge.data?.bidirectional
                  ? "#e3f2fd"
                  : "transparent",
              }}
            >
              {selectedEdge.data?.bidirectional ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <polyline points="8,8 4,12 8,16" />
                  <polyline points="16,8 20,12 16,16" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <polyline points="16,8 20,12 16,16" />
                </svg>
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Connection">
            <IconButton size="small" onClick={deleteEdge}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Existing Node Delete Button */}
      {selectedNode && !showEditPanel && !selectedEdge && (
        <Box
          sx={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 1000,
            display: "flex",
            gap: 1,
            background: "white",
            padding: "8px",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => setShowEditPanel(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={deleteNode}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 1000,
          display: "flex",
          gap: 1,
          background: "white",
          padding: "8px",
          borderRadius: "4px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => addNewContainer()}
          sx={{
            backgroundColor: "#000000",
            color: "#ffffff",
            fontSize: "11px",
            "&:hover": { backgroundColor: "#333333" },
          }}
        >
          Add Container
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => addNewBlock()}
          sx={{
            borderColor: "#000000",
            color: "#000000",
            fontSize: "11px",
            "&:hover": {
              borderColor: "#333333",
              backgroundColor: "rgba(0,0,0,0.04)",
            },
          }}
        >
          Add Block
        </Button>
      </Box>

      {selectedNode && !showEditPanel && (
        <Box
          sx={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 1000,
            display: "flex",
            gap: 1,
            background: "white",
            padding: "8px",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => setShowEditPanel(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={deleteNode}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodeResize={onNodeResize}
        onNodeResizeStop={onNodeResizeStop}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView={!hasFitView}
        fitViewOptions={{ padding: 0.2, duration: 800 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        defaultEdgeOptions={{
          type: "custom",
          style: { stroke: "#000000", strokeWidth: 2 },
        }}
        connectionLineType={ConnectionLineType.SimpleBezier}
        connectionLineStyle={{ stroke: "#000000", strokeWidth: 2 }}
      >
        <Background color="#f0f0f0" gap={25} size={1} />
        <Controls position="bottom-right" />
      </ReactFlow>

      {/* Text Styling Panel */}
      <TextStylePanel
        onStyleChange={(style) => setTextStyle(style)}
        initialStyle={textStyle}
      />

      {/* Diagram Styling Panel */}
      <DiagramStylePanel
        onStyleChange={(styles) => setDiagramStyles(styles)}
        initialStyles={diagramStyles}
      />
    </Box>
  );
};

const BlockDiagramWrapper = (props) => (
  <ReactFlowProvider>
    <BlockDiagramView {...props} />
  </ReactFlowProvider>
);

export default BlockDiagramWrapper;
