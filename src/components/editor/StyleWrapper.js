"use client";

import React, { useEffect } from "react";
import { useStyleStore } from "@/store/diagramStyleStore";
import { animations } from "@/config/diagramStyles";

/**
 * StyleWrapper - Injects dynamic styles for diagram animations and themes
 * This component wraps diagram views and applies customizable styles
 */
const StyleWrapper = ({ children, diagramType }) => {
  const { setActiveDiagramType, getMergedStyles } = useStyleStore();
  const styles = getMergedStyles(diagramType);

  useEffect(() => {
    setActiveDiagramType(diagramType);
  }, [diagramType, setActiveDiagramType]);

  // Generate animation keyframes
  const generateKeyframes = () => {
    return Object.values(animations)
      .map(anim => anim.keyframes)
      .join('\n');
  };

  // Generate dynamic CSS based on current styles
  const generateDynamicCSS = () => {
    const {
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      borderColor,
      nodeAnimation,
      edgeAnimation,
      textAnimation,
    } = styles;

    return `
      /* Animation Keyframes */
      ${generateKeyframes()}

      /* Global Diagram Styles */
      .diagram-container {
        background-color: ${backgroundColor || '#FFFFFF'};
        color: ${textColor || '#171717'};
      }

      /* Node Styles */
      .react-flow__node {
        ${nodeAnimation && nodeAnimation !== 'none' && animations[nodeAnimation]
          ? `animation: ${animations[nodeAnimation].name} ${animations[nodeAnimation].duration} ${animations[nodeAnimation].timing}${animations[nodeAnimation].infinite ? ' infinite' : ''};`
          : ''}
      }

      .react-flow__node-customShape {
        border-color: ${borderColor || primaryColor || '#3B82F6'} !important;
      }

      /* Selected node */
      .react-flow__node.selected,
      .react-flow__node:focus {
        border-color: ${primaryColor || '#3B82F6'} !important;
        box-shadow: 0 0 0 2px ${primaryColor || '#3B82F6'};
      }

      /* Edge Styles */
      .react-flow__edge-path {
        stroke: ${primaryColor || '#3B82F6'};
        stroke-width: 2;
        ${edgeAnimation && edgeAnimation !== 'none' && animations[edgeAnimation]
          ? `animation: ${animations[edgeAnimation].name} ${animations[edgeAnimation].duration} ${animations[edgeAnimation].timing}${animations[edgeAnimation].infinite ? ' infinite' : ''};`
          : ''}
      }

      .react-flow__edge.selected .react-flow__edge-path,
      .react-flow__edge:focus .react-flow__edge-path {
        stroke: ${secondaryColor || '#8B5CF6'};
        stroke-width: 3;
      }

      /* Edge labels */
      .react-flow__edge-text {
        fill: ${textColor || '#171717'};
        ${textAnimation && textAnimation !== 'none' && animations[textAnimation]
          ? `animation: ${animations[textAnimation].name} ${animations[textAnimation].duration} ${animations[textAnimation].timing}${animations[textAnimation].infinite ? ' infinite' : ''};`
          : ''}
      }

      /* Markers (arrow heads) */
      .react-flow__arrowhead {
        fill: ${primaryColor || '#3B82F6'};
      }

      /* Controls */
      .react-flow__controls-button {
        background-color: ${backgroundColor || '#FFFFFF'};
        border-color: ${borderColor || '#CBD5E1'};
        color: ${textColor || '#171717'};
      }

      .react-flow__controls-button:hover {
        background-color: ${primaryColor || '#3B82F6'};
        color: white;
      }

      /* Mermaid SVG Styles (for non-ReactFlow diagrams) */
      .mermaid .node rect,
      .mermaid .node circle,
      .mermaid .node ellipse,
      .mermaid .node polygon {
        fill: ${backgroundColor || '#FFFFFF'} !important;
        stroke: ${primaryColor || '#3B82F6'} !important;
        stroke-width: 2px !important;
      }

      .mermaid .node text {
        fill: ${textColor || '#171717'} !important;
      }

      .mermaid .edgePath .path {
        stroke: ${primaryColor || '#3B82F6'} !important;
        stroke-width: 2px !important;
      }

      .mermaid .edgeLabel {
        background-color: ${backgroundColor || '#FFFFFF'} !important;
        color: ${textColor || '#171717'} !important;
      }

      /* Sequence Diagram Styles */
      .mermaid .actor {
        fill: ${backgroundColor || '#FFFFFF'} !important;
        stroke: ${primaryColor || '#3B82F6'} !important;
      }

      .mermaid .messageLine0,
      .mermaid .messageLine1 {
        stroke: ${primaryColor || '#3B82F6'} !important;
      }

      .mermaid .activation0,
      .mermaid .activation1 {
        fill: ${secondaryColor || '#8B5CF6'} !important;
        stroke: ${primaryColor || '#3B82F6'} !important;
      }

      /* ER Diagram Styles */
      .mermaid .er.entityBox {
        fill: ${backgroundColor || '#FFFFFF'} !important;
        stroke: ${primaryColor || '#3B82F6'} !important;
      }

      .mermaid .er.relationshipLine {
        stroke: ${primaryColor || '#3B82F6'} !important;
      }

      /* User Journey Styles */
      .mermaid .section {
        fill: ${backgroundColor || '#FFFFFF'} !important;
      }

      .mermaid .task {
        fill: ${primaryColor || '#3B82F6'} !important;
        stroke: ${primaryColor || '#3B82F6'} !important;
      }

      /* Requirement Diagram Styles */
      .mermaid .requirement {
        fill: ${backgroundColor || '#FFFFFF'} !important;
        stroke: ${primaryColor || '#3B82F6'} !important;
      }

      /* Block Diagram Styles */
      .mermaid .block {
        fill: ${backgroundColor || '#FFFFFF'} !important;
        stroke: ${primaryColor || '#3B82F6'} !important;
      }

      /* Architecture Diagram Styles */
      .mermaid .architecture-node {
        fill: ${backgroundColor || '#FFFFFF'} !important;
        stroke: ${primaryColor || '#3B82F6'} !important;
      }

      /* Animations for nodes */
      .animated-node {
        animation: fadeIn 0.5s ease-in;
      }

      .pulse-node {
        animation: pulse 2s ease-in-out infinite;
      }

      .bounce-node {
        animation: bounce 1s ease-in-out infinite;
      }

      /* Animated edges */
      .animated-edge {
        stroke-dasharray: 5;
        animation: dashdraw 0.5s linear infinite;
      }

      .flow-edge {
        animation: flow 1s ease-in-out infinite;
      }
    `;
  };

  return (
    <>
      <style>{generateDynamicCSS()}</style>
      <div className="diagram-container" style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
    </>
  );
};

export default StyleWrapper;
