import React, { useEffect, useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useSupabase } from '@/lib/context/SupabaseContext';
import { Taluk } from '@/lib/context/SupabaseContext';

interface TalukDropdownProps {
  districtId?: number; // The selected district ID to filter taluks
  onTalukChange: (talukId: number) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

export function TalukDropdown({
  districtId,
  onTalukChange,
  defaultValue,
  placeholder = "Select taluk",
  className
}: TalukDropdownProps) {
  const { taluks, refreshTaluks, getTaluksByDistrict, loading } = useSupabase();
  const [selectedTaluk, setSelectedTaluk] = useState<string | undefined>(defaultValue);
  
  // Fetch taluks when districtId changes
  useEffect(() => {
    if (districtId) {
      getTaluksByDistrict(districtId);
    } else {
      // If no district selected, load all taluks
      refreshTaluks();
    }
  }, [districtId, getTaluksByDistrict, refreshTaluks]);

  // Reset selection when district changes
  useEffect(() => {
    setSelectedTaluk(undefined);
  }, [districtId]);

  // Handle selection change
  const handleChange = (value: string) => {
    setSelectedTaluk(value);
    const talukId = parseInt(value, 10);
    onTalukChange(talukId);
  };

  return (
    <Select 
      value={selectedTaluk} 
      onValueChange={handleChange}
      disabled={loading || taluks.length === 0}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {taluks.map((taluk: Taluk) => (
          <SelectItem 
            key={taluk.id} 
            value={taluk.id.toString()}
          >
            {taluk.taluk}
          </SelectItem>
        ))}
        {taluks.length === 0 && !loading && (
          <SelectItem value="no-data" disabled>
            {districtId ? "No taluks found for this district" : "Please select a district first"}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
} 