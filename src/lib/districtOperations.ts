import { supabase } from "./supabase";

// Fetch all districts
export async function fetchAllDistricts() {
  const { data, error } = await supabase
    .from('district')
    .select('id, district');
  return { data, error };
}


// Get a single district by ID
export async function getDistrictById(id: number) {
  const { data, error } = await supabase
    .from('district')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
} 