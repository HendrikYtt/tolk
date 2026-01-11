import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectProps {
    label?: string;
    value: string | number | undefined;
    options: SelectOption[];
    onChange: (value: string | number) => void;
    placeholder?: string;
    searchable?: boolean;
    error?: string;
    touched?: boolean;
    disabled?: boolean;
    className?: string;
}

export const Select = ({
    label,
    value,
    options,
    onChange,
    placeholder = 'Select...',
    searchable = false,
    error,
    touched,
    disabled = false,
    className = '',
}: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const showError = touched && error;

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = searchable
        ? options.filter((opt) =>
            opt.label.toLowerCase().includes(search.toLowerCase())
        )
        : options;

    // Update dropdown position when opening
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                containerRef.current &&
                !containerRef.current.contains(target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(target)
            ) {
                setIsOpen(false);
                setSearch('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`w-full ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-foreground mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`
                        w-full flex items-center justify-between rounded-md border bg-background
                        px-3 py-2 text-sm text-left
                        focus:outline-none focus:ring-2 focus:ring-ring
                        disabled:cursor-not-allowed disabled:opacity-50
                        ${showError ? 'border-destructive' : 'border-input'}
                    `}
                >
                    <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
                        {selectedOption?.label || placeholder}
                    </span>
                    <svg
                        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen &&
                    createPortal(
                        <div
                            ref={dropdownRef}
                            style={{
                                position: 'absolute',
                                top: dropdownPos.top,
                                left: dropdownPos.left,
                                width: dropdownPos.width,
                            }}
                            className="z-50 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-auto"
                        >
                            {searchable && (
                                <div className="p-2 border-b border-input">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search..."
                                        className="w-full px-2 py-1 text-sm border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
                                        autoFocus
                                    />
                                </div>
                            )}
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                    No options found
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={`
                                            w-full px-3 py-2 text-sm text-left hover:bg-muted
                                            ${option.value === value ? 'bg-muted' : ''}
                                        `}
                                    >
                                        {option.label}
                                    </button>
                                ))
                            )}
                        </div>,
                        document.body
                    )}
            </div>
            {showError && (
                <p className="mt-1 text-xs text-destructive">{error}</p>
            )}
        </div>
    );
};
