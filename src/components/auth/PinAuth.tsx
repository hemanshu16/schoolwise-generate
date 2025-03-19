
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Key, LockKeyhole } from "lucide-react";
import { useFadeAnimation } from "@/utils/animations";
import { toast } from "@/components/ui/sonner";
import { districts, schools, talukas } from "@/utils/mock-data";

interface PinAuthProps {
  entityType: "district" | "taluka" | "school";
  entityId: string | null;
  onAuthenticate: () => void;
  className?: string;
}

const PinAuth = ({ entityType, entityId, onAuthenticate, className }: PinAuthProps) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const animation = useFadeAnimation(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    let correctPin = "";
    let entityName = "";
    
    if (entityType === "district" && entityId) {
      const district = districts.find((d) => d.id === entityId);
      correctPin = district?.password || "";
      entityName = district?.name || "";
    } else if (entityType === "taluka" && entityId) {
      const taluka = talukas.find((t) => t.id === entityId);
      correctPin = taluka?.pin || "";
      entityName = taluka?.name || "";
    } else if (entityType === "school" && entityId) {
      const school = schools.find((s) => s.id === entityId);
      correctPin = school?.pin || "";
      entityName = school?.name || "";
    }
    
    // Simulate an API call
    setTimeout(() => {
      if (pin === correctPin) {
        toast.success(`Successfully authenticated for ${entityName}`);
        onAuthenticate();
      } else {
        setError("Incorrect PIN. Please try again.");
        toast.error("Authentication failed. Please check your PIN and try again.");
      }
      setIsSubmitting(false);
    }, 800);
  };
  
  const getEntityName = () => {
    if (entityType === "district" && entityId) {
      return districts.find((d) => d.id === entityId)?.name || "";
    } else if (entityType === "taluka" && entityId) {
      return talukas.find((t) => t.id === entityId)?.name || "";
    } else if (entityType === "school" && entityId) {
      return schools.find((s) => s.id === entityId)?.name || "";
    }
    return "";
  };

  return (
    <div className={cn("w-full max-w-sm mx-auto", animation, className)}>
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10 text-primary">
          <LockKeyhole className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground">
          Please enter the PIN for
          <span className="font-medium text-foreground"> {getEntityName()} {entityType}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="pin" className="block text-sm font-medium mb-2 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" /> Security PIN
          </label>
          <input
            id="pin"
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError("");
            }}
            className={cn(
              "input-field w-full",
              error && "border-destructive focus-visible:ring-destructive/20"
            )}
            autoFocus
          />
          {error && (
            <div className="mt-2 text-sm text-destructive flex items-center gap-1.5 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!pin.trim() || isSubmitting}
          className={cn(
            "w-full py-2.5 px-4 rounded-md bg-primary text-primary-foreground font-medium transition-all",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1",
            "hover:bg-primary/90 active:bg-primary/80",
            (isSubmitting || !pin.trim()) && "opacity-70 cursor-not-allowed"
          )}
        >
          {isSubmitting ? "Authenticating..." : "Authenticate"}
        </button>
      </form>
    </div>
  );
};

export default PinAuth;
