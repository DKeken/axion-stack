'use client';

import * as React from 'react';

import { Check, Edit2, X } from 'lucide-react';

import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Spinner } from './spinner';

import { cn } from '~/lib/utils';

interface EditableFieldProps {
  /** Current value to display */
  value: string;
  /** Label for the field */
  label: string;
  /** Placeholder text for input */
  placeholder?: string;
  /** Whether the field is currently loading */
  loading?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Input type */
  type?: 'text' | 'email';
  /** Required field validation */
  required?: boolean;
  /** Maximum length for input */
  maxLength?: number;
  /** Custom validation function */
  validate?: (value: string) => string | null;
  /** Additional CSS classes */
  className?: string;
  /** Callback when value is saved */
  onSave: (value: string) => Promise<void> | void;
  /** Optional callback when edit is cancelled */
  onCancel?: () => void;
}

export function EditableField({
  value,
  label,
  placeholder,
  loading = false,
  error = null,
  disabled = false,
  type = 'text',
  required = false,
  maxLength,
  validate,
  className,
  onSave,
  onCancel,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Update edit value when prop value changes
  React.useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Focus input when entering edit mode
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Reset local error when starting to edit
  React.useEffect(() => {
    if (isEditing) {
      setLocalError(null);
    }
  }, [isEditing]);

  const currentError = error || localError;

  const handleStartEdit = () => {
    if (disabled || loading) return;
    setIsEditing(true);
    setEditValue(value);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
    setLocalError(null);
    onCancel?.();
  };

  const handleSave = async () => {
    const trimmedValue = editValue.trim();

    // Validation
    if (required && !trimmedValue) {
      setLocalError(`${label} is required`);
      return;
    }

    if (validate) {
      const validationError = validate(trimmedValue);
      if (validationError) {
        setLocalError(validationError);
        return;
      }
    }

    // If value hasn't changed, just exit edit mode
    if (trimmedValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setLocalError(null);

    try {
      await onSave(trimmedValue);
      setIsEditing(false);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    setLocalError(null); // Clear error when user types
  };

  if (isEditing) {
    return (
      <div className={cn('space-y-2', className)}>
        <Label htmlFor={`edit-${label.toLowerCase()}`}>{label}</Label>
        <div className='flex items-start gap-2'>
          <div className='flex-1 space-y-1'>
            <Input
              ref={inputRef}
              aria-describedby={currentError ? `${label.toLowerCase()}-error` : undefined}
              aria-invalid={!!currentError}
              className={cn(
                currentError ? 'border-destructive focus-visible:ring-destructive/20' : ''
              )}
              disabled={isSaving || loading}
              id={`edit-${label.toLowerCase()}`}
              maxLength={maxLength}
              placeholder={placeholder}
              type={type}
              value={editValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            {currentError && (
              <p
                className='text-sm text-destructive'
                id={`${label.toLowerCase()}-error`}
                role='alert'
              >
                {currentError}
              </p>
            )}
          </div>
          <div className='flex items-center gap-1'>
            <Button
              aria-label='Save changes'
              disabled={isSaving || loading}
              size='sm'
              variant='default'
              onClick={() => void handleSave()}
            >
              {isSaving ? <Spinner className='size-3' /> : <Check className='size-3' />}
            </Button>
            <Button
              aria-label='Cancel editing'
              disabled={isSaving || loading}
              size='sm'
              variant='outline'
              onClick={handleCancel}
            >
              <X className='size-3' />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label>{label}</Label>
      <div className='flex items-center justify-between group'>
        <div className='flex-1'>
          {value ? (
            <p className='text-sm font-medium'>{value}</p>
          ) : (
            <p className='text-sm text-muted-foreground italic'>
              {placeholder || `No ${label.toLowerCase()} set`}
            </p>
          )}
        </div>
        <Button
          aria-label={`Edit ${label.toLowerCase()}`}
          disabled={disabled || loading}
          size='sm'
          variant='ghost'
          onClick={handleStartEdit}
        >
          {loading ? <Spinner className='size-3' /> : <Edit2 className='size-3' />}
        </Button>
      </div>
      {currentError && (
        <p className='text-sm text-destructive' role='alert'>
          {currentError}
        </p>
      )}
    </div>
  );
}
