import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../theme';
import { Search } from 'lucide-react';

export interface TerminalAutocompleteProps {
    placeholder?: string;
    onSelect?: (item: any) => void;
    items?: any[];
    value?: any;
    displayField?: string;
    valueField?: string;
    className?: string;
    disabled?: boolean;
    formatDisplay?: (item: any) => string;
    filterFn?: (items: any[], term: string) => any[];
}

export const TerminalAutocomplete: React.FC<TerminalAutocompleteProps> = ({
    placeholder = 'Search...',
    onSelect,
    items = [],
    value,
    displayField = 'label',
    valueField = 'id',
    className = '',
    disabled = false,
    formatDisplay,
    filterFn,
}) => {
    const theme = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Default filter function
    const defaultFilter = (items: any[], term: string) => {
        if (!term) return items;
        const lowerTerm = term.toLowerCase();
        return items.filter((item) => {
            const display = formatDisplay ? formatDisplay(item) : item[displayField];
            return display.toLowerCase().includes(lowerTerm);
        });
    };

    // Filter items when search term changes
    useEffect(() => {
        const filterFunc = filterFn || defaultFilter;
        const filtered = filterFunc(items, searchTerm);
        setFilteredItems(filtered);
        setHighlightedIndex(-1);
    }, [searchTerm, items]);

    // Set initial value
    useEffect(() => {
        if (value && items.length > 0) {
            const selectedItem = items.find((item) => item[valueField] === value);
            if (selectedItem) {
                const display = formatDisplay ? formatDisplay(selectedItem) : selectedItem[displayField];
                setSearchTerm(display);
            }
        }
    }, [value, items]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (item: any) => {
        const display = formatDisplay ? formatDisplay(item) : item[displayField];
        setSearchTerm(display);
        setIsOpen(false);
        if (onSelect) {
            onSelect(item);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            setIsOpen(true);
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredItems.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
                    handleSelect(filteredItems[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setIsOpen(true);
    };

    const handleFocus = () => {
        setIsOpen(true);
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative">
                <Search className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme.text} opacity-50`} />
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={`
                        w-full pl-8 pr-3 py-1 text-sm font-mono
                        ${theme.input.primary}
                        ${theme.font}
                        border rounded-none
                        transition-colors duration-150
                        focus:outline-none
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                />
            </div>

            {isOpen && filteredItems.length > 0 && (
                <div className={`
                    absolute z-[100] w-full mt-1
                    ${theme.bg} ${theme.border}
                    border rounded-none
                    shadow-lg
                    max-h-60 overflow-y-auto
                    overflow-x-hidden
                `}>
                    {filteredItems.map((item, index) => {
                        const display = formatDisplay ? formatDisplay(item) : item[displayField];
                        const isHighlighted = index === highlightedIndex;

                        return (
                            <div
                                key={item[valueField]}
                                onClick={() => handleSelect(item)}
                                className={`
                                    px-3 py-2 cursor-pointer
                                    ${theme.font} text-sm
                                    ${isHighlighted ? theme.bgSecondary : ''}
                                    ${theme.text}
                                    hover:${theme.bgSecondary}
                                    transition-colors duration-150
                                `}
                            >
                                {display}
                            </div>
                        );
                    })}
                </div>
            )}

            {isOpen && searchTerm && filteredItems.length === 0 && (
                <div className={`
                    absolute z-[100] w-full mt-1
                    ${theme.bg} ${theme.border}
                    border rounded-none
                    shadow-lg
                    px-3 py-2
                    ${theme.text} ${theme.font} text-sm
                    opacity-50
                `}>
                    No matches found
                </div>
            )}
        </div>
    );
};

export default TerminalAutocomplete;
