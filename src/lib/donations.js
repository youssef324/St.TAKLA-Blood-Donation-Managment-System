import { supabaseAdmin } from './supabase';

export async function getDonorDonations(donorId) {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('*')
    .eq('donor_id', donorId)
    .order('donation_year', { ascending: false })
    .order('donation_session', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getDonationsByYear(year) {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .select(`
      *,
      donors:donor_id (
        first_name,
        last_name,
        blood_type,
        phone_number
      )
    `)
    .eq('donation_year', year)
    .order('donation_session', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getDonationsBySession(year, session) {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .select(`
      *,
      donors:donor_id (
        first_name,
        last_name,
        blood_type,
        phone_number
      )
    `)
    .eq('donation_year', year)
    .eq('donation_session', session);

  if (error) throw error;
  return data;
}