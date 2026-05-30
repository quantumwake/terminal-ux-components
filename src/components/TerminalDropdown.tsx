import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/solid';

export interface DropdownValue {
    id: string | null;
    label: string;
}

export interface TerminalDropdownProps {
    values?: DropdownValue[];
    onSelect?: (value: DropdownValue) => void;
    defaultValue?: string | null;
    size?: 'small' | 'default' | 'large';
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    allowEmpty?: boolean;
    setExternalValue?: ((setValue: (valueId: string | null) => void) => void) | null;
}

export const TerminalDropdown: React.FC<TerminalDropdownProps> = ({
    values = [],
    onSelect,
    defaultValue = null,
    size = 'default',
    disabled = false,
    placeholder = 'Select an option',
    className = '',
    allowEmpty = false,
    setExternalValue = null,
}) => {
    const [selected, setSelected] = useState<DropdownValue | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const calculatePosition = useCallback(() => {
        if (!buttonRef.current) return { top: 0, left: 0, width: 0 };
        const rect = buttonRef.current.getBoundingClientRect();
        return {
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
        };
    }, []);

    useEffect(() => {
        let newSelected: DropdownValue | null = null;
        if (defaultValue === null && allowEmpty) {
            newSelected = { id: null, label: placeholder };
        } else if (defaultValue !== null) {
            const defaultItem = values.find((item) => item.id === defaultValue);
            if (defaultItem) {
                newSelected = defaultItem;
            } else if (!allowEmpty && values.length > 0) {
                newSelected = values[0];
            }
        } else if (!allowEmpty && values.length > 0) {
            newSelected = values[0];
        }

        if (newSelected && (!selected || selected.id !== newSelected.id)) {
            setSelected(newSelected);
            if (newSelected.id !== null) {
                onSelect?.(newSelected);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultValue, values, allowEmpty, placeholder]);

    const setValue = useCallback(
        (valueId: string | null) => {
            if (valueId === null && allowEmpty) {
                setSelected({ id: null, label: placeholder });
                return;
            }
            const item = values.find((item) => item.id === valueId);
            if (item) {
                setSelected(item);
                onSelect?.(item);
            }
        },
        [values, allowEmpty, placeholder, onSelect],
    );

    useEffect(() => {
        if (setExternalValue) {
            setExternalValue(setValue);
        }
    }, [setExternalValue, setValue]);

    const sizes: Record<string, string> = {
        small: 'px-3 py-1.5 text-xs',
        default: 'px-4 py-2.5 text-sm',
        large: 'px-5 py-3 text-base',
    };

    const handleSelect = (value: DropdownValue) => {
        setSelected(value);
        onSelect?.(value);
    };

    return (
        <div className={`relative ${className}`}>
            <Listbox value={selected ?? undefined} onChange={handleSelect} disabled={disabled}>
                {({ open }) => (
                    <>
                        <ListboxButton
                            ref={buttonRef}
                            className={`
                                inline-flex items-center justify-between w-full
                                border border-midnight-border
                                bg-midnight-surface hover:bg-midnight-elevated hover:border-midnight-border-glow
                                text-midnight-text-body
                                transition-all duration-200
                                focus:outline-none focus:ring-2 focus:ring-midnight-accent/50 focus:border-midnight-accent
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${sizes[size]}
                            `}
                        >
                            <span className="block truncate">{selected?.label || placeholder}</span>
                            <ChevronUpDownIcon className="w-4 h-4 ml-2 text-midnight-text-muted" aria-hidden="true" />
                        </ListboxButton>

                        {open && (
                            <ListboxOptions
                                static
                                style={calculatePosition()}
                                className="
                                    z-50 fixed mt-1 overflow-auto
                                    max-h-60
                                    bg-midnight-surface border border-midnight-border
                                    shadow-[0_8px_24px_rgba(0,0,0,0.4)]
                                "
                            >
                                {allowEmpty && (
                                    <ListboxOption
                                        key="empty"
                                        value={{ id: null, label: placeholder }}
                                        className={({ active, selected }) => `
                                            cursor-pointer transition-colors duration-150
                                            ${active ? 'bg-midnight-elevated text-midnight-accent-bright' : 'text-midnight-text-muted'}
                                            ${selected ? 'bg-midnight-accent/20' : ''}
                                            ${sizes[size]}
                                        `}
                                    >
                                        {({ selected }) => (
                                            <span className={`block truncate ${selected ? 'font-semibold' : ''}`}>
                                                {placeholder}
                                            </span>
                                        )}
                                    </ListboxOption>
                                )}

                                {values.map((item) => (
                                    <ListboxOption
                                        key={item.id}
                                        value={item}
                                        className={({ active, selected }) => `
                                            cursor-pointer transition-colors duration-150
                                            ${active ? 'bg-midnight-elevated text-midnight-accent-bright' : 'text-midnight-text-body'}
                                            ${selected ? 'bg-midnight-accent/20 text-midnight-accent-bright' : ''}
                                            ${sizes[size]}
                                        `}
                                    >
                                        {({ selected }) => (
                                            <span className={`block truncate ${selected ? 'font-semibold' : ''}`}>
                                                {item.label}
                                            </span>
                                        )}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        )}
                    </>
                )}
            </Listbox>
        </div>
    );
};

export default TerminalDropdown;
