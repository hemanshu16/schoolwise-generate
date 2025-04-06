import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/context/SupabaseContext";
import { Check, ChevronDown, Map, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFadeAnimation } from "@/utils/animations";
import { Taluk } from "@/lib/context/SupabaseContext";

interface TalukSelectorProps {
  districtId: string;
  onSelect: (talukId: string) => void;
  selectedTalukId: string | null;
  className?: string;
  selectedTaluk: Taluk | null;
  setSelectedTalukId: (talukId: string) => void;
  setSelectedTaluk: (taluk: Taluk) => void;
  userRole?: "teacher" | "district_officer" | "taluk_officer";
}

const TalukSelector = ({ districtId, onSelect, selectedTalukId, className, selectedTaluk, setSelectedTalukId, setSelectedTaluk, userRole  }: TalukSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTaluks, setFilteredTaluks] = useState<Taluk[]>([]);
  const animation = useFadeAnimation(true);
  const { taluks, getTaluksByDistrict } = useSupabase();

  useEffect(() => {
    if (districtId) {
      getTaluksByDistrict(Number(districtId));
    }
  }, [districtId]);

  useEffect(() => {
    setFilteredTaluks(
      taluks
        .filter((taluk) => 
          searchTerm ? 
          taluk.taluk.toLowerCase().includes(searchTerm.toLowerCase()) : 
          true
        )
    );
  }, [taluks, searchTerm]);

  const handleSelect = (talukId: string) => {
    onSelect(talukId);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={cn(
      "relative w-full", 
      animation, 
      className,
      // Apply z-index when dropdown is open, but slightly lower than district when both are active
      isOpen ? "z-40" : "z-0"
    )}>
      <div className="mb-1 sm:mb-2">
        <div className="inline-flex items-center gap-1 bg-secondary/10 text-secondary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium">
          <Map className="h-3 w-3" />
          Select Taluk
        </div>
      </div>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={userRole === "taluk_officer" && selectedTaluk !== null}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 sm:py-2.5 text-left transition-all duration-300 text-sm",
          "bg-white border rounded-lg shadow-sm hover:shadow-md hover:border-secondary/30 focus:outline-none focus:ring-2 focus:ring-secondary/20",
          selectedTaluk ? "border-secondary/20" : "border-gray-200",
          selectedTaluk ? "text-foreground" : "text-muted-foreground",
          userRole === "taluk_officer" && selectedTaluk !== null && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="flex items-center gap-2">
          {selectedTaluk ? (
            <>
              <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <Map className="h-3 w-3" />
              </div>
              <span className="font-medium text-xs truncate">{selectedTaluk.taluk}</span>
            </>
          ) : (
            <>
              <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <Map className="h-3 w-3" />
              </div>
              <span className="text-xs">Select a taluk</span>
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
                placeholder="Search taluks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs px-3 py-1.5 pl-8 rounded-lg border border-gray-200 focus:border-secondary focus:ring-secondary/20"
                autoFocus
              />
              <MapPin className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            </div>
          </div>
          <div className="overflow-x-visible min-w-full">
            <ul className="max-h-40 overflow-y-auto overflow-x-hidden py-1 w-full">
              {filteredTaluks.map((taluk) => (
                <li key={taluk.id} className="px-1">
                  <button
                    type="button"
                    onClick={() => handleSelect(taluk.id.toString())}
                    className={cn(
                      "flex items-center gap-2 w-full px-2 py-1.5 text-left rounded-lg transition-colors text-xs",
                      selectedTalukId === taluk.id.toString() 
                        ? "bg-secondary/10 text-secondary" 
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full",
                      selectedTalukId === taluk.id.toString() 
                        ? "bg-secondary/10 text-secondary" 
                        : "bg-gray-100 text-gray-500"
                    )}>
                      <Map className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        "block truncate", 
                        selectedTalukId === taluk.id.toString() ? "font-medium" : ""
                      )}>
                        {taluk.taluk}
                      </span>
                    </div>
                    {selectedTalukId === taluk.id.toString() && (
                      <Check className="h-3 w-3 text-secondary flex-shrink-0 ml-auto" />
                    )}
                  </button>
                </li>
              ))}
              {filteredTaluks.length === 0 && (
                <li className="px-3 py-4 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Map className="h-6 w-6 text-gray-300" />
                    <p className="text-xs">No taluks found</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalukSelector;
