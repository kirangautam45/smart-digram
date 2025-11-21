'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { serviceMappings } from '@/constants/cloudIconMapper';
import { useMemo } from 'react';

/**
 * IconPickerGrid Component
 * Reusable grid icon picker displaying all available Azure service icons
 *
 * @param {string} selectedIconType - Currently selected icon type/key
 * @param {function} onIconSelect - Callback when an icon is selected (receives icon key)
 * @param {number} iconSize - Size of each icon in pixels (default: 48)
 */
export default function IconPickerGrid({
  selectedIconType,
  onIconSelect,
  iconSize = 48
}) {
  // Extract unique icons from serviceMappings (many mappings share same icon)
  const uniqueIcons = useMemo(() => {
    const iconMap = new Map();

    Object.entries(serviceMappings).forEach(([key, { icon }]) => {
      const iconSrc = typeof icon === 'object' && icon.src ? icon.src : null;

      // Only add if we have a valid icon and haven't seen this icon yet
      if (iconSrc && !iconMap.has(iconSrc)) {
        iconMap.set(iconSrc, {
          key,
          icon,
          src: iconSrc,
          label: key.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        });
      }
    });

    return Array.from(iconMap.values());
  }, []);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        maxHeight: '400px',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '4px',
        // Custom scrollbar styling
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '10px',
          '&:hover': {
            background: '#555',
          },
        },
      }}
    >
      {uniqueIcons.map(({ key, icon, src, label }) => {
        const isSelected = selectedIconType === key;

        return (
          <Box
            key={key}
            onClick={() => onIconSelect(key)}
            title={label}
            sx={{
              width: '100%',
              height: '70px',
              borderRadius: '10px',
              background: '#FFFFFF',
              border: isSelected
                ? '4px solid #3B82F6'
                : '2px solid #D1D5DB',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: !isSelected ? 'scale(1.05)' : 'scale(1)',
                boxShadow: !isSelected
                  ? '0 4px 8px rgba(0,0,0,0.2)'
                  : '0 2px 6px rgba(0,0,0,0.15)',
              },
            }}
          >
            <Image
              src={icon}
              alt={label}
              width={iconSize}
              height={iconSize}
              style={{
                objectFit: 'contain',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
}
