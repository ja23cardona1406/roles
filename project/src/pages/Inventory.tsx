import React, { useEffect, useState } from 'react';
import { Plus, Search, Download, FileText } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { InventoryItem, Official } from '../types';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InventoryItemWithOfficial extends InventoryItem {
  official: Official;
}

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItemWithOfficial[]>([]);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOfficial, setFilterOfficial] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    official_id: '',
    description: '',
    code: '',
    value: ''
  });

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          official:officials (
            id,
            full_name,
            document_id,
            position
          )
        `)
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Error al cargar el inventario');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOfficials = async () => {
    try {
      const { data, error } = await supabase
        .from('officials')
        .select('*')
        .order('full_name');

      if (error) throw error;

      setOfficials(data || []);
    } catch (error) {
      console.error('Error fetching officials:', error);
      toast.error('Error al cargar los funcionarios');
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchOfficials();
  }, []);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.official.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOfficial = filterOfficial ? item.official_id === filterOfficial : true;
    
    return matchesSearch && matchesOfficial;
  });

  const handleAddItem = async () => {
    try {
      if (!formData.official_id || !formData.description || !formData.code || !formData.value) {
        toast.error('Todos los campos son requeridos');
        return;
      }

      const { error } = await supabase
        .from('inventory')
        .insert([{
          ...formData,
          value: parseInt(formData.value, 10)
        }]);

      if (error) throw error;

      await fetchInventory();
      setIsAddModalOpen(false);
      setFormData({
        official_id: '',
        description: '',
        code: '',
        value: ''
      });
      toast.success('Elemento agregado con éxito');
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast.error('Error al agregar el elemento');
    }
  };

  const exportToExcel = () => {
    const dataForExport = filteredInventory.map(item => ({
      'Funcionario': item.official.full_name,
      'Cédula': item.official.document_id,
      'Cargo': item.official.position,
      'Descripción': item.description,
      'Código': item.code,
      'Valor': formatCurrency(item.value),
      'Fecha Asignación': new Date(item.assigned_at).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
    XLSX.writeFile(wb, 'inventario.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Inventario', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const dataForExport = filteredInventory.map(item => [
      item.official.full_name,
      item.description,
      item.code,
      formatCurrency(item.value),
      new Date(item.assigned_at).toLocaleDateString()
    ]);
    
    autoTable(doc, {
      head: [['Funcionario', 'Descripción', 'Código', 'Valor', 'Asignación']],
      body: dataForExport,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] }
    });
    
    doc.save('inventario.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredInventory.length} elementos • Valor total: {
              formatCurrency(
                filteredInventory.reduce((sum, item) => sum + item.value, 0)
              )
            }
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus size={16} />}
        >
          Agregar Elemento
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2">
              <Input
                placeholder="Buscar por descripción, código o funcionario"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>
            <div className="w-full sm:w-1/2">
              <Select
                options={[
                  { value: '', label: 'Todos los funcionarios' },
                  ...officials.map(official => ({
                    value: official.id,
                    label: official.full_name
                  }))
                ]}
                value={filterOfficial}
                onChange={setFilterOfficial}
                placeholder="Filtrar por funcionario"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Elementos</CardTitle>
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
                header: 'Funcionario',
                accessor: (row) => row.official.full_name,
              },
              {
                header: 'Descripción',
                accessor: 'description',
              },
              {
                header: 'Código',
                accessor: 'code',
              },
              {
                header: 'Valor',
                accessor: (row) => formatCurrency(row.value),
              },
              {
                header: 'Asignación',
                accessor: (row) => new Date(row.assigned_at).toLocaleDateString(),
              },
            ]}
            data={filteredInventory}
            keyField="id"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Agregar Elemento"
      >
        <div className="space-y-4">
          <Select
            label="Funcionario"
            options={officials.map(official => ({
              value: official.id,
              label: official.full_name
            }))}
            value={formData.official_id}
            onChange={(value) => setFormData({ ...formData, official_id: value })}
            required
          />
          <Input
            label="Descripción"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <Input
            label="Código"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
          <Input
            label="Valor"
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            required
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddItem}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}