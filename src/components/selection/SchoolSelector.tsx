
import { useEffect, useState } from "react";
import { schools } from "@/utils/mock-data";
import { Check, ChevronDown, School } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFadeAnimation } from "@/utils/animations";

interface SchoolSelectorProps {
  talukaId: string;
  onSelect: (schoolId: string) => void;
  selectedSchoolId: string | null;
  className?: string;
}

const SchoolSelector = ({ talukaId, onSelect, selectedSchoolId, className }: SchoolSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSchools, setFilteredSchools] = useState(schools.filter(s => s.talukaId === talukaId));
  const animation = useFadeAnimation(true);

  useEffect(() => {
    setFilteredSchools(
      schools
        .filter((school) => school.talukaId === talukaId)
        .filter((school) =>
          school.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  }, [talukaId, searchTerm]);

  const handleSelect = (schoolId: string) => {
    onSelect(schoolId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedSchool = schools.find((s) => s.id === selectedSchoolId);

  return (
    <div className={cn("relative w-full max-w-sm mx-auto", animation, className)}>
      <div className="mb-2 text-sm font-medium text-muted-foreground flex items-center gap-1.5">
        <School className="h-3.5 w-3.5" /> Select School
      </div>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 text-left transition-all duration-200",
          "bg-white border rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20",
          selectedSchool ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          {selectedSchool ? (
            <>
              <School className="h-4 w-4 text-primary" />
              {selectedSchool.name}
            </>
          ) : (
            "Select a school"
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? "transform rotate-180" : "")} />
      </button>

      {isOpen && (
        <div className="absolute z-30 w-full mt-1 bg-white rounded-lg shadow-lg border animate-scale-in overflow-hidden">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search schools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full text-sm"
              autoFocus
            />
          </div>
          <ul className="max-h-60 overflow-auto py-1">
            {filteredSchools.map((school) => (
              <li key={school.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(school.id)}
                  className={cn(
                    "flex items-center gap-2 w-full px-4 py-2.5 text-left hover:bg-muted/50 transition-colors",
                    selectedSchoolId === school.id && "bg-primary/5 font-medium"
                  )}
                >
                  <School className={cn(
                    "h-4 w-4",
                    selectedSchoolId === school.id ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span>{school.name}</span>
                  {selectedSchoolId === school.id && (
                    <Check className="h-4 w-4 text-primary ml-auto" />
                  )}
                </button>
              </li>
            ))}
            {filteredSchools.length === 0 && (
              <li className="px-4 py-2.5 text-muted-foreground text-sm">No schools found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SchoolSelector;
