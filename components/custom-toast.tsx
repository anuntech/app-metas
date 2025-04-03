"use client"

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export type ToastProps = {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
};

type ToastContextType = {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
  removeToast: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast: React.FC<{ toast: ToastProps; onClose: () => void }> = ({ toast, onClose }) => {
  const { title, message, type, duration = 5000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`${getBackgroundColor()} text-white p-4 rounded-lg shadow-lg flex items-start max-w-md transition-all duration-300 ease-in-out transform translate-y-0 opacity-100`}
      role="alert"
    >
      <div className="flex-1">
        {title && <h4 className="font-bold">{title}</h4>}
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) return null;

  return isMounted
    ? createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <div 
              key={toast.id} 
              className="animate-enter"
            >
              <Toast toast={toast} onClose={() => removeToast(toast.id)} />
            </div>
          ))}
        </div>,
        document.body
      )
    : null;
}; 