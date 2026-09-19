import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { TerminalCheckbox } from './TerminalCheckbox';

describe('TerminalCheckbox — the existing checked/unchecked API', () => {
    it('is unchanged by the arrival of indeterminate', () => {
        const onChange = vi.fn();
        const { rerender } = render(<TerminalCheckbox checked={false} name="agree" onChange={onChange} label="I agree" />);
        const box = screen.getByRole('checkbox');
        expect(box).toHaveAttribute('aria-checked', 'false');

        fireEvent.click(box);
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ target: { checked: true, name: 'agree' } }));

        rerender(<TerminalCheckbox checked name="agree" onChange={onChange} label="I agree" />);
        expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
        fireEvent.click(screen.getByRole('checkbox'));
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ target: { checked: false, name: 'agree' } }));
    });

    it('does not fire when disabled', () => {
        const onChange = vi.fn();
        render(<TerminalCheckbox checked={false} disabled onChange={onChange} />);
        fireEvent.click(screen.getByRole('checkbox'));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('reports "mixed" for indeterminate and still toggles to checked on a click', () => {
        const onChange = vi.fn();
        render(<TerminalCheckbox checked={false} indeterminate onChange={onChange} aria-label="Select all" />);
        const box = screen.getByRole('checkbox', { name: 'Select all' });
        expect(box).toHaveAttribute('aria-checked', 'mixed');
        fireEvent.click(box);
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ target: { checked: true, name: undefined } }));
    });

    it('carries shiftKey through for range gestures', () => {
        const onChange = vi.fn();
        render(<TerminalCheckbox checked={false} onChange={onChange} />);
        fireEvent.click(screen.getByRole('checkbox'), { shiftKey: true });
        expect(onChange.mock.calls[0][0].shiftKey).toBe(true);
        fireEvent.keyDown(screen.getByRole('checkbox'), { key: ' ' });
        expect(onChange.mock.calls[1][0].shiftKey).toBe(false); // the keyboard never means "range"
    });
});

describe('TerminalCheckbox — the hidden native input', () => {
    // It is aria-hidden (the <button role="checkbox"> is the accessible
    // control; two checkboxes for one box read as a duplicate to a screen
    // reader) — but aria-hidden is presentation only, so a form that relies
    // on the input's name/value must still submit it.
    const formValue = (checked: boolean, indeterminate = false) => {
        const { container } = render(
            <form>
                <TerminalCheckbox name="agree" checked={checked} indeterminate={indeterminate} onChange={() => {}} />
            </form>,
        );
        return new FormData(container.querySelector('form') as HTMLFormElement).get('agree');
    };

    it('still submits its name/value when checked', () => {
        expect(formValue(true)).toBe('on');
    });

    it('submits nothing when unchecked, indeterminate or not', () => {
        expect(formValue(false)).toBeNull();
        expect(formValue(false, true)).toBeNull();
    });

    it('is hidden from the accessibility tree and out of the tab order, leaving exactly one checkbox', () => {
        const { container } = render(<TerminalCheckbox name="agree" checked onChange={() => {}} />);
        const native = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
        expect(native).toHaveAttribute('aria-hidden', 'true');
        expect(native).toHaveAttribute('tabindex', '-1');
        expect(native.indeterminate).toBe(false);
        expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    });

    it('mirrors indeterminate onto the native input for anything reading the DOM', () => {
        const { container } = render(<TerminalCheckbox checked={false} indeterminate onChange={() => {}} />);
        expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).indeterminate).toBe(true);
    });
});
