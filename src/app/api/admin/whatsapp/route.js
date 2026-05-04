import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// POST - Send WhatsApp message
export async function POST(request) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { 
      blood_type,        // Filter by blood type
      donor_ids,         // Specific donor IDs
      year,              // Filter by year
      session,           // Filter by session
      message_type,      // 'text' or 'image'
      message_content,   // Text message
      media_url          // Image URL
    } = await request.json();

    const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const API_VERSION = process.env.WHATSAPP_API_VERSION;

    // Get donors based on filters
    let query = supabaseAdmin
      .from('donors')
      .select(`
        donor_id,
        first_name,
        last_name,
        phone_number,
        blood_type,
        donations (*)
      `)
      .eq('is_active', true);

    if (donor_ids && donor_ids.length > 0) {
      query = query.in('donor_id', donor_ids);
    }
    if (blood_type) {
      query = query.eq('blood_type', blood_type);
    }

    let { data: donors, error } = await query;

    if (error) throw error;

    // Filter by year/session if specified
    if (year || session) {
      const targetYear = year ? parseInt(year) : null;
      const targetSession = session ? parseInt(session) : null;
      
      donors = donors.filter(donor => 
        donor.donations.some(d => {
          if (targetYear && d.donation_year !== targetYear) return false;
          if (targetSession && d.donation_session !== targetSession) return false;
          return true;
        })
      );
    }

    if (donors.length === 0) {
      return NextResponse.json(
        { error: 'No donors found matching the criteria' },
        { status: 404 }
      );
    }

    // Send messages to all filtered donors
    const results = [];
    const logs = [];

    for (const donor of donors) {
      try {
        // Meta API requires phone number WITHOUT '+'
        const normalizedPhone = donor.phone_number.replace('+', '');
        
        let payload;
        
        if (message_type === 'image') {
          payload = {
            messaging_product: 'whatsapp',
            to: normalizedPhone,
            type: 'image',
            image: {
              link: media_url,
              caption: message_content || ''
            }
          };
        } else {
          payload = {
            messaging_product: 'whatsapp',
            to: normalizedPhone,
            type: 'text',
            text: {
              body: message_content
            }
          };
        }

        const response = await fetch(
          `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        const result = await response.json();
        
        if (!response.ok) {
          console.error('WhatsApp API Error for', donor.phone_number, ':', result);
          results.push({
            donor_id: donor.donor_id,
            phone: donor.phone_number,
            success: false,
            error: result.error?.message || 'Unknown Meta error'
          });
        } else {
          results.push({
            donor_id: donor.donor_id,
            phone: donor.phone_number,
            success: true,
            message_id: result.messages?.[0]?.id
          });
        }

        // Log the message
        logs.push({
          sender_admin_id: admin.userId,
          recipient_phone: donor.phone_number,
          message_type,
          message_content: message_content || 'Image message',
          media_url: media_url || null,
          status: response.ok ? 'sent' : 'failed',
        });
      } catch (err) {
        results.push({
          donor_id: donor.donor_id,
          phone: donor.phone_number,
          success: false,
          error: err.message
        });
      }
    }

    // Save logs to database
    if (logs.length > 0) {
      await supabaseAdmin.from('whatsapp_logs').insert(logs);
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      total_sent: successCount,
      total_failed: results.length - successCount,
      results,
      message: `Message sent to ${successCount} out of ${donors.length} donors`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}