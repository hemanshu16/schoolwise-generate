
import { LightbulbIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Step = ({ number, title, description, icon }: StepProps) => {
  return (
    <div className="step-card">
      <div className="step-number">{number}</div>
      <div className="step-title">{title}</div>
      <div className="step-divider"></div>
      <div className="text-teal-600 mb-4">{icon}</div>
      <h4 className="font-semibold mb-2">{description}</h4>
      <p className="text-sm text-gray-600">
        What is my learning style? How to study different chapters? How to manage different distractions?
      </p>
    </div>
  );
};

interface StepsProps {
  className?: string;
}

const Steps = ({ className }: StepsProps) => {
  return (
    <div className={cn("py-16 bg-white", className)}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Step 
            number="01." 
            title="Study Skills" 
            description="Learn to learn."
            icon={<LightbulbIcon className="w-16 h-16" />}
          />
          <Step 
            number="02." 
            title="Stream Selection" 
            description="How to make the decision: Which stream after 10th?"
            icon={
              <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8L12 20M12 8L8 12M12 8L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 12H6M18 12H20M7 5H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
          />
          <Step 
            number="03." 
            title="Exam Prep" 
            description="Be exam ready."
            icon={
              <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Steps;
