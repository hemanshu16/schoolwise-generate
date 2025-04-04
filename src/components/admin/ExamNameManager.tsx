import React, { useState } from 'react';
import { useSupabase } from '@/lib/context/SupabaseContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pencil, Trash, Plus, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ExamNameManager: React.FC = () => {
  const { examNames, loading, error, refreshExamNames, addNewExamName, updateExistingExamName, removeExamName } = useSupabase();
  const [newExamName, setNewExamName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddExam = async () => {
    if (!newExamName.trim()) return;
    
    const result = await addNewExamName(newExamName.trim());
    
    if (result.success) {
      toast.success('Exam name added successfully');
      setNewExamName('');
      setIsAdding(false);
    } else {
      toast.error(`Failed to add exam: ${result.error}`);
    }
  };

  const handleUpdateExam = async (id: number) => {
    if (!editingName.trim()) return;
    
    const result = await updateExistingExamName(id, editingName.trim());
    
    if (result.success) {
      toast.success('Exam name updated successfully');
      setEditingId(null);
      setEditingName('');
    } else {
      toast.error(`Failed to update exam: ${result.error}`);
    }
  };

  const handleDeleteExam = async (id: number) => {
    if (!confirm('Are you sure you want to delete this exam name?')) return;
    
    const result = await removeExamName(id);
    
    if (result.success) {
      toast.success('Exam name deleted successfully');
    } else {
      toast.error(`Failed to delete exam: ${result.error}`);
    }
  };

  const startEditing = (exam: { id: number; name: string }) => {
    setEditingId(exam.id);
    setEditingName(exam.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Exam Name Manager</CardTitle>
        <CardDescription>
          Add, edit or remove exam names used in your application
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="text-red-500 p-3 bg-red-50 rounded-md">
            Error loading exam names: {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Exam Names</h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsAdding(!isAdding)}
                className="gap-1"
              >
                {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {isAdding ? 'Cancel' : 'Add New'}
              </Button>
            </div>
            
            {isAdding && (
              <div className="flex gap-2 items-center p-3 border rounded-md bg-slate-50">
                <Input
                  placeholder="Enter new exam name"
                  value={newExamName}
                  onChange={(e) => setNewExamName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddExam} disabled={!newExamName.trim()}>Add</Button>
              </div>
            )}
            
            <div className="space-y-2">
              {examNames.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No exam names found. Add one to get started.</p>
              ) : (
                examNames.map((exam) => (
                  <div key={exam.id} className="flex justify-between items-center p-3 border rounded-md">
                    {editingId === exam.id ? (
                      <>
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 mr-2"
                        />
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleUpdateExam(exam.id)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span>{exam.name}</span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => startEditing(exam)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDeleteExam(exam.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={refreshExamNames} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Refresh Data
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExamNameManager; 