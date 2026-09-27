import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PIN_LENGTH } from '../../services/pin';

interface Props {
  title: string;
  error?: string | null;
  onComplete: (pin: string) => void;
  onCancel: () => void;
}

/** Large numeric keypad for a four-digit PIN. */
export function PinPad({ title, error, onComplete, onCancel }: Props) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      const value = pin;
      setPin('');
      onComplete(value);
    }
  }, [pin, onComplete]);

  const press = (d: string) => setPin((p) => (p.length < PIN_LENGTH ? p + d : p));

  return (
    <div className="carer" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="carer__body" style={{ flex: 1, justifyContent: 'center' }}>
        <h1 className="carer__title" style={{ textAlign: 'center' }}>
          {title}
        </h1>
        <p className="field__hint" style={{ textAlign: 'center' }}>
          {t('carer.pinHelp')}
        </p>
        <div className="pin-dots" aria-live="polite" aria-label={`${pin.length} / ${PIN_LENGTH}`}>
          {Array.from({ length: PIN_LENGTH }, (_, i) => (i < pin.length ? '●' : '○')).join(' ')}
        </div>
        {error ? (
          <p className="notice" role="alert">
            {error}
          </p>
        ) : null}
        <div className="pin-pad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} type="button" className="carer-button" style={{ minHeight: 72, fontSize: '1.4em' }} onClick={() => press(d)}>
              {d}
            </button>
          ))}
          <button type="button" className="carer-button" onClick={onCancel}>
            {t('carer.cancel')}
          </button>
          <button type="button" className="carer-button" style={{ minHeight: 72, fontSize: '1.4em' }} onClick={() => press('0')}>
            0
          </button>
          <button type="button" className="carer-button" onClick={() => setPin((p) => p.slice(0, -1))} aria-label="⌫">
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
