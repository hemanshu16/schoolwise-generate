import { useState } from "react";
import Header from "@/components/layout/Header";
import Container from "@/components/layout/Container";
import DistrictSelector from "@/components/selection/DistrictSelector";
import TalukaSelector from "@/components/selection/TalukaSelector";
import SchoolSelector from "@/components/selection/SchoolSelector";
import SelectionBadge from "@/components/ui/SelectionBadge";
import PinAuth from "@/components/auth/PinAuth";
import ReportView from "@/components/reports/ReportView";
import { districts, schools, talukas } from "@/utils/mock-data";
import { cn } from "@/lib/utils";
import { useDelayedMount } from "@/utils/animations";

const Index = () => {
  // Selection state
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedTalukaId, setSelectedTalukaId] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  
  // Authentication state
  const [authStep, setAuthStep] = useState<"district" | "taluka" | "school" | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Helpers for entity names
  const selectedDistrict = districts.find(d => d.id === selectedDistrictId);
  const selectedTaluka = talukas.find(t => t.id === selectedTalukaId);
  const selectedSchool = schools.find(s => s.id === selectedSchoolId);
  
  // Determine current selection step
  const showTalukaSelector = !!selectedDistrictId;
  const showSchoolSelector = !!selectedTalukaId;
  const showAuthentication = (
    (selectedDistrictId && !selectedTalukaId && !selectedSchoolId) || 
    (selectedTalukaId && !selectedSchoolId) || 
    selectedSchoolId
  );
  
  // Delayed mounting for UI elements - explicitly convert to boolean
  const mountTalukaSelector = useDelayedMount(Boolean(showTalukaSelector));
  const mountSchoolSelector = useDelayedMount(Boolean(showSchoolSelector));
  const mountAuthentication = useDelayedMount(Boolean(showAuthentication));
  
  // Handlers
  const handleDistrictSelect = (districtId: string) => {
    setSelectedDistrictId(districtId);
    setSelectedTalukaId(null);
    setSelectedSchoolId(null);
    setAuthStep("district");
    setIsAuthenticated(false);
  };
  
  const handleTalukaSelect = (talukaId: string) => {
    setSelectedTalukaId(talukaId);
    setSelectedSchoolId(null);
    setAuthStep("taluka");
    setIsAuthenticated(false);
  };
  
  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setAuthStep("school");
    setIsAuthenticated(false);
  };
  
  const handleAuthenticate = () => {
    setIsAuthenticated(true);
  };
  
  const handleReset = () => {
    setSelectedDistrictId(null);
    setSelectedTalukaId(null);
    setSelectedSchoolId(null);
    setAuthStep(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 pb-12">
      <Header />
      
      <main>
        <Container>
          {/* Selection badges */}
          {(selectedDistrictId || selectedTalukaId || selectedSchoolId) && (
            <div className="flex flex-wrap gap-2 mb-8 justify-center animate-fade-in">
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
              
              {selectedSchoolId && (
                <SelectionBadge 
                  label="School"
                  value={selectedSchool?.name}
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

          {/* Content card */}
          <div className={cn(
            "frosted-glass p-6 max-w-2xl mx-auto",
            isAuthenticated ? "md:max-w-4xl" : ""
          )}>
            {!isAuthenticated ? (
              <div className="space-y-8">
                {/* Step 1: District Selection */}
                <div className={cn("selection-step", selectedDistrictId ? "mb-8" : "")}>
                  <DistrictSelector 
                    onSelect={handleDistrictSelect} 
                    selectedDistrictId={selectedDistrictId}
                  />
                </div>
                
                {/* Step 2: Taluka Selection */}
                {mountTalukaSelector && selectedDistrictId && (
                  <div className={cn("selection-step", selectedTalukaId ? "mb-8" : "")}>
                    <TalukaSelector
                      districtId={selectedDistrictId}
                      onSelect={handleTalukaSelect}
                      selectedTalukaId={selectedTalukaId}
                    />
                  </div>
                )}
                
                {/* Step 3: School Selection */}
                {mountSchoolSelector && selectedTalukaId && (
                  <div className="selection-step">
                    <SchoolSelector
                      talukaId={selectedTalukaId}
                      onSelect={handleSchoolSelect}
                      selectedSchoolId={selectedSchoolId}
                    />
                  </div>
                )}
                
                {/* Authentication step */}
                {mountAuthentication && authStep && (
                  <div className="selection-step mt-8 pt-8 border-t border-border/60">
                    <PinAuth
                      entityType={authStep}
                      entityId={
                        authStep === "district" 
                          ? selectedDistrictId 
                          : authStep === "taluka" 
                            ? selectedTalukaId 
                            : selectedSchoolId
                      }
                      onAuthenticate={handleAuthenticate}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Report View */
              <ReportView 
                type={authStep!} 
                name={
                  authStep === "district" 
                    ? selectedDistrict?.name || "" 
                    : authStep === "taluka" 
                      ? selectedTaluka?.name || "" 
                      : selectedSchool?.name || ""
                }
              />
            )}
          </div>
        </Container>
      </main>
    </div>
  );
};

export default Index;
