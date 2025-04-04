import React from 'react';
import ExamNameManager from '@/components/admin/ExamNameManager';

const Admin: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="space-y-8">
        <section>
          <ExamNameManager />
        </section>
        
        {/* Add more admin sections here as needed */}
      </div>
    </div>
  );
};

export default Admin; 