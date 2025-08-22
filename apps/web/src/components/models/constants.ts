export const ICON_SIZES = {
  small: 8,
  medium: 12,
  large: 14,
  xlarge: 16,
  xxlarge: 20,
} as const;

export const TABLE_LIMITS = {
  default: 20,
  providers: 100,
} as const;

export const MODEL_LIMITS = {
  minimal: 6,
  minimalMobile: 4,
  expanded: 20,
} as const;

export const MAX_CAPABILITIES_DISPLAY = 3;

export const STATUS_COLOR_MAP = {
  ACTIVE: 'success',
  DEPRECATED: 'warning',
  MAINTENANCE: 'primary',
  DISCONTINUED: 'default',
} as const;

export const CAPABILITY_ICONS = {
  text: '📝',
  vision: '👁️',
  audio: '🎵',
  multimodal: '🔄',
  code: '💻',
  function_calling: '🔧',
  json_mode: '📋',
  streaming: '⚡',
} as const;

export const CAPABILITY_OPTIONS = [
  { key: 'text', label: 'Text' },
  { key: 'vision', label: 'Vision' },
  { key: 'audio', label: 'Audio' },
  { key: 'multimodal', label: 'Multimodal' },
  { key: 'code', label: 'Code' },
  { key: 'function_calling', label: 'Function Calling' },
  { key: 'json_mode', label: 'JSON Mode' },
  { key: 'streaming', label: 'Streaming' },
] as const;

export const STATUS_OPTIONS = [
  { key: 'ACTIVE', label: 'Active' },
  { key: 'DEPRECATED', label: 'Deprecated' },
  { key: 'MAINTENANCE', label: 'Maintenance' },
  { key: 'DISCONTINUED', label: 'Discontinued' },
] as const;
