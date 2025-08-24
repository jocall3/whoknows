import React, { createContext, useContext, useState, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  addNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
           <div key={notification.id} role="alert" className="animate-pop-in">
             <div className="bg-slate-800 text-white font-bold rounded-t px-4 py-2">
               {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
             </div>
             <div className="border border-t-0 border-slate-700 bg-slate-700/80 rounded-b px-4 py-3 text-slate-200">
               <p>{notification.message}</p>
             </div>
           </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};