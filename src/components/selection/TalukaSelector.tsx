
import { useEffect, useState } from "react";
import { taluks } from "@/utils/mock-data";
import { Check, ChevronDown, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFadeAnimation } from "@/utils/animations";

interface TalukSelectorProps {
  districtId: string;
  onSelect: (talukId: string) => void;
  selectedTalukId: string | null;
  className?: string;
}

const TalukSelector = ({ districtId, onSelect, selectedTalukId, className }: TalukSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTaluks, setFilteredTaluks] = useState(taluks.filter(t => t.districtId === districtId));
  const animation = useFadeAnimation(true);

  useEffect(() => {
    setFilteredTaluks(
      taluks
        .filter((taluk) => taluk.districtId === districtId)
        .filter((taluk) =>
          taluk.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  }, [districtId, searchTerm]);

  const handleSelect = (talukId: string) => {
    onSelect(talukId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedTaluk = taluks.find((t) => t.id === selectedTalukId);

  return (
    <div className={cn("relative w-full max-w-sm mx-auto", animation, className)}>
      <div className="mb-2 text-sm font-medium text-muted-foreground flex items-center gap-1.5">
        <Map className="h-3.5 w-3.5" /> Select Taluk
      </div>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 text-left transition-all duration-200",
          "bg-white border rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20",
          selectedTaluk ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          {selectedTaluk ? (
            <>
              <Map className="h-4 w-4 text-primary" />
              {selectedTaluk.name}
            </>
          ) : (
            "Select a taluk"
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? "transform rotate-180" : "")} />
      </button>

      {isOpen && (
        <div className="absolute z-40 w-full mt-1 bg-white rounded-lg shadow-lg border animate-scale-in overflow-hidden">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search taluks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full text-sm"
              autoFocus
            />
          </div>
          <ul className="max-h-60 overflow-auto py-1">
            {filteredTaluks.map((taluk) => (
              <li key={taluk.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(taluk.id)}
                  className={cn(
                    "flex items-center gap-2 w-full px-4 py-2.5 text-left hover:bg-muted/50 transition-colors",
                    selectedTalukId === taluk.id && "bg-primary/5 font-medium"
                  )}
                >
                  <Map className={cn(
                    "h-4 w-4",
                    selectedTalukId === taluk.id ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span>{taluk.name}</span>
                  {selectedTalukId === taluk.id && (
                    <Check className="h-4 w-4 text-primary ml-auto" />
                  )}
                </button>
              </li>
            ))}
            {filteredTaluks.length === 0 && (
              <li className="px-4 py-2.5 text-muted-foreground text-sm">No taluks found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TalukSelector;
