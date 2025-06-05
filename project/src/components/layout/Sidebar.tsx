import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Database, Package, BarChart2, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const { user, signOut } = useAuthStore();
  
  if (!user) return null;
  
  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-20 h-full w-64 bg-gray-800 text-white transition-transform duration-300 ease-in-out transform",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0",
        "flex flex-col"
      )}
    >
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Database size={24} className="text-blue-400" />
          <h2 className="text-xl font-bold">Gestión DIAN</h2>
        </div>
      </div>
      
      <nav className="flex-grow py-4 px-4">
        <ul className="space-y-1">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => cn(
                "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors",
                isActive 
                  ? "bg-blue-700 text-white" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
              end
            >
              <BarChart2 size={20} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/officials" 
              className={({ isActive }) => cn(
                "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors",
                isActive 
                  ? "bg-blue-700 text-white" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <Users size={20} />
              <span>Funcionarios</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/systems" 
              className={({ isActive }) => cn(
                "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors",
                isActive 
                  ? "bg-blue-700 text-white" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <Database size={20} />
              <span>Sistemas</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/inventory" 
              className={({ isActive }) => cn(
                "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors",
                isActive 
                  ? "bg-blue-700 text-white" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <Package size={20} />
              <span>Inventario</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-600 rounded-full p-2">
              <User size={20} className="text-gray-200" />
            </div>
            <div>
              <div className="text-sm font-medium">{user.email}</div>
              <div className="text-xs text-gray-400">
                {user.role === 'ADMIN' ? 'Administrador' : 
                 user.role === 'SUPERUSER' ? 'Super Usuario' : 'Usuario'}
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => signOut()}
            className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-700"
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}