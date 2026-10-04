import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThreadRow, type ThreadReply } from './ThreadRow';

const reply: ThreadReply = {
    glyph: 'BU',
    job: 'builder',
    handle: 'builder',
    kind: 'claim',
    at: '09:02',
    text: 'Claimed. Starting with the export endpoint and a test.',
};

const post = {
    pos: 2301,
    glyph: 'KR',
    person: true,
    handle: 'Kasra',
    kind: 'request',
    at: '09:02',
    text: 'Add a CSV export to the reports page.',
    state: 'In Review · waiting on you to approve',
    warn: true,
    replies: [reply],
};

describe('ThreadRow', () => {
    it('keeps a reply under its post when the thread is open', () => {
        render(<ThreadRow {...post} open />);
        const list = screen.getByRole('list', { name: 'Replies' });
        expect(list).toContainElement(screen.getByText(reply.text));
        expect(screen.getByText('Hide 1 reply')).toBeInTheDocument();
    });

    it('hides the replies until the thread is opened', () => {
        render(<ThreadRow {...post} />);
        expect(screen.queryByText(reply.text)).toBeNull();
        expect(screen.getByText('1 reply')).toBeInTheDocument();
    });

    it('sends the draft when the reply field is submitted', () => {
        const onReply = vi.fn();
        const onDraft = vi.fn();
        render(<ThreadRow {...post} open draft="On it." onDraft={onDraft} onReply={onReply} />);
        fireEvent.change(screen.getByRole('textbox', { name: 'Reply in thread' }), { target: { value: 'Done.' } });
        expect(onDraft).toHaveBeenCalledWith('Done.');
        fireEvent.submit(screen.getByRole('form', { name: 'Reply to this post' }));
        expect(onReply).toHaveBeenCalledOnce();
    });

    it('opens a reply field on a post that has no replies yet', () => {
        render(<ThreadRow {...post} replies={[]} open />);
        expect(screen.queryByRole('list', { name: 'Replies' })).toBeNull();
        expect(screen.getByRole('textbox', { name: 'Reply in thread' })).toBeInTheDocument();
    });

    it('does not send an empty reply', () => {
        const onReply = vi.fn();
        render(<ThreadRow {...post} open draft="   " onReply={onReply} />);
        fireEvent.submit(screen.getByRole('form', { name: 'Reply to this post' }));
        expect(onReply).not.toHaveBeenCalled();
    });

    it('renders markup in a reply as text', () => {
        const { container } = render(<ThreadRow {...post} open replies={[{ ...reply, text: '<img src=x onerror=alert(1)>' }]} />);
        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByText(/onerror/)).toBeInTheDocument();
    });
});
