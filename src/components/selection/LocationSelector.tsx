import React, { useState } from 'react';
import { DistrictDropdown } from './DistrictDropdown';
import { TalukDropdown } from './TalukDropdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LocationSelectorProps {
  onDistrictChange?: (districtId: number) => void;
  onTalukChange?: (talukId: number) => void;
  title?: string;
}

export function LocationSelector({
  onDistrictChange,
  onTalukChange,
  title = "Location Selection"
}: LocationSelectorProps) {
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | undefined>();
  const [selectedTalukId, setSelectedTalukId] = useState<number | undefined>();

  // Handle district selection
  const handleDistrictChange = (districtId: number) => {
    setSelectedDistrictId(districtId);
    setSelectedTalukId(undefined); // Reset taluk when district changes
    
    // Call external handler if provided
    if (onDistrictChange) {
      onDistrictChange(districtId);
    }
  };

  // Handle taluk selection
  const handleTalukChange = (talukId: number) => {
    setSelectedTalukId(talukId);
    
    // Call external handler if provided
    if (onTalukChange) {
      onTalukChange(talukId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
              District
            </label>
            <DistrictDropdown 
              onDistrictChange={handleDistrictChange} 
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
              Taluk
            </label>
            <TalukDropdown 
              districtId={selectedDistrictId} 
              onTalukChange={handleTalukChange}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 