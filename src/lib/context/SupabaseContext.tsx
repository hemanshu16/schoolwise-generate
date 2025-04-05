import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchAllExamNames, addExamName, updateExamName, deleteExamName } from '../examNameOperations';
import { fetchAllDistricts, getDistrictById } from '../districtOperations';
import { fetchAllTaluks, fetchTaluksByDistrictId, getTalukById } from '../talukOperations';
import { fetchAllSchools, fetchSchoolsByTalukId, getSchoolById, School as SchoolType } from '../schoolOperations';

// Define types for our data
export type ExamName = {
  id: number;
  exam_name: string;
  created_at?: string;
  // Add other fields from your table as needed
};

export type District = {
  id: number;
  district: string;
  created_at?: string;
};

export type Taluk = {
  id: number;
  taluk: string;
  districtId: number;
  created_at?: string;
};

// Re-export the School type
export type School = SchoolType;

// Context type definition
type SupabaseContextType = {
  examNames: ExamName[];
  districts: District[];
  taluks: Taluk[];
  schools: School[];
  loading: boolean;
  error: string | null;
  
  // Exam Name operations
  refreshExamNames: () => Promise<void>;
  addNewExamName: (name: string) => Promise<{ success: boolean; error?: string }>;
  updateExistingExamName: (id: number, name: string) => Promise<{ success: boolean; error?: string }>;
  removeExamName: (id: number) => Promise<{ success: boolean; error?: string }>;
  
  // District operations - read only
  refreshDistricts: () => Promise<void>;
  getDistrictById: (id: number) => Promise<District | null>;
  
  // Taluk operations - read only
  refreshTaluks: () => Promise<void>;
  getTaluksByDistrict: (districtId: number) => Promise<void>;
  getTalukById: (id: number) => Promise<Taluk | null>;

  // School operations
  refreshSchools: () => Promise<void>;
  getSchoolsByTaluk: (talukId: number) => Promise<void>;
  getSchoolById: (id: number) => Promise<School | null>;
};

// Create the context with default values
const SupabaseContext = createContext<SupabaseContextType>({
  examNames: [],
  districts: [],
  taluks: [],
  schools: [],
  loading: false,
  error: null,
  
  // Exam Name operations
  refreshExamNames: async () => {},
  addNewExamName: async () => ({ success: false }),
  updateExistingExamName: async () => ({ success: false }),
  removeExamName: async () => ({ success: false }),
  
  // District operations - read only
  refreshDistricts: async () => {},
  getDistrictById: async () => null,
  
  // Taluk operations - read only
  refreshTaluks: async () => {},
  getTaluksByDistrict: async () => {},
  getTalukById: async () => null,

  // School operations
  refreshSchools: async () => {},
  getSchoolsByTaluk: async () => {},
  getSchoolById: async () => null,
});

// Hook to use the Supabase context
export const useSupabase = () => useContext(SupabaseContext);

// Props type for provider
type SupabaseProviderProps = {
  children: ReactNode;
};

// Provider component
export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [examNames, setExamNames] = useState<ExamName[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [taluks, setTaluks] = useState<Taluk[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch exam names from Supabase
  const fetchExamNames = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await fetchAllExamNames();
      
      if (error) throw error;
      
      setExamNames(data || []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch districts from Supabase
  const fetchDistricts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await fetchAllDistricts();
      
      if (error) throw error;
      
      setDistricts(data || []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to get a single district by ID
  const fetchDistrictById = async (id: number) => {
    try {
      const { data, error } = await getDistrictById(id);
      
      if (error) throw error;
      
      return data || null;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return null;
    }
  };

  // Function to fetch taluks from Supabase
  const fetchTaluks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await fetchAllTaluks();
      
      if (error) throw error;
      
      setTaluks(data || []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch taluks by district ID
  const fetchTaluksByDistrict = async (districtId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await fetchTaluksByDistrictId(districtId);
      
      if (error) throw error;
      
      setTaluks(data || []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to get a single taluk by ID
  const fetchTalukById = async (id: number) => {
    try {
      const { data, error } = await getTalukById(id);
      
      if (error) throw error;
      
      return data || null;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return null;
    }
  };

  // Function to fetch schools from Supabase
  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await fetchAllSchools();
      
      if (error) throw error;
      
      setSchools(data || []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch schools by taluk ID
  const fetchSchoolsByTaluk = async (talukId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await fetchSchoolsByTalukId(talukId);
      console.log(data.length);
      if (error) throw error;
      
      setSchools(data || []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to get a single school by ID
  const fetchSchoolById = async (id: number) => {
    try {
      const { data, error } = await getSchoolById(id);
      
      if (error) throw error;
      
      return data || null;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return null;
    }
  };

  // Exam Name operations
  // Add a new exam name
  const addNewExamName = async (name: string) => {
    try {
      const { data, error } = await addExamName(name);
      
      if (error) throw error;
      
      // Refresh the list
      await fetchExamNames();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      return { success: false, error: errorMessage };
    }
  };

  // Update an existing exam name
  const updateExistingExamName = async (id: number, name: string) => {
    try {
      const { data, error } = await updateExamName(id, name);
      
      if (error) throw error;
      
      // Refresh the list
      await fetchExamNames();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      return { success: false, error: errorMessage };
    }
  };

  // Remove an exam name
  const removeExamName = async (id: number) => {
    try {
      const { error } = await deleteExamName(id);
      
      if (error) throw error;
      
      // Refresh the list
      await fetchExamNames();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      return { success: false, error: errorMessage };
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchExamNames();
    fetchDistricts();
    fetchTaluks();
    fetchSchools();
  }, []);

  // Create value object
  const value = {
    examNames,
    districts,
    taluks,
    schools,
    loading,
    error,
    
    // Exam Name operations
    refreshExamNames: fetchExamNames,
    addNewExamName,
    updateExistingExamName,
    removeExamName,
    
    // District operations - read only
    refreshDistricts: fetchDistricts,
    getDistrictById: fetchDistrictById,
    
    // Taluk operations - read only
    refreshTaluks: fetchTaluks,
    getTaluksByDistrict: fetchTaluksByDistrict,
    getTalukById: fetchTalukById,

    // School operations
    refreshSchools: fetchSchools,
    getSchoolsByTaluk: fetchSchoolsByTaluk,
    getSchoolById: fetchSchoolById,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}; 