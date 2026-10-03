import React from 'react';
import { studio } from '../theme/studio';

// Form parts on the studio look, for the forms the boards open in place
// (board 4's New project and Add one of my agents). Not on a mockup of their
// own, they take the boards' field and button styles: ListPicker's search
// box, Panel's outlined button, ListPicker's accent action.

const field: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #3a342e',
    background: studio.panel,
    color: studio.text,
    font: 'inherit',
    fontSize: 13,
};

const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: studio.textFaint, fontFamily: studio.font };

export interface TextFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    maxLength?: number;
    autoFocus?: boolean;
}

export const TextField: React.FC<TextFieldProps> = ({ label, value, onChange, placeholder, maxLength, autoFocus }) => (
    <label style={labelStyle}>
        {label}
        <input type="text" value={value} placeholder={placeholder} maxLength={maxLength} autoFocus={autoFocus} onChange={(e) => onChange(e.target.value)} style={field} />
    </label>
);

export interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, options, placeholder }) => (
    <label style={labelStyle}>
        {label}
        <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...field, appearance: 'auto' }}>
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    </label>
);

export interface FormActionsProps {
    submit: string;
    onSubmit: () => void;
    onCancel?: () => void;
    busy?: boolean;
    disabled?: boolean;
    // Said beside the buttons: a refusal from the API, plainly.
    error?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({ submit, onSubmit, onCancel, busy, disabled, error }) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontFamily: studio.font }}>
        <button
            type="button"
            onClick={onSubmit}
            disabled={disabled || busy}
            style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: studio.accent, color: '#160d07', font: 'inherit', fontSize: 13, fontWeight: 600, cursor: disabled || busy ? 'not-allowed' : 'pointer', opacity: disabled || busy ? 0.6 : 1 }}
        >
            {busy ? `${submit}…` : submit}
        </button>
        {onCancel && (
            <button type="button" onClick={onCancel} disabled={busy} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #3a342e', background: 'none', color: studio.text, font: 'inherit', fontSize: 13, cursor: 'pointer' }}>
                Cancel
            </button>
        )}
        {error && (
            <span role="alert" style={{ fontSize: 12, color: '#f0a070' }}>{error}</span>
        )}
    </span>
);
