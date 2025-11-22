/**
 * LED Breadcrumbs Range Definitions for DebugLayer Website
 * Range: 30000-39999 (Website development)
 *
 * This is a reference implementation showing how to define LED ranges
 * for a typical Next.js/React website.
 */

export const LED_RANGES = {
  // 30000-30099: Page lifecycle
  PAGE_LIFECYCLE: {
    MOUNT: 30000,
    HYDRATION_START: 30001,
    HYDRATION_COMPLETE: 30002,
    READY: 30003,
    UNMOUNT: 30099
  },

  // 30100-30199: User interactions
  USER_INTERACTION: {
    BUTTON_CLICK: 30100,
    LINK_CLICK: 30101,
    FORM_FOCUS: 30102,
    FORM_BLUR: 30103,
    INPUT_CHANGE: 30104,
    SUBMIT: 30105,
    CANCEL: 30106,
    NAVIGATION: 30110,
    SCROLL_EVENT: 30111,
    RESIZE_EVENT: 30112
  },

  // 30200-30299: API calls
  API_CALLS: {
    REQUEST_START: 30200,
    REQUEST_SENT: 30201,
    RESPONSE_RECEIVED: 30202,
    RESPONSE_PARSED: 30203,
    CACHE_HIT: 30210,
    CACHE_MISS: 30211,
    RETRY_ATTEMPT: 30220,
    TIMEOUT: 30221
  },

  // 30300-30399: Component rendering
  COMPONENT_RENDERING: {
    RENDER_START: 30300,
    PROPS_VALIDATED: 30301,
    STATE_UPDATED: 30302,
    EFFECT_RAN: 30303,
    RENDER_COMPLETE: 30304,
    RE_RENDER_TRIGGERED: 30310,
    MEMO_HIT: 30311,
    MEMO_MISS: 30312
  },

  // 30400-30499: Form submissions
  FORM_SUBMISSION: {
    VALIDATION_START: 30400,
    VALIDATION_PASSED: 30401,
    VALIDATION_FAILED: 30402,
    SUBMIT_START: 30410,
    SUBMIT_SUCCESS: 30411,
    SUBMIT_FAILED: 30412,
    FIELD_ERROR: 30420,
    FORM_RESET: 30421
  },

  // 30500-30599: Data processing
  DATA_PROCESSING: {
    PARSE_START: 30500,
    PARSE_COMPLETE: 30501,
    TRANSFORM_START: 30510,
    TRANSFORM_COMPLETE: 30511,
    FILTER_APPLIED: 30520,
    SORT_APPLIED: 30521,
    AGGREGATE_START: 30530,
    AGGREGATE_COMPLETE: 30531
  },

  // 30600-30699: UI interactions
  UI_INTERACTIONS: {
    MODAL_OPEN: 30600,
    MODAL_CLOSE: 30601,
    DROPDOWN_OPEN: 30602,
    DROPDOWN_CLOSE: 30603,
    TAB_SWITCH: 30610,
    ACCORDION_TOGGLE: 30611,
    TOOLTIP_SHOW: 30620,
    TOOLTIP_HIDE: 30621,
    ANIMATION_START: 30630,
    ANIMATION_COMPLETE: 30631
  },

  // 30700-30799: Authentication & Authorization
  AUTH: {
    LOGIN_START: 30700,
    LOGIN_SUCCESS: 30701,
    LOGIN_FAILED: 30702,
    LOGOUT: 30703,
    TOKEN_REFRESH: 30710,
    TOKEN_EXPIRED: 30711,
    PERMISSION_CHECK: 30720,
    PERMISSION_GRANTED: 30721,
    PERMISSION_DENIED: 30722
  },

  // 30800-30899: Errors
  ERRORS: {
    GENERIC_ERROR: 30800,
    NETWORK_ERROR: 30801,
    VALIDATION_ERROR: 30802,
    TIMEOUT_ERROR: 30803,
    PARSE_ERROR: 30804,
    STATE_ERROR: 30805,
    COMPONENT_ERROR: 30806,
    BOUNDARY_CAUGHT: 30810,
    RECOVERY_ATTEMPTED: 30811,
    RECOVERY_SUCCESS: 30812,
    RECOVERY_FAILED: 30813
  }
} as const;

// LED documentation for easy reference
export const LED_DOCS = {
  '30000-30099': 'Page lifecycle (mount, hydration, unmount)',
  '30100-30199': 'User interactions (clicks, inputs, navigation)',
  '30200-30299': 'API calls (requests, responses, caching)',
  '30300-30399': 'Component rendering (state, props, effects)',
  '30400-30499': 'Form submissions (validation, errors)',
  '30500-30599': 'Data processing (parse, transform, aggregate)',
  '30600-30699': 'UI interactions (modals, dropdowns, tooltips)',
  '30700-30799': 'Authentication & Authorization',
  '30800-30899': 'Error handling & recovery'
};

// Type helper for LED IDs
export type LEDRange = typeof LED_RANGES;
export type LEDCategory = keyof LEDRange;
export type LEDID = LEDRange[LEDCategory][keyof LEDRange[LEDCategory]];
