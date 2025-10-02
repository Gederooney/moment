import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ListIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

export const ListIcon: React.FC<ListIconProps> = ({ size = 24, color = '#000', focused = false }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Path d="m38 67.98h36v6h-36z" fill={color} />
      <Path d="m25 20.004h-10c-3.8594 0-7 3.1406-7 7v9.9961c0 3.8594 3.1406 7 7 7h10c3.8594 0 7-3.1406 7-7v-9.9961c0-3.8594-3.1406-7-7-7zm1 16.992c0 0.55078-0.44922 1-1 1h-10c-0.55078 0-1-0.44922-1-1v-9.9961c0-0.55078 0.44922-1 1-1h10c0.55078 0 1 0.44922 1 1z" fill={color} />
      <Path d="m25 56.004h-10c-3.8594 0-7 3.1406-7 7v9.9961c0 3.8594 3.1406 7 7 7h10c3.8594 0 7-3.1406 7-7v-9.9961c0-3.8594-3.1406-7-7-7zm1 16.992c0 0.55078-0.44922 1-1 1h-10c-0.55078 0-1-0.44922-1-1v-9.9961c0-0.55078 0.44922-1 1-1h10c0.55078 0 1 0.44922 1 1z" fill={color} />
      <Path d="m38 31.98h36v6h-36z" fill={color} />
      <Path d="m38 56.004h54v6h-54z" fill={color} />
      <Path d="m38 20.004h54v6h-54z" fill={color} />
    </Svg>
  );
};
