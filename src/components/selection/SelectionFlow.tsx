import { useState, useEffect } from "react";
import { schools, taluks } from "@/utils/mock-data";
import DistrictSelector from "@/components/selection/DistrictSelector";
import TalukSelector from "@/components/selection/TalukaSelector";
import SchoolList from "@/components/selection/SchoolList";
import { useDelayedMount } from "@/utils/animations";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ExamNameInput from "@/components/reports/ExamNameInput";
import { AlertTriangle, FileText, ChevronDown } from "lucide-react";
import { useSupabase } from "@/lib/context/SupabaseContext";

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
  const { districts, refreshDistricts, loading } = useSupabase();
  
  // Refresh districts if needed
  useEffect(() => {
    if (districts.length === 0 && !loading) {
      refreshDistricts();
    }
  }, [districts, refreshDistricts, loading]);
  
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
  const selectedDistrict = districts.find(d => d.id.toString() === selectedDistrictId);
  const selectedTaluk = taluks.find(t => t.id === selectedTalukId);
  
  // Determine if report generation buttons should be shown
  const showDistrictReportButton = userRole === "officer" && officerPermission === "district" && selectedDistrictId;
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
          ? selectedDistrict?.district 
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

  // Helper function to get decorative step number
  const getStepNumber = (step: number) => {
    return (
      <div className="hidden sm:flex flex-shrink-0 items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-full bg-primary/10 text-primary font-semibold text-sm md:text-base">
        {step}
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12 w-full max-w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
        {/* Step 1: District Selection */}
        <div className={cn(
          "selection-step bg-white rounded-lg md:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-slate-100 w-full",
          !selectedDistrictId && "md:col-span-2" // Make it span full width when no district is selected
        )}>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-5">
            {getStepNumber(1)}
            <h3 className="text-base sm:text-lg font-medium text-slate-800">District Selection</h3>
          </div>
          
          <div className={cn(
            "w-full", 
            !selectedDistrictId && "flex justify-center"
          )}>
            <DistrictSelector 
              onSelect={handleDistrictSelect} 
              selectedDistrictId={selectedDistrictId}
              className={cn(
                "w-full",
                !selectedDistrictId && "max-w-md"
              )}
            />
          </div>
          
          {showDistrictReportButton && (
            <div className="mt-4 sm:mt-5 md:mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
              <button
                onClick={handleGenerateDistrictReport}
                className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-primary text-white text-sm rounded-md hover:bg-primary/90 transition-all"
              >
                <FileText className="h-3.5 w-3.5" />
                District Report
              </button>
            </div>
          )}
        </div>
        
        {/* Step 2: Taluk Selection - Only show when district is selected */}
        {selectedDistrictId && mountTalukSelector ? (
          <div className={cn(
            "selection-step bg-white rounded-lg md:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-slate-100 w-full"
          )}>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-5">
              {getStepNumber(2)}
              <h3 className="text-base sm:text-lg font-medium text-slate-800">Taluk Selection</h3>
            </div>
            
            <TalukSelector
              districtId={selectedDistrictId}
              onSelect={handleTalukSelect}
              selectedTalukId={selectedTalukId}
              className="w-full"
            />
            
            {showTalukReportButton && (
              <div className="mt-4 sm:mt-5 md:mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
                <button
                  onClick={handleGenerateTalukReport}
                  className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-secondary text-white text-sm rounded-md hover:bg-secondary/90 transition-all"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Taluk Report
                </button>
                
                <button 
                  onClick={handleShowUnfilledSchools}
                  className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-50 text-amber-700 border border-amber-200 text-sm rounded-md hover:bg-amber-100 transition-all"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Unfilled Marks
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Add an empty div to maintain grid layout on desktop when taluk selector is not shown */
          <div className="hidden md:block" />
        )}
      </div>
      {/* Step 3: School List */}
      {mountSchoolList && selectedTalukId && (
        <div className="selection-step bg-white rounded-lg md:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-slate-100 w-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-5">
            {getStepNumber(3)}
            <h3 className="text-base sm:text-lg font-medium text-slate-800">School Selection</h3>
          </div>
          
          <SchoolList
            talukId={selectedTalukId}
            onSelectSchool={handleSchoolSelect}
            userRole={userRole}
            className="w-full"
          />
        </div>
      )}

      {/* Exam Name Modal - Redesigned */}
      <Dialog 
        open={showExamNameModal} 
        onOpenChange={setShowExamNameModal}
      >
        <DialogContent className="w-[95vw] max-w-md rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <div className="mx-auto rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <DialogTitle className="text-lg sm:text-xl">Select Exam</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Please select an exam for the {pendingReportType || "school"} report
            </DialogDescription>
          </DialogHeader>
          
          <ExamNameInput 
            isOpen={showExamNameModal}
            onClose={() => setShowExamNameModal(false)}
            onSubmit={handleExamNameSubmit} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SelectionFlow;
