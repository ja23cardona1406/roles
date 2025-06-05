import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useDashboardStore } from '../store/dashboardStore';
import { formatCurrency } from '../lib/utils';
import { Users, UserCheck, Clock, Package, AlertTriangle, UserX } from 'lucide-react';

export default function Dashboard() {
  const { metrics, isLoading, fetchMetrics } = useDashboardStore();
  
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);
  
  if (isLoading || !metrics) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Total Funcionarios</p>
                <h3 className="text-3xl font-bold mt-2">{metrics.officialsCount}</h3>
              </div>
              <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
                <Users size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-100">Roles Activos</p>
                <h3 className="text-3xl font-bold mt-2">{metrics.activeRolesCount}</h3>
              </div>
              <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full">
                <UserCheck size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-100">Valor Inventario</p>
                <h3 className="text-3xl font-bold mt-2">
                  {formatCurrency(metrics.totalInventoryValue)}
                </h3>
              </div>
              <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
                <Package size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-100">Próximos Eventos</p>
                <h3 className="text-3xl font-bold mt-2">{metrics.upcomingEvents}</h3>
              </div>
              <div className="bg-amber-400 bg-opacity-30 p-3 rounded-full">
                <Clock size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 text-gray-500" size={20} />
              Estado de Funcionarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                <span className="text-sm font-medium text-gray-600">Provisionales</span>
                <span className="ml-auto text-sm font-medium">
                  {metrics.statusCounts.PROVISIONAL}
                </span>
              </div>
              
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm font-medium text-gray-600">Posicionados</span>
                <span className="ml-auto text-sm font-medium">
                  {metrics.statusCounts.POSITIONED}
                </span>
              </div>
              
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm font-medium text-gray-600">En seguimiento</span>
                <span className="ml-auto text-sm font-medium">
                  {metrics.statusCounts.FOLLOW_UP}
                </span>
              </div>
              
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>
                <span className="text-sm font-medium text-gray-600">Inactivos</span>
                <span className="ml-auto text-sm font-medium">
                  {metrics.statusCounts.INACTIVE}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 text-gray-500" size={20} />
              Resumen de Actividad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-full mr-3">
                  <Clock size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {metrics.upcomingEvents} eventos próximos
                  </p>
                  <p className="text-xs text-gray-500">
                    Evaluaciones y seguimientos en los próximos 30 días
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-full mr-3">
                  <UserCheck size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {metrics.statusCounts.POSITIONED} funcionarios posicionados
                  </p>
                  <p className="text-xs text-gray-500">
                    Con evaluación de periodo de prueba completa
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full mr-3">
                  <UserX size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {metrics.statusCounts.INACTIVE} funcionarios inactivos
                  </p>
                  <p className="text-xs text-gray-500">
                    Con licencias no remuneradas u otras ausencias
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}