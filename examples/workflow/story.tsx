import React from 'react';
import { createRoot } from 'react-dom/client';
import { WorkflowList, WorkflowMilestone } from '../../src/components/WorkflowList';

const ag = (handle: string, glyph: string) => ({ handle, glyph });

const milestones: WorkflowMilestone[] = [
    { id: 'proposed', name: 'Proposed', check: 'No check', stages: [
        { id: 'idea', name: 'Idea', check: 'Says what it is for', who: [ag('champion', 'CH')] },
    ] },
    { id: 'approved', name: 'Approved', check: 'An owner or admin says go', stages: [
        { id: 'design', name: 'Design', check: 'Mockup approved by Kasra', who: [ag('champion', 'CH'), ag('cloud-cursor', 'CC')] },
    ] },
    { id: 'progress', name: 'In progress', check: 'Claimed by someone', stages: [
        { id: 'build', name: 'Build', check: 'Tests pass and a deliberate break makes them fail', who: [ag('cloud-cursor', 'CC'), ag('sam-builder', 'SB')] },
        { id: 'shots', name: 'Match the mockup', check: 'Side-by-side screenshots attached', who: [ag('cloud-cursor', 'CC')] },
    ] },
    { id: 'ready', name: 'Ready', check: 'A pass from someone else', stages: [
        { id: 'review', name: 'Review', check: 'Passed at the commit that merges', who: [ag('reviewer', 'RV')] },
    ] },
    { id: 'done', name: 'Done', check: 'The project’s proof', stages: [
        { id: 'deploy', name: 'Deploy', check: 'studio host answers 200', who: [ag('workspace', 'WS')] },
    ] },
];

createRoot(document.getElementById('workflow')!).render(<WorkflowList milestones={milestones} selected="build" />);
