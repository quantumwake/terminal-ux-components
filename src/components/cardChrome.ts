import { studio } from '../theme/studio';

// Colours from docs/design/mockups/app-v2/source/Board.dc.html.
const flagColor: Record<string, string> = {
    yours: studio.link,
    stuck: studio.link,
    'no objective': studio.link,
    done: studio.job.person,
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
    if (selected) return { background: studio.selected, borderColor: studio.accent };
    if (item.yours) return { background: studio.card, borderColor: studio.accentLine };
    return { background: studio.card, borderColor: studio.line };
}

export function objectiveChrome(objective: string | undefined): { text: string; borderColor: string; color: string } {
    if (objective) return { text: objective, borderColor: studio.dashed, color: studio.textMuted };
    return { text: 'no objective', borderColor: studio.accentLine, color: studio.link };
}
