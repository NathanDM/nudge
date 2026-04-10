interface LogoProps {
  size?: number;
  className?: string;
  hideText?: boolean;
}

export default function Logo({ size = 40, className = '', hideText = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 5C11.716 5 5 11.716 5 20C5 28.284 11.716 35 20 35C28.284 35 35 28.284 35 20C35 11.716 28.284 5 20 5Z" fill="#A5C8BF"/>
        <path d="M20 10C14.477 10 10 14.477 10 20C10 25.523 14.477 30 20 30C25.523 30 30 25.523 30 20C30 14.477 25.523 10 20 10Z" fill="#EED7CF"/>
        <path d="M20 15C17.239 15 15 17.239 15 20C15 22.761 17.239 25 20 25C22.761 25 25 22.761 25 20C25 17.239 22.761 15 20 15Z" fill="#E9ACB2"/>
        <circle cx="20" cy="20" r="3" fill="#FEF8F3"/>
      </svg>
      {!hideText && <span className="font-bold text-inherit">Nudge</span>}
    </div>
  );
}
