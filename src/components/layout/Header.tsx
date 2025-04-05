import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn(
      "w-full bg-white shadow-sm flex items-center justify-between relative z-10",
      "px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4", 
      className
    )}>
      <div className="flex items-center gap-2 sm:gap-3">
        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
        <h1 className="text-xl sm:text-2xl font-medium flex items-baseline">
          <span className="text-secondary font-bold">Sitara</span>
          <span className="text-amber-400 font-medium ml-1">Akka</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;
