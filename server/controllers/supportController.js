import { store } from '../store.js';

export async function getSupportInfo(req, res) {
  try {
    res.json(
      store.supportInfo || {
        phone: '8125235267',
        email: 'kisansetu@gmail.com',
        address: 'Hyderabad, Nachupally, 500090',
        hours: 'Mon – Sun, 6:00 AM – 10:00 PM IST',
      }
    );
  } catch {
    res.status(500).json({ error: 'Unable to fetch helpdesk details' });
  }
}

export async function getSupportQueries(req, res) {
  try {
    const { userId, phone } = req.query || {};
    let list = Array.isArray(store.supportQueries) ? store.supportQueries : [];

    if (userId) {
      list = list.filter((q) => q.userId === String(userId));
    } else if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      if (cleanPhone) {
        list = list.filter((q) => String(q.phone || '').replace(/\D/g, '').endsWith(cleanPhone));
      }
    }

    res.json(list.slice(0, 50));
  } catch {
    res.status(500).json({ error: 'Failed to retrieve raised queries' });
  }
}

export async function createSupportQuery(req, res) {
  try {
    const {
      userId = '',
      role = 'farmer',
      name = '',
      phone = '',
      email = '',
      category = 'General Support',
      orderId = '',
      subject = '',
      message = '',
    } = req.body || {};

    const trimmedName = String(name).trim();
    const trimmedPhone = String(phone).trim();
    const trimmedMessage = String(message).trim();
    const trimmedSubject =
      String(subject).trim() || `${String(category || 'Support')} Query`;

    if (!trimmedName || !trimmedPhone || !trimmedMessage) {
      return res.status(400).json({
        error: 'Name, mobile number, and query description are required.',
      });
    }

    if (!Array.isArray(store.supportQueries)) {
      store.supportQueries = [];
    }

    const ticketId = `QRY-${Math.floor(100000 + Math.random() * 900000)}`;
    const record = {
      id: ticketId,
      ticketId,
      userId: String(userId || '').trim() || undefined,
      role: String(role || 'farmer'),
      name: trimmedName,
      phone: trimmedPhone,
      email: String(email || '').trim() || undefined,
      category: String(category || 'General Support'),
      orderId: String(orderId || '').trim() || undefined,
      subject: trimmedSubject,
      message: trimmedMessage,
      status: 'open',
      assignedDesk: 'Hyderabad, Nachupally Helpdesk (500090)',
      helplinePhone: '8125235267',
      helplineEmail: 'kisansetu@gmail.com',
      createdAt: new Date().toISOString(),
    };

    store.supportQueries.unshift(record);
    return res.status(201).json(record);
  } catch (err) {
    console.error('[Support Query Error]:', err);
    return res.status(500).json({ error: 'Failed to submit support query' });
  }
}
