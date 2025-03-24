
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { toast } from "sonner";

export type OfficerPermission = "district" | "taluka" | "none";

interface OfficerAuthProps {
  onAuthenticate: (permission: OfficerPermission) => void;
}

const OfficerAuth = ({ onAuthenticate }: OfficerAuthProps) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulating authentication
    setTimeout(() => {
      setIsLoading(false);
      
      // Check password for different permission levels
      if (password === "district123") {
        toast.success("Authenticated as District Officer");
        onAuthenticate("district");
      } else if (password === "taluka123") {
        toast.success("Authenticated as Taluka Officer");
        onAuthenticate("taluka");
      } else {
        toast.error("Invalid password");
        onAuthenticate("none");
      }
    }, 800);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="mb-6 text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Officer Authentication</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your password to access officer reports
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full"
            required
          />
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
