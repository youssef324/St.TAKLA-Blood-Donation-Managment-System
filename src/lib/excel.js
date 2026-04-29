import * as XLSX from 'xlsx';

export function generateExcel(data, filename = 'export.xlsx') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, filename);
}

export function exportDonorsToExcel(donors, year = null, session = null) {
  const rows = donors.flatMap(donor => {
    const donations = donor.donations || [];
    
    if (donations.length === 0) {
      return [{
        'First Name': donor.first_name,
        'Last Name': donor.last_name,
        'Phone': donor.phone_number,
        'Blood Type': donor.blood_type,
        'District': donor.districts?.district_name || '',
        'Address': donor.full_address || '',
        'Notes': donor.notes || '',
        'Year': '',
        'Session': '',
        'Date': '',
      }];
    }

    return donations
      .filter(d => {
        if (year && d.donation_year !== parseInt(year)) return false;
        if (session && d.donation_session !== parseInt(session)) return false;
        return true;
      })
      .map(donation => ({
        'First Name': donor.first_name,
        'Last Name': donor.last_name,
        'Phone': donor.phone_number,
        'Blood Type': donor.blood_type,
        'District': donor.districts?.district_name || '',
        'Address': donor.full_address || '',
        'Notes': donor.notes || '',
        'Year': donation.donation_year,
        'Session': donation.donation_session === 1 ? 'First (Jan-Jun)' : 'Second (Jul-Dec)',
        'Date': donation.donation_date || '',
      }));
  });

  const fileName = `blood_donors_${year || 'all'}_${session ? `session_${session}` : ''}.xlsx`;
  generateExcel(rows, fileName);
  return rows.length;
}