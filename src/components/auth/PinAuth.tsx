import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, FileSpreadsheet, Key, LockKeyhole } from "lucide-react";
import { useFadeAnimation } from "@/utils/animations";
import { toast } from "sonner";
import { districts, schools, taluks } from "@/utils/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useSupabase } from '@/lib/context/SupabaseContext';

// Types
interface PinAuthProps {
  entityType: "district" | "taluk" | "school";
  entityId: string | null;
  onAuthenticate: (providedExamName?: string) => void;
  authPurpose?: "report" | "sheet";
  requireExamName?: boolean;
  className?: string;
}

interface AuthHeaderProps {
  authPurpose: "report" | "sheet";
  entityName: string;
}

interface PinInputProps {
  pin: string;
  setPin: (pin: string) => void;
  error: string;
  setError: (error: string) => void;
  authPurpose: "report" | "sheet";
}

interface ExamSelectorProps {
  examName: string;
  setExamName: (examName: string) => void;
  loadingExams: boolean;
  examNames: any[];
}

interface SubmitButtonProps {
  isSubmitting: boolean;
  pin: string;
  examName: string;
  authPurpose: "report" | "sheet";
  isDisabled: boolean;
}

// We'll keep this for backward compatibility but it won't be used
export const examOptions = [
  "FA-1",
  "FA-2",
  "SA-1",
  "FA-3",
  "FA-4",
  "Preparatory 1",
  "Preparatory 2",
  "Preparatory 3",
  "SA-2",
  "Unit Test 1",
  "Unit Test 2",
  "Unit Test 3",
  "Unit Test 4",
  "Unit Test 5",
  "Unit Test 6",
  "Unit Test 7",
  "Unit Test 8",
  "Unit Test 9",
  "Unit Test 10"
];

// Hook to handle entity-related operations
const useEntityDetails = (entityType: "district" | "taluk" | "school", entityId: string | null) => {
  const getEntityName = () => {
    if (entityType === "district" && entityId) {
      return districts.find((d) => d.id === entityId)?.name || "";
    } else if (entityType === "taluk" && entityId) {
      return taluks.find((t) => t.id === entityId)?.name || "";
    } else if (entityType === "school" && entityId) {
      return schools.find((s) => s.id === entityId)?.name || "";
    }
    return "";
  };

  const getEntityPin = () => {
    if (entityType === "district" && entityId) {
      return districts.find((d) => d.id === entityId)?.password || "";
    } else if (entityType === "taluk" && entityId) {
      return taluks.find((t) => t.id === entityId)?.pin || "";
    } else if (entityType === "school" && entityId) {
      return schools.find((s) => s.id === entityId)?.pin || "";
    }
    return "";
  };

  return {
    entityName: getEntityName(),
    correctPin: getEntityPin()
  };
};

// Component for auth header with icon and title
const AuthHeader = ({ authPurpose, entityName }: AuthHeaderProps) => (
  <div className="mb-6 text-center">
    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10 text-primary">
      {authPurpose === "report" ? (
        <LockKeyhole className="w-8 h-8" />
      ) : (
        <FileSpreadsheet className="w-8 h-8" />
      )}
    </div>
    <h2 className="text-xl font-semibold mb-2">
      {authPurpose === "report" ? "Authentication Required" : "Enter DISE Code"}
    </h2>
    <p className="text-muted-foreground">
      {`Please enter the DISE code for ${entityName} to access Google Sheet`}
    </p>
  </div>
);

// Component for PIN input field
const PinInput = ({ pin, setPin, error, setError, authPurpose }: PinInputProps) => (
  <div>
    <label htmlFor="pin" className="block text-sm font-medium mb-2 flex items-center gap-1.5">
      <Key className="w-3.5 h-3.5" />
      {"DISE Code"}
    </label>
    <input
      id="pin"
      type="password"
      placeholder={"Enter DISE code"}
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
);

// Component for exam selector
const ExamSelector = ({ examName, setExamName, loadingExams, examNames }: ExamSelectorProps) => (
  <div className="space-y-2">
    <label htmlFor="examNameSelect" className="text-sm font-medium">
      Exam Name
    </label>
    <Select
      value={examName}
      onValueChange={setExamName}
      disabled={loadingExams}
    >
      <SelectTrigger id="examNameSelect" className="w-full">
        <SelectValue placeholder={loadingExams ? "Loading exams..." : "Select an exam"} />
      </SelectTrigger>
      <SelectContent>
        {loadingExams ? (
          <SelectItem value="loading" disabled>Loading exams...</SelectItem>
        ) : examNames.length > 0 ? (
          examNames.map((exam) => (
            <SelectItem key={exam.id} value={exam.exam_name}>
              {exam.exam_name}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-data" disabled>No exams found</SelectItem>
        )}
      </SelectContent>
    </Select>
  </div>
);

// Component for submit button
const SubmitButton = ({ isSubmitting, pin, examName, authPurpose, isDisabled }: SubmitButtonProps) => (
  <button
    type="submit"
    disabled={isDisabled}
    className={cn(
      "w-full py-2.5 px-4 rounded-md bg-primary text-primary-foreground font-medium transition-all",
      "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1",
      "hover:bg-primary/90 active:bg-primary/80",
      isDisabled && "opacity-70 cursor-not-allowed"
    )}
  >
    {isSubmitting
      ? (authPurpose === "report" ? "Authenticating..." : "Verifying...")
      : (authPurpose === "report" ? "Authenticate" : "Access Google Sheet")}
  </button>
);

// Main PinAuth component
const PinAuth = ({
  entityType,
  entityId,
  onAuthenticate,
  authPurpose = "report",
  requireExamName = false,
  className
}: PinAuthProps) => {
  const [pin, setPin] = useState("");
  const [examName, setExamName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const animation = useFadeAnimation(true);
  const { examNames, loading: loadingExams } = useSupabase();
  const { entityName, correctPin } = useEntityDetails(entityType, entityId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Simulate an API call
    setTimeout(() => {
      if (pin === correctPin) {
        const message = authPurpose === "report"
          ? `Successfully authenticated for ${entityName} report`
          : `Google Sheet access granted for ${entityName}`;
        toast.success(message);

        onAuthenticate(examName);
      } else {
        const errorMessage = authPurpose === "report"
          ? "Authentication failed. Please check your PIN and try again."
          : "Google Sheet access denied. Invalid DISE code.";
        setError("Incorrect PIN. Please try again.");
        toast.error(errorMessage);
      }
      setIsSubmitting(false);
    }, 800);
  };

  const isButtonDisabled = !pin.trim() || isSubmitting || (authPurpose === "report" && !examName);

  return (
    <div className={cn("w-full max-w-sm mx-auto", animation, className)}>
      <AuthHeader authPurpose={authPurpose} entityName={entityName} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <PinInput 
          pin={pin} 
          setPin={setPin} 
          error={error} 
          setError={setError} 
          authPurpose={authPurpose} 
        />
        
        {authPurpose === "report" && (
          <ExamSelector 
            examName={examName} 
            setExamName={setExamName} 
            loadingExams={loadingExams} 
            examNames={examNames} 
          />
        )}
        
        <SubmitButton 
          isSubmitting={isSubmitting} 
          pin={pin} 
          examName={examName} 
          authPurpose={authPurpose}
          isDisabled={isButtonDisabled}
        />
      </form>
    </div>
  );
};

export default PinAuth;
