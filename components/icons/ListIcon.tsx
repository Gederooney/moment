import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface ListIconProps {
  size?: number;
  color?: string;
}

export function ListIcon({ size = 24, color = '#000' }: ListIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="3" cy="5" r="2" fill={color} />
      <Path
        d="M21,3H9A2,2,0,0,0,9,7H21a2,2,0,0,0,0-4Z"
        fill={color}
      />
      <Circle cx="3" cy="12" r="2" fill={color} />
      <Path
        d="M21,10H9a2,2,0,0,0,0,4H21a2,2,0,0,0,0-4Z"
        fill={color}
      />
      <Circle cx="3" cy="19" r="2" fill={color} />
      <Path
        d="M21,17H9a2,2,0,0,0,0,4H21a2,2,0,0,0,0-4Z"
        fill={color}
      />
    </Svg>
  );
}
