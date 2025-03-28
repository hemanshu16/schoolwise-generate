import { useState } from "react";
import { districts, schools, taluks } from "@/utils/mock-data";
import DistrictSelector from "@/components/selection/DistrictSelector";
import TalukSelector from "@/components/selection/TalukaSelector";
import SchoolList from "@/components/selection/SchoolList";
import { useDelayedMount } from "@/utils/animations";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ExamNameInput from "@/components/reports/ExamNameInput";
import { AlertTriangle } from "lucide-react";

interface SelectionFlowProps {
  userRole: "teacher" | "officer";
  officerPermission: "district" | "taluk" | "none";
  isOfficerAuthenticated: boolean;
  onGenerateReport: (type: "district" | "taluk" | "school", entityId: string, examName: string) => void;
  onShowUnfilledSchools: (examName: string) => void;
}

const SelectionFlow = ({
  userRole,
  officerPermission,
  isOfficerAuthenticated,
  onGenerateReport,
  onShowUnfilledSchools
}: SelectionFlowProps) => {
  // Selection state
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedTalukId, setSelectedTalukId] = useState<string | null>(null);
  const [showExamNameModal, setShowExamNameModal] = useState(false);
  // Update the type to include "school"
  const [pendingReportType, setPendingReportType] = useState<"district" | "taluk" | "school" | null>(null);
  const [examName, setExamName] = useState<string>("");
  
  // Determine current selection step
  const showTalukSelector = !!selectedDistrictId;
  const showSchoolList = !!selectedTalukId;
  
  // Delayed mounting for UI elements
  const mountTalukSelector = useDelayedMount(Boolean(showTalukSelector));
  const mountSchoolList = useDelayedMount(Boolean(showSchoolList));
  
  // Helpers for entity names
  const selectedDistrict = districts.find(d => d.id === selectedDistrictId);
  const selectedTaluk = taluks.find(t => t.id === selectedTalukId);
  
  // Determine if report generation buttons should be shown
  const showDistrictReportButton = userRole === "officer" && officerPermission === "district" && selectedDistrictId && !selectedTalukId;
  const showTalukReportButton = userRole === "officer" && (officerPermission === "district" || officerPermission === "taluk") && selectedTalukId;

  // Handlers
  const handleDistrictSelect = (districtId: string) => {
    setSelectedDistrictId(districtId);
    setSelectedTalukId(null);
  };
  
  const handleTalukSelect = (talukId: string) => {
    setSelectedTalukId(talukId);
  };
  
  const handleGenerateDistrictReport = () => {
    if (isOfficerAuthenticated) {
      setPendingReportType("district");
      setShowExamNameModal(true);
    }
  };
  
  const handleGenerateTalukReport = () => {
    if (isOfficerAuthenticated) {
      setPendingReportType("taluk");
      setShowExamNameModal(true);
    }
  };
  
  const handleExamNameSubmit = (selectedExamName: string) => {
    setExamName(selectedExamName);
    setShowExamNameModal(false);
    
    if (pendingReportType) {
      const entityId = pendingReportType === "district" 
        ? selectedDistrictId 
        : pendingReportType === "taluk" 
          ? selectedTalukId 
          : selectedSchoolId; // This is an issue as selectedSchoolId doesn't exist in this component
      
      if (entityId) {
        onGenerateReport(pendingReportType, entityId, selectedExamName);
        
        const entityName = pendingReportType === "district" 
          ? selectedDistrict?.name 
          : pendingReportType === "taluk" 
            ? selectedTaluk?.name 
            : schools.find(s => s.id === entityId)?.name;
          
        toast.success(`Generating ${pendingReportType} report for ${entityName} - ${selectedExamName}`);
      }
      setPendingReportType(null);
    }
  };
  
  // Fix the handleSchoolSelect function to store the schoolId for later use
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  
  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    const school = schools.find(s => s.id === schoolId);
    if (school) {
      setShowExamNameModal(true);
      setPendingReportType("school");
      // The actual report generation will happen when exam name is selected
      // and handleExamNameSubmit is called
    }
  };
  
  const handleShowUnfilledSchools = () => {
    if (selectedTalukId) {
      onShowUnfilledSchools(examName);
    }
  };

  return (
    <div className="space-y-8">
      {/* Step 1: District Selection */}
      <div className={cn("selection-step", selectedDistrictId ? "mb-8" : "")}>
        <DistrictSelector 
          onSelect={handleDistrictSelect} 
          selectedDistrictId={selectedDistrictId}
        />
        
        {showDistrictReportButton && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={handleGenerateDistrictReport}
              className="py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Generate District Report
            </button>
          </div>
        )}
      </div>
      
      {/* Step 2: Taluk Selection */}
      {mountTalukSelector && selectedDistrictId && (
        <div className={cn("selection-step", selectedTalukId ? "mb-8" : "")}>
          <TalukSelector
            districtId={selectedDistrictId}
            onSelect={handleTalukSelect}
            selectedTalukId={selectedTalukId}
          />
          
          {showTalukReportButton && (
            <div className="mt-4 flex justify-center gap-2 flex-wrap">
              <button
                onClick={handleGenerateTalukReport}
                className="py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Generate Taluk Report
              </button>
              
              <button 
                onClick={handleShowUnfilledSchools}
                className="py-2 px-4 bg-primary/10 text-primary border border-primary/30 rounded-md hover:bg-primary/20 transition-colors flex items-center gap-1.5"
              >
                <AlertTriangle className="h-4 w-4" />
                Schools with Unfilled Marks
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Step 3: School List */}
      {mountSchoolList && selectedTalukId && (
        <div className="selection-step mt-8">
          <SchoolList
            talukId={selectedTalukId}
            onSelectSchool={handleSchoolSelect}
            userRole={userRole}
          />
        </div>
      )}

      {/* Exam Name Modal */}
      <Dialog 
        open={showExamNameModal} 
        onOpenChange={setShowExamNameModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Exam</DialogTitle>
            <DialogDescription>
              Please select an exam for the {pendingReportType || "school"} report
            </DialogDescription>
          </DialogHeader>
          
          <ExamNameInput onSubmit={handleExamNameSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SelectionFlow;
