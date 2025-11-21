'use client';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

/**
 * GroupActionToolbar Component
 * Floating toolbar that appears above a selected group
 *
 * @param {Object} props
 * @param {Object} props.position - {x, y} position for the toolbar
 * @param {Function} props.onEdit - Callback when Edit is clicked
 * @param {Function} props.onDelete - Callback when Delete is clicked
 * @param {Function} props.onAdd - Callback when Add is clicked
 */
export default function GroupActionToolbar({ position, onEdit, onDelete, onAdd }) {
  if (!position) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y - 70}px`,
        zIndex: 1000,
        display: 'flex',
        gap: '8px',
        background: '#ffffff',
        padding: '8px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '1px solid #e5e7eb',
      }}
    >
      {/* Edit Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '8px',
          border: 'none',
          background: '#f3f4f6',
          color: '#4b5563',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#667eea';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#f3f4f6';
          e.currentTarget.style.color = '#4b5563';
        }}
        title="Edit Group"
      >
        <EditIcon style={{ fontSize: '20px' }} />
      </button>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '8px',
          border: 'none',
          background: '#f3f4f6',
          color: '#4b5563',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#ef4444';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#f3f4f6';
          e.currentTarget.style.color = '#4b5563';
        }}
        title="Delete Group"
      >
        <DeleteIcon style={{ fontSize: '20px' }} />
      </button>

      {/* Add Service Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '8px',
          border: 'none',
          background: '#f3f4f6',
          color: '#4b5563',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#10b981';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#f3f4f6';
          e.currentTarget.style.color = '#4b5563';
        }}
        title="Add Service to Group"
      >
        <AddIcon style={{ fontSize: '20px' }} />
      </button>
    </div>
  );
}
