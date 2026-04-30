import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('districts')
      .select('*')
      .order('district_name');

    if (error) throw error;

    return NextResponse.json({ districts: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
