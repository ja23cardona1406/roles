import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { supabase } from '../lib/supabase';
import { SystemInfo } from '../types';
import toast from 'react-hot-toast';

export default function Systems() {
  const [systems, setSystems] = useState<SystemInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<SystemInfo | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const fetchSystems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('systems')
        .select('*')
        .order('name');

      if (error) throw error;

      setSystems(data || []);
    } catch (error) {
      console.error('Error fetching systems:', error);
      toast.error('Error al cargar los sistemas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  const handleAddSystem = async () => {
    try {
      if (!formData.name) {
        toast.error('El nombre del sistema es requerido');
        return;
      }

      const { error } = await supabase
        .from('systems')
        .insert([formData]);

      if (error) throw error;

      await fetchSystems();
      setIsAddModalOpen(false);
      setFormData({ name: '', description: '' });
      toast.success('Sistema agregado con éxito');
    } catch (error) {
      console.error('Error adding system:', error);
      toast.error('Error al agregar el sistema');
    }
  };

  const handleEditSystem = async () => {
    try {
      if (!selectedSystem || !formData.name) return;

      const { error } = await supabase
        .from('systems')
        .update(formData)
        .eq('id', selectedSystem.id);

      if (error) throw error;

      await fetchSystems();
      setIsEditModalOpen(false);
      setSelectedSystem(null);
      toast.success('Sistema actualizado con éxito');
    } catch (error) {
      console.error('Error updating system:', error);
      toast.error('Error al actualizar el sistema');
    }
  };

  const handleDeleteSystem = async () => {
    try {
      if (!selectedSystem) return;

      const { error } = await supabase
        .from('systems')
        .delete()
        .eq('id', selectedSystem.id);

      if (error) throw error;

      await fetchSystems();
      setIsDeleteModalOpen(false);
      setSelectedSystem(null);
      toast.success('Sistema eliminado con éxito');
    } catch (error) {
      console.error('Error deleting system:', error);
      toast.error('Error al eliminar el sistema');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sistemas</h1>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus size={16} />}
        >
          Agregar Sistema
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={[
              {
                header: 'Nombre',
                accessor: 'name',
              },
              {
                header: 'Descripción',
                accessor: 'description',
              },
              {
                header: 'Acciones',
                accessor: (row) => (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSystem(row);
                        setFormData({
                          name: row.name,
                          description: row.description || ''
                        });
                        setIsEditModalOpen(true);
                      }}
                      icon={<Edit size={16} />}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSystem(row);
                        setIsDeleteModalOpen(true);
                      }}
                      icon={<Trash2 size={16} />}
                    />
                  </div>
                ),
              },
            ]}
            data={systems}
            keyField="id"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Add System Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Agregar Sistema"
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Descripción"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddSystem}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit System Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Sistema"
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Descripción"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditSystem}>
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
      >
        <div className="space-y-4">
          <p>
            ¿Está seguro que desea eliminar el sistema{' '}
            <span className="font-medium">{selectedSystem?.name}</span>?
          </p>
          <p className="text-sm text-red-600">
            Esta acción eliminará todos los roles asociados a este sistema.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteSystem}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}