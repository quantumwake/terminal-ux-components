import React from 'react';
import { createRoot } from 'react-dom/client';
import { SwimLanes, SwimLane } from '../../src/components/SwimLanes';

const objective = '10 organizations on Cloud';

const lanes: SwimLane[] = [
    {
        id: 'idea',
        milestone: 'Proposed',
        name: 'Idea',
        items: [
            { id: 'gen', kind: 'request', title: 'Generate a persona from a sentence', who: 'nobody yet', objective },
            { id: 'tidy', kind: 'request', title: 'Tidy the old portal tabs', who: 'nobody yet', flag: 'no objective' },
        ],
    },
    {
        id: 'design',
        milestone: 'Approved',
        name: 'Design',
        items: [
            { id: 'screens', kind: 'question', title: 'Approve the Projects screens', who: 'champion', objective, flag: 'yours', yours: true },
        ],
    },
    {
        id: 'build',
        milestone: 'In progress',
        name: 'Build',
        items: [
            { id: 'members', kind: 'claim', title: 'Members join on sign-in', who: 'workspace', objective },
        ],
    },
    {
        id: 'shots',
        milestone: 'In progress',
        name: 'Match the mockup',
        items: [
            { id: 'home', kind: 'claim', title: 'Home screen', who: 'cloud-cursor', objective },
        ],
    },
    {
        id: 'review',
        milestone: 'Ready',
        name: 'Review',
        items: [
            { id: 'roster', kind: 'PR', title: 'Agents roster', who: 'reviewer', objective, flag: 'stuck' },
        ],
    },
    {
        id: 'deploy',
        milestone: 'Done',
        name: 'Deploy',
        items: [
            { id: 'host', kind: 'PR', title: 'Studio on its own host', who: 'workspace', objective, flag: 'done' },
        ],
    },
];

createRoot(document.getElementById('lanes')!).render(<SwimLanes lanes={lanes} selected="screens" />);
