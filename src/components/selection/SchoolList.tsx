
import { useState } from "react";
import { schools } from "@/utils/mock-data";
import { cn } from "@/lib/utils";
import { useFadeAnimation } from "@/utils/animations";
import { FileSpreadsheet, School } from "lucide-react";
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

interface SchoolListProps {
  talukId: string;
  onSelectSchool: (schoolId: string) => void;
  className?: string;
}

const SchoolList = ({ talukId, onSelectSchool, className }: SchoolListProps) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [showReportAuth, setShowReportAuth] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const animation = useFadeAnimation(true);

  // Filter schools by taluk and search term
  const filteredSchools = schools
    .filter((school) => school.talukId === talukId)
    .filter((school) => 
      school.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleGenerateReport = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setShowReportAuth(true);
  };

  const handleSheetClick = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    
    // Get the school name for the toast message
    const school = schools.find(s => s.id === selectedSchoolId);
    toast.success(`Opening Google Sheet for ${school?.name}`);
    
    // In a real app, you would redirect to the actual Google Sheet URL
    window.open("https://docs.google.com/spreadsheets/create", "_blank");
  };

  const handleReportAuthenticated = () => {
    setShowReportAuth(false);
    if (selectedSchoolId) {
      onSelectSchool(selectedSchoolId);
    }
  };

  return (
    <div className={cn("w-full", animation, className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="mb-2 text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <School className="h-3.5 w-3.5" /> Schools in Selected Taluk
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

      {/* Report Authentication Modal */}
      <Dialog open={showReportAuth} onOpenChange={setShowReportAuth}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="sr-only">School Report Authentication</DialogTitle>
          <PinAuth
            entityType="school"
            entityId={selectedSchoolId}
            onAuthenticate={handleReportAuthenticated}
            authPurpose="report"
            requireExamName={true}
          />
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
          <thead>
            <tr className="bg-muted/30">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">School Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Google Sheet</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchools.map((school, index) => (
              <tr 
                key={school.id} 
                className={cn(
                  "border-t border-border/20 hover:bg-muted/20 transition-colors",
                )}
              >
                <td className="px-4 py-3 font-medium">{school.name}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleSheetClick(school.id)}
                    className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="underline underline-offset-2">Access Google Sheet</span>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleGenerateReport(school.id)}
                    className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-sm font-medium transition-colors"
                  >
                    Generate Report
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
      </div>
    </div>
  );
};

export default SchoolList;
