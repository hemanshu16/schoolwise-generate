
import { districts, schools, taluks } from "@/utils/mock-data";
import SelectionBadge from "@/components/ui/SelectionBadge";

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
  // Helpers for entity names
  const selectedDistrict = districts.find(d => d.id === selectedDistrictId);
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
        onClick={onReset}
        className="text-sm text-muted-foreground hover:text-primary transition-colors ml-2"
      >
        Reset
      </button>
    </div>
  );
};

export default SelectionBadges;
