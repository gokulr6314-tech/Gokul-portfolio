/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';

type PillButtonProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  variant?: 'primary' | 'secondary' | 'accent';
} & (
  | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ href?: never } & ButtonHTMLAttributes<HTMLButtonElement>)
);

export default function PillButton({ 
  children, 
  className = '', 
  id, 
  variant = 'primary', 
  href, 
  ...props 
}: PillButtonProps) {
  
  const baseStyle = "inline-flex items-center justify-center font-display text-sm tracking-wide font-medium px-8 py-3.5 select-none cursor-pointer outline-none active:scale-[0.98]";
  
  const variantStyles = {
    primary: "liquid-glass-btn-primary",
    secondary: "liquid-glass-btn-secondary",
    accent: "liquid-glass-btn-accent"
  };

  const combinedStyles = `${baseStyle} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <a 
        id={id}
        href={href} 
        className={combinedStyles} 
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button 
      id={id}
      type="button" 
      className={combinedStyles} 
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
