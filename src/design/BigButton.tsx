import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'primary' | 'help' | 'quiet';

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  variant?: Variant;
  tall?: boolean;
  children: ReactNode;
}

/** A tap target of at least 88pt with large text. The only button style in Person mode. */
export function BigButton({ icon, variant = 'default', tall, children, className, ...rest }: BigButtonProps) {
  const classes = ['big-button'];
  if (variant !== 'default') classes.push(`big-button--${variant}`);
  if (tall) classes.push('big-button--tall');
  if (className) classes.push(className);
  return (
    <button type="button" className={classes.join(' ')} {...rest}>
      {icon ? (
        <span className="big-button__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
