import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import Container from "@/components/layout/Container";
import SelectionBadges from "@/components/selection/SelectionBadges";
import ReportView from "@/components/reports/ReportView";
import { cn } from "@/lib/utils";
import { OfficerPermission } from "@/components/auth/OfficerAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import RoleSelectionView from "@/components/selection/RoleSelectionView";
import SelectionFlow from "@/components/selection/SelectionFlow";
import AuthenticationModals from "@/components/auth/AuthenticationModals";
import { districts, taluks, schools } from "@/utils/mock-data";

const Index = () => {
  // User role state
  const [userRole, setUserRole] = useState<"teacher" | "officer" | null>(null);
  const [officerPermission, setOfficerPermission] = useState<OfficerPermission>("none");
  const [isOfficerAuthenticated, setIsOfficerAuthenticated] = useState(false);
  
  // Selection state
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedTalukId, setSelectedTalukId] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [examName, setExamName] = useState<string>("");
  
  // Authentication and view state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAuthEntity, setCurrentAuthEntity] = useState<"district" | "taluk" | "school" | null>(null);
  
  // Exam name input modal state
  const [showExamNameModal, setShowExamNameModal] = useState(false);
  const [pendingReportType, setPendingReportType] = useState<"district" | "taluk" | null>(null);
  
  // Unfilled schools modal state
  const [showUnfilledSchoolsModal, setShowUnfilledSchoolsModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Handlers
  const handleRoleSelect = (role: "teacher" | "officer") => {
    setUserRole(role);
    setSelectedDistrictId(null);
    setSelectedTalukId(null);
    setSelectedSchoolId(null);
    setIsAuthenticated(false);
    setCurrentAuthEntity(null);
    setIsOfficerAuthenticated(false);
    
    // If officer, show auth dialog
    if (role === "officer") {
      setShowAuthModal(true);
      setCurrentAuthEntity(null);
    }
  };
  
  const handleOfficerAuthenticate = (permission: OfficerPermission) => {
    setOfficerPermission(permission);
    setShowAuthModal(false);
    setIsOfficerAuthenticated(permission !== "none");
    
    // If authentication failed, reset to role selection
    if (permission === "none") {
      setUserRole(null);
    }
  };
  
  const handleGenerateReport = (type: "district" | "taluk" | "school", entityId: string, selectedExamName: string) => {
    setCurrentAuthEntity(type);
    setExamName(selectedExamName);
    setIsAuthenticated(true);
    
    if (type === "school") {
      setSelectedSchoolId(entityId);
    }
  };
  
  const handleShowUnfilledSchools = (selectedExamName: string) => {
    setExamName(selectedExamName);
    setShowUnfilledSchoolsModal(true);
  };
  
  const handleDownloadUnfilledSchools = (selectedExamName: string) => {
    // Start the download process with the selected exam name
    setIsDownloading(true);
    setExamName(selectedExamName);
    
    // Simulate PDF generation and download
    setTimeout(() => {
      // Get entity names for the toast message
      const selectedDistrictName = selectedDistrictId 
        ? districts.find(d => d.id === selectedDistrictId)?.name || "Unknown"
        : "Unknown";
        
      const selectedTalukName = selectedTalukId
        ? taluks.find(t => t.id === selectedTalukId)?.name || "Unknown"
        : "Unknown";
        
      const examNameFormatted = selectedExamName.replace(/\s+/g, "_");
      
      // Create PDF content
      const pdfContent = `Unfilled Schools Report
District: ${selectedDistrictName}
Taluk: ${selectedTalukName}
Exam: ${selectedExamName}

Schools with unfilled marks:
1. Govt High School Mahadevapura
2. Govt Primary School Vignan Nagar
3. St. Mary's School
4. Model Public School`;
      
      // Create a Blob and download it with PDF mimetype
      const blob = new Blob([pdfContent], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `unfilled_schools_${selectedTalukName}_${examNameFormatted}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsDownloading(false);
      setShowUnfilledSchoolsModal(false);
      
      toast.success("Downloaded PDF list of schools with unfilled exam marks", {
        description: `${examNameFormatted} - ${selectedTalukName}, ${selectedDistrictName}`
      });
    }, 1500);
  };
  
  const handleAuthenticate = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };
  
  const handleReset = () => {
    setUserRole(null);
    setOfficerPermission("none");
    setSelectedDistrictId(null);
    setSelectedTalukId(null);
    setSelectedSchoolId(null);
    setShowAuthModal(false);
    setIsAuthenticated(false);
    setCurrentAuthEntity(null);
    setExamName("");
    setIsOfficerAuthenticated(false);
    setShowUnfilledSchoolsModal(false);
    setShowExamNameModal(false);
    setPendingReportType(null);
  };

  // Handle going back to role selection
  const handleBackToRoleSelection = () => {
    handleReset();
  };
  
  // Handle dialog close - reset to role selection if officer not authenticated yet
  const handleDialogOpenChange = (open: boolean) => {
    setShowAuthModal(open);
    if (!open && userRole === "officer" && !isOfficerAuthenticated) {
      setUserRole(null);
    }
  };
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        <Container className="py-8">
          {/* Role Selector is always shown first */}
          {!userRole ? (
            <RoleSelectionView onSelectRole={handleRoleSelect} />
          ) : (
            <>
              {/* Back button */}
              {userRole && (
                <div className="mb-6">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleBackToRoleSelection} 
                    className="border border-gray-300"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Role Selection
                  </Button>
                </div>
              )}

              {/* Selection badges */}
              <SelectionBadges 
                userRole={userRole}
                selectedDistrictId={selectedDistrictId}
                selectedTalukId={selectedTalukId}
                selectedSchoolId={selectedSchoolId}
                examName={examName}
                isAuthenticated={isAuthenticated}
                onReset={handleReset}
              />

              {/* Content area */}
              <div className={cn(
                "rounded-lg p-6 max-w-2xl mx-auto border shadow-sm",
                isAuthenticated ? "md:max-w-4xl" : ""
              )}>
                {/* Authentication flows */}
                {!isAuthenticated && userRole && (
                  <SelectionFlow 
                    userRole={userRole}
                    officerPermission={officerPermission}
                    isOfficerAuthenticated={isOfficerAuthenticated}
                    onGenerateReport={handleGenerateReport}
                    onShowUnfilledSchools={handleShowUnfilledSchools}
                  />
                )}
                
                {/* Report View */}
                {isAuthenticated && currentAuthEntity && (
                  <ReportView 
                    type={currentAuthEntity} 
                    name={
                      currentAuthEntity === "district" 
                        ? districts.find(d => d.id === selectedDistrictId)?.name || "" 
                        : currentAuthEntity === "taluk" 
                          ? taluks.find(t => t.id === selectedTalukId)?.name || "" 
                          : schools.find(s => s.id === selectedSchoolId)?.name || ""
                    }
                    examName={examName}
                  />
                )}
              </div>
            </>
          )}
        </Container>
      </main>
      
      {/* Authentication and other modals */}
      <AuthenticationModals 
        showAuthModal={showAuthModal}
        showExamNameModal={showExamNameModal}
        showUnfilledSchoolsModal={showUnfilledSchoolsModal}
        currentAuthEntity={currentAuthEntity}
        entityId={
          currentAuthEntity === "district" 
            ? selectedDistrictId 
            : currentAuthEntity === "taluk" 
              ? selectedTalukId 
              : selectedSchoolId
        }
        userRole={userRole}
        pendingReportType={pendingReportType}
        isDownloading={isDownloading}
        onAuthDialogChange={handleDialogOpenChange}
        onExamNameModalChange={setShowExamNameModal}
        onUnfilledSchoolsModalChange={setShowUnfilledSchoolsModal}
        onOfficerAuthenticate={handleOfficerAuthenticate}
        onAuthenticate={handleAuthenticate}
        onExamNameSubmit={(selectedExamName) => {
          setExamName(selectedExamName);
          handleGenerateReport(pendingReportType || "school", 
            pendingReportType === "district" 
              ? selectedDistrictId || "" 
              : pendingReportType === "taluk" 
                ? selectedTalukId || "" 
                : selectedSchoolId || "",
            selectedExamName
          );
        }}
        onUnfilledSchoolsExamNameSubmit={handleDownloadUnfilledSchools}
      />
    </div>
  );
};

export default Index;
