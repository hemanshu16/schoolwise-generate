import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchAllExamNames, addExamName, updateExamName, deleteExamName } from '../examNameOperations';

// Define types for our data
export type ExamName = {
  id: number;
  exam_name: string;
  created_at?: string;
  // Add other fields from your table as needed
};

// Context type definition
type SupabaseContextType = {
  examNames: ExamName[];
  loading: boolean;
  error: string | null;
  refreshExamNames: () => Promise<void>;
  addNewExamName: (name: string) => Promise<{ success: boolean; error?: string }>;
  updateExistingExamName: (id: number, name: string) => Promise<{ success: boolean; error?: string }>;
  removeExamName: (id: number) => Promise<{ success: boolean; error?: string }>;
};

// Create the context with default values
const SupabaseContext = createContext<SupabaseContextType>({
  examNames: [],
  loading: false,
  error: null,
  refreshExamNames: async () => {},
  addNewExamName: async () => ({ success: false }),
  updateExistingExamName: async () => ({ success: false }),
  removeExamName: async () => ({ success: false }),
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
  }, []);

  // Create value object
  const value = {
    examNames,
    loading,
    error,
    refreshExamNames: fetchExamNames,
    addNewExamName,
    updateExistingExamName,
    removeExamName,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}; 