"use client";

import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useDebounce } from "ahooks";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  TextField,
  Paper,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
  ReactFlowProvider,
  Handle,
  Position,
  NodeResizeControl,
} from "reactflow";
import "reactflow/dist/style.css";
import { useStore } from "@/store";
import { ChartContext } from "@/app/layout";
import { useParams } from "next/navigation";
import { TextStylePanel } from "@/components/diagram-styling";

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

// RequirementNode component with Mermaid-like black styling
const RequirementNode = ({ data, selected }) => {
  const isElement = data.elementType === "element";

  // Mermaid-like styling - simple black and white
  const getTypeStyle = () => {
    if (isElement) {
      return {
        background: "#ffffff",
        border: "2px dashed #000000",
      };
    }

    // Simple black and white styling for requirements
    return {
      background: "#ffffff",
      border: "2px solid #000000",
    };
  };

  const style = getTypeStyle();

  return (
    <>
      <NodeResizeControl
        style={{
          background: "transparent",
          border: "none",
        }}
        minWidth={180}
        minHeight={90}
      >
        <ResizeIcon />
      </NodeResizeControl>

      <div
        style={{
          padding: "10px",
          background: style.background,
          border: `${style.border} ${selected ? "3px" : "2px"}`,
          borderRadius: "0px",
          width: "100%",
          height: "100%",
          textAlign: "left",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          fontFamily: "Arial, sans-serif",
          fontSize: "11px",
          color: "#000000",
          overflow: "auto",
          boxSizing: "border-box",
        }}
      >
      {/* Header - Requirement Type */}
      <div
        style={{
          fontWeight: "bold",
          marginBottom: "4px",
          fontSize: "9px",
          color: "#000000",
          textTransform: "uppercase",
          borderBottom: "1px solid #000000",
          paddingBottom: "2px",
        }}
      >
        &lt;&lt;{data.requirementType || "element"}&gt;&gt;
      </div>

      {/* ID */}
      <div
        style={{
          fontWeight: "700",
          marginBottom: "4px",
          fontSize: "12px",
          color: "#000000",
          fontFamily: "monospace",
        }}
      >
        {data.id}
      </div>

      {/* Text */}
      {data.text && (
        <div
          style={{
            color: "#000000",
            marginBottom: "6px",
            lineHeight: "1.3",
            fontSize: "10px",
          }}
        >
          {data.text}
        </div>
      )}

      {/* Metadata Grid */}
      <div
        style={{
          fontSize: "8px",
          color: "#000000",
          marginTop: "4px",
          borderTop: "1px solid #cccccc",
          paddingTop: "2px",
        }}
      >
        {data.risk && (
          <div>
            <strong>Risk:</strong> {data.risk}
          </div>
        )}
        {(data.verifymethod || data.verifyMethod) && (
          <div>
            <strong>Verify:</strong> {data.verifymethod || data.verifyMethod}
          </div>
        )}
        {data.type && isElement && (
          <div>
            <strong>Type:</strong> {data.type}
          </div>
        )}
        {data.docRef && (
          <div>
            <strong>Doc:</strong> {data.docRef}
          </div>
        )}
      </div>

        {/* Handles - simplified for tree structure */}
        <Handle
          id="top"
          type="target"
          position={Position.Top}
          style={{
            background: "#000000",
            width: 8,
            height: 8,
            border: "1px solid #ffffff",
          }}
        />
        <Handle
          id="bottom"
          type="source"
          position={Position.Bottom}
          style={{
            background: "#000000",
            width: 8,
            height: 8,
            border: "1px solid #ffffff",
          }}
        />
      </div>
    </>
  );
};

const nodeTypes = {
  requirement: RequirementNode,
};

// Status Display Component - NEW: Shows updates in a box above arrows
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

const EditPanel = ({ selectedElement, onSave, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (selectedElement) {
      // Create a clean copy of the data without React Flow internal properties
      const cleanData = { ...selectedElement.data };
      delete cleanData.__rf;
      setFormData(cleanData);
    }
  }, [selectedElement]);

  const handleChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    // Real-time update for visual feedback
    if (onUpdate) {
      onUpdate(
        selectedElement.data.id,
        updatedData,
        selectedElement.data.requirementType || selectedElement.data.elementType
      );
    }
  };

  // const handleSave = () => {
  //   if (onSave && selectedElement) {
  //     // Clean the data before saving
  //     const cleanData = { ...formData };
  //     delete cleanData.id;
  //     delete cleanData.requirementType;
  //     delete cleanData.elementType;
  //     delete cleanData.position;
  //     delete cleanData.__rf;

  //     onSave(
  //       selectedElement.data.id,
  //       cleanData,
  //       selectedElement.data.requirementType || selectedElement.data.elementType
  //     );
  //   }
  // };
  const handleSave = () => {
    if (onSave && selectedElement) {
      // Clean the data before saving
      const cleanData = { ...formData };

      // Remove all internal properties
      const internalProps = [
        "id",
        "requirementType",
        "elementType",
        "position",
        "__rf",
      ];
      internalProps.forEach((prop) => delete cleanData[prop]);

      // Remove empty fields
      Object.keys(cleanData).forEach((key) => {
        if (
          cleanData[key] === "" ||
          cleanData[key] === undefined ||
          cleanData[key] === null
        ) {
          delete cleanData[key];
        }
      });

      console.log("Saving data:", cleanData);

      // Get the correct element type - use what's in the data, not assuming
      const elementType =
        selectedElement.data.requirementType ||
        selectedElement.data.elementType;

      onSave(selectedElement.data.id, cleanData, elementType);
    }
  };

  if (!selectedElement) return null;

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
          Edit {selectedElement.data.id}
        </h3>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Text"
          size="small"
          value={formData.text || ""}
          onChange={(e) => handleChange("text", e.target.value)}
          multiline
          rows={3}
        />

        <TextField
          label="Risk"
          size="small"
          value={formData.risk || ""}
          onChange={(e) => handleChange("risk", e.target.value)}
        />

        <TextField
          label="Verify Method"
          size="small"
          value={formData.verifymethod || formData.verifyMethod || ""}
          onChange={(e) => handleChange("verifymethod", e.target.value)}
        />

        <TextField
          label="Document Reference"
          size="small"
          value={formData.docRef || ""}
          onChange={(e) => handleChange("docRef", e.target.value)}
        />

        {selectedElement.data.elementType === "element" && (
          <TextField
            label="Type"
            size="small"
            value={formData.type || ""}
            onChange={(e) => handleChange("type", e.target.value)}
          />
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
const RequirementDiagramView = () => {
  const { chartRef } = useContext(ChartContext);
  const code = useStore.use.code();
  const setCode = useStore.use.setCode();
  const setSvg = useStore.use.setSvg();
  const { id } = useParams();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [connectionLineProps, setConnectionLineProps] = useState(null);
  const [connectionLabel, setConnectionLabel] = useState("contains");
  const [editingEdge, setEditingEdge] = useState(null);
  const [edgeEditPanel, setEdgeEditPanel] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedEdge, setSelectedEdge] = useState(null);
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
  const codeRef = useRef(code);
  codeRef.current = code;

  const onEdgeDoubleClick = useCallback((event, edge) => {
    event.stopPropagation();
    setEditingEdge(edge);
    setEdgeEditPanel(true);
  }, []);

  const EdgeEditPanel = ({ edge, onSave, onClose }) => {
    const [relationshipType, setRelationshipType] = useState(
      edge?.label || "contains"
    );
    const inputRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
      if (!edge) return;

      // Calculate position based on edge source and target nodes
      const calculatePositionFromNodes = () => {
        const sourceNode = document.querySelector(`[data-id="${edge.source}"]`);
        const targetNode = document.querySelector(`[data-id="${edge.target}"]`);

        if (sourceNode && targetNode && chartRef.current) {
          const sourceRect = sourceNode.getBoundingClientRect();
          const targetRect = targetNode.getBoundingClientRect();
          const containerRect = chartRef.current.getBoundingClientRect();

          // Calculate midpoint between source and target nodes
          const midX = (sourceRect.left + targetRect.left) / 2;
          const midY = (sourceRect.top + targetRect.top) / 2;

          const x = midX - containerRect.left - 75;
          const y = midY - containerRect.top - 20;

          setPosition({ x, y });

          // Focus after positioning
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
              inputRef.current.select();
            }
          }, 50);
        }
      };

      calculatePositionFromNodes();
    }, [edge]);

    const handleSave = () => {
      if (relationshipType.trim() && edge) {
        onSave(edge.id, relationshipType.trim());
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    const handleBlur = () => {
      setTimeout(handleSave, 100);
    };

    if (!edge) return null;

    return (
      <div
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          zIndex: 1000,
          pointerEvents: "auto",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            background: "white",
            border: "2px solid #000000",
            borderRadius: "4px",
            padding: "2px 8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            width: "150px",
            minHeight: "32px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <TextField
            inputRef={inputRef}
            value={relationshipType}
            onChange={(e) => setRelationshipType(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            variant="standard"
            size="small"
            fullWidth
            InputProps={{
              disableUnderline: true,
              style: {
                fontSize: "12px",
                fontWeight: "600",
                textAlign: "center",
              },
            }}
            sx={{
              "& .MuiInputBase-input": {
                padding: "4px 2px",
                textAlign: "center",
              },
            }}
          />
        </Paper>
      </div>
    );
  };

  // const saveNodePositionsToCode = useCallback(
  //   (updatedNodes) => {
  //     const currentCode = codeRef.current;
  //     const lines = currentCode.split("\n");
  //     const newLines = [];

  //     let inBlock = false;
  //     let currentBlockId = null;
  //     let blockIndent = "";

  //     for (let i = 0; i < lines.length; i++) {
  //       const line = lines[i];
  //       const trimmed = line.trim();

  //       // Check for block start
  //       const requirementTypes = [
  //         // General
  //         "requirement",
  //         "businessRequirement",
  //         "userRequirement",
  //         "systemRequirement",

  //         // Software Engineering
  //         "functionalRequirement",
  //         "nonFunctionalRequirement",
  //         "performanceRequirement",
  //         "securityRequirement",
  //         "usabilityRequirement",
  //         "reliabilityRequirement",
  //         "maintainabilityRequirement",
  //         "scalabilityRequirement",
  //         "availabilityRequirement",
  //         "complianceRequirement",
  //         "regulatoryRequirement",
  //         "safetyRequirement",
  //         "privacyRequirement",
  //         "dataRequirement",
  //         "interfaceRequirement",
  //         "integrationRequirement",
  //         "interoperabilityRequirement",

  //         // Systems / Engineering
  //         "physicalRequirement",
  //         "environmentalRequirement",
  //         "operationalRequirement",
  //         "technicalRequirement",
  //         "architecturalRequirement",
  //         "designConstraint",
  //         "processRequirement",
  //         "qualityRequirement",
  //         "verificationRequirement",
  //         "validationRequirement",
  //         "supportabilityRequirement",

  //         // Specialized Domains
  //         "hardwareRequirement",
  //         "softwareRequirement",
  //         "networkRequirement",
  //         "communicationRequirement",
  //         "testingRequirement",
  //         "documentationRequirement",
  //         "trainingRequirement",
  //         "sustainabilityRequirement",
  //         "legalRequirement",
  //         "ethicalRequirement",
  //         "marketRequirement",
  //         "customerRequirement",
  //         "stakeholderRequirement",

  //         // Project / Management
  //         "projectRequirement",
  //         "budgetRequirement",
  //         "scheduleRequirement",
  //         "resourceRequirement",
  //         "riskRequirement",
  //         "constraint",
  //         "assumption",

  //         // Miscellaneous / Placeholder
  //         "element",
  //         "newRequirementType",
  //         "anotherRequirementType",
  //         "yetAnotherRequirementType",
  //       ];

  //       let isBlockStart = false;

  //       for (const reqType of requirementTypes) {
  //         if (trimmed.startsWith(`${reqType} `) && trimmed.endsWith(" {")) {
  //           inBlock = true;
  //           currentBlockId = trimmed
  //             .substring(reqType.length + 1, trimmed.length - 2)
  //             .trim();
  //           blockIndent = line.match(/^(\s*)/)[1] || "";
  //           isBlockStart = true;
  //           break;
  //         }
  //       }

  //       if (isBlockStart) {
  //         newLines.push(line);
  //         // Add position data if this node has a new position
  //         const node = updatedNodes.find((n) => n.id === currentBlockId);
  //         if (node) {
  //           newLines.push(
  //             `${blockIndent}    position: "${node.position.x},${node.position.y}"`
  //           );
  //         }
  //         continue;
  //       }

  //       if (inBlock) {
  //         // Skip existing position line if it exists
  //         if (trimmed.startsWith("position:")) {
  //           continue;
  //         }

  //         if (trimmed === "}") {
  //           inBlock = false;
  //           currentBlockId = null;
  //         }
  //       }

  //       newLines.push(line);
  //     }

  //     const updatedCode = newLines.join("\n");
  //     setCode(updatedCode);
  //   },
  //   [setCode]
  // );

  const saveNodePositionsToCode = useCallback(
    (updatedNodes) => {
      const currentCode = codeRef.current;
      const lines = currentCode.split("\n");
      const newLines = [];

      let inBlock = false;
      let currentBlockId = null;
      let blockIndent = "";
      let hasPositionInBlock = false;

      console.log("=== SAVING POSITIONS ===");
      console.log("Updated nodes:", updatedNodes);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip diagram declaration and direction lines but keep them
        if (
          trimmed === "requirementDiagram" ||
          trimmed.startsWith("direction ")
        ) {
          newLines.push(line);
          continue;
        }

        // Check for block start - handle both syntaxes
        const requirementTypes = [
          // General
          "requirement",
          "businessRequirement",
          "userRequirement",
          "systemRequirement",

          // Software Engineering
          "functionalRequirement",
          "nonFunctionalRequirement",
          "performanceRequirement",
          "securityRequirement",
          "usabilityRequirement",
          "reliabilityRequirement",
          "maintainabilityRequirement",
          "scalabilityRequirement",
          "availabilityRequirement",
          "complianceRequirement",
          "regulatoryRequirement",
          "safetyRequirement",
          "privacyRequirement",
          "dataRequirement",
          "interfaceRequirement",
          "integrationRequirement",
          "interoperabilityRequirement",
          "requirementDiagram",

          // Systems / Engineering
          "physicalRequirement",
          "environmentalRequirement",
          "operationalRequirement",
          "technicalRequirement",
          "architecturalRequirement",
          "designConstraint",
          "processRequirement",
          "qualityRequirement",
          "verificationRequirement",
          "validationRequirement",
          "supportabilityRequirement",

          // Specialized Domains
          "hardwareRequirement",
          "softwareRequirement",
          "networkRequirement",
          "communicationRequirement",
          "testingRequirement",
          "documentationRequirement",
          "trainingRequirement",
          "sustainabilityRequirement",
          "legalRequirement",
          "ethicalRequirement",
          "marketRequirement",
          "customerRequirement",
          "stakeholderRequirement",

          // Project / Management
          "projectRequirement",
          "budgetRequirement",
          "scheduleRequirement",
          "resourceRequirement",
          "riskRequirement",
          "constraint",
          "assumption",

          // Miscellaneous / Placeholder
          "element",
          "newRequirementType",
          "anotherRequirementType",
          "yetAnotherRequirementType",
        ];

        let isBlockStart = false;
        let blockId = null;

        for (const reqType of requirementTypes) {
          // Pattern 1: type id { (without quotes)
          const pattern1 = new RegExp(`^${reqType}\\s+(\\w+)\\s*\\{$`);
          // Pattern 2: type "id" { (with quotes)
          const pattern2 = new RegExp(`^${reqType}\\s+"([^"]+)"\\s*\\{$`);
          // Pattern 3: type 'id' { (with single quotes)
          const pattern3 = new RegExp(`^${reqType}\\s+'([^']+)'\\s*\\{$`);

          const match1 = trimmed.match(pattern1);
          const match2 = trimmed.match(pattern2);
          const match3 = trimmed.match(pattern3);

          if (match1 || match2 || match3) {
            inBlock = true;
            hasPositionInBlock = false;

            if (match1) blockId = match1[1].trim();
            else if (match2) blockId = match2[1].trim();
            else if (match3) blockId = match3[1].trim();

            currentBlockId = blockId;
            blockIndent = line.match(/^(\s*)/)[1] || "";
            isBlockStart = true;

            console.log(`Found block start: ${reqType} ${blockId}`);
            break;
          }
        }

        if (isBlockStart) {
          newLines.push(line);

          // Add position data if this node has a new position
          const node = updatedNodes.find((n) => n.id === currentBlockId);
          if (node) {
            console.log(
              `Adding position for ${currentBlockId}: ${node.position.x},${node.position.y}`
            );
            newLines.push(
              `${blockIndent}    position: "${node.position.x},${node.position.y}"`
            );
          }
          continue;
        }

        if (inBlock) {
          // Check if this line is a position line
          if (trimmed.startsWith("position:")) {
            hasPositionInBlock = true;
            // Skip existing position line - we'll add the updated one
            continue;
          }

          // Check for block end
          if (trimmed === "}") {
            // If we're at the end of block and no position was found, add it now
            const node = updatedNodes.find((n) => n.id === currentBlockId);
            if (node && !hasPositionInBlock) {
              console.log(
                `Adding position at block end for ${currentBlockId}: ${node.position.x},${node.position.y}`
              );
              newLines.push(
                `${blockIndent}    position: "${node.position.x},${node.position.y}"`
              );
            }

            inBlock = false;
            currentBlockId = null;
            hasPositionInBlock = false;
            newLines.push(line);
            continue;
          }

          newLines.push(line);
        } else {
          newLines.push(line);
        }
      }

      const updatedCode = newLines.join("\n");
      console.log("Updated code with positions");
      setCode(updatedCode);
    },
    [setCode]
  );
  const onNodesChangeWithSave = useCallback(
    (changes) => {
      onNodesChange(changes);

      // Save positions when nodes are dragged
      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          // Debounce the save to avoid too many updates
          setTimeout(() => {
            const updatedNodes = nodes.map((node) =>
              node.id === change.id
                ? { ...node, position: change.position }
                : node
            );
            saveNodePositionsToCode(updatedNodes);
          }, 500);
        }
      });
    },
    [onNodesChange, nodes, saveNodePositionsToCode]
  );

  const parseRequirementDiagram = useCallback((text) => {
    if (!text || !text.trim()) {
      return {
        requirements: new Map(),
        elements: new Map(),
        relationships: [],
      };
    }

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const requirements = new Map();
    const elements = new Map();
    const relationships = [];

    let inBlock = false;
    let blockType = null;
    let blockId = null;
    let blockData = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip diagram declaration and direction lines
      if (line === "requirementDiagram" || line.startsWith("direction ")) {
        continue;
      }

      // Handle bidirectional relationship: from - relationship <-> to
      if (!inBlock && line.includes(" - ") && line.includes(" <-> ")) {
        const dashIndex = line.indexOf(" - ");
        const arrowIndex = line.indexOf(" <-> ");
        if (dashIndex < arrowIndex) {
          const from = line.substring(0, dashIndex).trim().replace(/['"]/g, "");
          const relationship = line.substring(dashIndex + 3, arrowIndex).trim();
          const to = line
            .substring(arrowIndex + 5)
            .trim()
            .replace(/['"]/g, "");
          relationships.push({ from, to, relationship, bidirectional: true });
          continue;
        }
      }

      // Handle forward relationship: from - relationship -> to
      if (!inBlock && line.includes(" - ") && line.includes(" -> ")) {
        const dashIndex = line.indexOf(" - ");
        const arrowIndex = line.indexOf(" -> ");
        if (dashIndex < arrowIndex) {
          const from = line.substring(0, dashIndex).trim().replace(/['"]/g, "");
          const relationship = line.substring(dashIndex + 3, arrowIndex).trim();
          const to = line
            .substring(arrowIndex + 4)
            .trim()
            .replace(/['"]/g, "");
          relationships.push({ from, to, relationship, bidirectional: false });
          continue;
        }
      }

      // Handle reverse relationship: to <- relationship - from
      if (!inBlock && line.includes(" <- ") && line.includes(" - ")) {
        const arrowIndex = line.indexOf(" <- ");
        const dashIndex = line.indexOf(" - ", arrowIndex);
        if (arrowIndex < dashIndex) {
          const to = line.substring(0, arrowIndex).trim().replace(/['"]/g, "");
          const relationship = line.substring(arrowIndex + 4, dashIndex).trim();
          const from = line
            .substring(dashIndex + 3)
            .trim()
            .replace(/['"]/g, "");
          relationships.push({ from, to, relationship, bidirectional: false });
          continue;
        }
      }

      // Handle block starts - UPDATED PATTERN
      const requirementTypes = [
        // General
        "requirement",
        "businessRequirement",
        "userRequirement",
        "systemRequirement",

        // Software Engineering
        "functionalRequirement",
        "nonFunctionalRequirement",
        "performanceRequirement",
        "securityRequirement",
        "usabilityRequirement",
        "reliabilityRequirement",
        "maintainabilityRequirement",
        "scalabilityRequirement",
        "availabilityRequirement",
        "complianceRequirement",
        "regulatoryRequirement",
        "safetyRequirement",
        "privacyRequirement",
        "dataRequirement",
        "interfaceRequirement",
        "integrationRequirement",
        "interoperabilityRequirement",

        // Systems / Engineering
        "physicalRequirement",
        "environmentalRequirement",
        "operationalRequirement",
        "technicalRequirement",
        "architecturalRequirement",
        "designConstraint",
        "processRequirement",
        "qualityRequirement",
        "verificationRequirement",
        "validationRequirement",
        "supportabilityRequirement",

        // Specialized Domains
        "hardwareRequirement",
        "softwareRequirement",
        "networkRequirement",
        "communicationRequirement",
        "testingRequirement",
        "documentationRequirement",
        "trainingRequirement",
        "sustainabilityRequirement",
        "legalRequirement",
        "ethicalRequirement",
        "marketRequirement",
        "customerRequirement",
        "stakeholderRequirement",

        // Project / Management
        "projectRequirement",
        "budgetRequirement",
        "scheduleRequirement",
        "resourceRequirement",
        "riskRequirement",
        "constraint",
        "assumption",

        // Miscellaneous / Placeholder
        "element",
        "newRequirementType",
        "anotherRequirementType",
        "yetAnotherRequirementType",
      ];

      // UPDATED: Handle both syntaxes - with and without quotes
      for (const reqType of requirementTypes) {
        // Pattern 1: type id { (without quotes)
        const pattern1 = new RegExp(`^${reqType}\\s+(\\w+)\\s*\\{$`);
        // Pattern 2: type "id" { (with quotes)
        const pattern2 = new RegExp(`^${reqType}\\s+"([^"]+)"\\s*\\{$`);
        const pattern3 = new RegExp(`^${reqType}\\s+'([^']+)'\\s*\\{$`);

        const match1 = line.match(pattern1);
        const match2 = line.match(pattern2);
        const match3 = line.match(pattern3);

        if (match1 || match2 || match3) {
          inBlock = true;
          blockType = reqType;

          // Extract ID from whichever pattern matched
          if (match1) blockId = match1[1].trim();
          else if (match2) blockId = match2[1].trim();
          else if (match3) blockId = match3[1].trim();

          blockData = {
            id: blockId,
            requirementType: reqType,
            elementType: reqType === "element" ? "element" : "requirement",
          };
          break;
        }
      }

      if (inBlock && line === "}") {
        if (blockType === "element") {
          elements.set(blockId, blockData);
        } else {
          requirements.set(blockId, blockData);
        }
        inBlock = false;
        blockType = null;
        blockId = null;
        blockData = {};
        continue;
      }

      // Parse block content - UPDATED to handle quoted values
      if (inBlock) {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();

          // Remove surrounding quotes if present
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.substring(1, value.length - 1);
          }

          // Handle position data
          if (key === "position" && value.includes(",")) {
            const [x, y] = value.split(",").map(Number);
            blockData.position = { x, y };
          } else {
            blockData[key] = value;
          }
        }
      }
    }

    return { requirements, elements, relationships };
  }, []);

  const getEdgeStyle = (relationship) => {
    const baseStyle = {
      stroke: "#000000",
      strokeWidth: 1.5,
      strokeDasharray: "5,5",
    };

    // Apply the same dashed pattern to ALL relationship types
    return { ...baseStyle, strokeDasharray: "5,5" };
  };

  const buildMermaidLayout = useCallback(
    (requirements, elements, relationships) => {
      const nodes = [];
      const edges = [];

      const allNodes = new Map([...requirements, ...elements]);

      if (allNodes.size === 0) {
        return { nodes, edges };
      }

      // Build hierarchical tree structure
      const tree = {
        children: new Map(),
        parents: new Map(),
        nodeLevels: new Map(),
        nodeWidths: new Map(),
        nodeDepths: new Map(), // Track depth for better positioning
      };

      // Initialize all nodes
      allNodes.forEach((_, nodeId) => {
        tree.children.set(nodeId, []);
        tree.nodeWidths.set(nodeId, 1);
        tree.nodeDepths.set(nodeId, 0);
      });

      const HierarchicalRelationships = [
        "satisfies",
        "verifies",
        "copies",
        "traces",
        "contains",
        "derives",
        "refines",

        "extends",
        "includes",
        "partOf",
        "decomposes",
        "dependsOn",
        "relatedTo",
        "connectedTo",
        "associatesWith",
        "implements",
        "fulfills",
        "linkedTo",
        "categorizedAs",
        "groupedUnder",
        "subsumes",
        "generalizes",
        "specializes",
        "aggregates",
        "composes",
        "belongsTo",
        "ownedBy",
      ];

      relationships.forEach((rel) => {
        if (!tree.parents.has(rel.to)) {
          const children = tree.children.get(rel.from) || [];
          children.push({ id: rel.to, relationship: rel.relationship });
          tree.children.set(rel.from, children);
          tree.parents.set(rel.to, rel.from);
        } else {
          console.log(
            "Skipped - already has parent:",
            rel.to,
            "has parent",
            tree.parents.get(rel.to)
          );
        }
      });

      // Calculate depths for all nodes
      const calculateDepth = (nodeId) => {
        if (tree.nodeDepths.get(nodeId) > 0) {
          return tree.nodeDepths.get(nodeId);
        }

        const parent = tree.parents.get(nodeId);
        if (parent) {
          const depth = calculateDepth(parent) + 1;
          tree.nodeDepths.set(nodeId, depth);
          return depth;
        }

        tree.nodeDepths.set(nodeId, 0);
        return 0;
      };

      // Calculate depths for all nodes
      allNodes.forEach((_, nodeId) => {
        calculateDepth(nodeId);
      });

      // Find root nodes (nodes with no parents)
      const rootNodes = Array.from(allNodes.keys()).filter(
        (nodeId) => !tree.parents.has(nodeId)
      );

      // Group nodes by depth for better organization
      const nodesByDepth = new Map();
      allNodes.forEach((_, nodeId) => {
        const depth = tree.nodeDepths.get(nodeId);
        if (!nodesByDepth.has(depth)) {
          nodesByDepth.set(depth, []);
        }
        nodesByDepth.get(depth).push(nodeId);
      });

      // Calculate subtree widths using DFS
      const calculateSubtreeWidth = (nodeId) => {
        const children = tree.children.get(nodeId) || [];
        if (children.length === 0) {
          return 1;
        }

        let totalWidth = 0;
        children.forEach((child) => {
          totalWidth += calculateSubtreeWidth(child.id);
        });

        tree.nodeWidths.set(nodeId, Math.max(1, totalWidth));
        return tree.nodeWidths.get(nodeId);
      };

      // Calculate widths for all root subtrees
      rootNodes.forEach((rootNode) => {
        calculateSubtreeWidth(rootNode);
      });

      // Position nodes using improved algorithm that handles disconnected trees
      const nodePositions = new Map();
      const verticalSpacing = 200;
      const horizontalSpacing = 280;
      const startX = 90;
      const startY = 90;

      // Position hierarchical trees first
      const positionHierarchicalTree = (nodeId, level, xOffset) => {
        const children = tree.children.get(nodeId) || [];
        const nodeWidth = tree.nodeWidths.get(nodeId);

        // Calculate this node's position
        const x = startX + xOffset + (nodeWidth * horizontalSpacing) / 2;
        const y = startY + level * verticalSpacing;

        nodePositions.set(nodeId, { x, y });
        tree.nodeLevels.set(nodeId, level);

        // Position children recursively
        let childXOffset = xOffset;
        children.forEach((child) => {
          const childWidth = tree.nodeWidths.get(child.id);
          positionHierarchicalTree(child.id, level + 1, childXOffset);
          childXOffset += childWidth * horizontalSpacing;
        });

        return xOffset + nodeWidth * horizontalSpacing;
      };

      // Position disconnected elements (no relationships)
      const positionDisconnectedElements = () => {
        const maxDepth = Math.max(...Array.from(nodesByDepth.keys()));

        nodesByDepth.forEach((nodeIds, depth) => {
          // Skip if already positioned (part of hierarchical tree)
          const unpositionedNodes = nodeIds.filter(
            (id) => !nodePositions.has(id)
          );

          if (unpositionedNodes.length > 0) {
            // Position these as a separate tree at this depth level
            const elementsPerRow = Math.ceil(
              Math.sqrt(unpositionedNodes.length)
            );
            const elementSpacing = 300;

            unpositionedNodes.forEach((nodeId, index) => {
              const row = Math.floor(index / elementsPerRow);
              const col = index % elementsPerRow;

              const x = startX + 1200 + col * elementSpacing; // Offset to the right
              const y =
                startY + depth * verticalSpacing + row * verticalSpacing;

              nodePositions.set(nodeId, { x, y });
              tree.nodeLevels.set(nodeId, depth);
            });
          }
        });
      };

      // Position all hierarchical trees first
      let rootXOffset = 0;
      rootNodes.forEach((rootNode) => {
        const rootWidth = tree.nodeWidths.get(rootNode);
        rootXOffset = positionHierarchicalTree(rootNode, 0, rootXOffset);
      });

      // Position any disconnected elements
      positionDisconnectedElements();

      // Ensure all nodes have positions
      allNodes.forEach((_, nodeId) => {
        if (!nodePositions.has(nodeId)) {
          // Fallback positioning for any missed nodes
          const depth = tree.nodeDepths.get(nodeId);
          const x = startX + Math.random() * 800; // Random positioning as last resort
          const y = startY + depth * verticalSpacing;
          nodePositions.set(nodeId, { x, y });
          tree.nodeLevels.set(nodeId, depth);
        }
      });

      // Center the main hierarchical trees
      const hierarchicalNodes = Array.from(nodePositions.entries()).filter(
        ([nodeId]) =>
          rootNodes.some((root) => {
            // Check if this node is part of a hierarchical tree
            let current = nodeId;
            while (tree.parents.has(current)) {
              current = tree.parents.get(current);
            }
            return rootNodes.includes(current);
          })
      );

      if (hierarchicalNodes.length > 0) {
        const hierarchicalPositions = hierarchicalNodes.map(([_, pos]) => pos);
        const minX = Math.min(...hierarchicalPositions.map((pos) => pos.x));
        const maxX = Math.max(...hierarchicalPositions.map((pos) => pos.x));
        const centerX = (minX + maxX) / 2;
        const viewportCenterX = 800;

        const xShift = viewportCenterX - centerX;

        // Apply centering shift only to hierarchical nodes
        hierarchicalNodes.forEach(([nodeId, position]) => {
          nodePositions.set(nodeId, {
            ...position,
            x: position.x + xShift,
          });
        });
      }

      // Create nodes
      allNodes.forEach((data, id) => {
        let position;

        // Use saved position if available
        if (data.position) {
          position = data.position;
        } else {
          // Use calculated position
          position = nodePositions.get(id) || { x: startX, y: startY };
        }

        nodes.push({
          id,
          type: "requirement",
          position,
          data,
          style: {
            width: 220,
            height: 120,
          },
          draggable: true,
          resizable: true,
        });
      });

      // Create edges for ALL relationships
      relationships.forEach((rel, index) => {
        const edgeStyle = getEdgeStyle(rel.relationship);

        const sourcePos = nodePositions.get(rel.from);
        const targetPos = nodePositions.get(rel.to);

        if (!sourcePos || !targetPos) return;

        // Determine handle positions based on vertical relationship
        const sourceLevel = tree.nodeLevels.get(rel.from) || 0;
        const targetLevel = tree.nodeLevels.get(rel.to) || 0;

        let sourceHandle = "bottom";
        let targetHandle = "top";
        let edgeType = "smoothstep";

        if (HierarchicalRelationships.includes(rel.relationship)) {
          edgeType = "default";

          // Adjust handles based on relative positions
          if (sourcePos.x < targetPos.x) {
            sourceHandle = "right";
            targetHandle = "left";
          } else if (sourcePos.x > targetPos.x) {
            sourceHandle = "left";
            targetHandle = "right";
          }
        }

        edges.push({
          id: `edge-${index}`,
          source: rel.from,
          target: rel.to,
          sourceHandle,
          targetHandle,
          type: edgeType,
          label: rel.relationship,
          labelStyle: {
            fontSize: 9,
            fontWeight: "600",
            fill: "#000000",
            fontFamily: "Arial, sans-serif",
          },
          markerStart: rel.bidirectional ? {
            type: MarkerType.ArrowClosed,
            color: "#000000",
            width: 16,
            height: 16,
          } : undefined,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#000000",
            width: 16,
            height: 16,
          },
          style: edgeStyle,
          data: {
            bidirectional: rel.bidirectional || false,
            relationship: rel.relationship,
            from: rel.from,
            to: rel.to,
          },
          labelBgStyle: { fill: "white", fillOpacity: 0.95 },
          labelBgPadding: [4, 3],
          labelBgBorderRadius: 2,
        });
      });

      return { nodes, edges };
    },
    []
  );

  // Convert to ReactFlow
  const convertRequirementToReactFlow = useCallback(
    (text) => {
      const { requirements, elements, relationships } =
        parseRequirementDiagram(text);
      return buildMermaidLayout(requirements, elements, relationships);
    },
    [parseRequirementDiagram, buildMermaidLayout]
  );
  const deleteEdge = useCallback(
    (edgeId) => {
      const currentCode = codeRef.current;
      const lines = currentCode.split("\n");
      const newLines = [];

      let relationshipIndex = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip diagram declaration and direction lines
        if (
          trimmed === "requirementDiagram" ||
          trimmed.startsWith("direction ")
        ) {
          newLines.push(line);
          continue;
        }

        // Check if this line is any kind of relationship
        const isRelationship =
          (trimmed.includes(" - ") && trimmed.includes(" -> ")) ||
          (trimmed.includes(" <- ") && trimmed.includes(" - "));

        if (isRelationship) {
          // If this is the relationship we want to delete (based on index)
          if (`edge-${relationshipIndex}` === edgeId) {
            console.log("Deleting relationship line:", line);
            relationshipIndex++;
            continue; // Skip this line (delete it)
          } else {
            newLines.push(line);
          }
          relationshipIndex++;
        } else {
          // Keep non-relationship lines
          newLines.push(line);
        }
      }

      const updatedCode = newLines.join("\n");
      setCode(updatedCode);

      setStatusMessage("Relationship deleted successfully");
      setTimeout(() => setStatusMessage(""), 3000);

      // Refresh the diagram
      setTimeout(() => {
        const { nodes: flowNodes, edges: flowEdges } =
          convertRequirementToReactFlow(updatedCode);
        setNodes(flowNodes);
        setEdges(flowEdges);
        setSelectedEdge(null);
      }, 100);
    },
    [setCode, convertRequirementToReactFlow, setNodes, setEdges]
  );
  const onNodeDragStop = useCallback(
    (event, node) => {
      console.log("Node dragged:", node.id, node.position);

      const updatedNodes = nodes.map((n) =>
        n.id === node.id ? { ...n, position: node.position } : n
      );

      // Update the nodes state immediately for visual feedback
      setNodes(updatedNodes);

      // Save positions to code
      saveNodePositionsToCode(updatedNodes);
    },
    [nodes, saveNodePositionsToCode, setNodes]
  );
  // const updateElement = useCallback(
  //   (elementId, newData, elementType) => {
  //     const currentCode = codeRef.current;
  //     console.log('=== UPDATE ELEMENT CALLED ===');
  //     console.log('elementId:', elementId);
  //     console.log('elementType:', elementType);
  //     console.log('newData:', newData);

  //     // Split code into lines
  //     const lines = currentCode.split('\n');
  //     const newLines = [];
  //     let inTargetBlock = false;
  //     let currentBlockId = null;
  //     let braceCount = 0;
  //     let blockStartIndex = -1;
  //     let foundTargetBlock = false;

  //     // First pass: find the block by scanning for the ID property inside blocks
  //     for (let i = 0; i < lines.length; i++) {
  //       const line = lines[i];
  //       const trimmed = line.trim();

  //       // Look for block starts (any requirement type OR element)
  //       const isBlockStart = trimmed.endsWith('{') &&
  //         (trimmed.includes('requirement') || trimmed.includes('element') ||
  //          trimmed.includes('Constraint') || trimmed.includes('Requirement') ||
  //          trimmed.startsWith('element '));

  //       if (isBlockStart && !inTargetBlock) {
  //         inTargetBlock = true;
  //         braceCount = 1;
  //         blockStartIndex = i;
  //         currentBlockId = null;
  //         newLines.push(line);
  //         continue;
  //       }

  //       if (inTargetBlock) {
  //         // Count braces
  //         if (trimmed === '{') braceCount++;
  //         if (trimmed === '}') braceCount--;

  //         // Check if this line contains the ID we're looking for
  //         if (trimmed.startsWith('id:') && currentBlockId === null) {
  //           const idValue = trimmed.substring(3).trim().replace(/['"]/g, '');
  //           if (idValue === elementId) {
  //             currentBlockId = elementId;
  //             console.log('FOUND TARGET BLOCK with ID:', elementId, 'at line', i);
  //           }
  //         }

  //         // If we've reached the end of a block
  //         if (braceCount === 0 && trimmed === '}') {
  //           if (currentBlockId === elementId) {
  //             console.log('UPDATING BLOCK for ID:', elementId);
  //             foundTargetBlock = true;

  //             // This is our target block - rebuild it with new data
  //             const beforeBlock = lines.slice(0, blockStartIndex);
  //             const afterBlock = lines.slice(i + 1);

  //             // Get the original block declaration
  //             const blockDeclaration = lines[blockStartIndex];

  //             // Build new properties, keeping ID and position
  //             const newProperties = [`    id: ${elementId}`]; // Keep the ID

  //             // Add all new properties
  //             Object.keys(newData).forEach(key => {
  //               if (newData[key] !== undefined && newData[key] !== null && newData[key] !== '') {
  //                 newProperties.push(`    ${key}: ${newData[key]}`);
  //               }
  //             });

  //             // Find position and other properties in original block that we want to keep
  //             const originalBlockLines = lines.slice(blockStartIndex, i + 1);
  //             const propertiesToKeep = ['position', 'type', 'docRef']; // Properties we don't want to overwrite
  //             propertiesToKeep.forEach(prop => {
  //               const propLine = originalBlockLines.find(line =>
  //                 line.trim().startsWith(prop + ':')
  //               );
  //               if (propLine && !newData[prop]) { // Only keep if not in newData
  //                 newProperties.push(propLine);
  //               }
  //             });

  //             // Build the new block
  //             const newBlock = [
  //               blockDeclaration,
  //               ...newProperties,
  //               '}'
  //             ];

  //             // Combine everything
  //             const updatedCode = [
  //               ...beforeBlock,
  //               ...newBlock,
  //               ...afterBlock
  //             ].join('\n');

  //             console.log('=== SUCCESSFULLY UPDATED CODE ===');

  //             setCode(updatedCode);

  //             // Update visual nodes
  //             setNodes(prevNodes =>
  //               prevNodes.map(node =>
  //                 node.id === elementId
  //                   ? { ...node, data: { ...node.data, ...newData } }
  //                   : node
  //               )
  //             );

  //             setStatusMessage(`Updated ${elementType} "${elementId}"`);
  //             setTimeout(() => setStatusMessage(''), 3000);

  //             // Refresh diagram
  //             setTimeout(() => {
  //               const { nodes: flowNodes, edges: flowEdges } = convertRequirementToReactFlow(updatedCode);
  //               setNodes(flowNodes);
  //               setEdges(flowEdges);
  //             }, 200);

  //             return; // Exit early since we found and updated the block
  //           } else {
  //             // Not our target block, just copy it as-is
  //             inTargetBlock = false;
  //             currentBlockId = null;
  //             newLines.push(line);
  //           }
  //         } else {
  //           newLines.push(line);
  //         }
  //       } else {
  //         newLines.push(line);
  //       }
  //     }

  //     // If we get here, the block wasn't found
  //     if (!foundTargetBlock) {
  //       console.error('BLOCK NOT FOUND FOR ELEMENT!');
  //       console.log('Searching for ID:', elementId, 'Type:', elementType);
  //       console.log('=== SCANNING ALL BLOCKS ===');

  //       // Comprehensive scan for debugging
  //       let inAnyBlock = false;
  //       let currentBlockType = null;
  //       let foundIds = [];

  //       for (let i = 0; i < lines.length; i++) {
  //         const line = lines[i];
  //         const trimmed = line.trim();

  //         // Check for block start
  //         if (trimmed.endsWith('{') &&
  //             (trimmed.includes('requirement') || trimmed.includes('element') ||
  //              trimmed.includes('Constraint') || trimmed.includes('Requirement'))) {
  //           inAnyBlock = true;
  //           currentBlockType = trimmed.split(' ')[0];
  //         }

  //         // Check for ID property
  //         if (inAnyBlock && trimmed.startsWith('id:')) {
  //           const idValue = trimmed.substring(3).trim().replace(/['"]/g, '');
  //           foundIds.push({id: idValue, type: currentBlockType, line: i});
  //           console.log(`Found: ${currentBlockType} with id "${idValue}" at line ${i}`);
  //         }

  //         // Check for block end
  //         if (trimmed === '}') {
  //           inAnyBlock = false;
  //           currentBlockType = null;
  //         }
  //       }

  //       console.log('All found IDs:', foundIds);

  //       // Check if the element ID exists but with different type
  //       const matchingId = foundIds.find(item => item.id === elementId);
  //       if (matchingId) {
  //         console.log(`ID "${elementId}" exists as type "${matchingId.type}" but we're looking for "${elementType}"`);
  //       }

  //       setStatusMessage(`Error: Could not find ${elementType} with ID "${elementId}"`);
  //       setTimeout(() => setStatusMessage(''), 3000);
  //     }
  //   },
  //   [setCode, setNodes, setEdges, convertRequirementToReactFlow]
  // );
  const updateElement = useCallback(
    (elementId, newData, elementType) => {
      const currentCode = codeRef.current;
      console.log("=== UPDATE ELEMENT CALLED ===");
      console.log("elementId:", elementId);
      console.log("elementType:", elementType);
      console.log("newData:", newData);

      // Split code into lines
      const lines = currentCode.split("\n");

      if (elementType === "element") {
        console.log("=== PROCESSING AS ELEMENT ===");
        updateElementBlock(lines, elementId, newData);
      } else {
        console.log("=== PROCESSING AS REQUIREMENT ===");
        updateRequirementBlock(lines, elementId, newData, elementType);
      }
    },
    [setCode, setNodes, setEdges, convertRequirementToReactFlow]
  );

  // Element update function
  // const updateElementBlock = useCallback((lines, elementId, newData) => {
  //   console.log('Searching for ELEMENT with ID:', elementId);

  //   const newLines = [];
  //   let inBlock = false;
  //   let currentBlockId = null;
  //   let blockStartIndex = -1;
  //   let blockLines = [];
  //   let found = false;

  //   for (let i = 0; i < lines.length; i++) {
  //     const line = lines[i];
  //     const trimmed = line.trim();

  //     // Look for ELEMENT block start - more flexible pattern
  //     const elementBlockPattern = /^element\s+(\w+)\s*\{$/;
  //     const elementMatch = trimmed.match(elementBlockPattern);

  //     if (elementMatch) {
  //       if (inBlock) {
  //         // Already in a block, just continue
  //         newLines.push(line);
  //         continue;
  //       }

  //       inBlock = true;
  //       blockStartIndex = i;
  //       blockLines = [line];
  //       currentBlockId = elementMatch[1]; // Get ID from the declaration
  //       console.log('Found element block with ID:', currentBlockId);

  //       // Check if this is our target block
  //       if (currentBlockId === elementId) {
  //         console.log('FOUND TARGET ELEMENT BLOCK - WILL UPDATE');
  //       }
  //       newLines.push(line);
  //       continue;
  //     }

  //     if (inBlock) {
  //       blockLines.push(line);

  //       // Also check for ID property inside the block (as fallback)
  //       if (trimmed.startsWith('id:')) {
  //         const idValue = trimmed.substring(3).trim().replace(/['"]/g, '');
  //         if (!currentBlockId) {
  //           currentBlockId = idValue;
  //           console.log('Found ID property in element block:', currentBlockId);
  //         }
  //       }

  //       // Check for block end
  //       if (trimmed === '}') {
  //         if (currentBlockId === elementId) {
  //           console.log('UPDATING ELEMENT BLOCK FOR:', elementId);
  //           found = true;

  //           // Remove the old block lines from newLines
  //           newLines.splice(blockStartIndex, newLines.length - blockStartIndex);

  //           // Build new element block
  //           const declaration = `element ${elementId} {`;
  //           const newBlock = [declaration];

  //           // Add properties in the correct order
  //           if (newData.text) {
  //             newBlock.push(`    text: ${newData.text}`);
  //           }

  //           if (newData.type) {
  //             newBlock.push(`    type: ${newData.type}`);
  //           } else {
  //             // Try to preserve existing type
  //             const existingType = blockLines.find(l => l.trim().startsWith('type:'));
  //             if (existingType) newBlock.push(existingType);
  //           }

  //           if (newData.docRef) {
  //             newBlock.push(`    docRef: ${newData.docRef}`);
  //           } else {
  //             const existingDocRef = blockLines.find(l => l.trim().startsWith('docRef:'));
  //             if (existingDocRef) newBlock.push(existingDocRef);
  //           }

  //           // Keep position from original block
  //           const existingPosition = blockLines.find(l => l.trim().startsWith('position:'));
  //           if (existingPosition) {
  //             newBlock.push(existingPosition);
  //           }

  //           newBlock.push('}');

  //           // Add the new block
  //           newLines.push(...newBlock);

  //           // Add remaining lines
  //           const remainingLines = lines.slice(i + 1);
  //           newLines.push(...remainingLines);

  //           const updatedCode = newLines.join('\n');
  //           setCode(updatedCode);

  //           // Update visual
  //           setNodes(prevNodes =>
  //             prevNodes.map(node =>
  //               node.id === elementId
  //                 ? { ...node, data: { ...node.data, ...newData } }
  //                 : node
  //             )
  //           );

  //           setStatusMessage(`Updated element "${elementId}"`);
  //           setTimeout(() => setStatusMessage(''), 3000);

  //           setTimeout(() => {
  //             const { nodes: flowNodes, edges: flowEdges } = convertRequirementToReactFlow(updatedCode);
  //             setNodes(flowNodes);
  //             setEdges(flowEdges);
  //           }, 200);

  //           return;
  //         } else {
  //           // Not our block, continue normally
  //           inBlock = false;
  //           currentBlockId = null;
  //           blockLines = [];
  //           newLines.push(line);
  //         }
  //       } else {
  //         newLines.push(line);
  //       }
  //     } else {
  //       newLines.push(line);
  //     }
  //   }

  //   if (!found) {
  //     console.error('ELEMENT NOT FOUND!');
  //     console.log('=== DEBUG: All element blocks ===');
  //     lines.forEach((line, i) => {
  //       const trimmed = line.trim();
  //       if (trimmed.startsWith('element ')) {
  //         console.log(`Element at line ${i}: ${trimmed}`);
  //         // Extract ID from element declaration
  //         const match = trimmed.match(/^element\s+(\w+)\s*\{$/);
  //         if (match) {
  //           console.log(`  - ID: ${match[1]}`);
  //         }
  //       }
  //     });
  //     setStatusMessage(`Error: Could not find element "${elementId}"`);
  //     setTimeout(() => setStatusMessage(''), 3000);
  //   }
  // }, [setCode, setNodes, setEdges, convertRequirementToReactFlow]);
  // Element update function
  const updateElementBlock = useCallback(
    (lines, elementId, newData) => {
      console.log("=== UPDATE ELEMENT BLOCK ===");
      console.log("Searching for ELEMENT with ID:", elementId);
      console.log("New data:", newData);

      const newLines = [];
      let inBlock = false;
      let currentBlockId = null;
      let blockStartIndex = -1;
      let blockLines = [];
      let found = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Look for ELEMENT block start - handle both quoted and unquoted IDs
        const elementBlockPattern1 = /^element\s+(\w+)\s*\{$/; // element CNN {
        const elementBlockPattern2 = /^element\s+"([^"]+)"\s*\{$/; // element "CNN" {
        const elementBlockPattern3 = /^element\s+'([^']+)'\s*\{$/; // element 'CNN' {

        const match1 = trimmed.match(elementBlockPattern1);
        const match2 = trimmed.match(elementBlockPattern2);
        const match3 = trimmed.match(elementBlockPattern3);

        if (match1 || match2 || match3) {
          if (inBlock) {
            // Already in a block, just continue
            newLines.push(line);
            continue;
          }

          inBlock = true;
          blockStartIndex = i;
          blockLines = [line];

          // Extract ID from whichever pattern matched
          if (match1) currentBlockId = match1[1].trim();
          else if (match2) currentBlockId = match2[1].trim();
          else if (match3) currentBlockId = match3[1].trim();

          console.log("Found element block with ID:", currentBlockId);

          // Check if this is our target block
          if (currentBlockId === elementId) {
            console.log("FOUND TARGET ELEMENT BLOCK - WILL UPDATE");
          }
          newLines.push(line);
          continue;
        }

        if (inBlock) {
          blockLines.push(line);

          // Also check for ID property inside the block (as fallback)
          if (trimmed.startsWith("id:")) {
            const idValue = trimmed.substring(3).trim().replace(/['"]/g, "");
            if (!currentBlockId) {
              currentBlockId = idValue;
              console.log(
                "Found ID property in element block:",
                currentBlockId
              );
            }
          }

          // Check for block end
          if (trimmed === "}") {
            if (currentBlockId === elementId) {
              console.log("UPDATING ELEMENT BLOCK FOR:", elementId);
              found = true;

              // Remove the old block lines from newLines
              newLines.splice(
                blockStartIndex,
                newLines.length - blockStartIndex
              );

              // Build new element block - preserve the original declaration format
              let declaration = blockLines[0];
              // Check if original declaration had quotes and preserve that format
              const hasQuotes =
                declaration.includes('"') || declaration.includes("'");
              if (hasQuotes) {
                declaration = `element "${elementId}" {`;
              } else {
                declaration = `element ${elementId} {`;
              }

              const newBlock = [declaration];

              // Add properties in the correct order
              if (newData.text) {
                newBlock.push(`    text: ${newData.text}`);
              } else {
                const existingText = blockLines.find((l) =>
                  l.trim().startsWith("text:")
                );
                if (existingText) newBlock.push(existingText);
              }

              if (newData.type) {
                newBlock.push(`    type: ${newData.type}`);
              } else {
                const existingType = blockLines.find((l) =>
                  l.trim().startsWith("type:")
                );
                if (existingType) newBlock.push(existingType);
              }

              if (newData.docRef) {
                newBlock.push(`    docRef: ${newData.docRef}`);
              } else {
                const existingDocRef = blockLines.find((l) =>
                  l.trim().startsWith("docRef:")
                );
                if (existingDocRef) newBlock.push(existingDocRef);
              }

              // Keep position from original block
              const existingPosition = blockLines.find((l) =>
                l.trim().startsWith("position:")
              );
              if (existingPosition) {
                newBlock.push(existingPosition);
              }

              newBlock.push("}");

              // Add the new block
              newLines.push(...newBlock);

              // Add remaining lines
              const remainingLines = lines.slice(i + 1);
              newLines.push(...remainingLines);

              const updatedCode = newLines.join("\n");
              setCode(updatedCode);

              // Update visual
              setNodes((prevNodes) =>
                prevNodes.map((node) =>
                  node.id === elementId
                    ? { ...node, data: { ...node.data, ...newData } }
                    : node
                )
              );

              setStatusMessage(`Updated element "${elementId}"`);
              setTimeout(() => setStatusMessage(""), 3000);

              setTimeout(() => {
                const { nodes: flowNodes, edges: flowEdges } =
                  convertRequirementToReactFlow(updatedCode);
                setNodes(flowNodes);
                setEdges(flowEdges);
              }, 200);

              return;
            } else {
              // Not our block, continue normally
              inBlock = false;
              currentBlockId = null;
              blockLines = [];
              newLines.push(line);
            }
          } else {
            newLines.push(line);
          }
        } else {
          newLines.push(line);
        }
      }

      if (!found) {
        console.error("ELEMENT NOT FOUND!");
        console.log("=== DEBUG: All element blocks ===");
        lines.forEach((line, i) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("element ")) {
            console.log(`Element at line ${i}: ${trimmed}`);
            // Extract ID from element declaration
            const match1 = trimmed.match(/^element\s+(\w+)\s*\{$/);
            const match2 = trimmed.match(/^element\s+"([^"]+)"\s*\{$/);
            const match3 = trimmed.match(/^element\s+'([^']+)'\s*\{$/);

            if (match1) console.log(`  - ID: ${match1[1]}`);
            else if (match2) console.log(`  - ID: ${match2[1]}`);
            else if (match3) console.log(`  - ID: ${match3[1]}`);
          }
        });
        console.log("Looking for ID:", elementId);
        setStatusMessage(`Error: Could not find element "${elementId}"`);
        setTimeout(() => setStatusMessage(""), 3000);
      }
    },
    [setCode, setNodes, setEdges, convertRequirementToReactFlow]
  );

  // const updateElementBlock = useCallback((lines, elementId, newData) => {
  //   console.log('Searching for ELEMENT with ID:', elementId);

  //   const newLines = [];
  //   let inBlock = false;
  //   let currentBlockId = null;
  //   let blockStartIndex = -1;
  //   let blockLines = [];
  //   let found = false;

  //   for (let i = 0; i < lines.length; i++) {
  //     const line = lines[i];
  //     const trimmed = line.trim();

  //     // Look for ELEMENT block start - more flexible pattern
  //     const elementBlockPattern = /^element\s+(\w+)\s*\{$/;
  //     const elementMatch = trimmed.match(elementBlockPattern);

  //     if (elementMatch) {
  //       if (inBlock) {
  //         // Already in a block, just continue
  //         newLines.push(line);
  //         continue;
  //       }

  //       inBlock = true;
  //       blockStartIndex = i;
  //       blockLines = [line];
  //       currentBlockId = elementMatch[1]; // Get ID from the declaration
  //       console.log('Found element block with ID:', currentBlockId);

  //       // Check if this is our target block
  //       if (currentBlockId === elementId) {
  //         console.log('FOUND TARGET ELEMENT BLOCK - WILL UPDATE');
  //       }
  //       newLines.push(line);
  //       continue;
  //     }

  //     if (inBlock) {
  //       blockLines.push(line);

  //       // Also check for ID property inside the block (as fallback)
  //       if (trimmed.startsWith('id:')) {
  //         const idValue = trimmed.substring(3).trim().replace(/['"]/g, '');
  //         if (!currentBlockId) {
  //           currentBlockId = idValue;
  //           console.log('Found ID property in element block:', currentBlockId);
  //         }
  //       }

  //       // Check for block end
  //       if (trimmed === '}') {
  //         if (currentBlockId === elementId) {
  //           console.log('UPDATING ELEMENT BLOCK FOR:', elementId);
  //           found = true;

  //           // Remove the old block lines from newLines
  //           newLines.splice(blockStartIndex, newLines.length - blockStartIndex);

  //           // Build new element block
  //           const declaration = `element ${elementId} {`;
  //           const newBlock = [declaration];

  //           // Add properties in the correct order
  //           if (newData.text) {
  //             newBlock.push(`    text: ${newData.text}`);
  //           }

  //           if (newData.type) {
  //             newBlock.push(`    type: ${newData.type}`);
  //           } else {
  //             // Try to preserve existing type
  //             const existingType = blockLines.find(l => l.trim().startsWith('type:'));
  //             if (existingType) newBlock.push(existingType);
  //           }

  //           if (newData.docRef) {
  //             newBlock.push(`    docRef: ${newData.docRef}`);
  //           } else {
  //             const existingDocRef = blockLines.find(l => l.trim().startsWith('docRef:'));
  //             if (existingDocRef) newBlock.push(existingDocRef);
  //           }

  //           // Keep position from original block
  //           const existingPosition = blockLines.find(l => l.trim().startsWith('position:'));
  //           if (existingPosition) {
  //             newBlock.push(existingPosition);
  //           }

  //           newBlock.push('}');

  //           // Add the new block
  //           newLines.push(...newBlock);

  //           // Add remaining lines
  //           const remainingLines = lines.slice(i + 1);
  //           newLines.push(...remainingLines);

  //           const updatedCode = newLines.join('\n');
  //           setCode(updatedCode);

  //           // Update visual
  //           setNodes(prevNodes =>
  //             prevNodes.map(node =>
  //               node.id === elementId
  //                 ? { ...node, data: { ...node.data, ...newData } }
  //                 : node
  //             )
  //           );

  //           setStatusMessage(`Updated element "${elementId}"`);
  //           setTimeout(() => setStatusMessage(''), 3000);

  //           setTimeout(() => {
  //             const { nodes: flowNodes, edges: flowEdges } = convertRequirementToReactFlow(updatedCode);
  //             setNodes(flowNodes);
  //             setEdges(flowEdges);
  //           }, 200);

  //           return;
  //         } else {
  //           // Not our block, continue normally
  //           inBlock = false;
  //           currentBlockId = null;
  //           blockLines = [];
  //           newLines.push(line);
  //         }
  //       } else {
  //         newLines.push(line);
  //       }
  //     } else {
  //       newLines.push(line);
  //     }
  //   }

  //   if (!found) {
  //     console.error('ELEMENT NOT FOUND!');
  //     console.log('=== DEBUG: All element blocks ===');
  //     lines.forEach((line, i) => {
  //       const trimmed = line.trim();
  //       if (trimmed.startsWith('element ')) {
  //         console.log(`Element at line ${i}: ${trimmed}`);
  //         // Extract ID from element declaration
  //         const match = trimmed.match(/^element\s+(\w+)\s*\{$/);
  //         if (match) {
  //           console.log(`  - ID: ${match[1]}`);
  //         }
  //       }
  //     });
  //     setStatusMessage(`Error: Could not find element "${elementId}"`);
  //     setTimeout(() => setStatusMessage(''), 3000);
  //   }
  // }, [setCode, setNodes, setEdges, convertRequirementToReactFlow]);

  // Requirement update function
  const updateRequirementBlock = useCallback(
    (lines, elementId, newData, elementType) => {
      console.log(
        "Searching for REQUIREMENT with ID:",
        elementId,
        "Type:",
        elementType
      );

      const newLines = [];
      let inBlock = false;
      let currentBlockId = null;
      let blockStartIndex = -1;
      let blockLines = [];
      let found = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Look for REQUIREMENT block start (not element)
        if (
          trimmed.endsWith("{") &&
          !trimmed.startsWith("element ") &&
          (trimmed.includes("requirement") ||
            trimmed.includes("Constraint") ||
            trimmed.includes("Requirement"))
        ) {
          if (inBlock) {
            newLines.push(line);
            continue;
          }

          inBlock = true;
          blockStartIndex = i;
          blockLines = [line];
          currentBlockId = null;
          newLines.push(line);
          continue;
        }

        if (inBlock) {
          blockLines.push(line);

          // Check for ID property
          if (trimmed.startsWith("id:")) {
            const idValue = trimmed.substring(3).trim().replace(/['"]/g, "");
            currentBlockId = idValue;
            console.log("Found ID in requirement block:", idValue);
          }

          // Check for block end
          if (trimmed === "}") {
            if (currentBlockId === elementId) {
              console.log("FOUND MATCHING REQUIREMENT BLOCK - UPDATING");
              found = true;

              // Remove the old block lines from newLines
              newLines.splice(
                blockStartIndex,
                newLines.length - blockStartIndex
              );

              // Build new requirement block
              const declaration = blockLines[0];
              const newBlock = [declaration];

              // Add ID
              newBlock.push(`    id: ${elementId}`);

              // Add all properties from newData
              Object.keys(newData).forEach((key) => {
                if (
                  newData[key] !== undefined &&
                  newData[key] !== null &&
                  newData[key] !== ""
                ) {
                  newBlock.push(`    ${key}: ${newData[key]}`);
                }
              });

              // Keep position
              const existingPosition = blockLines.find((l) =>
                l.trim().startsWith("position:")
              );
              if (existingPosition) newBlock.push(existingPosition);

              newBlock.push("}");

              // Add the new block
              newLines.push(...newBlock);

              // Add remaining lines
              const remainingLines = lines.slice(i + 1);
              newLines.push(...remainingLines);

              const updatedCode = newLines.join("\n");
              setCode(updatedCode);

              // Update visual
              setNodes((prevNodes) =>
                prevNodes.map((node) =>
                  node.id === elementId
                    ? { ...node, data: { ...node.data, ...newData } }
                    : node
                )
              );

              setStatusMessage(`Updated ${elementType} "${elementId}"`);
              setTimeout(() => setStatusMessage(""), 3000);

              setTimeout(() => {
                const { nodes: flowNodes, edges: flowEdges } =
                  convertRequirementToReactFlow(updatedCode);
                setNodes(flowNodes);
                setEdges(flowEdges);
              }, 200);

              return;
            } else {
              // Not our block, continue normally
              inBlock = false;
              currentBlockId = null;
              blockLines = [];
              newLines.push(line);
            }
          } else {
            newLines.push(line);
          }
        } else {
          newLines.push(line);
        }
      }

      if (!found) {
        console.error("REQUIREMENT NOT FOUND!");
        console.log("=== DEBUG: All requirement blocks ===");
        lines.forEach((line, i) => {
          const trimmed = line.trim();
          if (
            trimmed.endsWith("{") &&
            !trimmed.startsWith("element ") &&
            (trimmed.includes("requirement") ||
              trimmed.includes("Constraint") ||
              trimmed.includes("Requirement"))
          ) {
            console.log(`Requirement at line ${i}: ${trimmed}`);
          }
          if (line.includes(elementId)) {
            console.log(`Line ${i} contains elementId: ${line}`);
          }
        });
        setStatusMessage(`Error: Could not find ${elementType} "${elementId}"`);
        setTimeout(() => setStatusMessage(""), 3000);
      }
    },
    [setCode, setNodes, setEdges, convertRequirementToReactFlow]
  );
  const rebuildCodeWithoutDuplicates = useCallback(
    (code, elementId, elementType, newData) => {
      const lines = code.split("\n");
      const newLines = [];
      const seenElements = new Set();

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        const blockPattern = /^(\w+)\s+(\w+)\s*\{$/;
        const blockMatch = trimmed.match(blockPattern);

        if (blockMatch && blockMatch[2] === elementId) {
          if (seenElements.has(elementId)) {
            // Skip this duplicate block
            let skipUntil = i;
            while (
              skipUntil < lines.length &&
              lines[skipUntil].trim() !== "}"
            ) {
              skipUntil++;
            }
            i = skipUntil; // Skip to the end of this duplicate block
            continue;
          } else {
            seenElements.add(elementId);
            // Add the corrected block
            newLines.push(`${elementType} ${elementId} {`);

            // Add all properties from newData
            Object.keys(newData).forEach((key) => {
              if (
                newData[key] !== undefined &&
                newData[key] !== null &&
                newData[key] !== "" &&
                key !== "id" &&
                key !== "requirementType" &&
                key !== "elementType" &&
                key !== "position"
              ) {
                newLines.push(`    ${key}: ${newData[key]}`);
              }
            });

            // Skip to the end of the original block
            let j = i + 1;
            while (j < lines.length && lines[j].trim() !== "}") {
              // Look for position property to keep it
              if (lines[j].trim().startsWith("position:")) {
                newLines.push(lines[j]);
              }
              j++;
            }
            newLines.push("}");
            i = j; // Skip to the end of the block
            continue;
          }
        }

        // Keep lines that aren't part of duplicate blocks
        if (!seenElements.has(elementId) || !blockMatch) {
          newLines.push(line);
        }
      }

      return newLines.join("\n");
    },
    []
  );

  // Add this helper function to remove duplicate blocks
  const removeDuplicateBlocks = useCallback((code, elementType, elementId) => {
    const lines = code.split("\n");
    const newLines = [];
    let inBlock = false;
    let blockFound = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      const isBlockStart =
        trimmed === `${elementType} ${elementId} {` ||
        (trimmed.startsWith(`${elementType} ${elementId} `) &&
          trimmed.endsWith("{"));

      if (isBlockStart) {
        if (blockFound) {
          // Skip this duplicate block
          inBlock = true;
          continue;
        } else {
          blockFound = true;
          inBlock = true;
          newLines.push(line);
        }
      } else if (inBlock) {
        if (trimmed === "}") {
          inBlock = false;
          if (blockFound) {
            newLines.push(line);
          }
        } else if (blockFound) {
          newLines.push(line);
        }
      } else {
        newLines.push(line);
      }
    }

    return newLines.join("\n");
  }, []);
  // const deleteElement = useCallback(
  //   (elementId) => {
  //     const currentCode = codeRef.current;
  //     const lines = currentCode.split("\n");
  //     const newLines = [];
  //     let skipBlock = false;

  //     for (let i = 0; i < lines.length; i++) {
  //       const line = lines[i];
  //       const trimmed = line.trim();

  //       const requirementTypes = [
  //         // General
  //         "requirement",
  //         "businessRequirement",
  //         "userRequirement",
  //         "systemRequirement",

  //         // Software Engineering
  //         "functionalRequirement",
  //         "nonFunctionalRequirement",
  //         "performanceRequirement",
  //         "securityRequirement",
  //         "usabilityRequirement",
  //         "reliabilityRequirement",
  //         "maintainabilityRequirement",
  //         "scalabilityRequirement",
  //         "availabilityRequirement",
  //         "complianceRequirement",
  //         "regulatoryRequirement",
  //         "safetyRequirement",
  //         "privacyRequirement",
  //         "dataRequirement",
  //         "interfaceRequirement",
  //         "integrationRequirement",
  //         "interoperabilityRequirement",

  //         // Systems / Engineering
  //         "physicalRequirement",
  //         "environmentalRequirement",
  //         "operationalRequirement",
  //         "technicalRequirement",
  //         "architecturalRequirement",
  //         "designConstraint",
  //         "processRequirement",
  //         "qualityRequirement",
  //         "verificationRequirement",
  //         "validationRequirement",
  //         "supportabilityRequirement",

  //         // Specialized Domains
  //         "hardwareRequirement",
  //         "softwareRequirement",
  //         "networkRequirement",
  //         "communicationRequirement",
  //         "testingRequirement",
  //         "documentationRequirement",
  //         "trainingRequirement",
  //         "sustainabilityRequirement",
  //         "legalRequirement",
  //         "ethicalRequirement",
  //         "marketRequirement",
  //         "customerRequirement",
  //         "stakeholderRequirement",

  //         // Project / Management
  //         "projectRequirement",
  //         "budgetRequirement",
  //         "scheduleRequirement",
  //         "resourceRequirement",
  //         "riskRequirement",
  //         "constraint",
  //         "assumption",

  //         // Miscellaneous / Placeholder
  //         "element",
  //         "newRequirementType",
  //         "anotherRequirementType",
  //         "yetAnotherRequirementType",
  //       ];

  //       let isTargetBlock = false;
  //       for (const reqType of requirementTypes) {
  //         if (trimmed.startsWith(`${reqType} ${elementId} {`)) {
  //           isTargetBlock = true;
  //           break;
  //         }
  //       }

  //       if (isTargetBlock) {
  //         skipBlock = true;
  //         continue;
  //       }

  //       if (skipBlock) {
  //         if (trimmed === "}") {
  //           skipBlock = false;
  //         }
  //         continue;
  //       }

  //       if (
  //         !trimmed.includes(`${elementId} -`) &&
  //         !trimmed.includes(`-> ${elementId}`) &&
  //         !trimmed.includes(`${elementId} <-`)
  //       ) {
  //         newLines.push(line);
  //       }
  //     }

  //     const updatedCode = newLines.join("\n");
  //     setCode(updatedCode);

  //     // NEW: Show status message
  //     setStatusMessage(`Element "${elementId}" deleted successfully`);
  //     setTimeout(() => setStatusMessage(""), 3000);

  //     setTimeout(() => {
  //       const { nodes: flowNodes, edges: flowEdges } =
  //         convertRequirementToReactFlow(updatedCode);
  //       setNodes(flowNodes);
  //       setEdges(flowEdges);
  //       setSelectedElement(null);
  //       setShowEditPanel(false);
  //     }, 100);
  //   },
  //   [setCode, setNodes, setEdges, convertRequirementToReactFlow]
  // );
  // const deleteElement = useCallback(
  //   (elementId) => {
  //     const currentCode = codeRef.current;
  //     const lines = currentCode.split('\n');
  //     const newLines = [];
  //     let skipBlock = false;
  //     let inBlock = false;
  //     let braceCount = 0;
  
  //     console.log('=== DELETING ELEMENT ===', elementId);
  
  //     for (let i = 0; i < lines.length; i++) {
  //       const line = lines[i];
  //       const trimmed = line.trim();
  
  //       // Skip diagram declaration and direction lines but keep them
  //       if (trimmed === 'requirementDiagram' || trimmed.startsWith('direction ')) {
  //         newLines.push(line);
  //         continue;
  //       }
  
  //       // Check if we're not currently skipping a block and this line starts a new block
  //       if (!skipBlock && !inBlock && trimmed.endsWith('{') && !trimmed.includes('->') && !trimmed.includes('<-')) {
  //         // This is a potential block start - any word followed by ID and {
  //         // Handle multiple patterns:
  //         // 1. type id {
  //         // 2. type "id" {
  //         // 3. type 'id' {
  //         const blockPattern = /^(\w+)\s+([\w"'][\w\s-]*["']?)\s*\{$/;
  //         const blockMatch = trimmed.match(blockPattern);
  
  //         if (blockMatch) {
  //           const [, blockType, blockId] = blockMatch;
  //           // Remove quotes from ID if present and clean it
  //           const cleanBlockId = blockId.replace(/['"]/g, '').trim();
            
  //           if (cleanBlockId === elementId) {
  //             console.log(`Found target block to delete: ${blockType} ${cleanBlockId}`);
  //             skipBlock = true;
  //             inBlock = true;
  //             braceCount = 1;
  //             continue; // Skip the block declaration line
  //           }
  //         }
  //       }
  
  //       if (skipBlock && inBlock) {
  //         // Count braces to handle nested structures (though unlikely in requirement diagrams)
  //         if (trimmed.includes('{')) braceCount++;
  //         if (trimmed.includes('}')) braceCount--;
          
  //         // Skip all lines until we find the matching closing brace
  //         if (braceCount === 0 && trimmed === '}') {
  //           skipBlock = false;
  //           inBlock = false;
  //         }
  //         continue;
  //       }
  
  //       // Also remove relationships that involve this element
  //       if (!skipBlock) {
  //         const isRelationshipWithElement = 
  //           (trimmed.includes(` ${elementId} - `) && trimmed.includes(' -> ')) ||
  //           (trimmed.includes(' - ') && trimmed.includes(` -> ${elementId}`)) ||
  //           (trimmed.includes(` ${elementId} <- `) && trimmed.includes(' - ')) ||
  //           (trimmed.includes(' <- ') && trimmed.includes(` - ${elementId}`));
          
  //         if (!isRelationshipWithElement) {
  //           newLines.push(line);
  //         } else {
  //           console.log('Skipping relationship line:', line);
  //         }
  //       }
  //     }
  
  //     const updatedCode = newLines.join('\n');
  //     console.log('Updated code after deletion:', updatedCode);
  //     setCode(updatedCode);
  
  //     setStatusMessage(`"${elementId}" deleted successfully`);
  //     setTimeout(() => setStatusMessage(''), 3000);
  
  //     // Refresh the diagram
  //     setTimeout(() => {
  //       const { nodes: flowNodes, edges: flowEdges } = convertRequirementToReactFlow(updatedCode);
  //       setNodes(flowNodes);
  //       setEdges(flowEdges);
  //       setSelectedElement(null);
  //       setSelectedEdge(null);
  //       setShowEditPanel(false);
  //     }, 100);
  //   },
  //   [setCode, setNodes, setEdges, convertRequirementToReactFlow]
  // );
  const deleteElement = useCallback(
    (elementId) => {
      const currentCode = codeRef.current;
      const lines = currentCode.split('\n');
      const newLines = [];
      let inBlockToDelete = false;
      let braceCount = 0;
      let foundBlock = false;
  
      console.log('=== DELETING ELEMENT ===', elementId);
  
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
  
        // Skip diagram declaration and direction lines but keep them
        if (trimmed === 'requirementDiagram' || trimmed.startsWith('direction ')) {
          newLines.push(line);
          continue;
        }
  
        // If we're in the block to delete, skip all lines until the closing brace
        if (inBlockToDelete) {
          if (trimmed === '{') braceCount++;
          if (trimmed === '}') {
            braceCount--;
            if (braceCount === 0) {
              inBlockToDelete = false;
              console.log('✓ Finished deleting block');
            }
          }
          continue;
        }
  
        // Check for ANY block start - generic pattern that matches any requirement type
        if (trimmed.endsWith('{') && !trimmed.includes('->') && !trimmed.includes('<-')) {
          // Extract the part before the opening brace
          const beforeBrace = trimmed.slice(0, -1).trim();
          
          // Split by spaces - first word is the block type, rest is the ID
          const parts = beforeBrace.split(/\s+/);
          
          if (parts.length >= 2) {
            const blockType = parts[0];
            // Join the remaining parts as the ID (handles IDs with spaces when quoted)
            let potentialId = parts.slice(1).join(' ');
            
            // Remove surrounding quotes if present
            potentialId = potentialId.replace(/^['"](.*)['"]$/, '$1').trim();
            
            console.log(`Checking block: "${potentialId}" vs "${elementId}"`);
  
            if (potentialId === elementId) {
              console.log(`✓ FOUND TARGET BLOCK: ${blockType} ${potentialId}`);
              foundBlock = true;
              inBlockToDelete = true;
              braceCount = 1;
              continue; // Skip this line (the block declaration)
            }
          }
        }
  
        // Also check for ID property inside blocks as a fallback
        if (!inBlockToDelete && trimmed.startsWith('id:')) {
          const idValue = trimmed.substring(3).trim().replace(/['"]/g, '');
          if (idValue === elementId) {
            console.log(`✓ FOUND TARGET BLOCK by ID property: ${elementId}`);
            foundBlock = true;
            inBlockToDelete = true;
            braceCount = 1;
            // We need to include this line and everything until the closing brace
            // But since we're already inside the block, we need a different approach
            // For now, let's use the main approach above
          }
        }
  
        // Check for relationships involving this element
        const isRelationshipWithElement = 
          (trimmed.includes(` ${elementId} - `) && trimmed.includes(' -> ')) ||
          (trimmed.includes(' - ') && trimmed.includes(` -> ${elementId}`)) ||
          (trimmed.includes(` ${elementId} <- `) && trimmed.includes(' - ')) ||
          (trimmed.includes(' <- ') && trimmed.includes(` - ${elementId}`));
  
        if (!isRelationshipWithElement) {
          newLines.push(line);
        } else {
          console.log('Skipping relationship line:', line);
        }
      }
  
      const updatedCode = newLines.join('\n');
      console.log('Updated code after deletion:', updatedCode);
      setCode(updatedCode);
  
      if (foundBlock) {
        setStatusMessage(`"${elementId}" deleted successfully`);
      } else {
        setStatusMessage(`Error: Could not find "${elementId}" to delete`);
        console.log('=== BLOCK NOT FOUND ===');
        console.log('Looking for:', elementId);
      }
      setTimeout(() => setStatusMessage(''), 3000);
  
      // Refresh the diagram
      setTimeout(() => {
        const { nodes: flowNodes, edges: flowEdges } = convertRequirementToReactFlow(updatedCode);
        setNodes(flowNodes);
        setEdges(flowEdges);
        setSelectedElement(null);
        setSelectedEdge(null);
        setShowEditPanel(false);
      }, 100);
    },
    [setCode, setNodes, setEdges, convertRequirementToReactFlow]
  );
  const handleDelete = useCallback(() => {
    if (selectedElement) {
      // Delete node (element or requirement)
      deleteElement(selectedElement.data.id);
    } else if (selectedEdge) {
      // Delete edge (relationship)
      deleteEdge(selectedEdge.id);
    }
  }, [selectedElement, selectedEdge, deleteElement, deleteEdge]);
  const addElement = useCallback(
    (elementType, elementId, initialData = {}) => {
      const currentCode = codeRef.current;

      // Calculate a reasonable default position
      const lastNode = nodes[nodes.length - 1];
      const defaultX = lastNode ? lastNode.position.x + 300 : 100;
      const defaultY = lastNode ? lastNode.position.y + 200 : 100;

      const newBlock = [
        `${elementType} ${elementId} {`,
        ...Object.entries(initialData).map(
          ([key, value]) => `    ${key}: ${value}`
        ),
        `    position: "${defaultX},${defaultY}"`, // Add default position
        "}",
      ].join("\n");

      const updatedCode = currentCode + "\n" + newBlock;
      setCode(updatedCode);

      // NEW: Show status message
      setStatusMessage(`New ${elementType} "${elementId}" added successfully`);
      setTimeout(() => setStatusMessage(""), 3000);
    },
    [setCode, nodes]
  );

  const handleEditClick = useCallback(() => {
    if (selectedElement) {
      setShowEditPanel(true);
    }
  }, [selectedElement]);

  const handleSaveEdit = useCallback(
    (elementId, formData, elementType) => {
      const cleanedData = {};
      Object.keys(formData).forEach((key) => {
        if (
          formData[key] !== undefined &&
          formData[key] !== null &&
          formData[key] !== ""
        ) {
          cleanedData[key] = formData[key];
        }
      });

      console.log("Cleaned data for update:", cleanedData);

      if (Object.keys(cleanedData).length === 0) {
        console.warn("No data to save!");
        setStatusMessage("No changes to save");
        setTimeout(() => setStatusMessage(""), 3000);
        return;
      }

      updateElement(elementId, cleanedData, elementType);
      setShowEditPanel(false);
    },
    [updateElement]
  );
  const handleRealTimeUpdate = useCallback(
    (elementId, formData, elementType) => {
      console.log("Real-time update:", { elementId, formData });

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === elementId) {
            const updatedData = {
              ...node.data,
              ...formData,
            };
            console.log("Updating node visually:", updatedData);
            return {
              ...node,
              data: updatedData,
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );
  // const handleRealTimeUpdate = useCallback(
  //   (elementId, formData, elementType) => {
  //     setNodes((nds) =>
  //       nds.map((node) => {
  //         if (node.id === elementId) {
  //           return {
  //             ...node,
  //             data: { ...node.data, ...formData },
  //           };
  //         }
  //         return node;
  //       })
  //     );
  //   },
  //   [setNodes]
  // );

  // Add this custom connection line component
  const CustomConnectionLine = ({
    fromX,
    fromY,
    toX,
    toY,
    connectionLineStyle,
  }) => {
    return (
      <g>
        <path
          fill="none"
          stroke="#000000"
          strokeWidth={1.5}
          d={`M${fromX},${fromY} L${toX},${toY}`}
          style={connectionLineStyle}
        />
        <circle
          cx={toX}
          cy={toY}
          fill="#000000"
          r={3}
          stroke="#ffffff"
          strokeWidth={1}
        />

        {/* Show the relationship label during connection */}
        {connectionLabel && (
          <text
            x={(fromX + toX) / 2}
            y={(fromY + toY) / 2 - 10}
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill="#000000"
            style={{ pointerEvents: "none" }}
          >
            {connectionLabel}
          </text>
        )}
      </g>
    );
  };

  const updateRelationship = useCallback(
    (edgeId, newRelationship) => {
      const currentCode = codeRef.current;
      const lines = currentCode.split("\n");
      const newLines = [];

      let relationshipIndex = 0;
      let updated = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Check if this line is a relationship (forward: from - relationship -> to)
        if (trimmed.includes(" - ") && trimmed.includes(" -> ")) {
          const dashIndex = trimmed.indexOf(" - ");
          const arrowIndex = trimmed.indexOf(" -> ");

          if (dashIndex < arrowIndex) {
            // If this is the relationship we want to update (based on index)
            if (`edge-${relationshipIndex}` === edgeId) {
              const from = trimmed.substring(0, dashIndex).trim();
              const to = trimmed.substring(arrowIndex + 4).trim();

              // Replace with new relationship
              newLines.push(`${from} - ${newRelationship} -> ${to}`);
              updated = true;
            } else {
              newLines.push(line);
            }
            relationshipIndex++;
            continue;
          }
        }

        // Check if this line is a reverse relationship (to <- relationship - from)
        if (trimmed.includes(" <- ") && trimmed.includes(" - ")) {
          const arrowIndex = trimmed.indexOf(" <- ");
          const dashIndex = trimmed.indexOf(" - ", arrowIndex);

          if (arrowIndex < dashIndex) {
            // If this is the relationship we want to update (based on index)
            if (`edge-${relationshipIndex}` === edgeId) {
              const to = trimmed.substring(0, arrowIndex).trim();
              const from = trimmed.substring(dashIndex + 3).trim();

              // Replace with new relationship (keeping the reverse format)
              newLines.push(`${to} <- ${newRelationship} - ${from}`);
              updated = true;
            } else {
              newLines.push(line);
            }
            relationshipIndex++;
            continue;
          }
        }

        // If it's not a relationship line, keep it as is
        newLines.push(line);
      }

      const updatedCode = newLines.join("\n");
      setCode(updatedCode);

      // Refresh the diagram
      setTimeout(() => {
        const { nodes: flowNodes, edges: flowEdges } =
          convertRequirementToReactFlow(updatedCode);
        setNodes(flowNodes);
        setEdges(flowEdges);
        setEdgeEditPanel(false);
        setEditingEdge(null);
      }, 100);
    },
    [setCode, convertRequirementToReactFlow, setNodes, setEdges]
  );
  // const onEdgeClick = useCallback(
  //   (event, edge) => {
  //     event.stopPropagation();

  //     // For quick editing with prompt
  //     const newRelationship = prompt(
  //       "Enter relationship type:",
  //       edge.label || "contains"
  //     );
  //     if (newRelationship && newRelationship.trim() !== "") {
  //       updateRelationship(edge.id, newRelationship.trim());
  //       setStatusMessage(`Relationship updated to: ${newRelationship}`);
  //       setTimeout(() => setStatusMessage(""), 3000);
  //     }
  //   },
  //   [updateRelationship]
  // );

  // FIXED: onConnect method with proper selector handling
  const onConnect = useCallback(
    (params) => {
      const relationshipType = connectionLabel || "contains";

      const relationshipLine = `${params.source} - ${relationshipType} -> ${params.target}`;
      const updatedCode = codeRef.current + "\n" + relationshipLine;
      setCode(updatedCode);

      // NEW: Show status message
      setStatusMessage(
        `Connected ${params.source} to ${params.target} with "${relationshipType}" relationship`
      );
      setTimeout(() => setStatusMessage(""), 3000);

      // Reset connection label to default
      setConnectionLabel("contains");
    },
    [setCode, connectionLabel]
  );

  // const onSelectionChange = useCallback(({ nodes: selectedNodes }) => {
  //   setSelectedElement(selectedNodes.length > 0 ? selectedNodes[0] : null);
  // }, []);
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }) => {
      // Only select one thing at a time - prioritize nodes over edges
      if (selectedNodes.length > 0) {
        setSelectedElement(selectedNodes[0]);
        setSelectedEdge(null);
      } else if (selectedEdges.length > 0) {
        setSelectedEdge(selectedEdges[0]);
        setSelectedElement(null);
      } else {
        setSelectedElement(null);
        setSelectedEdge(null);
      }
    },
    []
  );
  const onPaneClick = useCallback(() => {
    setSelectedElement(null);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
    setSelectedElement(null);
  }, []);

  // Initialize diagram with better timing
  useEffect(() => {
    if (code && typeof window !== "undefined") {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const { nodes: flowNodes, edges: flowEdges } =
          convertRequirementToReactFlow(code);
        setNodes(flowNodes);
        setEdges(flowEdges);
        setSvg(null);
      }, 50);
    }
  }, [code, convertRequirementToReactFlow, setNodes, setEdges, setSvg]);

  return (
    <Box
      ref={chartRef}
      sx={{
        height: "100vh",
        background: "#ffffff",
        position: "relative",
      }}
    >
      {/* NEW: Status Display Box */}
      <StatusDisplay message={statusMessage} />

      {/* Edit Panel */}
      {showEditPanel && selectedElement && (
        <EditPanel
          selectedElement={selectedElement}
          onSave={handleSaveEdit}
          onUpdate={handleRealTimeUpdate}
          onClose={() => setShowEditPanel(false)}
        />
      )}

      {/* Node Controls */}
      {/* {selectedElement && !showEditPanel && (
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
            <IconButton size="small" onClick={handleEditClick}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => deleteElement(selectedElement.data.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )} */}
      {/* Unified Delete Controls - Show for both nodes and edges */}
      {(selectedElement || selectedEdge) && !showEditPanel && (
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
            border: "2px solid #000000",
          }}
        >
          {/* Edit button - only show for nodes and edges that can be edited */}
          {selectedElement && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={handleEditClick}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {selectedEdge && (
            <Tooltip title="Edit Relationship">
              <IconButton
                size="small"
                onClick={() => {
                  setEditingEdge(selectedEdge);
                  setEdgeEditPanel(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* Unified Delete Button */}
          <Tooltip
            title={selectedElement ? "Delete Element" : "Delete Relationship"}
          >
            <IconButton size="small" onClick={handleDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Add Buttons */}
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
          onClick={() => {
            const newId = `req_${Date.now()}`;
            addElement("requirement", newId, {
              text: "New requirement",
              risk: "low",
              verifymethod: "test",
            });
          }}
          sx={{
            backgroundColor: "#000000",
            color: "#ffffff",
            fontSize: "11px",
            "&:hover": {
              backgroundColor: "#333333",
            },
          }}
        >
          Add Requirement
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            const newId = `elem_${Date.now()}`;
            addElement("element", newId, {
              text: "New element",
              type: "component",
            });
          }}
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
          Add Element
        </Button>
      </Box>

      {/* Edge Edit Panel */}
      {edgeEditPanel && editingEdge && (
        <EdgeEditPanel
          edge={editingEdge}
          onSave={updateRelationship}
          onClose={() => {
            setEdgeEditPanel(false);
            setEditingEdge(null);
          }}
        />
      )}

      {/* ReactFlow Diagram */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelectionChange}
        connectionLineComponent={CustomConnectionLine}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        fitView
        fitViewOptions={{
          padding: 0.3,
          includeHiddenNodes: false,
          minZoom: 0.2,
          maxZoom: 1.5,
        }}
        minZoom={0.1}
        maxZoom={2}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#f0f0f0" gap={25} size={1} />
        <Controls
          showFitView={true}
          showInteractive={true}
          style={{
            backgroundColor: "white",
          }}
        />
      </ReactFlow>

      {/* Text Styling Panel */}
      <TextStylePanel
        onStyleChange={(style) => setTextStyle(style)}
        initialStyle={textStyle}
      />
    </Box>
  );
};

const RequirementDiagramWrapper = (props) => (
  <ReactFlowProvider>
    <RequirementDiagramView {...props} />
  </ReactFlowProvider>
);

export default RequirementDiagramWrapper;
