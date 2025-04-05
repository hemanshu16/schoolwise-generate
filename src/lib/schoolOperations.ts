import { supabase } from "./supabase";

// Define the School type based on database schema
export type School = {
  id: number;
  school_name: string;
  taluk_id: number;
  sheet_id?: string;
  type?: string;
  created_at?: string;
};

// Fetch all schools
export async function fetchAllSchools() {
  const { data, error } = await supabase
    .from('school')
    .select('*');
  
  return { data, error };
}

// Fetch schools by taluk ID
export async function fetchSchoolsByTalukId(talukId: number) {
  const { data, error } = await supabase
    .from('school')
    .select('*')
    .eq('taluk_id', talukId);
  
  return { data, error };
}

// Get a single school by ID
export async function getSchoolById(id: number) {
  const { data, error } = await supabase
    .from('school')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
}

// Add a new school
export async function addSchool(school_name: string, taluk_id: number, link?: string, type?: string) {
  const { data, error } = await supabase
    .from('school')
    .insert([{ school_name, taluk_id, link, type }])
    .select();
  
  return { data, error };
}

// Update a school
export async function updateSchool(id: number, school_name: string, taluk_id: number, link?: string, type?: string) {
  const { data, error } = await supabase
    .from('school')
    .update({ school_name, taluk_id, link, type })
    .eq('id', id)
    .select();
  
  return { data, error };
}

// Delete a school
export async function deleteSchool(id: number) {
  const { error } = await supabase
    .from('school')
    .delete()
    .eq('id', id);
  
  return { error };
} 