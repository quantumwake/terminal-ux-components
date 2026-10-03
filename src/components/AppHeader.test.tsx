import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppHeader } from './AppHeader';
import { studio } from '../theme/studio';

const nav = [
    { id: 'home', label: 'Home' },
    { id: 'projects', label: 'Projects' },
    { id: 'agents', label: 'Agents' },
    { id: 'organization', label: 'Organization' },
];

function renderHeader(current = 'home') {
    const onNavigate = vi.fn();
    const onOrganization = vi.fn();
    render(
        <AppHeader
            organization="Quantum Wake"
            organizations={['Quantum Wake', 'Other']}
            onOrganization={onOrganization}
            nav={nav}
            current={current}
            onNavigate={onNavigate}
            user={{ name: 'Kasra', role: 'Owner' }}
        />,
    );
    return { onNavigate, onOrganization };
}

describe('AppHeader', () => {
    it('paints the header bar in the studio header colour', () => {
        renderHeader();
        expect(screen.getByRole('banner')).toHaveStyle({ backgroundColor: studio.header });
    });

    it('marks the current section and reports a click on another', () => {
        const { onNavigate } = renderHeader();
        expect(screen.getByRole('tab', { name: 'Home' })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('tab', { name: 'Projects' })).toHaveAttribute('aria-selected', 'false');
        fireEvent.click(screen.getByRole('tab', { name: 'Agents' }));
        expect(onNavigate).toHaveBeenCalledWith('agents');
    });

    it('shows the person and reports an organization change', () => {
        const { onOrganization } = renderHeader();
        expect(screen.getByText('Kasra')).toBeInTheDocument();
        expect(screen.getByText(/Owner/)).toBeInTheDocument();
        fireEvent.change(screen.getByRole('combobox', { name: 'Organization' }), { target: { value: 'Other' } });
        expect(onOrganization).toHaveBeenCalledWith('Other');
    });
});
