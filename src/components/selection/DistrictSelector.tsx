
import { useEffect, useState } from "react";
import { districts } from "@/utils/mock-data";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFadeAnimation } from "@/utils/animations";

interface DistrictSelectorProps {
  onSelect: (districtId: string) => void;
  selectedDistrictId: string | null;
  className?: string;
}

const DistrictSelector = ({ onSelect, selectedDistrictId, className }: DistrictSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDistricts, setFilteredDistricts] = useState(districts);
  const animation = useFadeAnimation(true);

  useEffect(() => {
    setFilteredDistricts(
      districts.filter((district) =>
        district.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  const handleSelect = (districtId: string) => {
    onSelect(districtId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedDistrict = districts.find((d) => d.id === selectedDistrictId);

  return (
    <div className={cn("relative w-full max-w-sm mx-auto", animation, className)}>
      <div className="mb-2 text-sm font-medium text-muted-foreground flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5" /> Select District
      </div>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 text-left transition-all duration-200",
          "bg-white border rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20",
          selectedDistrict ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          {selectedDistrict ? (
            <>
              <MapPin className="h-4 w-4 text-primary" />
              {selectedDistrict.name}
            </>
          ) : (
            "Select a district"
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? "transform rotate-180" : "")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border animate-scale-in overflow-hidden">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search districts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full text-sm"
              autoFocus
            />
          </div>
          <ul className="max-h-60 overflow-auto py-1">
            {filteredDistricts.map((district) => (
              <li key={district.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(district.id)}
                  className={cn(
                    "flex items-center gap-2 w-full px-4 py-2.5 text-left hover:bg-muted/50 transition-colors",
                    selectedDistrictId === district.id && "bg-primary/5 font-medium"
                  )}
                >
                  <MapPin className={cn(
                    "h-4 w-4",
                    selectedDistrictId === district.id ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span>{district.name}</span>
                  {selectedDistrictId === district.id && (
                    <Check className="h-4 w-4 text-primary ml-auto" />
                  )}
                </button>
              </li>
            ))}
            {filteredDistricts.length === 0 && (
              <li className="px-4 py-2.5 text-muted-foreground text-sm">No districts found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DistrictSelector;
