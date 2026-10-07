// Theme plumbing
export { ThemeProvider, useTheme, defaultTheme, studio, studioDark, studioThemeVars, varName, radius } from './theme';
export type { Theme, ThemeProviderProps, StudioTokens, StudioPalette } from './theme';

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

// Ported leaf components
export { TerminalCursor } from './components/TerminalCursor';
export type { TerminalCursorProps } from './components/TerminalCursor';

export { TerminalHeader } from './components/TerminalHeader';
export type { TerminalHeaderProps } from './components/TerminalHeader';

export { TerminalFooter } from './components/TerminalFooter';
export type { TerminalFooterProps } from './components/TerminalFooter';

export { TerminalFileInput } from './components/TerminalFileInput';
export type { TerminalFileInputProps } from './components/TerminalFileInput';

export { TerminalSidebar } from './components/TerminalSidebar';
export type { TerminalSidebarProps } from './components/TerminalSidebar';

export { TerminalTabButton } from './components/TerminalTabButton';
export type { TerminalTabButtonProps } from './components/TerminalTabButton';

export { TerminalTabViewSection } from './components/TerminalTabViewSection';
export type { TerminalTabViewSectionProps, TerminalTabViewSectionItem } from './components/TerminalTabViewSection';

export { TerminalFileUpload } from './components/TerminalFileUpload';
export type { TerminalFileUploadProps } from './components/TerminalFileUpload';

export { TerminalAutocomplete } from './components/TerminalAutocomplete';
export type { TerminalAutocompleteProps } from './components/TerminalAutocomplete';

export { TerminalContextMenu } from './components/TerminalContextMenu';
export type { TerminalContextMenuProps, TerminalContextMenuItem, TerminalContextMenuPosition } from './components/TerminalContextMenu';

export { TerminalHoverMenu } from './components/TerminalHoverMenu';
export type { TerminalHoverMenuProps, TerminalHoverMenuActionButton } from './components/TerminalHoverMenu';

// Ported composite components
export { TerminalDialog } from './components/TerminalDialog';
export type { TerminalDialogProps } from './components/TerminalDialog';

export { TerminalTabBar } from './components/TerminalTabBar';
export type { TerminalTabBarProps, TerminalTabBarTab } from './components/TerminalTabBar';

export { TerminalDialogConfirmation } from './components/TerminalDialogConfirmation';
export type { TerminalDialogConfirmationProps } from './components/TerminalDialogConfirmation';

export { TerminalDataTable2 } from './components/TerminalDataTable2';
export type { TerminalDataTable2Props } from './components/TerminalDataTable2';

export { TerminalTable } from './components/TerminalTable';
export type { TerminalTableProps, TerminalTableColumn, TerminalTableSort, TerminalTableSortDirection } from './components/TerminalTable';

export { TerminalTransferList } from './components/TerminalTransferList';
export type { TerminalTransferListProps, TerminalTransferListItem, TerminalTransferListAddAllResult } from './components/TerminalTransferList';

export { TerminalSlider } from './components/TerminalSlider';
export type { TerminalSliderProps } from './components/TerminalSlider';

export { TerminalSelect } from './components/TerminalSelect';
export type { TerminalSelectProps, TerminalSelectOption } from './components/TerminalSelect';
export { TerminalSecretReveal } from './components/TerminalSecretReveal';
export type { TerminalSecretRevealProps } from './components/TerminalSecretReveal';
export { TerminalTabView } from './components/TerminalTabView';
export type { TerminalTabViewProps, TerminalTabViewTab } from './components/TerminalTabView';
export { TerminalPagedList, usePagedList } from './components/TerminalPagedList';
export type { TerminalPagedListProps, PagedListState, PagedResult } from './components/TerminalPagedList';
export { TerminalErrorBoundary } from './components/TerminalErrorBoundary';
export type { TerminalErrorBoundaryProps } from './components/TerminalErrorBoundary';
export { TerminalMeter } from './components/TerminalMeter';
export type { TerminalMeterProps } from './components/TerminalMeter';

export { TerminalSplit } from './components/TerminalSplit';
export type { TerminalSplitProps } from './components/TerminalSplit';
export { useFullscreen } from './components/useFullscreen';
export type { FullscreenState } from './components/useFullscreen';

export { SegmentedNav } from './components/SegmentedNav';
export type { SegmentedNavProps, SegmentedNavItem } from './components/SegmentedNav';
export { AppHeader } from './components/AppHeader';
export type { AppHeaderProps } from './components/AppHeader';
export { SelectableRowTable } from './components/SelectableRowTable';
export type { SelectableRowTableProps, SelectableColumn, SelectableRow } from './components/SelectableRowTable';
export { FilterChips } from './components/FilterChips';
export type { FilterChipsProps, FilterChip } from './components/FilterChips';
export { StatusDot } from './components/StatusDot';
export type { StatusDotProps } from './components/StatusDot';
export { AgentBadge } from './components/AgentBadge';
export type { BadgeProps as AgentBadgeProps, Job } from './components/AgentBadge';
export { PersonBadge } from './components/PersonBadge';
export type { PersonBadgeProps } from './components/PersonBadge';
export { WorkCard } from './components/WorkCard';
export type { WorkCardProps } from './components/WorkCard';
export type { WorkCardItem } from './components/cardChrome';
export { SwimLanes } from './components/SwimLanes';
export type { SwimLanesProps, SwimLane } from './components/SwimLanes';
export { MilestoneStrip } from './components/MilestoneStrip';
export type { MilestoneStripProps } from './components/MilestoneStrip';
export { WorkflowList } from './components/WorkflowList';
export type { WorkflowListProps, WorkflowMilestone, WorkflowStage, WorkflowAgent, WorkflowJob } from './components/WorkflowList';
export { ChannelRail } from './components/ChannelRail';
export type { ChannelRailProps, ChannelRailItem } from './components/ChannelRail';
export { Inspector } from './components/Inspector';
export type { InspectorProps, InspectorPost } from './components/Inspector';
export { KeyValueList } from './components/KeyValueList';
export type { KeyValueListProps, KeyValueItem } from './components/KeyValueList';
export { Callout } from './components/Callout';
export type { CalloutProps } from './components/Callout';
export { WorkInspector } from './components/WorkInspector';
export type { WorkInspectorProps, WorkCheck, WorkTrail } from './components/WorkInspector';
export { ListPicker } from './components/ListPicker';
export type { ListPickerProps, ListPickerItem } from './components/ListPicker';
export { Panel } from './components/Panel';
export type { PanelProps } from './components/Panel';
export { MachineCard } from './components/MachineCard';
export type { MachineCardProps, MachineShell, ShellState } from './components/MachineCard';
export { MemberRow } from './components/MemberRow';
export type { MemberRowProps } from './components/MemberRow';
export { ChannelRow } from './components/ChannelRow';
export type { ChannelRowProps } from './components/ChannelRow';
export { ActionBox, Notice } from './components/Notice';
export type { ActionBoxProps, NoticeProps } from './components/Notice';
export { PostItem, postKindColor, postKinds } from './components/PostItem';
export type { PostItemProps } from './components/PostItem';
export { Composer, composerKinds } from './components/Composer';
export type { ComposerProps, ComposerKind } from './components/Composer';
export { RailList } from './components/RailList';
export type { RailListProps, RailWork, RailMember } from './components/RailList';
export { ThreadRow } from './components/ThreadRow';
export type { ThreadRowProps, ThreadReply } from './components/ThreadRow';
export { PresenceList } from './components/PresenceList';
export type { PresenceListProps, PresenceHere, PresenceRecent } from './components/PresenceList';
export { GateList, gateKinds } from './components/GateList';
export type { GateListProps, GateRow, GateAction, GateKind } from './components/GateList';
