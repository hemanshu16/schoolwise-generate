
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import PinAuth from "@/components/auth/PinAuth";
import OfficerAuth from "@/components/auth/OfficerAuth";
import { OfficerPermission } from "@/components/auth/OfficerAuth";
import ExamNameInput from "@/components/reports/ExamNameInput";

interface AuthenticationModalsProps {
  showAuthModal: boolean;
  showExamNameModal: boolean;
  showUnfilledSchoolsModal: boolean;
  currentAuthEntity: "district" | "taluk" | "school" | null;
  entityId: string | null;
  userRole: "teacher" | "officer" | null;
  pendingReportType: "district" | "taluk" | null;
  isDownloading: boolean;
  onAuthDialogChange: (open: boolean) => void;
  onExamNameModalChange: (open: boolean) => void;
  onUnfilledSchoolsModalChange: (open: boolean) => void;
  onOfficerAuthenticate: (permission: OfficerPermission) => void;
  onAuthenticate: () => void;
  onExamNameSubmit: (examName: string) => void;
  onUnfilledSchoolsExamNameSubmit: (examName: string) => void;
}

const AuthenticationModals = ({
  showAuthModal,
  showExamNameModal,
  showUnfilledSchoolsModal,
  currentAuthEntity,
  entityId,
  userRole,
  pendingReportType,
  isDownloading,
  onAuthDialogChange,
  onExamNameModalChange,
  onUnfilledSchoolsModalChange,
  onOfficerAuthenticate,
  onAuthenticate,
  onExamNameSubmit,
  onUnfilledSchoolsExamNameSubmit
}: AuthenticationModalsProps) => {
  return (
    <>
      {/* Authentication Modal */}
      <Dialog open={showAuthModal} onOpenChange={onAuthDialogChange}>
        <DialogContent className="sm:max-w-md">
          {userRole === "officer" && !currentAuthEntity ? (
            <>
              <DialogTitle className="sr-only">Officer Authentication</DialogTitle>
              <OfficerAuth onAuthenticate={onOfficerAuthenticate} />
            </>
          ) : (
            <>
              <DialogTitle className="sr-only">Authentication Required</DialogTitle>
              <PinAuth
                entityType={currentAuthEntity}
                entityId={entityId}
                onAuthenticate={onAuthenticate}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Exam Name Modal */}
      <Dialog 
        open={showExamNameModal} 
        onOpenChange={onExamNameModalChange}
      >
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Select Exam</DialogTitle>
          <ExamNameInput onSubmit={onExamNameSubmit} />
        </DialogContent>
      </Dialog>

      {/* Unfilled Schools Modal */}
      <Dialog 
        open={showUnfilledSchoolsModal} 
        onOpenChange={onUnfilledSchoolsModalChange}
      >
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Download Unfilled Schools List</DialogTitle>
          <ExamNameInput onSubmit={onUnfilledSchoolsExamNameSubmit} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthenticationModals;
