import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}

/** Label, optional hint and a form control. */
export function Field({ label, hint, htmlFor, children }: FieldProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {hint ? <span className="field__hint">{hint}</span> : null}
      {children}
    </div>
  );
}

interface ToggleProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, hint, checked, onChange }: ToggleProps) {
  return (
    <div className="field">
      <label className="toggle">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span>{label}</span>
      </label>
      {hint ? <span className="field__hint">{hint}</span> : null}
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'danger';
  small?: boolean;
  block?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  ariaLabel?: string;
}

export function CarerButton({
  children,
  onClick,
  variant = 'default',
  small,
  block,
  disabled,
  type = 'button',
  ariaLabel,
}: ButtonProps) {
  const classes = ['carer-button'];
  if (variant !== 'default') classes.push(`carer-button--${variant}`);
  if (small) classes.push('carer-button--small');
  if (block) classes.push('carer-button--block');
  return (
    <button
      type={type}
      className={classes.join(' ')}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
