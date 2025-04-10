import { School, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFadeAnimation } from "@/utils/animations";

interface RoleSelectorProps {
  onSelectRole: (role: "teacher" | "district_officer" | "taluk_officer") => void;
  className?: string;
}

const RoleSelector = ({ onSelectRole, className }: RoleSelectorProps) => {
  const animation = useFadeAnimation(true);

  return (
    <div className={cn("w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto", animation, className)}>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <button
          onClick={() => onSelectRole("teacher")}
          className="flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 bg-white rounded-lg border border-border/60 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
            <School className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-medium">School Teacher</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-center">
            View reports for your school
          </p>
        </button>
        
        <button
          onClick={() => onSelectRole("district_officer")}
          className="flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 bg-white rounded-lg border border-border/60 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
            <User className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-medium">Education Officer</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-center">
            View reports across multiple schools
          </p>
        </button>
      </div>
    </div>
  );
};

export default RoleSelector;
