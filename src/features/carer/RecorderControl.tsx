import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VoiceRecorder } from '../../services/recorder';
import { speech } from '../../services/speech';
import { CarerButton, Field } from './fields';

interface Props {
  label: string;
  hint?: string;
  value: Blob | null;
  onChange: (blob: Blob | null) => void;
}

/** Record, play and remove a voice clip. Degrades to a plain notice when recording is unsupported. */
export function RecorderControl({ label, hint, value, onChange }: Props) {
  const { t } = useTranslation();
  const [recording, setRecording] = useState(false);
  const recorder = useRef<VoiceRecorder | null>(null);
  const supported = VoiceRecorder.isSupported();

  useEffect(() => () => recorder.current?.cancel(), []);

  const start = async () => {
    try {
      recorder.current = new VoiceRecorder();
      await recorder.current.start();
      setRecording(true);
    } catch {
      setRecording(false);
      recorder.current = null;
    }
  };

  const stop = async () => {
    if (!recorder.current) return;
    try {
      const blob = await recorder.current.stop();
      onChange(blob);
    } catch {
      /* nothing saved */
    } finally {
      recorder.current = null;
      setRecording(false);
    }
  };

  return (
    <Field label={label} hint={hint}>
      {!supported ? (
        <p className="field__hint">{t('carer.recorder.notSupported')}</p>
      ) : (
        <div className="chips">
          {recording ? (
            <CarerButton variant="primary" onClick={stop}>
              ■ {t('carer.recorder.stop')}
            </CarerButton>
          ) : (
            <CarerButton onClick={start}>● {t('carer.recorder.record')}</CarerButton>
          )}
          {value ? (
            <>
              <CarerButton onClick={() => speech.play(value)}>▶ {t('carer.recorder.play')}</CarerButton>
              <CarerButton variant="danger" onClick={() => onChange(null)}>
                {t('carer.recorder.remove')}
              </CarerButton>
            </>
          ) : null}
        </div>
      )}
      {recording ? <span className="field__hint">{t('carer.recorder.recording')}</span> : null}
      {value && !recording ? <span className="field__hint">{t('carer.recorder.recorded')}</span> : null}
    </Field>
  );
}
