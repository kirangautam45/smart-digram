// store.js

import {create} from "zustand";
import {persist} from "zustand/middleware";
import {formatJSON} from "./utils/utils";

const MAX_HISTORY_SIZE = 50;

export const useStateStore = create(
    persist(
        (set, get) => ({
            code: `flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
  `,
            config: formatJSON({
                theme: "default",
            }),
            autoSync: true,
            editorMode: "code",
            panZoom: true,
            updateDiagram: false,
            svg: "",
            validateCode: "",
            validateConfig: "",

            // History management state
            history: [],
            historyIndex: -1,
            isApplyingHistory: false,
            pendingHistorySyncCallback: null,
            shouldPushHistoryOnParse: false,

            setCode: (code, options = {}) => {
                set(() => ({
                    code,
                    shouldPushHistoryOnParse: options.pushHistoryOnParse || false
                }));
            },
            setConfig: (config) => set(() => ({config})),
            setEditorMode: (mode) => {
                // Trigger history sync when switching modes
                const currentState = get();
                if (currentState.editorMode !== mode && currentState.editorMode === 'code') {
                    // Switching from code to visual - sync pending changes
                    get().syncPendingHistory();
                }
                set(() => ({editorMode: mode}));
            },
            setAutoSync: (autoSync) => set(() => ({autoSync})),
            setPanZoomEnable: (enable) => set(() => ({panZoom: enable})),
            setPanZoom: (panZoom) =>
                set(() => ({
                    pan: panZoom.pan,
                    zoom: panZoom.zoom,
                })),
            setUpdateDiagram: (isUpdate) => set(() => ({updateDiagram: isUpdate})),
            setSvg: (svg) => set(() => ({svg})),
            setValidateCode: (code) => set(() => ({validateCode: code})),
            setValidateConfig: (config) => set(() => ({validateConfig: config})),

            // History management actions
            pushToHistory: (state) => {
                const currentState = get();

                // Don't push to history if we're applying history
                if (currentState.isApplyingHistory) {
                    return;
                }

                // Don't push if state is identical to current history entry
                const currentHistoryEntry = currentState.history[currentState.historyIndex];
                if (currentHistoryEntry &&
                    JSON.stringify(currentHistoryEntry) === JSON.stringify(state)) {
                    return;
                }

                // Slice history up to current index and add new state
                const newHistory = currentState.history.slice(0, currentState.historyIndex + 1);
                newHistory.push(state);

                // Enforce max history size
                if (newHistory.length > MAX_HISTORY_SIZE) {
                    newHistory.shift();
                    set({
                        history: newHistory,
                        historyIndex: newHistory.length - 1,
                    });
                } else {
                    set({
                        history: newHistory,
                        historyIndex: newHistory.length - 1,
                    });
                }
            },

            undo: () => {
                const currentState = get();

                if (currentState.historyIndex > 0) {
                    const previousState = currentState.history[currentState.historyIndex - 1];

                    set({
                        isApplyingHistory: true,
                        historyIndex: currentState.historyIndex - 1,
                    });

                    // Reset flag after a delay to allow state updates to propagate
                    setTimeout(() => {
                        set({ isApplyingHistory: false });
                    }, 100);

                    return previousState;
                }

                return null;
            },

            redo: () => {
                const currentState = get();

                if (currentState.historyIndex < currentState.history.length - 1) {
                    const nextState = currentState.history[currentState.historyIndex + 1];

                    set({
                        isApplyingHistory: true,
                        historyIndex: currentState.historyIndex + 1,
                    });

                    // Reset flag after a delay to allow state updates to propagate
                    setTimeout(() => {
                        set({ isApplyingHistory: false });
                    }, 100);

                    return nextState;
                }

                return null;
            },

            canUndo: () => {
                const currentState = get();
                return currentState.historyIndex > 0;
            },

            canRedo: () => {
                const currentState = get();
                return currentState.historyIndex < currentState.history.length - 1;
            },

            clearHistory: (initialState) => {
                set({
                    history: initialState ? [initialState] : [],
                    historyIndex: initialState ? 0 : -1,
                    isApplyingHistory: false,
                });
            },

            // Register callback for syncing pending history
            registerHistorySyncCallback: (callback) => {
                set({ pendingHistorySyncCallback: callback });
            },

            // Helper to sync pending history (called on mode switch)
            syncPendingHistory: () => {
                const currentState = get();
                if (currentState.pendingHistorySyncCallback) {
                    currentState.pendingHistorySyncCallback();
                }
            },
        }),
        {
            name: "mermaid-storage",
            partialize: (state) => ({
                autoSync: state.autoSync,
                panZoom: state.panZoom,
            }),
        }
    )
);

const createSelectors = (_store) => {
    const store = _store;
    store.use = {};
    for (const k of Object.keys(store.getState())) {
        store.use[k] = () => store((s) => s[k]);
    }

    return store;
};

export const useStore = createSelectors(useStateStore);

export const getJsonData = () => {
    const code = useStore.getState().validateCode;
    const config = useStore.getState().validateConfig;

    let parsedConfig = {};
    if (typeof config === "string" && config.trim() !== "") {
        try {
            parsedConfig = JSON.parse(config);
        } catch (error) {
            console.error("Error parsing config JSON:", error);
        }
    }

    return {
        code: JSON.stringify(code, null, 2),
        config: JSON.stringify(parsedConfig, null, 2),
    };
};
