'use client';
import { useState, useEffect } from 'react';

export function useDonors(filters = {}) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDonors();
  }, [JSON.stringify(filters)]);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/donors?${params.toString()}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setDonors(data.donors || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { donors, loading, error, refetch: fetchDonors };
}