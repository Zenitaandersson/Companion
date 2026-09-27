import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMemories } from '../../app/useLiveData';
import { db, moveItem, nextSortOrder } from '../../data/db';
import type { Memory } from '../../data/types';
import { BlobImage } from '../person/BlobImage';
import { CarerButton, Field } from './fields';
import { PhotoPicker } from './PhotoPicker';
import { RecorderControl } from './RecorderControl';

/** Memory book pages: photo, caption, voice note, in a fixed order. */
export function MemoriesEditor() {
  const { t } = useTranslation();
  const memories = useMemories();
  const [editing, setEditing] = useState<Memory | null>(null);

  if (editing) return <MemoryForm memory={editing} onDone={() => setEditing(null)} />;

  return (
    <>
      <p className="field__hint">{t('carer.memories.intro')}</p>
      {memories.length === 0 ? <p className="field__hint">{t('carer.memories.empty')}</p> : null}
      {memories.map((m, i) => (
        <div key={m.id} className="list-item">
          <BlobImage blob={m.photo} alt="" fallback="🖼" className="thumb" />
          <div className="list-item__text">
            <div className="list-item__title">{m.caption || '…'}</div>
            <div className="list-item__sub">{m.voiceNote ? '🔊' : ''}</div>
          </div>
          <div className="list-item__actions">
            <CarerButton small onClick={() => setEditing(m)}>
              {t('carer.edit')}
            </CarerButton>
            <div className="chips">
              <CarerButton small ariaLabel={t('carer.people.moveUp')} disabled={i === 0} onClick={() => void moveItem(db.memories, memories, i, -1)}>
                ↑
              </CarerButton>
              <CarerButton small ariaLabel={t('carer.people.moveDown')} disabled={i === memories.length - 1} onClick={() => void moveItem(db.memories, memories, i, 1)}>
                ↓
              </CarerButton>
            </div>
          </div>
        </div>
      ))}
      <CarerButton variant="primary" block onClick={() => setEditing({ photo: null, caption: '', voiceNote: null, sortOrder: 0 })}>
        + {t('carer.memories.addMemory')}
      </CarerButton>
    </>
  );
}

function MemoryForm({ memory, onDone }: { memory: Memory; onDone: () => void }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(memory);
  const valid = draft.photo || draft.caption.trim();

  const save = async () => {
    if (!valid) return;
    const clean = { ...draft, caption: draft.caption.trim() };
    if (clean.id === undefined) await db.memories.add({ ...clean, sortOrder: await nextSortOrder(db.memories) });
    else await db.memories.put(clean);
    onDone();
  };

  const remove = async () => {
    if (draft.id !== undefined) await db.memories.delete(draft.id);
    onDone();
  };

  return (
    <>
      <PhotoPicker label={t('carer.people.photo')} value={draft.photo} onChange={(b) => setDraft({ ...draft, photo: b })} />
      <Field label={t('carer.memories.caption')} hint={t('carer.memories.captionHint')} htmlFor="m-caption">
        <textarea id="m-caption" value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} />
      </Field>
      <RecorderControl label={t('carer.memories.voiceNote')} value={draft.voiceNote} onChange={(b) => setDraft({ ...draft, voiceNote: b })} />
      <div className="chips">
        <CarerButton variant="primary" onClick={() => void save()} disabled={!valid}>
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
