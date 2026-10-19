import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { studio } from '../theme/studio';
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

    it('rings the selected row and marks it pressed or current, and only it', () => {
        render(<PresenceList here={[...here, { id: 'reviewer', glyph: 'RV', job: 'reviewer', handle: 'reviewer', note: 'Reviewer', state: 'here' }]} selected="builder" />);
        const builder = screen.getByRole('button', { name: /builder/ });
        expect(builder).toHaveAttribute('aria-pressed', 'true');
        expect(builder).toHaveInlineStyle({ boxShadow: 'inset 0 0 0 1px var(--studio-accent, #e8743b)' });
        expect(screen.getByRole('button', { name: /reviewer/ })).toHaveAttribute('aria-pressed', 'false');
        expect(screen.getByRole('link', { name: /Kasra/ })).not.toHaveAttribute('aria-current');
    });

    it('marks nothing when no selection is given', () => {
        render(<PresenceList here={here} />);
        expect(screen.getByRole('button', { name: /builder/ })).not.toHaveAttribute('aria-pressed');
    });

    it('marks a selected link current', () => {
        render(<PresenceList here={here} selected="kasra" />);
        expect(screen.getByRole('link', { name: /Kasra/ })).toHaveAttribute('aria-current', 'true');
    });

    it('says what a click does when the screen gives a row title', () => {
        render(<PresenceList here={here} rowTitle={(row) => `Show only @${row.handle}'s posts`} />);
        expect(screen.getByRole('button', { name: /builder/ })).toHaveAttribute('title', "Show only @builder's posts");
        expect(screen.getByRole('link', { name: /Kasra/ })).toHaveAttribute('title', "Show only @Kasra's posts");
    });

    it('keeps the terminal tooltip without one', () => {
        render(<PresenceList here={here} />);
        expect(screen.getByRole('button', { name: /builder/ })).toHaveAttribute('title', 'Open its terminal, recorded session and work');
    });
});

describe('PresenceList busy look', () => {
    const busy: PresenceHere[] = [
        { id: 'builder', glyph: 'BU', job: 'builder', handle: 'builder', note: 'Builder', state: 'working', activity: 'thinking' },
        { id: 'kasra', glyph: 'KR', person: true, handle: 'Kasra', note: 'you · owner', state: 'here' },
    ];

    it('changes nothing for a caller that does not ask for it', () => {
        const { container } = render(<PresenceList here={here} />);
        expect(container.querySelector('style')).toBeNull();
        expect(container.querySelector('.tuxc-presence-pulse, .tuxc-presence-sweep, .tuxc-presence-dots, [class^="tuxc-state-"]')).toBeNull();
    });

    it('rests a working dot at full strength, in the accent, without animate', () => {
        render(<PresenceList here={here} />);
        const dot = screen.getByRole('button', { name: /builder/ }).querySelector('[aria-label="working"]') as HTMLElement;
        expect(dot.className).toBe('');
        expect(dot).toHaveInlineStyle({ background: studio.accent });
        expect(dot.style.opacity).toBe('');
    });

    it('shows the activity word, still, without animate', () => {
        const { container } = render(<PresenceList here={busy} />);
        expect(screen.getByText('thinking')).toBeInTheDocument();
        expect(container.querySelector('style')).toBeNull();
        expect(container.querySelector('.tuxc-presence-sweep')).toBeNull();
    });

    it('pulses a working dot and sweeps its word, with running dots', () => {
        const { container } = render(<PresenceList here={busy} animate />);
        const working = screen.getByRole('button', { name: /builder/ });
        expect(working.querySelector('[aria-label="working"]')).toHaveClass('tuxc-state-working');
        expect(screen.getByText('thinking')).toHaveClass('tuxc-presence-sweep');
        expect(working.querySelector('.tuxc-presence-dots')).not.toBeNull();
        const css = container.querySelector('style')?.textContent ?? '';
        expect(css).toContain('@keyframes tuxc-presence-pulse');
        expect(css).toContain('@keyframes tuxc-presence-sweep');
        expect(css).toContain('prefers-reduced-motion');
    });

    it('never animates a seat that is only here', () => {
        render(<PresenceList here={busy} animate />);
        const listening = screen.getByRole('button', { name: /Kasra/ });
        expect(listening.querySelector('.tuxc-presence-pulse, .tuxc-presence-sweep, .tuxc-presence-dots')).toBeNull();
    });

    it('adds no stylesheet when nobody is working', () => {
        const { container } = render(<PresenceList here={[busy[1]]} animate />);
        expect(container.querySelector('style')).toBeNull();
    });

    it('ignores an activity on a seat that is not working', () => {
        render(<PresenceList here={[{ ...busy[1], activity: 'thinking' }]} animate />);
        expect(screen.queryByText('thinking')).toBeNull();
    });
});

describe('PresenceList agent states', () => {
    const seats: PresenceHere[] = [
        { id: 'a', glyph: 'A', job: 'builder', handle: 'a', note: 'Builder', state: 'thinking', since: '20s' },
        { id: 'b', glyph: 'B', job: 'reviewer', handle: 'b', note: 'Reviewer', state: 'waiting', since: '5m' },
        { id: 'c', glyph: 'C', job: 'builder', handle: 'c', note: 'Builder', state: 'listening', since: 'last post 4m ago' },
        { id: 'd', glyph: 'D', job: 'builder', handle: 'd', note: 'Builder', state: 'starting' },
    ];

    it('draws each state’s dot and word, and its since', () => {
        render(<PresenceList here={seats} />);
        expect(screen.getByRole('img', { name: 'thinking' })).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'waiting on you' })).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'listening' })).toBeInTheDocument();
        expect(screen.getByText('20s')).toBeInTheDocument();
        expect(screen.getByText('last post 4m ago')).toBeInTheDocument();
        expect(screen.getByText('waiting on you', { selector: 'bdi' })).toBeInTheDocument();
    });

    it('moves each busy or waiting state its own way, with one stylesheet', () => {
        const { container } = render(<PresenceList here={seats} animate />);
        expect(container.querySelector('[data-state="thinking"]')).toHaveClass('tuxc-state-thinking');
        expect(container.querySelector('[data-state="waiting"]')).toHaveClass('tuxc-state-waiting');
        expect(container.querySelector('[data-state="starting"]')).toHaveClass('tuxc-state-starting');
        expect(container.querySelector('[data-state="listening"]')?.className).toBe('');
        const css = container.querySelectorAll('style');
        expect(css).toHaveLength(1);
        expect(css[0].textContent).toContain('@keyframes tuxc-state-blink');
    });

    it('adds no stylesheet when everyone is only listening or gone', () => {
        const { container } = render(<PresenceList here={[seats[2], { ...seats[2], id: 'e', state: 'gone' }]} animate />);
        expect(container.querySelector('style')).toBeNull();
    });

    it('prefers an activity word for a busy state, stripped of controls', () => {
        render(<PresenceList here={[{ ...seats[0], activity: '‮writing' }]} />);
        expect(screen.getByText('writing').tagName).toBe('BDI');
        expect(screen.queryByText('thinking')).toBeNull();
    });

    it('draws since for the old states too', () => {
        render(<PresenceList here={[{ ...here[1], since: '2m' }]} />);
        expect(screen.getByText('2m')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /builder/ }).querySelector('[aria-label="working"]')).not.toBeNull();
    });
});

describe('PresenceList with an unknown state (security @1295)', () => {
    it('draws the row as here, and the rest of the rail with it', () => {
        const odd = { id: 'x', glyph: 'X', job: 'builder' as const, handle: 'odd', note: 'Builder', state: 'rate-limited' as unknown as 'here' };
        render(<PresenceList here={[odd, here[1]]} animate />);
        expect(screen.getByRole('button', { name: /odd/ }).querySelector('[aria-label="here"]')).not.toBeNull();
        expect(screen.getByRole('button', { name: /builder/ })).toBeInTheDocument();
    });
});

describe('PresenceList survivors (reviewer @1298)', () => {
    it('blinks a rail whose only moving seat is waiting', () => {
        const { container } = render(<PresenceList here={[{ id: 'w', glyph: 'W', job: 'reviewer', handle: 'w', note: 'Reviewer', state: 'waiting' }]} animate />);
        expect(container.querySelector('[data-state="waiting"]')).toHaveClass('tuxc-state-waiting');
        expect(container.querySelector('style')?.textContent).toContain('@keyframes tuxc-state-blink');
    });

    it('draws here as the still green listening dot, never as working', () => {
        render(<PresenceList here={[here[0]]} animate />);
        const dot = screen.getByRole('link', { name: /Kasra/ }).querySelector('[aria-label="here"]') as HTMLElement;
        expect(dot).toHaveAttribute('data-state', 'listening');
        expect(dot).toHaveInlineStyle({ background: studio.job.person });
        expect(dot.className).toBe('');
    });

    it('draws a seat\'s handle and note as isolated plain text', () => {
        const { container } = render(
            <PresenceList
                here={[{ id: 'x', glyph: 'B\u202e', job: 'builder', handle: 'build\u202eer\u200b-1', note: 'Builder\u2066 · x', state: 'here' }]}
                recent={[{ id: 'y', glyph: 'RV', job: 'reviewer', handle: 'rev\u202eiewer', note: 'left\u200f 10:02' }]}
            />,
        );
        const bdis = Array.from(container.querySelectorAll('bdi')).map((b) => b.textContent);
        expect(bdis).toContain('builder-1');
        expect(bdis).toContain('Builder · x');
        expect(bdis).toContain('reviewer');
        expect(bdis).toContain('left 10:02');
        expect(container.textContent).not.toMatch(/[\u202a-\u202e\u2066-\u2069\u200b\u200e\u200f]/);
    });
});
