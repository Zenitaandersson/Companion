import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BigButton } from '../../design/BigButton';
import { Screen } from '../../design/Screen';
import type { Language, Memory } from '../../data/types';
import { speech } from '../../services/speech';
import { BlobImage } from './BlobImage';

interface Props {
  memories: Memory[];
  language: Language;
  onBackToToday: () => void;
}

/** The memory book: one picture at a time, Next and Back buttons, no swiping. */
export function MyLife({ memories, language, onBackToToday }: Props) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const total = memories.length;
  const safeIndex = Math.min(index, Math.max(total - 1, 0));
  const memory = memories[safeIndex];

  const move = (delta: number) => {
    speech.stop();
    setIndex((i) => Math.min(Math.max(i + delta, 0), total - 1));
  };

  return (
    <Screen title={t('myLife.title')} onBackToToday={onBackToToday}>
      {!memory ? (
        <p className="big-text muted">{t('myLife.empty')}</p>
      ) : (
        <>
          <p className="muted" style={{ margin: 0 }}>
            {t('myLife.counter', { current: safeIndex + 1, total })}
          </p>
          <BlobImage blob={memory.photo} alt={memory.caption} fallback="🖼" className="photo--portrait" />
          <p className="big-text">{memory.caption}</p>
          <BigButton icon="🔊" onClick={() => speech.say(memory.caption, memory.voiceNote, language)}>
            {t('myLife.playNote')}
          </BigButton>
          <div className="row">
            <BigButton icon="←" onClick={() => move(-1)} disabled={safeIndex === 0}>
              {t('common.back')}
            </BigButton>
            <BigButton icon="→" onClick={() => move(1)} disabled={safeIndex >= total - 1}>
              {t('common.next')}
            </BigButton>
          </div>
        </>
      )}
    </Screen>
  );
}
