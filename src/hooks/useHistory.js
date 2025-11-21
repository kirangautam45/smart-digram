import { useCallback, useRef, useState } from 'react';

const MAX_HISTORY_SIZE = 50;

export const useHistory = (initialState) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const history = useRef([initialState]);
  const isApplyingHistory = useRef(false);

  const pushToHistory = useCallback((state) => {
    if (isApplyingHistory.current) {
      return;
    }

    const newHistory = history.current.slice(0, currentIndex + 1);
    newHistory.push(state);

    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
      history.current = newHistory;
      setCurrentIndex(newHistory.length - 1);
    } else {
      history.current = newHistory;
      setCurrentIndex(newHistory.length - 1);
    }
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isApplyingHistory.current = true;
      setCurrentIndex(currentIndex - 1);
      const previousState = history.current[currentIndex - 1];

      setTimeout(() => {
        isApplyingHistory.current = false;
      }, 500);

      return previousState;
    }
    return null;
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.current.length - 1) {
      isApplyingHistory.current = true;
      setCurrentIndex(currentIndex + 1);
      const nextState = history.current[currentIndex + 1];

      setTimeout(() => {
        isApplyingHistory.current = false;
      }, 500);

      return nextState;
    }
    return null;
  }, [currentIndex]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.current.length - 1;

  const clearHistory = useCallback((newInitialState) => {
    history.current = [newInitialState];
    setCurrentIndex(0);
    isApplyingHistory.current = false;
  }, []);

  return {
    pushToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    isApplyingHistory: () => isApplyingHistory.current,
  };
};
