import RoleSelector from "@/components/selection/RoleSelector";

interface RoleSelectionViewProps {
  onSelectRole: (role: "teacher" | "officer") => void;
}

const RoleSelectionView = ({ onSelectRole }: RoleSelectionViewProps) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl sm:text-2xl md:text-3xl font-semibold text-center mb-4 sm:mb-6 md:mb-8">Select Your Role</h2>
      <RoleSelector onSelectRole={onSelectRole} />
    </div>
  );
};

export default RoleSelectionView;
