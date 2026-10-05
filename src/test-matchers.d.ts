// toHaveInlineStyle is registered in vitest.setup.ts.
import 'vitest';

declare module 'vitest' {
    interface Assertion {
        toHaveInlineStyle(want: Record<string, string>): void;
    }
}
