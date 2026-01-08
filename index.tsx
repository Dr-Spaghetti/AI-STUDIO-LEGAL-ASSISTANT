import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './src/contexts/ToastContext';
import { ToastContainer } from './src/components/ui';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { useToast } from './src/contexts/ToastContext';

// Toast Container Component
const ToastContainerWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, removeToast } = useToast();
  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <ToastContainerWrapper>
          <App />
        </ToastContainerWrapper>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
