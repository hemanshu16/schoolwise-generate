
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import Container from "@/components/layout/Container";
import DistrictSelector from "@/components/selection/DistrictSelector";
import TalukaSelector from "@/components/selection/TalukaSelector";
import SchoolList from "@/components/selection/SchoolList";
import SelectionBadge from "@/components/ui/SelectionBadge";
import PinAuth from "@/components/auth/PinAuth";
import ReportView from "@/components/reports/ReportView";
import { districts, schools, talukas } from "@/utils/mock-data";
import { cn } from "@/lib/utils";
import { useDelayedMount } from "@/utils/animations";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import RoleSelector from "@/components/selection/RoleSelector";
import OfficerAuth, { OfficerPermission } from "@/components/auth/OfficerAuth";
import { Button } from "@/components/ui/button";

const Index = () => {
  // User role state
  const [userRole, setUserRole] = useState<"teacher" | "officer" | null>(null);
  const [officerPermission, setOfficerPermission] = useState<OfficerPermission>("none");
  const [isOfficerAuthenticated, setIsOfficerAuthenticated] = useState(false);
  
  // Selection state
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedTalukaId, setSelectedTalukaId] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [examName, setExamName] = useState<string>("");
  
  // Authentication and view state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAuthEntity, setCurrentAuthEntity] = useState<"district" | "taluka" | "school" | null>(null);
  
  // Helpers for entity names
  const selectedDistrict = districts.find(d => d.id === selectedDistrictId);
  const selectedTaluka = talukas.find(t => t.id === selectedTalukaId);
  const selectedSchool = schools.find(s => s.id === selectedSchoolId);
  
  // Determine current selection step
  const showTalukaSelector = !!selectedDistrictId;
  const showSchoolList = !!selectedTalukaId;
  
  // Delayed mounting for UI elements - explicitly convert to boolean
  const mountTalukaSelector = useDelayedMount(Boolean(showTalukaSelector));
  const mountSchoolList = useDelayedMount(Boolean(showSchoolList));
  
  // Handlers
  const handleRoleSelect = (role: "teacher" | "officer") => {
    setUserRole(role);
    setSelectedDistrictId(null);
    setSelectedTalukaId(null);
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
  };
  
  const handleDistrictSelect = (districtId: string) => {
    setSelectedDistrictId(districtId);
    setSelectedTalukaId(null);
    setSelectedSchoolId(null);
    setIsAuthenticated(false);
    setCurrentAuthEntity(null);
  };
  
  const handleTalukaSelect = (talukaId: string) => {
    setSelectedTalukaId(talukaId);
    setSelectedSchoolId(null);
    setIsAuthenticated(false);
    setCurrentAuthEntity(null);
  };
  
  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setIsAuthenticated(true);
  };
  
  const handleGenerateDistrictReport = () => {
    if (isOfficerAuthenticated) {
      setIsAuthenticated(true);
      setCurrentAuthEntity("district");
    } else {
      setShowAuthModal(true);
      setCurrentAuthEntity("district");
    }
  };
  
  const handleGenerateTalukaReport = () => {
    if (isOfficerAuthenticated) {
      setIsAuthenticated(true);
      setCurrentAuthEntity("taluka");
    } else {
      setShowAuthModal(true);
      setCurrentAuthEntity("taluka");
    }
  };
  
  const handleAuthenticate = (providedExamName?: string) => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
    if (providedExamName) {
      setExamName(providedExamName);
    }
  };
  
  const handleReset = () => {
    setUserRole(null);
    setOfficerPermission("none");
    setSelectedDistrictId(null);
    setSelectedTalukaId(null);
    setSelectedSchoolId(null);
    setShowAuthModal(false);
    setIsAuthenticated(false);
    setCurrentAuthEntity(null);
    setExamName("");
    setIsOfficerAuthenticated(false);
  };

  // Handle going back to role selection
  const handleBackToRoleSelection = () => {
    handleReset();
  };

  // Determine if report generation buttons should be shown
  const showDistrictReportButton = userRole === "officer" && officerPermission === "district" && selectedDistrictId && !selectedTalukaId;
  const showTalukaReportButton = userRole === "officer" && (officerPermission === "district" || officerPermission === "taluka") && selectedTalukaId;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        <Container className="py-8">
          {/* Role Selector is always shown first */}
          {!userRole ? (
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-3xl font-semibold text-center mb-8">Select Your Role</h2>
              <RoleSelector onSelectRole={handleRoleSelect} />
            </div>
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
              {(selectedDistrictId || selectedTalukaId || selectedSchoolId) && (
                <div className="flex flex-wrap gap-2 mb-8 justify-center animate-fade-in">
                  {userRole && (
                    <SelectionBadge 
                      label="Role"
                      value={userRole === "teacher" ? "School Teacher" : "Education Officer"}
                      isActive={true}
                    />
                  )}
                  
                  {selectedDistrictId && (
                    <SelectionBadge 
                      label="District"
                      value={selectedDistrict?.name}
                      isActive={true}
                    />
                  )}
                  
                  {selectedTalukaId && (
                    <SelectionBadge 
                      label="Taluka"
                      value={selectedTaluka?.name}
                      isActive={true}
                    />
                  )}
                  
                  {selectedSchoolId && isAuthenticated && (
                    <SelectionBadge 
                      label="School"
                      value={selectedSchool?.name}
                      isActive={true}
                    />
                  )}

                  {examName && (
                    <SelectionBadge 
                      label="Exam"
                      value={examName}
                      isActive={true}
                    />
                  )}
                  
                  <button 
                    onClick={handleReset}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors ml-2"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Content area */}
              <div className={cn(
                "rounded-lg p-6 max-w-2xl mx-auto border shadow-sm",
                isAuthenticated ? "md:max-w-4xl" : ""
              )}>
                {/* Authentication flows */}
                {!isAuthenticated && userRole && (
                  <div className="space-y-8">
                    {/* Step 1: District Selection */}
                    <div className={cn("selection-step", selectedDistrictId ? "mb-8" : "")}>
                      <DistrictSelector 
                        onSelect={handleDistrictSelect} 
                        selectedDistrictId={selectedDistrictId}
                      />
                      
                      {showDistrictReportButton && (
                        <div className="mt-4 flex justify-center">
                          <button
                            onClick={handleGenerateDistrictReport}
                            className="py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                          >
                            Generate District Report
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Step 2: Taluka Selection */}
                    {mountTalukaSelector && selectedDistrictId && (
                      <div className={cn("selection-step", selectedTalukaId ? "mb-8" : "")}>
                        <TalukaSelector
                          districtId={selectedDistrictId}
                          onSelect={handleTalukaSelect}
                          selectedTalukaId={selectedTalukaId}
                        />
                        
                        {showTalukaReportButton && (
                          <div className="mt-4 flex justify-center">
                            <button
                              onClick={handleGenerateTalukaReport}
                              className="py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                            >
                              Generate Taluka Report
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Step 3: School List */}
                    {mountSchoolList && selectedTalukaId && (
                      <div className="selection-step mt-8">
                        <SchoolList
                          talukaId={selectedTalukaId}
                          onSelectSchool={handleSchoolSelect}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {/* Report View */}
                {isAuthenticated && currentAuthEntity && (
                  <ReportView 
                    type={currentAuthEntity} 
                    name={
                      currentAuthEntity === "district" 
                        ? selectedDistrict?.name || "" 
                        : currentAuthEntity === "taluka" 
                          ? selectedTaluka?.name || "" 
                          : selectedSchool?.name || ""
                    }
                    examName={examName}
                  />
                )}
              </div>
            </>
          )}
        </Container>
      </main>
      
      {/* Authentication Modals */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md">
          {userRole === "officer" && !currentAuthEntity ? (
            <>
              <DialogTitle className="sr-only">Officer Authentication</DialogTitle>
              <OfficerAuth onAuthenticate={handleOfficerAuthenticate} />
            </>
          ) : (
            <>
              <DialogTitle className="sr-only">Authentication Required</DialogTitle>
              <PinAuth
                entityType={currentAuthEntity}
                entityId={
                  currentAuthEntity === "district" 
                    ? selectedDistrictId 
                    : currentAuthEntity === "taluka" 
                      ? selectedTalukaId 
                      : selectedSchoolId
                }
                onAuthenticate={handleAuthenticate}
                requireExamName={currentAuthEntity === "school"}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
