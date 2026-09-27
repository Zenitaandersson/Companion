import { useEffect, useState } from 'react';

interface Props {
  blob: Blob | null | undefined;
  alt: string;
  /** Text shown when there is no photo, e.g. the first letter of a name. */
  fallback?: string;
  className?: string;
}

/** Renders a stored Blob as an image, managing the object URL lifecycle. */
export function BlobImage({ blob, alt, fallback, className }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);

  const classes = ['photo', className].filter(Boolean).join(' ');
  if (!url) {
    return (
      <div className={`${classes} photo--placeholder`} role="img" aria-label={alt}>
        {fallback ?? ''}
      </div>
    );
  }
  return <img className={classes} src={url} alt={alt} />;
}
