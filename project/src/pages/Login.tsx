import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Database, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { signIn, user, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!email || !password) {
      setFormError('Por favor ingrese correo y contraseña');
      return;
    }
    
    await signIn(email, password);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 py-6 px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-3">
            <Database size={48} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Gestión de Funcionarios DIAN</h2>
          <p className="mt-1 text-blue-100">Ingrese sus credenciales para continuar</p>
        </div>
        
        <div className="py-8 px-4 sm:px-10">
          {(error || formError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle size={20} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">
                {formError || error}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="email"
              type="email"
              label="Correo electrónico"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              required
              autoComplete="email"
            />
            
            <Input
              id="password"
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
              autoComplete="current-password"
            />
            
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Iniciar Sesión
            </Button>
          </form>
        </div>
      </div>
      
      <p className="mt-8 text-center text-sm text-gray-600">
        Sistema de gestión para funcionarios públicos DIAN
      </p>
    </div>
  );
}