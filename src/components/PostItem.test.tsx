import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { studio } from '../theme/studio';
import { PostItem, postKindColor, postKinds } from './PostItem';

const post = {
    glyph: 'CH',
    job: 'coordinator' as const,
    handle: 'champion',
    kind: 'request',
    at: '08:40',
    text: 'Approve the new Projects screens before the build starts. Canvas is linked on the item.',
    card: 'Approve the Projects screens',
};

describe('PostItem', () => {
    it('shows the handle, the kind, and the board chip', () => {
        render(<PostItem {...post} />);
        expect(screen.getByText('champion')).toBeInTheDocument();
        expect(screen.getByText('request')).toHaveInlineStyle({ color: studio.job.coordinator });
        expect(screen.getByText('on the board')).toBeInTheDocument();
        expect(screen.getByText('Approve the Projects screens')).toBeInTheDocument();
    });

    it('gives every viewer kind its own pill colour', () => {
        const seen = new Set(postKinds.map((kind) => postKindColor(kind)));
        expect(seen.size).toBe(postKinds.length);
        for (const kind of postKinds) {
            render(<PostItem {...post} kind={kind} card={undefined} />);
            expect(screen.getByText(kind)).toHaveStyle({ color: postKindColor(kind) });
        }
    });

    it('still shows a kind the map does not name', () => {
        render(<PostItem {...post} kind="note" card={undefined} />);
        expect(screen.getByText('note')).toHaveInlineStyle({ color: studio.textFaint });
    });

    it('follows the board chip', () => {
        const onCard = vi.fn();
        render(<PostItem {...post} onCard={onCard} />);
        fireEvent.click(screen.getByRole('button', { name: /on the board/ }));
        expect(onCard).toHaveBeenCalledOnce();
    });

    it('renders an image tag and a javascript link as text', () => {
        const { container } = render(
            <PostItem {...post} card={undefined} text={'<img src=x onerror=alert(1)> [go](javascript:alert(1))'} />,
        );
        expect(container.querySelector('img')).toBeNull();
        expect(container.querySelector('a')).toBeNull();
        expect(screen.getByText(/onerror/)).toBeInTheDocument();
        expect(screen.getByText(/javascript:/)).toBeInTheDocument();
    });
});
