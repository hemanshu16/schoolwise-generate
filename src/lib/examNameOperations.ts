import { supabase } from "./supabase";
import { ExamName } from "./context/SupabaseContext";

// Fetch all exam names
export async function fetchAllExamNames() {
  const { data, error } = await supabase
    .from('exam_name')
    .select('*');
  
  return { data, error };
}

// Add a new exam name
export async function addExamName(name: string) {
  const { data, error } = await supabase
    .from('exam_name')
    .insert([{ name }])
    .select();
  
  return { data, error };
}

// Update an exam name
export async function updateExamName(id: number, name: string) {
  const { data, error } = await supabase
    .from('exam_name')
    .update({ name })
    .eq('id', id)
    .select();
  
  return { data, error };
}

// Delete an exam name
export async function deleteExamName(id: number) {
  const { error } = await supabase
    .from('exam_name')
    .delete()
    .eq('id', id);
  
  return { error };
}

// Get a single exam name by ID
export async function getExamNameById(id: number) {
  const { data, error } = await supabase
    .from('exam_name')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
} 