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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  ConnectionMode,
  MarkerType,
  Handle,
  Position,
  StraightEdge,
  SmoothStepEdge,
  StepEdge,
  BezierEdge,
  reconnectEdge,
  useReactFlow,
  NodeResizer,
  ReactFlowProvider,
  useUpdateNodeInternals,
} from "reactflow";
import "reactflow/dist/style.css";
import { useStore } from "@/store";
import { ChartContext } from "@/app/layout";
import { useParams } from "next/navigation";
import Image from "next/image";

import {
  detectServiceType,
  serviceMappings,
} from "@/constants/cloudIconMapper";
import { FaServer } from "react-icons/fa";
import DiagramStylePanel from "@/components/diagram-styling/DiagramStylePanel";
import NodeEditorPanel from "@/components/diagram-styling/NodeEditorPanel";
import ColorPickerGrid from "@/components/common/ColorPickerGrid";
import { useDiagramStore } from "@/store/diagramStore";
import { useEdgePointerRouting } from "./hooks/useEdgePointerRouting";
import { HANDLE_POSITIONS, DEFAULT_TEXT_SIZES, createHandleStyle, CAPTURE_EVENTS, BUBBLE_EVENTS } from "./constants/nodeConstants";
import "./styles/NodeStyles.css";
import { useArchitectureStore } from "@/store/architectureStore";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";

const NodeActionsContext = React.createContext({});

const GroupHoverContext = React.createContext({
  hoveredGroupId: null,
});

const CloudIcon = ({ serviceType, size = 120, className = "" }) => {
  try {
    const { icon: IconComponent } = detectServiceType(serviceType);

    if (
      IconComponent &&
      typeof IconComponent === "object" &&
      IconComponent.src
    ) {
      return (
        <Image
          src={IconComponent}
          alt={serviceType || "cloud service"}
          width={size}
          height={size}
          className={className}
          style={{ width: size, height: size }}
        />
      );
    }

    if (IconComponent && typeof IconComponent === "function") {
      return <IconComponent size={size} className={className} />;
    }

    console.warn(`Invalid icon for service type: ${serviceType}`);
    return <FaServer size={size} className={className} />;
  } catch (error) {
    console.error("Error rendering CloudIcon:", error);
    return <FaServer size={size} className={className} />;
  }
};

const CustomEdge = (props) => {
  const mergedStyle = { ...(props.style || {}) };
  if (!mergedStyle.stroke) mergedStyle.stroke = "#000000";
  if (!mergedStyle.strokeWidth) mergedStyle.strokeWidth = 2;

  return (
    <BezierEdge
      {...props}
      style={mergedStyle}
      markerEnd={props.markerEnd}
    />
  );
};

const edgeTypes = {
  custom: CustomEdge,
  bezier: CustomEdge,  // Map "bezier" to our custom edge to avoid warnings
  straight: StraightEdge,
  step: StepEdge,
  smoothstep: SmoothStepEdge,
};

const HANDLE_TO_CHAR = {
  left: "l",
  right: "r",
  top: "t",
  bottom: "b",
};

const CHAR_TO_HANDLE = {
  l: "left",
  r: "right",
  t: "top",
  b: "bottom",
};

const escapeRegExp = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getHandleChar = (handle, fallback) => {
  if (!handle) return fallback;
  const normalized = handle.toLowerCase();
  return HANDLE_TO_CHAR[normalized] || fallback;
};

const buildConnectionLine = (edgeLike) => {
  const sourceChar = getHandleChar(edgeLike.sourceHandle, "r");
  const targetChar = getHandleChar(edgeLike.targetHandle, "l");
  return `${edgeLike.source}:${sourceChar} -- ${targetChar}:${edgeLike.target}`;
};

const buildConnectionRegex = (edgeLike) => {
  const sourceChar = getHandleChar(edgeLike.sourceHandle, "r");
  const targetChar = getHandleChar(edgeLike.targetHandle, "l");
  return new RegExp(
    `^${escapeRegExp(edgeLike.source)}\\s*:\\s*${sourceChar}\\s*--\\s*${targetChar}\\s*:\\s*${escapeRegExp(
      edgeLike.target
    )}\\s*$`,
    "i"
  );
};

const GroupNode = React.memo(({ data, selected }) => {
  const { hoveredGroupId } = useContext(GroupHoverContext);
  const groupRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  // Use extracted hook for pointer/edge routing
  const { handlePointerEvent, endPointerPassThrough } = useEdgePointerRouting();

  // Setup event listeners for edge routing
  useEffect(() => {
    const wrapper = groupRef.current?.closest(".react-flow__node");
    if (!wrapper) return;
    wrapperRef.current = wrapper;

    const onPointerEvent = (event) => handlePointerEvent(event, wrapper);

    // Use capture phase for hover events, bubble for drag/click
    CAPTURE_EVENTS.forEach((evt) => wrapper.addEventListener(evt, onPointerEvent, true));
    BUBBLE_EVENTS.forEach((evt) => wrapper.addEventListener(evt, onPointerEvent, false));

    return () => {
      CAPTURE_EVENTS.forEach((evt) => wrapper.removeEventListener(evt, onPointerEvent, true));
      BUBBLE_EVENTS.forEach((evt) => wrapper.removeEventListener(evt, onPointerEvent, false));
      if (wrapperRef.current === wrapper) wrapperRef.current = null;
      endPointerPassThrough();
    };
  }, [handlePointerEvent, endPointerPassThrough]);

  const textSizes = DEFAULT_TEXT_SIZES.group;

  // Individual style overrides global style
  const individualStyle = data?.individualStyle || {};
  const globalStyle = data?.customStyle || {};
  const custom = { ...globalStyle, ...individualStyle };
  const backgroundColor = "transparent"; // Always transparent for groups
  const textColor = custom.textColor || "#000000";
  const fontFamily = custom.fontFamily || "Arial, sans-serif";
  const fontSize = custom.fontSize || textSizes.nodeFontSize;
  const fontWeight = custom.fontWeight || "normal";


  return (
    <div
      ref={groupRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
     
      style={{
     
       
        width: "100%",
        height: "100%",
        textAlign: "center",
        fontFamily: fontFamily,
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: textColor,
        background: backgroundColor,
      
      }}
    >
      <NodeResizer
        color="#667eea"
        isVisible={selected || isHovering}
        minWidth={180}
        minHeight={140}
      />
      <div
        className="drag-handle"
        style={{
          userSelect: "none",
          display: "inline-block",
          cursor: "grab",
          padding: "4px 8px",
          position: "relative",
          zIndex: 1,
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            marginBottom: "8px",
            fontSize: textSizes.typeFontSize,
            color: "#000000",
            textTransform: "uppercase",
            borderBottom: "2px solid #000000",
            paddingBottom: "8px",
            pointerEvents: "auto",
          }}
        >
          &lt;&lt;{data.groupData.type}&gt;&gt;
        </div>

        <div
          style={{
            fontWeight: "700",
            marginBottom: "8px",
            fontSize: textSizes.labelFontSize,
            color: "#000000",
            fontFamily: "monospace",
            lineHeight: "1.2",
            pointerEvents: "auto",
          }}
        >
          {data.groupData.label}
        </div>
      </div>

      {/* DRY: Map handles instead of 8 manual components */}
      {HANDLE_POSITIONS.flatMap(({ position, id }) => [
        <Handle
          key={`${id}-target`}
          type="target"
          position={position}
          id={id}
          style={createHandleStyle(selected || isHovering, textSizes.handleSize)}
        />,
        <Handle
          key={`${id}-source`}
          type="source"
          position={position}
          id={id}
          style={createHandleStyle(selected || isHovering, textSizes.handleSize)}
        />,
      ])}
    </div>
  );
});

const ServiceNode = React.memo(({ data, selected }) => {
  const [isHovering, setIsHovering] = useState(false);
  const serviceInfo = detectServiceType(data.serviceData.icon || data.serviceData.type);

  const getServiceStyle = (serviceInfo) => {
    const baseStyle = {
      border: "2px solid",
      background: "transparent",
      borderColor: serviceInfo.color,
    };

    const normalizedType = data.serviceData.type?.toLowerCase();

    if (
      normalizedType?.includes("disk") ||
      normalizedType?.includes("storage")
    ) {
      return { ...baseStyle, borderStyle: "groove" };
    }

    switch (normalizedType) {
      case "cloud":
        return { ...baseStyle, borderStyle: "dotted" };
      case "database":
        return { ...baseStyle, borderStyle: "double" };
      case "server":
        return { ...baseStyle, borderStyle: "solid" };
      case "machine":
        return { ...baseStyle, borderStyle: "solid" };
      case "api":
        return { ...baseStyle, borderStyle: "dashed" };
      case "queue":
        return { ...baseStyle, borderStyle: "ridge" };
      default:
        return { ...baseStyle, borderStyle: "solid" };
    }
  };

  const style = getServiceStyle(serviceInfo);

  // Individual style overrides global style
  const individualStyle = data?.individualStyle || {};
  const globalStyle = data?.customStyle || {};
  const custom = { ...globalStyle, ...individualStyle };

  if (custom.borderColor || custom.outlineColor) {
    style.borderColor = custom.borderColor || custom.outlineColor;
  }
  if (custom.backgroundColor) {
    style.background = custom.backgroundColor;
  }
  if (custom.borderStyle) {
    style.borderStyle = custom.borderStyle;
  }
  if (custom.borderWidth) {
    style.borderWidth = `${custom.borderWidth}px`;
  }
  if (custom.borderRadius) {
    style.borderRadius = `${custom.borderRadius}px`;
  }

  const textSizes = {
    iconSize: 64,
    providerFontSize: "10px",
    typeFontSize: "11px",
    labelFontSize: "14px",
    nodeFontSize: "12px",
  };

  const animation = custom.animation || 'none';

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={animation !== 'none' ? animation : ''}
      style={{
        padding: "12px",
        background: style.background,
        border: `${style.borderWidth || "2px"} ${style.borderStyle} ${style.borderColor}`,
        borderRadius: style.borderRadius || "8px",
        width: "100%",
        height: "100%",
        minWidth: "180px",
        minHeight: "100px",
        textAlign: "center",
        boxShadow: selected
          ? "0 4px 8px rgba(0,0,0,0.3)"
          : "0 2px 4px rgba(0,0,0,0.2)",
        fontFamily: custom.fontFamily || "Arial, sans-serif",
        position: "relative",
        fontSize: custom.fontSize || textSizes.nodeFontSize,
        fontWeight: custom.fontWeight || "normal",
        color: custom.textColor || "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transition: "all 0.2s ease",
        cursor: "move",
        userSelect: "none",
      }}
    >
      <NodeResizer
        color="#667eea"
        isVisible={selected || isHovering}
        minWidth={180}
        minHeight={100}
      />
      <div
        style={{
          marginBottom: "8px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <CloudIcon
          serviceType={data.serviceData.icon || data.serviceData.type}
          size={textSizes.iconSize}
        />
        <div
          style={{
            fontSize: textSizes.providerFontSize,
            background: serviceInfo.color,
            color: "white",
            padding: "2px 6px",
            borderRadius: "10px",
            marginTop: "4px",
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        >
          {serviceInfo.provider}
        </div>
      </div>

      <div
        style={{
          fontWeight: "bold",
          marginBottom: "6px",
          fontSize: textSizes.typeFontSize,
          color: style.borderColor || serviceInfo.color,
          textTransform: "uppercase",
          borderBottom: `1px solid ${style.borderColor || serviceInfo.color}`,
          paddingBottom: "4px",
          width: "100%",
        }}
      >
        {data.serviceData.type}
      </div>

      <div
        style={{
          fontWeight: "700",
          marginBottom: "6px",
          fontSize: textSizes.labelFontSize,
          color: "#000000",
          fontFamily: "monospace",
          lineHeight: "1.2",
        }}
      >
        {data.serviceData.label}
      </div>

      {/* DRY: Map handles using shared constants */}
      {HANDLE_POSITIONS.flatMap(({ position, id }) => [
        <Handle
          key={`${id}-target`}
          type="target"
          position={position}
          id={id}
          style={createHandleStyle(true, DEFAULT_TEXT_SIZES.service.handleSize, serviceInfo.color)}
        />,
        <Handle
          key={`${id}-source`}
          type="source"
          position={position}
          id={id}
          style={createHandleStyle(true, DEFAULT_TEXT_SIZES.service.handleSize, serviceInfo.color)}
        />,
      ])}
    </div>
  );
});

const nodeTypes = {
  group: GroupNode,
  service: ServiceNode,
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

const EditPanel = ({ selectedNode, onSave, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({});

  const serviceTypes = Object.keys(serviceMappings).sort();

  useEffect(() => {
    if (selectedNode) {
      if (selectedNode.data.nodeType === "group") {
        setFormData({
          label: selectedNode.data.groupData.label,
          type: selectedNode.data.groupData.type,
          outlineColor: selectedNode.data.customStyle?.outlineColor || "",
          backgroundColor: selectedNode.data.customStyle?.backgroundColor || "",
          borderStyle: selectedNode.data.customStyle?.borderStyle || "",
        });
      } else if (selectedNode.data.nodeType === "service") {
        setFormData({
          label: selectedNode.data.serviceData.label,
          type: selectedNode.data.serviceData.type,
          outlineColor: selectedNode.data.customStyle?.outlineColor || "",
          backgroundColor: selectedNode.data.customStyle?.backgroundColor || "",
          borderStyle: selectedNode.data.customStyle?.borderStyle || "",
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

  const getIconUrl = (serviceType) => {
    const mapping = serviceMappings[serviceType];
    if (mapping && mapping.icon) {
      if (typeof mapping.icon === "object" && mapping.icon.src) {
        return mapping.icon.src;
      }
      if (typeof mapping.icon === "string") {
        return mapping.icon;
      }
    }
    return null;
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
          Edit {nodeType}: {formData.label || selectedNode.id}
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

        {nodeType === "service" ? (
          <FormControl size="small" fullWidth>
            <InputLabel>Service Type</InputLabel>
            <Select
              value={formData.type || ""}
              label="Service Type"
              onChange={(e) => handleChange("type", e.target.value)}
              renderValue={(selected) => {
                const iconUrl = getIconUrl(selected);
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {iconUrl && (
                      <img
                        src={iconUrl}
                        alt={selected}
                        style={{ width: 20, height: 20 }}
                      />
                    )}
                    {selected}
                  </Box>
                );
              }}
            >
              {serviceTypes.map((serviceType) => {
                const iconUrl = getIconUrl(serviceType);
                return (
                  <MenuItem key={serviceType} value={serviceType}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {iconUrl && (
                        <img
                          src={iconUrl}
                          alt={serviceType}
                          style={{ width: 20, height: 20 }}
                        />
                      )}
                      <Typography>{serviceType}</Typography>
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
            <FormHelperText>
              Select from available Azure service types
            </FormHelperText>
          </FormControl>
        ) : (
          <TextField
            label="Group Type"
            size="small"
            value={formData.type || ""}
            onChange={(e) => handleChange("type", e.target.value)}
            placeholder="e.g., azure, aws, gcp, network-hub"
            helperText="Common groups: azure, aws, gcp, iot-system, data-platform, ai-platform, network-hub"
          />
        )}

        {/* Outline Color Picker */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "#4B5563" }}>
            Outline Color
          </Typography>
          <ColorPickerGrid
            colorType="border"
            selectedColor={formData.outlineColor || "#000000"}
            onColorSelect={(color) => handleChange("outlineColor", color)}
          />
        </Box>

        {/* Background Color Picker */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "#4B5563" }}>
            Background Color
          </Typography>
          <ColorPickerGrid
            colorType="node"
            selectedColor={formData.backgroundColor || "#FFFFFF"}
            onColorSelect={(color) => handleChange("backgroundColor", color)}
          />
        </Box>

        {/* Border Style */}
        <FormControl size="small" fullWidth>
          <InputLabel id="border-style-label">Border Style</InputLabel>
          <Select
            labelId="border-style-label"
            label="Border Style"
            value={formData.borderStyle || ""}
            onChange={(e) => handleChange("borderStyle", e.target.value)}
          >
            <MenuItem value="">Default</MenuItem>
            <MenuItem value="solid">Solid</MenuItem>
            <MenuItem value="dashed">Dashed</MenuItem>
            <MenuItem value="dotted">Dotted</MenuItem>
            <MenuItem value="double">Double</MenuItem>
            <MenuItem value="groove">Groove</MenuItem>
            <MenuItem value="ridge">Ridge</MenuItem>
          </Select>
        </FormControl>

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

const ArchitectureDiagramView = () => {
  const { chartRef } = useContext(ChartContext);
  const code = useStore.use.code();
  const setCode = useStore.use.setCode();
  const setSvg = useStore.use.setSvg();
  const { id } = useParams();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesStateChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [hoveredGroupId, setHoveredGroupId] = useState(null);
  const updatingEdgeIdRef = useRef(null);
  const [isUpdatingEdge, setIsUpdatingEdge] = useState(false);

  const [preventRerender, setPreventRerender] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Zustand diagram store - for global and individual node/edge styles
  const PAGE_NAME = 'architecture-view';
  const globalStyles = useDiagramStore((state) => state.globalStyles);
  const setGlobalStyles = useDiagramStore((state) => state.setGlobalStyles);
  const setNodeStyle = useDiagramStore((state) => state.setNodeStyle);
  const setEdgeStyle = useDiagramStore((state) => state.setEdgeStyle);
  const getNodeStyle = useDiagramStore((state) => state.getNodeStyle);
  const getEdgeStyle = useDiagramStore((state) => state.getEdgeStyle);

  // Architecture data store - for CRUD operations
  const architectureData = useArchitectureStore((state) => state.architectureData);
  const addGroup = useArchitectureStore((state) => state.addGroup);
  const updateGroup = useArchitectureStore((state) => state.updateGroup);
  const deleteGroup = useArchitectureStore((state) => state.deleteGroup);
  const addService = useArchitectureStore((state) => state.addService);
  const updateService = useArchitectureStore((state) => state.updateService);
  const deleteService = useArchitectureStore((state) => state.deleteService);
  const addEdgeToStore = useArchitectureStore((state) => state.addEdge);
  const deleteEdgeFromStore = useArchitectureStore((state) => state.deleteEdge);
  const setArchitectureData = useArchitectureStore((state) => state.setArchitectureData);

  // Zundo temporal store for undo/redo (renamed to avoid conflict with main store)
  const { undo: archUndo, redo: archRedo, pastStates, futureStates } = useArchitectureStore.temporal.getState();
  const archCanUndo = pastStates.length > 0;
  const archCanRedo = futureStates.length > 0;

  // Force re-render on temporal state changes
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const unsubscribe = useArchitectureStore.temporal.subscribe(() => {
      forceUpdate({});
    });
    return () => unsubscribe();
  }, []);

  // Refs for sync management (prevent infinite loops)
  const isSyncingRef = useRef(false);
  const lastSyncedCodeRef = useRef('');
  const [loading, setLoading] = useState(true);

  // Editor panel state for individual styling
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedStyleNode, setSelectedStyleNode] = useState(null);
  const [selectedStyleEdge, setSelectedStyleEdge] = useState(null);

  // Connection mode state
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionSource, setConnectionSource] = useState(null);

  // Service creation mode
  const [createServiceMode, setCreateServiceMode] = useState(false);

  // Group action toolbar state
  const [groupToolbarVisible, setGroupToolbarVisible] = useState(false);
  const [groupToolbarPosition, setGroupToolbarPosition] = useState(null);
  const [selectedGroupForToolbar, setSelectedGroupForToolbar] = useState(null);
  const [preSelectedGroupId, setPreSelectedGroupId] = useState('');

  // Service action toolbar state
  const [serviceToolbarVisible, setServiceToolbarVisible] = useState(false);
  const [serviceToolbarPosition, setServiceToolbarPosition] = useState(null);
  const [selectedServiceForToolbar, setSelectedServiceForToolbar] = useState(null);

  // Drag and drop confirmation state
  const dragStartStateRef = useRef(null);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState(null);

  const reactFlow = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const codeRef = useRef(code);
  codeRef.current = code;
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const autoSaveTimerRef = useRef(null);
  const hasLoadedRef = useRef(false);

  // History management for undo/redo - using global store
  const pushToHistory = useStore((state) => state.pushToHistory);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const canUndo = useStore((state) => state.canUndo);
  const canRedo = useStore((state) => state.canRedo);
  const clearHistory = useStore((state) => state.clearHistory);
  const isApplyingHistory = useStore((state) => state.isApplyingHistory);
  const shouldPushHistoryOnParse = useStore((state) => state.shouldPushHistoryOnParse);

  // Sync: Architecture Store → Main Code Store (when visual diagram changes via store)
  useEffect(() => {
    if (isSyncingRef.current || !architectureData) return;
    if (architectureData === lastSyncedCodeRef.current) return;

    isSyncingRef.current = true;
    lastSyncedCodeRef.current = architectureData;
    setCode(architectureData);
    setSvg(null);

    // Trigger auto-save when visual diagram changes (2 second debounce)
    if (hasLoadedRef.current && id && id !== 'new') {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          await axiosInstance.put(`/api/flowchart/${id}`, {
            mermaidString: architectureData
          });
          console.log('Auto-saved successfully');
        } catch (error) {
          console.error('Auto-save error:', error);
        }
      }, 2000);
    }

    setTimeout(() => {
      isSyncingRef.current = false;
    }, 50);
  }, [architectureData, setCode, setSvg, id]);

  // Sync: Main Code Store → Architecture Store (when code editor changes)
  useEffect(() => {
    if (isSyncingRef.current || !code) return;
    if (!code.includes('architecture-beta')) return;
    if (code === lastSyncedCodeRef.current) return;
    if (code === architectureData) return;

    isSyncingRef.current = true;
    lastSyncedCodeRef.current = code;
    setArchitectureData(code);
    hasLoadedRef.current = true;

    setTimeout(() => {
      isSyncingRef.current = false;
    }, 50);
  }, [code, architectureData, setArchitectureData]);

  // Initialize from existing code in store (MermaidEditor handles the fetch)
  useEffect(() => {
    if (code && code.includes('architecture-beta')) {
      setArchitectureData(code);
      hasLoadedRef.current = true;
    }
    setLoading(false);
  }, []);

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Save to backend (silent for auto-save)
  const saveToBackend = useCallback(async (showToast = true) => {
    if (!id || id === 'new') {
      if (showToast) toast.error('Please save the diagram first');
      return;
    }
    setIsSaving(true);
    try {
      const response = await axiosInstance.put(`/api/flowchart/${id}`, {
        mermaidString: codeRef.current
      });
      if (response.status === 200) {
        if (showToast) toast.success(response.data.message || 'Diagram saved successfully');
        console.log('Diagram saved successfully');
      } else if (showToast) {
        toast.error('Something went wrong!');
      }
    } catch (error) {
      console.error('Error saving diagram:', error);
      if (showToast) toast.error('Error saving diagram');
    } finally {
      setIsSaving(false);
    }
  }, [id]);

  // Manual save handler
  const handleSaveToBackend = useCallback(async () => {
    await saveToBackend(true);
  }, [saveToBackend]);

  // Custom nodes change handler to capture resize events
  const handleNodesChange = useCallback(
    (changes) => {
      // Check if any change is a dimension change (resize)
      changes.forEach((change) => {
        if (change.type === 'dimensions' && change.dimensions) {
          // Update the node with new dimensions
          setNodes((nds) => {
            const updatedNodes = nds.map((node) => {
              if (node.id === change.id) {
                return {
                  ...node,
                  style: {
                    ...node.style,
                    width: change.dimensions.width,
                    height: change.dimensions.height,
                  },
                  width: change.dimensions.width,
                  height: change.dimensions.height,
                };
              }
              return node;
            });

            // If the resized node is a group, auto-resize its child services
            const resizedNode = updatedNodes.find(n => n.id === change.id);
            if (resizedNode && resizedNode.data?.nodeType === 'group') {
              const groupNodeId = resizedNode.id;
              const groupDataId = resizedNode.data.groupData?.id;
              const oldDimensions = nds.find(n => n.id === change.id);
              const oldWidth = oldDimensions?.width || oldDimensions?.style?.width || oldDimensions?.measured?.width || 600;
              const oldHeight = oldDimensions?.height || oldDimensions?.style?.height || oldDimensions?.measured?.height || 400;

              const newGroupWidth = change.dimensions.width;
              const newGroupHeight = change.dimensions.height;
              const scaleX = newGroupWidth / oldWidth;
              const scaleY = newGroupHeight / oldHeight;

              // Find and resize all child services (check both parentNode and serviceData.group)
              return updatedNodes.map((node) => {
                const isChildService = node.data?.nodeType === 'service' &&
                  (node.parentNode === groupNodeId || node.data.serviceData?.group === groupDataId || node.data.serviceData?.group === groupNodeId);

                if (isChildService) {
                  // Calculate new dimensions for child service
                  const currentWidth = node.width || node.style?.width || 180;
                  const currentHeight = node.height || node.style?.height || 120;
                  const newWidth = Math.max(100, currentWidth * scaleX);
                  const newHeight = Math.max(60, currentHeight * scaleY);

                  // Scale the position (relative position within parent)
                  const currentX = node.position?.x || 0;
                  const currentY = node.position?.y || 0;
                  let newX = currentX * scaleX;
                  let newY = currentY * scaleY;

                  // Ensure service stays within group bounds (with padding)
                  const padding = 20;
                  newX = Math.max(padding, Math.min(newX, newGroupWidth - newWidth - padding));
                  newY = Math.max(padding, Math.min(newY, newGroupHeight - newHeight - padding));

                  return {
                    ...node,
                    position: {
                      x: newX,
                      y: newY,
                    },
                    style: {
                      ...node.style,
                      width: newWidth,
                      height: newHeight,
                    },
                    width: newWidth,
                    height: newHeight,
                    parentNode: groupNodeId, // Ensure parentNode is set
                  };
                }
                return node;
              });
            }

            return updatedNodes;
          });

          // Disabled auto-save of dimensions to code
          // setTimeout(() => {
          //   setNodes((currentNodes) => {
          //     saveNodePositionsToCode(currentNodes);
          //     return currentNodes;
          //   });
          // }, 100);
        }
      });

      // Track meaningful changes in history (position, remove, add, dimensions)
      const shouldTrack = changes.some(
        (change) =>
          change.type === 'position' && change.dragging === false ||
          change.type === 'remove' ||
          change.type === 'add' ||
          change.type === 'dimensions'
      );

      // Call the default handler, but filter out dimension changes since we handle them manually above
      const nonDimensionChanges = changes.filter(change => change.type !== 'dimensions');
      if (nonDimensionChanges.length > 0) {
        onNodesChange(nonDimensionChanges);
      }

      if (shouldTrack && !isApplyingHistory) {
        // Push to history after render cycle completes using setTimeout to avoid setState during render
        setTimeout(() => {
          const currentNodes = nodesRef.current;
          const currentEdges = edgesRef.current;
          pushToHistory({ nodes: currentNodes, edges: currentEdges, code: codeRef.current });
        }, 0);
      }
    },
    [onNodesChange, setNodes, setEdges, pushToHistory, isApplyingHistory]
  );
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  // Initialize history when diagram loads
  const hasInitializedHistory = useRef(false);
  useEffect(() => {
    if (nodes.length > 0 && !hasInitializedHistory.current) {
      clearHistory({ nodes, edges, code });
      hasInitializedHistory.current = true;
    }
  }, [nodes, edges, code, clearHistory]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      if (isCtrlOrCmd && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        const previousState = undo();
        if (previousState) {
          setPreventRerender(true);
          // Restore code FIRST to prevent parsing effect from using wrong code
          setCode(previousState.code);
          codeRef.current = previousState.code;
          // Then restore nodes and edges
          setNodes(previousState.nodes);
          setEdges(previousState.edges);
          setStatusMessage('Undone');
          setTimeout(() => setStatusMessage(''), 2000);
          setTimeout(() => setPreventRerender(false), 100);
        }
      }
      // Check for Ctrl+Shift+Z or Ctrl+Y for redo
      else if (isCtrlOrCmd && (event.shiftKey && event.key === 'z' || event.key === 'y')) {
        event.preventDefault();
        const nextState = redo();
        if (nextState) {
          setPreventRerender(true);
          // Restore code FIRST to prevent parsing effect from using wrong code
          setCode(nextState.code);
          codeRef.current = nextState.code;
          // Then restore nodes and edges
          setNodes(nextState.nodes);
          setEdges(nextState.edges);
          setStatusMessage('Redone');
          setTimeout(() => setStatusMessage(''), 2000);
          setTimeout(() => setPreventRerender(false), 100);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, setNodes, setEdges, setStatusMessage, setPreventRerender, setCode]);

  const pendingCodeFrame = useRef(null);

  const commitCodeUpdate = useCallback(
    (nextCode) => {
      const finalCode = nextCode ?? "";
      codeRef.current = finalCode;

      const applyUpdate = () => {
        pendingCodeFrame.current = null;
        setCode(finalCode);
      };

      if (typeof window === "undefined") {
        applyUpdate();
        return;
      }

      if (pendingCodeFrame.current) {
        cancelAnimationFrame(pendingCodeFrame.current);
      }

      pendingCodeFrame.current = requestAnimationFrame(applyUpdate);
    },
    [setCode]
  );

  useEffect(() => {
    return () => {
      if (pendingCodeFrame.current && typeof window !== "undefined") {
        cancelAnimationFrame(pendingCodeFrame.current);
        pendingCodeFrame.current = null;
      }
    };
  }, []);

  // Load individual styles from store on mount only (not on every change)
  useEffect(() => {
    const loadNodeStyles = () => {
      setNodes((nds) =>
        nds.map((node) => {
          // Only load if node doesn't already have individualStyle
          if (node.data?.individualStyle) return node;

          const storedStyle = getNodeStyle(PAGE_NAME, node.id);
          return storedStyle
            ? { ...node, data: { ...node.data, individualStyle: storedStyle } }
            : node;
        })
      );
    };

    const loadEdgeStyles = () => {
      setEdges((eds) =>
        eds.map((edge) => {
          // Only load if edge doesn't already have individualStyle
          if (edge.data?.individualStyle) return edge;

          const storedStyle = getEdgeStyle(PAGE_NAME, edge.id);
          return storedStyle
            ? {
                ...edge,
                data: { ...edge.data, individualStyle: storedStyle },
                style: {
                  stroke: storedStyle.stroke,
                  strokeWidth: storedStyle.strokeWidth,
                  strokeDasharray: storedStyle.strokeDasharray,
                },
                animated: storedStyle.animated,
              }
            : edge;
        })
      );
    };

    // Only load on mount
    const timeoutId = setTimeout(() => {
      loadNodeStyles();
      loadEdgeStyles();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []); // Empty deps - only run once on mount

  const getNodeDimensions = useCallback(
    (nodeId, fallback = { width: 180, height: 120 }) => {
      const rfNode = reactFlow?.getNode?.(nodeId);
      const measuredWidth =
        rfNode?.measured?.width ?? rfNode?.width ?? fallback.width;
      const measuredHeight =
        rfNode?.measured?.height ?? rfNode?.height ?? fallback.height;
      return { width: measuredWidth, height: measuredHeight };
    },
    [reactFlow]
  );

  const getAbsoluteNodePosition = useCallback((node, snapshot = nodesRef.current) => {
    if (!node) return { x: 0, y: 0 };
    let x = node.position?.x || 0;
    let y = node.position?.y || 0;
    let currentParentId = node.parentNode;

    while (currentParentId) {
      const parent = snapshot.find((n) => n.id === currentParentId);
      if (!parent) break;
      x += parent.position?.x || 0;
      y += parent.position?.y || 0;
      currentParentId = parent.parentNode;
    }

    return { x, y };
  }, []);

  const clampRelativePositionToGroup = useCallback(
    (relativePosition, groupNode, nodeSize = { width: 180, height: 120 }) => {
      if (!groupNode) return relativePosition;
      const fallback = {
        width: groupNode.style?.width || 600,
        height: groupNode.style?.height || 400,
      };
      const groupSize = getNodeDimensions(groupNode.id, fallback);
      const padding = 20;
      const maxX = Math.max(
        padding,
        groupSize.width - nodeSize.width - padding
      );
      const maxY = Math.max(
        padding,
        groupSize.height - nodeSize.height - padding
      );

      return {
        x: Math.min(Math.max(relativePosition.x, padding), maxX),
        y: Math.min(Math.max(relativePosition.y, padding), maxY),
      };
    },
    [getNodeDimensions]
  );

  const updateServiceGroupInCode = useCallback(
    (serviceId, nextGroupId) => {
      if (!serviceId) return;
      const currentCode = codeRef.current || "";
      const lines = currentCode.split("\n");
      const updatedLines = lines.map((line) => {
        if (!line.trim().startsWith(`service ${serviceId}`)) return line;
        const sanitized = line.replace(/\s+in\s+\w+$/, "");
        return nextGroupId ? `${sanitized} in ${nextGroupId}` : sanitized;
      });

      commitCodeUpdate(updatedLines.join("\n"));
    },
    [commitCodeUpdate]
  );

  const updateServiceInCode = useCallback(
    (serviceId, updates) => {
      if (!serviceId) return;
      const currentCode = codeRef.current || "";
      const lines = currentCode.split("\n");

      const updatedLines = lines.map((line) => {
        if (!line.trim().startsWith(`service ${serviceId}`)) return line;

        // Parse the existing service line using regex
        const match = line.match(
          /^(\s*)service\s+(\w+)\s*\(\s*([^)]+)\s*\)\s*\[\s*([^\]]+)\s*\](\s+in\s+\w+)?$/
        );

        if (!match) return line;

        const [, indent, id, typeAndIcon, label, groupPart] = match;

        // Parse existing type and icon
        const parts = typeAndIcon.split(',').map(p => p.trim());
        let currentType = parts[0];
        let currentIcon = parts.length > 1 ? parts[1] : undefined;

        // Apply updates
        const newType = updates.type !== undefined ? updates.type.toLowerCase() : currentType;
        const newLabel = updates.label !== undefined ? updates.label : label;
        const newIcon = updates.icon !== undefined ? updates.icon : currentIcon;

        // Rebuild type and icon part
        const typeAndIconPart = newIcon ? `${newType}, ${newIcon}` : newType;

        // Rebuild the line
        return `${indent}service ${id}(${typeAndIconPart})[${newLabel}]${groupPart || ''}`;
      });

      commitCodeUpdate(updatedLines.join("\n"));
    },
    [commitCodeUpdate]
  );

  const findContainingGroup = useCallback(
    (absoluteCenter, excludeGroupId = null, snapshot = nodesRef.current) => {
      // Add small padding to make detection more forgiving
      const padding = 10;
      return snapshot
        .filter((node) => node.type === "group" && node.id !== excludeGroupId)
        .find((groupNode) => {
          const fallback = {
            width: groupNode.style?.width || groupNode.width || 600,
            height: groupNode.style?.height || groupNode.height || 400,
          };
          const size = getNodeDimensions(groupNode.id, fallback);
          const groupPosition = getAbsoluteNodePosition(groupNode, snapshot);

          return (
            absoluteCenter.x >= groupPosition.x - padding &&
            absoluteCenter.x <= groupPosition.x + size.width + padding &&
            absoluteCenter.y >= groupPosition.y - padding &&
            absoluteCenter.y <= groupPosition.y + size.height + padding
          );
        });
    },
    [getAbsoluteNodePosition, getNodeDimensions]
  );

  const removeConnectionsFromCode = useCallback(
    (edgesToRemove) => {
      if (!edgesToRemove?.length) {
        return;
      }

      const currentCode = codeRef.current || "";
      const lines = currentCode.split("\n");

      const regexEntries = edgesToRemove.map((edge) => ({
        regex: buildConnectionRegex(edge),
        matched: false,
      }));

      const filteredLines = lines.filter((line) => {
        const trimmed = line.trim();
        if (!trimmed) return true;

        const matchEntry = regexEntries.find(
          (entry) => !entry.matched && entry.regex.test(trimmed)
        );

        if (matchEntry) {
          matchEntry.matched = true;
          return false;
        }

        // Also remove corresponding EdgeStyle lines for the same connections
        if (trimmed.startsWith("%% EdgeStyle:")) {
          const after = trimmed.replace(/^%%\s*EdgeStyle:\s*/, "");
          const key = (after.split("=")[0] || "").trim();
          if (edgesToRemove.some((e) => buildConnectionLine(e) === key)) {
            return false;
          }
        }

        return true;
      });

      commitCodeUpdate(filteredLines.join("\n"));
    },
    [commitCodeUpdate]
  );

  const replaceConnectionInCode = useCallback(
    (oldEdge, newEdge) => {
      if (!newEdge) return;

      const currentCode = codeRef.current || "";
      const lines = currentCode.split("\n");
      const regex = oldEdge ? buildConnectionRegex(oldEdge) : null;
      let replaced = false;

      const oldKey = oldEdge ? buildConnectionLine(oldEdge) : null;
      const newKey = buildConnectionLine(newEdge);

      const nextLines = lines.map((line) => {
        if (regex && !replaced && regex.test(line.trim())) {
          replaced = true;
          return newKey;
        }
        // Also migrate EdgeStyle mapping if exists
        if (oldKey && line.trim().startsWith("%% EdgeStyle:")) {
          const after = line.trim().replace(/^%%\s*EdgeStyle:\s*/, "");
          const keyPart = (after.split("=")[0] || "").trim();
          const stylePart = after.includes("=") ? after.substring(after.indexOf("=") + 1).trim() : "";
          if (keyPart === oldKey) {
            return `%% EdgeStyle: ${newKey} = ${stylePart}`;
          }
        }
        return line;
      });

      const finalLines = replaced
        ? nextLines
        : [...nextLines, buildConnectionLine(newEdge)];

      commitCodeUpdate(finalLines.join("\n"));
    },
    [commitCodeUpdate]
  );

  const upsertNodeStyleInCode = useCallback(
    (nodeId, styleObj) => {
      const currentCode = codeRef.current || "";
      const lines = currentCode.split("\n");
      const filtered = lines.filter(
        (line) => !line.trim().startsWith(`%% NodeStyle: ${nodeId}`)
      );

      const parts = [];
      if (styleObj?.outlineColor) parts.push(`outline:${styleObj.outlineColor}`);
      if (styleObj?.backgroundColor)
        parts.push(`bg:${styleObj.backgroundColor}`);
      if (styleObj?.borderStyle) parts.push(`borderStyle:${styleObj.borderStyle}`);

      const styleLine = parts.length
        ? `%% NodeStyle: ${nodeId} = ${parts.join("; ")}`
        : null;

      const updated = styleLine ? [...filtered, styleLine] : filtered;
      commitCodeUpdate(updated.join("\n"));
    },
    [commitCodeUpdate]
  );


  const upsertEdgeStyleInCode = useCallback(
    (edgeLike) => {
      const key = buildConnectionLine(edgeLike);
      const currentCode = codeRef.current || "";
      const lines = currentCode.split("\n");
      const withoutOld = lines.filter((line) => {
        const trimmed = line.trim();
        if (!trimmed.startsWith("%% EdgeStyle:")) return true;
        const after = trimmed.replace(/^%%\s*EdgeStyle:\s*/, "");
        const oldKey = (after.split("=")[0] || "").trim();
        return oldKey !== key;
      });

      const parts = [];
      if (edgeLike?.style?.stroke) parts.push(`stroke:${edgeLike.style.stroke}`);
      if (edgeLike?.style?.strokeDasharray) parts.push(`dash:${edgeLike.style.strokeDasharray}`);
      if (edgeLike?.type && edgeLike.type !== "custom") parts.push(`type:${edgeLike.type}`);

      let arrow = "none";
      if (edgeLike?.markerEnd?.type === MarkerType.ArrowClosed) arrow = "closed";
      else if (edgeLike?.markerEnd?.type === MarkerType.Arrow) arrow = "open";
      if (arrow && arrow !== "none") parts.push(`arrow:${arrow}`);

      const styleLine = parts.length
        ? `%% EdgeStyle: ${key} = ${parts.join("; ")}`
        : null;

      const updated = styleLine ? [...withoutOld, styleLine] : withoutOld;
      commitCodeUpdate(updated.join("\n"));
    },
    [commitCodeUpdate]
  );

  const handleEdgeClick = useCallback(
    (event, edge) => {
      event.stopPropagation();

      // Open NodeEditorPanel on EVERY click for edge styling
      setSelectedStyleEdge(edge);
      setSelectedStyleNode(null);
      setEditorOpen(true);

      // Don't select for other panels
      setSelectedEdge(null);
      setSelectedNode(null);
    },
    [setSelectedEdge, setSelectedNode]
  );

  const handleDeleteEdge = useCallback(
    (edgeId) => {
      const edgeToRemove = edges.find((edge) => edge.id === edgeId);
      if (!edgeToRemove) return;

      // Save to history BEFORE deletion for undo/redo
      if (!isApplyingHistory) {
        pushToHistory({ nodes: nodesRef.current, edges: edgesRef.current, code: codeRef.current });
      }

      setPreventRerender(true);
      setEdges((currentEdges) =>
        currentEdges.filter((edge) => edge.id !== edgeId)
      );
      removeConnectionsFromCode([edgeToRemove]);
      setSelectedEdge(null);
      setStatusMessage(
        `Connection removed: ${edgeToRemove.source} → ${edgeToRemove.target}`
      );
      setTimeout(() => setStatusMessage(""), 3000);
      setTimeout(() => setPreventRerender(false), 100);
    },
    [
      edges,
      removeConnectionsFromCode,
      setEdges,
      setPreventRerender,
      setStatusMessage,
      setSelectedEdge,
      isApplyingHistory,
      pushToHistory,
      setNodes,
    ]
  );

  const handleEdgeUpdate = useCallback(
    (oldEdge, newConnection) => {
      if (!oldEdge || !newConnection?.source || !newConnection?.target) {
        return;
      }

      // Save to history BEFORE update for undo/redo
      if (!isApplyingHistory) {
        pushToHistory({ nodes: nodesRef.current, edges: edgesRef.current, code: codeRef.current });
      }

      setPreventRerender(true);

      let updatedEdge;
      setEdges((eds) => {
        const reconnected = reconnectEdge(oldEdge, newConnection, eds);
        return reconnected.map((edge) => {
          if (edge.id === oldEdge.id) {
            // Apply custom properties to the reconnected edge
            updatedEdge = {
              ...edge,
              sourceHandle: newConnection.sourceHandle || oldEdge.sourceHandle || "right",
              targetHandle: newConnection.targetHandle || oldEdge.targetHandle || "left",
              selectable: true,
              updatable: true,
              interactionWidth: 30,
            };
            return updatedEdge;
          }
          return edge;
        });
      });

      replaceConnectionInCode(oldEdge, updatedEdge);
      upsertEdgeStyleInCode(updatedEdge);
      setSelectedEdge(updatedEdge);

      setStatusMessage(`Connection updated: ${updatedEdge.source} → ${updatedEdge.target}`);
      setTimeout(() => setStatusMessage(""), 1500);
      setTimeout(() => {
        updatingEdgeIdRef.current = null;
        setPreventRerender(false);
      }, 120);
    },
    [
      replaceConnectionInCode,
      upsertEdgeStyleInCode,
      setEdges,
      setPreventRerender,
      setStatusMessage,
      setSelectedEdge,
      isApplyingHistory,
      pushToHistory,
      setNodes,
    ]
  );


  const handleEdgesChange = useCallback(
    (changes) => {
      const currentUpdatingId = updatingEdgeIdRef.current;

      const removedEdges = changes
        .filter((change) => change.type === "remove")
        .map((change) => edges.find((edge) => edge.id === change.id))
        .filter((edge) => edge && edge.id !== currentUpdatingId);

      if (removedEdges.length > 0) {
        setPreventRerender(true);
        removeConnectionsFromCode(removedEdges);
        if (
          selectedEdge &&
          removedEdges.some((edge) => edge.id === selectedEdge.id)
        ) {
          setSelectedEdge(null);
        }
        setStatusMessage(
          removedEdges.length === 1
            ? `Connection removed: ${removedEdges[0].source} → ${removedEdges[0].target}`
            : `${removedEdges.length} connections removed`
        );
        setTimeout(() => setStatusMessage(""), 3000);
        setTimeout(() => setPreventRerender(false), 100);

        // Track edge removal in history - defer to avoid setState during render
        if (!isApplyingHistory) {
          setTimeout(() => {
            pushToHistory({ nodes: nodesRef.current, edges: edgesRef.current, code: codeRef.current });
          }, 0);
        }
      }

      const filteredChanges =
        currentUpdatingId && changes.length
          ? changes.filter(
              (change) =>
                !(
                  change.type === "remove" && change.id === currentUpdatingId
                )
            )
          : changes;

      if (filteredChanges.length > 0) {
        onEdgesStateChange(filteredChanges);
      }
    },
    [
      edges,
      onEdgesStateChange,
      removeConnectionsFromCode,
      selectedEdge,
      setSelectedEdge,
      setPreventRerender,
      setStatusMessage,
      setNodes,
      setEdges,
      pushToHistory,
      isApplyingHistory,
    ]
  );

  const handleEdgeUpdateStart = useCallback((_, edge) => {
    updatingEdgeIdRef.current = edge?.id || null;
    setIsUpdatingEdge(true);
  }, []);

  const handleEdgeUpdateEnd = useCallback(() => {
    updatingEdgeIdRef.current = null;
    setIsUpdatingEdge(false);
  }, []);

  

  const parseArchitectureCode = useCallback((text) => {
    const result = {
      groups: new Map(),
      services: new Map(),
      connections: [],
      positions: new Map(),
      dimensions: new Map(),
      nodeStyles: new Map(),
      edgeStyles: new Map(),
    };

    if (!text) {
      return result;
    }

    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line === "architecture-beta") continue;

      const posMatch = line.match(
        /^%%\s*Position:\s*(\w+)\s*=\s*\[(-?\d+),\s*(-?\d+)\]/
      );
      if (posMatch) {
        const [, id, x, y] = posMatch;
        result.positions.set(id, { x: parseInt(x), y: parseInt(y) });
        continue;
      }

      const dimMatch = line.match(
        /^%%\s*Dimension:\s*(\w+)\s*=\s*\[(\d+),\s*(\d+)\]/
      );
      if (dimMatch) {
        const [, id, width, height] = dimMatch;
        result.dimensions.set(id, { width: parseInt(width), height: parseInt(height) });
        continue;
      }

      // Node position
      if (line.startsWith("%%")) {
        // Node style: %% NodeStyle: <id> = key:value; key:value
        const nodeStyleMatch = line.match(/^%%\s*NodeStyle:\s*(\w+)\s*=\s*(.+)$/);
        if (nodeStyleMatch) {
          const [, id, styleStr] = nodeStyleMatch;
          const style = {};
          styleStr
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((entry) => {
              const [k, v] = entry.split(":").map((x) => (x || "").trim());
              if (!k) return;
              if (k === "outline") style.outlineColor = v;
              else if (k === "bg") style.backgroundColor = v;
              else if (k === "borderStyle") style.borderStyle = v;
            });
          result.nodeStyles.set(id, style);
          continue;
        }

        // Edge style: %% EdgeStyle: <source:s -- t:target> = key:value; key:value
        const edgeStyleMatch = line.match(/^%%\s*EdgeStyle:\s*(.+?)\s*=\s*(.+)$/);
        if (edgeStyleMatch) {
          const [, key, styleStr] = edgeStyleMatch;
          const normKey = key.trim();
          const style = {};
          styleStr
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((entry) => {
              const [k, vRaw] = entry.split(":");
              const kTrim = (k || "").trim();
              const v = (vRaw || "").trim();
              if (!kTrim) return;
              if (kTrim === "stroke") style.stroke = v;
              else if (kTrim === "dash") style.dash = v;
              else if (kTrim === "arrow") style.arrow = v;
              else if (kTrim === "type") style.type = v.toLowerCase();
            });
          result.edgeStyles.set(normKey, style);
          continue;
        }

        continue;
      }

      const groupMatch = line.match(
        /^group\s+(\w+)\s*\(\s*([^)]+)\s*\)\s*\[\s*([^\]]+)\s*\]$/
      );
      if (groupMatch) {
        const [, id, type, label] = groupMatch;
        result.groups.set(id, { id, type: type.trim(), label: label.trim() });
        continue;
      }

      const serviceMatch = line.match(
        /^service\s+(\w+)\s*\(\s*([^)]+)\s*\)\s*\[\s*([^\]]+)\s*\]\s*(?:in\s+(\w+))?$/
      );
      if (serviceMatch) {
        const [, id, typeAndIcon, label, group] = serviceMatch;
        // Parse type and optional icon: "type" or "type, icon"
        const parts = typeAndIcon.split(',').map(p => p.trim());
        const type = parts[0];
        const icon = parts.length > 1 ? parts[1] : undefined;

        result.services.set(id, {
          id,
          type: type,
          label: label.trim(),
          group: group ? group.trim() : null,
          icon: icon,
        });
        continue;
      }

      const connectionMatch = line.match(
        /^(\w+)\s*:\s*([LlRrTtBb])\s*--\s*([LlRrTtBb])\s*:\s*(\w+)$/
      );
      if (connectionMatch) {
        const [, sourceId, sourceSide, targetSide, targetId] = connectionMatch;
        result.connections.push({
          sourceId: sourceId.trim(),
          sourceSide: sourceSide.trim().toLowerCase(),
          targetId: targetId.trim(),
          targetSide: targetSide.trim().toLowerCase(),
        });
      }
    }

    return result;
  }, []);

  const buildTreeStructure = useCallback((services, connections) => {
    const graph = new Map();
    const inDegree = new Map();
    const serviceMap = new Map(services.map((s) => [s.id, s]));

    services.forEach((service) => {
      graph.set(service.id, []);
      inDegree.set(service.id, 0);
    });

    connections.forEach((conn) => {
      if (graph.has(conn.sourceId) && graph.has(conn.targetId)) {
        graph.get(conn.sourceId).push(conn.targetId);
        inDegree.set(conn.targetId, inDegree.get(conn.targetId) + 1);
      }
    });

    const roots = services.filter((service) => inDegree.get(service.id) === 0);

    if (roots.length === 0) {
      const minInDegree = Math.min(...Array.from(inDegree.values()));
      roots.push(
        ...services.filter(
          (service) => inDegree.get(service.id) === minInDegree
        )
      );
    }

    const levels = [];
    const visited = new Set();
    let currentLevel = [...roots];

    while (currentLevel.length > 0) {
      levels.push([...currentLevel]);
      const nextLevel = [];

      currentLevel.forEach((service) => {
        visited.add(service.id);
        const neighbors = graph.get(service.id) || [];

        neighbors.forEach((neighborId) => {
          if (!visited.has(neighborId)) {
            const neighbor = serviceMap.get(neighborId);
            if (neighbor && !nextLevel.some((n) => n.id === neighborId)) {
              nextLevel.push(neighbor);
            }
          }
        });
      });

      currentLevel = nextLevel;
    }

    services.forEach((service) => {
      if (!visited.has(service.id)) {
        if (levels.length === 0) levels.push([]);
        if (!levels[0].some((s) => s.id === service.id)) {
          levels[0].push(service);
        }
      }
    });

    return {
      levels,
      roots,
      graph,
      inDegree,
    };
  }, []);

  const calculateServicePositions = useCallback(
    (services, connections) => {
      const positions = new Map();
      if (!services || services.length === 0) {
        return positions;
      }

      const serviceSet = new Set(services.map((service) => service.id));
      const filteredConnections = connections.filter(
        (conn) => serviceSet.has(conn.sourceId) && serviceSet.has(conn.targetId)
      );

      const reverseGraph = new Map();

      services.forEach((service) => {
        reverseGraph.set(service.id, []);
      });

      filteredConnections.forEach((conn) => {
        reverseGraph.get(conn.targetId)?.push(conn.sourceId);
      });

      const depthMemo = new Map();
      const visiting = new Set();
      const resolveDepth = (serviceId) => {
        if (depthMemo.has(serviceId)) return depthMemo.get(serviceId);
        if (visiting.has(serviceId)) {
          depthMemo.set(serviceId, 0);
          return 0;
        }
        visiting.add(serviceId);
        const parents = reverseGraph.get(serviceId) || [];
        if (parents.length === 0) {
          depthMemo.set(serviceId, 0);
          visiting.delete(serviceId);
          return 0;
        }
        const parentDepths = parents
          .map((parentId) => resolveDepth(parentId))
          .filter((depth) => typeof depth === "number");
        const depth = (parentDepths.length ? Math.max(...parentDepths) : 0) + 1;
        depthMemo.set(serviceId, depth);
        visiting.delete(serviceId);
        return depth;
      };

      services.forEach((service) => resolveDepth(service.id));

      const columnMap = new Map();
      services.forEach((service) => {
        const depth = depthMemo.get(service.id) ?? 0;
        if (!columnMap.has(depth)) {
          columnMap.set(depth, []);
        }
        columnMap.get(depth).push(service);
      });

      const columnKeys = Array.from(columnMap.keys()).sort((a, b) => a - b);

      const serviceWidth = 180;
      const serviceHeight = 100;
      const verticalSpacing = 260;
      const horizontalSpacing = 140;
      const innerWrapSpacing = 180;
      const maxNodesPerRow = 4;

      const rowAssignments = new Map();
      const getPreferredRow = (serviceId) => {
        const parents = reverseGraph.get(serviceId) || [];
        const parentRows = parents
          .map((parentId) => rowAssignments.get(parentId))
          .filter((row) => typeof row === "number")
          .sort((a, b) => a - b);

        if (parentRows.length === 0) {
          return null;
        }

        const mid = Math.floor(parentRows.length / 2);
        if (parentRows.length % 2 === 0) {
          return (parentRows[mid - 1] + parentRows[mid]) / 2;
        }
        return parentRows[mid];
      };

      columnKeys.forEach((columnIndex) => {
        const columnServices = columnMap.get(columnIndex) || [];
        columnServices.sort((a, b) => {
          const aPref = getPreferredRow(a.id);
          const bPref = getPreferredRow(b.id);

          if (aPref === null && bPref === null) {
            return a.id.localeCompare(b.id);
          }
          if (aPref === null) return 1;
          if (bPref === null) return -1;
          if (aPref === bPref) {
            return a.id.localeCompare(b.id);
          }
          return aPref - bPref;
        });

        columnServices.forEach((service, index) => {
          const wrapIndex = Math.floor(index / maxNodesPerRow);
          const rowIndex = index % maxNodesPerRow;
          const x =
            rowIndex * (serviceWidth + horizontalSpacing) +
            wrapIndex * (serviceWidth + innerWrapSpacing);
          const y = columnIndex * (serviceHeight + verticalSpacing);

          positions.set(service.id, { x, y });
          rowAssignments.set(
            service.id,
            rowIndex + wrapIndex * maxNodesPerRow
          );
        });
      });

      return positions;
    },
    []
  );

  const calculateGroupSizeFromServicePositions = useCallback((services, servicePositions) => {
    if (services.length === 0) {
      return { width: 800, height: 400 };
    }

    const serviceWidth = 180;
    const serviceHeight = 100;
    const horizontalMargin = 200;
    const verticalMargin = 150;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    services.forEach((service) => {
      const position = servicePositions.get(service.id);
      if (position) {
        minX = Math.min(minX, position.x);
        maxX = Math.max(maxX, position.x + serviceWidth);
        minY = Math.min(minY, position.y);
        maxY = Math.max(maxY, position.y + serviceHeight);
      }
    });

    if (!isFinite(minX) || !isFinite(minY)) {
      return { width: 1000, height: 600 };
    }

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    return {
      width: Math.max(800, contentWidth + horizontalMargin * 2),
      height: Math.max(400, contentHeight + verticalMargin * 2),
    };
  }, []);

  const adjustServicePositionsToGroup = useCallback((services, servicePositions, groupPosition, groupSize) => {
    const adjustedPositions = new Map();
    const serviceWidth = 180;
    const serviceHeight = 100;
    const layoutPadding = 60;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    services.forEach((service) => {
      const position = servicePositions.get(service.id);
      if (position) {
        minX = Math.min(minX, position.x);
        maxX = Math.max(maxX, position.x);
        minY = Math.min(minY, position.y);
        maxY = Math.max(maxY, position.y);
      }
    });

    const rawWidth = maxX - minX + serviceWidth;
    const rawHeight = maxY - minY + serviceHeight;
    const availableWidth = groupSize.width - 100;
    const availableHeight = groupSize.height - 100;

    const scaleX = rawWidth > availableWidth ? availableWidth / rawWidth : 1;
    const scaleY = rawHeight > availableHeight ? availableHeight / rawHeight : 1;
    const scale = Math.min(scaleX, scaleY);
    const scaledContentWidth = rawWidth * scale;
    const scaledContentHeight = rawHeight * scale;
    const horizontalPadding = Math.max(
      layoutPadding,
      (groupSize.width - scaledContentWidth) / 2
    );
    const verticalPadding = Math.max(
      layoutPadding,
      (groupSize.height - scaledContentHeight) / 2
    );

    services.forEach((service) => {
      const originalPosition = servicePositions.get(service.id);
      if (originalPosition) {
        const scaledX = (originalPosition.x - minX) * scale;
        const scaledY = (originalPosition.y - minY) * scale;

        const offsetX = horizontalPadding + scaledX;
        const offsetY = verticalPadding + scaledY;

        const boundedX = Math.min(
          Math.max(offsetX, layoutPadding),
          groupSize.width - serviceWidth - layoutPadding
        );
        const boundedY = Math.min(
          Math.max(offsetY, layoutPadding),
          groupSize.height - serviceHeight - layoutPadding
        );

        adjustedPositions.set(service.id, { x: boundedX, y: boundedY });
      } else {
        adjustedPositions.set(service.id, {
          x: 100,
          y: 100
        });
      }
    });

    return adjustedPositions;
  }, []);

  const createFlowElements = useCallback(
    (archData) => {
      const nodes = [];
      const edges = [];
      const allNodesMap = new Map();

      const groupHorizontalSpacing = 200;
      const groupVerticalSpacing = 180;
      const layoutPadding = { x: 120, y: 80 };

      const groupsArray = Array.from(archData.groups.values());

      const preparedGroups = groupsArray.map((group) => {
        const servicesInGroup = Array.from(archData.services.values()).filter(
          (s) => s.group === group.id
        );

        const groupServiceIds = new Set(servicesInGroup.map((s) => s.id));
        const groupConnections = archData.connections.filter(
          (conn) =>
            groupServiceIds.has(conn.sourceId) &&
            groupServiceIds.has(conn.targetId)
        );

        const servicePositions = calculateServicePositions(
          servicesInGroup,
          groupConnections
        );

        const groupSize = calculateGroupSizeFromServicePositions(
          servicesInGroup,
          servicePositions
        );

        return {
          group,
          servicesInGroup,
          servicePositions,
          groupSize,
          savedPosition: archData.positions.get(group.id) || null,
        };
      });

      const autoEntries = preparedGroups.filter((entry) => !entry.savedPosition);
      const maxGroupsPerRow = Math.max(
        1,
        Math.ceil(Math.sqrt(autoEntries.length || 1))
      );
      const rows = [];
      autoEntries.forEach((entry, index) => {
        const rowIndex = Math.floor(index / maxGroupsPerRow);
        if (!rows[rowIndex]) rows[rowIndex] = [];
        rows[rowIndex].push(entry);
      });

      const maxRowWidth = rows.reduce((max, row) => {
        if (!row || row.length === 0) return max;
        const width = row.reduce(
          (sum, entry, idx) =>
            sum +
            entry.groupSize.width +
            (idx > 0 ? groupHorizontalSpacing : 0),
          0
        );
        return Math.max(max, width);
      }, 0);

      let currentY = layoutPadding.y;
      rows.forEach((row) => {
        if (!row || row.length === 0) return;
        const rowHeight = row.reduce(
          (max, entry) => Math.max(max, entry.groupSize.height),
          0
        );
        const rowWidth = row.reduce(
          (sum, entry, idx) =>
            sum +
            entry.groupSize.width +
            (idx > 0 ? groupHorizontalSpacing : 0),
          0
        );
        const startX =
          layoutPadding.x +
          (maxRowWidth > 0 ? (maxRowWidth - rowWidth) / 2 : 0);
        let currentX = startX;
        row.forEach((entry) => {
          entry.position = { x: currentX, y: currentY };
          currentX += entry.groupSize.width + groupHorizontalSpacing;
        });
        currentY += rowHeight + groupVerticalSpacing;
      });

      preparedGroups.forEach((entry) => {
        if (entry.savedPosition) {
          entry.position = entry.savedPosition;
        }

        const adjustedServicePositions = adjustServicePositionsToGroup(
          entry.servicesInGroup,
          entry.servicePositions,
          entry.position,
          entry.groupSize
        );

        const savedDimensions = archData.dimensions.get(entry.group.id);
        const groupNode = {
          id: entry.group.id,
          type: "group",
          position: entry.position || { x: layoutPadding.x, y: layoutPadding.y },
          data: {
            nodeType: "group",
            groupData: entry.group,
            customStyle: archData.nodeStyles.get(entry.group.id) || undefined,
          },
          style: savedDimensions ? { width: savedDimensions.width, height: savedDimensions.height } : entry.groupSize,
          draggable: true,
          selectable: true,
          // dragHandle removed - entire group is now draggable
          width: savedDimensions?.width || entry.groupSize.width,
          height: savedDimensions?.height || entry.groupSize.height,
        };

        nodes.push(groupNode);
        allNodesMap.set(entry.group.id, groupNode);

        entry.servicesInGroup.forEach((service) => {
          const savedPosition = archData.positions.get(service.id);
          const position =
            savedPosition ||
            adjustedServicePositions.get(service.id) || {
              x: 100,
              y: 100,
            };

          const savedDimensions = archData.dimensions.get(service.id);
          const serviceNode = {
            id: service.id,
            type: "service",
            position,
            data: {
              nodeType: "service",
              serviceData: service,
              customStyle: archData.nodeStyles.get(service.id) || undefined,
            },
            draggable: true,
            parentNode: entry.group.id,
            // Removed extent: "parent" to allow dragging services between groups
            width: savedDimensions?.width || 180,
            height: savedDimensions?.height || 100,
          };

          nodes.push(serviceNode);
          allNodesMap.set(service.id, serviceNode);
        });
      });

      const standaloneServices = Array.from(archData.services.values()).filter(
        (s) => !s.group
      );

      if (standaloneServices.length > 0) {
        const standaloneWidth = 180;
        const standaloneHeight = 100;
        const standaloneSpacing = 50;

        standaloneServices.forEach((service, index) => {
          const savedPosition = archData.positions.get(service.id);
          const position = savedPosition || {
            x: currentGroupX + (index % 3) * (standaloneWidth + standaloneSpacing),
            y: groupY + 500 + Math.floor(index / 3) * (standaloneHeight + standaloneSpacing)
          };

          const savedDimensions = archData.dimensions.get(service.id);
          const serviceNode = {
            id: service.id,
            type: "service",
            position,
            data: {
              nodeType: "service",
              serviceData: service,
              customStyle: archData.nodeStyles.get(service.id) || undefined,
            },
            draggable: true,
            width: savedDimensions?.width || standaloneWidth,
            height: savedDimensions?.height || standaloneHeight,
          };

          nodes.push(serviceNode);
          allNodesMap.set(service.id, serviceNode);
        });
      }

      archData.connections.forEach((conn, index) => {
        const sourceNode = allNodesMap.get(conn.sourceId);
        const targetNode = allNodesMap.get(conn.targetId);

        if (sourceNode && targetNode) {
          const sourceHandle = CHAR_TO_HANDLE[conn.sourceSide] || "right";
          const targetHandle = CHAR_TO_HANDLE[conn.targetSide] || "left";
          const edgeKey = `${conn.sourceId}:${conn.sourceSide} -- ${conn.targetSide}:${conn.targetId}`;
          const styleConf = archData.edgeStyles.get(edgeKey);
          const allowedTypes = new Set(["custom", "straight", "step", "smoothstep", "bezier"]);
          let resolvedType = styleConf?.type && allowedTypes.has(styleConf.type.toLowerCase())
            ? styleConf.type.toLowerCase()
            : "custom";
          // Map "bezier" to "custom" since our custom edge is bezier-based
          if (resolvedType === "bezier") resolvedType = "custom";
          const edge = {
            id: `edge-${conn.sourceId}-${conn.targetId}-${index}`,
            source: conn.sourceId,
            target: conn.targetId,
            sourceHandle: sourceHandle,
            targetHandle: targetHandle,
            type: resolvedType,
            style: {
              stroke: styleConf?.stroke || "#000000",
              strokeWidth: 2,
              strokeDasharray: styleConf?.dash || undefined,
            },
            markerEnd:
              styleConf?.arrow && styleConf.arrow.toLowerCase() !== "none"
                ? {
                  type:
                    styleConf.arrow.toLowerCase() === "closed"
                      ? MarkerType.ArrowClosed
                      : MarkerType.Arrow,
                  color: styleConf?.stroke || "#000000",
                }
                : undefined,
            interactionWidth: 30,
            selectable: true,
            updatable: true,
          };

          edges.push(edge);
        }
      });

      console.log('Final nodes:', nodes);
      return { nodes, edges };
    },
    [calculateServicePositions, calculateGroupSizeFromServicePositions, adjustServicePositionsToGroup]
  );

  const saveNodePositionsToCode = useCallback(
    (updatedNodes) => {
      if (isSaving) return;

      setIsSaving(true);

      setTimeout(() => {
        try {
          const currentCode = codeRef.current;
          const lines = currentCode.split("\n");
          const newLines = lines.filter(
            (line) => !line.trim().startsWith("%% Position:") && !line.trim().startsWith("%% Dimension:")
          );

          // Extract node IDs that exist in the current code
          const codeNodeIds = new Set();
          lines.forEach((line) => {
            const groupMatch = line.match(/^group\s+(\w+)\(/);
            const serviceMatch = line.match(/^service\s+(\w+)\(/);
            if (groupMatch) codeNodeIds.add(groupMatch[1]);
            if (serviceMatch) codeNodeIds.add(serviceMatch[1]);
          });

          // Check if any of the updated nodes exist in current code
          // If code was completely replaced (paste), skip saving to avoid overwriting
          const validNodes = updatedNodes.filter((node) => codeNodeIds.has(node.id));
          if (validNodes.length === 0) {
            console.log('No matching nodes in current code, skipping position save');
            setIsSaving(false);
            return;
          }

          validNodes.forEach((node) => {
            if (
              node.type === "service" &&
              node.parentNode &&
              isFinite(node.position.x) &&
              isFinite(node.position.y)
            ) {
              newLines.push(
                `%% Position: ${node.id} = [${Math.round(node.position.x)}, ${Math.round(node.position.y)}]`
              );
            } else if (isFinite(node.position.x) && isFinite(node.position.y)) {
              newLines.push(
                `%% Position: ${node.id} = [${Math.round(node.position.x)}, ${Math.round(node.position.y)}]`
              );
            }

            // Save dimensions if they exist
            if (node.width && node.height && isFinite(node.width) && isFinite(node.height)) {
              newLines.push(
                `%% Dimension: ${node.id} = [${Math.round(node.width)}, ${Math.round(node.height)}]`
              );
            }
          });

          const updatedCode = newLines.join("\n");
          commitCodeUpdate(updatedCode);
          setStatusMessage("Positions and dimensions saved");

          setPreventRerender(true);
          setTimeout(() => {
            setPreventRerender(false);
            setIsSaving(false);
          }, 1000);

        } catch (error) {
          console.error("Error saving positions:", error);
          setIsSaving(false);
        }
      }, 500);
    },
    [commitCodeUpdate, isSaving]
  );

  const onNodeDragStart = useCallback(
    (event, node) => {
      console.log('🚀 Drag Start:', node.id, 'Type:', node.type, 'Parent:', node.parentNode);

      // Handle all node types for smooth dragging
      if (node.type === "service") {
        // Calculate absolute position before removing parent
        const absolutePosition = node.positionAbsolute || getAbsoluteNodePosition(node, nodesRef.current);

        // ALWAYS store drag state for service nodes
        const dragState = {
          nodeId: node.id,
          position: { ...node.position },
          absolutePosition: { ...absolutePosition },
          parentId: node.parentNode || null,
          startTime: Date.now(),
        };
        console.log('📝 Storing dragStartState:', dragState);
        dragStartStateRef.current = dragState;

        // Remove extent constraint and convert to absolute position for free dragging
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === node.id) {
              // Get the absolute position for this node
              const nodeAbsPos = n.positionAbsolute || getAbsoluteNodePosition(n, nds);
              return {
                ...n,
                extent: undefined,
                dragging: true,
                // Remove parent temporarily to allow free dragging
                parentNode: undefined,
                // Convert to absolute position so node doesn't jump
                position: nodeAbsPos,
                // Store original parent for restoration
                _originalParent: n.parentNode,
              };
            }
            return n;
          })
        );

        // Force ReactFlow to re-read node properties after state update
        queueMicrotask(() => updateNodeInternals(node.id));
      } else if (node.type === "group") {
        // For group nodes, don't modify state during drag start
        // Just log for debugging - ReactFlow handles group dragging natively
        console.log('📦 Group drag start - letting ReactFlow handle it');
      }
    },
    [setNodes, getAbsoluteNodePosition, updateNodeInternals]
  );

  const onNodeDrag = useCallback(
    (event, node) => {
      // Only update position for service nodes - groups are handled natively by ReactFlow
      if (node.type === "service") {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, position: node.position, positionAbsolute: node.positionAbsolute }
              : n
          )
        );
      }

      // Track which group the service is hovering over (only for service nodes)
      if (node.type === "service") {
        const serviceSize = getNodeDimensions(node.id, { width: 180, height: 120 });
        // Use positionAbsolute for accurate positioning
        const absolutePosition = node.positionAbsolute || node.position;
        const absoluteCenter = {
          x: absolutePosition.x + serviceSize.width / 2,
          y: absolutePosition.y + serviceSize.height / 2,
        };

        // Don't exclude any group - we want to find any group it's hovering over
        const containingGroup = findContainingGroup(
          absoluteCenter,
          null, // Check all groups
          nodesRef.current
        );

        if (containingGroup) {
          console.log('🎯 Hovering over group:', containingGroup.id);
        }

        setHoveredGroupId(containingGroup ? containingGroup.id : null);
      } else {
        setHoveredGroupId(null);
      }
    },
    [setNodes, getNodeDimensions, findContainingGroup]
  );

  const onNodeDragStop = useCallback(
    (event, node) => {
      console.log('🏁 Drag Stop:', node.id, 'Type:', node.type, 'Position:', node.position);
      console.log('📦 Current dragStartState:', dragStartStateRef.current);

      // Handle group nodes separately - just save position
      if (node.type === "group") {
        setNodes((currentNodes) => {
          const updatedNodes = currentNodes.map((n) =>
            n.id === node.id ? { ...n, position: node.position, dragging: false } : n
          );

          // Disabled auto-save
          // setTimeout(() => {
          //   saveNodePositionsToCode(updatedNodes);
          // }, 100);

          return updatedNodes;
        });
        return;
      }

      // Handle service nodes
      if (node.type !== "service") return;

      // Get current nodes for calculations
      const currentNodes = nodesRef.current || nodes;

      // Retrieve original parent from node data or dragStartStateRef
      const dragStartState = dragStartStateRef.current;
      const originalParentId = dragStartState?.parentId ??
        currentNodes.find(n => n.id === node.id)?._originalParent ??
        null;
      const originalPosition = dragStartState?.position ?? node.position;

      console.log('🔍 Original Parent:', originalParentId);

      // Use positionAbsolute if available, otherwise calculate it
      let nodeAbsX, nodeAbsY;
      if (node.positionAbsolute) {
        nodeAbsX = node.positionAbsolute.x;
        nodeAbsY = node.positionAbsolute.y;
      } else {
        // Since we removed parent during drag, position is already absolute
        nodeAbsX = node.position.x;
        nodeAbsY = node.position.y;
      }

      console.log('📍 Absolute Position:', { x: nodeAbsX, y: nodeAbsY });

      // Find which group the node is now inside
      const serviceSize = getNodeDimensions(node.id, { width: 180, height: 120 });
      const absoluteCenter = {
        x: nodeAbsX + serviceSize.width / 2,
        y: nodeAbsY + serviceSize.height / 2,
      };

      console.log('🎯 Checking center point:', absoluteCenter);

      const containingGroup = findContainingGroup(
        absoluteCenter,
        null,
        currentNodes
      );

      const newParentId = containingGroup?.id ?? null;

      console.log('🏠 Found containing group:', newParentId);
      console.log('🔄 Parent change:', originalParentId, '->', newParentId);

      // If parent changed, show confirmation dialog
      if (newParentId !== originalParentId) {
        console.log('✅ Parent changed - showing dialog');
        setPendingMove({
          node,
          oldParentId: originalParentId,
          newParentId,
          originalPosition,
          absolutePosition: { x: nodeAbsX, y: nodeAbsY },
        });
        setMoveDialogOpen(true);
      } else {
        console.log('⚡ No parent change - updating position');
        // No parent change, restore parent and update position
        setNodes((currentNodes) => {
          let updatedNodes = currentNodes.map((n) => {
            if (n.id === node.id) {
              // Calculate relative position if has parent
              let finalPosition = { x: nodeAbsX, y: nodeAbsY };
              if (originalParentId) {
                const parent = currentNodes.find(p => p.id === originalParentId);
                if (parent) {
                  const relativePos = {
                    x: nodeAbsX - parent.position.x,
                    y: nodeAbsY - parent.position.y,
                  };
                  // Clamp position to keep service inside parent group bounds
                  finalPosition = clampRelativePositionToGroup(relativePos, parent, serviceSize);
                }
              }

              return {
                ...n,
                position: finalPosition,
                parentNode: originalParentId || undefined,
                // Removed extent to allow dragging services between groups
                dragging: false,
                _originalParent: undefined,
              };
            }
            return n;
          });

          // Disabled auto-save
          // setTimeout(() => {
          //   saveNodePositionsToCode(updatedNodes);
          // }, 100);

          return updatedNodes;
        });
      }

      // Clear drag start state
      dragStartStateRef.current = null;
      setHoveredGroupId(null);
    },
    [
      nodes,
      getNodeDimensions,
      findContainingGroup,
      clampRelativePositionToGroup,
      setNodes,
      saveNodePositionsToCode,
      setHoveredGroupId,
    ]
  );


  const addNewGroup = useCallback(
    (position = { x: 100, y: 100 }) => {
      setPreventRerender(true);

      const groupId = `group_${Date.now()}`;
      const currentCode = codeRef.current;

      const newCode = currentCode.includes("architecture-beta")
        ? currentCode +
        `\ngroup ${groupId}(cloud)[New Group]\n%% Position: ${groupId} = [${Math.round(
          position.x
        )}, ${Math.round(position.y)}]`
        : `architecture-beta\ngroup ${groupId}(cloud)[New Group]\n%% Position: ${groupId} = [${Math.round(
          position.x
        )}, ${Math.round(position.y)}]`;

      commitCodeUpdate(newCode);

      const newGroupNode = {
        id: groupId,
        type: "group",
        position,
        data: {
          nodeType: "group",
          groupData: { id: groupId, type: "cloud", label: "New Group" },
        },
        style: { width: 600, height: 400 },
        draggable: true,
        selectable: true,
        dragHandle: '.drag-handle',
      };

      setNodes((currentNodes) => [...currentNodes, newGroupNode]);
      setStatusMessage(`Added new group: ${groupId}`);
      setTimeout(() => setStatusMessage(""), 3000);

      // Save to history for undo/redo
      setTimeout(() => {
        if (!isApplyingHistory) {
          pushToHistory({ nodes: nodesRef.current, edges: edgesRef.current, code: codeRef.current });
        }
      }, 50);

      setTimeout(() => setPreventRerender(false), 100);
    },
    [commitCodeUpdate, setNodes, isApplyingHistory, pushToHistory, setEdges]
  );

  const addNewService = useCallback(
    (groupId = null, position = null) => {
      const serviceId = `service_${Date.now()}`;
      const currentCode = codeRef.current;

      let serviceLine;
      let finalPosition;

      if (groupId) {
        serviceLine = `service ${serviceId}(server)[New Service] in ${groupId}`;
        const groupNode = nodes.find((n) => n.id === groupId);

        if (groupNode) {
          const servicesInGroup = nodes.filter(
            (n) => n.type === "service" && n.parentNode === groupId
          );

          const serviceWidth = 180;
          const serviceHeight = 100;
          const horizontalSpacing = 50;
          const verticalSpacing = 80;
          const horizontalMargin = 50;
          const verticalMargin = 50;

          const servicesPerRow = Math.max(
            2,
            Math.floor(
              ((groupNode.style?.width || 600) - horizontalMargin * 2) /
              (serviceWidth + horizontalSpacing)
            )
          );
          const row = Math.floor(servicesInGroup.length / servicesPerRow);
          const col = servicesInGroup.length % servicesPerRow;

          finalPosition = {
            x: horizontalMargin + col * (serviceWidth + horizontalSpacing),
            y: verticalMargin + row * (serviceHeight + verticalSpacing),
          };

          console.log("Service position in group:", {
            groupPosition: groupNode.position,
            relativePosition: finalPosition,
            absolutePosition: {
              x: groupNode.position.x + finalPosition.x,
              y: groupNode.position.y + finalPosition.y,
            },
            servicesInGroup: servicesInGroup.length,
            row,
            col,
          });
        } else {
          finalPosition = { x: 100, y: 100 };
        }
      } else {
        serviceLine = `service ${serviceId}(server)[New Service]`;

        if (reactFlow) {
          const viewport = reactFlow.getViewport?.();
          const centerX =
            -viewport?.x + window.innerWidth / 2 / (viewport?.zoom || 1) - 90;
          const centerY =
            -viewport?.y + window.innerHeight / 2 / (viewport?.zoom || 1) - 50;
          finalPosition = { x: centerX, y: centerY };
        } else {
          finalPosition = { x: 500, y: 300 };
        }
      }

      if (position && isFinite(position.x) && isFinite(position.y)) {
        finalPosition = position;
      }

      const newCode = currentCode.includes("architecture-beta")
        ? currentCode +
        `\n${serviceLine}\n%% Position: ${serviceId} = [${Math.round(
          finalPosition.x
        )}, ${Math.round(finalPosition.y)}]`
        : `architecture-beta\n${serviceLine}\n%% Position: ${serviceId} = [${Math.round(
          finalPosition.x
        )}, ${Math.round(finalPosition.y)}]`;

      commitCodeUpdate(newCode);

      const newServiceNode = {
        id: serviceId,
        type: "service",
        position: finalPosition,
        data: {
          nodeType: "service",
          serviceData: {
            id: serviceId,
            type: "server",
            label: "New Service",
            group: groupId,
          },
        },
        draggable: true,
        parentNode: groupId || undefined,
        // Removed extent to allow dragging services between groups
      };

      setNodes((currentNodes) => [...currentNodes, newServiceNode]);
      setStatusMessage(`Added new service${groupId ? ` to ${groupId}` : ""}`);
      setTimeout(() => setStatusMessage(""), 3000);
    },
    [commitCodeUpdate, nodes, reactFlow, setNodes]
  );

  const deleteNode = useCallback(() => {
    if (!selectedNode) return;

    setPreventRerender(true);

    const currentCode = codeRef.current;
    const lines = currentCode.split("\n");
    const newLines = [];
    const nodeId = selectedNode.id;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (
        line.startsWith(`group ${nodeId}`) ||
        line.startsWith(`service ${nodeId}`) ||
        line.startsWith(`%% Position: ${nodeId}`) ||
        line.startsWith(`%% NodeStyle: ${nodeId}`) ||
        line.includes(`${nodeId}:`) ||
        line.includes(`:${nodeId}`)
      ) {
        continue;
      }
      newLines.push(lines[i]);
    }

    commitCodeUpdate(newLines.join("\n"));

    setNodes((currentNodes) =>
      currentNodes.filter((node) => node.id !== nodeId)
    );
    setEdges((currentEdges) =>
      currentEdges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      )
    );

    setSelectedNode(null);
    setStatusMessage(`Deleted ${selectedNode.data.nodeType}: ${nodeId}`);
    setTimeout(() => setStatusMessage(""), 3000);

    setTimeout(() => setPreventRerender(false), 100);
  }, [selectedNode, commitCodeUpdate, setNodes, setEdges]);

  const updateNode = useCallback(
    (nodeId, newData, nodeType) => {
      console.log("Updating node:", { nodeId, newData, nodeType });
      setPreventRerender(true);

      const currentCode = codeRef.current;
      console.log("Current code before update:", currentCode);

      const lines = currentCode.split("\n");
      const newLines = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (nodeType === "group" && line.startsWith(`group ${nodeId}`)) {
          console.log("Found group to update:", line);
          newLines.push(`group ${nodeId}(${newData.type})[${newData.label}]`);
          console.log(
            "Updated group to:",
            `group ${nodeId}(${newData.type})[${newData.label}]`
          );
        } else if (
          nodeType === "service" &&
          line.startsWith(`service ${nodeId}`)
        ) {
          console.log("Found service to update:", line);
          const inGroupMatch = line.match(/\s+in\s+(\w+)$/);
          const groupPart = inGroupMatch ? ` in ${inGroupMatch[1]}` : "";
          const updatedServiceLine = `service ${nodeId}(${newData.type})[${newData.label}]${groupPart}`;
          newLines.push(updatedServiceLine);
          console.log("Updated service to:", updatedServiceLine);
        } else if (line.startsWith(`%% NodeStyle: ${nodeId}`)) {
          // skip old node style line; we'll append a new one below if needed
          continue;
        } else {
          newLines.push(lines[i]);
        }
      }

      // Optionally append NodeStyle
      const styleParts = [];
      if (newData.outlineColor) styleParts.push(`outline:${newData.outlineColor}`);
      if (newData.backgroundColor)
        styleParts.push(`bg:${newData.backgroundColor}`);
      if (newData.borderStyle)
        styleParts.push(`borderStyle:${newData.borderStyle}`);
      if (styleParts.length) {
        newLines.push(`%% NodeStyle: ${nodeId} = ${styleParts.join("; ")}`);
      }

      const updatedCode = newLines.join("\n");
      console.log("Code after update:", updatedCode);

      commitCodeUpdate(updatedCode);

      setNodes((currentNodes) => {
        const updatedNodes = currentNodes.map((node) => {
          if (node.id === nodeId) {
            if (node.data.nodeType === "group") {
              return {
                ...node,
                data: {
                  ...node.data,
                  groupData: {
                    ...node.data.groupData,
                    label: newData.label,
                    type: newData.type,
                  },
                  customStyle: {
                    ...(node.data.customStyle || {}),
                    outlineColor: newData.outlineColor || (node.data.customStyle || {}).outlineColor,
                    backgroundColor:
                      newData.backgroundColor || (node.data.customStyle || {}).backgroundColor,
                    borderStyle:
                      newData.borderStyle || (node.data.customStyle || {}).borderStyle,
                  },
                },
              };
            } else if (node.data.nodeType === "service") {
              return {
                ...node,
                data: {
                  ...node.data,
                  serviceData: {
                    ...node.data.serviceData,
                    label: newData.label,
                    type: newData.type,
                  },
                  customStyle: {
                    ...(node.data.customStyle || {}),
                    outlineColor: newData.outlineColor || (node.data.customStyle || {}).outlineColor,
                    backgroundColor:
                      newData.backgroundColor || (node.data.customStyle || {}).backgroundColor,
                    borderStyle:
                      newData.borderStyle || (node.data.customStyle || {}).borderStyle,
                  },
                },
              };
            }
          }
          return node;
        });
        console.log("Nodes after update:", updatedNodes);
        return updatedNodes;
      });

      setShowEditPanel(false);
      setStatusMessage(`Updated ${nodeType}: ${nodeId}`);

      setTimeout(() => {
        console.log("Re-enabling re-renders");
        setPreventRerender(false);
      }, 2000);

      setTimeout(() => setStatusMessage(""), 3000);
    },
    [commitCodeUpdate, setNodes]
  );

  const handleRealTimeUpdate = useCallback(
    (nodeId, formData) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            if (node.data.nodeType === "group") {
              return {
                ...node,
                data: {
                  ...node.data,
                  groupData: { ...node.data.groupData, ...formData },
                  customStyle: {
                    ...(node.data.customStyle || {}),
                    outlineColor:
                      formData.outlineColor !== undefined
                        ? formData.outlineColor
                        : (node.data.customStyle || {}).outlineColor,
                    backgroundColor:
                      formData.backgroundColor !== undefined
                        ? formData.backgroundColor
                        : (node.data.customStyle || {}).backgroundColor,
                    borderStyle:
                      formData.borderStyle !== undefined
                        ? formData.borderStyle
                        : (node.data.customStyle || {}).borderStyle,
                  },
                },
                style: node.style,
              };
            } else if (node.data.nodeType === "service") {
              return {
                ...node,
                data: {
                  ...node.data,
                  serviceData: { ...node.data.serviceData, ...formData },
                  customStyle: {
                    ...(node.data.customStyle || {}),
                    outlineColor:
                      formData.outlineColor !== undefined
                        ? formData.outlineColor
                        : (node.data.customStyle || {}).outlineColor,
                    backgroundColor:
                      formData.backgroundColor !== undefined
                        ? formData.backgroundColor
                        : (node.data.customStyle || {}).backgroundColor,
                    borderStyle:
                      formData.borderStyle !== undefined
                        ? formData.borderStyle
                        : (node.data.customStyle || {}).borderStyle,
                  },
                },
                position: node.position,
              };
            }
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Handle individual node style changes
  const handleNodeStyleChange = useCallback(
    (nodeId, style) => {
      // Save to Zustand store (persists to localStorage)
      setNodeStyle(PAGE_NAME, nodeId, style);

      // Update local nodes state with individual style
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, individualStyle: style } }
            : node
        )
      );
    },
    [setNodes, setNodeStyle]
  );

  // Handle individual edge style changes
  const handleEdgeStyleChange = useCallback(
    (edgeId, style) => {
      // Save to Zustand store (persists to localStorage)
      setEdgeStyle(PAGE_NAME, edgeId, style);

      // Update local edges state with individual style
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            const updatedEdge = {
              ...edge,
              data: { ...edge.data, individualStyle: style },
              type: style.edgeType || edge.type || 'smoothstep',
              style: {
                stroke: style.stroke,
                strokeWidth: style.strokeWidth,
                strokeDasharray: style.strokeDasharray,
              },
              animated: style.animated,
            };

            // Handle markerStart (bidirectional arrow)
            if (style.markerStart) {
              updatedEdge.markerStart = {
                type: MarkerType.ArrowClosed,
                color: style.stroke,
                width: 20,
                height: 20,
              };
            } else {
              delete updatedEdge.markerStart;
            }

            // Handle markerEnd
            if (style.markerEnd) {
              updatedEdge.markerEnd = {
                type: MarkerType.ArrowClosed,
                color: style.stroke,
                width: 20,
                height: 20,
              };
            } else {
              delete updatedEdge.markerEnd;
            }

            return updatedEdge;
          }
          return edge;
        })
      );
    },
    [setEdges, setEdgeStyle]
  );

  // Handle node data changes (like label, type, icon)
  const handleNodeDataChange = useCallback(
    (nodeId, updates) => {
      // Save to history BEFORE changes for undo/redo
      if (!isApplyingHistory) {
        pushToHistory({ nodes: nodesRef.current, edges: edgesRef.current, code: codeRef.current });
      }

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            // Update group data
            if (node.data.nodeType === 'group' && updates.label !== undefined) {
              return {
                ...node,
                data: {
                  ...node.data,
                  groupData: {
                    ...node.data.groupData,
                    label: updates.label,
                  },
                },
              };
            }
            // Update service data (label, type, icon)
            else if (node.data.nodeType === 'service') {
              const serviceDataUpdates = {};
              if (updates.label !== undefined) serviceDataUpdates.label = updates.label;
              if (updates.type !== undefined) serviceDataUpdates.type = updates.type.toLowerCase();
              if (updates.icon !== undefined) serviceDataUpdates.icon = updates.icon;

              // Update code if any service property changed
              if (Object.keys(serviceDataUpdates).length > 0) {
                updateServiceInCode(nodeId, serviceDataUpdates);
              }

              return {
                ...node,
                data: {
                  ...node.data,
                  serviceData: {
                    ...node.data.serviceData,
                    ...serviceDataUpdates,
                  },
                },
              };
            }
          }
          return node;
        })
      );
    },
    [setNodes, updateServiceInCode, isApplyingHistory, pushToHistory, setEdges]
  );

  // Handle node deletion from NodeEditorPanel
  const handleNodeDelete = useCallback(
    (nodeId) => {
      // Save to history BEFORE deletion for undo/redo
      if (!isApplyingHistory) {
        pushToHistory({ nodes: nodesRef.current, edges: edgesRef.current, code: codeRef.current });
      }

      setPreventRerender(true);

      // Find the node being deleted to check its type
      const nodeToDelete = nodes.find((n) => n.id === nodeId);
      const isGroup = nodeToDelete?.data?.nodeType === 'group';

      // If deleting a group, find all services in that group
      const servicesToDetach = isGroup
        ? nodes.filter(
            (node) =>
              node.data?.nodeType === 'service' &&
              node.parentNode === nodeId
          )
        : [];

      const currentCode = codeRef.current;
      const lines = currentCode.split("\n");
      const newLines = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip lines related to the deleted node
        if (
          line.startsWith(`group ${nodeId}`) ||
          line.startsWith(`service ${nodeId}`) ||
          line.startsWith(`%% Position: ${nodeId}`) ||
          line.startsWith(`%% NodeStyle: ${nodeId}`) ||
          line.includes(`${nodeId}:`) ||
          line.includes(`:${nodeId}`)
        ) {
          continue;
        }

        // If deleting a group, detach services from it
        if (isGroup && servicesToDetach.length > 0) {
          let modifiedLine = lines[i];
          for (const service of servicesToDetach) {
            if (line.startsWith(`service ${service.id}`)) {
              // Remove the "in group_xyz" part
              modifiedLine = modifiedLine.replace(/ in \w+$/, '');
            }
          }
          newLines.push(modifiedLine);
        } else {
          newLines.push(lines[i]);
        }
      }

      commitCodeUpdate(newLines.join("\n"));

      // Update nodes state
      setNodes((currentNodes) => {
        // Remove the deleted node
        const remainingNodes = currentNodes.filter((node) => node.id !== nodeId);

        // If it was a group, detach all child services
        if (isGroup) {
          return remainingNodes.map((node) => {
            if (node.parentNode === nodeId) {
              // Detach service from the deleted group
              const { parentNode, ...rest } = node;
              return {
                ...rest,
                data: {
                  ...node.data,
                  groupData: undefined,
                },
                extent: undefined,
              };
            }
            return node;
          });
        }

        return remainingNodes;
      });

      // Remove edges connected to the deleted node
      setEdges((currentEdges) =>
        currentEdges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        )
      );

      setSelectedStyleNode(null);
      setStatusMessage(`Deleted node: ${nodeId}`);
      setTimeout(() => setStatusMessage(""), 3000);

      setTimeout(() => setPreventRerender(false), 100);
    },
    [commitCodeUpdate, setNodes, setEdges, nodes, isApplyingHistory, pushToHistory]
  );

  // Handle connection mode toggle
  const handleToggleConnectionMode = useCallback(() => {
    setConnectionMode((prev) => !prev);
    setConnectionSource(null);
    if (!connectionMode) {
      // Entering connection mode - close any open panels
      setEditorOpen(false);
      setCreateServiceMode(false);
      setStatusMessage("Connection Mode: Click on a source node, then a target node");
      setTimeout(() => setStatusMessage(""), 5000);
    } else {
      setStatusMessage("Connection Mode Disabled");
      setTimeout(() => setStatusMessage(""), 2000);
    }
  }, [connectionMode]);

  // Handle add service button click
  const handleAddServiceClick = useCallback(() => {
    setCreateServiceMode(true);
    setSelectedStyleNode(null);
    setSelectedStyleEdge(null);
    setEditorOpen(true);
  }, []);

  // Handle service creation from form
  const handleServiceCreate = useCallback(
    (serviceData) => {
      const serviceId = `service_${Date.now()}`;
      const currentCode = codeRef.current;

      // Generate service line with optional icon
      const typeAndIcon = serviceData.icon
        ? `${serviceData.type.toLowerCase()}, ${serviceData.icon}`
        : serviceData.type.toLowerCase();

      let serviceLine;
      if (serviceData.group) {
        serviceLine = `service ${serviceId}(${typeAndIcon})[${serviceData.label}] in ${serviceData.group}`;
      } else {
        serviceLine = `service ${serviceId}(${typeAndIcon})[${serviceData.label}]`;
      }

      const updatedCode = currentCode + '\n' + serviceLine;
      commitCodeUpdate(updatedCode);

      // Calculate position
      let position;
      if (serviceData.group) {
        const groupNode = nodes.find((n) => n.id === serviceData.group);
        if (groupNode) {
          const servicesInGroup = nodes.filter(
            (n) => n.type === "service" && n.parentNode === serviceData.group
          );
          const count = servicesInGroup.length;

          // Use proper spacing to prevent overlap
          const serviceWidth = 180;
          const serviceHeight = 100;
          const horizontalSpacing = 50;
          const verticalSpacing = 80;
          const horizontalMargin = 50;
          const verticalMargin = 50;

          // Calculate dynamic columns based on group width
          const servicesPerRow = Math.max(
            2,
            Math.floor(
              ((groupNode.style?.width || 600) - horizontalMargin * 2) /
              (serviceWidth + horizontalSpacing)
            )
          );

          const row = Math.floor(count / servicesPerRow);
          const col = count % servicesPerRow;

          position = {
            x: horizontalMargin + col * (serviceWidth + horizontalSpacing),
            y: verticalMargin + row * (serviceHeight + verticalSpacing),
          };
        }
      } else {
        // Standalone service
        const standaloneServices = nodes.filter(
          (n) => n.type === "service" && !n.parentNode
        );
        const index = standaloneServices.length;
        position = {
          x: 100 + (index % 3) * 230,
          y: 100 + Math.floor(index / 3) * 150,
        };
      }

      // Create new service node
      const newServiceNode = {
        id: serviceId,
        type: "service",
        position: position || { x: 100, y: 100 },
        data: {
          nodeType: "service",
          serviceData: {
            id: serviceId,
            type: serviceData.type.toLowerCase(),
            label: serviceData.label,
            group: serviceData.group || undefined,
            icon: serviceData.icon || undefined, // Custom icon override
          },
        },
        draggable: true,
        width: 180,
        height: 100,
      };

      if (serviceData.group) {
        newServiceNode.parentNode = serviceData.group;
        // Removed extent: "parent" to allow dragging between groups
      }

      setNodes((currentNodes) => [...currentNodes, newServiceNode]);
      setStatusMessage(`Added new service: ${serviceData.label}`);
      setTimeout(() => setStatusMessage(""), 3000);

      // Save to history for undo/redo
      setTimeout(() => {
        if (!isApplyingHistory) {
          pushToHistory({ nodes: nodesRef.current, edges: edgesRef.current, code: codeRef.current });
        }
      }, 100);
    },
    [commitCodeUpdate, nodes, setNodes, isApplyingHistory, pushToHistory, setEdges]
  );

  // Group toolbar handlers
  const handleGroupEdit = useCallback(() => {
    if (selectedGroupForToolbar) {
      // Hide the toolbar
      setGroupToolbarVisible(false);
      // Open the NodeEditorPanel for editing the group
      setCreateServiceMode(false);
      setSelectedStyleNode(selectedGroupForToolbar);
      setSelectedStyleEdge(null);
      setEditorOpen(true);
      // Clear the toolbar selection
      setSelectedGroupForToolbar(null);
    }
  }, [selectedGroupForToolbar]);

  const handleGroupDelete = useCallback(() => {
    if (selectedGroupForToolbar) {
      handleNodeDelete(selectedGroupForToolbar.id);
      setGroupToolbarVisible(false);
      setSelectedGroupForToolbar(null);
    }
  }, [selectedGroupForToolbar, handleNodeDelete]);

  const handleGroupAddService = useCallback(() => {
    if (selectedGroupForToolbar) {
      // Hide the toolbar
      setGroupToolbarVisible(false);
      // Set the pre-selected group ID
      setPreSelectedGroupId(selectedGroupForToolbar.id);
      // Open service creation panel with group pre-selected
      setCreateServiceMode(true);
      setSelectedStyleNode(null);
      setSelectedStyleEdge(null);
      setEditorOpen(true);
      // Clear the toolbar selection
      setSelectedGroupForToolbar(null);
    }
  }, [selectedGroupForToolbar]);

  // Service toolbar handlers
  const handleServiceEdit = useCallback(() => {
    if (selectedServiceForToolbar) {
      // Hide the toolbar
      setServiceToolbarVisible(false);
      // Open the NodeEditorPanel for editing the service
      setCreateServiceMode(false);
      setSelectedStyleNode(selectedServiceForToolbar);
      setSelectedStyleEdge(null);
      setEditorOpen(true);
      // Clear the toolbar selection
      setSelectedServiceForToolbar(null);
    }
  }, [selectedServiceForToolbar]);

  const handleServiceDelete = useCallback(() => {
    if (selectedServiceForToolbar) {
      handleNodeDelete(selectedServiceForToolbar.id);
      setServiceToolbarVisible(false);
      setSelectedServiceForToolbar(null);
    }
  }, [selectedServiceForToolbar, handleNodeDelete]);

  const onNodeClick = useCallback(
    (event, node) => {
      // Handle connection mode - MUST return early and NOT open panel
      if (connectionMode) {
        event.stopPropagation();
        if (!connectionSource) {
          // First click: set source
          setConnectionSource(node);
          setStatusMessage(`Source selected: ${node.data.nodeType === 'group' ? node.data.groupData.label : node.data.serviceData.label}. Click target node.`);
          setTimeout(() => setStatusMessage(""), 5000);
        } else {
          // Second click: create connection
          if (connectionSource.id !== node.id) {
            const newEdge = {
              id: `${connectionSource.id}-${node.id}`,
              source: connectionSource.id,
              target: node.id,
              sourceHandle: 'right',
              targetHandle: 'left',
              type: 'smoothstep',
              style: {
                stroke: '#000000',
                strokeWidth: 2,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#000000',
                width: 20,
                height: 20,
              },
              data: {
                individualStyle: {
                  stroke: '#000000',
                  strokeWidth: 2,
                  strokeDasharray: '0',
                  animated: false,
                  animation: 'none',
                  markerStart: false,
                  markerEnd: true,
                  edgeType: 'smoothstep',
                },
              },
            };
            setEdges((eds) => [...eds, newEdge]);

            // Also update the code
            const currentCode = codeRef.current;
            const edgeLine = `${connectionSource.id} --> ${node.id}`;
            const updatedCode = currentCode + '\n' + edgeLine;
            commitCodeUpdate(updatedCode);

            setStatusMessage(`Connection created!`);
            setTimeout(() => setStatusMessage(""), 2000);
          } else {
            setStatusMessage(`Cannot connect node to itself`);
            setTimeout(() => setStatusMessage(""), 2000);
          }
          setConnectionSource(null);
          setConnectionMode(false);
        }
        // CRITICAL: Return here to prevent panel from opening
        return;
      }

      // Normal mode: Check if it's a group or service
      if (node.data?.nodeType === 'group') {
        // Show floating action buttons for groups
        setSelectedGroupForToolbar(node);
        setServiceToolbarVisible(false);
        // Calculate floating button position (right side of the group)
        const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
        if (nodeElement) {
          const rect = nodeElement.getBoundingClientRect();
          setGroupToolbarPosition({
            x: rect.right + 16, // Position to the right of the group
            y: rect.top + 16, // Align with top of group with some padding
          });
          // Show buttons only after position is calculated
          setGroupToolbarVisible(true);
        }
      } else {
        // For services, show floating action buttons
        setSelectedServiceForToolbar(node);
        setGroupToolbarVisible(false);
        // Calculate floating button position (right side of the service)
        const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
        if (nodeElement) {
          const rect = nodeElement.getBoundingClientRect();
          setServiceToolbarPosition({
            x: rect.right + 16, // Position to the right of the service
            y: rect.top + 16, // Align with top of service with some padding
          });
          // Show buttons only after position is calculated
          setServiceToolbarVisible(true);
        }
      }

      // Don't open EditPanel anymore
      setSelectedNode(null);
      setSelectedEdge(null);
      setShowEditPanel(false);
    },
    [connectionMode, connectionSource, setEdges, reactFlow]
  );

 

  // Apply global styles to all nodes (styled nodes with customStyle)
  // Individual styles are already in node.data.individualStyle and take priority
  const styledNodes = React.useMemo(() => {
    return nodes.map((node) => {
      // Check if this node is the connection source
      const isConnectionSource = connectionMode && connectionSource && connectionSource.id === node.id;

      // Only apply customStyle if node doesn't have individualStyle
      // This ensures individual styles take priority
      return {
        ...node,
        data: {
          ...node.data,
          customStyle: globalStyles.node,
          // Keep individualStyle if it exists (it overrides customStyle in the node component)
        },
        // Add visual indicator for connection source
        className: isConnectionSource ? 'connection-source-highlight' : '',
        style: {
          ...node.style,
          ...(isConnectionSource && {
            boxShadow: '0 0 0 4px #f093fb, 0 0 20px rgba(240, 147, 251, 0.5)',
            zIndex: 1000,
          }),
        },
      };
    });
  }, [nodes, globalStyles.node, connectionMode, connectionSource]);

  // Apply global styles to all edges (styled edges)
  const styledEdges = React.useMemo(() => {
    return edges.map((edge) => {
      const individualStyle = edge.data?.individualStyle;

      // Build the base edge with markers
      let styledEdge = { ...edge };

      // Apply individual or global styles
      if (individualStyle) {
        styledEdge.type = individualStyle.edgeType || edge.type || 'smoothstep';
        styledEdge.className = individualStyle.animation !== 'none' ? individualStyle.animation : '';
        styledEdge.style = {
          ...(edge.style || {}),
          stroke: individualStyle.stroke || edge.style?.stroke || '#000000',
          strokeWidth: individualStyle.strokeWidth || edge.style?.strokeWidth || 4,
          strokeDasharray: individualStyle.strokeDasharray || edge.style?.strokeDasharray || '0',
        };
        styledEdge.animated = individualStyle.animated || false;

        // Apply markers based on individualStyle
        if (individualStyle.markerStart) {
          styledEdge.markerStart = {
            type: MarkerType.ArrowClosed,
            color: individualStyle.stroke || edge.style?.stroke || '#000000',
            width: 20,
            height: 20,
          };
        } else {
          delete styledEdge.markerStart;
        }

        if (individualStyle.markerEnd !== false) {
          styledEdge.markerEnd = {
            type: MarkerType.ArrowClosed,
            color: individualStyle.stroke || edge.style?.stroke || '#000000',
            width: 20,
            height: 20,
          };
        } else {
          delete styledEdge.markerEnd;
        }
      } else {
        // Apply global edge styles with increased visibility
        styledEdge.style = {
          ...(edge.style || {}),
          stroke: edge.style?.stroke || globalStyles.edge.stroke,
          strokeWidth: edge.style?.strokeWidth || globalStyles.edge.strokeWidth || 4,
          strokeDasharray: edge.style?.strokeDasharray || globalStyles.edge.strokeDasharray,
        };
        styledEdge.animated = globalStyles.edge.animated || edge.animated;
        styledEdge.className = globalStyles.edge.animation !== 'none' ? globalStyles.edge.animation : '';

        // Default marker at end if not specified
        if (!edge.markerEnd && !edge.data?.individualStyle) {
          styledEdge.markerEnd = {
            type: MarkerType.ArrowClosed,
            color: edge.style?.stroke || globalStyles.edge.stroke || '#000000',
            width: 20,
            height: 20,
          };
        }
      }

      return styledEdge;
    });
  }, [edges, globalStyles.edge]);

  const onConnect = useCallback(
    (params) => {
      setPreventRerender(true);

      const sourceHandle = params.sourceHandle || "right";
      const targetHandle = params.targetHandle || "left";

      const connectionLine = buildConnectionLine({
        source: params.source,
        target: params.target,
        sourceHandle,
        targetHandle,
      });
      const updatedCode = codeRef.current + "\n" + connectionLine;
      commitCodeUpdate(updatedCode);

      const newEdge = {
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        source: params.source,
        target: params.target,
        sourceHandle,
        targetHandle,
        type: "custom",
        style: { stroke: "#000000", strokeWidth: 2 },
        markerEnd: undefined,
        selectable: true,
        updatable: true,
        interactionWidth: 30,
      };

      setEdges((currentEdges) => [...currentEdges, newEdge]);
      setStatusMessage(`Connected ${params.source} to ${params.target}`);
      setTimeout(() => setStatusMessage(""), 3000);

      // Track connection creation in history
      if (!isApplyingHistory) {
        setTimeout(() => {
          pushToHistory({ nodes: nodesRef.current, edges: edgesRef.current, code: codeRef.current });
        }, 150);
      }

      setTimeout(() => setPreventRerender(false), 100);
    },
    [commitCodeUpdate, setEdges, setNodes, pushToHistory, isApplyingHistory]
  );

  useEffect(() => {
    if (code && typeof window !== "undefined" && !preventRerender) {
      console.log("Initializing diagram from code...");
      const initializeDiagram = () => {
        try {
          const archData = parseArchitectureCode(code);
          const { nodes: flowNodes, edges: flowEdges } =
            createFlowElements(archData);

          // Preserve individual styles and dimensions when reinitializing diagram
          setNodes((currentNodes) => {
            return flowNodes.map((newNode) => {
              const existingNode = currentNodes.find((n) => n.id === newNode.id);
              if (existingNode) {
                // Preserve individual style and dimensions from existing node
                const preserved = { ...newNode };

                if (existingNode.data?.individualStyle) {
                  preserved.data = {
                    ...preserved.data,
                    individualStyle: existingNode.data.individualStyle,
                  };
                }

                // Preserve dimensions if they were manually resized (not in saved dimensions)
                if (existingNode.width && existingNode.height &&
                    !archData.dimensions.has(newNode.id)) {
                  preserved.width = existingNode.width;
                  preserved.height = existingNode.height;
                  if (preserved.style) {
                    preserved.style = {
                      ...preserved.style,
                      width: existingNode.width,
                      height: existingNode.height
                    };
                  }
                }

                return preserved;
              }
              return newNode;
            });
          });

          setEdges((currentEdges) => {
            return flowEdges.map((newEdge) => {
              const existingEdge = currentEdges.find((e) => e.id === newEdge.id);
              if (existingEdge?.data?.individualStyle) {
                // Preserve individual style
                return {
                  ...newEdge,
                  data: {
                    ...newEdge.data,
                    individualStyle: existingEdge.data.individualStyle,
                  },
                  style: {
                    stroke: existingEdge.data.individualStyle.stroke,
                    strokeWidth: existingEdge.data.individualStyle.strokeWidth,
                    strokeDasharray: existingEdge.data.individualStyle.strokeDasharray,
                  },
                  animated: existingEdge.data.individualStyle.animated,
                };
              }
              return newEdge;
            });
          });

          setSvg(null);

          // If this code change came from MermaidEditor (debounced), push to history
          if (shouldPushHistoryOnParse && !isApplyingHistory) {
            // Reset the flag immediately to prevent duplicate pushes
            useStore.setState({ shouldPushHistoryOnParse: false });
            // Schedule history push after state updates complete
            setTimeout(() => {
              pushToHistory({ nodes: nodesRef.current, edges: edgesRef.current, code });
            }, 100);
          }
        } catch (error) {
          console.error("Error initializing diagram:", error);
        }
      };

      initializeDiagram();
    }
  }, [
    code,
    parseArchitectureCode,
    createFlowElements,
    setNodes,
    setEdges,
    setSvg,
    preventRerender,
    shouldPushHistoryOnParse,
    isApplyingHistory,
    pushToHistory,
  ]);

  useEffect(() => {
    const hasInvalidPositions = nodes.some(
      (node) =>
        !node.position ||
        !isFinite(node.position.x) ||
        !isFinite(node.position.y)
    );

    if (hasInvalidPositions) {
      console.warn("Found nodes with invalid positions, resetting...");
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (
            !node.position ||
            !isFinite(node.position.x) ||
            !isFinite(node.position.y)
          ) {
            return {
              ...node,
              position: { x: 100, y: 100 },
            };
          }
          return node;
        })
      );
    }
  }, [nodes, setNodes]);

  useEffect(() => {
    if (selectedEdge && !edges.some((edge) => edge.id === selectedEdge.id)) {
      setSelectedEdge(null);
    }
  }, [edges, selectedEdge, setSelectedEdge]);

  useEffect(() => {
    const hasUndraggableNodes = nodes.some(
      (node) => node.draggable === undefined || node.draggable === false
    );
    if (hasUndraggableNodes) {
      console.log("Fixing undraggable nodes...");
      setNodes((currentNodes) =>
        currentNodes.map((node) => ({
          ...node,
          draggable: true,
          selectable: true,
        }))
      );
    }
  }, [nodes, setNodes]);

  // Handle confirming the move
  const handleConfirmMove = useCallback(() => {
    if (!pendingMove) return;

    const { node, newParentId, absolutePosition } = pendingMove;

    // Prevent re-render from code update overwriting node changes
    setPreventRerender(true);

    setNodes((currentNodes) => {
      let updatedNodes = [...currentNodes];
      const draggedNode = updatedNodes.find((n) => n.id === node.id);

      if (draggedNode && draggedNode.type === "service") {
        const serviceSize = getNodeDimensions(node.id, { width: 180, height: 120 });

        if (newParentId) {
          // Moving into a group
          const containingGroup = updatedNodes.find((n) => n.id === newParentId);

          if (containingGroup) {
            const groupAbsolute = getAbsoluteNodePosition(
              containingGroup,
              updatedNodes
            );
            const relativePosition = {
              x: absolutePosition.x - groupAbsolute.x,
              y: absolutePosition.y - groupAbsolute.y,
            };
            const clamped = clampRelativePositionToGroup(
              relativePosition,
              containingGroup,
              serviceSize
            );

            // Update the code first
            updateServiceGroupInCode(draggedNode.id, containingGroup.id);

            updatedNodes = updatedNodes.map((n) =>
              n.id === draggedNode.id
                ? {
                    ...n,
                    parentNode: containingGroup.id,
                    // Removed extent: "parent" to allow future dragging between groups
                    position: clamped,
                    data: {
                      ...n.data,
                      serviceData: {
                        ...n.data.serviceData,
                        group: containingGroup.id,
                      },
                    },
                  }
                : n
            );
          }
        } else {
          // Moving out of a group
          updateServiceGroupInCode(draggedNode.id, null);
          updatedNodes = updatedNodes.map((n) =>
            n.id === draggedNode.id
              ? {
                  ...n,
                  parentNode: undefined,
                  extent: undefined,
                  position: absolutePosition,
                  data: {
                    ...n.data,
                    serviceData: {
                      ...n.data.serviceData,
                      group: null,
                    },
                  },
                }
              : n
          );
        }
      }

      setTimeout(() => {
        saveNodePositionsToCode(updatedNodes);
        // Allow re-renders after positions are saved
        setTimeout(() => setPreventRerender(false), 100);
      }, 100);

      return updatedNodes;
    });

    setMoveDialogOpen(false);
    setPendingMove(null);
  }, [
    pendingMove,
    setNodes,
    getNodeDimensions,
    getAbsoluteNodePosition,
    clampRelativePositionToGroup,
    updateServiceGroupInCode,
    saveNodePositionsToCode,
    setPreventRerender,
  ]);

  // Handle canceling the move
  const handleCancelMove = useCallback(() => {
    if (!pendingMove) return;

    const { node, originalPosition, oldParentId } = pendingMove;

    // Restore original position
    setNodes((currentNodes) =>
      currentNodes.map((n) =>
        n.id === node.id
          ? {
              ...n,
              position: originalPosition,
              parentNode: oldParentId,
              // Removed extent to allow dragging between groups
            }
          : n
      )
    );

    setMoveDialogOpen(false);
    setPendingMove(null);
  }, [pendingMove, setNodes]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      ref={chartRef}
      sx={{
        height: "100vh",
        position: "relative",
        background: "#ffffff",
      }}
    >
      {/* Top Right Controls: Undo/Redo + Save */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 999,
          display: "flex",
          gap: 1,
          alignItems: "center",
        }}
      >
        {/* Undo/Redo Buttons */}
        <Tooltip title="Undo (Ctrl+Z)">
          <span>
            <IconButton
              onClick={archUndo}
              disabled={!canUndo}
              sx={{
                backgroundColor: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                "&:hover": { backgroundColor: "#f5f5f5" },
                "&:disabled": { backgroundColor: "#f0f0f0" },
              }}
            >
              <UndoIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Redo (Ctrl+Y)">
          <span>
            <IconButton
              onClick={archRedo}
              disabled={!canRedo}
              sx={{
                backgroundColor: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                "&:hover": { backgroundColor: "#f5f5f5" },
                "&:disabled": { backgroundColor: "#f0f0f0" },
              }}
            >
              <RedoIcon />
            </IconButton>
          </span>
        </Tooltip>

        {/* Save to Backend Button */}
        {id && id !== "new" && (
          <Button
            sx={{
              backgroundColor: "#FF3480",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#e02d70",
              },
            }}
            onClick={handleSaveToBackend}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          >
            {isSaving ? "Saving..." : "Save Chart"}
          </Button>
        )}
      </Box>

      <StatusDisplay message={statusMessage} />

      {showEditPanel && selectedNode && (
        <EditPanel
          selectedNode={selectedNode}
          onSave={updateNode}
          onUpdate={handleRealTimeUpdate}
          onClose={() => setShowEditPanel(false)}
        />
      )}

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
          {selectedNode.data.nodeType === "group" && (
            <Tooltip title="Add Service to Group">
              <IconButton
                size="small"
                onClick={() => addNewService(selectedNode.id)}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {selectedEdge && (
        <Box
          sx={{
            position: "absolute",
            top: 100,
            left: 20,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: 1,
            background: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            border: "1px solid #000000",
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontSize: "12px", fontWeight: 600, color: "#000000" }}
          >
            {selectedEdge.source} → {selectedEdge.target}
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="edge-type-label">Line</InputLabel>
            <Select
              labelId="edge-type-label"
              label="Line"
              value={
                selectedEdge?.type && selectedEdge.type !== "custom"
                  ? selectedEdge.type
                  : "bezier"
              }
              onChange={(e) => {
                const val = e.target.value;
                const mappedType = val === "bezier" ? "custom" : val;
                setEdges((eds) =>
                  eds.map((ed) =>
                    ed.id === selectedEdge.id ? { ...ed, type: mappedType } : ed
                  )
                );
                const updated = { ...selectedEdge, type: mappedType };
                setSelectedEdge(updated);
                upsertEdgeStyleInCode(updated);
              }}
            >
              <MenuItem value="bezier">Bezier</MenuItem>
              <MenuItem value="straight">Straight</MenuItem>
              <MenuItem value="step">Step</MenuItem>
              <MenuItem value="smoothstep">Smooth Step</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="edge-color-label">Color</InputLabel>
            <Select
              labelId="edge-color-label"
              label="Color"
              value={selectedEdge?.style?.stroke || "#000000"}
              onChange={(e) => {
                const stroke = e.target.value;
                setEdges((eds) =>
                  eds.map((ed) =>
                    ed.id === selectedEdge.id
                      ? {
                        ...ed,
                        style: { ...ed.style, stroke },
                        markerEnd: ed.markerEnd
                          ? { ...ed.markerEnd, color: stroke }
                          : undefined,
                        markerStart: ed.markerStart
                          ? { ...ed.markerStart, color: stroke }
                          : undefined,
                      }
                      : ed
                  )
                );
                const updated = {
                  ...selectedEdge,
                  style: { ...(selectedEdge.style || {}), stroke },
                  markerEnd: selectedEdge.markerEnd
                    ? { ...selectedEdge.markerEnd, color: stroke }
                    : undefined,
                  markerStart: selectedEdge.markerStart
                    ? { ...selectedEdge.markerStart, color: stroke }
                    : undefined,
                };
                setSelectedEdge(updated);
                upsertEdgeStyleInCode(updated);
              }}
            >
              {[
                "#000000",
                "#d32f2f",
                "#1976d2",
                "#2e7d32",
                "#ed6c02",
                "#6a1b9a",
                "#455a64",
              ].map((c) => (
                <MenuItem key={c} value={c}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 14, height: 14, bgcolor: c, border: '1px solid #000', borderRadius: '2px' }} />
                    <Typography sx={{ fontSize: 12 }}>{c}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="edge-dash-label">Dash</InputLabel>
            <Select
              labelId="edge-dash-label"
              label="Dash"
              value={selectedEdge?.style?.strokeDasharray || "none"}
              onChange={(e) => {
                const v = e.target.value;
                const dash = v === "none" ? undefined : v;
                setEdges((eds) =>
                  eds.map((ed) =>
                    ed.id === selectedEdge.id
                      ? { ...ed, style: { ...ed.style, strokeDasharray: dash } }
                      : ed
                  )
                );
                const updated = {
                  ...selectedEdge,
                  style: { ...(selectedEdge.style || {}), strokeDasharray: dash },
                };
                setSelectedEdge(updated);
                upsertEdgeStyleInCode(updated);
              }}
            >
              <MenuItem value="none">Solid</MenuItem>
              <MenuItem value="4,2">Dash 4-2</MenuItem>
              <MenuItem value="6,2">Dash 6-2</MenuItem>
              <MenuItem value="8,4">Dash 8-4</MenuItem>
              <MenuItem value="2,2">Dot 2-2</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel id="arrow-direction-label">Arrow</InputLabel>
            <Select
              labelId="arrow-direction-label"
              label="Arrow"
              value={
                selectedEdge?.markerStart && selectedEdge?.markerEnd
                  ? "both"
                  : selectedEdge?.markerStart
                    ? "start"
                    : selectedEdge?.markerEnd
                      ? "end"
                      : "none"
              }
              onChange={(e) => {
                const val = e.target.value;
                const color = selectedEdge?.style?.stroke || "#000000";
                const arrowMarker = { type: MarkerType.ArrowClosed, color };

                let markerStart = undefined;
                let markerEnd = undefined;

                if (val === "end" || val === "both") {
                  markerEnd = arrowMarker;
                }
                if (val === "start" || val === "both") {
                  markerStart = arrowMarker;
                }

                setEdges((eds) =>
                  eds.map((ed) => (ed.id === selectedEdge.id ? { ...ed, markerStart, markerEnd } : ed))
                );
                const updated = { ...selectedEdge, markerStart, markerEnd };
                setSelectedEdge(updated);
                upsertEdgeStyleInCode(updated);
              }}
              sx={{ minWidth: 100 }}
            >
              <MenuItem value="end">End Arrow →</MenuItem>
              <MenuItem value="start">← Start Arrow</MenuItem>
              <MenuItem value="both">↔ Both Arrows</MenuItem>
              <MenuItem value="none">— No Arrows</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Delete Connection">
            <IconButton
              size="small"
              onClick={() => handleDeleteEdge(selectedEdge.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton size="small" onClick={() => setSelectedEdge(null)}>
              <CloseIcon fontSize="small" />
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
          onClick={() => addNewGroup()}
          sx={{
            backgroundColor: "#000000",
            color: "#ffffff",
            fontSize: "11px",
            "&:hover": {
              backgroundColor: "#333333",
            },
          }}
        >
          Add Group
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => addNewService()}
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
          Add Service
        </Button>
      </Box>

      {/* Global Diagram Style Panel (left side) */}
      <DiagramStylePanel
        onStyleChange={setGlobalStyles}
        initialStyles={globalStyles}
      />

      {/* Individual Node/Edge Editor Panel (right side) */}
      {editorOpen && (
        <NodeEditorPanel
          selectedNode={selectedStyleNode}
          selectedEdge={selectedStyleEdge}
          createMode={createServiceMode}
          preSelectedGroup={preSelectedGroupId}
          availableGroups={nodes.filter(n => n.data?.nodeType === 'group').map(n => ({
            id: n.id,
            label: n.data.groupData.label
          }))}
          onNodeStyleChange={handleNodeStyleChange}
          onEdgeStyleChange={handleEdgeStyleChange}
          onNodeDataChange={handleNodeDataChange}
          onNodeDelete={handleNodeDelete}
          onEdgeDelete={handleDeleteEdge}
          onServiceCreate={handleServiceCreate}
          onClose={() => {
            setEditorOpen(false);
            setCreateServiceMode(false);
            setPreSelectedGroupId('');
          }}
        />
      )}

      <NodeActionsContext.Provider value={{}}>
        <GroupHoverContext.Provider value={{ hoveredGroupId }}>
          <div
            className={
              showEditPanel || connectionMode || editorOpen || isUpdatingEdge
                ? 'react-flow-no-animations'
                : ''
            }
            style={{ width: '100%', height: '100%' }}
          >
            <style>
              {`
                .react-flow-no-animations .react-flow__node,
                .react-flow-no-animations .react-flow__edge,
                .react-flow-no-animations .react-flow__handle {
                  transition: none !important;
                  animation: none !important;
                }
              `}
            </style>
            <ReactFlow
              nodes={styledNodes}
              edges={styledEdges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onNodeClick={onNodeClick}
              onNodeDragStart={onNodeDragStart}
              onNodeDrag={onNodeDrag}
              onNodeDragStop={onNodeDragStop}
              onConnect={onConnect}
              onEdgeClick={handleEdgeClick}
              onEdgeUpdate={handleEdgeUpdate}
              onEdgeUpdateStart={handleEdgeUpdateStart}
              onEdgeUpdateEnd={handleEdgeUpdateEnd}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              fitViewOptions={{
                padding: 0.2,
                includeHiddenNodes: false,
                minZoom: 0.1,
                maxZoom: 2,
                duration: showEditPanel || connectionMode || editorOpen || isUpdatingEdge ? 0 : 200,
              }}
              minZoom={0.05}
              maxZoom={3}
              proOptions={{ hideAttribution: true }}
              nodesDraggable={true}
              nodesConnectable={true}
              elementsSelectable={true}
              edgesUpdatable={true}
              selectNodesOnDrag={false}
              elevateEdgesOnSelect={true}
              snapToGrid={false}
              panOnDrag={[1, 2]}
              zoomOnScroll={true}
              zoomOnDoubleClick={false}
              defaultEdgeOptions={{
                type: "custom",
                style: {
                  stroke: "#000000",
                  strokeWidth: 4,
                },
                markerEnd: undefined,
              }}
              connectionLineType={ConnectionLineType.SimpleBezier}
              connectionMode={ConnectionMode.Loose}
              connectionRadius={30}
              connectionLineStyle={{
                stroke: "#000000",
                strokeWidth: 4,
              }}
              nodeOrigin={[0, 0]}
              edgeUpdaterRadius={10}
              deleteKeyCode={["Backspace", "Delete"]}
            >
              <Background color="#f0f0f0" gap={25} size={1} />
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
          </div>
        </GroupHoverContext.Provider>
      </NodeActionsContext.Provider>

      {/* Group Floating Action Buttons */}
      {groupToolbarVisible && selectedGroupForToolbar && groupToolbarPosition && (
        <div
          key={`group-fab-${selectedGroupForToolbar.id}`}
          style={{
            position: 'fixed',
            left: `${groupToolbarPosition.x}px`,
            top: `${groupToolbarPosition.y}px`,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Edit Button */}
          <Tooltip title="Edit Group" placement="left">
            <IconButton
              onClick={handleGroupEdit}
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
            >
              <EditIcon style={{ fontSize: '24px' }} />
            </IconButton>
          </Tooltip>

          {/* Delete Button */}
          <Tooltip title="Delete Group" placement="left">
            <IconButton
              onClick={handleGroupDelete}
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
              }}
            >
              <DeleteIcon style={{ fontSize: '24px' }} />
            </IconButton>
          </Tooltip>

          {/* Add Service Button */}
          <Tooltip title="Add Service to Group" placement="left">
            <IconButton
              onClick={handleGroupAddService}
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
              }}
            >
              <AddIcon style={{ fontSize: '24px' }} />
            </IconButton>
          </Tooltip>
        </div>
      )}

      {/* Service Floating Action Buttons */}
      {serviceToolbarVisible && selectedServiceForToolbar && serviceToolbarPosition && (
        <div
          key={`service-fab-${selectedServiceForToolbar.id}`}
          style={{
            position: 'fixed',
            left: `${serviceToolbarPosition.x}px`,
            top: `${serviceToolbarPosition.y}px`,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Edit Button */}
          <Tooltip title="Edit Service" placement="left">
            <IconButton
              onClick={handleServiceEdit}
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
            >
              <EditIcon style={{ fontSize: '24px' }} />
            </IconButton>
          </Tooltip>

          {/* Delete Button */}
          <Tooltip title="Delete Service" placement="left">
            <IconButton
              onClick={handleServiceDelete}
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
              }}
            >
              <DeleteIcon style={{ fontSize: '24px' }} />
            </IconButton>
          </Tooltip>
        </div>
      )}

      {/* Connection Mode Overlay */}
      {connectionMode && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 999,
            border: '4px dashed #f093fb',
            background: 'rgba(240, 147, 251, 0.05)',
          }}
        />
      )}

      {/* Connection Mode Instructions */}
      {connectionMode && connectionSource && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 1002,
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          Source: {connectionSource.data.nodeType === 'group' ? connectionSource.data.groupData.label : connectionSource.data.serviceData.label} → Click target node
        </div>
      )}

      {/* Drag Service Instructions - Visual Feedback */}
      {hoveredGroupId && nodes.some(n => n.id === hoveredGroupId && n.data?.nodeType === 'group') && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 1002,
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>📦</span>
          <span>Release to move to: {nodes.find(n => n.id === hoveredGroupId)?.data?.groupData?.label}</span>
        </div>
      )}

      {/* Move Confirmation Dialog */}
      <Dialog
        open={moveDialogOpen}
        onClose={handleCancelMove}
        aria-labelledby="move-dialog-title"
        aria-describedby="move-dialog-description"
      >
        <DialogTitle id="move-dialog-title">
          Confirm Node Move
        </DialogTitle>
        <DialogContent>
          <Typography id="move-dialog-description">
            {pendingMove && pendingMove.newParentId ? (
              <>
                Move "{pendingMove.node?.data?.serviceData?.label || pendingMove.node?.id}" to group "
                {nodes.find((n) => n.id === pendingMove.newParentId)?.data?.groupData?.label || pendingMove.newParentId}"?
              </>
            ) : (
              <>
                Remove "{pendingMove?.node?.data?.serviceData?.label || pendingMove?.node?.id}" from group "
                {nodes.find((n) => n.id === pendingMove?.oldParentId)?.data?.groupData?.label || pendingMove?.oldParentId}"?
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelMove} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmMove} variant="contained" color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

const ArchitectureDiagramWrapper = (props) => (
  <ReactFlowProvider>
    <ArchitectureDiagramView {...props} />
  </ReactFlowProvider>
);

export default ArchitectureDiagramWrapper;

