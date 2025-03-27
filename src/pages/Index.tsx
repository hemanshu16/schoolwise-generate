
import { useState } from "react";
import { ArrowLeft, AlertTriangle, FileDown } from "lucide-react";
import Header from "@/components/layout/Header";
import Container from "@/components/layout/Container";
import DistrictSelector from "@/components/selection/DistrictSelector";
import TalukSelector from "@/components/selection/TalukaSelector";
import SchoolList from "@/components/selection/SchoolList";
import SelectionBadge from "@/components/ui/SelectionBadge";
import PinAuth from "@/components/auth/PinAuth";
import ReportView from "@/components/reports/ReportView";
import { districts, schools, taluks } from "@/utils/mock-data";
import { cn } from "@/lib/utils";
import { useDelayedMount } from "@/utils/animations";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import RoleSelector from "@/components/selection/RoleSelector";
import OfficerAuth, { OfficerPermission } from "@/components/auth/OfficerAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

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
  
  // Unfilled schools modal state
  const [showUnfilledSchoolsModal, setShowUnfilledSchoolsModal] = useState(false);
  const [unfilledSchoolsExamName, setUnfilledSchoolsExamName] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Helpers for entity names
  const selectedDistrict = districts.find(d => d.id === selectedDistrictId);
  const selectedTaluk = taluks.find(t => t.id === selectedTalukId);
  const selectedSchool = schools.find(s => s.id === selectedSchoolId);
  
  // Determine current selection step
  const showTalukSelector = !!selectedDistrictId;
  const showSchoolList = !!selectedTalukId;
  
  // Delayed mounting for UI elements - explicitly convert to boolean
  const mountTalukSelector = useDelayedMount(Boolean(showTalukSelector));
  const mountSchoolList = useDelayedMount(Boolean(showSchoolList));
  
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
  
  const handleDistrictSelect = (districtId: string) => {
    setSelectedDistrictId(districtId);
    setSelectedTalukId(null);
    setSelectedSchoolId(null);
    setIsAuthenticated(false);
    setCurrentAuthEntity(null);
  };
  
  const handleTalukSelect = (talukId: string) => {
    setSelectedTalukId(talukId);
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
      setShowAuthModal(true);
      setCurrentAuthEntity("district");
    } else {
      setShowAuthModal(true);
      setCurrentAuthEntity("district");
    }
  };
  
  const handleGenerateTalukReport = () => {
    if (isOfficerAuthenticated) {
      setShowAuthModal(true);
      setCurrentAuthEntity("taluk");
    } else {
      setShowAuthModal(true);
      setCurrentAuthEntity("taluk");
    }
  };
  
  const handleShowUnfilledSchools = () => {
    setShowUnfilledSchoolsModal(true);
  };
  
  const handleDownloadUnfilledSchools = () => {
    if (!unfilledSchoolsExamName.trim()) {
      toast.error("Please enter an exam name");
      return;
    }
    
    setIsDownloading(true);
    
    // Simulate file download
    setTimeout(() => {
      // Create a dummy CSV data for the unfilled schools
      const selectedDistrictName = selectedDistrict?.name || "Unknown";
      const selectedTalukName = selectedTaluk?.name || "Unknown";
      const examNameFormatted = unfilledSchoolsExamName.replace(/\s+/g, "_");
      
      // Create dummy CSV data with school names that haven't submitted exam marks
      const csvContent = [
        "School Name,District,Taluk,Phone,Status",
        `"Govt High School Mahadevapura","${selectedDistrictName}","${selectedTalukName}","9845012345","Pending"`,
        `"Govt Primary School Vignan Nagar","${selectedDistrictName}","${selectedTalukName}","8123456789","Pending"`,
        `"St. Mary's School","${selectedDistrictName}","${selectedTalukName}","7890123456","Pending"`,
        `"Model Public School","${selectedDistrictName}","${selectedTalukName}","9123456789","Pending"`,
      ].join("\n");
      
      // Create a Blob and download it
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `unfilled_schools_${selectedTalukName}_${examNameFormatted}.csv`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsDownloading(false);
      setShowUnfilledSchoolsModal(false);
      setUnfilledSchoolsExamName("");
      
      toast.success("Downloaded list of schools with unfilled exam marks", {
        description: `${examNameFormatted} - ${selectedTalukName}, ${selectedDistrictName}`
      });
    }, 1500);
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
    setSelectedTalukId(null);
    setSelectedSchoolId(null);
    setShowAuthModal(false);
    setIsAuthenticated(false);
    setCurrentAuthEntity(null);
    setExamName("");
    setIsOfficerAuthenticated(false);
    setShowUnfilledSchoolsModal(false);
    setUnfilledSchoolsExamName("");
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

  // Determine if report generation buttons should be shown
  const showDistrictReportButton = userRole === "officer" && officerPermission === "district" && selectedDistrictId && !selectedTalukId;
  const showTalukReportButton = userRole === "officer" && (officerPermission === "district" || officerPermission === "taluk") && selectedTalukId;

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
              {(selectedDistrictId || selectedTalukId || selectedSchoolId) && (
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
                  
                  {selectedTalukId && (
                    <SelectionBadge 
                      label="Taluk"
                      value={selectedTaluk?.name}
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
                        <div className="mt-4 flex justify-center gap-2">
                          <button
                            onClick={handleGenerateDistrictReport}
                            className="py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                          >
                            Generate District Report
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Step 2: Taluk Selection */}
                    {mountTalukSelector && selectedDistrictId && (
                      <div className={cn("selection-step", selectedTalukId ? "mb-8" : "")}>
                        <TalukSelector
                          districtId={selectedDistrictId}
                          onSelect={handleTalukSelect}
                          selectedTalukId={selectedTalukId}
                        />
                        
                        {showTalukReportButton && (
                          <div className="mt-4 flex justify-center gap-2 flex-wrap">
                            <button
                              onClick={handleGenerateTalukReport}
                              className="py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                            >
                              Generate Taluk Report
                            </button>
                            
                            <button 
                              onClick={handleShowUnfilledSchools}
                              className="py-2 px-4 bg-amber-100 text-amber-800 border border-amber-300 rounded-md hover:bg-amber-200 transition-colors flex items-center gap-1.5"
                            >
                              <AlertTriangle className="h-4 w-4" />
                              Schools with Unfilled Marks
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Step 3: School List */}
                    {mountSchoolList && selectedTalukId && (
                      <div className="selection-step mt-8">
                        <SchoolList
                          talukId={selectedTalukId}
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
                        : currentAuthEntity === "taluk" 
                          ? selectedTaluk?.name || "" 
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
      <Dialog open={showAuthModal} onOpenChange={handleDialogOpenChange}>
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
                    : currentAuthEntity === "taluk" 
                      ? selectedTalukId 
                      : selectedSchoolId
                }
                onAuthenticate={handleAuthenticate}
                requireExamName={currentAuthEntity === "school" || currentAuthEntity === "district" || currentAuthEntity === "taluk"}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Unfilled Schools Modal */}
      <Dialog 
        open={showUnfilledSchoolsModal} 
        onOpenChange={setShowUnfilledSchoolsModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Unfilled Schools List</DialogTitle>
            <DialogDescription>
              Enter the exam name to download a list of schools that have not submitted exam marks
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="examName" className="text-sm font-medium">
                Exam Name
              </label>
              <Input
                id="examName"
                placeholder="e.g. Quarterly Exam 2023"
                value={unfilledSchoolsExamName}
                onChange={(e) => setUnfilledSchoolsExamName(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUnfilledSchoolsModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDownloadUnfilledSchools}
              disabled={isDownloading || !unfilledSchoolsExamName.trim()}
              className="gap-1.5"
            >
              <FileDown className="h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download CSV"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
