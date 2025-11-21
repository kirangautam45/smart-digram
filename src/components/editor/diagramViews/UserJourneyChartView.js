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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { useStore } from "@/store";
import { ChartContext } from "@/app/layout";
import { useParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";

// Custom node for User Journey Tasks
const UserJourneyTaskNode = ({ data }) => {
  return (
    <div
      style={{
        background: "white",
        border: "2px solid #000",
        borderRadius: "8px",
        padding: "16px",
        width: "200px",
        height: "80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {/* Task Name */}
      <div
        style={{
          fontWeight: "bold",
          fontSize: "14px",
          lineHeight: "1.3",
          textAlign: "center",
          color: "#000",
          marginBottom: "8px",
        }}
      >
        {data.taskName}
      </div>

      {/* Actor */}
      <div
        style={{
          color: "#000",
          fontWeight: "500",
          fontSize: "12px",
        }}
      >
        {data.actor}
      </div>
    </div>
  );
};

// Custom node for Sections with flexible width
const UserJourneySectionNode = ({ data }) => {
  return (
    <div
      style={{
        background: "white",
        color: "#000",
        border: "2px solid #000",
        borderRadius: "6px",
        padding: "12px 20px",
        width: `${data.width}px`,
        height: "60px",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: "14px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {data.sectionName}
    </div>
  );
};

// Custom node for Face Icons
const FaceIconNode = ({ data }) => {
  const getScoreFace = (score) => {
    if (score >= 4) return "😊";
    if (score >= 3) return "😐";
    return "😞";
  };

  return (
    <div
      style={{
        background: "white",
        border: "2px solid #000",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        fontWeight: "bold",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >
      {getScoreFace(data.score)}
      {/* Score Badge */}
      <div
        style={{
          position: "absolute",
          top: "-5px",
          right: "-5px",
          background: "#000",
          color: "white",
          borderRadius: "50%",
          width: "20px",
          height: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          fontWeight: "bold",
        }}
      >
        {data.score}
      </div>
    </div>
  );
};

// Custom node for Horizontal Timeline
const HorizontalTimelineNode = ({ data }) => {
  return (
    <div
      style={{
        width: `${data.width}px`,
        height: "4px",
        background: "#000",
        position: "relative",
      }}
    >
      {/* Arrow at the end */}
      <div
        style={{
          position: "absolute",
          right: "-10px",
          top: "-8px",
          width: "0",
          height: "0",
          borderLeft: "10px solid #000",
          borderTop: "10px solid transparent",
          borderBottom: "10px solid transparent",
        }}
      />
    </div>
  );
};

// Custom node for Dashed Vertical Lines
const DashedVerticalLineNode = ({ data }) => {
  return (
    <div
      style={{
        width: "2px",
        height: `${data.height}px`,
        background: "transparent",
        borderLeft: "2px dashed #000",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    />
  );
};

// Custom node for Solid Vertical Lines
const SolidVerticalLineNode = ({ data }) => {
  return (
    <div
      style={{
        width: "2px",
        height: `${data.height}px`,
        background: "#000",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    />
  );
};

const nodeTypes = {
  journeyTask: UserJourneyTaskNode,
  journeySection: UserJourneySectionNode,
  faceIcon: FaceIconNode,
  horizontalTimeline: HorizontalTimelineNode,
  dashedVerticalLine: DashedVerticalLineNode,
  solidVerticalLine: SolidVerticalLineNode,
};

const UserJourneyChartView = ({ color, fontSizes }) => {
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
  const [selectedNode, setSelectedNode] = useState(null);
  const [validateCode, setValidateCode] = useState("");
  const [validateConfig, setValidateConfig] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const codeRef = useRef(code);
  codeRef.current = code;

  const debounceCode = useDebounce(code, { wait: 300 });
  const debounceConfig = useDebounce(config, { wait: 300 });

  // Parse Mermaid Journey Code
  const parseJourneyCode = useCallback((text) => {
    const result = {
      title: "",
      sections: [],
    };

    if (!text || !text.trim().startsWith("journey")) {
      return result;
    }

    const lines = text.split("\n");
    let currentSection = null;

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed === "journey") continue;

      // Parse title
      const titleMatch = trimmed.match(/^title\s+(.+)$/);
      if (titleMatch) {
        result.title = titleMatch[1];
        continue;
      }

      // Parse section
      const sectionMatch = trimmed.match(/^section\s+(.+)$/);
      if (sectionMatch) {
        if (currentSection) {
          result.sections.push(currentSection);
        }
        currentSection = {
          name: sectionMatch[1],
          tasks: [],
        };
        continue;
      }

      // Parse task
      if (currentSection) {
        const taskMatch = trimmed.match(/^\s*(.+?):\s*(\d+):\s*(.+)$/);
        if (taskMatch) {
          const [, taskName, score, actor] = taskMatch;
          currentSection.tasks.push({
            name: taskName.trim(),
            score: parseInt(score),
            actor: actor.trim(),
          });
        }
      }
    }

    if (currentSection) {
      result.sections.push(currentSection);
    }

    return result;
  }, []);

  const createFlowElements = useCallback((journeyData) => {
    const nodes = [];
    const edges = [];

    const TASK_SPACING = 220;
    const START_X = 100;
    const START_Y = 100;
    const TIMELINE_Y = START_Y + 230;

    // Calculate total width needed for the diagram
    let totalWidth = 50;
    const sectionWidths = [];

    // Calculate width for each section based on number of tasks
    journeyData.sections.forEach((section) => {
      const sectionWidth = Math.max(200, section.tasks.length * TASK_SPACING);
      sectionWidths.push(sectionWidth);
      totalWidth += sectionWidth + 100;
    });

    // Create title node
    if (journeyData.title) {
      nodes.push({
        id: "title",
        type: "default",
        position: { x: START_X, y: 30 },
        data: {
          label: (
            <div
              style={{
                padding: "16px 32px",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#000",
                textAlign: "center",
              }}
            >
              {journeyData.title}
            </div>
          ),
        },
        style: {
          background: "transparent",
          border: "none",
          width: "fit-content",
        },
      });
    }

    // Create main horizontal timeline that spans the entire diagram
    nodes.push({
      id: "main-timeline",
      type: "horizontalTimeline",
      position: { x: START_X - 50, y: TIMELINE_Y },
      data: {
        width: totalWidth,
        nodeType: "timeline",
      },
      style: {
        background: "transparent",
        border: "none",
      },
      draggable: true,
      selectable: true,
    });

    let currentSectionX = START_X;

    // Create sections, tasks, and face icons
    journeyData.sections.forEach((section, sectionIndex) => {
      const sectionId = `section-${sectionIndex}`;
      const sectionWidth = sectionWidths[sectionIndex];

      // Position section in the center above its tasks
      const sectionCenterX = currentSectionX + sectionWidth / 2 - 100;

      // Section node with flexible width based on tasks
      nodes.push({
        id: sectionId,
        type: "journeySection",
        position: { x: sectionCenterX, y: START_Y },
        data: {
          sectionName: section.name,
          width: sectionWidth,
          nodeType: "section",
          sectionIndex,
        },
        draggable: true,
      });

      // Task nodes for this section - arranged horizontally within section width
      section.tasks.forEach((task, taskIndex) => {
        const taskId = `task-${sectionIndex}-${taskIndex}`;
        // Distribute tasks evenly within the section width
        const taskX =
          currentSectionX +
          taskIndex * (sectionWidth / section.tasks.length) +
          (sectionWidth / section.tasks.length - 1) / 2;
        const taskY = START_Y + 100;

        nodes.push({
          id: taskId,
          type: "journeyTask",
          position: { x: taskX, y: taskY },
          data: {
            nodeType: "task",
            taskName: task.name,
            score: task.score,
            actor: task.actor,
            sectionIndex,
            taskIndex,
          },
        });

        const faceId = `face-${sectionIndex}-${taskIndex}`;

        const verticalOffset = (5 - task.score) * 15;
        const faceY = TIMELINE_Y + 80 - verticalOffset;
        const faceX = taskX + 80;
        const faceYs = taskY + 100;

        nodes.push({
          id: faceId,
          type: "faceIcon",
          position: { x: faceX, y: faceY },
          data: {
            nodeType: "face",
            score: task.score,
            sectionIndex,
            taskIndex,
          },
        });

        const topConnectorId = `top-connector-${sectionIndex}-${taskIndex}`;
        const bottomConnectorId = `bottom-connector-${sectionIndex}-${taskIndex}`;

        // Top connector (below task)
        nodes.push({
          id: topConnectorId,
          type: "default",
          position: { x: faceX, y: taskY + 300 },
          data: {},
          style: {
            width: 1,
            height: 1,
            background: "transparent",
            border: "none",
          },
          draggable: false,
          selectable: false,
        });

        // Bottom connector (above face icon)
        nodes.push({
          id: bottomConnectorId,
          type: "default",
          position: { x: faceX, y: faceYs - 20 },
          data: {},
          style: {
            width: 1,
            height: 1,
            background: "transparent",
            border: "none",
          },
          draggable: false,
          selectable: false,
        });

        edges.push({
          id: `dashed-${sectionIndex}-${taskIndex}`,
          source: topConnectorId,
          target: bottomConnectorId,
          type: "straight",
          style: {
            stroke: "#000",
            strokeWidth: 2,
            strokeDasharray: "5,5",
          },
        });

        // **SOLID line from face icon to timeline**
        edges.push({
          id: `solid-${sectionIndex}-${taskIndex}`,
          source: faceId,
          target: "main-timeline",
          type: "straight",
          style: {
            stroke: "#000",
            strokeWidth: 2,
          },
        });

        // Connect section to task
        edges.push({
          id: `section-task-${sectionId}-${taskId}`,
          source: sectionId,
          target: taskId,
          type: "straight",
          style: {
            stroke: "#000",
            strokeWidth: 1,
          },
        });
      });

      // Move to next section position
      currentSectionX += sectionWidth + 100;
    });

    return { nodes, edges };
  }, []);

  // Update code functions
  const updateJourneyCode = useCallback(
    (updater) => {
      const newCode = updater(codeRef.current);
      setCode(newCode);
      sessionStorage.setItem("code", newCode);
    },
    [setCode]
  );

  const updateSectionName = useCallback(
    (oldName, newName) => {
      updateJourneyCode((code) => {
        return code.replace(
          new RegExp(
            `section\\s+${oldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
            "g"
          ),
          `section ${newName}`
        );
      });
    },
    [updateJourneyCode]
  );

  const updateTaskDetails = useCallback(
    (sectionIndex, taskIndex, updates) => {
      updateJourneyCode((code) => {
        const lines = code.split("\n");
        let currentSectionIndex = -1;
        let currentTaskIndex = 0;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          if (line.startsWith("section ")) {
            currentSectionIndex++;
            currentTaskIndex = 0;
            continue;
          }

          if (
            currentSectionIndex === sectionIndex &&
            line.match(/^\s*.+:\s*\d+:\s*.+$/)
          ) {
            if (currentTaskIndex === taskIndex) {
              const taskMatch = line.match(/^\s*(.+?):\s*(\d+):\s*(.+)$/);
              if (taskMatch) {
                const newName =
                  updates.name !== undefined ? updates.name : taskMatch[1];
                const newScore =
                  updates.score !== undefined ? updates.score : taskMatch[2];
                const newActor =
                  updates.actor !== undefined ? updates.actor : taskMatch[3];

                lines[i] = `      ${newName}: ${newScore}: ${newActor}`;
                break;
              }
            }
            currentTaskIndex++;
          }
        }

        return lines.join("\n");
      });
    },
    [updateJourneyCode]
  );

  // CRUD Operations
  const deleteNode = useCallback(() => {
    if (!selectedNode) return;

    updateJourneyCode((code) => {
      const lines = code.split("\n");
      const newLines = [];
      let currentSectionIndex = -1;
      let currentTaskIndex = 0;
      let inTargetSection = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.trim().startsWith("section ")) {
          currentSectionIndex++;
          currentTaskIndex = 0;
          inTargetSection = false;

          if (
            selectedNode.data.nodeType === "section" &&
            currentSectionIndex === selectedNode.data.sectionIndex
          ) {
            continue; // Skip this section line
          }
        }

        if (
          selectedNode.data.nodeType === "task" &&
          currentSectionIndex === selectedNode.data.sectionIndex
        ) {
          if (line.trim().match(/^\s*.+:\s*\d+:\s*.+$/)) {
            if (currentTaskIndex === selectedNode.data.taskIndex) {
              currentTaskIndex++;
              continue; // Skip this task line
            }
            currentTaskIndex++;
          }
        }

        newLines.push(line);
      }

      return newLines.join("\n");
    });

    setSelectedNode(null);
  }, [selectedNode, updateJourneyCode]);

  const addNewSection = useCallback(
    (position) => {
      updateJourneyCode((code) => {
        let newCode = code;
        if (!code.includes("journey")) {
          newCode = "journey\n    title User Journey\n";
        }

        const sectionName = `New Section`;
        return (
          newCode + `\n    section ${sectionName}\n      New Task: 3: User`
        );
      });
    },
    [updateJourneyCode]
  );

  const addNewTask = useCallback(
    (sectionName) => {
      updateJourneyCode((code) => {
        const lines = code.split("\n");
        let sectionFound = false;
        let insertIndex = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          if (line === `section ${sectionName}`) {
            sectionFound = true;
            continue;
          }

          if (
            sectionFound &&
            (line.startsWith("section ") || i === lines.length - 1)
          ) {
            insertIndex = i;
            break;
          }
        }

        if (insertIndex !== -1) {
          lines.splice(insertIndex, 0, `      New Task: 3: User`);
        }

        return lines.join("\n");
      });
    },
    [updateJourneyCode]
  );

  const openEditDialog = useCallback(() => {
    if (!selectedNode) return;

    if (selectedNode.data.nodeType === "section") {
      setEditData({
        type: "section",
        value: selectedNode.data.sectionName,
      });
    } else if (selectedNode.data.nodeType === "task") {
      setEditData({
        type: "task",
        name: selectedNode.data.taskName,
        score: selectedNode.data.score,
        actor: selectedNode.data.actor,
        sectionIndex: selectedNode.data.sectionIndex,
        taskIndex: selectedNode.data.taskIndex,
      });
    }

    setEditDialogOpen(true);
  }, [selectedNode]);

  const handleEditSave = useCallback(() => {
    if (!editData || !selectedNode) return;

    if (editData.type === "section") {
      updateSectionName(selectedNode.data.sectionName, editData.value);
    } else if (editData.type === "task") {
      updateTaskDetails(editData.sectionIndex, editData.taskIndex, {
        name: editData.name,
        score: editData.score,
        actor: editData.actor,
      });
    }

    setEditDialogOpen(false);
    setEditData(null);
  }, [editData, selectedNode, updateSectionName, updateTaskDetails]);

  // Event Handlers
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onNodeDoubleClick = useCallback(
    (event, node) => {
      setSelectedNode(node);
      openEditDialog();
    },
    [openEditDialog]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Validation and Rendering
  const validateAndRender = useCallback(
    async (code, config) => {
      try {
        if (code.trim().startsWith("journey")) {
          setValidateCode(code);
          setValidateConfig(config);
          setValidateCodeState(code);
          setValidateConfigState(config);

          const journeyData = parseJourneyCode(code);
          const { nodes: flowNodes, edges: flowEdges } =
            createFlowElements(journeyData);

          setNodes(flowNodes);
          setEdges(flowEdges);
          setSvg(null);
        } else {
          throw new Error("Code must start with 'journey'");
        }
      } catch (error) {
        const errorMsg = `Syntax error: ${error.message}`;
        setValidateCode(errorMsg);
        setValidateConfig(config);
        setValidateCodeState(errorMsg);
        setValidateConfigState(config);
      }
    },
    [
      parseJourneyCode,
      createFlowElements,
      setNodes,
      setEdges,
      setSvg,
      setValidateCodeState,
      setValidateConfigState,
    ]
  );

  // Effects
  useEffect(() => {
    if (typeof window !== "undefined" && (autoSync || updateDiagram)) {
      validateAndRender(debounceCode, debounceConfig);
      if (updateDiagram) setUpdateDiagram(false);
    }
  }, [
    debounceCode,
    debounceConfig,
    autoSync,
    updateDiagram,
    validateAndRender,
    setUpdateDiagram,
  ]);

  // Render
  if (validateCode.startsWith("Syntax error")) {
    return (
      <Box
        ref={chartRef}
        sx={{
          height: "100vh",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ color: "red", background: "white", p: 2, borderRadius: 1 }}>
          {validateCode}
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box
        ref={chartRef}
        sx={{
          height: "100vh",
          background: "white",
          position: "relative",
        }}
      >
        {/* Toolbar */}
        <Box
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 1000,
            display: "flex",
            gap: 1,
            background: "rgba(255,255,255,0.9)",
            padding: 1,
            borderRadius: 2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #ddd",
          }}
        >
          {selectedNode && (
            <>
              <Tooltip title="Edit">
                <IconButton color="primary" onClick={openEditDialog}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton color="error" onClick={deleteNode}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          )}

          {selectedNode?.data?.nodeType === "section" && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => addNewTask(selectedNode.data.sectionName)}
              sx={{ borderColor: "#000", color: "#000" }}
            >
              + Task
            </Button>
          )}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => addNewSection()}
            sx={{ borderColor: "#000", color: "#000" }}
          >
            Add Section
          </Button>
        </Box>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onPaneClick={onPaneClick}
          onInit={setReactFlowInstance}
          fitView
          fitViewOptions={{
            padding: 0.3,
            includeHiddenNodes: false,
            minZoom: 0.2,
            maxZoom: 1.5,
          }}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          nodeTypes={nodeTypes}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit {editData?.type}</DialogTitle>
        <DialogContent>
          {editData?.type === "section" && (
            <TextField
              autoFocus
              margin="dense"
              label="Section Name"
              fullWidth
              value={editData.value}
              onChange={(e) =>
                setEditData({ ...editData, value: e.target.value })
              }
            />
          )}
          {editData?.type === "task" && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Task Name"
                fullWidth
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Score (1-5)"
                type="number"
                fullWidth
                value={editData.score}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    score: parseInt(e.target.value) || 1,
                  })
                }
                inputProps={{ min: 1, max: 5 }}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Actor"
                fullWidth
                value={editData.actor}
                onChange={(e) =>
                  setEditData({ ...editData, actor: e.target.value })
                }
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const UserJourneyChartWrapper = (props) => (
  <ReactFlowProvider>
    <UserJourneyChartView {...props} />
  </ReactFlowProvider>
);

export default UserJourneyChartWrapper;
