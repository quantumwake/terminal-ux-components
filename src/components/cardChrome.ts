import { studio } from '../theme/studio';

// Colours from docs/design/mockups/app-v2/source/Board.dc.html.
const flagColor: Record<string, string> = {
    yours: '#f0a070',
    stuck: '#f0a070',
    'no objective': '#f0a070',
    done: '#9fd39b',
};

export interface WorkCardItem {
    id: string;
    kind: string;
    title: string;
    who: string;
    objective?: string;
    flag?: string;
    yours?: boolean;
}

export function flagTint(flag: string | undefined): string {
    if (!flag) return studio.textFaint;
    return flagColor[flag] ?? studio.textFaint;
}

export function cardChrome(item: WorkCardItem, selected: boolean): { background: string; borderColor: string } {
    if (selected) return { background: '#2b2520', borderColor: studio.accent };
    if (item.yours) return { background: studio.card, borderColor: '#6a3e22' };
    return { background: studio.card, borderColor: studio.line };
}

export function objectiveChrome(objective: string | undefined): { text: string; borderColor: string; color: string } {
    if (objective) return { text: objective, borderColor: '#3a342e', color: studio.textMuted };
    return { text: 'no objective', borderColor: '#6a3e22', color: '#f0a070' };
}
