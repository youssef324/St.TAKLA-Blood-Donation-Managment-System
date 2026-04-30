import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { supabaseAdmin } from './supabaseAdmin';

const JWT_SECRET = process.env.JWT_SECRET || 'BloodDonation2024Secret!@#$';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}