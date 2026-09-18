export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export interface SelectOption { label: string; value: string; disabled?: boolean }
export interface DropdownItem { id: string; label: string; disabled?: boolean; danger?: boolean }
