import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/context/SupabaseContext";
import { cn } from "@/lib/utils";
import { ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SteppedSelectionProps {
  onDistrictSelect: (districtId: string) => void;
  onTalukSelect: (talukId: string) => void;
  className?: string;
  showBackButton?: boolean;
  onBackButtonClick?: () => void;
}

const SteppedSelection = ({
  onDistrictSelect,
  onTalukSelect,
  className,
  showBackButton = false,
  onBackButtonClick,
}: SteppedSelectionProps) => {
  // State
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedTalukId, setSelectedTalukId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedDistrict, setExpandedDistrict] = useState(false);
  const [expandedTaluk, setExpandedTaluk] = useState(false);
  
  // Data from Supabase
  const { districts, taluks, refreshDistricts, getTaluksByDistrict, loading: districtsLoading } = useSupabase();
  
  // Fetch districts on component mount
  useEffect(() => {
    refreshDistricts();
  }, []);
  
  // Fetch taluks when district is selected
  useEffect(() => {
    if (selectedDistrictId) {
      getTaluksByDistrict(Number(selectedDistrictId));
      setCurrentStep(2);
    }
  }, [selectedDistrictId]);
  
  // Handle district selection
  const handleDistrictSelect = (districtId: string) => {
    setSelectedDistrictId(districtId);
    onDistrictSelect(districtId);
    setExpandedDistrict(false);
  };
  
  // Handle taluk selection
  const handleTalukSelect = (talukId: string) => {
    setSelectedTalukId(talukId);
    onTalukSelect(talukId);
    setExpandedTaluk(false);
  };
  
  // Find selected entities
  const selectedDistrict = districts.find(d => d.id.toString() === selectedDistrictId);
  const selectedTaluk = taluks.find(t => t.id.toString() === selectedTalukId);
  
  return (
    <div className={cn("w-full", className)}>
      {showBackButton && (
        <Button 
          variant="outline" 
          onClick={onBackButtonClick} 
          className="mb-4 bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-900 font-medium"
        >
          Back to Role Selection
        </Button>
      )}
      
      {/* Responsive container for selection steps */}
      <div className="block sm:flex sm:flex-row sm:space-x-4">
        {/* Step 1: District Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden w-full sm:w-1/2 mb-4 sm:mb-0">
          <div className="flex items-center p-4 bg-slate-50">
            <div className="h-9 w-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold mr-3 border border-teal-200 shadow-sm">
              1
            </div>
            <h3 className="text-lg font-semibold text-slate-800">District Selection</h3>
          </div>
          
          <div className="border-t border-slate-200">
            {selectedDistrict ? (
              <button
                className="w-full flex items-center p-4 bg-white hover:bg-slate-50 transition-colors text-left"
                onClick={() => setExpandedDistrict(!expandedDistrict)}
              >
                <div className="mr-3 flex-shrink-0 h-7 w-7 rounded-full bg-teal-100 flex items-center justify-center border border-teal-200">
                  <Check className="h-4 w-4 text-teal-700" />
                </div>
                <span className="font-semibold text-slate-800">{selectedDistrict.district}</span>
                <ChevronRight className={cn(
                  "ml-auto h-5 w-5 text-slate-500 transition-transform", 
                  expandedDistrict ? "rotate-90" : ""
                )} />
              </button>
            ) : (
              <button
                className="w-full flex items-center p-4 bg-teal-50 text-teal-800 hover:bg-teal-100 transition-colors text-left border-y border-teal-100"
                onClick={() => setExpandedDistrict(!expandedDistrict)}
              >
                <span className="mr-1 font-medium">Select District 12</span>
                <ChevronRight className={cn(
                  "ml-auto h-5 w-5 transition-transform", 
                  expandedDistrict ? "rotate-90" : ""
                )} />
              </button>
            )}
            
            {expandedDistrict && (
              <div className="border-t border-slate-200 max-h-64 overflow-y-auto">
                {districtsLoading ? (
                  <div className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                  </div>
                ) : districts.length === 0 ? (
                  <div className="text-center p-4 text-slate-600 font-medium">
                    No districts found
                  </div>
                ) : (
                  districts.map((district) => (
                    <button
                      key={district.id}
                      className={cn(
                        "w-full flex items-center p-3.5 text-left hover:bg-slate-50 transition-colors",
                        selectedDistrictId === district.id.toString() 
                          ? "bg-teal-50 text-teal-800 border-l-4 border-l-teal-500 pl-7"
                          : "pl-8 text-slate-700"
                      )}
                      onClick={() => handleDistrictSelect(district.id.toString())}
                    >
                      <span className={cn(
                        selectedDistrictId === district.id.toString() ? "font-medium" : "font-normal"
                      )}>
                        {district.district}
                      </span>
                      {selectedDistrictId === district.id.toString() && (
                        <Check className="ml-auto h-4 w-4 text-teal-600" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Step 2: Taluk Selection */}
        <div className={cn(
          "bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden w-full sm:w-1/2",
          currentStep < 2 && "opacity-70"
        )}>
          <div className="flex items-center p-4 bg-slate-50">
            <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold mr-3 border border-indigo-200 shadow-sm">
              2
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Taluk Selection</h3>
          </div>
          
          <div className="border-t border-slate-200">
            {selectedTaluk ? (
              <button
                className={cn(
                  "w-full flex items-center p-4 bg-white hover:bg-slate-50 transition-colors text-left",
                  currentStep < 2 && "pointer-events-none"
                )}
                onClick={() => currentStep >= 2 && setExpandedTaluk(!expandedTaluk)}
                disabled={currentStep < 2}
              >
                <div className="mr-3 flex-shrink-0 h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                  <Check className="h-4 w-4 text-indigo-700" />
                </div>
                <span className="font-semibold text-slate-800">{selectedTaluk.taluk}</span>
                <ChevronRight className={cn(
                  "ml-auto h-5 w-5 text-slate-500 transition-transform", 
                  expandedTaluk ? "rotate-90" : ""
                )} />
              </button>
            ) : (
              <button
                className={cn(
                  "w-full flex items-center p-4",
                  currentStep >= 2 
                    ? "bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border-y border-indigo-100"
                    : "bg-slate-100 text-slate-600",
                  "transition-colors text-left"
                )}
                onClick={() => currentStep >= 2 && setExpandedTaluk(!expandedTaluk)}
                disabled={currentStep < 2}
              >
                <span className="mr-1 font-medium">Select Taluk</span>
                <ChevronRight className={cn(
                  "ml-auto h-5 w-5 transition-transform", 
                  expandedTaluk ? "rotate-90" : ""
                )} />
              </button>
            )}
            
            {expandedTaluk && currentStep >= 2 && (
              <div className="border-t border-slate-200 max-h-64 overflow-y-auto">
                {districtsLoading ? (
                  <div className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  </div>
                ) : taluks.length === 0 ? (
                  <div className="text-center p-4 text-slate-600 font-medium">
                    No taluks found for this district
                  </div>
                ) : (
                  taluks.map((taluk) => (
                    <button
                      key={taluk.id}
                      className={cn(
                        "w-full flex items-center p-3.5 text-left hover:bg-slate-50 transition-colors",
                        selectedTalukId === taluk.id.toString() 
                          ? "bg-indigo-50 text-indigo-800 border-l-4 border-l-indigo-500 pl-7" 
                          : "pl-8 text-slate-700"
                      )}
                      onClick={() => handleTalukSelect(taluk.id.toString())}
                    >
                      <span className={cn(
                        selectedTalukId === taluk.id.toString() ? "font-medium" : "font-normal"
                      )}>
                        {taluk.taluk}
                      </span>
                      {selectedTalukId === taluk.id.toString() && (
                        <Check className="ml-auto h-4 w-4 text-indigo-600" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SteppedSelection; 