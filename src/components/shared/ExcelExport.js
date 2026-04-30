'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { getYearsList } from '@/utils/dateUtils';
import { getCurrentYear, getCurrentSession } from '@/utils/helpers';
import { useToast } from '@/context/ToastContext';
import * as XLSX from 'xlsx';

export default function ExcelExport() {
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ 
    year: getCurrentYear(), 
    session: getCurrentSession() 
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      // Create Excel file
      const ws = XLSX.utils.json_to_sheet(data.data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Donors');

      // Generate filename
      const filename = `blood_donors_${
        filters.year || 'all_years'
      }${
        filters.session ? `_session_${filters.session}` : ''
      }.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);

      toast.success(`Exported ${data.total} records to Excel!`);
      setShowModal(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setShowModal(true)}>
        📊 Export Excel
      </Button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Export to Excel">
        <div className="space-y-4">
          <Select
            label="Year (optional)"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            options={getYearsList().map(y => ({ value: y, label: y.toString() }))}
            placeholder="All years"
          />

          <Select
            label="Session (optional)"
            value={filters.session}
            onChange={(e) => setFilters({ ...filters, session: e.target.value })}
            options={[
              { value: 1, label: 'First Session (Jan-Jun)' },
              { value: 2, label: 'Second Session (Jul-Dec)' },
            ]}
            placeholder="All sessions"
          />

          <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
            💡 Leave filters empty to export all historical data
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleExport} loading={loading} className="flex-1">
              📥 Download Excel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}