import { schools, taluks } from "@/utils/mock-data";
import SelectionBadge from "@/components/ui/SelectionBadge";
import { useSupabase } from "@/lib/context/SupabaseContext";
import { useEffect } from "react";

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
  const { districts, refreshDistricts, loading } = useSupabase();
  
  // Refresh districts if needed
  useEffect(() => {
    if (districts.length === 0 && !loading) {
      refreshDistricts();
    }
  }, [districts, refreshDistricts, loading]);
  
  // Helpers for entity names
  const selectedDistrict = districts.find(d => d.id.toString() === selectedDistrictId);
  const selectedTaluk = taluks.find(t => t.id === selectedTalukId);
  const selectedSchool = schools.find(s => s.id === selectedSchoolId);

  if (!selectedDistrictId && !selectedTalukId && !selectedSchoolId) {
    return null;
  }

  return (
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
          value={selectedDistrict?.district}
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
        onClick={onReset}
        className="text-sm text-muted-foreground hover:text-primary transition-colors ml-2"
      >
        Reset
      </button>
    </div>
  );
};

export default SelectionBadges;
