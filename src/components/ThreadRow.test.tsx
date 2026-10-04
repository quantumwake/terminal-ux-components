import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThreadRow, type ThreadPost } from './ThreadRow';

const post: ThreadPost = {
    glyph: 'CH',
    job: 'coordinator',
    handle: 'champion',
    kind: 'request',
    at: '08:40',
    text: 'Approve the screens before the build starts.',
};

const reply: ThreadPost = {
    glyph: 'KR',
    person: true,
    handle: 'kasra',
    kind: 'comment',
    at: '08:44',
    text: 'Approved. Start with the channel.',
};

describe('ThreadRow', () => {
    it('shows the post and groups each reply under it', () => {
        render(<ThreadRow post={post} replies={[reply]} />);
        expect(screen.getByText(post.text)).toBeInTheDocument();
        const list = screen.getByRole('list', { name: 'Replies' });
        expect(list).toContainElement(screen.getByText(reply.text));
        expect(list.compareDocumentPosition(screen.getByText(post.text)) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
    });

    it('sends the reply the box holds', () => {
        const onReply = vi.fn();
        const onDraft = vi.fn();
        render(<ThreadRow post={post} draft="On it." onDraft={onDraft} onReply={onReply} />);
        fireEvent.change(screen.getByRole('textbox', { name: 'Reply' }), { target: { value: 'Done.' } });
        expect(onDraft).toHaveBeenCalledWith('Done.');
        fireEvent.click(screen.getByRole('button', { name: 'Reply' }));
        expect(onReply).toHaveBeenCalledOnce();
    });

    it('does not send an empty reply', () => {
        const onReply = vi.fn();
        render(<ThreadRow post={post} draft="   " onReply={onReply} />);
        fireEvent.click(screen.getByRole('button', { name: 'Reply' }));
        expect(onReply).not.toHaveBeenCalled();
    });

    it('renders markup in a reply as text', () => {
        const { container } = render(
            <ThreadRow post={post} replies={[{ ...reply, text: '<img src=x onerror=alert(1)>' }]} />,
        );
        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByText(/onerror/)).toBeInTheDocument();
    });
});
