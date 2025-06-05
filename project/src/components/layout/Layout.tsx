import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // If user is not authenticated, don't render the layout
  if (!user) {
    return <Outlet />;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} />
      
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          "md:ml-64"
        )}
      >
        <Navbar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}