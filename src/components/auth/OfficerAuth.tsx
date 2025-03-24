
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { DialogTitle } from "@/components/ui/dialog";

export type OfficerPermission = "district" | "taluka" | "none";

interface OfficerAuthProps {
  onAuthenticate: (permission: OfficerPermission) => void;
}

const OfficerAuth = ({ onAuthenticate }: OfficerAuthProps) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // Simulating authentication
    setTimeout(() => {
      setIsLoading(false);
      
      // Check password for different permission levels
      // Adding support for district passwords from the mock data (1234, 5678, etc.)
      if (password === "district123" || password === "1234" || password === "5678" || 
          password === "9012" || password === "3456") {
        toast.success("Authenticated as District Officer");
        onAuthenticate("district");
      } else if (password === "taluka123" || password === "1111" || password === "2222" ||
                password === "3333" || password === "4444" || password === "5555" ||
                password === "6666" || password === "7777" || password === "8888") {
        toast.success("Authenticated as Taluka Officer");
        onAuthenticate("taluka");
      } else {
        setError("Invalid password. Please try again.");
        toast.error("Invalid password");
        onAuthenticate("none");
      }
    }, 800);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <DialogTitle className="sr-only">Officer Authentication</DialogTitle>
      <div className="mb-6 text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Officer Authentication</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your password to access officer reports
        </p>
        <div className="mt-2 text-xs text-muted-foreground">
          <p>District passwords: 1234, 5678, 9012, 3456</p>
          <p>Taluka passwords: 1111, 2222, 3333, 4444, 5555, 6666, 7777, 8888</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Enter password"
            className={`w-full ${error ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
            required
          />
          {error && (
            <div className="mt-2 text-sm text-destructive flex items-center gap-1.5 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}
        </div>
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Authenticating..." : "Authenticate"}
        </Button>
      </form>
    </div>
  );
};

export default OfficerAuth;
