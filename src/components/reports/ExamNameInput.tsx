
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { FileText } from "lucide-react";

interface ExamNameInputProps {
  onSubmit: (examName: string) => void;
}

const ExamNameInput: React.FC<ExamNameInputProps> = ({ onSubmit }) => {
  const [examName, setExamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!examName.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate a short delay for better UX
    setTimeout(() => {
      onSubmit(examName);
      setIsSubmitting(false);
      setExamName('');
    }, 300);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 py-4">
        <div className="space-y-2">
          <label htmlFor="examNameInput" className="text-sm font-medium">
            Exam Name
          </label>
          <Input
            id="examNameInput"
            placeholder="e.g. Quarterly Assessment 2023"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button
          type="submit"
          disabled={isSubmitting || !examName.trim()}
          className="gap-1.5"
        >
          <FileText className="h-4 w-4" />
          {isSubmitting ? "Processing..." : "Generate Report"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ExamNameInput;
