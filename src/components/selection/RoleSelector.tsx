
import { School, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFadeAnimation } from "@/utils/animations";

interface RoleSelectorProps {
  onSelectRole: (role: "teacher" | "officer") => void;
  className?: string;
}

const RoleSelector = ({ onSelectRole, className }: RoleSelectorProps) => {
  const animation = useFadeAnimation(true);

  return (
    <div className={cn("w-full max-w-md mx-auto", animation, className)}>
      <h2 className="text-xl font-semibold text-center mb-6">Select Your Role</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onSelectRole("teacher")}
          className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-border/60 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <School className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium">School Teacher</h3>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            View reports for your school
          </p>
        </button>
        
        <button
          onClick={() => onSelectRole("officer")}
          className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-border/60 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium">Education Officer</h3>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            View reports across multiple schools
          </p>
        </button>
      </div>
    </div>
  );
};

export default RoleSelector;
