import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PresenceList, type PresenceHere } from './PresenceList';

const here: PresenceHere[] = [
    { id: 'kasra', glyph: 'KR', person: true, handle: 'Kasra', note: 'you · owner', state: 'here', href: '/agents' },
    { id: 'builder', glyph: 'BU', job: 'builder', handle: 'builder', note: 'Builder · working on CSV export', state: 'working' },
];

describe('PresenceList', () => {
    it('lists who is listening and who left', () => {
        render(
            <PresenceList
                here={here}
                recent={[{ id: 'reviewer', glyph: 'RV', job: 'reviewer', handle: 'reviewer', note: 'Reviewer · left 10:02' }]}
            />,
        );
        expect(screen.getByText('Here now · 2')).toBeInTheDocument();
        expect(screen.getByText('Recently here')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Kasra/ })).toHaveAttribute('href', '/agents');
        expect(screen.getByRole('button', { name: /builder/ })).toBeInTheDocument();
        expect(screen.getByText('reviewer').closest('div')).toHaveStyle({ opacity: '0.6' });
    });

    it('opens the machine for someone here', () => {
        const onSelect = vi.fn();
        render(<PresenceList here={here} onSelect={onSelect} />);
        fireEvent.click(screen.getByRole('button', { name: /builder/ }));
        expect(onSelect).toHaveBeenCalledWith('builder');
    });

    it('hides Recently here when nobody has left', () => {
        render(<PresenceList here={here} />);
        expect(screen.queryByText('Recently here')).toBeNull();
    });

    it('draws a given heading in place of the default one', () => {
        render(<PresenceList here={here} heading={<div data-testid="own-heading">Here now · 2 (folds)</div>} />);
        expect(screen.getByTestId('own-heading')).toBeInTheDocument();
        expect(screen.queryByText('Here now · 2')).toBeNull();
        expect(screen.getByRole('button', { name: /builder/ })).toBeInTheDocument();
    });

    it('renders a note as text', () => {
        const { container } = render(
            <PresenceList here={[{ ...here[0], note: '<img src=x onerror=alert(1)>' }]} />,
        );
        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByText(/onerror/)).toBeInTheDocument();
    });
});
