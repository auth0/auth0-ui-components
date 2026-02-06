'use client';

import type { ClipboardEvent, KeyboardEvent } from 'react';
import React, { useRef, useState } from 'react';

import { TextField } from './text-field';

import { cn } from '@/lib/utils';

export interface OTPFieldProps {
  length?: number;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  autoSubmit?: (value: string) => void;
  separator?: {
    character?: string;
    afterEvery?: number;
  };
  id?: string;
  value?: string;
  name?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

function OTPField({
  length = 6,
  placeholder,
  disabled,
  className,
  onChange,
  autoSubmit,
  separator,
  id,
  value,
  name,
  inputRef,
}: OTPFieldProps) {
  const [internalOtp, setInternalOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Controlled vs uncontrolled logic
  const isControlled = value !== undefined;
  const otpValue = value || '';
  const otp = isControlled ? Array.from({ length }, (_, i) => otpValue[i] || '') : internalOtp;

  const setOtp = (newOtp: string[]) => {
    if (!isControlled) {
      setInternalOtp(newOtp);
    }
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    const otpValue = newOtp.join('');
    onChange?.(otpValue);

    if (otpValue.length === length && autoSubmit) {
      autoSubmit(otpValue);
    }

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const newOtp = new Array(length).fill('');
      setOtp(newOtp);
      onChange?.('');
      inputRefs.current[0]?.focus();
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
      return;
    }

    if (e.key === 'Home') {
      e.preventDefault();
      inputRefs.current[0]?.focus();
      return;
    }

    if (e.key === 'End') {
      e.preventDefault();
      inputRefs.current[length - 1]?.focus();
      return;
    }

    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (e.key === 'Delete') {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
      } else if (index < length - 1) {
        const newOtp = [...otp];
        newOtp[index + 1] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
      }
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      const nextEmptyIndex = otp.findIndex((digit, i) => i > index && !digit);
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
      return;
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>, startIndex: number) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');

    if (!pasteData) return;

    const newOtp = [...otp];
    const availableSlots = length - startIndex;
    const digitsToPaste = pasteData.slice(0, availableSlots);

    for (let i = startIndex; i < Math.min(startIndex + digitsToPaste.length, length); i++) {
      newOtp[i] = '';
    }

    for (let i = 0; i < digitsToPaste.length && startIndex + i < length; i++) {
      newOtp[startIndex + i] = digitsToPaste[i] ?? '';
    }

    setOtp(newOtp);
    const otpValue = newOtp.join('');
    onChange?.(otpValue);

    if (otpValue.length === length && autoSubmit) {
      autoSubmit(otpValue);
    }

    const nextFocusIndex = Math.min(startIndex + digitsToPaste.length, length - 1);
    setTimeout(() => {
      inputRefs.current[nextFocusIndex]?.focus();
    }, 0);
  };

  return (
    <div className={cn('flex w-full items-center gap-2', className)}>
      {otp.map((digit, index) => (
        <React.Fragment key={index}>
          <TextField
            ref={(el) => {
              inputRefs.current[index] = el as HTMLInputElement;
              if (index === 0 && inputRef) {
                if (typeof inputRef === 'function') {
                  inputRef(el as HTMLInputElement);
                } else {
                  inputRef.current = el as HTMLInputElement;
                }
              }
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 text-xl font-semibold *:text-center has-[input]:text-center"
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={(e) => handlePaste(e, index)}
            // Apply the id and name only to the first input for label association and form submission
            id={index === 0 ? id : undefined}
            name={index === 0 ? name : undefined}
          />
          {separator?.afterEvery &&
            (index + 1) % separator.afterEvery === 0 &&
            index < length - 1 && (
              <span className="text-muted-foreground text-2xl font-semibold">
                {separator.character || '-'}
              </span>
            )}
        </React.Fragment>
      ))}
    </div>
  );
}

export { OTPField };
