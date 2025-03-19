
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
        "selection-badge", 
        isActive ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground",
        className
      )}
    >
      {isActive && <Check className="w-3.5 h-3.5 mr-1.5" />}
      <span>{label}</span>
      {value && <span className="ml-1.5 font-semibold">{value}</span>}
    </div>
  );
};

export default SelectionBadge;
