import type { Contact } from '../../data/types';

/** Builds the link that starts a call for a contact, or null if there is no number. */
export function callHref(contact: Pick<Contact, 'phone' | 'callMethod'>): string | null {
  const digits = contact.phone.replace(/[^\d+]/g, '');
  if (!digits) return null;
  if (contact.callMethod === 'whatsapp') {
    return `https://wa.me/${digits.replace(/^\+/, '').replace(/^00/, '')}`;
  }
  return `tel:${digits}`;
}
