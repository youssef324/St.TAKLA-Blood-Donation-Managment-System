import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Search donors (all roles)
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const bloodType = searchParams.get('blood_type');
    const district = searchParams.get('district');
    const year = searchParams.get('year');
    const session = searchParams.get('session');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let supabaseQuery = supabaseAdmin
      .from('donors')
      .select(`
        *,
        districts:district_id (district_name),
        donations (*)
      `, { count: 'exact' })
      .eq('is_active', true);

    // Apply filters
    if (query) {
      supabaseQuery = supabaseQuery.or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone_number.ilike.%${query}%`
      );
    }
    if (bloodType) {
      supabaseQuery = supabaseQuery.eq('blood_type', bloodType);
    }
    if (district) {
      supabaseQuery = supabaseQuery.eq('district_id', district);
    }

    // Filter by year/session if provided
    if (year) {
      supabaseQuery = supabaseQuery.not('donations', 'is', null);
    }

    supabaseQuery = supabaseQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: donors, error, count } = await supabaseQuery;

    if (error) throw error;

    // Filter donations by year/session if needed
    let filteredDonors = donors;
    if (year || session) {
      filteredDonors = donors.filter(donor => {
        return donor.donations.some(donation => {
          let match = true;
          if (year) match = match && donation.donation_year === parseInt(year);
          if (session) match = match && donation.donation_session === parseInt(session);
          return match;
        });
      });
    }

    return NextResponse.json({
      donors: filteredDonors,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST - Add new donor (super_user & admin only)
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    const { first_name, last_name, birthdate, phone_number, blood_type, district_id, full_address, notes } = data;

    // Validate required fields
    if (!first_name || !last_name || !birthdate || !phone_number || !blood_type || !district_id) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    // Validate phone format
    if (!phone_number.startsWith('+20')) {
      return NextResponse.json(
        { error: 'Phone number must start with +20' },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const { data: existingDonor } = await supabaseAdmin
      .from('donors')
      .select('donor_id')
      .eq('phone_number', phone_number)
      .single();

    if (existingDonor) {
      return NextResponse.json(
        { error: 'A donor with this phone number already exists' },
        { status: 409 }
      );
    }

    // Insert new donor
    const { data: newDonor, error } = await supabaseAdmin
      .from('donors')
      .insert({
        user_id: user.userId,
        first_name,
        last_name,
        birthdate,
        phone_number,
        blood_type,
        district_id,
        full_address,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      donor: newDonor,
      message: 'Donor added successfully',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update donor (admin only)
export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    const { donor_id, ...updateData } = data;

    if (!donor_id) {
      return NextResponse.json(
        { error: 'Donor ID is required' },
        { status: 400 }
      );
    }

    const { data: updatedDonor, error } = await supabaseAdmin
      .from('donors')
      .update(updateData)
      .eq('donor_id', donor_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      donor: updatedDonor,
      message: 'Donor updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}