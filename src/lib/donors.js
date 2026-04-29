import { supabaseAdmin } from './supabase';

export async function getDonorById(donorId) {
  const { data, error } = await supabaseAdmin
    .from('donors')
    .select(`
      *,
      districts:district_id (district_name),
      donations (*)
    `)
    .eq('donor_id', donorId)
    .single();

  if (error) throw error;
  return data;
}

export async function getDonorsByBloodType(bloodType) {
  const { data, error } = await supabaseAdmin
    .from('donors')
    .select(`
      *,
      districts:district_id (district_name)
    `)
    .eq('blood_type', bloodType)
    .eq('is_active', true);

  if (error) throw error;
  return data;
}

export async function getDonorsByDistrict(districtId) {
  const { data, error } = await supabaseAdmin
    .from('donors')
    .select(`
      *,
      districts:district_id (district_name)
    `)
    .eq('district_id', districtId)
    .eq('is_active', true);

  if (error) throw error;
  return data;
}