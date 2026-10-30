import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo-mark.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  isLight?: boolean;
  to?: string;
}

export function Logo({
  className = '',
  size = 'md',
  showText = true,
  isLight = false,
  to = '/',
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  };

  const titleSizes = {
    sm: 'text-xs',
    md: 'text-xs sm:text-base',
    lg: 'text-lg sm:text-xl',
    xl: 'text-2xl sm:text-3xl',
  };

  const subSizes = {
    sm: 'text-xs tracking-normal',
    md: 'text-xs tracking-wide',
    lg: 'text-xs tracking-wider',
    xl: 'text-xs tracking-wider',
  };

  const gapSizes = {
    sm: 'gap-2',
    md: 'gap-2.5',
    lg: 'gap-3',
    xl: 'gap-4',
  };

  const content = (
    <div className={`flex items-center ${gapSizes[size]} select-none min-w-0 ${className}`}>
      <img
        src={logoImg}
        alt="GREEN TECHNOLOGIES BTP"
        className={`${sizeClasses[size]} aspect-square shrink-0 rounded-full bg-white object-contain`}
      />
      {showText && (
        <div className="flex flex-col leading-tight min-w-0">
          <div className={`flex items-center gap-1 font-extrabold tracking-tight [font-variation-settings:'wdth'_100] sm:[font-variation-settings:'wdth'_118] ${titleSizes[size]} truncate`}>
            <span className={isLight ? 'text-white' : 'text-emerald-800'}>
              GREEN
            </span>
            <span className={isLight ? 'text-emerald-400' : 'text-slate-800'}>
              TECHNOLOGIES
            </span>
            <span className="text-orange-500 font-black ml-0.5">
              BTP
            </span>
          </div>
          <span className={`font-medium truncate ${subSizes[size]} ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            Eau, énergie, agro et BTP
          </span>
        </div>
      )}
    </div>
  );

  if (to) {
    return <Link to={to} className="inline-flex items-center focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg max-w-full">{content}</Link>;
  }

  return content;
}
