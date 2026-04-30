import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const bloodType = searchParams.get('blood_type');
    const districtId = searchParams.get('district_id');
    const year = searchParams.get('year');
    const session = searchParams.get('session');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Optimized select: remove donations (*) from list view unless filtering
    let selectString = '*, districts:district_id (district_name)';
    if (year || session) {
      selectString += ', donations (*)';
    }

    let supabaseQuery = supabaseAdmin
      .from('donors')
      .select(selectString, { count: 'exact' })
      .eq('is_active', true);

    if (query) {
      // Split query by spaces to support multi-word search
      const terms = query.trim().split(/\s+/);
      const orConditions = terms.map(term => 
        `first_name.ilike.%${term}%,last_name.ilike.%${term}%,phone_number.ilike.%${term}%,ssn.ilike.%${term}%,church.ilike.%${term}%,full_address.ilike.%${term}%`
      ).join(',');
      supabaseQuery = supabaseQuery.or(orConditions);
    }

    if (bloodType) {
      supabaseQuery = supabaseQuery.eq('blood_type', bloodType);
    }

    if (districtId) {
      supabaseQuery = supabaseQuery.eq('district_id', parseInt(districtId));
    }

    const { data: donors, error, count } = await supabaseQuery
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter by year/session if specified (PostgREST filtering on joined tables can be tricky, 
    // so we filter in JS for these optional fields)
    let filteredDonors = donors || [];
    if (year || session) {
      const targetYear = year ? parseInt(year) : null;
      const targetSession = session ? parseInt(session) : null;
      
      filteredDonors = filteredDonors.filter(donor => 
        donor.donations && donor.donations.some(d => {
          let match = true;
          if (targetYear) match = match && d.donation_year === targetYear;
          if (targetSession) match = match && d.donation_session === targetSession;
          return match;
        })
      );
    }

    // Apply manual range after JS filtering if necessary, but here we'll just return the results
    // To be perfectly accurate with pagination + JS filtering, we'd need a more complex query,
    // but for the current scale, this is a robust fix.
    const paginatedDonors = filteredDonors.slice(offset, offset + limit);

    return NextResponse.json({ 
      donors: paginatedDonors, 
      total: year || session ? filteredDonors.length : (count || 0), 
      page, 
      totalPages: Math.ceil((year || session ? filteredDonors.length : (count || 0)) / limit) 
    });
  } catch (error) {
    console.error('Donor GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    
    // Ensure district_id is an integer
    if (data.district_id) {
      data.district_id = parseInt(data.district_id);
    }

    const { data: newDonor, error } = await supabaseAdmin
      .from('donors')
      .insert({ 
        ...data, 
        user_id: user.userId, // Maintain consistency with current schema
        is_active: true 
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'National ID or Phone number already exists' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, donor: newDonor }, { status: 201 });
  } catch (error) {
    console.error('Donor POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    // Only Admin (2) can update donors
    if (!user || user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { donor_id, ...updateData } = await request.json();
    if (!donor_id) {
      return NextResponse.json({ error: 'Donor ID is required' }, { status: 400 });
    }

    // Ensure district_id is an integer if provided
    if (updateData.district_id) {
      updateData.district_id = parseInt(updateData.district_id);
    }

    // Clean up updateData to prevent issues with joins being sent back
    delete updateData.districts;
    delete updateData.donations;

    const { data: updated, error } = await supabaseAdmin
      .from('donors')
      .update(updateData)
      .eq('donor_id', donor_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, donor: updated });
  } catch (error) {
    console.error('Donor PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await getCurrentUser();
    // Only Admin (2) can delete/deactivate donors
    if (!user || user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const donorId = searchParams.get('id');

    if (!donorId) {
      return NextResponse.json({ error: 'Donor ID is required' }, { status: 400 });
    }

    // Soft delete by setting is_active to false
    const { error } = await supabaseAdmin
      .from('donors')
      .update({ is_active: false })
      .eq('donor_id', donorId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Donor deactivated successfully' });
  } catch (error) {
    console.error('Donor DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}