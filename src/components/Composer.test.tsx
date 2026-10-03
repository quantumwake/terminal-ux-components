import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Composer, type ComposerKind } from './Composer';

function Harness({ onPost }: { onPost: (text: string, kind: ComposerKind) => void }) {
    const [value, setValue] = useState('');
    const [kind, setKind] = useState<ComposerKind>('comment');
    return <Composer channel="studio" value={value} onChange={setValue} kind={kind} onKind={setKind} onPost={() => onPost(value, kind)} />;
}

describe('Composer', () => {
    it('names the channel and posts the draft as the chosen kind', () => {
        const onPost = vi.fn();
        render(<Harness onPost={onPost} />);
        expect(screen.getByText('Post to # studio')).toBeInTheDocument();
        fireEvent.change(screen.getByRole('combobox', { name: 'As' }), { target: { value: 'request' } });
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Redraw the channel.' } });
        fireEvent.click(screen.getByRole('button', { name: 'Post' }));
        expect(onPost).toHaveBeenCalledWith('Redraw the channel.', 'request');
    });

    it('keeps a draft as text', () => {
        const { container } = render(
            <Composer channel="studio" value={'<img src=x onerror=alert(1)>'} onChange={() => {}} kind="comment" onKind={() => {}} onPost={() => {}} />,
        );
        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByRole('textbox')).toHaveValue('<img src=x onerror=alert(1)>');
    });
});
