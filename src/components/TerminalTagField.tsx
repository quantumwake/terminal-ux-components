import React, { useState, useRef, useEffect } from 'react';
import { X, Tag } from 'lucide-react';

export interface TerminalTagFieldProps {
    availableOptions?: string[];
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    allowCustomTags?: boolean;
    className?: string;
}

export const TerminalTagField: React.FC<TerminalTagFieldProps> = ({
    availableOptions = [],
    selectedTags,
    onTagsChange,
    placeholder = 'Type to add...',
    icon,
    allowCustomTags = false,
    className = '',
}) => {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredSuggestions = availableOptions.filter(
        (opt) => opt.toLowerCase().includes(inputValue.toLowerCase()) && !selectedTags.includes(opt),
    );

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !selectedTags.includes(trimmedTag)) {
            if (allowCustomTags || availableOptions.includes(trimmedTag)) {
                onTagsChange([...selectedTags, trimmedTag]);
            }
        }
        setInputValue('');
        setShowSuggestions(false);
        setHighlightedIndex(0);
        inputRef.current?.focus();
    };

    const removeTag = (tag: string) => {
        onTagsChange(selectedTags.filter((t) => t !== tag));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredSuggestions.length > 0) {
                addTag(filteredSuggestions[highlightedIndex]);
            } else if (allowCustomTags && inputValue.trim()) {
                addTag(inputValue);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
            removeTag(selectedTags[selectedTags.length - 1]);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="flex items-center gap-1 flex-wrap p-1.5 bg-midnight-surface border border-midnight-border min-h-[36px]">
                {icon || <Tag className="w-4 h-4 text-midnight-text-muted ml-1" />}
                {selectedTags.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-midnight-info/20 border border-midnight-info/40 text-midnight-info-bright text-xs"
                    >
                        {tag}
                        <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-white transition-colors"
                            type="button"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowSuggestions(true);
                        setHighlightedIndex(0);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedTags.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[120px] bg-transparent text-sm text-midnight-text-body placeholder-midnight-text-disabled outline-none"
                />
            </div>

            {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-midnight-surface border border-midnight-border shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredSuggestions.map((opt, index) => (
                        <button
                            key={opt}
                            onClick={() => addTag(opt)}
                            type="button"
                            className={`w-full text-left px-3 py-1.5 text-sm transition-colors
                                ${index === highlightedIndex
                                    ? 'bg-midnight-elevated text-midnight-accent-bright'
                                    : 'text-midnight-text-body hover:bg-midnight-elevated'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TerminalTagField;
