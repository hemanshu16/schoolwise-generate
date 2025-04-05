import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { School } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SchoolNameInputProps {
  onSubmit: (schoolName: string) => void;
  initialValue?: string;
}

const SchoolNameInput: React.FC<SchoolNameInputProps> = ({ onSubmit, initialValue = '' }) => {
  const [schoolName, setSchoolName] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolName.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate a short delay for better UX
    setTimeout(() => {
      onSubmit(schoolName);
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 py-4">
        <div className="space-y-2">
          <label htmlFor="schoolNameInput" className="text-sm font-medium">
            School Name
          </label>
          <Input
            id="schoolNameInput"
            type="text"
            placeholder="Enter school name"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button
          type="submit"
          disabled={isSubmitting || !schoolName.trim()}
          className="gap-1.5"
        >
          <School className="h-4 w-4" />
          {isSubmitting ? "Processing..." : "Continue"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SchoolNameInput; 