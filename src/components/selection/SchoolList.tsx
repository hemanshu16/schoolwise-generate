import { useState, useEffect } from "react";
import { useSupabase, School } from "@/lib/context/SupabaseContext";
import { cn } from "@/lib/utils";
import { useFadeAnimation } from "@/utils/animations";
import { FileSpreadsheet, School as SchoolIcon } from "lucide-react";
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
  userRole?: "teacher" | "officer";
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
        if (userRole === 'officer') {
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
      <div className="flex items-center justify-between mb-4">
        <div className="mb-2 text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <SchoolIcon className="h-3.5 w-3.5" /> Schools in Selected Taluk
        </div>
        
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full text-sm"
          />
        </div>
      </div>

      {/* Sheet Access Authentication Modal */}
      <Dialog open={showSheetAuth} onOpenChange={setShowSheetAuth}>
        <DialogContent className="sm:max-w-md">
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
        <DialogContent className="sm:max-w-md">
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
      <Dialog open={showExamNameModal} onOpenChange={setShowExamNameModal}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Select Exam</DialogTitle>
          <ExamNameInput onSubmit={handleExamNameSubmit} />
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading schools...</div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">Error loading schools: {error}</div>
        ) : (
          <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">School Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Google Sheet</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchools.map((school) => (
                <tr 
                  key={school.id} 
                  className={cn(
                    "border-t border-border/20 hover:bg-muted/20 transition-colors",
                  )}
                >
                  <td className="px-4 py-3 font-medium">{school.school_name.split("_")[1]}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleSheetClick(school.id.toString())}
                      className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span className="underline underline-offset-2">Access Google Sheet</span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleGenerateReport(school.id.toString())}
                      disabled={isGeneratingReport}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                        isGeneratingReport && generatingReportForSchool === school.school_name.split("_")[1]
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "bg-primary/10 text-primary hover:bg-primary/20"
                      )}
                    >
                      {isGeneratingReport && generatingReportForSchool === school.school_name.split("_")[1]
                        ? "Generating..."
                        : "Generate Report"}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSchools.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                    No schools found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SchoolList;
