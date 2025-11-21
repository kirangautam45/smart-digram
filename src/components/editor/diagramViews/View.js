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
} from "reactflow";
import "reactflow/dist/style.css";
import { useStore } from "@/store";
import { ChartContext } from "@/app/layout";
import dagre from "dagre";
import CustomShapeNode from "../CustomShapeNode";
import { useParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";

// Helper to escape regex
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const applyLayout = (nodes, edges, direction = "TB") => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 50, ranksep: 50 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 150, height: 50 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });
};

const nodeTypes = {
  customShape: CustomShapeNode,
};

const FlowView = ({ color, fontSizes }) => {
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

  codeRef.current = code;
  edgesRef.current = edges;
  nodesRef.current = nodes;

  const debounceCode = useDebounce(code, { wait: 300 });
  const debounceConfig = useDebounce(config, { wait: 300 });

  const [deletedNodeIds, setDeletedNodeIds] = useState([]);
  const [deletedEdgeIds, setDeletedEdgeIds] = useState([]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Add this to track clicks on edges specifically
  const onEdgeClick = useCallback((event, edge) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  }, []);
  const [reactFlowBounds, setReactFlowBounds] = useState(null);
  const flowContainerRef = useRef(null);

  // Add this useEffect to get the React Flow container bounds
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
        primaryBorderColor: "#000",
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
        primaryBorderColor: "#000",
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

  /*** MERMAID NODE PARSER ***/
  const parseMermaidNodes = (text) => {
    const results = [];
    const lines = text.split("\n");

    const patterns = [
      /(\w+)\[([^\]]+)\]/,
      /(\w+)\{([^}]+)\}/,
      /(\w+)\(([^)]+)\)/,
    ];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      for (const p of patterns) {
        const m = trimmed.match(p);
        if (m) {
          results.push({
            id: m[1],
            label: m[2] || "",
            lineIndex: idx,
            originalLine: line,
          });
          break;
        }
      }
    });

    return results;
  };

  /*** VALIDATION ***/
  const setValidateCodeAndConfig = async (c, conf) => {
    try {
      await parse(c);
      JSON.parse(conf || "{}");
      setValidateCode(c);
      setValidateConfig(conf);
      setValidateCodeState(c);
      setValidateConfigState(conf);
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

  /*** UPDATE NODE LABEL IN CODE (reuses user's earlier approach) ***/
  const updateCode = useCallback(
    (oldText, newText, nodeId) => {
      const currentCode = codeRef.current;
      const nodesParsed = parseMermaidNodes(currentCode);
      const nodeToUpdate = nodesParsed.find((n) => n.id === nodeId);
      if (!nodeToUpdate) return;

      const lines = currentCode.split("\n");
      const originalLine = lines[nodeToUpdate.lineIndex];
      let updatedLine = originalLine;

      if (originalLine.includes("[")) {
        updatedLine = originalLine.replace(`[${oldText}]`, `[${newText}]`);
      } else if (originalLine.includes("{")) {
        updatedLine = originalLine.replace(`{${oldText}}`, `{${newText}}`);
      } else if (originalLine.includes("(")) {
        updatedLine = originalLine.replace(`(${oldText})`, `(${newText})`);
      } else {
        return;
      }

      lines[nodeToUpdate.lineIndex] = updatedLine;
      const newCode = lines.join("\n");
      setCode(newCode);
      sessionStorage.setItem("code", newCode);
    },
    [setCode]
  );

  /*** UPDATE EDGE LABEL IN CODE ***/
  const updateEdgeInCode = useCallback(
    (source, target, oldLabel, newLabel) => {
      let current = codeRef.current || "";
      let replaced = false;
      const lines = current.split("\n");

      // Iterate through each line to find the exact edge
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Check if this line contains the edge we're looking for
        let edgeFound = false;
        let updatedLine = line;

        // Pattern 1: source --> target (simple edge)
        if (
          line.includes(`${source} --> ${target}`) &&
          !line.includes("|") &&
          !line.includes("-- ")
        ) {
          edgeFound = true;
          if (newLabel) {
            updatedLine = line.replace(
              `${source} --> ${target}`,
              `${source} -->|${newLabel}| ${target}`
            );
          }
        }
        // Pattern 2: source -- label --> target
        else if (
          line.includes(`${source} -- `) &&
          line.includes(` --> ${target}`)
        ) {
          const labelMatch = line.match(
            new RegExp(`${source} -- (.+?) --> ${target}`)
          );
          if (labelMatch) {
            edgeFound = true;
            if (newLabel) {
              updatedLine = line.replace(
                labelMatch[0],
                `${source} -- ${newLabel} --> ${target}`
              );
            } else {
              updatedLine = line.replace(
                labelMatch[0],
                `${source} --> ${target}`
              );
            }
          }
        }
        // Pattern 3: source -->|label| target
        else if (
          line.includes(`${source} -->|`) &&
          line.includes(`| ${target}`)
        ) {
          const labelMatch = line.match(
            new RegExp(`${source} -->\\|(.+?)\\| ${target}`)
          );
          if (labelMatch) {
            edgeFound = true;
            if (newLabel) {
              updatedLine = line.replace(
                labelMatch[0],
                `${source} -->|${newLabel}| ${target}`
              );
            } else {
              updatedLine = line.replace(
                labelMatch[0],
                `${source} --> ${target}`
              );
            }
          }
        }
        // Pattern 4: source -- target (simple line)
        else if (
          line.includes(`${source} -- ${target}`) &&
          !line.includes("-->")
        ) {
          edgeFound = true;
          if (newLabel) {
            updatedLine = line.replace(
              `${source} -- ${target}`,
              `${source} -- ${newLabel} --> ${target}`
            );
          }
        }

        // If we found and updated the edge, replace the line
        if (edgeFound && updatedLine !== line) {
          lines[i] = updatedLine;
          replaced = true;
          break; // Stop after finding the first matching edge
        }
      }

      // If we found and replaced something, update the code
      if (replaced) {
        const newCode = lines.join("\n").trim();
        setCode(newCode);
        sessionStorage.setItem("code", newCode);
      } else if (newLabel) {
        // If no existing edge was found but we want to add a label, create a new edge line
        const newEdgeLine = `${source} -->|${newLabel}| ${target}`;
        const newCode = current ? `${current}\n${newEdgeLine}` : newEdgeLine;
        setCode(newCode);
        sessionStorage.setItem("code", newCode);
      }
    },
    [setCode]
  );
  /*** CONVERT MERMAID -> REACTFLOW ***/
  const convertMermaidToReactFlow = useCallback((text, prevNodes = []) => {
    if (!text) return { nodes: [], edges: [] };

    let nodesOut = [];
    let edgesOut = [];

    const nodePositions = new Map();
    const nodeShapes = new Map();

    // Parse position configs
    const lines = text.split("\n");

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      const patterns = [
        /^(\w+)@\{pos:\s*\[(-?\d+),\s*(-?\d+)\]\}$/,
        /^(\w+)@\{[^}]*pos:\s*\[(-?\d+),\s*(-?\d+)\][^}]*\}$/,
        /^(\w+)\s*@\s*\{\s*pos\s*:\s*\[\s*(-?\d+)\s*,\s*(-?\d+)\s*\]\s*\}$/,
      ];

      for (const pattern of patterns) {
        const match = trimmed.match(pattern);
        if (match) {
          const [, id, x, y] = match;
          nodePositions.set(id, {
            x: parseInt(x, 10),
            y: parseInt(y, 10),
          });
          break;
        }
      }

      // Parse shape configs
      const shapeMatch = trimmed.match(
        /(\w+)@\{[^}]*shape:\s*"?([^,}\"]+)"?[^}]*\}/
      );
      if (shapeMatch) {
        nodeShapes.set(shapeMatch[1], shapeMatch[2].trim());
      }
    });

    const prevPosMap = new Map(prevNodes.map((n) => [n.id, n.position]));

    // Parse regular nodes - including those with quoted labels
    const nodePatterns = [
      /([A-Za-z0-9_]+)\[([^\]]+)\]/g,
      /([A-Za-z0-9_]+)\{([^}]+)\}/g,
      /([A-Za-z0-9_]+)\(([^)]+)\)/g,
      /([A-Za-z0-9_]+)\["([^"]+)"\]/g, // Handle quoted labels
    ];

    nodePatterns.forEach((pattern) => {
      let m;
      pattern.lastIndex = 0;
      while ((m = pattern.exec(text)) !== null) {
        const [, id, label] = m;
        if (!nodesOut.find((n) => n.id === id)) {
          const shapeType = nodeShapes.get(id);

          let position = null;
          if (nodePositions.has(id)) {
            position = nodePositions.get(id);
          } else if (prevPosMap.has(id)) {
            position = prevPosMap.get(id);
          }

          const node = {
            id,
            type: shapeType ? "customShape" : "default",
            data: { label: label.trim(), shape: shapeType },
            position: position,
          };

          if (!shapeType) {
            node.style = {
              background: "#fff",
              border: "2px solid #333",
              borderRadius: "5px",
              padding: "10px",
            };
          }

          nodesOut.push(node);
        }
      }
    });

    // Parse subgraph nodes - improved to handle different formats
    const subgraphRegex = /subgraph\s+(\w+)(?:\[.*?\])?\s*([\s\S]*?)(?=end|$)/g;
    let subMatch;
    while ((subMatch = subgraphRegex.exec(text)) !== null) {
      const subgraphId = subMatch[1];
      const content = subMatch[2];

      // Add the subgraph as a node if it has a label
      const subgraphLabelMatch = text.match(
        new RegExp(`subgraph\\s+${subgraphId}\\[(.*?)\\]`)
      );
      if (subgraphLabelMatch) {
        const label = subgraphLabelMatch[1].replace(/"/g, ""); // Remove quotes

        if (!nodesOut.find((n) => n.id === subgraphId)) {
          let position = null;
          if (nodePositions.has(subgraphId)) {
            position = nodePositions.get(subgraphId);
          } else if (prevPosMap.has(subgraphId)) {
            position = prevPosMap.get(subgraphId);
          }

          nodesOut.push({
            id: subgraphId,
            type: "default",
            data: { label: label.trim() },
            position: position,
            style: {
              background: "#e1f5fe",
              border: "2px solid #01579b",
              borderRadius: "10px",
              padding: "15px",
            },
          });
        }
      }

      // Parse nodes within the subgraph
      const nodeRegex = /(\w+)(?:\[([^\]]+)\]|\{([^}]+)\}|\(([^)]+)\))/g;
      let nm;
      const subgraphNodes = [];
      while ((nm = nodeRegex.exec(content)) !== null) {
        subgraphNodes.push(nm[1]);
      }

      // Create edges between consecutive nodes in subgraph
      for (let i = 0; i < subgraphNodes.length - 1; i++) {
        const source = subgraphNodes[i];
        const target = subgraphNodes[i + 1];
        if (!edgesOut.find((e) => e.source === source && e.target === target)) {
          edgesOut.push({
            id: `e${source}-${target}`,
            source,
            target,
            type: "smoothstep",
            style: { stroke: "#000" },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#000" },
          });
        }
      }
    }

    // Parse explicit edges
    const edgePatterns = [
      /(\w+)\s*-->\s*\|([^|]+)\|\s*(\w+)/g,
      /(\w+)\s*--\s*([^->]+)\s*-->\s*(\w+)/g,
      /(\w+)\s*-->\s*(\w+)/g,
      /(\w+)\s*--\s*(\w+)/g,
    ];

    edgePatterns.forEach((pattern) => {
      let m;
      pattern.lastIndex = 0;
      while ((m = pattern.exec(text)) !== null) {
        let source, target, label;
        if (m.length === 4) {
          source = m[1];
          label = m[2] ? m[2].trim() : undefined;
          target = m[3];
        } else if (m.length === 3) {
          source = m[1];
          target = m[2];
          label = undefined;
        }

        if (
          source &&
          target &&
          nodesOut.find((n) => n.id === source) &&
          nodesOut.find((n) => n.id === target)
        ) {
          const edgeId = `e${source}-${target}${
            label ? `-${label.replace(/\s+/g, "-")}` : ""
          }`;
          if (!edgesOut.find((e) => e.id === edgeId)) {
            edgesOut.push({
              id: edgeId,
              source,
              target,
              type: "smoothstep",
              style: { stroke: "#000" },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#000" },
              label: label,
            });
          }
        }
      }
    });

    // Auto-layout nodes without positions
    const nodesWithoutPos = nodesOut.filter(
      (n) => n.position === null || n.position === undefined
    );

    if (nodesWithoutPos.length > 0) {
      const tempEdges = edgesOut.filter(
        (e) =>
          nodesOut.find((n) => n.id === e.source) &&
          nodesOut.find((n) => n.id === e.target)
      );

      const layoutedNodes = applyLayout(nodesWithoutPos, tempEdges, "TB");

      nodesOut = nodesOut.map((n) => {
        if (n.position === null || n.position === undefined) {
          const layoutedNode = layoutedNodes.find((ln) => ln.id === n.id);
          if (layoutedNode) {
            return { ...n, position: layoutedNode.position };
          }
        }
        return n;
      });
    }

    return { nodes: nodesOut, edges: edgesOut };
  }, []);

  // const renderDiagram = async (text, conf) => {
  //   if (!text) return;

  //   // Convert mermaid to react flow nodes/edges
  //   const { nodes: flowNodes, edges: flowEdges } = convertMermaidToReactFlow(
  //     text,
  //     nodes
  //   );

  //   // Apply theme to nodes
  //   const themedNodes = flowNodes.map((node) => {
  //     if (node.type === "customShape") return node;
  //     const nodeThemeName = color.theme.includes("base/")
  //       ? color.theme.split("/")[1]
  //       : color.theme;

  //     const themeStyle = addTheme.find((t) => t.name === nodeThemeName)?.style;
  //     return {
  //       ...node,
  //       style: {
  //         background: themeStyle?.primaryColor || "#fff",
  //         border: `2px solid ${themeStyle?.primaryBorderColor || "#fff"}`,
  //         borderRadius: "5px",
  //         padding: "10px",
  //       },
  //       data: { ...node.data, color: { theme: nodeThemeName } },
  //     };
  //   });

  //   setNodes(themedNodes);
  //   setEdges(flowEdges);
  //   setSvg(null);
  // };
  const renderDiagram = async (text, conf) => {
    if (!text) return;
  
    // Convert mermaid to react flow nodes/edges
    const { nodes: flowNodes, edges: flowEdges } = convertMermaidToReactFlow(
      text,
      nodes
    );
  
    // Apply theme to ALL nodes including custom shapes
    const themedNodes = flowNodes.map((node) => {
      const nodeThemeName = color.theme.includes("base/")
        ? color.theme.split("/")[1]
        : color.theme;
  
      const themeStyle = addTheme.find((t) => t.name === nodeThemeName)?.style;
      
      if (node.type === "customShape") {
        // Apply theme to custom shapes
        return {
          ...node,
          data: { 
            ...node.data, 
            color: {
              primaryColor: themeStyle?.primaryColor || "#71BBB2",
              primaryBorderColor: themeStyle?.primaryBorderColor || "#497D74"
            }
          },
        };
      } else {
        // Apply theme to regular nodes
        return {
          ...node,
          style: {
            background: themeStyle?.primaryColor || "#fff",
            border: `2px solid ${themeStyle?.primaryBorderColor || "#fff"}`,
            borderRadius: "5px",
            padding: "10px",
          },
          data: { ...node.data, color: { theme: nodeThemeName } },
        };
      }
    });
  
    setNodes(themedNodes);
    setEdges(flowEdges);
    setSvg(null);
  };
  /*** NODE DOUBLE CLICK (edit label) ***/
  const onNodeDoubleClick = useCallback(
    (event, node) => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = node.data.label || "";
      Object.assign(input.style, {
        position: "fixed",
        left: `${event.clientX}px`,
        top: `${event.clientY}px`,
        width: "220px",
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
        if (input.value !== node.data.label) {
          updateCode(node.data.label, input.value, node.id);
        }
        cleanup();
      };

      input.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          save(); // ONLY save, DO NOT delete
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
    [updateCode]
  );

  /*** EDGE DOUBLE CLICK (edit label) ***/
  const onEdgeDoubleClick = useCallback(
    (event, edge) => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = edge.label || "";
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
        setEdges((eds) =>
          eds.map((ed) =>
            ed.id === edge.id ? { ...ed, label: newLabel || undefined } : ed
          )
        );
        // Pass the current label (edge.label) as oldLabel and newLabel
        updateEdgeInCode(edge.source, edge.target, edge.label || "", newLabel);
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
    [setEdges, updateEdgeInCode]
  );

  /*** CONNECT (ADD EDGE) with label prompt ***/
  const onConnect = useCallback(
    (params) => {
      const source = params.source;
      const target = params.target;
      const edgeId = `e${source}-${target}-${Date.now()}`;

      // Prevent identical edge (source->target) duplicates without unique id
      if (
        edgesRef.current.find(
          (e) =>
            e.source === source &&
            e.target === target &&
            !e.id.includes(Date.now())
        )
      ) {
        // allow duplicates if created earlier with different id, but here we just add unique id
      }

      const newEdge = {
        id: edgeId,
        source,
        target,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#000" },
        style: { stroke: "#000" },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      setDeletedEdgeIds((prev) => prev.filter((id) => id !== edgeId));

      // Add to code (simple edge initially)
      const edgeCode = `${source} --> ${target}`;
      if (!codeRef.current.includes(edgeCode)) {
        const newCode = codeRef.current
          ? `${codeRef.current}\n${edgeCode}`
          : edgeCode;
        setCode(newCode);
        sessionStorage.setItem("code", newCode);
      }

      // Place input roughly in center of viewport
      const input = document.createElement("input");

      const cleanup = () => {
        if (document.body.contains(input)) document.body.removeChild(input);
      };

      input.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const label = input.value.trim();
          // Update reactflow edge label
          setEdges((eds) =>
            eds.map((ed) =>
              ed.id === edgeId ? { ...ed, label: label || undefined } : ed
            )
          );
          // Update code text
          if (label) {
            updateEdgeInCode(source, target, "", label);
          }
          cleanup();
        }
        if (e.key === "Escape") cleanup();
      };

      input.onblur = cleanup;
    },
    [setEdges, updateEdgeInCode]
  );
  const onNodeDragStop = useCallback(
    async (event, node) => {
      const newX = Math.round(node.position.x);
      const newY = Math.round(node.position.y);

      const currentCode = codeRef.current || "";
      const isERDiagram = currentCode.trim().startsWith("erDiagram");
      const isFlowchart =
        currentCode.trim().startsWith("graph") ||
        currentCode.trim().startsWith("flowchart");

      let newCode = currentCode;

      if (isFlowchart) {
        // Flowchart position handling
        const newPosConfig = `${node.id}@{pos: [${newX}, ${newY}]}`;
        const lines = newCode.split("\n");
        let positionUpdated = false;

        const updatedLines = lines.map((line) => {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith(`${node.id}@{pos:`)) {
            positionUpdated = true;
            return newPosConfig;
          }
          return line;
        });

        if (!positionUpdated) {
          updatedLines.push(newPosConfig);
        }

        newCode = updatedLines.filter((line) => line.trim() !== "").join("\n");
      } else if (isERDiagram) {
        // ER Diagram position handling - use a different approach
        // Since ER diagrams don't support @{pos:} syntax, we need to store positions separately
        // or use a different format that won't conflict with ER syntax
        console.log(
          "ER Diagram node moved - positions not saved in diagram syntax"
        );
        return; // Don't modify the code for ER diagrams
      } else {
        // Default handling for other diagram types
        const newPosConfig = `${node.id}@{pos: [${newX}, ${newY}]}`;
        const lines = newCode.split("\n");
        let positionUpdated = false;

        const updatedLines = lines.map((line) => {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith(`${node.id}@{pos:`)) {
            positionUpdated = true;
            return newPosConfig;
          }
          return line;
        });

        if (!positionUpdated) {
          updatedLines.push(newPosConfig);
        }

        newCode = updatedLines.filter((line) => line.trim() !== "").join("\n");
      }

      setCode(newCode);
      sessionStorage.setItem("code", newCode);

      // Save immediately
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
  // const onNodeDragStop = useCallback(
  //   async (event, node) => {
  //     const newX = Math.round(node.position.x);
  //     const newY = Math.round(node.position.y);
  //     const newPosConfig = `${node.id}@{pos: [${newX}, ${newY}]}`;

  //     let newCode = codeRef.current || "";
  //     const lines = newCode.split("\n");
  //     let positionUpdated = false;

  //     const updatedLines = lines.map((line) => {
  //       const trimmedLine = line.trim();
  //       if (trimmedLine.startsWith(`${node.id}@{pos:`)) {
  //         positionUpdated = true;
  //         return newPosConfig;
  //       }
  //       return line;
  //     });

  //     if (!positionUpdated) {
  //       updatedLines.push(newPosConfig);
  //     }

  //     newCode = updatedLines.filter((line) => line.trim() !== "").join("\n");

  //     setCode(newCode);
  //     sessionStorage.setItem("code", newCode);

  //     // Save immediately, don't wait
  //     if (id) {
  //       try {
  //         await axiosInstance.put(`/api/flowchart/${id}`, {
  //           mermaidString: newCode,
  //         });
  //         console.log(
  //           `Position saved immediately for ${node.id}: [${newX}, ${newY}]`
  //         );
  //       } catch (error) {
  //         console.error("Error saving position:", error);
  //       }
  //     }
  //   },
  //   [setCode, id]
  // );

  const deleteNodeFromCode = (nodeId, code) => {
    let newCode = code;

    // Remove subgraph blocks
    const subgraphRegex = new RegExp(
      `subgraph\\s+${nodeId}(?:\\[[^\\]]*\\])?[\\s\\S]*?end`,
      "g"
    );
    newCode = newCode.replace(subgraphRegex, "");

    // Handle normal node definitions and configs
    const lines = newCode.split("\n");
    const linesToKeep = [];
    let skipNextLine = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (
        line.startsWith(`${nodeId}[`) ||
        line.startsWith(`${nodeId}{`) ||
        line.startsWith(`${nodeId}(`) ||
        line.startsWith(`${nodeId}@`) ||
        line === nodeId
      ) {
        if (line.startsWith(`${nodeId}@{`) && !line.includes("}")) {
          skipNextLine = true;
          continue;
        }
        continue;
      }

      if (skipNextLine) {
        if (line.includes("}")) {
          skipNextLine = false;
        }
        continue;
      }

      linesToKeep.push(lines[i]);
    }

    newCode = linesToKeep.join("\n");

    // Remove edges connected to this node
    const edgePatterns = [
      new RegExp(`^\\s*${nodeId}\\s*--[^>\\n]*>\\s*\\w+.*$`, "gm"),
      new RegExp(`^\\s*\\w+\\s*--[^>\\n]*>\\s*${nodeId}.*$`, "gm"),
      new RegExp(`^\\s*${nodeId}\\s*--\\s*\\w+.*$`, "gm"),
      new RegExp(`^\\s*\\w+\\s*--\\s*${nodeId}.*$`, "gm"),
    ];

    edgePatterns.forEach((pattern) => {
      newCode = newCode.replace(pattern, "");
    });

    return newCode;
  };

  /*** ON NODES DELETE (keep code in sync) ***/
  const onNodesDelete = useCallback(
    (deletedNodes) => {
      const deletedIds = deletedNodes.map((n) => n.id);
      setDeletedNodeIds((prev) => [...prev, ...deletedIds]);
      let newCode = codeRef.current || "";

      deletedIds.forEach((id) => {
        // Use the specialized function for complex node deletion
        newCode = deleteNodeFromCode(id, newCode);
      });

      // Clean up empty lines and multiple consecutive empty lines
      newCode = newCode
        .split("\n")
        .filter((l) => l.trim() !== "")
        .join("\n")
        .trim();

      // Also remove any trailing whitespace from each line
      newCode = newCode
        .split("\n")
        .map((line) => line.trim())
        .join("\n");

      setCode(newCode);
      sessionStorage.setItem("code", newCode);
    },
    [setCode]
  );

  /*** ON EDGES DELETE ***/
  const onEdgesDelete = useCallback(
    (deletedEdges) => {
      const deletedIds = deletedEdges.map((e) => e.id);
      setDeletedEdgeIds((prev) => [...prev, ...deletedIds]);

      let newCode = codeRef.current || "";

      deletedEdges.forEach((edge) => {
        const { source, target, label } = edge;
        const patterns = [
          `^\\s*${source}\\s*-->\\s*${target}.*$`,
          label
            ? `^\\s*${source}\\s*--\\s*${escapeRegExp(
                label
              )}\\s*-->\\s*${target}.*$`
            : null,
          `^\\s*${source}\\s*--\\s*${target}.*$`,
          label
            ? `^\\s*${source}\\s*-->\\s*\\|${escapeRegExp(
                label
              )}\\|\\s*${target}.*$`
            : null,
        ].filter(Boolean);

        patterns.forEach((p) => {
          const regex = new RegExp(p, "gm");
          newCode = newCode.replace(regex, "");
        });
      });

      newCode = newCode
        .split("\n")
        .filter((l) => l.trim() !== "")
        .join("\n")
        .trim();
      setCode(newCode);
      sessionStorage.setItem("code", newCode);
    },
    [setCode]
  );

  /*** CLEANUP DELETED IDS WHEN CODE CHANGES ***/
  useEffect(() => {
    if (!validateCode) return;
    setDeletedNodeIds((prev) =>
      prev.filter((id) => {
        const nodePatterns = [
          new RegExp(`^\\s*${id}\\[`),
          new RegExp(`^\\s*${id}\\{`),
          new RegExp(`^\\s*${id}\\(`),
          new RegExp(`^\\s*${id}@\\{`),
        ];
        return !nodePatterns.some((p) => p.test(validateCode));
      })
    );

    setDeletedEdgeIds((prev) =>
      prev.filter((id) => {
        const match = id.match(/^e(\w+)-(\w+)(?:-([^-]+))?$/);
        if (!match) return false;
        const [, source, target] = match;
        const edgePatterns = [
          new RegExp(`^\\s*${source}\\s*-->\\s*${target}`),
          new RegExp(`^\\s*${source}\\s*--\\s*${target}`),
        ];
        return !edgePatterns.some((p) => p.test(validateCode));
      })
    );
  }, [validateCode]);

  /*** VALIDATE EFFECT ***/
  useEffect(() => {
    if (typeof window !== "undefined" && (autoSync || updateDiagram)) {
      setValidateCodeAndConfig(debounceCode, debounceConfig);
      if (updateDiagram) setUpdateDiagram(false);
    }
  }, [debounceCode, debounceConfig, autoSync, updateDiagram, color.theme]);

  /*** RENDER EFFECT ***/
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      validateCode &&
      !validateCode.startsWith("Syntax error")
    ) {
      renderDiagram(validateCode, validateConfig);
    }
  }, [validateCode, validateConfig, color.theme, fontSizes]);

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }) => {
      if (selectedNodes && selectedNodes.length > 0) {
        const node = selectedNodes[0];
        // Get the actual DOM element position
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
        } else {
          // Fallback to calculated position
          setSelectedElement({
            type: "node",
            data: node,
            screenPosition: {
              x: reactFlowBounds
                ? reactFlowBounds.left + node.position.x
                : node.position.x,
              y: reactFlowBounds
                ? reactFlowBounds.top + node.position.y
                : node.position.y,
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
    [reactFlowBounds, mousePosition]
  );

  /*** HANDLE DELETE CLICK (toolbar) ***/
  const handleDeleteSelected = useCallback(() => {
    if (!selectedElement) return;
    if (selectedElement.type === "node") {
      const id = selectedElement.data.id;
      setNodes((nds) => nds.filter((n) => n.id !== id));
      onNodesDelete([{ id }]);
      setSelectedElement(null);
    } else if (selectedElement.type === "edge") {
      const edge = selectedElement.data;
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      onEdgesDelete([edge]);
      setSelectedElement(null);
    }
  }, [selectedElement, setNodes, setEdges, onNodesDelete, onEdgesDelete]);

  /*** HANDLE EDIT CLICK (open edit inputs programmatically) ***/
  const handleEditSelected = useCallback(() => {
    if (!selectedElement) return;

    if (selectedElement.type === "node") {
      // Use the screen position we already calculated for the toolbar
      const screenX = selectedElement.screenPosition.x;
      const screenY = selectedElement.screenPosition.y;

      const input = document.createElement("input");
      input.type = "text";
      input.value = selectedElement.data.data?.label || "";
      Object.assign(input.style, {
        position: "fixed",
        left: `${screenX - 110}px`, // Center the input relative to the toolbar
        top: `${screenY - 35}px`, // Position it just above the toolbar
        width: "220px",
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
        if (input.value !== selectedElement.data.data?.label) {
          updateCode(
            selectedElement.data.data?.label,
            input.value,
            selectedElement.data.id
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
    } else if (selectedElement.type === "edge") {
      // For edges, use the mouse position
      const input = document.createElement("input");
      input.type = "text";
      input.value = selectedElement.data.label || "";
      Object.assign(input.style, {
        position: "fixed",
        left: `${selectedElement.screenPosition.x - 110}px`,
        top: `${selectedElement.screenPosition.y - 35}px`,
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
        setEdges((eds) =>
          eds.map((ed) =>
            ed.id === selectedElement.data.id
              ? { ...ed, label: newLabel || undefined }
              : ed
          )
        );
        updateEdgeInCode(
          selectedElement.data.source,
          selectedElement.data.target,
          selectedElement.data.label || "",
          newLabel
        );
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
    }
  }, [selectedElement, updateCode, setEdges, updateEdgeInCode]);

  /*** RENDER ***/
  if (validateCode.startsWith("Syntax error")) {
    return (
      <Box
        ref={chartRef}
        component="div"
        sx={{
          height: "100vh !important",
          // backgroundImage: `url(\"${color.image.src}\")`,
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
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}
    >
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
          <Tooltip title={`Edit ${selectedElement.type} label`}>
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

          <Tooltip title={`Delete ${selectedElement.type}`}>
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
        </Box>
      )}

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
        nodeTypes={nodeTypes}
        onInit={setReactFlowInstance}
        onSelectionChange={onSelectionChange}
        connectionLineType={ConnectionLineType.SmoothStep}
        onEdgeClick={onEdgeClick}
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
      >
        <Background />
        <Controls
          style={{
            position: "absolute",
            top: "80%",
            left: "10px",
            transform: "translateY(-50%)",
            zIndex: 1001,
          }}
        />
      </ReactFlow>
    </Box>
  );
};

const View = (props) => (
  <ReactFlowProvider>
    <FlowView {...props} />
  </ReactFlowProvider>
);

export default View;