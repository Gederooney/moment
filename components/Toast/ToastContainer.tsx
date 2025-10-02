/**
 * ToastContainer Component
 * Container for rendering multiple toasts
 */

import React from 'react';
import { ToastItem } from './ToastItem';
import { ToastContainerProps } from './types';

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onHideToast,
  isDark = false,
  position = 'top',
}) => {
  return (
    <>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          message={toast.message}
          description={toast.description}
          type={toast.type}
          visible={true}
          onHide={() => onHideToast(toast.id)}
          duration={0} // Managed by useToast hook
          position={position}
          isDark={isDark}
          icon={toast.icon}
          actionText={toast.actionText}
          onActionPress={toast.onActionPress}
        />
      ))}
    </>
  );
};
