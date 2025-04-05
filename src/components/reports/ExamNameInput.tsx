import { useState, useEffect } from "react";
import { Check, Calendar, Loader2 } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabase } from "@/lib/context/SupabaseContext";

interface ExamNameInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (examName: string) => void;
}

const ExamNameInput = ({ isOpen, onClose, onSubmit }: ExamNameInputProps) => {
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingExams, setIsLoadingExams] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { examNames, refreshExamNames, loading } = useSupabase();
  
  useEffect(() => {
    const loadExams = async () => {
      try {
        setIsLoadingExams(true);
        await refreshExamNames();
      } catch (err) {
        setError("Failed to load exams");
        console.error(err);
      } finally {
        setIsLoadingExams(false);
      }
    };
    
    if (isOpen) {
      loadExams();
    }
  }, [isOpen, refreshExamNames]);

  const handleSubmit = async () => {
    if (!selectedExam) {
      setError("Please select an exam");
      return;
    }
    
    setIsLoading(true);
    try {
      onSubmit(selectedExam);
    } catch (err) {
      console.error("Error submitting exam name:", err);
      setError("Failed to submit exam");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-center">Select Exam</DialogTitle>
          <DialogDescription className="text-center text-xs sm:text-sm text-gray-500">
            Select the exam to generate report for the selected schools
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-3 sm:py-4 space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700">Exam Name</label>
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger 
                className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm shadow-sm hover:border-secondary/30 focus:ring-secondary/20 ${error ? 'border-red-500' : 'border-gray-200'}`}
              >
                <div className="flex items-center gap-2">
                  {isLoadingExams || loading ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-gray-400" />
                  ) : (
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  )}
                  <SelectValue placeholder="Select an exam" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-48 sm:max-h-56 md:max-h-64 overflow-auto rounded-lg sm:rounded-xl">
                {examNames.map((exam) => (
                  <SelectItem 
                    key={exam.id} 
                    value={exam.exam_name}
                    className="text-xs sm:text-sm py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-md focus:bg-secondary/10 focus:text-secondary data-[highlighted]:bg-secondary/10 data-[highlighted]:text-secondary"
                  >
                    <div className="flex items-center gap-2">
                      <span>{exam.exam_name}</span>
                      {selectedExam === exam.exam_name && (
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-secondary ml-auto" />
                      )}
                    </div>
                  </SelectItem>
                ))}
                {examNames.length === 0 && !isLoadingExams && !loading && (
                  <div className="py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-500">
                    No exams found
                  </div>
                )}
              </SelectContent>
            </Select>
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex items-center justify-end gap-2 sm:gap-3 pt-2 sm:pt-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm rounded-lg"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm rounded-lg bg-secondary hover:bg-secondary/90"
            disabled={isLoading || !selectedExam}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExamNameInput;
