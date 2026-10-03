import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextField, SelectField, FormActions } from './FormParts';

describe('Form parts', () => {
    it('reports typing and a choice, labelled', () => {
        const onName = vi.fn(), onPick = vi.fn();
        render(<>
            <TextField label="Name" value="" onChange={onName} maxLength={80} />
            <SelectField label="Machine" value="" onChange={onPick} placeholder="Choose one" options={[{ value: 'mac', label: 'This Mac' }]} />
        </>);
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Studio' } });
        expect(onName).toHaveBeenCalledWith('Studio');
        expect(screen.getByLabelText('Name')).toHaveAttribute('maxLength', '80');
        fireEvent.change(screen.getByLabelText('Machine'), { target: { value: 'mac' } });
        expect(onPick).toHaveBeenCalledWith('mac');
    });

    it('submits, cancels, and holds while busy or disabled, saying an error', () => {
        const onSubmit = vi.fn(), onCancel = vi.fn();
        const { rerender } = render(<FormActions submit="Save" onSubmit={onSubmit} onCancel={onCancel} />);
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onCancel).toHaveBeenCalledTimes(1);
        rerender(<FormActions submit="Save" onSubmit={onSubmit} busy error="name is taken" />);
        expect(screen.getByRole('button', { name: 'Save…' })).toBeDisabled();
        expect(screen.getByRole('alert')).toHaveTextContent('name is taken');
        rerender(<FormActions submit="Save" onSubmit={onSubmit} disabled />);
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });
});
