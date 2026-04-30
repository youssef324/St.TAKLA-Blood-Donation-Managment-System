import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// GET - Get donations for a donor
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const donorId = searchParams.get('donor_id');
    const year = searchParams.get('year');

    let query = supabaseAdmin
      .from('donations')
      .select('*')
      .order('donation_year', { ascending: false })
      .order('donation_session', { ascending: false });

    if (donorId) {
      query = query.eq('donor_id', donorId);
    }
    if (year) {
      query = query.eq('donation_year', parseInt(year));
    }

    const { data: donations, error } = await query;

    if (error) throw error;

    return NextResponse.json({ donations });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST - Add donation session (super_user & admin)
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { 
      donor_id, 
      donation_year, 
      donation_session, 
      donation_date,
      bag_number,
      hb_level,
      blood_pressure,
      weight,
      notes
    } = await request.json();

    if (!donor_id || !donation_year || !donation_session) {
      return NextResponse.json(
        { error: 'Donor ID, year, and session are required' },
        { status: 400 }
      );
    }

    // Check if donation already exists for this session
    const { data: existingDonation } = await supabaseAdmin
      .from('donations')
      .select('donation_id')
      .eq('donor_id', donor_id)
      .eq('donation_year', donation_year)
      .eq('donation_session', donation_session)
      .single();

    if (existingDonation) {
      return NextResponse.json(
        { error: 'This donor has already donated in this session' },
        { status: 409 }
      );
    }

    // Add donation
    const { data: newDonation, error } = await supabaseAdmin
      .from('donations')
      .insert({
        donor_id,
        donation_year,
        donation_session,
        donation_date: donation_date || new Date().toISOString(),
        bag_number,
        hb_level,
        blood_pressure,
        weight,
        notes,
        added_by: user.userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      donation: newDonation,
      message: 'Donation added successfully',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}