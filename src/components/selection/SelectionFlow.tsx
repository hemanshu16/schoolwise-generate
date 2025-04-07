import { useState, useEffect } from "react";
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
import * as XLSX from 'xlsx';

interface SelectionFlowProps {
  userRole: "teacher" | "officer";
  officerPermission: "district" | "taluk" | "none";
  isOfficerAuthenticated: boolean;
  onGenerateReport: (type: "district" | "taluk" | "school", entityId: string, examName: string) => void;
  onShowUnfilledSchools: (examName: string, talukId?: string) => void;
  onSelectionChange?: (districtId: string | null, talukId: string | null) => void;
}

const SelectionFlow = ({
  userRole,
  officerPermission,
  isOfficerAuthenticated,
  onGenerateReport,
  onShowUnfilledSchools,
  onSelectionChange
}: SelectionFlowProps) => {
  const { districts, refreshDistricts, loading, taluks ,getTalukById } = useSupabase();

  // Refresh districts if needed
  useEffect(() => {
    if (districts.length === 0 && !loading) {
      refreshDistricts();
    }
    
  
  }, []);

  // Selection state
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedTalukId, setSelectedTalukId] = useState<string | null>(null);
  const [showExamNameModal, setShowExamNameModal] = useState(false);
  // Update the type to include "school"
  const [pendingReportType, setPendingReportType] = useState<"district" | "taluk" | "unfilledSchools"| "school" | null>(null);
  const [examName, setExamName] = useState<string>("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isTalukReportLoading, setIsTalukReportLoading] = useState(false);
  const [isUnfilledSchoolsLoading, setIsUnfilledSchoolsLoading] = useState(false);
  const [isDistrictReportLoading, setIsDistrictReportLoading] = useState(false);

  // Add download status state
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'generating' | 'downloading' | 'complete'>('idle');

  // Determine current selection step
  const showTalukSelector = !!selectedDistrictId;
  const showSchoolList = !!selectedTalukId;

  // Delayed mounting for UI elements
  const mountTalukSelector = useDelayedMount(Boolean(showTalukSelector));
  const mountSchoolList = useDelayedMount(Boolean(showSchoolList));

  // Helpers for entity names
  const selectedDistrict = districts.find(d => d.id.toString() === selectedDistrictId);

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
      // Don't set loading state yet - wait until an exam is selected
      setPendingReportType("district");
      setShowExamNameModal(true);
    }
  };

  const handleGenerateTalukReport = () => {
    if (isOfficerAuthenticated) {
      // Don't set loading state yet - wait until an exam is selected
      setPendingReportType("taluk");
      setShowExamNameModal(true);
    }
  };

  const handleGenerateUnfilledSchools = () => {
    if (isOfficerAuthenticated) {
      // Don't set loading state yet - wait until an exam is selected
      setPendingReportType("unfilledSchools");
      setShowExamNameModal(true);
    }
  };

  const handleDownloadUnfilledSchools = async (selectedExamName: string, talukId?: string) => {
    try {
      // Loading state is already set in handleExamNameSubmit
      toast.info(`Fetching unfilled schools data for taluk ${talukId} and exam ${selectedExamName}...`);
      
      const requestBody = {
        taluk_id: talukId,
        exam_name: selectedExamName
      };
      
      console.log("Request body:", requestBody);
      
      const response = await fetch('https://3klcvnba2ts4f3dguo7r7cts2q0eyplc.lambda-url.us-east-1.on.aws/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
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
          { wch: 100 }, // Unfilled Schools column - wider to accommodate school names
          { wch: 100 }  // Errored Schools column - wider to accommodate school names
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
        a.download = `unfilled_schools_${selectedExamName.replace(/\s+/g, '_')}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast.success("Downloaded unfilled schools report");
      } else {
        toast.error("Failed to fetch unfilled schools data");
      }
    } catch (error) {
      console.error('Error fetching unfilled schools:', error);
      toast.error('Failed to fetch unfilled schools');
    } finally {
      // Ensure we always reset loading state regardless of success or failure
      setIsUnfilledSchoolsLoading(false);
      setDownloadStatus('idle');
    }
  };

  const handleExamNameSubmit = async (selectedExamName: string) => {
    // Don't close modal until download is complete
    // setShowExamNameModal(false);
    setExamName(selectedExamName);

    if (pendingReportType === "taluk" && selectedTalukId) {
      try {
        setIsTalukReportLoading(true);
        setDownloadStatus('generating');

        // We'll just use the ID directly since we have it
        // The backend should be able to resolve the taluk name
        const talukId = selectedTalukId;
        const taluk = await getTalukById(Number(talukId));
        // Make the API call to generate taluk report
        const response = await fetch('https://kiqn4rtsxo2syesxxtg7rc332u0xzvlu.lambda-url.us-east-1.on.aws/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taluk_name: taluk.taluk, // Using actual taluk name from the taluk object
            exam_name: selectedExamName,
            taluk_id: talukId
          })
        });

        if (!response.ok) {
          // Handle different types of errors based on status code
          if (response.status === 404) {
            throw new Error("Report generation API endpoint not found");
          } else if (response.status === 400) {
            const errorData = await response.json();
            throw new Error(`Bad request: ${errorData.message || 'Invalid parameters'}`);
          } else {
            throw new Error(`Failed to generate report: ${response.statusText}`);
          }
        }

        // Get the content type to verify we're getting a PDF
        const contentType = response.headers.get('content-type');

        // Basic verification that we're getting the expected file type
        if (contentType && (contentType.includes('application/pdf') || contentType.includes('application/octet-stream'))) {
          // Convert the response to a blob
          const blob = await response.blob();

          // Create a URL for the blob
          const url = window.URL.createObjectURL(blob);

          // Create a temporary link element to trigger the download
          const a = document.createElement('a');
          a.href = url;
          a.download = `Taluk_Report_${selectedExamName.replace(/\s+/g, '_')}_${talukId}.pdf`;
          document.body.appendChild(a);

          // Trigger the download
          a.click();

          // Clean up
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          toast.success(`Taluk report downloaded successfully`);

          // Now close the modal after successful download
          setShowExamNameModal(false);
        } else {
          // If we didn't get a PDF, try to handle it as a JSON response with an error
          try {
            const errorData = await response.json();
            throw new Error(`Failed to generate PDF: ${errorData.message || 'Unknown error'}`);
          } catch (jsonError) {
            // If we can't parse as JSON either, throw a generic error
            throw new Error("Received an unexpected response format from the server");
          }
        }
      } catch (error) {
        console.error('Error generating taluk report:', error);
        // More specific error message to help with debugging
        if (error instanceof Error) {
          toast.error(`Failed to generate taluk report: ${error.message}`);
        } else {
          toast.error('Failed to generate taluk report');
        }
      } finally {
        setIsTalukReportLoading(false);
        setDownloadStatus('idle');
      }
    } else if (pendingReportType === "district" && selectedDistrictId) {
      setShowExamNameModal(false);
      setIsDistrictReportLoading(true);
      setDownloadStatus('generating');
      
      try {
        const response = await fetch('https://oukrxtnccd5zk6idd3wxardolq0hkoir.lambda-url.us-east-1.on.aws/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            district_id: selectedDistrictId,
            test_name: selectedExamName
          })
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Report generation API endpoint not found");
          } else if (response.status === 400) {
            const errorData = await response.json();
            throw new Error(`Bad request: ${errorData.message || 'Invalid parameters'}`);
          } else {
            throw new Error(`Failed to generate report: ${response.statusText}`);
          }
        }

        // Get the content type to verify we're getting a PDF
        const contentType = response.headers.get('content-type');

        // Basic verification that we're getting the expected file type
        if (contentType && (contentType.includes('application/pdf') || contentType.includes('application/octet-stream'))) {
          // Convert the response to a blob
          const blob = await response.blob();

          // Create a URL for the blob
          const url = window.URL.createObjectURL(blob);

          // Create a temporary link element to trigger the download
          const a = document.createElement('a');
          a.href = url;
          a.download = `District_Report_${selectedExamName.replace(/\s+/g, '_')}_${selectedDistrictId}.pdf`;
          document.body.appendChild(a);

          // Trigger the download
          a.click();

          // Clean up
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          toast.success(`District report downloaded successfully`);
        } else {
          // If we didn't get a PDF, try to handle it as a JSON response with an error
          try {
            const errorData = await response.json();
            throw new Error(`Failed to generate PDF: ${errorData.message || 'Unknown error'}`);
          } catch (jsonError) {
            // If we can't parse as JSON either, throw a generic error
            throw new Error("Received an unexpected response format from the server");
          }
        }
      } catch (error) {
        console.error('Error generating district report:', error);
        if (error instanceof Error) {
          toast.error(`Failed to generate district report: ${error.message}`);
        } else {
          toast.error('Failed to generate district report');
        }
      } finally {
        setIsDistrictReportLoading(false);
        setDownloadStatus('idle');
      }
    } else if (pendingReportType === "school" && selectedSchoolId) {
      setShowExamNameModal(false);
      onGenerateReport("school", selectedSchoolId, selectedExamName);
    }
    else if (pendingReportType === "unfilledSchools" && selectedTalukId) {
      setShowExamNameModal(false);
      setIsUnfilledSchoolsLoading(true);
      setDownloadStatus('generating');
      try {
        await handleDownloadUnfilledSchools(selectedExamName, selectedTalukId);
      } catch (error) {
        console.error('Error generating Unfilled Schools list:', error);
        // More specific error message to help with debugging
        if (error instanceof Error) {
          toast.error(`Failed to generate Unfilled Schools list: ${error.message}`);
        } else {
          toast.error('Failed to generate Unfilled Schools list');
        }
      }
    }

    setPendingReportType(null);
  };

  // Fix the handleSchoolSelect function to store the schoolId for later use
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    // const school = schools.find(s => s.id === schoolId);
    // if (school) {
    //   // Don't set loading state yet - wait until an exam is selected
    //   setShowExamNameModal(true);
    //   setPendingReportType("school");
    //   // The actual report generation will happen when exam name is selected
    //   // and handleExamNameSubmit is called
    // }
  };

  // Helper function to get decorative step number
  const getStepNumber = (step: number) => {
    return (
      <div className="hidden sm:flex flex-shrink-0 items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-full bg-primary/10 text-primary font-semibold text-sm md:text-base">
        {step}
      </div>
    );
  };

  // Notify parent when selections change
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedDistrictId, selectedTalukId);
    }
  }, [selectedDistrictId, selectedTalukId, onSelectionChange]);

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
                disabled={isTalukReportLoading || isUnfilledSchoolsLoading || isDistrictReportLoading}
              >
                {isDistrictReportLoading ? (
                  <>
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin mr-1.5" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-3.5 w-3.5" />
                    District Report
                  </>
                )}
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
                  disabled={isTalukReportLoading || isUnfilledSchoolsLoading}
                >
                  {isTalukReportLoading ? (
                    <>
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin mr-1.5" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-3.5 w-3.5" />
                      Taluk Report
                    </>
                  )}
                </button>

                <button
                  onClick={handleGenerateUnfilledSchools}
                  className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-50 text-amber-700 border border-amber-200 text-sm rounded-md hover:bg-amber-100 transition-all"
                  disabled={isTalukReportLoading || isUnfilledSchoolsLoading}
                >
                  {isUnfilledSchoolsLoading ? (
                    <>
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-amber-300 border-t-amber-700 animate-spin mr-1.5" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Unfilled Marks
                    </>
                  )}
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
        onOpenChange={(open) => {
          setShowExamNameModal(open);
        }}
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
            onClose={() => {
              setShowExamNameModal(false);
            }}
            onSubmit={handleExamNameSubmit}
            isLoading={isTalukReportLoading}
            loadingText="Processing..."
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SelectionFlow;
