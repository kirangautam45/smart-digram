"use client";

import React from "react";
import { useDiagramType } from "@/constants/useDiagramType";
import View from "./View";
import SequenceDiagramView from "./SequenceDiagramView";
import ERDiagramView from "./ERDiagramView";
import UserJourneyChartView from "./UserJourneyChartView";
import RequirementDiagramView from "./RequirementDiagramView";
import BlockDiagramView from "./BlockDiagramView";
import ArchitectureView from "./ArchitectureView";

const DiagramView = ({ fontSizes, color }) => {
  const diagramType = useDiagramType();

  // Route to the appropriate view based on diagram type
  switch (diagramType) {
    case "flowchart":
    case "graph":
      return <View fontSizes={fontSizes} color={color} />;
    case "sequenceDiagram":
      return <SequenceDiagramView fontSizes={fontSizes} color={color} />;
    case "erDiagram":
      return <ERDiagramView fontSizes={fontSizes} color={color} />;
    case "journey":
      return <UserJourneyChartView fontSizes={fontSizes} color={color} />;
    case "requirementDiagram":
      return <RequirementDiagramView fontSizes={fontSizes} color={color} />;
    case "block":
      return <BlockDiagramView fontSizes={fontSizes} color={color} />;
    case "architecture":
      return <ArchitectureView fontSizes={fontSizes} color={color} />;
    default:
      // Default to the main View component for unrecognized diagram types
      return <View fontSizes={fontSizes} color={color} />;
  }
};

export default DiagramView;
