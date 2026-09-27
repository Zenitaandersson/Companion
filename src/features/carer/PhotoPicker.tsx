import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { shrinkImage } from '../../services/images';
import { BlobImage } from '../person/BlobImage';
import { CarerButton, Field } from './fields';

interface Props {
  label: string;
  value: Blob | null;
  onChange: (blob: Blob | null) => void;
  fallback?: string;
}

/** Choose a photo from the phone. The image is shrunk before it is stored. */
export function PhotoPicker({ label, value, onChange, fallback }: Props) {
  const { t } = useTranslation();
  const input = useRef<HTMLInputElement>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    onChange(await shrinkImage(file));
  };

  return (
    <Field label={label}>
      <div style={{ maxWidth: 220 }}>
        <BlobImage blob={value} alt="" fallback={fallback ?? '🖼'} />
      </div>
      <div className="chips">
        <CarerButton onClick={() => input.current?.click()}>
          {value ? t('carer.people.changePhoto') : t('carer.people.choosePhoto')}
        </CarerButton>
        {value ? (
          <CarerButton variant="danger" onClick={() => onChange(null)}>
            {t('carer.delete')}
          </CarerButton>
        ) : null}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
    </Field>
  );
}
