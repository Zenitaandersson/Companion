import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BigButton } from '../../design/BigButton';
import { PIN_LENGTH } from '../../services/pin';

interface Props {
  title: string;
  /** Shown only during PIN setup when the two entries differ. Never shown for a wrong unlock. */
  notice?: string | null;
  onComplete: (pin: string) => void;
  /** The way out. Rendered as the same large bottom button the person knows from every screen. */
  onCancel: () => void;
  cancelLabel: string;
}

/**
 * Large numeric keypad for a four-digit PIN. A wrong PIN simply clears the dots.
 * The bottom bar matches Person mode so an accidental tap always has a familiar way home.
 */
export function PinPad({ title, notice, onComplete, onCancel, cancelLabel }: Props) {
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
  const keyStyle = { minHeight: 72, fontSize: '1.4em' } as const;

  return (
    <div className="carer screen--tall-bar" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="carer__body screen__body" style={{ flex: 1, justifyContent: 'center' }}>
        <h1 className="carer__title" style={{ textAlign: 'center' }}>
          {title}
        </h1>
        <p className="field__hint" style={{ textAlign: 'center' }}>
          {t('carer.pinHelp')}
        </p>
        <div className="pin-dots" aria-live="polite" aria-label={`${pin.length} / ${PIN_LENGTH}`}>
          {Array.from({ length: PIN_LENGTH }, (_, i) => (i < pin.length ? '●' : '○')).join(' ')}
        </div>
        {notice ? <p className="notice">{notice}</p> : null}
        <div className="pin-pad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} type="button" className="carer-button" style={keyStyle} onClick={() => press(d)}>
              {d}
            </button>
          ))}
          <span aria-hidden="true" />
          <button type="button" className="carer-button" style={keyStyle} onClick={() => press('0')}>
            0
          </button>
          <button type="button" className="carer-button" onClick={() => setPin((p) => p.slice(0, -1))} aria-label="⌫">
            ⌫
          </button>
        </div>
      </div>
      <nav className="bottom-bar" aria-label={t('common.today')}>
        <BigButton icon="☀️" variant="primary" onClick={onCancel} data-testid="back-to-today">
          {cancelLabel}
        </BigButton>
      </nav>
    </div>
  );
}
