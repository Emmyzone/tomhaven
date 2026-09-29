import { supabase } from "../lib/supabaseClient";

const TABLE = "products";

// category = "phone" for the public site, null for the admin (everything).
export async function listProducts({ category = "phone" } = {}) {
  let query = supabase.from(TABLE).select("*").order("created_at", { ascending: false });
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getProduct(id) {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
  // 22P02 = the id in the URL is not a valid id. Treat it as "not found".
  if (error && error.code === "22P02") return null;
  if (error) throw error;
  return data;
}

export async function createProduct(values) {
  const { data, error } = await supabase.from(TABLE).insert(values).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, values) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
