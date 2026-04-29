import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// POST - Export data to Excel
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { year, session } = await request.json();

    // Get donors with their donations
    let query = supabaseAdmin
      .from('donors')
      .select(`
        donor_id,
        first_name,
        last_name,
        phone_number,
        blood_type,
        full_address,
        notes,
        created_at,
        districts (district_name),
        donations (
          donation_year,
          donation_session,
          donation_date
        )
      `);

    const { data: donors, error } = await query;

    if (error) throw error;

    // Filter donations by year/session if specified
    let exportData = donors;
    
    if (year || session) {
      exportData = donors
        .map(donor => ({
          ...donor,
          donations: donor.donations.filter(d => {
            let match = true;
            if (year) match = match && d.donation_year === parseInt(year);
            if (session) match = match && d.donation_session === parseInt(session);
            return match;
          })
        }))
        .filter(donor => donor.donations.length > 0);
    }

    // Flatten data for Excel
    const rows = exportData.flatMap(donor => {
      if (donor.donations.length === 0) {
        return [{
          'First Name': donor.first_name,
          'Last Name': donor.last_name,
          'Phone': donor.phone_number,
          'Blood Type': donor.blood_type,
          'District': donor.districts?.district_name || '',
          'Address': donor.full_address,
          'Notes': donor.notes,
          'Donation Year': '',
          'Session': '',
          'Donation Date': '',
        }];
      }

      return donor.donations.map(donation => ({
        'First Name': donor.first_name,
        'Last Name': donor.last_name,
        'Phone': donor.phone_number,
        'Blood Type': donor.blood_type,
        'District': donor.districts?.district_name || '',
        'Address': donor.full_address,
        'Notes': donor.notes,
        'Donation Year': donation.donation_year,
        'Session': donation.donation_session === 1 ? 'First (Jan-Jun)' : 'Second (Jul-Dec)',
        'Donation Date': donation.donation_date || '',
      }));
    });

    return NextResponse.json({
      success: true,
      data: rows,
      total: rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}