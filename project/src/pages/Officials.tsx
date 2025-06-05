import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Download, Search, FileText } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useOfficialsStore } from '../store/officialsStore';
import { Official, EmploymentStatus } from '../types';
import { formatDate, getStatusColor } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import Select from '../components/ui/Select';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Officials() {
  const { officials, isLoading, fetchOfficials, addOfficial, deleteOfficial } = useOfficialsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<EmploymentStatus | ''>('');
  const [filterProcedure, setFilterProcedure] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOfficial, setSelectedOfficial] = useState<Official | null>(null);
  const [newOfficial, setNewOfficial] = useState({
    full_name: '',
    age: '',
    document_id: '',
    position: '',
    profession: '',
    procedure: '',
    status: 'PROVISIONAL' as EmploymentStatus,
    entry_date: ''
  });
  const navigate = useNavigate();
  
  // Fetch officials on component mount
  useEffect(() => {
    fetchOfficials();
  }, [fetchOfficials]);
  
  // Filter officials based on search and filters
  const filteredOfficials = officials.filter(official => {
    const matchesSearch = official.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          official.document_id.includes(searchTerm) ||
                          official.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus ? official.status === filterStatus : true;
    const matchesProcedure = filterProcedure ? official.procedure === filterProcedure : true;
    
    return matchesSearch && matchesStatus && matchesProcedure;
  });
  
  // Get unique procedures for filter
  const procedures = [...new Set(officials.map(official => official.procedure))];
  
  const handleAddOfficial = async () => {
    // Validate form fields
    if (!newOfficial.full_name || !newOfficial.document_id || !newOfficial.position || 
        !newOfficial.procedure || !newOfficial.entry_date) {
      return;
    }
    
    const officialToAdd = {
      ...newOfficial,
      age: parseInt(newOfficial.age, 10),
    };
    
    const officialId = await addOfficial(officialToAdd);
    
    if (officialId) {
      setIsAddModalOpen(false);
      // Reset form
      setNewOfficial({
        full_name: '',
        age: '',
        document_id: '',
        position: '',
        profession: '',
        procedure: '',
        status: 'PROVISIONAL',
        entry_date: ''
      });
    }
  };
  
  const handleDeleteOfficial = async () => {
    if (selectedOfficial) {
      await deleteOfficial(selectedOfficial.id);
      setIsDeleteModalOpen(false);
      setSelectedOfficial(null);
    }
  };
  
  const handleViewOfficial = (official: Official) => {
    navigate(`/officials/${official.id}`);
  };
  
  const exportToExcel = () => {
    const dataForExport = filteredOfficials.map(official => ({
      'Nombre': official.full_name,
      'Edad': official.age,
      'Cédula': official.document_id,
      'Cargo': official.position,
      'Profesión': official.profession,
      'Procedimiento': official.procedure,
      'Estado': official.status === 'PROVISIONAL' ? 'Provisional' :
                official.status === 'POSITIONED' ? 'Posicionado' :
                official.status === 'INACTIVE' ? 'Inactivo' : 'En seguimiento',
      'Fecha de Ingreso': formatDate(official.entry_date)
    }));
    
    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Funcionarios');
    XLSX.writeFile(wb, 'funcionarios.xlsx');
  };
  
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Listado de Funcionarios', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const dataForExport = filteredOfficials.map(official => [
      official.full_name,
      official.document_id,
      official.position,
      official.status === 'PROVISIONAL' ? 'Provisional' :
      official.status === 'POSITIONED' ? 'Posicionado' :
      official.status === 'INACTIVE' ? 'Inactivo' : 'En seguimiento',
      formatDate(official.entry_date)
    ]);
    
    autoTable(doc, {
      head: [['Nombre', 'Cédula', 'Cargo', 'Estado', 'Ingreso']],
      body: dataForExport,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 9
      },
      headStyles: {
        fillColor: [37, 99, 235]
      }
    });
    
    doc.save('funcionarios.pdf');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 gap-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <h1 className="text-2xl font-bold text-gray-900">Funcionarios</h1>
          <div className="hidden sm:block text-gray-400">|</div>
          <p className="text-sm text-gray-500">{filteredOfficials.length} funcionarios</p>
        </div>
        
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus size={16} />}
        >
          Agregar Funcionario
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 text-gray-500" size={18} />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/3">
              <Input
                placeholder="Buscar por nombre, cédula o cargo"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>
            
            <div className="w-full sm:w-1/3">
              <Select
                options={[
                  { value: '', label: 'Todos los estados' },
                  { value: 'PROVISIONAL', label: 'Provisional' },
                  { value: 'POSITIONED', label: 'Posicionado' },
                  { value: 'INACTIVE', label: 'Inactivo' },
                  { value: 'FOLLOW_UP', label: 'En seguimiento' }
                ]}
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="Filtrar por estado"
              />
            </div>
            
            <div className="w-full sm:w-1/3">
              <Select
                options={[
                  { value: '', label: 'Todos los procedimientos' },
                  ...procedures.map(proc => ({ value: proc, label: proc }))
                ]}
                value={filterProcedure}
                onChange={setFilterProcedure}
                placeholder="Filtrar por procedimiento"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="border-b pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Lista de Funcionarios</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToExcel}
                icon={<FileText size={16} />}
              >
                Excel
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToPDF}
                icon={<Download size={16} />}
              >
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={[
              {
                header: 'Nombre',
                accessor: 'full_name',
              },
              {
                header: 'Cédula',
                accessor: 'document_id',
              },
              {
                header: 'Cargo',
                accessor: 'position',
              },
              {
                header: 'Procedimiento',
                accessor: 'procedure',
              },
              {
                header: 'Estado',
                accessor: (row) => (
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(row.status)}`}></div>
                    <span>
                      {row.status === 'PROVISIONAL' ? 'Provisional' :
                       row.status === 'POSITIONED' ? 'Posicionado' :
                       row.status === 'INACTIVE' ? 'Inactivo' : 'En seguimiento'}
                    </span>
                  </div>
                ),
              },
              {
                header: 'Ingreso',
                accessor: (row) => formatDate(row.entry_date),
              },
            ]}
            data={filteredOfficials}
            keyField="id"
            isLoading={isLoading}
            onRowClick={handleViewOfficial}
            emptyMessage="No se encontraron funcionarios con los filtros actuales"
          />
        </CardContent>
      </Card>
      
      {/* Add Official Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Agregar Funcionario"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre completo"
              value={newOfficial.full_name}
              onChange={(e) => setNewOfficial({ ...newOfficial, full_name: e.target.value })}
              required
            />
            
            <Input
              label="Edad"
              type="number"
              value={newOfficial.age}
              onChange={(e) => setNewOfficial({ ...newOfficial, age: e.target.value })}
              required
            />
            
            <Input
              label="Cédula"
              value={newOfficial.document_id}
              onChange={(e) => setNewOfficial({ ...newOfficial, document_id: e.target.value })}
              required
            />
            
            <Input
              label="Cargo"
              value={newOfficial.position}
              onChange={(e) => setNewOfficial({ ...newOfficial, position: e.target.value })}
              required
            />
            
            <Input
              label="Profesión"
              value={newOfficial.profession}
              onChange={(e) => setNewOfficial({ ...newOfficial, profession: e.target.value })}
            />
            
            <Input
              label="Procedimiento"
              value={newOfficial.procedure}
              onChange={(e) => setNewOfficial({ ...newOfficial, procedure: e.target.value })}
              required
            />
            
            <Select
              label="Estado"
              options={[
                { value: 'PROVISIONAL', label: 'Provisional' },
                { value: 'POSITIONED', label: 'Posicionado' },
                { value: 'INACTIVE', label: 'Inactivo' },
                { value: 'FOLLOW_UP', label: 'En seguimiento' }
              ]}
              value={newOfficial.status}
              onChange={(value) => setNewOfficial({ ...newOfficial, status: value as EmploymentStatus })}
              required
            />
            
            <Input
              label="Fecha de Ingreso"
              type="date"
              value={newOfficial.entry_date}
              onChange={(e) => setNewOfficial({ ...newOfficial, entry_date: e.target.value })}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddOfficial}
            >
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Está seguro que desea eliminar al funcionario <span className="font-medium">{selectedOfficial?.full_name}</span>?
          </p>
          
          <p className="text-sm text-red-600">
            Esta acción no se puede deshacer y eliminará todos los roles, inventario y eventos asociados.
          </p>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteOfficial}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}