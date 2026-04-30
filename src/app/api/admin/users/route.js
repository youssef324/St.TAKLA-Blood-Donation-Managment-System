import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('user_id, username, role, is_active, created_at, last_login')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { username, password, role } = await request.json();
    if (!username || !password || role === undefined) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({ 
        username, 
        password_hash, 
        role, 
        is_active: true, 
        created_by: admin.userId 
      })
      .select('user_id, username, role, is_active, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      }
      // Handle the 'Maximum of 2 active admins allowed' trigger
      if (error.message && error.message.includes('Maximum of 2 active admins')) {
        return NextResponse.json({ error: 'Maximum of 2 active admins allowed. Please deactivate an existing admin first.' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { user_id, is_active, role, password } = await request.json();
    const updateData = {};
    if (is_active !== undefined) updateData.is_active = is_active;
    if (role !== undefined) updateData.role = role;
    if (password) updateData.password_hash = await bcrypt.hash(password, 10);

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('user_id', user_id)
      .select('user_id, username, role, is_active, created_at')
      .single();

    if (error) {
      if (error.message && error.message.includes('Maximum of 2 active admins')) {
        return NextResponse.json({ error: 'Cannot activate this admin: Maximum of 2 active admins allowed.' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}