import { useState } from "react";
import ModernSelectionFlow from "../components/selection/ModernSelectionFlow";
import { toast } from "sonner";

const ModernSelectionPage = () => {
  const [userRole, setUserRole] = useState<"teacher" | "officer">("teacher");
  
  const handleGenerateReport = (
    type: "district" | "taluk" | "school", 
    entityId: string, 
    examName: string
  ) => {
    toast.success(`Generating ${type} report for ID ${entityId} and exam ${examName}`);
  };
  
  const handleBackButtonClick = () => {
    // This would navigate back to the role selection page in a real app
    toast.info("Would navigate back to role selection");
  };
  
  const handleShowUnfilledSchools = (examName: string) => {
    toast.info(`Showing unfilled schools for exam: ${examName}`);
  };
  
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-2">
            School Management Dashboard
          </h1>
          <p className="text-center text-slate-600 max-w-2xl mx-auto">
            Select a district and taluk to view and manage schools or generate reports
          </p>
        </header>
        
        {/* Toggle between teacher/officer for demo purposes */}
        <div className="flex justify-center mb-8 gap-4">
          <button
            onClick={() => setUserRole("teacher")}
            className={`px-5 py-3 rounded-lg text-sm font-medium transition-colors border ${
              userRole === "teacher" 
                ? "bg-slate-800 text-white border-slate-800 shadow-sm" 
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Teacher View
          </button>
          <button
            onClick={() => setUserRole("officer")}
            className={`px-5 py-3 rounded-lg text-sm font-medium transition-colors border ${
              userRole === "officer" 
                ? "bg-slate-800 text-white border-slate-800 shadow-sm" 
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Officer View
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <ModernSelectionFlow 
            userRole={userRole}
            officerPermission="district"
            isOfficerAuthenticated={true}
            onGenerateReport={handleGenerateReport}
            onBackButtonClick={handleBackButtonClick}
            onShowUnfilledSchools={handleShowUnfilledSchools}
          />
        </div>
      </div>
    </div>
  );
};

export default ModernSelectionPage; 