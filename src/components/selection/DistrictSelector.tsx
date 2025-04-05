import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/context/SupabaseContext";
import { Check, ChevronDown, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFadeAnimation } from "@/utils/animations";
import { District } from "@/lib/context/SupabaseContext";

interface DistrictSelectorProps {
  onSelect: (districtId: string) => void;
  selectedDistrictId: string | null;
  className?: string;
}

const DistrictSelector = ({ onSelect, selectedDistrictId, className }: DistrictSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const { districts, refreshDistricts, loading } = useSupabase();
  const animation = useFadeAnimation(true);

  useEffect(() => {
    refreshDistricts();
  }, []);

  useEffect(() => {
    setFilteredDistricts(
      districts
        .filter((district) => 
          searchTerm ? 
          district.district.toLowerCase().includes(searchTerm.toLowerCase()) : 
          true
        )
    );
  }, [districts, searchTerm]);

  const handleSelect = (districtId: string) => {
    onSelect(districtId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedDistrict = districts.find((d) => d.id.toString() === selectedDistrictId);

  return (
    <div className={cn(
      "relative w-full", 
      animation, 
      className,
      // Apply z-index when dropdown is open to ensure it's above other elements
      isOpen ? "z-50" : "z-0"
    )}>
      <div className="mb-1 sm:mb-2">
        <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium">
          <MapPin className="h-3 w-3" />
          Select District
        </div>
      </div>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 sm:py-2.5 text-left transition-all duration-300 text-sm",
          "bg-white border rounded-lg shadow-sm hover:shadow-md hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20",
          selectedDistrict ? "border-primary/20" : "border-gray-200",
          selectedDistrict ? "text-foreground" : "text-muted-foreground"
        )}
      > 
        <span className="flex items-center gap-2">
          {selectedDistrict ? (
            <>
              <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="h-3 w-3" />
              </div>
              <span className="font-medium text-xs truncate">{selectedDistrict.district}</span>
            </>
          ) : (
            <>
              <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <MapPin className="h-3 w-3" />
              </div>
              <span className="text-xs">Select a district</span>
            </>
          )}
        </span>
        <ChevronDown className={cn(
          "h-3 w-3 text-gray-400 transition-transform duration-300", 
          isOpen ? "transform rotate-180" : ""
        )} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-40 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 animate-scale-in overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Search districts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs px-3 py-1.5 pl-8 rounded-lg border border-gray-200 focus:border-primary focus:ring-primary/20"
                autoFocus
              />
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            </div>
          </div>
          
          {loading ? (
            <div className="py-3 flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-visible min-w-full">
              <ul className="max-h-40 overflow-y-auto overflow-x-hidden py-1 w-full">
                {filteredDistricts.map((district) => (
                  <li key={district.id} className="px-1">
                    <button
                      type="button"
                      onClick={() => handleSelect(district.id.toString())}
                      className={cn(
                        "flex items-center gap-2 w-full px-2 py-1.5 text-left rounded-lg transition-colors text-xs",
                        selectedDistrictId === district.id.toString() 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full",
                        selectedDistrictId === district.id.toString() 
                          ? "bg-primary/10 text-primary" 
                          : "bg-gray-100 text-gray-500"
                      )}>
                        <MapPin className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          "block truncate", 
                          selectedDistrictId === district.id.toString() ? "font-medium" : ""
                        )}>
                          {district.district}
                        </span>
                      </div>
                      {selectedDistrictId === district.id.toString() && (
                        <Check className="h-3 w-3 text-primary flex-shrink-0 ml-auto" />
                      )}
                    </button>
                  </li>
                ))}
                {filteredDistricts.length === 0 && (
                  <li className="px-3 py-4 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <MapPin className="h-6 w-6 text-gray-300" />
                      <p className="text-xs">No districts found</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DistrictSelector;
