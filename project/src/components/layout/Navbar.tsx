import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Users, Database, Package, BarChart2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Navbar({ onToggleSidebar, isSidebarOpen }: NavbarProps) {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  
  // Determine current page for title
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path === '/officials') return 'Funcionarios';
    if (path.startsWith('/officials/') && path.includes('/roles')) return 'Roles';
    if (path.startsWith('/officials/') && path.includes('/inventory')) return 'Inventario';
    if (path.startsWith('/officials/') && path.includes('/events')) return 'Eventos';
    if (path === '/login') return 'Iniciar Sesión';
    
    return 'Gestión de Funcionarios';
  };
  
  return (
    <header className="bg-white border-b border-gray-200 z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={onToggleSidebar}
            >
              <span className="sr-only">
                {isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              </span>
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <h1 className="ml-3 text-xl font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">
                  {user.email}
                </span>
                <span className="text-xs text-gray-500">
                  {user.role === 'ADMIN' ? 'Administrador' : 
                   user.role === 'SUPERUSER' ? 'Super Usuario' : 'Usuario'}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                icon={<LogOut size={18} />}
                aria-label="Cerrar sesión"
                className="hidden md:flex"
              >
                Salir
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                icon={<LogOut size={18} />}
                aria-label="Cerrar sesión"
                className="md:hidden"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}