import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Inspector } from './Inspector';

describe('Inspector', () => {
    it('shows the claimed work and the terminal for a Cloud agent', () => {
        render(
            <Inspector
                glyph="CC"
                job="builder"
                handle="cloud-cursor"
                persona="Builder"
                owner="Kasra"
                work="Home screen"
                project="Studio"
                stage="Match the mockup"
                state="Working"
                since="25 min"
                where="Cloud · studio-1"
                terminal={[{ text: '$ npm test', tone: '' }]}
                posts={[{ at: '09:30', where: 'studio', text: 'pushed the Home screen' }]}
            />,
        );
        expect(screen.getByRole('complementary', { name: 'Selected agent' })).toBeInTheDocument();
        expect(screen.getByText('Home screen')).toBeInTheDocument();
        expect(screen.getByRole('log', { name: 'Terminal' })).toHaveTextContent('$ npm test');
        expect(screen.getByText('Take over')).toBeInTheDocument();
    });

    it('hides the terminal when the agent was enrolled by hand', () => {
        render(
            <Inspector
                glyph="CH"
                job="coordinator"
                handle="champion"
                persona="Coordinator"
                owner="Kasra"
                work="Approve the Projects screens"
                project="Studio"
                stage="Design"
                state="Waiting on you"
                stateColor="#f0a070"
                since="2 h"
                where="Kasra’s MacBook"
                posts={[]}
            />,
        );
        expect(screen.queryByRole('log')).not.toBeInTheDocument();
        expect(screen.getByText(/enrolled by hand/)).toBeInTheDocument();
    });
});
