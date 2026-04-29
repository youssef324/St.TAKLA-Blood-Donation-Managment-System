// IndexedDB setup for offline storage
import Dexie from 'dexie';

// Initialize database
const db = new Dexie('BloodDonationOffline');
db.version(1).stores({
  donors: '++id, phone_number, created_at',
  donations: '++id, donor_id, donation_year, donation_session',
});

// Save donor offline
export async function saveDonorOffline(donorData) {
  try {
    await db.donors.add({
      ...donorData,
      created_at: new Date().toISOString(),
      synced: false,
    });
    
    // Also save to localStorage as backup
    const existing = JSON.parse(localStorage.getItem('offline_donors') || '[]');
    existing.push(donorData);
    localStorage.setItem('offline_donors', JSON.stringify(existing));
    
    return true;
  } catch (error) {
    console.error('Failed to save offline:', error);
    return false;
  }
}

// Get all unsynced donors
export async function getUnsyncedDonors() {
  return await db.donors.where('synced').equals(false).toArray();
}

// Sync donors when back online
export async function syncDonors() {
  const unsynced = await getUnsyncedDonors();
  const results = [];

  for (const donor of unsynced) {
    try {
      const res = await fetch('/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donor),
      });

      if (res.ok) {
        await db.donors.update(donor.id, { synced: true });
        results.push({ success: true, donor });
      } else {
        results.push({ success: false, donor, error: 'API rejected' });
      }
    } catch (error) {
      results.push({ success: false, donor, error: error.message });
    }
  }

  // Clear localStorage backup if all synced
  if (results.every(r => r.success)) {
    localStorage.removeItem('offline_donors');
  }

  return results;
}

// Check if there's pending data to sync
export async function hasPendingSyncs() {
  const count = await db.donors.where('synced').equals(false).count();
  return count > 0;
}