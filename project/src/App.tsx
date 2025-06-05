import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Layout and Pages
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Officials from './pages/Officials';
import Systems from './pages/Systems';
import Inventory from './pages/Inventory';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}

function App() {
  const { checkSession } = useAuthStore();
  
  useEffect(() => {
    checkSession();
  }, [checkSession]);
  
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#1F2937',
            border: '1px solid #E5E7EB',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            padding: '0.75rem 1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="officials" element={<Officials />} />
            <Route path="systems" element={<Systems />} />
            <Route path="inventory" element={<Inventory />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App