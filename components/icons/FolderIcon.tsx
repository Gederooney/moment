import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface FolderIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

export function FolderIcon({ size = 24, color = '#000', focused = false }: FolderIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {focused ? (
        // Filled version for active state
        <Path
          d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"
          fill={color}
        />
      ) : (
        // Outline version for inactive state
        <Path
          d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}
