import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectableRowTable } from './SelectableRowTable';

const columns = [
    { label: 'Agent', width: '200px' },
    { label: 'Working on', width: 'minmax(0, 2fr)' },
];

describe('SelectableRowTable', () => {
    it('marks the selected row and reports a click on another', () => {
        const onSelect = vi.fn();
        render(
            <SelectableRowTable
                columns={columns}
                value="cloud-cursor"
                onSelect={onSelect}
                rows={[
                    { id: 'cloud-cursor', cells: ['cloud-cursor', 'Home screen'] },
                    { id: 'workspace', cells: ['workspace', 'Members join on sign-in'] },
                ]}
            />,
        );
        expect(screen.getByRole('row', { name: /cloud-cursor/ })).toHaveAttribute('aria-pressed', 'true');
        fireEvent.click(screen.getByRole('row', { name: /workspace/ }));
        expect(onSelect).toHaveBeenCalledWith('workspace');
    });
});
