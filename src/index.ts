// Theme plumbing
export { ThemeProvider, useTheme } from './theme';
export type { Theme, ThemeProviderProps } from './theme';

// Studio (read-only kgraph node/edge renderers + canvas wrapper).
// Requires the @quantumwake/kgraph peer dependency.
export { StudioGraph, StudioNode, CleanEdge, NODE_WIDTH, NODE_HEIGHT, kindForNodeType, displayType } from './studio';
export type { StudioGraphProps, StudioNodeKind, StudioNodeData } from './studio';

// Leaf primitives
export { TerminalButton } from './components/TerminalButton';
export type { TerminalButtonProps } from './components/TerminalButton';

export { TerminalLabel } from './components/TerminalLabel';
export type { TerminalLabelProps } from './components/TerminalLabel';

export { TerminalInput } from './components/TerminalInput';
export type { TerminalInputProps } from './components/TerminalInput';

export { TerminalCheckbox } from './components/TerminalCheckbox';
export type { TerminalCheckboxProps, TerminalCheckboxChangeEvent } from './components/TerminalCheckbox';

export { TerminalToggle } from './components/TerminalToggle';
export type { TerminalToggleProps } from './components/TerminalToggle';

export { TerminalContainer } from './components/TerminalContainer';
export type { TerminalContainerProps } from './components/TerminalContainer';

export { TerminalSection } from './components/TerminalSection';
export type { TerminalSectionProps } from './components/TerminalSection';

export { TerminalTagField } from './components/TerminalTagField';
export type { TerminalTagFieldProps } from './components/TerminalTagField';

export { TerminalInfoButton } from './components/TerminalInfoButton';
export type { TerminalInfoButtonProps } from './components/TerminalInfoButton';

export { TerminalDropdown } from './components/TerminalDropdown';
export type { TerminalDropdownProps, DropdownValue } from './components/TerminalDropdown';
