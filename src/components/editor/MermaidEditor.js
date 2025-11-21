"use client";

import MonacoEditor from "@monaco-editor/react";
import initEditor from "monaco-mermaid";
import { useStore } from "@/store";
import { useState, useEffect, useRef, useCallback } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import axiosInstance from "@/utils/axiosInstance";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

const MermaidEditor = () => {
    const code = useStore((state) => state.code);
    const setCode = useStore((state) => state.setCode);
    const config = useStore((state) => state.config);
    const setConfig = useStore((state) => state.setConfig);
    const editorMode = useStore((state) => state.editorMode);
    const pushToHistory = useStore((state) => state.pushToHistory);
    const isApplyingHistory = useStore((state) => state.isApplyingHistory);
    const registerHistorySyncCallback = useStore((state) => state.registerHistorySyncCallback);

    const [isModified, setIsModified] = useState(false);
    const { id } = useParams();
    const [loading, setLoading] = useState(true);

    // Store pending history state and debounce timer
    const pendingHistoryRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const autoSaveTimerRef = useRef(null);
    const editorRef = useRef(null);
    const hasLoadedRef = useRef(false);

    // Flush pending history to store
    const flushPendingHistory = useCallback(() => {
        if (pendingHistoryRef.current && !isApplyingHistory) {
            // Update code and mark that this change should trigger history push
            // The actual history push will happen in ArchitectureView after parsing
            // to ensure we capture the correct nodes/edges state
            setCode(pendingHistoryRef.current, { pushHistoryOnParse: true });
            pendingHistoryRef.current = null;
        }
    }, [setCode, isApplyingHistory]);

    // Function to fetch data from database
    const fetchData = async () => {
        try {
            const response = await axiosInstance.get(`/api/flowchart/${id}`);
            const freshCode = response.data.data.mermaidString;

            console.log('=== LOADING FROM DATABASE ===');
            console.log('Loaded code:', freshCode.substring(0, 100));

            // Set code directly from database - NO localStorage/sessionStorage
            setCode(freshCode);
            // Mark as loaded so auto-save can start working
            hasLoadedRef.current = true;

        } catch (error) {
            console.error('Error fetching flowchart:', error);
            toast.error("Error loading diagram");
        } finally {
            setLoading(false);
        }
    };

    // Register flush callback with store on mount
    useEffect(() => {
        registerHistorySyncCallback(flushPendingHistory);
        return () => {
            registerHistorySyncCallback(null);
        };
    }, [registerHistorySyncCallback, flushPendingHistory]);

    // Fetch data when component mounts or ID changes
    useEffect(() => {
        if (id && id !== "new") {
            console.log('Loading diagram for ID:', id);
            fetchData();
        } else {
            setLoading(false); // If new diagram, no need to load
            hasLoadedRef.current = true; // Allow auto-save for new diagrams too
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Debounced history push - waits 800ms after typing stops
    const scheduleHistoryPush = useCallback((newCode) => {
        // Don't schedule if we're applying history
        if (isApplyingHistory) {
            return;
        }

        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Store pending code
        pendingHistoryRef.current = newCode;

        // Schedule push after 800ms of no typing
        debounceTimerRef.current = setTimeout(() => {
            flushPendingHistory();
        }, 800);
    }, [flushPendingHistory, isApplyingHistory]);

    // Handle editor blur - immediately flush pending changes
    const handleEditorBlur = useCallback(() => {
        // Clear debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
        // Immediately flush
        flushPendingHistory();
    }, [flushPendingHistory]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
            // Flush any pending code changes before unmounting
            if (pendingHistoryRef.current && !isApplyingHistory) {
                setCode(pendingHistoryRef.current, { pushHistoryOnParse: true });
            }
        };
    }, [setCode, isApplyingHistory]);

    // Handles changes in the editor - with debounced history tracking and auto-save
    const onChange = (value) => {
        if (editorMode === "code") {
            setCode(value);
            // Schedule debounced history push for code changes
            scheduleHistoryPush(value);
            // Schedule auto-save
            scheduleAutoSave(value);
        } else {
            setConfig(value);
        }
        setIsModified(true);
    };

    // Function to save to database (silent for auto-save)
    const saveToDatabase = useCallback(async (codeToSave, showToast = true) => {
        if (!id || id === 'new') return;
        try {
            const response = await axiosInstance.put(`/api/flowchart/${id}`, {
                mermaidString: codeToSave
            });

            if (response.status === 200) {
                setIsModified(false);
                if (showToast) {
                    toast.success(response.data.message);
                }
                console.log('Diagram saved successfully');
            } else if (showToast) {
                toast.error("Something went wrong!");
            }
        } catch (error) {
            console.error("Error saving:", error);
            if (showToast) {
                toast.error("Error occurred while saving");
            }
        }
    }, [id]);

    // Manual save handler
    const handleSave = async () => {
        await saveToDatabase(code, true);
    };

    // Auto-save with debounce (2 seconds after user stops typing)
    const scheduleAutoSave = useCallback((newCode) => {
        if (!id || id === 'new' || !hasLoadedRef.current) return;

        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
            saveToDatabase(newCode, false);
        }, 2000);
    }, [id, saveToDatabase]);

    return (
        <Box sx={{ position: "relative", height: "100%" }}>
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {id && id !== "new" && (
                        <Button
                            sx={{
                                zIndex: 999,
                                position: "absolute",
                                top: "80%",
                                right: "10%",
                                backgroundColor: "#FF3480",
                                color: "#fff",
                            }}
                            onClick={handleSave}
                        >
                            {isModified ? "Save Chart" : "Saved"}
                        </Button>
                    )}
                    <MonacoEditor
                        height="calc(100% - 50px)"
                        width="100%"
                        language="mermaid"
                        value={code}
                        onChange={onChange}
                        options={{ minimap: { enabled: false } }}
                        onMount={(editor, monaco) => {
                            try {
                                // Skip mermaid initialization for architecture-beta diagrams
                                // as the monaco-mermaid plugin doesn't support this experimental feature
                                const isArchitectureDiagram = code?.includes('architecture-beta');
                                if (!isArchitectureDiagram) {
                                    initEditor(monaco);
                                }
                                editorRef.current = editor;

                                // Add blur event listener to flush history
                                editor.onDidBlurEditorText(() => {
                                    handleEditorBlur();
                                });
                            } catch (error) {
                                console.error("Error initializing Monaco editor:", error);
                            }
                        }}
                    />
                </>
            )}
        </Box>
    );
};

export default MermaidEditor;