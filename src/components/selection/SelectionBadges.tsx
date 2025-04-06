import { schools, taluks } from "@/utils/mock-data";
import SelectionBadge from "@/components/ui/SelectionBadge";
import { useSupabase } from "@/lib/context/SupabaseContext";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionBadgesProps {
  userRole: "teacher" | "officer" | null;
  selectedDistrictId: string | null;
  selectedTalukId: string | null;
  selectedSchoolId: string | null;
  examName: string;
  isAuthenticated: boolean;
  onReset: () => void;
}

const SelectionBadges = ({
  userRole,
  selectedDistrictId,
  selectedTalukId,
  selectedSchoolId,
  examName,
  isAuthenticated,
  onReset
}: SelectionBadgesProps) => {
  const { districts, taluks: dbTaluks, refreshDistricts, loading } = useSupabase();
  const [talukName, setTalukName] = useState<string | undefined>();
  
  // Refresh districts if needed
  useEffect(() => {
    if (districts.length === 0 && !loading) {
      refreshDistricts();
    }
  }, [districts, refreshDistricts, loading]);
  
  // Fetch taluk name when selectedTalukId changes
  useEffect(() => {
    if (selectedTalukId) {
      // First try to get from database
      const dbTaluk = dbTaluks.find(t => t.id.toString() === selectedTalukId);
      if (dbTaluk) {
        setTalukName(dbTaluk.taluk);
        return;
      }
      
      // Fallback to mock data
      const mockTaluk = taluks.find(t => t.id === selectedTalukId);
      if (mockTaluk) {
        setTalukName(mockTaluk.name);
      }
    }
  }, [selectedTalukId, dbTaluks]);
  
  // Helpers for entity names
  const selectedDistrict = districts.find(d => d.id.toString() === selectedDistrictId);
  const selectedSchool = schools.find(s => s.id === selectedSchoolId);

  if (!selectedDistrictId && !selectedTalukId && !selectedSchoolId) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6 md:mb-8 justify-center animate-fade-in max-w-full overflow-x-auto py-1">
      {userRole && (
        <SelectionBadge 
          label="Role"
          value={userRole === "teacher" ? "School Teacher" : "Education Officer"}
          isActive={true}
          className="text-xs sm:text-sm"
        />
      )}
      
      {selectedDistrictId && (
        <SelectionBadge 
          label="District"
          value={selectedDistrict?.district}
          isActive={true}
          className="text-xs sm:text-sm"
        />
      )}
      
      {selectedTalukId && (
        <SelectionBadge 
          label="Taluk"
          value={talukName}
          isActive={true}
          className="text-xs sm:text-sm"
        />
      )}
      
      {selectedSchoolId && isAuthenticated && (
        <SelectionBadge 
          label="School"
          value={selectedSchool?.name}
          isActive={true}
          className="text-xs sm:text-sm"
        />
      )}

      {/* Only show exam name if we're authenticated (viewing a report) */}
      {examName && isAuthenticated && (
        <SelectionBadge 
          label="Exam"
          value={examName}
          isActive={true}
          className="text-xs sm:text-sm"
        />
      )}
      
      <button 
        onClick={onReset}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full",
          "text-xs sm:text-sm text-muted-foreground hover:text-primary hover:bg-gray-100", 
          "transition-colors border border-gray-200"
        )}
      >
        <X className="h-3 w-3 sm:h-4 sm:w-4" />
        <span>Reset</span>
      </button>
    </div>
  );
};

export default SelectionBadges;
