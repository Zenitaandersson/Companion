import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useContacts } from '../../app/useLiveData';
import { db, moveItem, nextSortOrder, updateProfile } from '../../data/db';
import type { CallMethod, Contact, Profile } from '../../data/types';
import { BlobImage } from '../person/BlobImage';
import { CarerButton, Field, Toggle } from './fields';
import { PhotoPicker } from './PhotoPicker';
import { RecorderControl } from './RecorderControl';

interface Props {
  profile: Profile;
}

const EMPTY: Contact = {
  firstName: '',
  relationship: '',
  sentence: '',
  photo: null,
  greetingAudio: null,
  phone: '',
  callMethod: 'phone',
  sortOrder: 0,
};

/** List of people with add, edit, reorder and remove. */
export function PeopleEditor({ profile }: Props) {
  const { t } = useTranslation();
  const contacts = useContacts();
  const [editing, setEditing] = useState<Contact | null>(null);

  if (editing) {
    const isPrimary = editing.id !== undefined && editing.id === profile.primaryContactId;
    // The first person added becomes who Help calls, unless the carer unticks it.
    const defaultPrimary = isPrimary || (editing.id === undefined && profile.primaryContactId === null);
    return <ContactForm contact={editing} isPrimary={isPrimary} defaultPrimary={defaultPrimary} onDone={() => setEditing(null)} />;
  }

  return (
    <>
      {contacts.length === 0 ? <p className="field__hint">{t('carer.people.empty')}</p> : null}
      {contacts.map((c, i) => (
        <div key={c.id} className="list-item">
          <BlobImage blob={c.photo} alt="" fallback={c.firstName.slice(0, 1)} className="thumb" />
          <div className="list-item__text">
            <div className="list-item__title">
              {c.firstName}
              {c.id === profile.primaryContactId ? ' 🤍' : ''}
            </div>
            <div className="list-item__sub">{c.relationship}</div>
          </div>
          <div className="list-item__actions">
            <CarerButton small onClick={() => setEditing(c)}>
              {t('carer.edit')}
            </CarerButton>
            <div className="chips">
              <CarerButton small ariaLabel={t('carer.people.moveUp')} disabled={i === 0} onClick={() => void moveItem(db.contacts, contacts, i, -1)}>
                ↑
              </CarerButton>
              <CarerButton small ariaLabel={t('carer.people.moveDown')} disabled={i === contacts.length - 1} onClick={() => void moveItem(db.contacts, contacts, i, 1)}>
                ↓
              </CarerButton>
            </div>
          </div>
        </div>
      ))}
      <CarerButton variant="primary" block onClick={() => setEditing({ ...EMPTY })}>
        + {t('carer.people.addPerson')}
      </CarerButton>
    </>
  );
}

interface FormProps {
  contact: Contact;
  /** Whether this saved contact is currently the one Help calls. */
  isPrimary: boolean;
  /** Initial state of the "Help calls this person" toggle. */
  defaultPrimary: boolean;
  onDone: () => void;
}

function ContactForm({ contact, isPrimary, defaultPrimary, onDone }: FormProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<Contact>(contact);
  const [primary, setPrimary] = useState(defaultPrimary);
  const set = <K extends keyof Contact>(key: K, value: Contact[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    const trimmed = { ...draft, firstName: draft.firstName.trim() };
    if (!trimmed.firstName) return;
    let id = trimmed.id;
    if (id === undefined) {
      id = await db.contacts.add({ ...trimmed, sortOrder: await nextSortOrder(db.contacts) });
    } else {
      await db.contacts.put(trimmed);
    }
    if (primary) await updateProfile({ primaryContactId: id });
    else if (isPrimary) await updateProfile({ primaryContactId: null });
    onDone();
  };

  const remove = async () => {
    if (draft.id !== undefined) {
      await db.contacts.delete(draft.id);
      if (isPrimary) await updateProfile({ primaryContactId: null });
    }
    onDone();
  };

  return (
    <>
      <Field label={t('carer.people.firstName')} htmlFor="c-name">
        <input id="c-name" type="text" value={draft.firstName} onChange={(e) => set('firstName', e.target.value)} />
      </Field>
      <Field label={t('carer.people.relationship')} hint={t('carer.people.relationshipHint')} htmlFor="c-rel">
        <input id="c-rel" type="text" value={draft.relationship} onChange={(e) => set('relationship', e.target.value)} />
      </Field>
      <Field label={t('carer.people.sentence')} hint={t('carer.people.sentenceHint')} htmlFor="c-sentence">
        <textarea id="c-sentence" value={draft.sentence} onChange={(e) => set('sentence', e.target.value)} />
      </Field>
      <PhotoPicker label={t('carer.people.photo')} value={draft.photo} onChange={(b) => set('photo', b)} fallback={draft.firstName.slice(0, 1) || '🙂'} />
      <RecorderControl label={t('carer.people.greeting')} hint={t('carer.people.greetingHint')} value={draft.greetingAudio} onChange={(b) => set('greetingAudio', b)} />
      <Field label={t('carer.people.phone')} htmlFor="c-phone">
        <input id="c-phone" type="tel" value={draft.phone} onChange={(e) => set('phone', e.target.value)} />
      </Field>
      <Field label={t('carer.people.callMethod')} htmlFor="c-method">
        <select id="c-method" value={draft.callMethod} onChange={(e) => set('callMethod', e.target.value as CallMethod)}>
          <option value="phone">{t('carer.people.phoneCall')}</option>
          <option value="whatsapp">{t('carer.people.whatsapp')}</option>
        </select>
      </Field>
      <Toggle label={t('carer.people.setPrimary')} checked={primary} onChange={setPrimary} />
      <div className="chips">
        <CarerButton variant="primary" onClick={() => void save()} disabled={!draft.firstName.trim()}>
          {t('carer.save')}
        </CarerButton>
        <CarerButton onClick={onDone}>{t('carer.cancel')}</CarerButton>
        {draft.id !== undefined ? (
          <CarerButton variant="danger" onClick={() => void remove()}>
            {t('carer.delete')}
          </CarerButton>
        ) : null}
      </div>
    </>
  );
}
