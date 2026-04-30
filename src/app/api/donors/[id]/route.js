import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: donor, error } = await supabaseAdmin
      .from('donors')
      .select('*, districts:district_id (district_name), donations (*)')
      .eq('donor_id', id)
      .single();

    if (error) throw error;

    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    // Sort donations by date
    if (donor.donations) {
      donor.donations.sort((a, b) => new Date(b.donation_date) - new Date(a.donation_date));
    }

    return NextResponse.json({ donor });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
