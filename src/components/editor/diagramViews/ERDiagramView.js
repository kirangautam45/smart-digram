"use client";

import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useDebounce } from "ahooks";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { parse } from "@/utils/mermaid";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  MarkerType,
  ReactFlowProvider,
  NodeResizeControl,
} from "reactflow";
import "reactflow/dist/style.css";
import { useStore } from "@/store";
import { ChartContext } from "@/app/layout";
import { useParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { TextStylePanel, DiagramStylePanel } from "@/components/diagram-styling";

const ResizeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="#1976d2"
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

const EntityNode = ({ data, selected }) => {
  return (
    <>
      <NodeResizeControl
        style={{
          background: "transparent",
          border: "none",
        }}
        minWidth={180}
        minHeight={100}
      >
        <ResizeIcon />
      </NodeResizeControl>
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "auto",
          background: data.style?.background || "#ffffff",
          border: data.style?.border || "2px solid #1976d2",
          borderRadius: data.style?.borderRadius || "8px",
          boxShadow: data.style?.boxShadow || "0 4px 12px rgba(0,0,0,0.1)",
          borderWidth: selected ? "3px" : "2px",
        }}
      >
        {data.label}
      </div>
    </>
  );
};

const nodeTypes = {
  entity: EntityNode,
};

const ERDiagramView = ({ color, fontSizes }) => {
  const { chartRef } = useContext(ChartContext);
  const code = useStore.use.code();
  const config = useStore.use.config();
  const autoSync = useStore.use.autoSync();
  const updateDiagram = useStore.use.updateDiagram();
  const setUpdateDiagram = useStore.use.setUpdateDiagram();
  const setCode = useStore.use.setCode();
  const setSvg = useStore.use.setSvg();
  const setValidateCodeState = useStore.use.setValidateCode();
  const setValidateConfigState = useStore.use.setValidateConfig();
  const { id } = useParams();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const codeRef = useRef(code);
  const edgesRef = useRef(edges);
  const nodesRef = useRef(nodes);

  const [validateCode, setValidateCode] = useState("");
  const [validateConfig, setValidateConfig] = useState("");
  const [selectedElement, setSelectedElement] = useState(null);
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

  codeRef.current = code;
  edgesRef.current = edges;
  nodesRef.current = nodes;

  const debounceCode = useDebounce(code, { wait: 300 });
  const debounceConfig = useDebounce(config, { wait: 300 });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [reactFlowBounds, setReactFlowBounds] = useState(null);
  const flowContainerRef = useRef(null);

  useEffect(() => {
    if (flowContainerRef.current) {
      const updateBounds = () => {
        const bounds = flowContainerRef.current.getBoundingClientRect();
        setReactFlowBounds(bounds);
      };
      updateBounds();
      window.addEventListener("resize", updateBounds);
      return () => window.removeEventListener("resize", updateBounds);
    }
  }, []);


  const addTheme = [
    {
      name: "default",
      style: {
        primaryColor: "#FFFFFF",
        primaryBorderColor: "#ff5733",
      },
    },
    {
      name: "forest",
      style: {
        primaryColor: "#2E8B57",
        primaryBorderColor: "#145214",
      },
    },
    {
      name: "base",
      style: {
        primaryColor: "#F0F0F0",
        primaryBorderColor: "#ff5733",
      },
    },
    {
      name: "dark",
      style: {
        primaryColor: "#333333",
        primaryBorderColor: "#ff5733",
      },
    },
    {
      name: "neutral",
      style: {
        primaryColor: "#CCCCCC",
        primaryBorderColor: "#ff5733",
      },
    },
    {
      name: "ocean",
      style: {
        primaryColor: "#71BBB2",
        primaryBorderColor: "#497D74",
      },
    },
    {
      name: "solarized",
      style: {
        primaryColor: "#A27B5C",
        primaryBorderColor: "#3F4F44",
      },
    },
    {
      name: "sunset",
      style: {
        primaryColor: "#FFCDB2",
        primaryBorderColor: "#E5989B",
      },
    },
    {
      name: "neon",
      style: {
        primaryColor: "#B6FFA1",
        primaryBorderColor: "#00FF9C",
      },
    },
    {
      name: "monochrome",
      style: {
        primaryColor: "#A7B49E",
        primaryBorderColor: "#818C78",
      },
    },
    {
      name: "lavender",
      style: {
        primaryColor: "#CDA4DE",
        primaryBorderColor: "#8E44AD",
      },
    },
    {
      name: "citrus",
      style: {
        primaryColor: "#FFD166",
        primaryBorderColor: "#EF476F",
      },
    },
    {
      name: "midnight",
      style: {
        primaryColor: "#2C3E50",
        primaryBorderColor: "#1A252F",
      },
    },
    {
      name: "pastel",
      style: {
        primaryColor: "#FFB7B2",
        primaryBorderColor: "#FFDAC1",
      },
    },
  ];
  const updateEntityName = useCallback(
    (oldName, newName) => {
      let newCode = codeRef.current;

      // Replace entity definition
      newCode = newCode.replace(
        new RegExp(`^(\\s*)${oldName}(\\s*\\{)`, "gm"),
        `$1${newName}$2`
      );

      // Replace in relationships
      newCode = newCode.replace(
        new RegExp(
          `\\b${oldName}\\b(?=\\s+(\\|\\|--o\\{|\\}o--\\|\\||\\|\\|--\\|\\||\\}o--o\\{|\\|\\|--\\}\\||\\}\\|--\\|\\|))`,
          "g"
        ),
        newName
      );
      newCode = newCode.replace(
        new RegExp(
          `(\\|\\|--o\\{|\\}o--\\|\\||\\|\\|--\\|\\||\\}o--o\\{|\\|\\|--\\}\\||\\}\\|--\\|\\|)\\s+${oldName}\\b`,
          "g"
        ),
        `$1 ${newName}`
      );

      // Replace in position comments
      newCode = newCode.replace(
        new RegExp(`^(%% Position: )${oldName}( = \\[.+\\])$`, "gm"),
        `$1${newName}$2`
      );

      setCode(newCode);
      sessionStorage.setItem("code", newCode);
    },
    [setCode]
  );

  // ER Diagram parsing functions
  const parseERDiagram = useCallback((text) => {
    if (!text || !text.trim().startsWith("erDiagram")) {
      return { entities: new Map(), relationships: [], positions: new Map() };
    }

    const lines = text.split("\n");
    const entities = new Map();
    const relationships = [];
    const positions = new Map();

    let currentEntity = null;
    let entityAttributes = [];

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) {
        return;
      }

      // Parse position comments - flexible pattern to catch different formats
      const posMatch = trimmed.match(
        /^(?:%%\s*)?Position:\s*(\w+)\s*=\s*\[(-?\d+),\s*(-?\d+)\]$/
      );
      if (posMatch) {
        const [, entityId, x, y] = posMatch;
        positions.set(entityId, { x: parseInt(x, 10), y: parseInt(y, 10) });
        return;
      }

      // Skip other comments
      if (trimmed.startsWith("%%")) {
        return;
      }

      // Detect entity start
      const entityMatch = trimmed.match(/^(\w+)\s*\{$/);
      if (entityMatch) {
        currentEntity = entityMatch[1];
        entityAttributes = [];
        return;
      }

      // Detect entity end
      if (trimmed === "}" && currentEntity) {
        entities.set(currentEntity, entityAttributes);
        currentEntity = null;
        return;
      }

      // Parse attributes within entity
      if (currentEntity && trimmed !== "erDiagram") {
        const attrMatch = trimmed.match(/^(\w+)\s+(\w+)(?:\s+(PK|FK|UK))?$/);
        if (attrMatch) {
          const [, type, name, constraint] = attrMatch;
          entityAttributes.push({
            type: type.trim(),
            name: name.trim(),
            constraint: constraint || "",
          });
        }
        return;
      }

      // Parse relationships
      const relMatch = trimmed.match(
        /^(\w+)\s+(\|\|--o\{|\}o--\|\||\|\|--\|\||\}o--o\{|\|\|--\}\||\}\|--\|\|)\s+(\w+)\s*:\s*(.+)$/
      );
      if (relMatch) {
        const [, entity1, connector, entity2, label] = relMatch;
        relationships.push({
          entity1: entity1.trim(),
          entity2: entity2.trim(),
          connector: connector.trim(),
          label: label.trim(),
        });
      }
    });

    return { entities, relationships, positions };
  }, []);

  // Add these new functions to your ERDiagramView component

  // Update attribute in code
  const updateAttribute = useCallback(
    (entityName, attributeIndex, field, newValue) => {
      let newCode = codeRef.current;
      const lines = newCode.split("\n");
      let currentEntity = null;
      let entityStartIndex = -1;
      let attributeCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Find entity start
        const entityMatch = line.match(/^(\w+)\s*\{$/);
        if (entityMatch && entityMatch[1] === entityName) {
          currentEntity = entityName;
          entityStartIndex = i;
          attributeCount = 0;
          continue;
        }

        // Find entity end
        if (line === "}" && currentEntity) {
          break;
        }

        // Process attributes within entity
        if (currentEntity && line !== "erDiagram" && !line.startsWith("%%")) {
          const attrMatch = line.match(/^(\w+)\s+(\w+)(?:\s+(PK|FK|UK))?$/);
          if (attrMatch && attributeCount === attributeIndex) {
            const [, currentType, currentName, currentConstraint] = attrMatch;
            let updatedLine = "";

            if (field === "type") {
              updatedLine = `        ${newValue} ${currentName}${
                currentConstraint ? " " + currentConstraint : ""
              }`;
            } else if (field === "name") {
              updatedLine = `        ${currentType} ${newValue}${
                currentConstraint ? " " + currentConstraint : ""
              }`;
            } else if (field === "constraint") {
              updatedLine = `        ${currentType} ${currentName}${
                newValue ? " " + newValue : ""
              }`;
            }

            lines[i] = updatedLine;
            break;
          }
          if (attrMatch) {
            attributeCount++;
          }
        }
      }

      const updatedCode = lines.join("\n");
      setCode(updatedCode);
      sessionStorage.setItem("code", updatedCode);
    },
    [setCode]
  );

  // Add new attribute to entity
  const addAttributeToEntity = useCallback(
    (entityName) => {
      let newCode = codeRef.current;
      const lines = newCode.split("\n");
      let entityEndIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Find entity start
        const entityMatch = line.match(/^(\w+)\s*\{$/);
        if (entityMatch && entityMatch[1] === entityName) {
          // Look for the closing brace
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].trim() === "}") {
              entityEndIndex = j;
              break;
            }
          }
          break;
        }
      }

      if (entityEndIndex !== -1) {
        const newAttribute = `        string new_field`;
        lines.splice(entityEndIndex, 0, newAttribute);

        const updatedCode = lines.join("\n");
        setCode(updatedCode);
        sessionStorage.setItem("code", updatedCode);
      }
    },
    [setCode]
  );

  // Delete attribute from entity
  const deleteAttributeFromEntity = useCallback(
    (entityName, attributeIndex) => {
      let newCode = codeRef.current;
      const lines = newCode.split("\n");
      let currentEntity = null;
      let attributeCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Find entity start
        const entityMatch = line.match(/^(\w+)\s*\{$/);
        if (entityMatch && entityMatch[1] === entityName) {
          currentEntity = entityName;
          attributeCount = 0;
          continue;
        }

        // Find entity end
        if (line === "}" && currentEntity) {
          break;
        }

        // Process attributes within entity
        if (currentEntity && line !== "erDiagram" && !line.startsWith("%%")) {
          const attrMatch = line.match(/^(\w+)\s+(\w+)(?:\s+(PK|FK|UK))?$/);
          if (attrMatch && attributeCount === attributeIndex) {
            lines.splice(i, 1);
            break;
          }
          if (attrMatch) {
            attributeCount++;
          }
        }
      }

      const updatedCode = lines.join("\n");
      setCode(updatedCode);
      sessionStorage.setItem("code", updatedCode);
    },
    [setCode]
  );

  // Enhanced node rendering with clickable attributes
  const convertERToReactFlow = useCallback(
    (text, prevNodes = []) => {
      const { entities, relationships, positions } = parseERDiagram(text);

      if (entities.size === 0) {
        return { nodes: [], edges: [] };
      }

      const nodesOut = [];
      const edgesOut = [];

      // Create entity nodes
      const nodeWidth = 220;
      const nodeHeightBase = 80;
      const attributeHeight = 24;

      let xPosition = 100;
      let yPosition = 100;
      const columns = 3;
      let columnCount = 0;

      // Get theme colors
      const nodeThemeName = color.theme.includes("base/")
        ? color.theme.split("/")[1]
        : color.theme;
      const themeStyle = addTheme.find((t) => t.name === nodeThemeName)?.style;

      entities.forEach((attributes, entityName) => {
        const nodeId = entityName;
        const totalHeight =
          nodeHeightBase + attributes.length * attributeHeight;

        // Use saved position or calculate grid position
        let position;
        if (positions.has(entityName)) {
          position = positions.get(entityName);
        } else {
          const prevNode = prevNodes.find((n) => n.id === entityName);
          if (prevNode && prevNode.position) {
            position = prevNode.position;
          } else {
            if (columnCount >= columns) {
              columnCount = 0;
              yPosition += 350;
            }
            position = {
              x: xPosition + columnCount * 280,
              y: yPosition,
            };
            columnCount++;
          }
        }

        nodesOut.push({
          id: nodeId,
          type: "entity",
          data: {
            style: {
              background: themeStyle?.primaryColor || "#ffffff",
              border: `2px solid ${themeStyle?.primaryBorderColor || "#1976d2"}`,
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
            label: (
              <div
                style={{
                  padding: "12px",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  minWidth: "180px",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: "12px",
                    borderBottom: `2px solid ${
                      themeStyle?.primaryBorderColor || "#1976d2"
                    }`,
                    paddingBottom: "6px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Edit entity name
                    const input = document.createElement("input");
                    input.type = "text";
                    input.value = entityName;
                    Object.assign(input.style, {
                      position: "fixed",
                      left: `${e.clientX - 100}px`,
                      top: `${e.clientY - 18}px`,
                      width: "200px",
                      height: "36px",
                      border: "2px solid #4a5568",
                      background: "#ffffff",
                      color: "#000000",
                      padding: "8px 12px",
                      fontSize: "14px",
                      borderRadius: "6px",
                      zIndex: "20000",
                    });

                    document.body.appendChild(input);
                    input.focus();
                    input.select();

                    let isCleanedUp = false;
                    const cleanup = () => {
                      if (!isCleanedUp && input && input.parentNode) {
                        isCleanedUp = true;
                        input.parentNode.removeChild(input);
                      }
                    };
                    const save = () => {
                      if (input.value !== entityName && input.value.trim()) {
                        updateEntityName(entityName, input.value.trim());
                      }
                      cleanup();
                    };

                    input.onkeydown = (event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        save();
                      } else if (event.key === "Escape") {
                        cleanup();
                      }
                    };

                    input.onblur = save;
                  }}
                >
                  {entityName}
                </div>
                <style>{`
                .attribute-row {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin: 3px 0;
                  padding: 4px 8px;
                  border-radius: 4px;
                  fontSize: 12px;
                  cursor: pointer;
                  border: 1px solid transparent;
                  transition: all 0.2s ease;
                }
                .attribute-row:hover {
                  background-color: #e3f2fd !important;
                  border: 1px solid #1976d2 !important;
                }
                .attribute-row-even {
                  background-color: #f8f9fa;
                }
                .attribute-row-odd {
                  background-color: transparent;
                }
                .add-attribute-btn {
                  text-align: center;
                  margin-top: 8px;
                  padding: 4px;
                  color: #1976d2;
                  cursor: pointer;
                  fontSize: 12px;
                  border: 1px dashed #1976d2;
                  border-radius: 4px;
                  transition: background-color 0.2s ease;
                }
                .add-attribute-btn:hover {
                  background-color: #e3f2fd;
                }
              `}</style>
                {/* Clickable attributes */}
                {attributes.map((attr, index) => (
                  <div
                    key={index}
                    className={`attribute-row ${
                      index % 2 === 0
                        ? "attribute-row-even"
                        : "attribute-row-odd"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Show attribute editing menu
                      showAttributeEditMenu(e, entityName, index, attr);
                    }}
                  >
                    <span style={{ flex: 1 }}>{attr.name}</span>
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "11px",
                        color: "#666",
                      }}
                    >
                      {attr.type}
                    </span>
                    {attr.constraint && (
                      <span
                        style={{
                          marginLeft: "8px",
                          fontWeight: "bold",
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "8px",
                          backgroundColor:
                            attr.constraint === "PK"
                              ? "#e3f2fd"
                              : attr.constraint === "FK"
                              ? "#fff3e0"
                              : "#e8f5e8",
                          color:
                            attr.constraint === "PK"
                              ? "#1976d2"
                              : attr.constraint === "FK"
                              ? "#f57c00"
                              : "#388e3c",
                        }}
                      >
                        {attr.constraint}
                      </span>
                    )}
                  </div>
                ))}

                {/* Add attribute button */}
                {/* <div
                style={{
                  textAlign: "center",
                  marginTop: "8px",
                  padding: "4px",
                  color: "#1976d2",
                  cursor: "pointer",
                  fontSize: "12px",
                  border: "1px dashed #1976d2",
                  borderRadius: "4px",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  addAttributeToEntity(entityName);
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#e3f2fd";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                + Add Attribute
              </div> */}
              </div>
            ),
            entity: true,
            attributes: attributes,
            entityName: entityName,
          },
          position: position,
          style: {
            width: nodeWidth,
            height: totalHeight + 40, // Extra space for add button
            padding: "0",
          },
          draggable: true,
          resizable: true,
        });
      });

      // Create relationship edges (same as before)
      relationships.forEach((rel, index) => {
        const edgeId = `edge-${rel.entity1}-${rel.entity2}-${index}`;

        let markerStart = undefined;
        let markerEnd = undefined;
        const edgeColor = "#666";

        switch (rel.connector) {
          case "||--o{":
            markerEnd = { type: MarkerType.ArrowClosed, color: edgeColor };
            break;
          case "}o--||":
            markerStart = { type: MarkerType.ArrowClosed, color: edgeColor };
            break;
          case "||--||":
            markerEnd = { type: MarkerType.ArrowClosed, color: edgeColor };
            break;
          case "}o--o{":
            markerStart = { type: MarkerType.ArrowClosed, color: edgeColor };
            markerEnd = { type: MarkerType.ArrowClosed, color: edgeColor };
            break;
          default:
            markerEnd = { type: MarkerType.ArrowClosed, color: edgeColor };
        }

        edgesOut.push({
          id: edgeId,
          source: rel.entity1,
          target: rel.entity2,
          type: "smoothstep",
          style: { stroke: edgeColor, strokeWidth: 2 },
          markerStart: markerStart,
          markerEnd: markerEnd,
          label: rel.label,
          data: {
            entity1: rel.entity1,
            entity2: rel.entity2,
            connector: rel.connector,
            relationshipLabel: rel.label,
          },
        });
      });

      return { nodes: nodesOut, edges: edgesOut };
    },
    [parseERDiagram, color.theme, updateEntityName, addAttributeToEntity]
  );

  // Show attribute editing menu
  const showAttributeEditMenu = useCallback(
    (e, entityName, attributeIndex, attribute) => {
      // Remove any existing menu
      const existingMenu = document.getElementById("attribute-edit-menu");
      if (existingMenu) {
        existingMenu.remove();
      }

      const menu = document.createElement("div");
      menu.id = "attribute-edit-menu";
      menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 12px;
    z-index: 25000;
    font-family: Arial, sans-serif;
    min-width: 250px;
  `;

      const createField = (label, value, field) => {
        const container = document.createElement("div");
        container.style.marginBottom = "10px";

        const labelEl = document.createElement("label");
        labelEl.textContent = label;
        labelEl.style.cssText = `
      display: block;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 4px;
      color: #333;
    `;

        const input = document.createElement(
          field === "constraint" ? "select" : "input"
        );
        input.value = value || "";
        input.style.cssText = `
      width: 100%;
      padding: 6px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 12px;
      box-sizing: border-box;
    `;

        if (field === "constraint") {
          const options = ["", "PK", "FK", "UK"];
          options.forEach((opt) => {
            const option = document.createElement("option");
            option.value = opt;
            option.textContent = opt || "None";
            option.selected = opt === value;
            input.appendChild(option);
          });
        }

        input.onchange = () => {
          updateAttribute(entityName, attributeIndex, field, input.value);
        };

        container.appendChild(labelEl);
        container.appendChild(input);
        return container;
      };

      menu.appendChild(createField("Field Name:", attribute.name, "name"));
      menu.appendChild(createField("Data Type:", attribute.type, "type"));
      menu.appendChild(
        createField("Constraint:", attribute.constraint, "constraint")
      );

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete Attribute";
      deleteBtn.style.cssText = `
    background: #f44336;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    margin-top: 8px;
    width: 100%;
  `;
      deleteBtn.onclick = () => {
        deleteAttributeFromEntity(entityName, attributeIndex);
        menu.remove();
      };

      menu.appendChild(deleteBtn);

      // Close button
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Close";
      closeBtn.style.cssText = `
    background: #666;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    margin-top: 4px;
    width: 100%;
  `;
      closeBtn.onclick = () => menu.remove();

      menu.appendChild(closeBtn);
      document.body.appendChild(menu);

      // Close menu when clicking outside
      const closeMenu = (event) => {
        if (!menu.contains(event.target)) {
          menu.remove();
          document.removeEventListener("click", closeMenu);
        }
      };

      setTimeout(() => {
        document.addEventListener("click", closeMenu);
      }, 100);
    },
    [updateAttribute, deleteAttributeFromEntity]
  );

  // Update relationship label in code
  const updateRelationshipLabel = useCallback(
    (entity1, entity2, connector, oldLabel, newLabel) => {
      let newCode = codeRef.current;

      const pattern = new RegExp(
        `^(\\s*${entity1}\\s+${connector.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}\\s+${entity2}\\s*:\\s*)(.+)$`,
        "gm"
      );

      newCode = newCode.replace(pattern, `$1${newLabel}`);

      setCode(newCode);
      sessionStorage.setItem("code", newCode);
    },
    [setCode]
  );

  // Add new entity
  const addNewEntity = useCallback(
    (position) => {
      const entityName = `Entity_${Date.now()}`;
      const entityCode = `    ${entityName} {
        int id PK
        string name
    }`;

      let newCode = codeRef.current;
      if (!newCode.includes("erDiagram")) {
        newCode = "erDiagram\n";
      }

      newCode += "\n" + entityCode;

      // Add position comment
      if (position) {
        newCode += `\n%% Position: ${entityName} = [${Math.round(
          position.x
        )}, ${Math.round(position.y)}]`;
      }

      setCode(newCode);
      sessionStorage.setItem("code", newCode);
    },
    [setCode]
  );

  // Delete entity from code
  const deleteEntityFromCode = useCallback(
    (entityName) => {
      let newCode = codeRef.current;

      // Remove entity definition (including all its attributes)
      const entityRegex = new RegExp(
        `^\\s*${entityName}\\s*\\{[\\s\\S]*?^\\s*\\}`,
        "gm"
      );
      newCode = newCode.replace(entityRegex, "");

      // Remove relationships involving this entity
      const relationshipRegex = new RegExp(
        `^\\s*(?:${entityName}\\s+(?:\\|\\|--o\\{|\\}o--\\|\\||\\|\\|--\\|\\||\\}o--o\\{|\\|\\|--\\}\\||\\}\\|--\\|\\|)\\s+\\w+|\\w+\\s+(?:\\|\\|--o\\{|\\}o--\\|\\||\\|\\|--\\|\\||\\}o--o\\{|\\|\\|--\\}\\||\\}\\|--\\|\\|)\\s+${entityName})\\s*:.*$`,
        "gm"
      );
      newCode = newCode.replace(relationshipRegex, "");

      // Remove position comment
      const positionRegex = new RegExp(
        `^(?:%%\\s*)?Position:\\s*${entityName}\\s*=\\s*\\[.+\\]$`,
        "gm"
      );
      newCode = newCode.replace(positionRegex, "");

      // Clean up empty lines
      newCode = newCode
        .split("\n")
        .filter((line) => line.trim() !== "")
        .join("\n")
        .trim();

      setCode(newCode);
      sessionStorage.setItem("code", newCode);
    },
    [setCode]
  );

  // Delete relationship from code
  const deleteRelationshipFromCode = useCallback(
    (entity1, entity2, connector) => {
      let newCode = codeRef.current;

      const pattern = new RegExp(
        `^\\s*${entity1}\\s+${connector.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}\\s+${entity2}\\s*:.*$`,
        "gm"
      );

      newCode = newCode.replace(pattern, "");

      // Clean up empty lines
      newCode = newCode
        .split("\n")
        .filter((line) => line.trim() !== "")
        .join("\n")
        .trim();

      setCode(newCode);
      sessionStorage.setItem("code", newCode);
    },
    [setCode]
  );

  // Validation
  const setValidateCodeAndConfig = async (c, conf) => {
    try {
      if (c.trim().startsWith("erDiagram")) {
        // For ER diagrams, just validate the structure
        setValidateCode(c);
        setValidateConfig(conf);
        setValidateCodeState(c);
        setValidateConfigState(conf);
      } else {
        await parse(c);
        JSON.parse(conf || "{}");
        setValidateCode(c);
        setValidateConfig(conf);
        setValidateCodeState(c);
        setValidateConfigState(conf);
      }
    } catch (error) {
      const msg =
        error instanceof Error
          ? `Syntax error: ${error.message}`
          : "Syntax error: Unknown";
      setValidateCode(msg);
      setValidateConfig(conf);
      setValidateCodeState(msg);
      setValidateConfigState(conf);
    }
  };

  // Render diagram
  const renderDiagram = useCallback(
    async (text, conf) => {
      if (!text) return;

      const { nodes: flowNodes, edges: flowEdges } = convertERToReactFlow(
        text,
        nodesRef.current
      );

      setNodes(flowNodes);
      setEdges(flowEdges);
      setSvg(null);
    },
    [convertERToReactFlow, setNodes, setEdges, setSvg]
  );

  // Node double click - edit entity name
  const onNodeDoubleClick = useCallback(
    (event, node) => {
      const lockButton = document.querySelector('.react-flow__controls-lock');
      const isLocked = lockButton?.getAttribute('data-isactive') === 'true';
      
      if (isLocked) {
        event.stopPropagation();
        return;
      }
      const input = document.createElement("input");
      input.type = "text";
      input.value = node.data.entityName || "";
      Object.assign(input.style, {
        position: "fixed",
        left: `${event.clientX}px`,
        top: `${event.clientY}px`,
        width: "200px",
        height: "36px",
        border: "2px solid #4a5568",
        background: "#ffffff",
        color: "#000000",
        padding: "8px 12px",
        fontSize: "14px",
        borderRadius: "6px",
        zIndex: "20000",
      });

      document.body.appendChild(input);
      input.focus();
      input.select();

      let cleanedUp = false;
      const cleanup = () => {
        if (!cleanedUp) {
          cleanedUp = true;
          if (input && input.parentNode) input.parentNode.removeChild(input);
        }
      };

      const save = () => {
        if (input.value !== node.data.entityName && input.value.trim()) {
          updateEntityName(node.data.entityName, input.value.trim());
        }
        cleanup();
      };

      input.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          save();
        } else if (e.key === "Escape") {
          cleanup();
        }
      };

      input.onblur = () => {
        setTimeout(() => {
          if (!cleanedUp) save();
        }, 0);
      };

      event.stopPropagation();
    },
    [updateEntityName]
  );

  // Edge double click - edit relationship label
  const onEdgeDoubleClick = useCallback(
    (event, edge) => {
      const lockButton = document.querySelector('.react-flow__controls-lock');
    const isLocked = lockButton?.getAttribute('data-isactive') === 'true';
    
    if (isLocked) {
      event.stopPropagation();
      return;
    }
      const input = document.createElement("input");
      input.type = "text";
      input.value = edge.data.relationshipLabel || "";
      Object.assign(input.style, {
        position: "fixed",
        left: `${event.clientX}px`,
        top: `${event.clientY}px`,
        width: "240px",
        height: "36px",
        border: "2px solid #4a5568",
        background: "#ffffff",
        color: "#000000",
        padding: "8px 12px",
        fontSize: "14px",
        borderRadius: "6px",
        zIndex: "20000",
      });

      document.body.appendChild(input);
      input.focus();
      input.select();

      let cleanedUp = false;
      const cleanup = () => {
        if (!cleanedUp) {
          cleanedUp = true;
          if (input && input.parentNode) input.parentNode.removeChild(input);
        }
      };

      const save = () => {
        const newLabel = input.value.trim();
        if (newLabel) {
          updateRelationshipLabel(
            edge.data.entity1,
            edge.data.entity2,
            edge.data.connector,
            edge.data.relationshipLabel,
            newLabel
          );
        }
        cleanup();
      };

      input.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          save();
        } else if (e.key === "Escape") {
          cleanup();
        }
      };

      input.onblur = () => {
        setTimeout(() => save(), 0);
      };

      event.stopPropagation();
    },
    [updateRelationshipLabel]
  );

  // Add relationship on connect
  const onConnect = useCallback(
    (params) => {
      const { source, target } = params;

      const relationshipCode = `    ${source} ||--o{ ${target} : has`;

      let newCode = codeRef.current;
      if (!newCode.includes("erDiagram")) {
        newCode = "erDiagram\n";
      }

      newCode += "\n" + relationshipCode;

      setCode(newCode);
      sessionStorage.setItem("code", newCode);
    },
    [setCode]
  );

  // Node drag stop - save position with improved format
  const onNodeDragStop = useCallback(
    async (event, node) => {
      const newX = Math.round(node.position.x);
      const newY = Math.round(node.position.y);

      let newCode = codeRef.current;

      // Remove existing position comment for this entity
      const positionRegex = new RegExp(
        `^(?:%%\\s*)?Position:\\s*${node.id}\\s*=\\s*\\[.+\\]$`,
        "gm"
      );
      newCode = newCode.replace(positionRegex, "");

      // Add new position comment at the end
      const positionComment = `%% Position: ${node.id} = [${newX}, ${newY}]`;

      // Clean up multiple empty lines first
      newCode = newCode.replace(/\n\s*\n\s*\n/g, "\n\n");

      // Add position comment
      newCode = newCode.trim() + "\n" + positionComment;

      setCode(newCode);
      sessionStorage.setItem("code", newCode);

      // Save to database
      if (id) {
        try {
          await axiosInstance.put(`/api/flowchart/${id}`, {
            mermaidString: newCode,
          });
          console.log(`Position saved for ${node.id}: [${newX}, ${newY}]`);
        } catch (error) {
          console.error("Error saving position:", error);
        }
      }
    },
    [setCode, id]
  );

  // Delete handlers
  const onNodesDelete = useCallback(
    (deletedNodes) => {
      deletedNodes.forEach((node) => {
        if (node.data.entity) {
          deleteEntityFromCode(node.data.entityName);
        }
      });
    },
    [deleteEntityFromCode]
  );

  const onEdgesDelete = useCallback(
    (deletedEdges) => {
      deletedEdges.forEach((edge) => {
        if (edge.data) {
          deleteRelationshipFromCode(
            edge.data.entity1,
            edge.data.entity2,
            edge.data.connector
          );
        }
      });
    },
    [deleteRelationshipFromCode]
  );

  // Selection change handler
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }) => {
      if (selectedNodes && selectedNodes.length > 0) {
        const node = selectedNodes[0];
        const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
        if (nodeElement) {
          const rect = nodeElement.getBoundingClientRect();
          setSelectedElement({
            type: "node",
            data: node,
            screenPosition: {
              x: rect.left + rect.width / 2,
              y: rect.top,
            },
          });
        }
      } else if (selectedEdges && selectedEdges.length > 0) {
        setSelectedElement({
          type: "edge",
          data: selectedEdges[0],
          screenPosition: {
            x: mousePosition.x,
            y: mousePosition.y,
          },
        });
      } else {
        setSelectedElement(null);
      }
    },
    [mousePosition]
  );

  // Handle delete selected
  const handleDeleteSelected = useCallback(() => {
    if (!selectedElement) return;
    if (selectedElement.type === "node") {
      const node = selectedElement.data;
      setNodes((nds) => nds.filter((n) => n.id !== node.id));
      onNodesDelete([node]);
    } else if (selectedElement.type === "edge") {
      const edge = selectedElement.data;
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      onEdgesDelete([edge]);
    }
    setSelectedElement(null);
  }, [selectedElement, setNodes, setEdges, onNodesDelete, onEdgesDelete]);

  const handleEditSelected = useCallback(() => {
    if (!selectedElement) return;

    if (selectedElement.type === "node") {
      // Edit entity name
      const screenX = selectedElement.screenPosition.x;
      const screenY = selectedElement.screenPosition.y;

      const input = document.createElement("input");
      input.type = "text";
      input.value = selectedElement.data.data?.entityName || "";
      Object.assign(input.style, {
        position: "fixed",
        left: `${screenX - 100}px`,
        top: `${screenY - 35}px`,
        width: "200px",
        height: "36px",
        border: "2px solid #4a5568",
        background: "#ffffff",
        color: "#000000",
        padding: "8px 12px",
        fontSize: "14px",
        borderRadius: "6px",
        zIndex: "20000",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      });

      document.body.appendChild(input);
      input.focus();
      input.select();

      let cleanedUp = false;
      const cleanup = () => {
        if (!cleanedUp) {
          cleanedUp = true;
          if (input && input.parentNode) input.parentNode.removeChild(input);
        }
      };

      const save = () => {
        const newName = input.value.trim();
        if (newName && newName !== selectedElement.data.data?.entityName) {
          updateEntityName(selectedElement.data.data?.entityName, newName);
        }
        cleanup();
      };

      input.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          save();
        } else if (e.key === "Escape") {
          cleanup();
        }
      };

      input.onblur = () => {
        setTimeout(() => {
          if (!cleanedUp) save();
        }, 0);
      };
    } else if (selectedElement.type === "edge") {
      // Edit relationship label - FIXED
      const screenX = selectedElement.screenPosition.x;
      const screenY = selectedElement.screenPosition.y;

      const input = document.createElement("input");
      input.type = "text";
      // Fix: Access the label correctly from edge data
      input.value =
        selectedElement.data.data?.relationshipLabel ||
        selectedElement.data.label ||
        "";
      Object.assign(input.style, {
        position: "fixed",
        left: `${screenX - 120}px`, // Center better for relationship labels
        top: `${screenY - 35}px`,
        width: "240px",
        height: "36px",
        border: "2px solid #4a5568",
        background: "#ffffff",
        color: "#000000",
        padding: "8px 12px",
        fontSize: "14px",
        borderRadius: "6px",
        zIndex: "20000",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      });

      document.body.appendChild(input);
      input.focus();
      input.select();

      let cleanedUp = false;
      const cleanup = () => {
        if (!cleanedUp) {
          cleanedUp = true;
          if (input && input.parentNode) input.parentNode.removeChild(input);
        }
      };

      const save = () => {
        const newLabel = input.value.trim();
        if (newLabel && selectedElement.data.data) {
          // Fix: Access the correct properties from edge data
          updateRelationshipLabel(
            selectedElement.data.data.entity1,
            selectedElement.data.data.entity2,
            selectedElement.data.data.connector,
            selectedElement.data.data.relationshipLabel,
            newLabel
          );
        }
        cleanup();
      };

      input.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          save();
        } else if (e.key === "Escape") {
          cleanup();
        }
      };

      input.onblur = () => {
        setTimeout(() => {
          if (!cleanedUp) save();
        }, 0);
      };
    }
  }, [selectedElement, updateEntityName, updateRelationshipLabel]);

  // Click on pane to add entity at click position (double-click)
  const onPaneClick = useCallback(
    (event) => {
  
      if (event.detail === 2 && reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        addNewEntity(position);
      }
    },
    []
  );

  // Edge click handler for selection
  const onEdgeClick = useCallback((event, edge) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  }, []);

  // Effects
  useEffect(() => {
    if (typeof window !== "undefined" && (autoSync || updateDiagram)) {
      setValidateCodeAndConfig(debounceCode, debounceConfig);
      if (updateDiagram) setUpdateDiagram(false);
    }
  }, [debounceCode, debounceConfig, autoSync, updateDiagram]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      validateCode &&
      !validateCode.startsWith("Syntax error")
    ) {
      renderDiagram(validateCode, validateConfig);
    }
  }, [validateCode, validateConfig, renderDiagram]);

  // Render
  if (validateCode.startsWith("Syntax error")) {
    return (
      <Box
        ref={chartRef}
        component="div"
        sx={{
          height: "100vh !important",
          backgroundImage: `url("${color.image.src}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          component="div"
          sx={{
            color: "red",
            px: 2,
            background: "white",
            p: 2,
            borderRadius: 1,
          }}
        >
          {validateCode}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      ref={(el) => {
        chartRef.current = el;
        flowContainerRef.current = el;
      }}
      component="div"
      sx={{
        height: "100vh !important",
        // backgroundImage: `url("${color.image.src}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}
    >
  
      {/* Selection toolbar */}
      {selectedElement && (
        <Box
          sx={{
            position: "fixed",
            zIndex: 2000,
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "row",
            gap: 1,
            background: "white",
            padding: "6px",
            borderRadius: "6px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
            border: "1px solid #ddd",
            transform: "translateX(-50%)",
            top: selectedElement.screenPosition.y - 45,
            left: selectedElement.screenPosition.x,
          }}
        >
          <Tooltip
            title={`Edit ${
              selectedElement.type === "node"
                ? "entity name"
                : "relationship label"
            }`}
          >
            <IconButton
              color="primary"
              size="small"
              onClick={handleEditSelected}
              sx={{
                width: 32,
                height: 32,
                "&:hover": { backgroundColor: "#f0f0f0" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={`Delete ${
              selectedElement.type === "node" ? "entity" : "relationship"
            }`}
          >
            <IconButton
              color="error"
              size="small"
              onClick={handleDeleteSelected}
              sx={{
                width: 32,
                height: 32,
                "&:hover": { backgroundColor: "#ffebee" },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {selectedElement.type === "node" && (
      <Tooltip title="Add column to entity">
        <IconButton
          color="success"
          size="small"
          onClick={() => {
            if (selectedElement.type === "node") {
              addAttributeToEntity(selectedElement.data.data?.entityName);
            }
          }}
          sx={{
            width: 32,
            height: 32,
            "&:hover": { backgroundColor: "#e8f5e8" },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
        </Box>
      )}

      {/* Add entity button */}
      <Box
        sx={{
          position: "absolute",
          top: 26,
          right: 20,
          zIndex: 2000,
          display: "flex",
          gap: 1,
        }}
      >
        <Tooltip title="Add new entity (or double-click on canvas)">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => addNewEntity({ x: 100, y: 100 })}
            sx={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            Add Entity
          </Button>
        </Tooltip>
      </Box>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onInit={setReactFlowInstance}
        onSelectionChange={onSelectionChange}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
          minZoom: 0.1,
          maxZoom: 2,
        }}
        minZoom={0.05}
        maxZoom={3}
        style={{ background: "transparent" }}
        nodeOrigin={[0, 0]}
        deleteKeyCode={["Backspace", "Delete"]}

      >
        <Background />
        <Controls
                        showFitView={true}
                        showInteractive={true}
                        style={{
                          position: "absolute",
                          top: "80%",
                          left: "10px",
                          transform: "translateY(-50%)",
                          zIndex: 1001,
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

const ERDiagramWrapper = (props) => (
  <ReactFlowProvider>
    <ERDiagramView {...props} />
  </ReactFlowProvider>
);

export default ERDiagramWrapper;