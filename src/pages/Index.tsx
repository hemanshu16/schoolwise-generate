import { useState, useEffect } from "react";
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
import { schools } from "@/utils/mock-data";
import { useSupabase } from "@/lib/context/SupabaseContext";
import { District, Taluk } from "@/lib/context/SupabaseContext";
import * as XLSX from 'xlsx';

const Index = () => {
  const { districts, taluks, refreshDistricts, loading } = useSupabase();
  
  // Refresh districts if needed
  useEffect(() => {
    if (districts.length === 0 && !loading) {
      refreshDistricts();
    }
  }, [districts, refreshDistricts, loading]);
  
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
  
  // Helper functions to find entities
  const findDistrictById = (id: string | null): District | undefined => {
    if (!id) return undefined;
    return districts.find(d => d.id.toString() === id);
  };
  
  const findTalukById = (id: string | null): Taluk | undefined => {
    if (!id) return undefined;
    return taluks.find(t => t.id.toString() === id);
  };
  
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
  
  const handleShowUnfilledSchools = (selectedExamName: string, talukId?: string) => {
    if (talukId) {
      setSelectedTalukId(talukId);
    }
    
    setExamName(selectedExamName);
    setPendingReportType("taluk");
    setShowUnfilledSchoolsModal(true);
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
        <Container className="py-4 sm:py-6 md:py-8">
          {/* Role Selector is always shown first */}
          {!userRole ? (
            <RoleSelectionView onSelectRole={handleRoleSelect} />
          ) : (
            <>
              {/* Back button */}
              {userRole && (
                <div className="mb-4 sm:mb-6">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleBackToRoleSelection} 
                    className="border border-gray-300 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
                "rounded-lg p-3 sm:p-4 md:p-6 mx-auto border shadow-sm",
                "mt-4 sm:mt-6",
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
                    onSelectionChange={(districtId, talukId) => {
                      if (districtId) setSelectedDistrictId(districtId);
                      if (talukId) setSelectedTalukId(talukId);
                    }}
                  />
                )}
                
                {/* Report View */}
                {isAuthenticated && currentAuthEntity && (
                  <ReportView 
                    type={currentAuthEntity} 
                    name={
                      currentAuthEntity === "district" 
                        ? findDistrictById(selectedDistrictId)?.district || "" 
                        : currentAuthEntity === "taluk" 
                          ? findTalukById(selectedTalukId)?.taluk || "" 
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
        selectedTalukId={selectedTalukId}
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
      />
    </div>
  );
};

export default Index;
