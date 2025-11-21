// "use client";

// import React, {
//   useContext,
//   useEffect,
//   useRef,
//   useState,
//   useCallback,
// } from "react";
// import { useDebounce } from "ahooks";
// import {
//   Box,
//   Button,
//   IconButton,
//   Tooltip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Typography,
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import AddIcon from "@mui/icons-material/Add";
// import { parse } from "@/utils/mermaid";
// import ReactFlow, {
//   Background,
//   Controls,
//   useNodesState,
//   useEdgesState,
//   addEdge,
//   ConnectionLineType,
//   MarkerType,
//   ReactFlowProvider,
//   Handle,
//   Position,
// } from "reactflow";
// import "reactflow/dist/style.css";
// import { useStore } from "@/store";
// import { ChartContext } from "@/app/layout";
// import { useParams } from "next/navigation";
// import axiosInstance from "@/utils/axiosInstance";




// // Edit Modal Component
// const EditModal = ({
//   open,
//   onClose,
//   type,
//   data,
//   onSave,
//   participants = [],
// }) => {
//   const [formData, setFormData] = useState({});

//   useEffect(() => {
//     if (open) {
//       if (type === "participant") {
//         setFormData({
//           label: data?.label || "",
//           alias: data?.id || "",
//         });
//       } else if (type === "message") {
//         setFormData({
//           from: data?.originalFrom || "",
//           to: data?.originalTo || "",
//           message: data?.label || "",
//           arrowType: data?.arrowType || "->>",
//         });
//       }
//     }
//   }, [open, type, data]);

//   const handleSave = () => {
//     onSave(formData);
//     onClose();
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <DialogTitle>
//         Edit {type === "participant" ? "Participant" : "Message"}
//       </DialogTitle>
//       <DialogContent>
//         {type === "participant" ? (
//           <>
//             <TextField
//               autoFocus
//               margin="dense"
//               label="Participant Label"
//               fullWidth
//               variant="outlined"
//               value={formData.label || ""}
//               onChange={(e) =>
//                 setFormData({ ...formData, label: e.target.value })
//               }
//               sx={{ mb: 2 }}
//             />
//             <TextField
//               margin="dense"
//               label="Participant Alias"
//               fullWidth
//               variant="outlined"
//               value={formData.alias || ""}
//               onChange={(e) =>
//                 setFormData({ ...formData, alias: e.target.value })
//               }
//             />
//           </>
//         ) : (
//           <>
//             <TextField
//               select
//               margin="dense"
//               label="From Participant"
//               fullWidth
//               variant="outlined"
//               value={formData.from || ""}
//               onChange={(e) =>
//                 setFormData({ ...formData, from: e.target.value })
//               }
//               sx={{ mb: 2 }}
//               SelectProps={{ native: true }}
//             >
//               <option value=""></option>
//               {participants.map((p) => (
//                 <option key={p.id} value={p.id}>
//                   {p.label} ({p.id})
//                 </option>
//               ))}
//             </TextField>
//             <TextField
//               select
//               margin="dense"
//               label="To Participant"
//               fullWidth
//               variant="outlined"
//               value={formData.to || ""}
//               onChange={(e) => setFormData({ ...formData, to: e.target.value })}
//               sx={{ mb: 2 }}
//               SelectProps={{ native: true }}
//             >
//               <option value=""></option>
//               {participants.map((p) => (
//                 <option key={p.id} value={p.id}>
//                   {p.label} ({p.id})
//                 </option>
//               ))}
//             </TextField>
//             <TextField
//               select
//               margin="dense"
//               label="Arrow Type"
//               fullWidth
//               variant="outlined"
//               value={formData.arrowType || "->>"}
//               onChange={(e) =>
//                 setFormData({ ...formData, arrowType: e.target.value })
//               }
//               sx={{ mb: 2 }}
//               SelectProps={{ native: true }}
//             >
//               <option value="->>">Solid with filled arrow {"->>"}</option>
//               <option value="-->>">Dashed with filled arrow {"-->>"}</option>
//               <option value="->">Solid with open arrow (-&gt;)</option>
//               <option value="-->">Dashed with open arrow (--&gt;)</option>
//             </TextField>
//             <TextField
//               margin="dense"
//               label="Message"
//               fullWidth
//               variant="outlined"
//               multiline
//               rows={3}
//               value={formData.message || ""}
//               onChange={(e) =>
//                 setFormData({ ...formData, message: e.target.value })
//               }
//             />
//           </>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose}>Cancel</Button>
//         <Button onClick={handleSave} variant="contained">
//           Save Changes
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// // Custom node for sequence diagram participants
// // const ParticipantNode = ({ data, selected }) => {
// //   return (
// //     <div
// //       style={{
// //         padding: "20px 24px",
// //         background: data.color || "#ffffff",
// //         border: `3px solid ${selected ? "#1976d2" : "#e0e0e0"}`,
// //         borderRadius: "12px",
// //         minWidth: "160px",
// //         textAlign: "center",
// //         boxShadow: selected
// //           ? "0 4px 20px rgba(25, 118, 210, 0.3)"
// //           : "0 4px 12px rgba(0,0,0,0.15)",
// //         transition: "all 0.2s ease-in-out",
// //       }}
// //     >
// //       <div
// //         style={{
// //           fontWeight: "600",
// //           marginBottom: "8px",
// //           fontSize: "16px",
// //           color: "#333",
// //         }}
// //       >
// //         {data.label}
// //       </div>
// //       <div
// //         style={{
// //           fontSize: "14px",
// //           color: "#666",
// //           fontWeight: "400",
// //         }}
// //       >
// //         {data.alias || data.id}
// //       </div>
// //       <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
// //       <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
// //     </div>
// //   );
// // };
// // Updated ParticipantNode component
// // const ParticipantNode = ({ data, selected }) => {
// //   // Use theme from data or fallback to default
// //   const themeStyle = data.themeStyle || {
// //     primaryColor: "#FFFFFF",
// //     primaryBorderColor: "#ff5733"
// //   };

// //   return (
// //     <div
// //       style={{
// //         padding: "20px 24px",
// //         background: themeStyle.primaryColor,
// //         border: `3px solid ${selected ? "#1976d2" : themeStyle.primaryBorderColor}`,
// //         borderRadius: "12px",
// //         minWidth: "160px",
// //         textAlign: "center",
// //         boxShadow: selected
// //           ? "0 4px 20px rgba(25, 118, 210, 0.3)"
// //           : "0 4px 12px rgba(0,0,0,0.15)",
// //         transition: "all 0.2s ease-in-out",
// //       }}
// //     >
// //       <div
// //         style={{
// //           fontWeight: "600",
// //           marginBottom: "8px",
// //           fontSize: "16px",
// //           color: "#333",
// //         }}
// //       >
// //         {data.label}
// //       </div>
// //       <div
// //         style={{
// //           fontSize: "14px",
// //           color: "#666",
// //           fontWeight: "400",
// //         }}
// //       >
// //         {data.alias || data.id}
// //       </div>
// //       <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
// //       <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
// //     </div>
// //   );
// // };
// // Enhanced ParticipantNode with dynamic text colors
// const ParticipantNode = ({ data, selected }) => {
//   // Use theme from data or fallback to default
//   const themeStyle = data.themeStyle || {
//     primaryColor: "#FFFFFF",
//     primaryBorderColor: "#ff5733"
//   };

//   // Calculate text color based on background brightness
//   const getTextColor = (backgroundColor) => {
//     if (!backgroundColor) return "#333333";
    
//     try {
//       // Convert hex to RGB
//       const hex = backgroundColor.replace('#', '');
//       const r = parseInt(hex.substr(0, 2), 16);
//       const g = parseInt(hex.substr(2, 2), 16);
//       const b = parseInt(hex.substr(4, 2), 16);
      
//       // Calculate brightness (perceived luminance)
//       const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      
//       // Return white for dark backgrounds, black for light backgrounds
//       return brightness > 128 ? "#333333" : "#FFFFFF";
//     } catch (error) {
//       return "#333333"; // Fallback color
//     }
//   };

//   const textColor = getTextColor(themeStyle.primaryColor);
//   const secondaryTextColor = getTextColor(themeStyle.primaryColor); // You can adjust this for less contrast

//   return (
//     <div
//       style={{
//         padding: "20px 24px",
//         background: themeStyle.primaryColor,
//         border: `3px solid ${selected ? "#1976d2" : themeStyle.primaryBorderColor}`,
//         borderRadius: "12px",
//         minWidth: "160px",
//         textAlign: "center",
//         boxShadow: selected
//           ? "0 4px 20px rgba(25, 118, 210, 0.3)"
//           : "0 4px 12px rgba(0,0,0,0.15)",
//         transition: "all 0.2s ease-in-out",
//       }}
//     >
//       <div
//         style={{
//           fontWeight: "600",
//           marginBottom: "8px",
//           fontSize: "16px",
//           color: textColor, // Dynamic color
//         }}
//       >
//         {data.label}
//       </div>
//       <div
//         style={{
//           fontSize: "14px",
//           color: secondaryTextColor, // Dynamic color
//           fontWeight: "400",
//           opacity: 0.8,
//         }}
//       >
//         {data.alias || data.id}
//       </div>
//       <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
//       <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
//     </div>
//   );
// };
// // Custom lifeline component
// const LifelineNode = ({ data }) => {
//   return (
//     <div
//       style={{
//         width: "3px",
//         height: `${data.height}px`,
//         background:
//           "repeating-linear-gradient(to bottom, #999 0px, #999 8px, transparent 8px, transparent 16px)",
//         pointerEvents: "none",
//       }}
//     />
//   );
// };

// const nodeTypes = {
//   participant: ParticipantNode,
//   lifeline: LifelineNode,
// };
// const SequenceDiagramView = ({ color, fontSizes }) => {
//   const { chartRef } = useContext(ChartContext);
//   const code = useStore.use.code();
//   const config = useStore.use.config();
//   const autoSync = useStore.use.autoSync();
//   const updateDiagram = useStore.use.updateDiagram();
//   const setUpdateDiagram = useStore.use.setUpdateDiagram();
//   const setCode = useStore.use.setCode();
//   const setSvg = useStore.use.setSvg();
//   const setValidateCodeState = useStore.use.setValidateCode();
//   const setValidateConfigState = useStore.use.setValidateConfig();
//   const [selectedTheme, setSelectedTheme] = useState('default');
//   const { id } = useParams();

//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [reactFlowInstance, setReactFlowInstance] = useState(null);

//   const codeRef = useRef(code);
//   const edgesRef = useRef(edges);
//   const nodesRef = useRef(nodes);

//   const [validateCode, setValidateCode] = useState("");
//   const [validateConfig, setValidateConfig] = useState("");
//   const [selectedElement, setSelectedElement] = useState(null);

//   codeRef.current = code;
//   edgesRef.current = edges;
//   nodesRef.current = nodes;

//   const debounceCode = useDebounce(code, { wait: 300 });
//   const debounceConfig = useDebounce(config, { wait: 300 });

//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const flowContainerRef = useRef(null);

//   const [editModal, setEditModal] = useState({
//     open: false,
//     type: null,
//     data: null,
//   });
//   const addTheme = [
//     {
//       name: "default",
//       style: {
//         primaryColor: "#FFFFFF",
//         primaryBorderColor: "#ff5733",
//       },
//     },
//     {
//       name: "forest",
//       style: {
//         primaryColor: "#2E8B57",
//         primaryBorderColor: "#145214",
//       },
//     },
//     {
//       name: "base",
//       style: {
//         primaryColor: "#F0F0F0",
//         primaryBorderColor: "#ff5733",
//       },
//     },
//     {
//       name: "dark",
//       style: {
//         primaryColor: "#333333",
//         primaryBorderColor: "#ff5733",
//       },
//     },
//     {
//       name: "neutral",
//       style: {
//         primaryColor: "#CCCCCC",
//         primaryBorderColor: "#ff5733",
//       },
//     },
//     {
//       name: "ocean",
//       style: {
//         primaryColor: "#71BBB2",
//         primaryBorderColor: "#497D74",
//       },
//     },
//     {
//       name: "solarized",
//       style: {
//         primaryColor: "#A27B5C",
//         primaryBorderColor: "#3F4F44",
//       },
//     },
//     {
//       name: "sunset",
//       style: {
//         primaryColor: "#FFCDB2",
//         primaryBorderColor: "#E5989B",
//       },
//     },
//     {
//       name: "neon",
//       style: {
//         primaryColor: "#B6FFA1",
//         primaryBorderColor: "#00FF9C",
//       },
//     },
//     {
//       name: "monochrome",
//       style: {
//         primaryColor: "#A7B49E",
//         primaryBorderColor: "#818C78",
//       },
//     },
//     {
//       name: "lavender",
//       style: {
//         primaryColor: "#CDA4DE",
//         primaryBorderColor: "#8E44AD",
//       },
//     },
//     {
//       name: "citrus",
//       style: {
//         primaryColor: "#FFD166",
//         primaryBorderColor: "#EF476F",
//       },
//     },
//     {
//       name: "midnight",
//       style: {
//         primaryColor: "#2C3E50",
//         primaryBorderColor: "#1A252F",
//       },
//     },
//     {
//       name: "pastel",
//       style: {
//         primaryColor: "#FFB7B2",
//         primaryBorderColor: "#FFDAC1",
//       },
//     },
//   ];
  
//   // Helper function to escape regex special characters
//   const escapeRegExp = (string) => {
//     return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//   };

//   // Enhanced parser for better participant handling
//   const parseSequenceDiagram = useCallback((text) => {
//     if (!text || !text.trim().startsWith("sequenceDiagram")) {
//       return { participants: new Map(), messages: [] };
//     }

//     const lines = text.split("\n");
//     const participants = new Map();
//     const messages = [];
//     const foundParticipants = new Set();

//     lines.forEach((line) => {
//       const trimmed = line.trim();
//       if (!trimmed || trimmed.startsWith("%%")) return;

//       // Parse participant definitions
//       const participantMatch1 = trimmed.match(
//         /^\s*participant\s+(\w+)\s+as\s+(.+)$/
//       );
//       const participantMatch2 = trimmed.match(/^\s*participant\s+(\w+)$/);

//       if (participantMatch1) {
//         const [, id, label] = participantMatch1;
//         participants.set(id, { id, label: label.trim() });
//         foundParticipants.add(id);
//         return;
//       } else if (participantMatch2) {
//         const [, id] = participantMatch2;
//         participants.set(id, { id, label: id });
//         foundParticipants.add(id);
//         return;
//       }

//       // Parse loop statements
//       const loopStartMatch = trimmed.match(/^\s*loop\s+(.+)$/i);
//       const loopEndMatch = trimmed.match(/^\s*end\s*$/i);

//       if (loopStartMatch) {
//         const [, label] = loopStartMatch;
//         messages.push({ type: "loopStart", label: label.trim() });
//         return;
//       }

//       if (loopEndMatch) {
//         messages.push({ type: "loopEnd" });
//         return;
//       }

//       // Parse messages and auto-detect participants
//       const messageMatch = trimmed.match(
//         /^\s*(\w+)\s*([->]+|-->>|->>|-->|<-{1,2})\s*(\+?)(\w+)\s*:\s*(.+)$/
//       );

//       if (messageMatch) {
//         const [, from, arrow, activation, to, message] = messageMatch;
//         const cleanFrom = from;
//         const cleanTo = to;

//         messages.push({
//           type: "message",
//           from: cleanFrom,
//           to: cleanTo,
//           arrow: arrow.trim() + (activation || ""),
//           message: message.trim(),
//         });

//         // Auto-add participants from messages if not already defined
//         if (!foundParticipants.has(cleanFrom)) {
//           participants.set(cleanFrom, { id: cleanFrom, label: cleanFrom });
//           foundParticipants.add(cleanFrom);
//         }
//         if (!foundParticipants.has(cleanTo)) {
//           participants.set(cleanTo, { id: cleanTo, label: cleanTo });
//           foundParticipants.add(cleanTo);
//         }
//       }
//     });

//     return { participants, messages };
//   }, []);

//   // Update participant in code
//   const updateParticipant = useCallback(
//     (oldParticipantId, newLabel, newAlias) => {
//       let newCode = codeRef.current;
//       console.log("Updating participant:", {
//         oldParticipantId,
//         newLabel,
//         newAlias,
//       });

//       // Handle both participant formats with proper escaping
//       const pattern1 = new RegExp(
//         `^\\s*participant\\s+${oldParticipantId}\\s+as\\s+.+$`,
//         "gm"
//       );
//       const pattern2 = new RegExp(
//         `^\\s*participant\\s+${oldParticipantId}\\s*$`,
//         "gm"
//       );

//       let found = false;

//       // Try pattern 1: participant X as Y
//       if (newCode.match(pattern1)) {
//         newCode = newCode.replace(
//           pattern1,
//           `    participant ${newAlias} as ${newLabel}`
//         );
//         found = true;
//       }
//       // Try pattern 2: participant X (without 'as')
//       else if (newCode.match(pattern2)) {
//         newCode = newCode.replace(
//           pattern2,
//           `    participant ${newAlias} as ${newLabel}`
//         );
//         found = true;
//       }

//       if (found) {
//         // Update all messages that reference the old participant ID
//         const messagePattern = new RegExp(`\\b${oldParticipantId}\\b`, "g");
//         newCode = newCode.replace(messagePattern, newAlias);
//       } else {
//         // Check if participant exists in any messages but wasn't defined
//         const participantInMessages = new RegExp(
//           `\\b${oldParticipantId}\\b`,
//           "g"
//         ).test(newCode);
//         if (participantInMessages) {
//           // Participant exists in messages but wasn't formally defined, add the definition
//           const lines = newCode.split("\n");
//           let insertIndex = 1; // After "sequenceDiagram"

//           // Find the line after sequenceDiagram
//           for (let i = 0; i < lines.length; i++) {
//             if (lines[i].trim() === "sequenceDiagram") {
//               insertIndex = i + 1;
//               break;
//             }
//           }

//           // Insert the participant definition
//           lines.splice(
//             insertIndex,
//             0,
//             `    participant ${newAlias} as ${newLabel}`
//           );
//           newCode = lines.join("\n");

//           // Update messages with new alias
//           newCode = newCode.replace(
//             new RegExp(`\\b${oldParticipantId}\\b`, "g"),
//             newAlias
//           );
//         } else {
//           // Add new participant at the end
//           newCode += `\n    participant ${newAlias} as ${newLabel}`;
//         }
//       }

//       setCode(newCode);
//       sessionStorage.setItem("code", newCode);
//       return newCode;
//     },
//     [setCode]
//   );

//   // Update message in code
//   const updateMessage = useCallback(
//     (oldFrom, oldTo, oldMessage, newFrom, newTo, newMessage, newArrowType) => {
//       let newCode = codeRef.current;
//       console.log("Updating message:", {
//         oldFrom,
//         oldTo,
//         oldMessage,
//         newFrom,
//         newTo,
//         newMessage,
//         newArrowType,
//       });

//       // Escape special characters in the old message
//       const escapedOldMessage = escapeRegExp(oldMessage);

//       // Create multiple patterns to match different message formats
//       const patterns = [
//         new RegExp(
//           `^\\s*${oldFrom}\\s*[-]+>\\s*${oldTo}\\s*:\\s*${escapedOldMessage}\\s*$`,
//           "gm"
//         ),
//         new RegExp(
//           `^\\s*${oldFrom}\\s*[-]+>\\s*${oldTo}\\s*:\\s*.*${escapedOldMessage}.*$`,
//           "gm"
//         ),
//       ];

//       const newMessageLine = `    ${newFrom}${newArrowType}${newTo}: ${newMessage}`;
//       let replaced = false;

//       for (const pattern of patterns) {
//         if (newCode.match(pattern)) {
//           newCode = newCode.replace(pattern, newMessageLine);
//           replaced = true;
//           break;
//         }
//       }

//       if (!replaced) {
//         // Fallback: manual line-by-line search and replace
//         const lines = newCode.split("\n");
//         let updatedLines = [];
//         let messageFound = false;

//         for (let line of lines) {
//           const trimmedLine = line.trim();

//           // Check if this line matches our message criteria
//           const hasFrom = trimmedLine.includes(oldFrom);
//           const hasTo = trimmedLine.includes(oldTo);
//           const hasMessage = trimmedLine.includes(oldMessage);
//           const isMessageLine =
//             trimmedLine.includes("->") || trimmedLine.includes("-->");

//           if (
//             hasFrom &&
//             hasTo &&
//             hasMessage &&
//             isMessageLine &&
//             !messageFound
//           ) {
//             // Replace this line with the new message
//             updatedLines.push(newMessageLine);
//             messageFound = true;
//           } else {
//             updatedLines.push(line);
//           }
//         }

//         newCode = updatedLines.join("\n");

//         if (!messageFound) {
//           newCode += `\n${newMessageLine}`;
//         }
//       }

//       setCode(newCode);
//       sessionStorage.setItem("code", newCode);
//       return newCode;
//     },
//     [setCode]
//   );

//   // Delete participant with all related messages - IMPROVED
//   const deleteParticipant = useCallback(
//     (participantId) => {
//       let newCode = codeRef.current;
//       console.log("Deleting participant from code:", participantId);

//       // Remove participant definition (both formats)
//       newCode = newCode.replace(
//         new RegExp(`^\\s*participant\\s+${participantId}\\s+as\\s+.+$`, "gm"),
//         ""
//       );
//       newCode = newCode.replace(
//         new RegExp(`^\\s*participant\\s+${participantId}\\s*$`, "gm"),
//         ""
//       );

//       // Remove messages involving this participant
//       newCode = newCode.replace(
//         new RegExp(`^\\s*${participantId}\\s*[-]+>\\s*\\w+.*$`, "gm"),
//         ""
//       );
//       newCode = newCode.replace(
//         new RegExp(`^\\s*\\w+\\s*[-]+>\\s*${participantId}.*$`, "gm"),
//         ""
//       );

//       // Clean up empty lines and multiple newlines
//       newCode = newCode
//         .split("\n")
//         .filter((line) => line.trim() !== "")
//         .join("\n")
//         .replace(/\n{3,}/g, "\n\n")
//         .trim();

//       // Ensure we have sequenceDiagram at the start
//       if (!newCode.includes("sequenceDiagram")) {
//         newCode = "sequenceDiagram\n" + newCode;
//       }

//       console.log("Code after participant deletion:", newCode);
//       setCode(newCode);
//       sessionStorage.setItem("code", newCode);
//       return newCode;
//     },
//     [setCode]
//   );

//   // Delete specific message - IMPROVED
//   const deleteMessage = useCallback(
//     (from, to, message) => {
//       let newCode = codeRef.current;
//       console.log("Deleting message from code:", { from, to, message });

//       // Escape special characters in the message for regex
//       const escapedMessage = escapeRegExp(message);

//       // Multiple pattern attempts to ensure we find and delete the message
//       const patterns = [
//         new RegExp(
//           `^\\s*${from}\\s*[-]+>\\s*${to}\\s*:\\s*${escapedMessage}\\s*$`,
//           "gm"
//         ),
//         new RegExp(
//           `^\\s*${from}\\s*[-]+>\\s*${to}\\s*:\\s*.*${escapedMessage}.*$`,
//           "gm"
//         ),
//       ];

//       let deleted = false;
//       for (const pattern of patterns) {
//         if (newCode.match(pattern)) {
//           newCode = newCode.replace(pattern, "");
//           deleted = true;
//           break;
//         }
//       }

//       if (!deleted) {
//         // Manual line-by-line search as fallback
//         const lines = newCode.split("\n");
//         const filteredLines = lines.filter((line) => {
//           const trimmedLine = line.trim();
//           const hasFrom = trimmedLine.includes(from);
//           const hasTo = trimmedLine.includes(to);
//           const hasMessage = trimmedLine.includes(message);
//           const isMessageLine =
//             trimmedLine.includes("->") || trimmedLine.includes("-->");

//           // Keep the line if it doesn't match ALL criteria
//           return !(hasFrom && hasTo && hasMessage && isMessageLine);
//         });
//         newCode = filteredLines.join("\n");
//       }

//       // Clean up empty lines
//       newCode = newCode
//         .split("\n")
//         .filter((line) => line.trim() !== "")
//         .join("\n")
//         .replace(/\n{3,}/g, "\n\n")
//         .trim();

//       setCode(newCode);
//       sessionStorage.setItem("code", newCode);
//       return newCode;
//     },
//     [setCode]
//   );

//   // Get all participants for the edit modal
//   const getAllParticipants = useCallback(() => {
//     try {
//       const { participants } = parseSequenceDiagram(codeRef.current);
//       const participantArray = Array.from(participants.values());
//       return participantArray;
//     } catch (error) {
//       console.error("Error parsing participants:", error);
//       return [];
//     }
//   }, [parseSequenceDiagram]);

//   // Handle edit operations
//   const handleEdit = useCallback(() => {
//     if (!selectedElement) {
//       console.log("No element selected for editing");
//       return;
//     }

//     console.log("Editing selected element:", selectedElement);

//     if (selectedElement.type === "node") {
//       const node = selectedElement.data;
//       if (node.type === "participant") {
//         const participantId = node.id
//           .replace("-top", "")
//           .replace("-bottom", "");
//         setEditModal({
//           open: true,
//           type: "participant",
//           data: {
//             id: participantId,
//             label: node.data?.label || participantId,
//           },
//         });
//       }
//     } else if (selectedElement.type === "edge") {
//       const edge = selectedElement.data;
//       if (edge.data) {
//         setEditModal({
//           open: true,
//           type: "message",
//           data: {
//             originalFrom: edge.data.originalFrom,
//             originalTo: edge.data.originalTo,
//             label: edge.data.label,
//             arrowType: edge.data.arrowType || "->>",
//           },
//         });
//       }
//     }
//   }, [selectedElement]);

//   // Handle save from edit modal
//   const handleSaveEdit = useCallback(
//     (formData) => {
//       console.log("Saving edit:", { formData, editModal });

//       if (editModal.type === "participant") {
//         const { label, alias } = formData;
//         if (label && alias) {
//           updateParticipant(editModal.data.id, label, alias);
//         }
//       } else if (editModal.type === "message") {
//         const { from, to, message, arrowType } = formData;
//         if (from && to && message) {
//           updateMessage(
//             editModal.data.originalFrom,
//             editModal.data.originalTo,
//             editModal.data.label,
//             from,
//             to,
//             message,
//             arrowType
//           );
//         }
//       }

//       // Clear selection after save
//       setSelectedElement(null);
//     },
//     [editModal, updateParticipant, updateMessage]
//   );

//   // Convert sequence diagram to React Flow
//   const convertSequenceToReactFlow = useCallback(
//     (text) => {
//       const { participants, messages } = parseSequenceDiagram(text);

//       if (participants.size === 0) {
//         return { nodes: [], edges: [] };
//       }

//       const nodesOut = [];
//       const edgesOut = [];

//       const nodeThemeName = color.theme.includes("base/")
//       ? color.theme.split("/")[1]
//       : color.theme;
//     const themeStyle = addTheme.find((t) => t.name === nodeThemeName)?.style;
//       // Layout constants
//       const participantArray = Array.from(participants.values());
//       const nodeWidth = 180;
//       const nodeHeight = 60;
//       const horizontalSpacing = 280;
//       const startX = 120;

//       const topBoxY = 80;
//       const messageStartY = topBoxY + nodeHeight + 50;
//       const messageSpacing = 80;

//       // Calculate total height needed
//       let totalHeight = messageStartY;
//       let loopDepth = 0;

//       messages.forEach((message) => {
//         if (message.type === "loopStart") {
//           loopDepth++;
//           totalHeight += 120;
//         } else if (message.type === "loopEnd") {
//           loopDepth--;
//           totalHeight += 60;
//         } else if (message.type === "message") {
//           const spacing = messageSpacing + loopDepth * 20;
//           totalHeight += spacing;
//         }
//       });

//       const bottomBuffer = 100;
//       totalHeight += bottomBuffer;
//       const bottomBoxY = totalHeight - nodeHeight;

//       // Create participant boxes and lifelines
//       participantArray.forEach((participant, index) => {
//         const nodeId = participant.id;
//         const x = startX + index * horizontalSpacing;


//         // Top participant box
//         nodesOut.push({
//           id: `${nodeId}-top`,
//           type: "participant",
//           data: {
//             label: participant.label,
//             id: participant.id,
//             alias: participant.id,
//             themeStyle: themeStyle,
//           },
//           position: { x, y: topBoxY },
//         });

//         // Bottom participant box
//         nodesOut.push({
//           id: `${nodeId}-bottom`,
//           type: "participant",
//           data: {
//             label: participant.label,
//             id: participant.id,
//             alias: participant.id,
//             themeStyle: themeStyle,
//           },
//           position: { x, y: bottomBoxY },
//         });

//         // Lifeline
//         const lifelineHeight = bottomBoxY - topBoxY - nodeHeight;
//         nodesOut.push({
//           id: `${nodeId}-lifeline`,
//           type: "lifeline",
//           data: { height: lifelineHeight },
//           position: { x: x + nodeWidth / 2 - 1, y: topBoxY + nodeHeight },
//           style: {
//             width: "2px",
//             height: `${lifelineHeight}px`,
//             background: "#999",
//             borderLeft: "2px dashed #999",
//             pointerEvents: "none",
//             zIndex: 10,
//           },
//           selectable: false,
//           draggable: false,
//           connectable: false,
//         });
//       });

//       // Process messages
//       let currentY = messageStartY;

//       messages.forEach((message) => {
//         if (message.type === "message") {
//           const sourceParticipant = participantArray.find(
//             (p) => p.id === message.from
//           );
//           const targetParticipant = participantArray.find(
//             (p) => p.id === message.to
//           );

//           if (!sourceParticipant || !targetParticipant) return;

//           const sourceIndex = participantArray.indexOf(sourceParticipant);
//           const targetIndex = participantArray.indexOf(targetParticipant);

//           const sourceX =
//             startX + sourceIndex * horizontalSpacing + nodeWidth / 2;
//           const targetX =
//             startX + targetIndex * horizontalSpacing + nodeWidth / 2;

//           const edgeId = `msg-${message.from}-${message.to}-${currentY}`;

//           // Create invisible nodes for message endpoints
//           nodesOut.push({
//             id: `${edgeId}-source`,
//             type: "default",
//             data: { label: "" },
//             position: { x: sourceX - 8, y: currentY },
//             style: { width: "16px", height: "16px", opacity: 0 },
//             selectable: false,
//             draggable: false,
//             connectable: false,
//           });

//           nodesOut.push({
//             id: `${edgeId}-target`,
//             type: "default",
//             data: { label: "" },
//             position: { x: targetX - 8, y: currentY },
//             style: { width: "16px", height: "16px", opacity: 0 },
//             selectable: false,
//             draggable: false,
//             connectable: false,
//           });

//           const arrowConfig = getMermaidArrowStyle(message.arrow);

//           edgesOut.push({
//             id: edgeId,
//             source: `${edgeId}-source`,
//             target: `${edgeId}-target`,
//             type: "straight",
//             style: arrowConfig.style,
//             markerEnd: arrowConfig.markerEnd,
//             label: message.message,
//             labelStyle: {
//               fontSize: fontSizes?.message || 14,
//               fontWeight: "500",
//               fill: "#333",
//             },
//             labelBgStyle: {
//               fill: "white",
//               fillOpacity: 0.95,
//               stroke: "#ddd",
//             },
//             labelBgPadding: [6, 8],
//             labelBgBorderRadius: 6,
//             zIndex: 15,
//             data: {
//               originalFrom: message.from,
//               originalTo: message.to,
//               label: message.message,
//               arrowType: message.arrow,
//             },
//           });

//           currentY += messageSpacing;
//         }
//       });

//       return { nodes: nodesOut, edges: edgesOut };
//     },
//     [parseSequenceDiagram, fontSizes, color.theme]
//   );

//   // FIXED: Delete handler - COMPLETELY REWORKED
//   const handleDeleteSelected = useCallback(() => {
//     if (!selectedElement) {
//       console.log("No element selected for deletion");
//       return;
//     }

//     console.log("Deleting selected element:", selectedElement);

//     let newCode = codeRef.current;

//     if (selectedElement.type === "node") {
//       const node = selectedElement.data;
//       if (node.type === "participant") {
//         const participantId = node.id
//           .replace("-top", "")
//           .replace("-bottom", "");
//         console.log("Deleting participant:", participantId);
//         newCode = deleteParticipant(participantId);
//       }
//     } else if (selectedElement.type === "edge") {
//       const edge = selectedElement.data;
//       console.log("Deleting edge:", edge);

//       if (
//         edge.data &&
//         edge.data.originalFrom &&
//         edge.data.originalTo &&
//         edge.data.label
//       ) {
//         newCode = deleteMessage(
//           edge.data.originalFrom,
//           edge.data.originalTo,
//           edge.data.label
//         );
//       }
//     }

//     // Clear selection
//     setSelectedElement(null);

//     // Force immediate diagram refresh using the updated code
//     if (newCode && newCode !== codeRef.current) {
//       console.log("Refreshing diagram with new code");

//       // Update the code reference immediately
//       codeRef.current = newCode;

//       // Force re-render by updating the diagram state
//       setTimeout(() => {
//         const { nodes: newNodes, edges: newEdges } =
//           convertSequenceToReactFlow(newCode);
//         setNodes(newNodes);
//         setEdges(newEdges);

//         // Also trigger the store update to ensure consistency
//         setCode(newCode);
//       }, 0);
//     }
//   }, [
//     selectedElement,
//     deleteParticipant,
//     deleteMessage,
//     convertSequenceToReactFlow,
//     setNodes,
//     setEdges,
//     setCode,
//   ]);

//   // Add new participant
//   const addNewParticipant = useCallback(() => {
//     const participantId = `Participant${Date.now()}`;
//     const participantLabel = `New Participant`;
//     const participantCode = `    participant ${participantId} as ${participantLabel}`;

//     let newCode = codeRef.current;
//     if (!newCode.includes("sequenceDiagram")) {
//       newCode = "sequenceDiagram\n";
//     }

//     newCode += "\n" + participantCode;

//     setCode(newCode);
//     sessionStorage.setItem("code", newCode);
//   }, [setCode]);

//   // Add new message
//   const addNewMessage = useCallback(() => {
//     const participants = getAllParticipants();
//     if (participants.length === 0) return;

//     const from = participants[0].id;
//     const to = participants[participants.length > 1 ? 1 : 0].id;
//     const messageCode = `    ${from}->>${to}: New message`;

//     let newCode = codeRef.current;
//     if (!newCode.includes("sequenceDiagram")) {
//       newCode = "sequenceDiagram\n";
//     }

//     newCode += "\n" + messageCode;

//     setCode(newCode);
//     sessionStorage.setItem("code", newCode);
//   }, [setCode, getAllParticipants]);

//   // Enhanced Mermaid arrow styles
//   const getMermaidArrowStyle = (arrow) => {
//     const baseStyle = { strokeWidth: 2 };
//     const baseMarker = { width: 20, height: 20 };

//     const nodeThemeName = color.theme.includes("base/")
//     ? color.theme.split("/")[1]
//     : color.theme;
//   const themeStyle = addTheme.find((t) => t.name === nodeThemeName)?.style;
//   const arrowColor = themeStyle?.primaryBorderColor || "#1976d2";

//     switch (arrow) {
//       case "->>":
//         return {
//           style: { ...baseStyle, stroke: "#1976d2" },
//           markerEnd: {
//             ...baseMarker,
//             type: MarkerType.ArrowClosed,
//             // color: "#1976d2",
//             color: arrowColor,
//           },
//         };
//       case "-->>":
//         return {
//           style: { ...baseStyle, stroke: "#1976d2", strokeDasharray: "5,5" },
//           markerEnd: {
//             ...baseMarker,
//             type: MarkerType.ArrowClosed,
//             // color: "#1976d2",
//             color: arrowColor,
//           },
//         };
//       case "->":
//         return {
//           style: { ...baseStyle, stroke: "#1976d2" },
//           markerEnd: {
//             ...baseMarker,
//             type: MarkerType.Arrow,
//             // color: "#1976d2",
//             color: arrowColor,
//           },
//         };
//       case "-->":
//         return {
//           style: { ...baseStyle, stroke: "#1976d2", strokeDasharray: "5,5" },
//           markerEnd: {
//             ...baseMarker,
//             type: MarkerType.Arrow,
//             // color: "#1976d2",
//             color: arrowColor,
//           },
//         };
//       default:
//         return {
//           style: { ...baseStyle, stroke: "#1976d2" },
//           markerEnd: {
//             ...baseMarker,
//             type: MarkerType.ArrowClosed,
//             // color: "#1976d2",
//             color: arrowColor,
//           },
//         };
//     }
//   };

//   // FIXED: Selection change handler - IMPROVED
//   const onSelectionChange = useCallback(
//     ({ nodes: selectedNodes, edges: selectedEdges }) => {
//       console.log("Selection changed:", { selectedNodes, selectedEdges });

//       // Prioritize edges over nodes for selection
//       if (selectedEdges && selectedEdges.length > 0) {
//         const edge = selectedEdges[0];
//         if (edge.data) {
//           // Get edge position for toolbar placement
//           const edgeElement = document.querySelector(`[data-id="${edge.id}"]`);
//           let screenPosition = { x: mousePosition.x, y: mousePosition.y - 50 };

//           if (edgeElement && flowContainerRef.current) {
//             const rect = edgeElement.getBoundingClientRect();
//             const containerRect =
//               flowContainerRef.current.getBoundingClientRect();
//             screenPosition = {
//               x: rect.left - containerRect.left + rect.width / 2,
//               y: rect.top - containerRect.top - 40,
//             };
//           }

//           setSelectedElement({
//             type: "edge",
//             data: edge,
//             screenPosition,
//           });
//           return;
//         }
//       }

//       if (selectedNodes && selectedNodes.length > 0) {
//         const node = selectedNodes[0];
//         if (node.type === "participant") {
//           const participantId = node.id
//             .replace("-top", "")
//             .replace("-bottom", "");

//           // Get the node's actual screen position
//           const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
//           let screenPosition = {
//             x: node.position.x + 90,
//             y: node.position.y - 40,
//           };

//           if (nodeElement && flowContainerRef.current) {
//             const rect = nodeElement.getBoundingClientRect();
//             const containerRect =
//               flowContainerRef.current.getBoundingClientRect();
//             screenPosition = {
//               x: rect.left - containerRect.left + rect.width / 2,
//               y: rect.top - containerRect.top - 40,
//             };
//           }

//           setSelectedElement({
//             type: "node",
//             data: { ...node, participantId },
//             screenPosition,
//           });
//           return;
//         }
//       }

//       // Clear selection if nothing is selected
//       setSelectedElement(null);
//     },
//     [mousePosition]
//   );

//   const handleNodeClick = useCallback((event, node) => {
//     console.log("Node clicked:", node);
//     if (node.type === "participant") {
//       const participantId = node.id.replace("-top", "").replace("-bottom", "");

//       // Get the node's position in the flow container
//       const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
//       let screenPosition = { x: node.position.x + 90, y: node.position.y - 40 };

//       if (nodeElement && flowContainerRef.current) {
//         const rect = nodeElement.getBoundingClientRect();
//         const containerRect = flowContainerRef.current.getBoundingClientRect();
//         screenPosition = {
//           x: rect.left - containerRect.left + rect.width / 2,
//           y: rect.top - containerRect.top - 40,
//         };
//       }

//       setSelectedElement({
//         type: "node",
//         data: { ...node, participantId },
//         screenPosition,
//         elementId: node.id, // Store element ID for stability
//       });

//       // Stop event propagation to prevent selection change
//       event.stopPropagation();
//     }
//   }, []);

//   const handleEdgeClick = useCallback(
//     (event, edge) => {
//       console.log("Edge clicked:", edge);
//       if (edge.data) {
//         // Get edge center position in the flow container
//         const edgeElement = document.querySelector(`[data-id="${edge.id}"]`);
//         let screenPosition = { x: 0, y: 0 };

//         if (edgeElement && flowContainerRef.current) {
//           const rect = edgeElement.getBoundingClientRect();
//           const containerRect =
//             flowContainerRef.current.getBoundingClientRect();
//           screenPosition = {
//             x: rect.left - containerRect.left + rect.width / 2,
//             y: rect.top - containerRect.top - 40,
//           };
//         } else {
//           // Fallback: use edge source position
//           const sourceNode = nodes.find((n) => n.id === edge.source);
//           if (sourceNode) {
//             screenPosition = {
//               x: sourceNode.position.x + 100,
//               y: sourceNode.position.y - 40,
//             };
//           }
//         }

//         setSelectedElement({
//           type: "edge",
//           data: edge,
//           screenPosition,
//           elementId: edge.id, // Store element ID for stability
//         });

//         // Stop event propagation to prevent selection change
//         event.stopPropagation();
//       }
//     },
//     [nodes]
//   );

//   // Keyboard delete handler
//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (
//         (event.key === "Delete" || event.key === "Backspace") &&
//         selectedElement
//       ) {
//         event.preventDefault();
//         handleDeleteSelected();
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [selectedElement, handleDeleteSelected]);

//   // Validation
//   const setValidateCodeAndConfig = async (c, conf) => {
//     try {
//       if (c.trim().startsWith("sequenceDiagram")) {
//         setValidateCode(c);
//         setValidateConfig(conf);
//         setValidateCodeState(c);
//         setValidateConfigState(conf);
//       } else {
//         await parse(c);
//         JSON.parse(conf || "{}");
//         setValidateCode(c);
//         setValidateConfig(conf);
//         setValidateCodeState(c);
//         setValidateConfigState(conf);
//       }
//     } catch (error) {
//       const msg =
//         error instanceof Error
//           ? `Syntax error: ${error.message}`
//           : "Syntax error: Unknown";
//       setValidateCode(msg);
//       setValidateConfig(conf);
//       setValidateCodeState(msg);
//       setValidateConfigState(conf);
//     }
//   };

//   // Render diagram
//   const renderDiagram = useCallback(
//     (text) => {
//       if (!text) return;

//       const { nodes: flowNodes, edges: flowEdges } =
//         convertSequenceToReactFlow(text);
//       setNodes(flowNodes);
//       setEdges(flowEdges);
//       setSvg(null);
//     },
//     [convertSequenceToReactFlow, setNodes, setEdges, setSvg]
//   );

//   // Effects for auto-rendering when code changes
//   useEffect(() => {
//     if (typeof window !== "undefined" && (autoSync || updateDiagram)) {
//       setValidateCodeAndConfig(debounceCode, debounceConfig);
//       if (updateDiagram) setUpdateDiagram(false);
//     }
//   }, [debounceCode, debounceConfig, autoSync, updateDiagram, setUpdateDiagram]);

//   useEffect(() => {
//     if (
//       typeof window !== "undefined" &&
//       validateCode &&
//       !validateCode.startsWith("Syntax error")
//     ) {
//       renderDiagram(validateCode);
//     }
//   }, [validateCode, validateConfig, renderDiagram]);

//   // ALSO render when code changes directly (not just through validation)
//   useEffect(() => {
//     if (code && !validateCode.startsWith("Syntax error")) {
//       renderDiagram(code);
//     }
//   }, [code, renderDiagram, validateCode]);

//   if (validateCode.startsWith("Syntax error")) {
//     return (
//       <Box
//         ref={chartRef}
//         component="div"
//         sx={{
//           height: "100vh !important",
//           backgroundImage: `url("${color.image.src}")`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           backgroundRepeat: "no-repeat",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <Box
//           component="div"
//           sx={{
//             color: "red",
//             px: 2,
//             background: "white",
//             p: 2,
//             borderRadius: 1,
//           }}
//         >
//           {validateCode}
//         </Box>
//       </Box>
//     );
//   }

//   return (
//     <Box
//       ref={(el) => {
//         chartRef.current = el;
//         flowContainerRef.current = el;
//       }}
//       component="div"
//       sx={{
//         height: "100vh !important",
//         backgroundImage: `url("${color.image.src}")`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//         position: "relative",
//       }}
//     >
//       {/* Edit Modal */}
//       <EditModal
//         open={editModal.open}
//         onClose={() => setEditModal({ open: false, type: null, data: null })}
//         type={editModal.type}
//         data={editModal.data}
//         onSave={handleSaveEdit}
//         participants={getAllParticipants()}
//       />
//       {selectedElement && (
//         <Box
//           sx={{
//             position: "absolute",
//             zIndex: 2000,
//             pointerEvents: "auto",
//             display: "flex",
//             flexDirection: "row",
//             gap: 1,
//             background: "white",
//             padding: "8px 12px",
//             borderRadius: "8px",
//             boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
//             border: "2px solid #1976d2",
//             left: selectedElement.screenPosition.x,
//             top: selectedElement.screenPosition.y,
//             transform: "translateX(-50%)",
//             minWidth: "80px",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <Tooltip
//             title={`Edit ${
//               selectedElement.type === "node" ? "participant" : "message"
//             }`}
//           >
//             <IconButton
//               color="primary"
//               size="small"
//               onClick={handleEdit}
//               sx={{
//                 "&:hover": {
//                   backgroundColor: "rgba(25, 118, 210, 0.1)",
//                 },
//               }}
//             >
//               <EditIcon fontSize="small" />
//             </IconButton>
//           </Tooltip>

//           <Tooltip
//             title={`Delete ${
//               selectedElement.type === "node" ? "participant" : "message"
//             }`}
//           >
//             <IconButton
//               color="error"
//               size="small"
//               onClick={handleDeleteSelected}
//               sx={{
//                 "&:hover": {
//                   backgroundColor: "rgba(211, 47, 47, 0.1)",
//                 },
//               }}
//             >
//               <DeleteIcon fontSize="small" />
//             </IconButton>
//           </Tooltip>
//         </Box>
//       )}

//       {/* Control buttons */}
//       <Box
//         sx={{
//           position: "absolute",
//           top: 20,
//           right: 20,
//           zIndex: 1000,
//           display: "flex",
//           gap: 1,
//         }}
//       >
//         <Tooltip title="Add new participant">
//           <Button
//             variant="contained"
//             color="primary"
//             startIcon={<AddIcon />}
//             onClick={addNewParticipant}
//             sx={{ fontSize: "10px", padding: "4px 8px", borderRadius: "8px" }}
//           >
//             Add Participant
//           </Button>
//         </Tooltip>
//         <Tooltip title="Add new message">
//           <Button
//             variant="contained"
//             color="secondary"
//             startIcon={<AddIcon />}
//             onClick={addNewMessage}
//             sx={{ fontSize: "10px", padding: "4px 8px", borderRadius: "8px" }}
//           >
//             Add Message
//           </Button>
//         </Tooltip>
//       </Box>

//       <ReactFlow
//         nodes={nodes}
//         edges={edges}
//         onNodesChange={onNodesChange}
//         onEdgesChange={onEdgesChange}
//         onPaneClick={() => setSelectedElement(null)}
//         onNodeClick={handleNodeClick}
//         onEdgeClick={handleEdgeClick}
//         onNodeDoubleClick={(event, node) => {
//           if (node.type === "participant") {
//             const participantId = node.id
//               .replace("-top", "")
//               .replace("-bottom", "");
//             setEditModal({
//               open: true,
//               type: "participant",
//               data: {
//                 id: participantId,
//                 label: node.data?.label || participantId,
//               },
//             });
//             setSelectedElement(null);
//           }
//         }}
//         onEdgeDoubleClick={(event, edge) => {
//           if (edge.data) {
//             setEditModal({
//               open: true,
//               type: "message",
//               data: {
//                 originalFrom: edge.data.originalFrom,
//                 originalTo: edge.data.originalTo,
//                 label: edge.data.label,
//                 arrowType: edge.data.arrowType || "->>",
//               },
//             });
//             setSelectedElement(null);
//           }
//         }}
//         onInit={setReactFlowInstance}
//         onSelectionChange={onSelectionChange}
//         connectionLineType={ConnectionLineType.SmoothStep}
//         fitView
//         style={{ background: "transparent" }}
//         nodeTypes={nodeTypes}
//         deleteKeyCode={null}
//         selectionKeyCode={["Shift"]}
//         multiSelectionKeyCode={["Shift"]}
//       >
//         <Background />
//         <Controls />
//       </ReactFlow>
//     </Box>
//   );
// };
// const SequenceDiagramWrapper = (props) => (
//   <ReactFlowProvider>
//     <SequenceDiagramView {...props} />
//   </ReactFlowProvider>
// );

// export default SequenceDiagramWrapper;
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
  Typography,
} from "@mui/material";
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
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { useStore } from "@/store";
import { ChartContext } from "@/app/layout";
import { useParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";

// Edit Modal Component
const EditModal = ({
  open,
  onClose,
  type,
  data,
  onSave,
  participants = [],
}) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (open) {
      if (type === "participant") {
        setFormData({
          label: data?.label || "",
          alias: data?.id || "",
        });
      } else if (type === "message") {
        setFormData({
          from: data?.originalFrom || "",
          to: data?.originalTo || "",
          message: data?.label || "",
          arrowType: data?.arrowType || "->>",
        });
      }
    }
  }, [open, type, data]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Edit {type === "participant" ? "Participant" : "Message"}
      </DialogTitle>
      <DialogContent>
        {type === "participant" ? (
          <>
            <TextField
              autoFocus
              margin="dense"
              label="Participant Label"
              fullWidth
              variant="outlined"
              value={formData.label || ""}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Participant Alias"
              fullWidth
              variant="outlined"
              value={formData.alias || ""}
              onChange={(e) =>
                setFormData({ ...formData, alias: e.target.value })
              }
            />
          </>
        ) : (
          <>
            <TextField
              select
              margin="dense"
              label="From Participant"
              fullWidth
              variant="outlined"
              value={formData.from || ""}
              onChange={(e) =>
                setFormData({ ...formData, from: e.target.value })
              }
              sx={{ mb: 2 }}
              SelectProps={{ native: true }}
            >
              <option value=""></option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.id})
                </option>
              ))}
            </TextField>
            <TextField
              select
              margin="dense"
              label="To Participant"
              fullWidth
              variant="outlined"
              value={formData.to || ""}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              sx={{ mb: 2 }}
              SelectProps={{ native: true }}
            >
              <option value=""></option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.id})
                </option>
              ))}
            </TextField>
            <TextField
              select
              margin="dense"
              label="Arrow Type"
              fullWidth
              variant="outlined"
              value={formData.arrowType || "->>"}
              onChange={(e) =>
                setFormData({ ...formData, arrowType: e.target.value })
              }
              sx={{ mb: 2 }}
              SelectProps={{ native: true }}
            >
              <option value="->>">Solid with filled arrow {"->>"}</option>
              <option value="-->>">Dashed with filled arrow {"-->>"}</option>
              <option value="->">Solid with open arrow (-&gt;)</option>
              <option value="-->">Dashed with open arrow (--&gt;)</option>
            </TextField>
            <TextField
              margin="dense"
              label="Message"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={formData.message || ""}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Enhanced ParticipantNode with dynamic text colors and improved dark theme
const ParticipantNode = ({ data, selected }) => {
  // Use theme from data or fallback to default
  const themeStyle = data.themeStyle || {
    primaryColor: "#FFFFFF",
    primaryBorderColor: "#ff5733",
    textColor: "#333333",
    secondaryTextColor: "#666666"
  };

  // Calculate text color based on background brightness for better contrast
  const getTextColor = (backgroundColor) => {
    if (!backgroundColor) return "#333333";
    
    try {
      // Convert hex to RGB
      const hex = backgroundColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // Calculate brightness (perceived luminance)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      
      // Return white for dark backgrounds, black for light backgrounds
      return brightness > 128 ? "#333333" : "#FFFFFF";
    } catch (error) {
      return "#333333"; // Fallback color
    }
  };

  const textColor = themeStyle.textColor || getTextColor(themeStyle.primaryColor);
  const secondaryTextColor = themeStyle.secondaryTextColor || getTextColor(themeStyle.primaryColor);

  return (
    <div
      style={{
        padding: "20px 24px",
        background: themeStyle.primaryColor,
        border: `3px solid ${selected ? "#1976d2" : themeStyle.primaryBorderColor}`,
        borderRadius: "12px",
        minWidth: "160px",
        textAlign: "center",
        boxShadow: selected
          ? "0 4px 20px rgba(25, 118, 210, 0.3)"
          : "0 4px 12px rgba(0,0,0,0.15)",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <div
        style={{
          fontWeight: "600",
          marginBottom: "8px",
          fontSize: "16px",
          color: textColor,
        }}
      >
        {data.label}
      </div>
      <div
        style={{
          fontSize: "14px",
          color: secondaryTextColor,
          fontWeight: "400",
          opacity: 0.8,
        }}
      >
        {data.alias || data.id}
      </div>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
};

// Enhanced LifelineNode for dark theme
const LifelineNode = ({ data }) => {
  const isDarkTheme = data.themeStyle?.primaryColor && 
    getBrightness(data.themeStyle.primaryColor) < 128;
  
  const lifelineColor = isDarkTheme ? "#666666" : "#999999";
  
  return (
    <div
      style={{
        width: "3px",
        height: `${data.height}px`,
        background: isDarkTheme 
          ? `repeating-linear-gradient(to bottom, ${lifelineColor} 0px, ${lifelineColor} 8px, transparent 8px, transparent 16px)`
          : `repeating-linear-gradient(to bottom, ${lifelineColor} 0px, ${lifelineColor} 8px, transparent 8px, transparent 16px)`,
        pointerEvents: "none",
      }}
    />
  );
};

// Helper function to calculate brightness
const getBrightness = (hexColor) => {
  if (!hexColor) return 255;
  try {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  } catch (error) {
    return 255;
  }
};

const nodeTypes = {
  participant: ParticipantNode,
  lifeline: LifelineNode,
};

const SequenceDiagramView = ({ color, fontSizes }) => {
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
  const [selectedTheme, setSelectedTheme] = useState('default');
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

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const flowContainerRef = useRef(null);

  const [editModal, setEditModal] = useState({
    open: false,
    type: null,
    data: null,
  });

  // Enhanced themes with better dark theme support and arrow colors
  const addTheme = [
    {
      name: "default",
      style: {
        primaryColor: "#1976d2", // Changed to blue
        primaryBorderColor: "#1565c0", // Darker blue for border
        arrowColor: "#1976d2", // Blue arrows
        textColor: "#FFFFFF", // White text for contrast on blue
        secondaryTextColor: "#E3F2FD" // Light blue text
      },
    },
    {
      name: "forest",
      style: {
        primaryColor: "#2E8B57",
        primaryBorderColor: "#145214",
        arrowColor: "#228B22",
        textColor: "#FFFFFF",
        secondaryTextColor: "#E8F5E8"
      },
    },
    {
      name: "base",
      style: {
        primaryColor: "#F0F0F0",
        primaryBorderColor: "#ff5733",
        arrowColor: "#666666",
        textColor: "#333333",
        secondaryTextColor: "#666666"
      },
    },
    {
      name: "dark",
      style: {
        primaryColor: "#1a1a1a",
        primaryBorderColor: "#ff5733",
        arrowColor: "#bb86fc",
        textColor: "#ffffff",
        secondaryTextColor: "#cccccc"
      },
    },
    {
      name: "neutral",
      style: {
        primaryColor: "#CCCCCC",
        primaryBorderColor: "#ff5733",
        arrowColor: "#666666",
        textColor: "#333333",
        secondaryTextColor: "#666666"
      },
    },
    {
      name: "ocean",
      style: {
        primaryColor: "#71BBB2",
        primaryBorderColor: "#497D74",
        arrowColor: "#1a5276",
        textColor: "#FFFFFF",
        secondaryTextColor: "#E8F6F3"
      },
    },
    {
      name: "solarized",
      style: {
        primaryColor: "#A27B5C",
        primaryBorderColor: "#3F4F44",
        arrowColor: "#2aa198",
        textColor: "#FFFFFF",
        secondaryTextColor: "#FDF6E3"
      },
    },
    {
      name: "sunset",
      style: {
        primaryColor: "#FFCDB2",
        primaryBorderColor: "#E5989B",
        arrowColor: "#e76f51",
        textColor: "#333333",
        secondaryTextColor: "#666666"
      },
    },
    {
      name: "neon",
      style: {
        primaryColor: "#B6FFA1",
        primaryBorderColor: "#00FF9C",
        arrowColor: "#00ff88",
        textColor: "#333333",
        secondaryTextColor: "#666666"
      },
    },
    {
      name: "monochrome",
      style: {
        primaryColor: "#A7B49E",
        primaryBorderColor: "#818C78",
        arrowColor: "#555555",
        textColor: "#333333",
        secondaryTextColor: "#666666"
      },
    },
    {
      name: "lavender",
      style: {
        primaryColor: "#CDA4DE",
        primaryBorderColor: "#8E44AD",
        arrowColor: "#9b59b6",
        textColor: "#FFFFFF",
        secondaryTextColor: "#F4ECF7"
      },
    },
    {
      name: "citrus",
      style: {
        primaryColor: "#FFD166",
        primaryBorderColor: "#EF476F",
        arrowColor: "#ef476f",
        textColor: "#333333",
        secondaryTextColor: "#666666"
      },
    },
    {
      name: "midnight",
      style: {
        primaryColor: "#0d1b2a",
        primaryBorderColor: "#1b263b",
        arrowColor: "#e0e1dd",
        textColor: "#e0e1dd",
        secondaryTextColor: "#778da9"
      },
    },
    {
      name: "pastel",
      style: {
        primaryColor: "#FFB7B2",
        primaryBorderColor: "#FFDAC1",
        arrowColor: "#ff9aa2",
        textColor: "#333333",
        secondaryTextColor: "#666666"
      },
    },
  ];

  // Helper function to escape regex special characters
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  // Enhanced parser for better participant handling
  const parseSequenceDiagram = useCallback((text) => {
    if (!text || !text.trim().startsWith("sequenceDiagram")) {
      return { participants: new Map(), messages: [] };
    }

    const lines = text.split("\n");
    const participants = new Map();
    const messages = [];
    const foundParticipants = new Set();

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("%%")) return;

      // Parse participant definitions
      const participantMatch1 = trimmed.match(
        /^\s*participant\s+(\w+)\s+as\s+(.+)$/
      );
      const participantMatch2 = trimmed.match(/^\s*participant\s+(\w+)$/);

      if (participantMatch1) {
        const [, id, label] = participantMatch1;
        participants.set(id, { id, label: label.trim() });
        foundParticipants.add(id);
        return;
      } else if (participantMatch2) {
        const [, id] = participantMatch2;
        participants.set(id, { id, label: id });
        foundParticipants.add(id);
        return;
      }

      // Parse loop statements
      const loopStartMatch = trimmed.match(/^\s*loop\s+(.+)$/i);
      const loopEndMatch = trimmed.match(/^\s*end\s*$/i);

      if (loopStartMatch) {
        const [, label] = loopStartMatch;
        messages.push({ type: "loopStart", label: label.trim() });
        return;
      }

      if (loopEndMatch) {
        messages.push({ type: "loopEnd" });
        return;
      }

      // Parse messages and auto-detect participants
      const messageMatch = trimmed.match(
        /^\s*(\w+)\s*([->]+|-->>|->>|-->|<-{1,2})\s*(\+?)(\w+)\s*:\s*(.+)$/
      );

      if (messageMatch) {
        const [, from, arrow, activation, to, message] = messageMatch;
        const cleanFrom = from;
        const cleanTo = to;

        messages.push({
          type: "message",
          from: cleanFrom,
          to: cleanTo,
          arrow: arrow.trim() + (activation || ""),
          message: message.trim(),
        });

        // Auto-add participants from messages if not already defined
        if (!foundParticipants.has(cleanFrom)) {
          participants.set(cleanFrom, { id: cleanFrom, label: cleanFrom });
          foundParticipants.add(cleanFrom);
        }
        if (!foundParticipants.has(cleanTo)) {
          participants.set(cleanTo, { id: cleanTo, label: cleanTo });
          foundParticipants.add(cleanTo);
        }
      }
    });

    return { participants, messages };
  }, []);

  // Update participant in code
  const updateParticipant = useCallback(
    (oldParticipantId, newLabel, newAlias) => {
      let newCode = codeRef.current;
      console.log("Updating participant:", {
        oldParticipantId,
        newLabel,
        newAlias,
      });

      // Handle both participant formats with proper escaping
      const pattern1 = new RegExp(
        `^\\s*participant\\s+${oldParticipantId}\\s+as\\s+.+$`,
        "gm"
      );
      const pattern2 = new RegExp(
        `^\\s*participant\\s+${oldParticipantId}\\s*$`,
        "gm"
      );

      let found = false;

      // Try pattern 1: participant X as Y
      if (newCode.match(pattern1)) {
        newCode = newCode.replace(
          pattern1,
          `    participant ${newAlias} as ${newLabel}`
        );
        found = true;
      }
      // Try pattern 2: participant X (without 'as')
      else if (newCode.match(pattern2)) {
        newCode = newCode.replace(
          pattern2,
          `    participant ${newAlias} as ${newLabel}`
        );
        found = true;
      }

      if (found) {
        // Update all messages that reference the old participant ID
        const messagePattern = new RegExp(`\\b${oldParticipantId}\\b`, "g");
        newCode = newCode.replace(messagePattern, newAlias);
      } else {
        // Check if participant exists in any messages but wasn't defined
        const participantInMessages = new RegExp(
          `\\b${oldParticipantId}\\b`,
          "g"
        ).test(newCode);
        if (participantInMessages) {
          // Participant exists in messages but wasn't formally defined, add the definition
          const lines = newCode.split("\n");
          let insertIndex = 1; // After "sequenceDiagram"

          // Find the line after sequenceDiagram
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === "sequenceDiagram") {
              insertIndex = i + 1;
              break;
            }
          }

          // Insert the participant definition
          lines.splice(
            insertIndex,
            0,
            `    participant ${newAlias} as ${newLabel}`
          );
          newCode = lines.join("\n");

          // Update messages with new alias
          newCode = newCode.replace(
            new RegExp(`\\b${oldParticipantId}\\b`, "g"),
            newAlias
          );
        } else {
          // Add new participant at the end
          newCode += `\n    participant ${newAlias} as ${newLabel}`;
        }
      }

      setCode(newCode);
      sessionStorage.setItem("code", newCode);
      return newCode;
    },
    [setCode]
  );

  // Update message in code
  const updateMessage = useCallback(
    (oldFrom, oldTo, oldMessage, newFrom, newTo, newMessage, newArrowType) => {
      let newCode = codeRef.current;
      console.log("Updating message:", {
        oldFrom,
        oldTo,
        oldMessage,
        newFrom,
        newTo,
        newMessage,
        newArrowType,
      });

      // Escape special characters in the old message
      const escapedOldMessage = escapeRegExp(oldMessage);

      // Create multiple patterns to match different message formats
      const patterns = [
        new RegExp(
          `^\\s*${oldFrom}\\s*[-]+>\\s*${oldTo}\\s*:\\s*${escapedOldMessage}\\s*$`,
          "gm"
        ),
        new RegExp(
          `^\\s*${oldFrom}\\s*[-]+>\\s*${oldTo}\\s*:\\s*.*${escapedOldMessage}.*$`,
          "gm"
        ),
      ];

      const newMessageLine = `    ${newFrom}${newArrowType}${newTo}: ${newMessage}`;
      let replaced = false;

      for (const pattern of patterns) {
        if (newCode.match(pattern)) {
          newCode = newCode.replace(pattern, newMessageLine);
          replaced = true;
          break;
        }
      }

      if (!replaced) {
        // Fallback: manual line-by-line search and replace
        const lines = newCode.split("\n");
        let updatedLines = [];
        let messageFound = false;

        for (let line of lines) {
          const trimmedLine = line.trim();

          // Check if this line matches our message criteria
          const hasFrom = trimmedLine.includes(oldFrom);
          const hasTo = trimmedLine.includes(oldTo);
          const hasMessage = trimmedLine.includes(oldMessage);
          const isMessageLine =
            trimmedLine.includes("->") || trimmedLine.includes("-->");

          if (
            hasFrom &&
            hasTo &&
            hasMessage &&
            isMessageLine &&
            !messageFound
          ) {
            // Replace this line with the new message
            updatedLines.push(newMessageLine);
            messageFound = true;
          } else {
            updatedLines.push(line);
          }
        }

        newCode = updatedLines.join("\n");

        if (!messageFound) {
          newCode += `\n${newMessageLine}`;
        }
      }

      setCode(newCode);
      sessionStorage.setItem("code", newCode);
      return newCode;
    },
    [setCode]
  );

  // Delete participant with all related messages - IMPROVED
  const deleteParticipant = useCallback(
    (participantId) => {
      let newCode = codeRef.current;
      console.log("Deleting participant from code:", participantId);

      // Remove participant definition (both formats)
      newCode = newCode.replace(
        new RegExp(`^\\s*participant\\s+${participantId}\\s+as\\s+.+$`, "gm"),
        ""
      );
      newCode = newCode.replace(
        new RegExp(`^\\s*participant\\s+${participantId}\\s*$`, "gm"),
        ""
      );

      // Remove messages involving this participant
      newCode = newCode.replace(
        new RegExp(`^\\s*${participantId}\\s*[-]+>\\s*\\w+.*$`, "gm"),
        ""
      );
      newCode = newCode.replace(
        new RegExp(`^\\s*\\w+\\s*[-]+>\\s*${participantId}.*$`, "gm"),
        ""
      );

      // Clean up empty lines and multiple newlines
      newCode = newCode
        .split("\n")
        .filter((line) => line.trim() !== "")
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      // Ensure we have sequenceDiagram at the start
      if (!newCode.includes("sequenceDiagram")) {
        newCode = "sequenceDiagram\n" + newCode;
      }

      console.log("Code after participant deletion:", newCode);
      setCode(newCode);
      sessionStorage.setItem("code", newCode);
      return newCode;
    },
    [setCode]
  );

  // Delete specific message - IMPROVED
  const deleteMessage = useCallback(
    (from, to, message) => {
      let newCode = codeRef.current;
      console.log("Deleting message from code:", { from, to, message });

      // Escape special characters in the message for regex
      const escapedMessage = escapeRegExp(message);

      // Multiple pattern attempts to ensure we find and delete the message
      const patterns = [
        new RegExp(
          `^\\s*${from}\\s*[-]+>\\s*${to}\\s*:\\s*${escapedMessage}\\s*$`,
          "gm"
        ),
        new RegExp(
          `^\\s*${from}\\s*[-]+>\\s*${to}\\s*:\\s*.*${escapedMessage}.*$`,
          "gm"
        ),
      ];

      let deleted = false;
      for (const pattern of patterns) {
        if (newCode.match(pattern)) {
          newCode = newCode.replace(pattern, "");
          deleted = true;
          break;
        }
      }

      if (!deleted) {
        // Manual line-by-line search as fallback
        const lines = newCode.split("\n");
        const filteredLines = lines.filter((line) => {
          const trimmedLine = line.trim();
          const hasFrom = trimmedLine.includes(from);
          const hasTo = trimmedLine.includes(to);
          const hasMessage = trimmedLine.includes(message);
          const isMessageLine =
            trimmedLine.includes("->") || trimmedLine.includes("-->");

          // Keep the line if it doesn't match ALL criteria
          return !(hasFrom && hasTo && hasMessage && isMessageLine);
        });
        newCode = filteredLines.join("\n");
      }

      // Clean up empty lines
      newCode = newCode
        .split("\n")
        .filter((line) => line.trim() !== "")
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      setCode(newCode);
      sessionStorage.setItem("code", newCode);
      return newCode;
    },
    [setCode]
  );

  // Get all participants for the edit modal
  const getAllParticipants = useCallback(() => {
    try {
      const { participants } = parseSequenceDiagram(codeRef.current);
      const participantArray = Array.from(participants.values());
      return participantArray;
    } catch (error) {
      console.error("Error parsing participants:", error);
      return [];
    }
  }, [parseSequenceDiagram]);

  // Handle edit operations
  const handleEdit = useCallback(() => {
    if (!selectedElement) {
      console.log("No element selected for editing");
      return;
    }

    console.log("Editing selected element:", selectedElement);

    if (selectedElement.type === "node") {
      const node = selectedElement.data;
      if (node.type === "participant") {
        const participantId = node.id
          .replace("-top", "")
          .replace("-bottom", "");
        setEditModal({
          open: true,
          type: "participant",
          data: {
            id: participantId,
            label: node.data?.label || participantId,
          },
        });
      }
    } else if (selectedElement.type === "edge") {
      const edge = selectedElement.data;
      if (edge.data) {
        setEditModal({
          open: true,
          type: "message",
          data: {
            originalFrom: edge.data.originalFrom,
            originalTo: edge.data.originalTo,
            label: edge.data.label,
            arrowType: edge.data.arrowType || "->>",
          },
        });
      }
    }
  }, [selectedElement]);

  // Handle save from edit modal
  const handleSaveEdit = useCallback(
    (formData) => {
      console.log("Saving edit:", { formData, editModal });

      if (editModal.type === "participant") {
        const { label, alias } = formData;
        if (label && alias) {
          updateParticipant(editModal.data.id, label, alias);
        }
      } else if (editModal.type === "message") {
        const { from, to, message, arrowType } = formData;
        if (from && to && message) {
          updateMessage(
            editModal.data.originalFrom,
            editModal.data.originalTo,
            editModal.data.label,
            from,
            to,
            message,
            arrowType
          );
        }
      }

      // Clear selection after save
      setSelectedElement(null);
    },
    [editModal, updateParticipant, updateMessage]
  );

  // Convert sequence diagram to React Flow
  const convertSequenceToReactFlow = useCallback(
    (text) => {
      const { participants, messages } = parseSequenceDiagram(text);

      if (participants.size === 0) {
        return { nodes: [], edges: [] };
      }

      const nodesOut = [];
      const edgesOut = [];

      const nodeThemeName = color.theme.includes("base/")
      ? color.theme.split("/")[1]
      : color.theme;
    const themeStyle = addTheme.find((t) => t.name === nodeThemeName)?.style;
      // Layout constants
      const participantArray = Array.from(participants.values());
      const nodeWidth = 180;
      const nodeHeight = 60;
      const horizontalSpacing = 280;
      const startX = 120;

      const topBoxY = 80;
      const messageStartY = topBoxY + nodeHeight + 50;
      const messageSpacing = 80;

      // Calculate total height needed
      let totalHeight = messageStartY;
      let loopDepth = 0;

      messages.forEach((message) => {
        if (message.type === "loopStart") {
          loopDepth++;
          totalHeight += 120;
        } else if (message.type === "loopEnd") {
          loopDepth--;
          totalHeight += 60;
        } else if (message.type === "message") {
          const spacing = messageSpacing + loopDepth * 20;
          totalHeight += spacing;
        }
      });

      const bottomBuffer = 100;
      totalHeight += bottomBuffer;
      const bottomBoxY = totalHeight - nodeHeight;

      // Create participant boxes and lifelines
      participantArray.forEach((participant, index) => {
        const nodeId = participant.id;
        const x = startX + index * horizontalSpacing;

        // Top participant box
        nodesOut.push({
          id: `${nodeId}-top`,
          type: "participant",
          data: {
            label: participant.label,
            id: participant.id,
            alias: participant.id,
            themeStyle: themeStyle,
          },
          position: { x, y: topBoxY },
        });

        // Bottom participant box
        nodesOut.push({
          id: `${nodeId}-bottom`,
          type: "participant",
          data: {
            label: participant.label,
            id: participant.id,
            alias: participant.id,
            themeStyle: themeStyle,
          },
          position: { x, y: bottomBoxY },
        });

        // Lifeline with theme support
        const lifelineHeight = bottomBoxY - topBoxY - nodeHeight;
        nodesOut.push({
          id: `${nodeId}-lifeline`,
          type: "lifeline",
          data: { 
            height: lifelineHeight,
            themeStyle: themeStyle 
          },
          position: { x: x + nodeWidth / 2 - 1, y: topBoxY + nodeHeight },
          style: {
            width: "2px",
            height: `${lifelineHeight}px`,
            background: "#999",
            borderLeft: "2px dashed #999",
            pointerEvents: "none",
            zIndex: 10,
          },
          selectable: false,
          draggable: false,
          connectable: false,
        });
      });

      // Process messages
      let currentY = messageStartY;

      messages.forEach((message) => {
        if (message.type === "message") {
          const sourceParticipant = participantArray.find(
            (p) => p.id === message.from
          );
          const targetParticipant = participantArray.find(
            (p) => p.id === message.to
          );

          if (!sourceParticipant || !targetParticipant) return;

          const sourceIndex = participantArray.indexOf(sourceParticipant);
          const targetIndex = participantArray.indexOf(targetParticipant);

          const sourceX =
            startX + sourceIndex * horizontalSpacing + nodeWidth / 2;
          const targetX =
            startX + targetIndex * horizontalSpacing + nodeWidth / 2;

          const edgeId = `msg-${message.from}-${message.to}-${currentY}`;

          // Create invisible nodes for message endpoints
          nodesOut.push({
            id: `${edgeId}-source`,
            type: "default",
            data: { label: "" },
            position: { x: sourceX - 8, y: currentY },
            style: { width: "16px", height: "16px", opacity: 0 },
            selectable: false,
            draggable: false,
            connectable: false,
          });

          nodesOut.push({
            id: `${edgeId}-target`,
            type: "default",
            data: { label: "" },
            position: { x: targetX - 8, y: currentY },
            style: { width: "16px", height: "16px", opacity: 0 },
            selectable: false,
            draggable: false,
            connectable: false,
          });

          const arrowConfig = getMermaidArrowStyle(message.arrow, themeStyle);

          // Determine label background color based on theme
          const isDarkTheme = getBrightness(themeStyle?.primaryColor) < 128;
          const labelBgColor = isDarkTheme ? "#2d3748" : "white";
          const labelTextColor = isDarkTheme ? "#e2e8f0" : "#333";
          const labelBorderColor = isDarkTheme ? "#4a5568" : "#ddd";

          edgesOut.push({
            id: edgeId,
            source: `${edgeId}-source`,
            target: `${edgeId}-target`,
            type: "straight",
            style: arrowConfig.style,
            markerEnd: arrowConfig.markerEnd,
            label: message.message,
            labelStyle: {
              fontSize: fontSizes?.message || 14,
              fontWeight: "500",
              fill: labelTextColor,
            },
            labelBgStyle: {
              fill: labelBgColor,
              fillOpacity: 0.95,
              stroke: labelBorderColor,
            },
            labelBgPadding: [6, 8],
            labelBgBorderRadius: 6,
            zIndex: 15,
            data: {
              originalFrom: message.from,
              originalTo: message.to,
              label: message.message,
              arrowType: message.arrow,
            },
          });

          currentY += messageSpacing;
        }
      });

      return { nodes: nodesOut, edges: edgesOut };
    },
    [parseSequenceDiagram, fontSizes, color.theme]
  );

  // FIXED: Delete handler - COMPLETELY REWORKED
  const handleDeleteSelected = useCallback(() => {
    if (!selectedElement) {
      console.log("No element selected for deletion");
      return;
    }

    console.log("Deleting selected element:", selectedElement);

    let newCode = codeRef.current;

    if (selectedElement.type === "node") {
      const node = selectedElement.data;
      if (node.type === "participant") {
        const participantId = node.id
          .replace("-top", "")
          .replace("-bottom", "");
        console.log("Deleting participant:", participantId);
        newCode = deleteParticipant(participantId);
      }
    } else if (selectedElement.type === "edge") {
      const edge = selectedElement.data;
      console.log("Deleting edge:", edge);

      if (
        edge.data &&
        edge.data.originalFrom &&
        edge.data.originalTo &&
        edge.data.label
      ) {
        newCode = deleteMessage(
          edge.data.originalFrom,
          edge.data.originalTo,
          edge.data.label
        );
      }
    }

    // Clear selection
    setSelectedElement(null);

    // Force immediate diagram refresh using the updated code
    if (newCode && newCode !== codeRef.current) {
      console.log("Refreshing diagram with new code");

      // Update the code reference immediately
      codeRef.current = newCode;

      // Force re-render by updating the diagram state
      setTimeout(() => {
        const { nodes: newNodes, edges: newEdges } =
          convertSequenceToReactFlow(newCode);
        setNodes(newNodes);
        setEdges(newEdges);

        // Also trigger the store update to ensure consistency
        setCode(newCode);
      }, 0);
    }
  }, [
    selectedElement,
    deleteParticipant,
    deleteMessage,
    convertSequenceToReactFlow,
    setNodes,
    setEdges,
    setCode,
  ]);

  // Add new participant
  const addNewParticipant = useCallback(() => {
    const participantId = `Participant${Date.now()}`;
    const participantLabel = `New Participant`;
    const participantCode = `    participant ${participantId} as ${participantLabel}`;

    let newCode = codeRef.current;
    if (!newCode.includes("sequenceDiagram")) {
      newCode = "sequenceDiagram\n";
    }

    newCode += "\n" + participantCode;

    setCode(newCode);
    sessionStorage.setItem("code", newCode);
  }, [setCode]);

  // Add new message
  const addNewMessage = useCallback(() => {
    const participants = getAllParticipants();
    if (participants.length === 0) return;

    const from = participants[0].id;
    const to = participants[participants.length > 1 ? 1 : 0].id;
    const messageCode = `    ${from}->>${to}: New message`;

    let newCode = codeRef.current;
    if (!newCode.includes("sequenceDiagram")) {
      newCode = "sequenceDiagram\n";
    }

    newCode += "\n" + messageCode;

    setCode(newCode);
    sessionStorage.setItem("code", newCode);
  }, [setCode, getAllParticipants]);

  // Enhanced Mermaid arrow styles with theme support
  const getMermaidArrowStyle = (arrow, themeStyle) => {
    const baseStyle = { strokeWidth: 2 };
    const baseMarker = { width: 20, height: 20 };

    // Use theme arrow color or fallback
    const arrowColor = themeStyle?.arrowColor || "#1976d2";

    switch (arrow) {
      case "->>":
        return {
          style: { ...baseStyle, stroke: arrowColor },
          markerEnd: {
            ...baseMarker,
            type: MarkerType.ArrowClosed,
            color: arrowColor,
          },
        };
      case "-->>":
        return {
          style: { ...baseStyle, stroke: arrowColor, strokeDasharray: "5,5" },
          markerEnd: {
            ...baseMarker,
            type: MarkerType.ArrowClosed,
            color: arrowColor,
          },
        };
      case "->":
        return {
          style: { ...baseStyle, stroke: arrowColor },
          markerEnd: {
            ...baseMarker,
            type: MarkerType.Arrow,
            color: arrowColor,
          },
        };
      case "-->":
        return {
          style: { ...baseStyle, stroke: arrowColor, strokeDasharray: "5,5" },
          markerEnd: {
            ...baseMarker,
            type: MarkerType.Arrow,
            color: arrowColor,
          },
        };
      default:
        return {
          style: { ...baseStyle, stroke: arrowColor },
          markerEnd: {
            ...baseMarker,
            type: MarkerType.ArrowClosed,
            color: arrowColor,
          },
        };
    }
  };

  // FIXED: Selection change handler - IMPROVED
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }) => {
      console.log("Selection changed:", { selectedNodes, selectedEdges });

      // Prioritize edges over nodes for selection
      if (selectedEdges && selectedEdges.length > 0) {
        const edge = selectedEdges[0];
        if (edge.data) {
          // Get edge position for toolbar placement
          const edgeElement = document.querySelector(`[data-id="${edge.id}"]`);
          let screenPosition = { x: mousePosition.x, y: mousePosition.y - 50 };

          if (edgeElement && flowContainerRef.current) {
            const rect = edgeElement.getBoundingClientRect();
            const containerRect =
              flowContainerRef.current.getBoundingClientRect();
            screenPosition = {
              x: rect.left - containerRect.left + rect.width / 2,
              y: rect.top - containerRect.top - 40,
            };
          }

          setSelectedElement({
            type: "edge",
            data: edge,
            screenPosition,
          });
          return;
        }
      }

      if (selectedNodes && selectedNodes.length > 0) {
        const node = selectedNodes[0];
        if (node.type === "participant") {
          const participantId = node.id
            .replace("-top", "")
            .replace("-bottom", "");

          // Get the node's actual screen position
          const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
          let screenPosition = {
            x: node.position.x + 90,
            y: node.position.y - 40,
          };

          if (nodeElement && flowContainerRef.current) {
            const rect = nodeElement.getBoundingClientRect();
            const containerRect =
              flowContainerRef.current.getBoundingClientRect();
            screenPosition = {
              x: rect.left - containerRect.left + rect.width / 2,
              y: rect.top - containerRect.top - 40,
            };
          }

          setSelectedElement({
            type: "node",
            data: { ...node, participantId },
            screenPosition,
          });
          return;
        }
      }

      // Clear selection if nothing is selected
      setSelectedElement(null);
    },
    [mousePosition]
  );

  const handleNodeClick = useCallback((event, node) => {
    console.log("Node clicked:", node);
    if (node.type === "participant") {
      const participantId = node.id.replace("-top", "").replace("-bottom", "");

      // Get the node's position in the flow container
      const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
      let screenPosition = { x: node.position.x + 90, y: node.position.y - 40 };

      if (nodeElement && flowContainerRef.current) {
        const rect = nodeElement.getBoundingClientRect();
        const containerRect = flowContainerRef.current.getBoundingClientRect();
        screenPosition = {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top - 40,
        };
      }

      setSelectedElement({
        type: "node",
        data: { ...node, participantId },
        screenPosition,
        elementId: node.id, // Store element ID for stability
      });

      // Stop event propagation to prevent selection change
      event.stopPropagation();
    }
  }, []);

  const handleEdgeClick = useCallback(
    (event, edge) => {
      console.log("Edge clicked:", edge);
      if (edge.data) {
        // Get edge center position in the flow container
        const edgeElement = document.querySelector(`[data-id="${edge.id}"]`);
        let screenPosition = { x: 0, y: 0 };

        if (edgeElement && flowContainerRef.current) {
          const rect = edgeElement.getBoundingClientRect();
          const containerRect =
            flowContainerRef.current.getBoundingClientRect();
          screenPosition = {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top - 40,
          };
        } else {
          // Fallback: use edge source position
          const sourceNode = nodes.find((n) => n.id === edge.source);
          if (sourceNode) {
            screenPosition = {
              x: sourceNode.position.x + 100,
              y: sourceNode.position.y - 40,
            };
          }
        }

        setSelectedElement({
          type: "edge",
          data: edge,
          screenPosition,
          elementId: edge.id, // Store element ID for stability
        });

        // Stop event propagation to prevent selection change
        event.stopPropagation();
      }
    },
    [nodes]
  );

  // Keyboard delete handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedElement
      ) {
        event.preventDefault();
        handleDeleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElement, handleDeleteSelected]);

  // Validation
  const setValidateCodeAndConfig = async (c, conf) => {
    try {
      if (c.trim().startsWith("sequenceDiagram")) {
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
    (text) => {
      if (!text) return;

      const { nodes: flowNodes, edges: flowEdges } =
        convertSequenceToReactFlow(text);
      setNodes(flowNodes);
      setEdges(flowEdges);
      setSvg(null);
    },
    [convertSequenceToReactFlow, setNodes, setEdges, setSvg]
  );

  // Effects for auto-rendering when code changes
  useEffect(() => {
    if (typeof window !== "undefined" && (autoSync || updateDiagram)) {
      setValidateCodeAndConfig(debounceCode, debounceConfig);
      if (updateDiagram) setUpdateDiagram(false);
    }
  }, [debounceCode, debounceConfig, autoSync, updateDiagram, setUpdateDiagram]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      validateCode &&
      !validateCode.startsWith("Syntax error")
    ) {
      renderDiagram(validateCode);
    }
  }, [validateCode, validateConfig, renderDiagram]);

  // ALSO render when code changes directly (not just through validation)
  useEffect(() => {
    if (code && !validateCode.startsWith("Syntax error")) {
      renderDiagram(code);
    }
  }, [code, renderDiagram, validateCode]);

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
      {/* Edit Modal */}
      <EditModal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, type: null, data: null })}
        type={editModal.type}
        data={editModal.data}
        onSave={handleSaveEdit}
        participants={getAllParticipants()}
      />
      {selectedElement && (
        <Box
          sx={{
            position: "absolute",
            zIndex: 2000,
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "row",
            gap: 1,
            background: "white",
            padding: "8px 12px",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            border: "2px solid #1976d2",
            left: selectedElement.screenPosition.x,
            top: selectedElement.screenPosition.y,
            transform: "translateX(-50%)",
            minWidth: "80px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Tooltip
            title={`Edit ${
              selectedElement.type === "node" ? "participant" : "message"
            }`}
          >
            <IconButton
              color="primary"
              size="small"
              onClick={handleEdit}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.1)",
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={`Delete ${
              selectedElement.type === "node" ? "participant" : "message"
            }`}
          >
            <IconButton
              color="error"
              size="small"
              onClick={handleDeleteSelected}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(211, 47, 47, 0.1)",
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Control buttons */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 1000,
          display: "flex",
          gap: 1,
        }}
      >
        <Tooltip title="Add new participant">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={addNewParticipant}
            sx={{ fontSize: "10px", padding: "4px 8px", borderRadius: "8px" }}
          >
            Add Participant
          </Button>
        </Tooltip>
        <Tooltip title="Add new message">
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={addNewMessage}
            sx={{ fontSize: "10px", padding: "4px 8px", borderRadius: "8px" }}
          >
            Add Message
          </Button>
        </Tooltip>
      </Box>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={() => setSelectedElement(null)}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onNodeDoubleClick={(event, node) => {
          if (node.type === "participant") {
            const participantId = node.id
              .replace("-top", "")
              .replace("-bottom", "");
            setEditModal({
              open: true,
              type: "participant",
              data: {
                id: participantId,
                label: node.data?.label || participantId,
              },
            });
            setSelectedElement(null);
          }
        }}
        onEdgeDoubleClick={(event, edge) => {
          if (edge.data) {
            setEditModal({
              open: true,
              type: "message",
              data: {
                originalFrom: edge.data.originalFrom,
                originalTo: edge.data.originalTo,
                label: edge.data.label,
                arrowType: edge.data.arrowType || "->>",
              },
            });
            setSelectedElement(null);
          }
        }}
        onInit={setReactFlowInstance}
        nodeOrigin={[0, 0]}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
          minZoom: 0.1,
          maxZoom: 2,
        }}
        minZoom={0.05}
        maxZoom={3}

        onSelectionChange={onSelectionChange}
        connectionLineType={ConnectionLineType.SmoothStep}
     
        style={{ background: "transparent" }}
        nodeTypes={nodeTypes}
        deleteKeyCode={null}
        selectionKeyCode={["Shift"]}
        multiSelectionKeyCode={["Shift"]}
      >
        {/* <Background /> */}
        {/* <Controls /> */}
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
    </Box>
  );
};

const SequenceDiagramWrapper = (props) => (
  <ReactFlowProvider>
    <SequenceDiagramView {...props} />
  </ReactFlowProvider>
);

export default SequenceDiagramWrapper;