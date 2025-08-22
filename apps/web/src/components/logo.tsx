interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withMark?: boolean;
  className?: string;
}

export function Logo({
  size: _size = 'md',
  withMark: _withMark = false,
  className: _className,
}: LogoProps) {
  /*  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';
  return (
    <div
      className={[
        'hidden md:flex items-center gap-2 font-semibold tracking-wider select-none',
        textSize,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {withMark ? (
        <span className='inline-block size-3 rounded-full bg-primary' aria-hidden />
      ) : null}
    </div>
  ); */ return null;
}
