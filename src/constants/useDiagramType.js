import { useStore } from "@/store";

export const useDiagramType = () => {
  const code = useStore.use.code();
  
  const detectDiagramType = (codeText) => {
    if (!codeText) return 'flowchart';
    
    const trimmed = codeText.trim();
    if (trimmed.startsWith('erDiagram')) return 'erDiagram';
    if (trimmed.startsWith('architecture-beta')) return 'architecture';
    if (trimmed.startsWith('sequenceDiagram')) return 'sequenceDiagram';
    if (trimmed.startsWith('block-beta')) return 'blockDiagram';
    if (trimmed.startsWith('requirementDiagram')) return 'requirement';
    if (trimmed.startsWith('journey')) return 'journey';
    if (trimmed.startsWith('graph') || trimmed.startsWith('flowchart')) return 'flowchart';
    return 'flowchart';
    
  };

  return detectDiagramType(code);
};