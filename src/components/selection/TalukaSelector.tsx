
import { useEffect, useState } from "react";
import { talukas } from "@/utils/mock-data";
import { Check, ChevronDown, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFadeAnimation } from "@/utils/animations";

interface TalukaSelectorProps {
  districtId: string;
  onSelect: (talukaId: string) => void;
  selectedTalukaId: string | null;
  className?: string;
}

const TalukaSelector = ({ districtId, onSelect, selectedTalukaId, className }: TalukaSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTalukas, setFilteredTalukas] = useState(talukas.filter(t => t.districtId === districtId));
  const animation = useFadeAnimation(true);

  useEffect(() => {
    setFilteredTalukas(
      talukas
        .filter((taluka) => taluka.districtId === districtId)
        .filter((taluka) =>
          taluka.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  }, [districtId, searchTerm]);

  const handleSelect = (talukaId: string) => {
    onSelect(talukaId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedTaluka = talukas.find((t) => t.id === selectedTalukaId);

  return (
    <div className={cn("relative w-full max-w-sm mx-auto", animation, className)}>
      <div className="mb-2 text-sm font-medium text-muted-foreground flex items-center gap-1.5">
        <Map className="h-3.5 w-3.5" /> Select Taluka
      </div>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 text-left transition-all duration-200",
          "bg-white border rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20",
          selectedTaluka ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          {selectedTaluka ? (
            <>
              <Map className="h-4 w-4 text-primary" />
              {selectedTaluka.name}
            </>
          ) : (
            "Select a taluka"
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? "transform rotate-180" : "")} />
      </button>

      {isOpen && (
        <div className="absolute z-40 w-full mt-1 bg-white rounded-lg shadow-lg border animate-scale-in overflow-hidden">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search talukas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full text-sm"
              autoFocus
            />
          </div>
          <ul className="max-h-60 overflow-auto py-1">
            {filteredTalukas.map((taluka) => (
              <li key={taluka.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(taluka.id)}
                  className={cn(
                    "flex items-center gap-2 w-full px-4 py-2.5 text-left hover:bg-muted/50 transition-colors",
                    selectedTalukaId === taluka.id && "bg-primary/5 font-medium"
                  )}
                >
                  <Map className={cn(
                    "h-4 w-4",
                    selectedTalukaId === taluka.id ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span>{taluka.name}</span>
                  {selectedTalukaId === taluka.id && (
                    <Check className="h-4 w-4 text-primary ml-auto" />
                  )}
                </button>
              </li>
            ))}
            {filteredTalukas.length === 0 && (
              <li className="px-4 py-2.5 text-muted-foreground text-sm">No talukas found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TalukaSelector;
