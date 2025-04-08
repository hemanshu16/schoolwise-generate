import { useState, useEffect } from "react";
import { useSupabase, School } from "@/lib/context/SupabaseContext";
import { cn } from "@/lib/utils";
import { useFadeAnimation } from "@/utils/animations";
import { FileSpreadsheet, School as SchoolIcon, Search, FileText } from "lucide-react";
import PinAuth from "../auth/PinAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from "@/components/ui/dialog";
import ExamNameInput from "../reports/ExamNameInput";

// These environment variables need to be set in your .env file
const schoolReportUrl = import.meta.env.VITE_PUBLIC_SCHOOL_REPORT;

interface SchoolListProps {
  talukId: string;
  onSelectSchool: (schoolId: string) => void;
  className?: string;
  userRole?: "teacher" | "district_officer" | "taluk_officer";
}

const SchoolList = ({ talukId, onSelectSchool, className, userRole = "teacher" }: SchoolListProps) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [showReportAuth, setShowReportAuth] = useState(false);
  const [showSheetAuth, setShowSheetAuth] = useState(false);
  const [showExamNameModal, setShowExamNameModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatingReportForSchool, setGeneratingReportForSchool] = useState<string | null>(null);
  const animation = useFadeAnimation(true);
  
  const { schools, loading, error, getSchoolsByTaluk } = useSupabase();

  // Fetch schools when talukId changes
  useEffect(() => {
    if (talukId) {
      getSchoolsByTaluk(parseInt(talukId));
    }
  }, [talukId]);

  // Filter schools by search term
  const filteredSchools = schools
    .filter((school) => 
      school.school_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleGenerateReport = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    
    if (userRole === "teacher") {
      setShowReportAuth(true);
    } else {
      // For officer, show exam name dialog directly
      setShowExamNameModal(true);
    }
  };
  const downloadReport = async (sheetId: string, examName: string) => {
    try {
      const school = schools.find(s => s.sheet_id === sheetId);
      const schoolName = school?.school_name.split("_")[1] || "school";
      
      setIsGeneratingReport(true);
      setGeneratingReportForSchool(schoolName);
      
      toast.loading(`Generating report for ${schoolName}...`, {
        id: `report-${sheetId}`,
      });
      
      const response = await fetch(schoolReportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sheet_id: sheetId,
          exam_name: examName
        })
      });

      console.log('Response:', response);

      if (!response.ok) {
        toast.dismiss(`report-${sheetId}`);
        
        try {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          
          try {
            const parsedError = JSON.parse(errorText);
            toast.error(`Error: ${parsedError.error || parsedError.message || 'Unknown error'}`);
          } catch (parseError) {
            toast.error(`Error ${response.status}: ${errorText || response.statusText || 'Bad Request'}`);
          }
        } catch (e) {
          toast.error(`Failed to generate report: ${response.status} ${response.statusText}`);
        }
        return;
      }

      // Get filename from Content-Disposition header if present
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'report.pdf';
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.dismiss(`report-${sheetId}`);
      toast.success(`Report for ${schoolName} generated successfully`);
      
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.dismiss(`report-${sheetId}`);
      toast.error('Failed to download report');
    } finally {
      setIsGeneratingReport(false);
      setGeneratingReportForSchool(null);
    }
  };

  const handleSheetClick = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    
    // For school teachers, show auth dialog
    if (userRole === "teacher") {
      setShowSheetAuth(true);
    } else {
      // For officers, directly open the sheet
      const school = schools.find(s => s.id.toString() === schoolId);
      toast.success(`Opening Google Sheet for ${school?.school_name}`);
      window.open("https://docs.google.com/spreadsheets/d/"+school?.sheet_id, "_blank");
    }
  };

  const handleSheetAuthenticated = () => {
    setShowSheetAuth(false);
    
    const school = schools.find(s => s.id.toString() === selectedSchoolId);
      toast.success(`Opening Google Sheet for ${school?.school_name}`);
      window.open("https://docs.google.com/spreadsheets/d/"+school?.sheet_id, "_blank");
  };

  const handleReportAuthenticated = (providedExamName?: string) => {
    setShowReportAuth(false);
    if (providedExamName && selectedSchoolId) {
      const school = schools.find(s => s.id.toString() === selectedSchoolId);
      downloadReport(school?.sheet_id, providedExamName);
    }
  };
  
  const handleExamNameSubmit = (examName: string) => {
    setShowExamNameModal(false);
    
    if (selectedSchoolId) {
      const school = schools.find(s => s.id.toString() === selectedSchoolId);
      
      if (school) {
        const schoolName = school.school_name.split("_")[1];
        
        // For officer, download the report directly
        if (userRole === 'district_officer' || userRole === 'taluk_officer') {
          downloadReport(school.sheet_id, examName);
          toast.success(`Generating report for ${schoolName} - ${examName}`);
        } else {
          // For teacher, just notify selection (report will be handled elsewhere)
          toast.success(`Generating report for ${schoolName} - ${examName}`);
          onSelectSchool(selectedSchoolId);
        }
      }
    }
  };

  return (
    <div className={cn("w-full", animation, className)}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 sm:mb-6 gap-3 md:gap-4">
        <div className="bg-primary/10 text-primary rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap">
          <SchoolIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> 
          Schools in Selected Taluk
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="relative">
            <input
              type="text"
              placeholder="Search schools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full text-xs sm:text-sm pl-8 sm:pl-10 py-2 sm:py-3 rounded-full border-primary/20 focus:border-primary focus:ring-primary/40 transition-all"
            />
            <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-primary/60 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
      </div>

      {/* Sheet Access Authentication Modal */}
      <Dialog open={showSheetAuth} onOpenChange={setShowSheetAuth}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogTitle className="sr-only">Google Sheet Access</DialogTitle>
          <PinAuth
            entityType="school"
            entityId={selectedSchoolId}
            onAuthenticate={handleSheetAuthenticated}
            authPurpose="sheet"
            correctPin={schools.find(s => s.id.toString() === selectedSchoolId)?.school_name.split("_")[0]}
          />
        </DialogContent>
      </Dialog>

      {/* Report Authentication Modal */}
      <Dialog open={showReportAuth} onOpenChange={setShowReportAuth}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogTitle className="sr-only">School Report Authentication</DialogTitle>
          <PinAuth
            entityType="school"
            entityId={selectedSchoolId}
            onAuthenticate={handleReportAuthenticated}
            authPurpose="report"
            correctPin={schools.find(s => s.id.toString() === selectedSchoolId)?.school_name.split("_")[0]}
          />
        </DialogContent>
      </Dialog>
      
      {/* Exam Name Modal */}
      <ExamNameInput 
        isOpen={showExamNameModal}
        onClose={() => setShowExamNameModal(false)}
        onSubmit={handleExamNameSubmit}
      />

      <div className="overflow-hidden rounded-lg sm:rounded-xl shadow-lg border border-slate-100">
        {loading ? (
          <div className="py-16 sm:py-20 text-center text-muted-foreground flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-primary mb-3 sm:mb-4"></div>
            <span className="text-sm sm:text-base">Loading schools...</span>
          </div>
        ) : error ? (
          <div className="py-16 sm:py-20 text-center text-red-500 text-sm sm:text-base">Error loading schools: {error}</div>
        ) : (
          <div className="overflow-x-auto">
            {/* Mobile view for smaller screens */}
            <div className="sm:hidden">
              {filteredSchools.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <SchoolIcon className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm">No schools found</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredSchools.map((school) => (
                    <div key={school.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start mb-3">
                        <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                          <SchoolIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 break-words">
                            {school.school_name.split("_")[1]}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 justify-start">
                        <button
                          onClick={() => handleSheetClick(school.id.toString())}
                          className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors bg-primary/5 px-2 py-1 rounded-full text-xs"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>View Sheet</span>
                        </button>
                        
                        <button
                          onClick={() => handleGenerateReport(school.id.toString())}
                          disabled={isGeneratingReport}
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors",
                            isGeneratingReport && generatingReportForSchool === school.school_name.split("_")[1]
                              ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                              : "bg-primary text-white hover:bg-primary/90"
                          )}
                        >
                          {isGeneratingReport && generatingReportForSchool === school.school_name.split("_")[1] ? (
                            <>
                              <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                              <span>Loading...</span>
                            </>
                          ) : (
                            <>
                              <FileText className="h-3.5 w-3.5" />
                              <span>Report</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Table view for larger screens */}
            <table className="w-full table-fixed border-collapse bg-white hidden sm:table min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[60%]">School Name</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[20%]">Google Sheet</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[20%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchools.map((school) => (
                  <tr 
                    key={school.id} 
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                          <SchoolIcon className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs md:text-sm font-medium text-slate-900 break-words">
                            {school.school_name.split("_")[1]}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleSheetClick(school.id.toString())}
                        className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors bg-primary/5 px-2 py-1 rounded-full text-xs"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Access Sheet</span>
                      </button>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleGenerateReport(school.id.toString())}
                        disabled={isGeneratingReport}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors",
                          isGeneratingReport && generatingReportForSchool === school.school_name.split("_")[1]
                            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                            : "bg-primary text-white hover:bg-primary/90"
                        )}
                      >
                        {isGeneratingReport && generatingReportForSchool === school.school_name.split("_")[1] ? (
                          <>
                            <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                            <span>Loading...</span>
                          </>
                        ) : (
                          <>
                            <FileText className="h-3.5 w-3.5" />
                            <span>Report</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSchools.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 md:px-6 py-8 md:py-10 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <SchoolIcon className="h-8 w-8 md:h-10 md:w-10 text-slate-300 mb-2 md:mb-3" />
                        <p className="text-xs md:text-sm">No schools found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolList;
