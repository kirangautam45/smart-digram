import { Handle, Position } from "reactflow";
import { Box } from "@mui/material";

// const shapeComponents = {
//   rounded: ({ width, height, color }) => (
//     <rect
//       x={10}
//       y={10}
//       width={width - 20}
//       height={height - 20}
//       rx={15}
//       ry={15}
//       fill={color}
//       stroke="#333"
//       strokeWidth={2}
//     />
//   ),
//   diam: ({ width, height, color }) => {
//     const points = [
//       [width / 2, 10],
//       [width - 10, height / 2],
//       [width / 2, height - 10],
//       [10, height / 2],
//     ];
//     return (
//       <polygon
//         points={points.map(p => p.join(",")).join(" ")}
//         fill={color}
//         stroke="#333"
//         strokeWidth={2}
//       />
//     );
//   },
//   tri: ({ width, height, color }) => {
//     const points = [
//       [width / 2, 10],
//       [width - 10, height - 10],
//       [10, height - 10],
//     ];
//     return (
//       <polygon
//         points={points.map(p => p.join(",")).join(" ")}
//         fill={color}
//         stroke="#333"
//         strokeWidth={2}
//       />
//     );
//   },
//   hex: ({ width, height, color }) => {
//     const points = [
//       [width / 4, 10],
//       [(width * 3) / 4, 10],
//       [width - 10, height / 2],
//       [(width * 3) / 4, height - 10],
//       [width / 4, height - 10],
//       [10, height / 2],
//     ];
//     return (
//       <polygon
//         points={points.map(p => p.join(",")).join(" ")}
//         fill={color}
//         stroke="#333"
//         strokeWidth={2}
//       />
//     );
//   },
//   cyl: ({ width, height, color }) => (
//     <>
//       <ellipse
//         cx={width / 2}
//         cy={15}
//         rx={width / 2 - 10}
//         ry={10}
//         fill={color}
//         stroke="#333"
//         strokeWidth={2}
//       />
//       <rect
//         x={10}
//         y={15}
//         width={width - 20}
//         height={height - 30}
//         fill={color}
//         stroke="#333"
//         strokeWidth={2}
//       />
//       <ellipse
//         cx={width / 2}
//         cy={height - 15}
//         rx={width / 2 - 10}
//         ry={10}
//         fill={color}
//         stroke="#333"
//         strokeWidth={2}
//       />
//     </>
//   ),
//   // Add more shape definitions as needed
// };
const shapeComponents = {
  rounded: ({ width, height, color }) => (
    <rect
      x={10}
      y={10}
      width={width - 20}
      height={height - 20}
      rx={15}
      ry={15}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  diam: ({ width, height, color }) => {
    const points = [
      [width / 2, 10],
      [width - 10, height / 2],
      [width / 2, height - 10],
      [10, height / 2],
    ];
    return (
      <polygon
        points={points.map(p => p.join(",")).join(" ")}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
    );
  },
  tri: ({ width, height, color }) => {
    const points = [
      [width / 2, 10],
      [width - 10, height - 10],
      [10, height - 10],
    ];
    return (
      <polygon
        points={points.map(p => p.join(",")).join(" ")}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
    );
  },
  hex: ({ width, height, color }) => {
    const points = [
      [width / 4, 10],
      [(width * 3) / 4, 10],
      [width - 10, height / 2],
      [(width * 3) / 4, height - 10],
      [width / 4, height - 10],
      [10, height / 2],
    ];
    return (
      <polygon
        points={points.map(p => p.join(",")).join(" ")}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
    );
  },
  cyl: ({ width, height, color }) => (
    <>
      <ellipse
        cx={width / 2}
        cy={15}
        rx={width / 2 - 10}
        ry={10}
        fill={color}
        stroke="#000" 
        strokeWidth={2}
      />
      <rect
        x={10}
        y={15}
        width={width - 20}
        height={height - 30}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
      <ellipse
        cx={width / 2}
        cy={height - 15}
        rx={width / 2 - 10}
        ry={10}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
    </>
  ),
  rectangle: ({ width, height, color }) => (
    <rect
      x={10}
      y={10}
      width={width - 20}
      height={height - 20}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  braces: ({ width, height, color }) => (
    <path
      d={`M ${width / 2} 10 Q ${width - 10} 10, ${width - 10} ${height / 2} Q ${width - 10} ${height - 10}, ${width / 2} ${height - 10} M ${width / 2} 10 Q 10 10, 10 ${height / 2} Q 10 ${height - 10}, ${width / 2} ${height - 10}`}
      fill="none"
      stroke="#333"
      strokeWidth={2}
    />
  ),
  card: ({ width, height, color }) => (
    <rect
      x={10}
      y={10}
      width={width - 20}
      height={height - 20}
      rx={5}
      ry={5}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  circle: ({ width, height, color }) => (
    <ellipse
      cx={width / 2}
      cy={height / 2}
      rx={width / 2 - 10}
      ry={height / 2 - 10}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  collate_action: ({ width, height, color }) => (
    <polygon
      points={`10,10 ${width - 10},10 ${width - 10},${height - 10} 10,${height - 10}`}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  comment_right: ({ width, height, color }) => {
    const pointerSize = 15;
    return (
      <path
        d={`M 10,10 L ${width - 10},10 L ${width - 10},${height - pointerSize - 10} L ${width - pointerSize - 10},${height - pointerSize - 10} L ${width - pointerSize - 10},${height - 10} L 10,${height - 10} Z`}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
    );
  },
  comment: ({ width, height, color }) => {
    const pointerSize = 15;
    return (
      <path
        d={`M 10,10 L ${width - 10},10 L ${width - 10},${height - 10} L ${pointerSize + 10},${height - 10} L 10,${height - pointerSize - 10} Z`}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
    );
  },
  database: ({ width, height, color }) => (
    <>
      <ellipse
        cx={width / 2}
        cy={15}
        rx={width / 2 - 10}
        ry={10}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
      <rect
        x={10}
        y={15}
        width={width - 20}
        height={height - 30}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
      <ellipse
        cx={width / 2}
        cy={height - 15}
        rx={width / 2 - 10}
        ry={10}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
    </>
  ),
  decision: ({ width, height, color }) => {
    const points = [
      [width / 2, 10],
      [width - 10, height / 2],
      [width / 2, height - 10],
      [10, height / 2],
    ];
    return (
      <polygon
        points={points.map(p => p.join(",")).join(" ")}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
    );
  },
  delay: ({ width, height, color }) => (
    <path
      d={`M 10,${height / 2} L ${width / 4},10 L ${width * 3 / 4},10 L ${width - 10},${height / 2} L ${width * 3 / 4},${height - 10} L ${width / 4},${height - 10} Z`}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  direct_access_storage: ({ width, height, color }) => (
    <ellipse
      cx={width / 2}
      cy={height / 2}
      rx={width / 2 - 10}
      ry={height / 4}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  disk_storage: ({ width, height, color }) => (
    <>
      <ellipse
        cx={width / 2}
        cy={height / 2}
        rx={width / 2 - 10}
        ry={height / 4}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
      <line
        x1={width / 2}
        y1={height / 2 - height / 4}
        x2={width / 2}
        y2={height / 2 + height / 4}
        stroke="#333"
        strokeWidth={2}
      />
    </>
  ),
  display: ({ width, height, color }) => (
    <rect
      x={10}
      y={10}
      width={width - 20}
      height={height - 30}
      rx={5}
      ry={5}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  divied_process: ({ width, height, color }) => (
    <>
      <rect
        x={10}
        y={10}
        width={width - 20}
        height={height - 20}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
      <line
        x1={10}
        y1={height / 2}
        x2={width - 10}
        y2={height / 2}
        stroke="#333"
        strokeWidth={1}
      />
    </>
  ),
  document: ({ width, height, color }) => (
    <path
      d={`M 10,10 L ${width - 10},10 L ${width - 10},${height - 10} L 10,${height - 10} Z`}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  dubble_circle: ({ width, height, color }) => (
    <>
      <ellipse
        cx={width / 2}
        cy={height / 2}
        rx={width / 2 - 10}
        ry={height / 2 - 10}
        fill="none"
        stroke="#333"
        strokeWidth={2}
      />
      <ellipse
        cx={width / 2}
        cy={height / 2}
        rx={width / 2 - 20}
        ry={height / 2 - 20}
        fill="none"
        stroke="#333"
        strokeWidth={2}
      />
    </>
  ),
  event: ({ width, height, color }) => (
    <ellipse
      cx={width / 2}
      cy={height / 2}
      rx={width / 2 - 10}
      ry={height / 2 - 10}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  extractions_process: ({ width, height, color }) => (
    <rect
      x={10}
      y={10}
      width={width - 20}
      height={height - 20}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  filled_circles: ({ width, height, color }) => (
    <>
      <circle cx={width / 3} cy={height / 2} r={8} fill={color} />
      <circle cx={width / 2} cy={height / 2} r={8} fill={color} />
      <circle cx={width * 2 / 3} cy={height / 2} r={8} fill={color} />
    </>
  ),
  fork_join: ({ width, height, color }) => (
    <>
      <rect
        x={10}
        y={10}
        width={width - 20}
        height={height - 20}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
      <line
        x1={10}
        y1={height / 2}
        x2={width - 10}
        y2={height / 2}
        stroke="#333"
        strokeWidth={1}
      />
      <line
        x1={width / 2}
        y1={10}
        x2={width / 2}
        y2={height - 10}
        stroke="#333"
        strokeWidth={1}
      />
    </>
  ),
  framed_circle: ({ width, height, color }) => (
    <>
      <ellipse
        cx={width / 2}
        cy={height / 2}
        rx={width / 2 - 10}
        ry={height / 2 - 10}
        fill="none"
        stroke="#333"
        strokeWidth={2}
      />
      <rect
        x={15}
        y={15}
        width={width - 30}
        height={height - 30}
        fill="none"
        stroke="#333"
        strokeWidth={1}
      />
    </>
  ),
  hexazone: ({ width, height, color }) => {
    const points = [
      [width / 4, 10],
      [(width * 3) / 4, 10],
      [width - 10, height / 2],
      [(width * 3) / 4, height - 10],
      [width / 4, height - 10],
      [10, height / 2],
    ];
    return (
      <polygon
        points={points.map(p => p.join(",")).join(" ")}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
    );
  },
  horizontal_cylinder: ({ width, height, color }) => (
    <>
      <ellipse
        cx={15}
        cy={height / 2}
        rx={10}
        ry={height / 2 - 10}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
      <rect
        x={15}
        y={10}
        width={width - 30}
        height={height - 20}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
      <ellipse
        cx={width - 15}
        cy={height / 2}
        rx={10}
        ry={height / 2 - 10}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
    </>
  ),
  in_out: ({ width, height, color }) => (
    <polygon
      points={`10,10 ${width - 10},${height / 2} 10,${height - 10}`}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  internal_storage: ({ width, height, color }) => (
    <rect
      x={10}
      y={10}
      width={width - 20}
      height={height - 20}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  junction: ({ width, height, color }) => (
    <circle
      cx={width / 2}
      cy={height / 2}
      r={8}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  lined_document: ({ width, height, color }) => (
    <>
      <rect
        x={10}
        y={10}
        width={width - 20}
        height={height - 20}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
      {[3, 4, 5].map(i => (
        <line
          key={i}
          x1={15}
          y1={height / 5 * i}
          x2={width - 15}
          y2={height / 5 * i}
          stroke="#333"
          strokeWidth={1}
        />
      ))}
    </>
  ),
  lined_process: ({ width, height, color }) => (
    <>
      <rect
        x={10}
        y={10}
        width={width - 20}
        height={height - 20}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
      <line
        x1={10}
        y1={height / 2}
        x2={width - 10}
        y2={height / 2}
        stroke="#333"
        strokeWidth={1}
      />
    </>
  ),
  loop_limit: ({ width, height, color }) => (
    <ellipse
      cx={width / 2}
      cy={height / 2}
      rx={width / 2 - 10}
      ry={height / 2 - 10}
      fill="none"
      stroke="#333"
      strokeWidth={2}
    />
  ),
  manual_file_action: ({ width, height, color }) => (
    <path
      d={`M 10,${height / 2} L ${width / 2},10 L ${width - 10},${height / 2} L ${width / 2},${height - 10} Z`}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  manual_input: ({ width, height, color }) => (
    <polygon
      points={`10,${height - 10} ${width / 2},10 ${width - 10},${height - 10}`}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  multi_process: ({ width, height, color }) => (
    <>
      <rect
        x={10}
        y={10}
        width={width - 20}
        height={height - 20}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
      <rect
        x={15}
        y={15}
        width={width - 30}
        height={height - 30}
        fill="none"
        stroke="#333"
        strokeWidth={1}
      />
    </>
  ),
  multiple_document: ({ width, height, color }) => (
    <>
      <rect
        x={10}
        y={10}
        width={width - 20}
        height={height - 20}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
      <rect
        x={15}
        y={15}
        width={width - 25}
        height={height - 25}
        fill={color}
        stroke="#333"
        strokeWidth={1}
      />
    </>
  ),
  odd: ({ width, height, color }) => (
    <ellipse
      cx={width / 2}
      cy={height / 2}
      rx={width / 2 - 10}
      ry={height / 4}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  out_in: ({ width, height, color }) => (
    <polygon
      points={`${width - 10},10 ${width - 10},${height - 10} 10,${height / 2}`}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  parallelogram_reversed: ({ width, height, color }) => (
    <polygon
      points={`${width * 0.2},10 ${width - 10},10 ${width * 0.8},${height - 10} 10,${height - 10}`}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  parallelogram: ({ width, height, color }) => (
    <polygon
      points={`${width * 0.2},10 ${width - 10},10 ${width * 0.8},${height - 10} 10,${height - 10}`}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  priority_action: ({ width, height, color }) => (
    <polygon
      points={`10,${height / 2} ${width / 2},10 ${width - 10},${height / 2} ${width / 2},${height - 10}`}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  stadium: ({ width, height, color }) => (
    <rect
      x={10}
      y={10}
      width={width - 20}
      height={height - 20}
      rx={height / 2}
      ry={height / 2}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  standard_process: ({ width, height, color }) => (
    <rect
      x={10}
      y={10}
      width={width - 20}
      height={height - 20}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  start: ({ width, height, color }) => (
    <ellipse
      cx={width / 2}
      cy={height / 2}
      rx={width / 2 - 10}
      ry={height / 2 - 10}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  stop: ({ width, height, color }) => (
    <rect
      x={10}
      y={10}
      width={width - 20}
      height={height - 20}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  stored_data: ({ width, height, color }) => (
    <ellipse
      cx={width / 2}
      cy={height / 2}
      rx={width / 2 - 10}
      ry={height / 4}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  sub_process: ({ width, height, color }) => (
    <>
      <rect
        x={10}
        y={10}
        width={width - 20}
        height={height - 20}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
      <rect
        x={15}
        y={15}
        width={width - 30}
        height={height - 30}
        fill="none"
        stroke="#333"
        strokeWidth={1}
      />
    </>
  ),
  summary: ({ width, height, color }) => (
    <>
      <rect
        x={10}
        y={10}
        width={width - 20}
        height={height - 20}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
      <line
        x1={10}
        y1={height - 15}
        x2={width - 10}
        y2={15}
        stroke="#333"
        strokeWidth={1}
      />
    </>
  ),
  tagged_document: ({ width, height, color }) => (
    <path
      d={`M 10,10 L ${width - 10},10 L ${width - 10},${height - 10} L 10,${height - 10} Z`}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  tagged_process: ({ width, height, color }) => (
    <rect
      x={10}
      y={10}
      width={width - 20}
      height={height - 20}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  terminal: ({ width, height, color }) => (
    <rect
      x={10}
      y={10}
      width={width - 20}
      height={height - 20}
      rx={10}
      ry={10}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  text_block: ({ width, height, color }) => (
    <rect
      x={10}
      y={10}
      width={width - 20}
      height={height - 20}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  trapezoid_reversed: ({ width, height, color }) => (
    <polygon
      points={`${width * 0.2},10 ${width * 0.8},10 ${width - 10},${height - 10} 10,${height - 10}`}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  trapezoid: ({ width, height, color }) => (
    <polygon
      points={`10,10 ${width - 10},10 ${width * 0.8},${height - 10} ${width * 0.2},${height - 10}`}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  triangle: ({ width, height, color }) => {
    const points = [
      [width / 2, 10],
      [width - 10, height - 10],
      [10, height - 10],
    ];
    return (
      <polygon
        points={points.map(p => p.join(",")).join(" ")}
        fill={color}
        stroke="#333"
        strokeWidth={2}
      />
    );
  },
  anchor: ({ width, height, color }) => (
    <path
      d={`M ${width / 2},10 L ${width / 2},${height - 10} M ${width / 2},${height / 2} L 10,${height / 2} L ${width / 2},${height / 2} L ${width - 10},${height / 2}`}
      fill="none"
      stroke="#333"
      strokeWidth={2}
    />
  ),
  paper_tape: ({ width, height, color }) => (
    <rect
      x={10}
      y={10}
      width={width - 20}
      height={height - 20}
      fill={color}
      stroke="#333"
      strokeWidth={2}
    />
  ),
  communication_link: ({ width, height, color }) => (
    <path
      d={`M 10,${height / 2} Q ${width / 2},10 ${width - 10},${height / 2} Q ${width / 2},${height - 10} 10,${height / 2}`}
      fill="none"
      stroke="#333"
      strokeWidth={2}
    />
  ),
};
// const CustomShapeNode = ({ data, selected }) => {
//   const { label, shape, color } = data;
//   const ShapeComponent = shapeComponents[shape] || shapeComponents.rounded;
//   const theme = {
//     primaryColor: "#fff",
//     primaryBorderColor: "#000",
//   };

//   return (
//     <Box
//       sx={{
//         position: "relative",
//         width: 180,
//         height: 80,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//       }}
//     >
//       <Handle type="target" position={Position.Top} />
      
//       <svg width={180} height={80}>
//         <ShapeComponent 
//           width={180} 
//           height={80} 
//           color={theme.primaryColor} 
//         />
//         <text
//           x="50%"
//           y="50%"
//           dominantBaseline="middle"
//           textAnchor="middle"
//           fill="#000"
//           fontSize="14px"
//           fontWeight="500"
//         >
//           {label}
//         </text>
//       </svg>

//       <Handle type="source" position={Position.Bottom} />
      
//       {selected && (
//         <Box
//           sx={{
//             position: "absolute",
//             top: -5,
//             left: -5,
//             right: -5,
//             bottom: -5,
//             border: `2px dashed ${theme.primaryBorderColor}`,
//             borderRadius: "8px",
//             pointerEvents: "none",
//           }}
//         />
//       )}
//     </Box>
//   );
// };
const CustomShapeNode = ({ data, selected }) => {
  const { label, shape, color } = data; // color prop from parent
  const ShapeComponent = shapeComponents[shape] || shapeComponents.rounded;

  return (
    <Box
      sx={{
        position: "relative",
        width: 180,
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      <svg width={180} height={80}>
        <ShapeComponent 
          width={180} 
          height={80} 
          color={color?.primaryColor || "#fff"}  // Use theme color or fallback
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="#000"
          fontSize="14px"
          fontWeight="500"
        >
          {label}
        </text>
      </svg>

      <Handle type="source" position={Position.Bottom} />
      
      {selected && (
        <Box
          sx={{
            position: "absolute",
            top: -5,
            left: -5,
            right: -5,
            bottom: -5,
            border: `2px dashed ${color?.primaryBorderColor || "#000"}`, // Use theme border color
            borderRadius: "8px",
            pointerEvents: "none",
          }}
        />
      )}
    </Box>
  );
};

export default CustomShapeNode;