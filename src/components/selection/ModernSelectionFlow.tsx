import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/context/SupabaseContext";
import SteppedSelection from "./SteppedSelection";
import SchoolList from "./SchoolList";
import ExamNameInput, { ExamNameInputContent } from "../reports/ExamNameInput";
import { toast } from "sonner";
import { FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from 'xlsx';

interface ModernSelectionFlowProps {
  userRole: "teacher" | "officer";
  officerPermission?: "district" | "taluk" | "none";
  isOfficerAuthenticated?: boolean;
  onGenerateReport?: (type: "district" | "taluk" | "school", entityId: string, examName: string) => void;
  onBackButtonClick?: () => void;
  onShowUnfilledSchools?: (examName: string, talukId: string) => void;
  onSelectionChange?: (districtId: string | null, talukId: string | null) => void;
}

const ModernSelectionFlow = ({
  userRole,
  officerPermission = "none",
  isOfficerAuthenticated = false,
  onGenerateReport,
  onBackButtonClick,
    onShowUnfilledSchools,
  onSelectionChange
}: ModernSelectionFlowProps) => {
  // Selection state
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedTalukId, setSelectedTalukId] = useState<string | null>(null);
  const [showExamNameModal, setShowExamNameModal] = useState(false);
  const [pendingReportType, setPendingReportType] = useState<"district" | "taluk" | "school" | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Get exam names from Supabase context
  const { examNames } = useSupabase();
  
  // Notify parent when selections change
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedDistrictId, selectedTalukId);
    }
  }, [selectedDistrictId, selectedTalukId, onSelectionChange]);
  
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
  
  const handleShowUnfilledSchools = async (examName?: string) => {
    if (selectedTalukId && examName) {
      if (onShowUnfilledSchools) {
        // Pass the exam name and taluk ID to the parent component's handler
        onShowUnfilledSchools(examName, selectedTalukId);
        return;
      }
      
      // Otherwise handle it locally
      try {
        toast.info("Fetching unfilled schools data...");
        
        const response = await fetch('https://3klcvnba2ts4f3dguo7r7cts2q0eyplc.lambda-url.us-east-1.on.aws/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taluk_id: selectedTalukId,
            exam_name: examName
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Create workbook and worksheet
          const wb = XLSX.utils.book_new();
          
          // Convert data to worksheet format
          const worksheetData = [];
          
          // Add header row
          worksheetData.push(["Unfilled Schools", "Errored Schools"]);
          
          // Get the maximum length between unfilled and errored schools
          const maxLength = Math.max(
            data.unfilled_schools.length, 
            data.errored_schools.length
          );
          
          // Add data rows
          for (let i = 0; i < maxLength; i++) {
            const unfilled = data.unfilled_schools[i] || '';
            const errored = data.errored_schools[i] || '';
            worksheetData.push([unfilled, errored]);
          }
          
          // Create worksheet
          const ws = XLSX.utils.aoa_to_sheet(worksheetData);
          
          // Set column widths
          const columnWidths = [
            { wch: 60 }, // Unfilled Schools column - wider to accommodate school names
            { wch: 60 }  // Errored Schools column - wider to accommodate school names
          ];
          
          // Apply column widths
          ws['!cols'] = columnWidths;
          
          // Add worksheet to workbook
          XLSX.utils.book_append_sheet(wb, ws, "Unfilled Schools");
          
          // Generate Excel file
          const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          
          // Create blob and download
          const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `schools_report_${examName.replace(/\s+/g, '_')}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
          
          toast.success("Downloaded unfilled schools report");
        } else {
          toast.error("Failed to fetch unfilled schools data");
        }
      } catch (error) {
        console.error('Error fetching unfilled schools:', error);
        toast.error('Failed to fetch unfilled schools');
      }
    } else {
      toast.error("Please select a taluk and exam name");
    }
  };
  
  const handleExamNameSubmit = async (examName: string) => {
    if (pendingReportType === "taluk" && selectedTalukId) {
      try {
        setIsGeneratingReport(true);
        
        // Make the API call to generate taluk report
        const response = await fetch('https://kiqn4rtsxo2syesxxtg7rc332u0xzvlu.lambda-url.us-east-1.on.aws/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taluk_name: "taluk_name",
            exam_name: examName,
            taluk_id: selectedTalukId
          })
        });
        
        if (!response.ok) {
          const errorMsg = `Failed to generate report: ${response.statusText}`;
          console.error(errorMsg);
          toast.error(errorMsg);
          throw new Error(errorMsg);
        }
        
        // Convert the response to a blob for download
        const blob = await response.blob();
        
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary link element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = `Taluk_Report_${examName.replace(/\s+/g, '_')}_${selectedTalukId}.pdf`;
        document.body.appendChild(a);
        
        // Trigger the download
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success(`Taluk report downloaded successfully`);
        
        // Close the modal after successful download
        setShowExamNameModal(false);
      } catch (error) {
        console.error('Error generating taluk report:', error);
      } finally {
        setIsGeneratingReport(false);
      }
    } else {
      setShowExamNameModal(false);
      
      if (pendingReportType === "district" && selectedDistrictId && onGenerateReport) {
        onGenerateReport("district", selectedDistrictId, examName);
      }
      else if (pendingReportType === "taluk" && selectedTalukId && onGenerateReport) {
        onGenerateReport("taluk", selectedTalukId, examName);
      }
    }
    
    setPendingReportType(null);
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  className="border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100 font-medium px-5 py-2.5 shadow-sm"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Schools with Unfilled Marks
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="p-3 w-64">
                  <ExamNameInputContent 
                    onSubmit={handleShowUnfilledSchools}
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
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
        onClose={() => {
          setShowExamNameModal(false);
        }}
        onSubmit={handleExamNameSubmit}
        isLoading={isGeneratingReport}
        loadingText="Generating PDF..."
      />
    </div>
  );
};

export default ModernSelectionFlow; 