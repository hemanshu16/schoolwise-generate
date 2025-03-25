
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn("w-full px-6 py-4 bg-white shadow-sm flex items-center justify-between relative z-10", className)}>
      <div className="flex items-center gap-3">
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
