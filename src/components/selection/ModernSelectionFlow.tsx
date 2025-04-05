import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/context/SupabaseContext";
import SteppedSelection from "./SteppedSelection";
import SchoolList from "./SchoolList";
import ExamNameInput from "../reports/ExamNameInput";
import { toast } from "sonner";
import { FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModernSelectionFlowProps {
  userRole: "teacher" | "officer";
  officerPermission?: "district" | "taluk" | "none";
  isOfficerAuthenticated?: boolean;
  onGenerateReport?: (type: "district" | "taluk" | "school", entityId: string, examName: string) => void;
  onBackButtonClick?: () => void;
  onShowUnfilledSchools?: (examName: string) => void;
}

const ModernSelectionFlow = ({
  userRole,
  officerPermission = "none",
  isOfficerAuthenticated = false,
  onGenerateReport,
  onBackButtonClick,
  onShowUnfilledSchools
}: ModernSelectionFlowProps) => {
  // Selection state
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedTalukId, setSelectedTalukId] = useState<string | null>(null);
  const [showExamNameModal, setShowExamNameModal] = useState(false);
  const [pendingReportType, setPendingReportType] = useState<"district" | "taluk" | "school" | null>(null);
  
  // Determine if report generation buttons should be shown
  const showDistrictReportButton = userRole === "officer" && 
    officerPermission === "district" && 
    selectedDistrictId && 
    !selectedTalukId &&
    isOfficerAuthenticated;
    
  const showTalukReportButton = userRole === "officer" && 
    (officerPermission === "district" || officerPermission === "taluk") && 
    selectedTalukId &&
    isOfficerAuthenticated;

  // Handle entity selection
  const handleDistrictSelect = (districtId: string) => {
    setSelectedDistrictId(districtId);
    setSelectedTalukId(null);
  };
  
  const handleTalukSelect = (talukId: string) => {
    setSelectedTalukId(talukId);
  };
  
  const handleSchoolSelect = (schoolId: string) => {
    // Handle school selection logic
    console.log("School selected:", schoolId);
  };
  
  // Report generation handlers
  const handleGenerateDistrictReport = () => {
    if (selectedDistrictId) {
      setPendingReportType("district");
      setShowExamNameModal(true);
    } else {
      toast.error("Please select a district first");
    }
  };
  
  const handleGenerateTalukReport = () => {
    if (selectedTalukId) {
      setPendingReportType("taluk");
      setShowExamNameModal(true);
    } else {
      toast.error("Please select a taluk first");
    }
  };
  
  const handleShowUnfilledSchools = () => {
    if (selectedTalukId && onShowUnfilledSchools) {
      setPendingReportType("taluk");
      setShowExamNameModal(true);
    } else {
      toast.error("Please select a taluk first");
    }
  };
  
  const handleExamNameSubmit = (examName: string) => {
    setShowExamNameModal(false);
    
    if (pendingReportType === "district" && selectedDistrictId && onGenerateReport) {
      onGenerateReport("district", selectedDistrictId, examName);
    }
    else if (pendingReportType === "taluk" && selectedTalukId && onGenerateReport) {
      onGenerateReport("taluk", selectedTalukId, examName);
    }
    else if (pendingReportType === "taluk" && selectedTalukId && onShowUnfilledSchools) {
      onShowUnfilledSchools(examName);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      <SteppedSelection 
        onDistrictSelect={handleDistrictSelect}
        onTalukSelect={handleTalukSelect}
        showBackButton={!!onBackButtonClick}
        onBackButtonClick={onBackButtonClick}
        className="mb-6"
      />
      
      {/* Display report buttons after district selection */}
      {showDistrictReportButton && (
        <div className="flex justify-center p-3">
          <Button
            onClick={handleGenerateDistrictReport}
            className="bg-teal-700 hover:bg-teal-800 text-white font-medium px-5 py-2.5 shadow-sm border border-teal-800"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate District Report
          </Button>
        </div>
      )}
      
      {/* Display taluk report buttons */}
      {showTalukReportButton && (
        <div className="flex flex-wrap justify-center gap-3 p-3">
          <Button
            onClick={handleGenerateTalukReport}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-medium px-5 py-2.5 shadow-sm border border-indigo-800"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Taluk Report
          </Button>
          
          {onShowUnfilledSchools && (
            <Button 
              onClick={handleShowUnfilledSchools}
              variant="outline"
              className="border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100 font-medium px-5 py-2.5 shadow-sm"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Schools with Unfilled Marks
            </Button>
          )}
        </div>
      )}
      
      {/* Show School List when Taluk is selected */}
      {selectedTalukId && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center p-4 bg-slate-50 border-b border-slate-200">
            <div className="h-9 w-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold mr-3 border border-purple-200 shadow-sm">
              3
            </div>
            <h3 className="text-lg font-semibold text-slate-800">School Selection</h3>
          </div>
          
          <div className="p-4">
            <SchoolList 
              talukId={selectedTalukId}
              onSelectSchool={handleSchoolSelect}
              userRole={userRole}
            />
          </div>
        </div>
      )}
      
      {/* Exam Name Modal */}
      <ExamNameInput 
        isOpen={showExamNameModal} 
        onClose={() => setShowExamNameModal(false)}
        onSubmit={handleExamNameSubmit}
      />
    </div>
  );
};

export default ModernSelectionFlow; 