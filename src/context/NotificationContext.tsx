'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface NotifContextType {
  notifications: Notification[];
  notify: (type: Notification['type'], message: string) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
  warning: (msg: string) => void;
  dismiss: (id: string) => void;
}

const NotifContext = createContext<NotifContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((type: Notification['type'], message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const success = useCallback((msg: string) => notify('success', msg), [notify]);
  const error = useCallback((msg: string) => notify('error', msg), [notify]);
  const warning = useCallback((msg: string) => notify('warning', msg), [notify]);
  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotifContext.Provider value={{ notifications, notify, success, error, warning, dismiss }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm" role="alert" aria-live="polite">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-slide-in cursor-pointer transition-all hover:scale-105 ${
              n.type === 'success' ? 'bg-green-500 text-white' :
              n.type === 'error' ? 'bg-red-500 text-white' :
              n.type === 'warning' ? 'bg-amber-500 text-white' :
              'bg-blue-500 text-white'
            }`}
            onClick={() => dismiss(n.id)}
          >
            <span>{n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : n.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <span>{n.message}</span>
          </div>
        ))}
      </div>
    </NotifContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}
