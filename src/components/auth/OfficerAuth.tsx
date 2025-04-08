import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { DialogTitle } from "@/components/ui/dialog";
import { District, Taluk, useSupabase } from "@/lib/context/SupabaseContext";

export type OfficerPermission = "district" | "taluk" | "none";

interface OfficerAuthProps {
  onAuthenticate: (permission: OfficerPermission) => void;
  setSelectedDistrictId: (districtId: string) => void;
  setSelectedDistrict: (district: District) => void;
  setSelectedTalukId: (talukId: string) => void;
  setSelectedTaluk: (taluk: Taluk) => void;
  setUserRole: (role: "teacher" | "district_officer" | "taluk_officer") => void;
}

const OfficerAuth = ({ onAuthenticate, setSelectedDistrictId, setSelectedDistrict, setSelectedTalukId, setSelectedTaluk, setUserRole }: OfficerAuthProps) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { checkDistrictPassword, checkTalukPassword, getDistrictById } = useSupabase();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // First check if it's a district password
      const districtResult = await checkDistrictPassword(password);
      if (districtResult.success) {
        toast.success(`Authenticated as District Officer for ${districtResult.district.district}`);
        onAuthenticate("district");
        setSelectedDistrict(districtResult.district);
        setSelectedDistrictId(districtResult.district.id);
        setUserRole("district_officer");
        return;
      }
      
      // If not a district password, check if it's a taluk password
      const talukResult = await checkTalukPassword(password);
      if (talukResult.success) {
        toast.success(`Authenticated as Taluk Officer for ${talukResult.taluk.taluk}`);
        setSelectedTalukId(talukResult.taluk.id);
        setSelectedTaluk(talukResult.taluk);
        const district = await getDistrictById(talukResult.taluk.districtId);
        setSelectedDistrict(district);
        setSelectedDistrictId(district.id.toString());
        onAuthenticate("taluk");
        setUserRole("taluk_officer");
        return;
      }
      
      // If neither district nor taluk password
      setError("Invalid password. Please try again.");
      toast.error("Invalid password");
      onAuthenticate("none");
    } catch (err) {
      console.log(err);
      setError("Authentication error. Please try again.");
      toast.error("Authentication error");
      onAuthenticate("none");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <DialogTitle className="sr-only">Officer Authentication </DialogTitle>
      <div className="mb-6 text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Officer Authentication </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your password to access officer reports
        </p>
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
