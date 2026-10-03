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

    it('uses the given initials, and otherwise the first letters of the name', () => {
        renderHeader();
        expect(screen.getByText('K')).toBeInTheDocument();
        render(
            <AppHeader
                organization="Quantum Wake"
                nav={nav}
                current="projects"
                onNavigate={() => {}}
                user={{ name: 'Kasra', role: 'Owner', initials: 'KR' }}
            />,
        );
        expect(screen.getByText('KR')).toBeInTheDocument();
        expect(screen.getAllByText('Kasra').length).toBeGreaterThan(0);
    });

    it('shows New agent when the screen passes an action', () => {
        render(
            <AppHeader
                organization="Quantum Wake"
                nav={nav}
                current="agents"
                onNavigate={() => {}}
                action={{ label: 'New agent' }}
            />,
        );
        expect(screen.getByRole('button', { name: 'New agent' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Agents' })).toHaveAttribute('aria-selected', 'true');
    });

    it('opens the organization menu and reports the one that was chosen', () => {
        const { onOrganization } = renderHeader();
        expect(screen.getByText('Kasra')).toBeInTheDocument();
        expect(screen.getByText(/Owner/)).toBeInTheDocument();
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Quantum Wake' }));
        expect(screen.getByRole('menu', { name: 'Organizations' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('menuitem', { name: 'Other' }));
        expect(onOrganization).toHaveBeenCalledWith('Other');
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes the organization menu from the keyboard and from outside', () => {
        renderHeader();
        const chip = screen.getByRole('button', { name: 'Quantum Wake' });
        fireEvent.click(chip);
        fireEvent.keyDown(document, { key: 'ArrowDown' });
        expect(screen.getByRole('menuitem', { name: 'Other' })).toHaveFocus();
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        expect(chip).toHaveFocus();
        fireEvent.click(chip);
        fireEvent.mouseDown(document.body);
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
});
