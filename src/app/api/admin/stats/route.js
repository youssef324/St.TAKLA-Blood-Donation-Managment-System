import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 1 && user.role !== 2)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentSession = currentMonth <= 6 ? 1 : 2;

    // Get donor count
    const { count: donorCount } = await supabaseAdmin
      .from('donors')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get total donation count
    const { count: donationCount } = await supabaseAdmin
      .from('donations')
      .select('*', { count: 'exact', head: true });

    // Get this year's donations
    const { count: thisYearCount } = await supabaseAdmin
      .from('donations')
      .select('*', { count: 'exact', head: true })
      .eq('donation_year', currentYear);

    // Get this session's donations
    const { count: thisSessionCount } = await supabaseAdmin
      .from('donations')
      .select('*', { count: 'exact', head: true })
      .eq('donation_year', currentYear)
      .eq('donation_session', currentSession);

    // Get user count (only for admins)
    let userCount = 0;
    if (user.role === 2) {
      const { count: uCount } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      userCount = uCount || 0;
    }

    // Get blood type distribution
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Not listed'];
    const distribution = {};
    
    await Promise.all(bloodTypes.map(async (type) => {
      const { count } = await supabaseAdmin
        .from('donors')
        .select('*', { count: 'exact', head: true })
        .eq('blood_type', type)
        .eq('is_active', true);
      distribution[type] = count || 0;
    }));

    return NextResponse.json({
      donors: donorCount || 0,
      donations: donationCount || 0,
      thisYear: thisYearCount || 0,
      thisSession: thisSessionCount || 0,
      users: userCount,
      bloodTypeDistribution: distribution,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
