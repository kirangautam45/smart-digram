'use client';

import { Fab, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';

/**
 * FloatingActionButton Component
 * Floating buttons for quick actions on the diagram canvas
 *
 * @param {Object} props
 * @param {Function} props.onAddService - Callback when Add Service is clicked
 * @param {Function} props.onToggleConnectionMode - Callback when Connection Mode is toggled
 * @param {boolean} props.connectionMode - Whether connection mode is active
 */
export default function FloatingActionButton({
  onAddService,
  onToggleConnectionMode,
  connectionMode = false
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        zIndex: 1000,
      }}
    >
      {/* Connection Mode Toggle */}
      <Tooltip title={connectionMode ? "Exit Connection Mode" : "Connect Nodes"} placement="left">
        <Fab
          color={connectionMode ? "secondary" : "default"}
          aria-label="connection mode"
          onClick={onToggleConnectionMode}
          style={{
            background: connectionMode
              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              : '#ffffff',
            color: connectionMode ? '#ffffff' : '#667eea',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (!connectionMode) {
              e.currentTarget.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <LinkIcon />
        </Fab>
      </Tooltip>

      {/* Add Service Button */}
      <Tooltip title="Add Service" placement="left">
        <Fab
          color="primary"
          aria-label="add service"
          onClick={onAddService}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </div>
  );
}
