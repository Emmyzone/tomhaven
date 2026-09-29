import { supabase } from "../lib/supabaseClient";

export async function getSettings() {
  const { data, error } = await supabase
    .from("business_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateSettings(values) {
  const { data, error } = await supabase
    .from("business_settings")
    .update(values)
    .eq("id", 1)
    .select()
    .single();
  if (error) throw error;
  return data;
}
