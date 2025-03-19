
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn("w-full px-6 py-4 flex items-center justify-center relative z-10", className)}>
      <div className="flex items-center gap-3 animate-fade-in">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-medium">School Report Hub</h1>
      </div>
    </header>
  );
};

export default Header;
