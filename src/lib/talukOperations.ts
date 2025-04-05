import { supabase } from "./supabase";
import { Taluk } from "./context/SupabaseContext";

// Fetch all taluks
export async function fetchAllTaluks() {
  const { data, error } = await supabase
    .from('taluk')
    .select('*');
  
  return { data, error };
}

// Fetch taluks by district ID
export async function fetchTaluksByDistrictId(districtId: number) {
  const { data, error } = await supabase
    .from('taluk')
    .select('*')
    .eq('districtId', districtId);
  
  return { data, error };
}

// Add a new taluk
export async function addTaluk(taluk: string, districtId: number) {
  const { data, error } = await supabase
    .from('taluk')
    .insert([{ taluk, districtId }])
    .select();
  
  return { data, error };
}

// Update a taluk
export async function updateTaluk(id: number, taluk: string, districtId: number) {
  const { data, error } = await supabase
    .from('taluk')
    .update({ taluk, districtId })
    .eq('id', id)
    .select();
  
  return { data, error };
}

// Delete a taluk
export async function deleteTaluk(id: number) {
  const { error } = await supabase
    .from('taluk')
    .delete()
    .eq('id', id);
  
  return { error };
}

// Get a single taluk by ID
export async function getTalukById(id: number) {
  const { data, error } = await supabase
    .from('taluk')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
} 