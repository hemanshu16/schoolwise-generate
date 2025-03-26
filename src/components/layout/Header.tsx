
import { ArrowLeft, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  className?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const Header = ({ className, showBackButton = false, onBack }: HeaderProps) => {
  return (
    <header className={cn("w-full px-6 py-4 bg-white shadow-sm flex items-center justify-between relative z-10", className)}>
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack} 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
        <FileText className="h-6 w-6 text-secondary" />
        <h1 className="text-2xl font-medium flex items-baseline">
          <span className="text-secondary font-bold">Sitara</span>
          <span className="text-amber-400 font-medium ml-1">Akka</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;
