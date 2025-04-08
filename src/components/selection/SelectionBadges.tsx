import SelectionBadge from "@/components/ui/SelectionBadge";
import { useSupabase } from "@/lib/context/SupabaseContext";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionBadgesProps {
  userRole: "teacher" | "district_officer" | "taluk_officer" | null;
  districtName: string | null;
  talukName: string | null;
  schoolName: string | null;
  isAuthenticated: boolean;
  onReset: () => void;
}

const SelectionBadges = ({
  userRole,
  districtName,
  talukName,
  schoolName,
  isAuthenticated,
  onReset
}: SelectionBadgesProps) => {

  if (!districtName && !talukName && !schoolName) {
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
      
      {districtName && (
        <SelectionBadge 
          label="District"
          value={districtName}
          isActive={true}
          className="text-xs sm:text-sm"
        />
      )}
      
      {talukName && (
        <SelectionBadge 
          label="Taluk"
          value={talukName}
          isActive={true}
          className="text-xs sm:text-sm"
        />
      )}
      
      {schoolName && isAuthenticated && (
        <SelectionBadge 
          label="School"
          value={schoolName}
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
