'use client';
import { useState, useEffect, useCallback } from 'react';
import { FaEye, FaPlusCircle, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';

export default function DonorTable({ refreshKey, isAdmin, onEdit, onAddDonation, onView }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const toast = useToast();

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        query: query
      });
      const res = await fetch(`/api/donors?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setDonors(data.donors);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load donors: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [page, query, toast]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors, refreshKey]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this donor?')) return;
    try {
      const res = await fetch(`/api/donors?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to deactivate');
      toast.success('Donor deactivated');
      fetchDonors();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const columns = [
    {
      header: 'Name',
      render: (donor) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-xs">
            {donor.blood_type}
          </div>
          <div>
            <p className="font-medium text-gray-800">{donor.first_name} {donor.last_name}</p>
            <p className="text-xs text-gray-500">{donor.phone_number}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Blood Type',
      accessor: 'blood_type',
    },
    {
      header: 'District',
      render: (donor) => donor.districts?.district_name || 'N/A'
    },
    {
      header: 'Actions',
      render: (donor) => (
        <div className="flex gap-2">
          {onView && (
            <Button size="small" variant="outline" onClick={() => onView(donor)}>
              <FaEye className="inline mr-1" /> View
            </Button>
          )}
          {onAddDonation && (
            <Button size="small" variant="success" onClick={() => onAddDonation(donor)}>
              <FaPlusCircle className="inline mr-1" /> +Donation
            </Button>
          )}
          {onEdit && (
            <Button size="small" variant="secondary" onClick={() => onEdit(donor)}>
              <FaEdit className="inline mr-1" /> Edit
            </Button>
          )}
          {isAdmin && (
            <Button size="small" variant="ghost" onClick={() => handleDelete(donor.donor_id)}>
              <FaTrash />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="w-72">
          <Input
            placeholder="Search donors..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            icon={<FaSearch />}
          />
        </div>
        <div className="text-sm text-gray-500">
          Total: {total} donors
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          columns={columns}
          data={donors}
          loading={loading}
          emptyMessage="No donors found"
        />
      </div>

      {total > 10 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button
            variant="ghost"
            size="small"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm font-medium">
            Page {page} of {Math.ceil(total / 10)}
          </span>
          <Button
            variant="ghost"
            size="small"
            disabled={page >= Math.ceil(total / 10)}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}