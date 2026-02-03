'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconClick?: () => void;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconClick,
      icon,
      type = 'text',
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-dark-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {(leftIcon || icon) && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
              {icon || (leftIcon && <Icon icon={leftIcon} className="w-5 h-5" />)}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full h-11 px-4 bg-white border border-dark-200 rounded-lg text-sm',
              'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
              'placeholder:text-dark-400 transition-all',
              'disabled:bg-dark-100 disabled:cursor-not-allowed',
              (leftIcon || icon) && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 transition-colors"
            >
              <Icon icon={rightIcon} className="w-5 h-5" />
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-xs text-dark-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-dark-700 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-white border border-dark-200 rounded-lg text-sm',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
            'placeholder:text-dark-400 transition-all resize-none',
            'disabled:bg-dark-100 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-xs text-dark-500">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-dark-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full h-11 px-4 bg-white border border-dark-200 rounded-lg text-sm appearance-none',
              'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
              'disabled:bg-dark-100 disabled:cursor-not-allowed cursor-pointer',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon
            icon="solar:alt-arrow-down-linear"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none w-4 h-4"
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Common country codes
const countryCodes = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+1', country: 'CA', flag: '🇨🇦' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+39', country: 'IT', flag: '🇮🇹' },
  { code: '+34', country: 'ES', flag: '🇪🇸' },
  { code: '+31', country: 'NL', flag: '🇳🇱' },
  { code: '+46', country: 'SE', flag: '🇸🇪' },
  { code: '+47', country: 'NO', flag: '🇳🇴' },
  { code: '+45', country: 'DK', flag: '🇩🇰' },
  { code: '+41', country: 'CH', flag: '🇨🇭' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+82', country: 'KR', flag: '🇰🇷' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+65', country: 'SG', flag: '🇸🇬' },
  { code: '+852', country: 'HK', flag: '🇭🇰' },
  { code: '+971', country: 'AE', flag: '🇦🇪' },
  { code: '+966', country: 'SA', flag: '🇸🇦' },
  { code: '+972', country: 'IL', flag: '🇮🇱' },
  { code: '+55', country: 'BR', flag: '🇧🇷' },
  { code: '+52', country: 'MX', flag: '🇲🇽' },
  { code: '+54', country: 'AR', flag: '🇦🇷' },
  { code: '+234', country: 'NG', flag: '🇳🇬' },
  { code: '+27', country: 'ZA', flag: '🇿🇦' },
  { code: '+20', country: 'EG', flag: '🇪🇬' },
  { code: '+64', country: 'NZ', flag: '🇳🇿' },
  { code: '+353', country: 'IE', flag: '🇮🇪' },
  { code: '+48', country: 'PL', flag: '🇵🇱' },
  { code: '+43', country: 'AT', flag: '🇦🇹' },
  { code: '+32', country: 'BE', flag: '🇧🇪' },
  { code: '+351', country: 'PT', flag: '🇵🇹' },
  { code: '+30', country: 'GR', flag: '🇬🇷' },
  { code: '+7', country: 'RU', flag: '🇷🇺' },
  { code: '+380', country: 'UA', flag: '🇺🇦' },
  { code: '+90', country: 'TR', flag: '🇹🇷' },
  { code: '+66', country: 'TH', flag: '🇹🇭' },
  { code: '+84', country: 'VN', flag: '🇻🇳' },
  { code: '+62', country: 'ID', flag: '🇮🇩' },
  { code: '+60', country: 'MY', flag: '🇲🇾' },
  { code: '+63', country: 'PH', flag: '🇵🇭' },
];

interface PhoneInputProps {
  label?: string;
  error?: string;
  hint?: string;
  value: string;
  countryCode: string;
  onValueChange: (phone: string) => void;
  onCountryCodeChange: (code: string) => void;
  placeholder?: string;
  required?: boolean;
}

// Format phone number based on country code
const formatPhoneNumber = (phone: string, countryCode: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // US/Canada format: (XXX) XXX-XXXX
  if (countryCode === '+1') {
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  // UK format: XXXX XXX XXXX
  if (countryCode === '+44') {
    if (digits.length === 0) return '';
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
  }

  // Default format: groups of 3-4 digits
  if (digits.length === 0) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
};

// Get raw digits from formatted phone
const getDigitsOnly = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

export function PhoneInput({
  label,
  error,
  hint,
  value,
  countryCode,
  onValueChange,
  onCountryCodeChange,
  placeholder = '(555) 123-4567',
  required,
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCountry = countryCodes.find(c => c.code === countryCode) || countryCodes[0];

  // Handle phone input change with formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = getDigitsOnly(input);

    // Limit to reasonable phone number length
    const maxLength = countryCode === '+1' ? 10 : 15;
    const limitedDigits = digits.slice(0, maxLength);

    // Format and update
    const formatted = formatPhoneNumber(limitedDigits, countryCode);
    onValueChange(formatted);
  };

  // Get display value (formatted)
  const displayValue = value;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-dark-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative flex">
        {/* Country Code Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'h-11 px-3 bg-dark-50 border border-r-0 border-dark-200 rounded-l-lg flex items-center gap-2',
              'hover:bg-dark-100 transition-colors focus:outline-none focus:ring-1 focus:ring-primary',
              error && 'border-red-500'
            )}
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm text-dark-700 font-medium">{selectedCountry.code}</span>
            <Icon icon="solar:alt-arrow-down-linear" className="w-3 h-3 text-dark-400" />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 max-h-60 overflow-y-auto bg-white border border-dark-200 rounded-lg shadow-lg z-50">
              {countryCodes.map((country, index) => (
                <button
                  key={`${country.code}-${country.country}-${index}`}
                  type="button"
                  onClick={() => {
                    onCountryCodeChange(country.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full px-3 py-2 flex items-center gap-3 hover:bg-dark-50 transition-colors text-left',
                    country.code === countryCode && 'bg-primary/5'
                  )}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm text-dark-700">{country.country}</span>
                  <span className="text-sm text-dark-500 ml-auto">{country.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={displayValue}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          required={required}
          className={cn(
            'flex-1 h-11 px-4 bg-white border border-dark-200 rounded-r-lg text-sm',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
            'placeholder:text-dark-400 transition-all',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
          )}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-dark-500">{hint}</p>
      )}
    </div>
  );
}

export default Input;
