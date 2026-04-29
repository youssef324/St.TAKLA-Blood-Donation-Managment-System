'use client';
import { useAuth } from '@/context/AuthContext';

export default function RoleGate({ children, roles = [] }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) return null;

  return children;
}