'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { BLOOD_TYPES } from '@/utils/constants';
import { getYearsList } from '@/utils/dateUtils';
import { getCurrentYear, getCurrentSession } from '@/utils/helpers';
import { useToast } from '@/context/ToastContext';

export default function WhatsAppSender({ onClose }) {
  const [messageType, setMessageType] = useState('text');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [filters, setFilters] = useState({
    blood_type: '',
    year: getCurrentYear(),
    session: getCurrentSession(),
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const toast = useToast();

  const handleSend = async () => {
    if (messageType === 'text' && !message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    if (messageType === 'image' && !imageUrl.trim()) {
      toast.error('Please enter image URL');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...filters,
          message_type: messageType,
          message_content: message,
          media_url: messageType === 'image' ? imageUrl : undefined,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setResults(data);
      toast.success(`Messages sent to ${data.total_sent} donors!`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Select
          label="Blood Type"
          value={filters.blood_type}
          onChange={(e) => setFilters({ ...filters, blood_type: e.target.value })}
          options={BLOOD_TYPES.map(bt => ({ value: bt, label: bt }))}
          placeholder="All types"
        />
        <Select
          label="Year"
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          options={getYearsList().map(y => ({ value: y, label: y.toString() }))}
          placeholder="All years"
        />
        <Select
          label="Session"
          value={filters.session}
          onChange={(e) => setFilters({ ...filters, session: e.target.value })}
          options={[
            { value: 1, label: 'First (Jan-Jun)' },
            { value: 2, label: 'Second (Jul-Dec)' },
          ]}
          placeholder="All sessions"
        />
      </div>

      <div className="flex gap-4">
        <Button
          variant={messageType === 'text' ? 'primary' : 'ghost'}
          onClick={() => setMessageType('text')}
        >
          💬 Text Message
        </Button>
        <Button
          variant={messageType === 'image' ? 'primary' : 'ghost'}
          onClick={() => setMessageType('image')}
        >
          🖼️ Image Message
        </Button>
      </div>

      {messageType === 'text' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            className="w-full px-4 py-2 rounded-xl ring-1 ring-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="Type your message here..."
          />
        </div>
      ) : (
        <Input
          label="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      )}

      <Button onClick={handleSend} loading={loading} className="w-full" size="large">
        📤 Send via WhatsApp
      </Button>

      {results && (
        <div className={`p-4 rounded-xl ${
          results.total_failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <p className="font-bold text-gray-800">
              ✅ Sent: {results.total_sent} | ❌ Failed: {results.total_failed}
            </p>
            <Button variant="ghost" size="small" onClick={() => setResults(null)}>Dismiss</Button>
          </div>
          
          {results.total_failed > 0 && (
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Failure Details</p>
              {results.results.filter(r => !r.success).map((r, i) => (
                <div key={i} className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg flex justify-between">
                  <span>{r.phone}</span>
                  <span className="font-medium">{r.error}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-600 mt-2">{results.message}</p>
        </div>
      )}
    </div>
  );
}