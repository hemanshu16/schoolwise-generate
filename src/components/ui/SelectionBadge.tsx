import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionBadgeProps {
  label: string;
  value?: string;
  isActive: boolean;
  className?: string;
}

const SelectionBadge = ({ label, value, isActive, className }: SelectionBadgeProps) => {
  return (
    <div 
      className={cn(
        "flex items-center px-2 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap",
        "transition-colors duration-200 shadow-sm",
        isActive ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground",
        className
      )}
    >
      {isActive && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />}
      <span className="flex-shrink-0">{label}</span>
      {value && <span className="ml-1 sm:ml-1.5 font-semibold truncate max-w-[120px] sm:max-w-[160px] md:max-w-none">{value}</span>}
    </div>
  );
};

export default SelectionBadge;
