import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'primary' | 'help' | 'quiet';

interface CommonProps {
  icon?: ReactNode;
  variant?: Variant;
  tall?: boolean;
  children: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

function classNames(variant: Variant, tall: boolean | undefined, className: string | undefined): string {
  const classes = ['big-button'];
  if (variant !== 'default') classes.push(`big-button--${variant}`);
  if (tall) classes.push('big-button--tall');
  if (className) classes.push(className);
  return classes.join(' ');
}

/**
 * A tap target of at least 88pt with large text. The only button style in Person mode.
 * With `href` it renders a link with the same look, used for phone calls.
 */
export function BigButton(props: ButtonProps | LinkProps) {
  const { icon, variant = 'default', tall, children, className, ...rest } = props;
  const inner = (
    <>
      {icon ? (
        <span className="big-button__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </>
  );
  if ('href' in rest && rest.href !== undefined) {
    return (
      <a className={classNames(variant, tall, className)} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" className={classNames(variant, tall, className)} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {inner}
    </button>
  );
}
