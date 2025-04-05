import React, { useEffect, useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useSupabase } from '@/lib/context/SupabaseContext';
import { District } from '@/lib/context/SupabaseContext';

interface DistrictDropdownProps {
  onDistrictChange: (districtId: number) => void;
  defaultValue?: string; // Optional default value
  placeholder?: string;
  className?: string;
}

export function DistrictDropdown({
  onDistrictChange,
  defaultValue,
  placeholder = "Select district",
  className
}: DistrictDropdownProps) {
  const { districts, refreshDistricts, loading } = useSupabase();
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(defaultValue);
  
  // Refresh districts if not available
  useEffect(() => {
    if (districts.length === 0 && !loading) {
      refreshDistricts();
    }
  }, [districts, refreshDistricts, loading]);

  // Handle selection change
  const handleChange = (value: string) => {
    setSelectedDistrict(value);
    const districtId = parseInt(value, 10);
    onDistrictChange(districtId);
  };

  return (
    <Select 
      value={selectedDistrict} 
      onValueChange={handleChange}
      disabled={loading}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {districts.map((district: District) => (
          <SelectItem 
            key={district.id} 
            value={district.id.toString()}
          >
            {district.district}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 