import { useEffect } from 'react';
import { Notification } from '../types';

interface NotificationToastProps {
  notification: Notification | null;
  onDismiss: () => void;
}

const typeStyles: Record<Notification['type'], string> = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-400 text-gray-900',
};

export default function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed top-4 right-4 z-50 max-w-sm rounded-lg px-4 py-3 shadow-lg transition-all ${typeStyles[notification.type]}`}
    >
      {notification.message}
    </div>
  );
}
