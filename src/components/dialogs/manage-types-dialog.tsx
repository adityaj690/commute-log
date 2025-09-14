'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CommuteType } from '@/lib/types';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { CommuteIcon } from '../commute-icon';

type ManageTypesDialogProps = {
  isOpen: boolean;
  onOpenchange: (isOpen: boolean) => void;
  commuteTypes: CommuteType[];
  setCommuteTypes: (types: CommuteType[]) => void;
};

export function ManageTypesDialog({
  isOpen,
  onOpenchange: onOpenChange,
  commuteTypes,
  setCommuteTypes,
}: ManageTypesDialogProps) {
  const [localTypes, setLocalTypes] = useState(commuteTypes);
  const [newTypeName, setNewTypeName] = useState('');
  const [editingType, setEditingType] = useState<CommuteType | null>(null);
  const [editedName, setEditedName] = useState('');

  // Update local state if props change
  useEffect(() => {
    setLocalTypes(commuteTypes);
  }, [commuteTypes]);

  const handleAddType = () => {
    if (newTypeName.trim()) {
      const newType: CommuteType = {
        id: new Date().toISOString(),
        name: newTypeName.trim(),
        icon: 'Car', // Default icon for new types
      };
      const updatedTypes = [...localTypes, newType];
      setLocalTypes(updatedTypes);
      setNewTypeName('');
    }
  };

  const handleDeleteType = (id: string) => {
    setLocalTypes(localTypes.filter((type) => type.id !== id));
  };

  const handleEdit = (type: CommuteType) => {
    setEditingType(type);
    setEditedName(type.name);
  };

  const handleSaveEdit = (id: string) => {
    setLocalTypes(localTypes.map((t) => (t.id === id ? { ...t, name: editedName } : t)));
    setEditingType(null);
    setEditedName('');
  };

  const handleCancelEdit = () => {
    setEditingType(null);
    setEditedName('');
  };

  const handleSaveChanges = () => {
    setCommuteTypes(localTypes);
    onOpenChange(false);
  };

  const handleClose = () => {
    // Reset local state to original on close without saving
    setLocalTypes(commuteTypes);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Commute Types</DialogTitle>
          <DialogDescription>Add, edit, or delete your commute types.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Existing Types</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {localTypes.map((type) => (
                <div key={type.id} className="flex items-center justify-between p-2 border rounded-md">
                  <CommuteIcon iconName={type.icon} className="h-5 w-5 mr-3 text-muted-foreground" />
                  {editingType?.id === type.id ? (
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="flex-1 mr-2 h-8"
                    />
                  ) : (
                    <span className="flex-1 text-sm">{type.name}</span>
                  )}

                  {editingType?.id === type.id ? (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSaveEdit(type.id)}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(type)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteType(type.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-type">Add New Type</Label>
            <div className="flex gap-2">
              <Input
                id="new-type"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="e.g., Walking, Scooter"
                onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
              />
              <Button onClick={handleAddType} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add</span>
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
