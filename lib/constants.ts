// File size limits
export const MAX_FILE_SIZE = 200 * 1024 * 1024 // 200 MB

// Toast configuration
export const TOAST_LIMIT = 1
export const TOAST_REMOVE_DELAY = 1000000

// Mobile breakpoint
export const MOBILE_BREAKPOINT = 768

// Supported file extensions for code highlighting
export const SUPPORTED_FILE_EXTENSIONS = [
  "js",
  "ts",
  "jsx",
  "tsx",
  "html",
  "css",
  "scss",
  "json",
  "md",
  "txt",
  "py",
  "java",
  "c",
  "cpp",
  "php",
  "rb",
  "go",
  "rs",
  "swift",
  "kt",
  "sql",
  "xml",
  "yaml",
  "yml",
  "toml",
  "sh",
  "bash",
  "graphql",
  "vue",
] as const

// Gist visibility options
export const GIST_VISIBILITY_OPTIONS = ["public", "private"] as const

// API endpoints
export const API_ENDPOINTS = {
  GISTS: "/api/gists",
  GIST_DETAIL: (id: string) => `/api/gists/${id}`,
  GIST_PUBLIC: "/api/gists/public",
  GIST_USER: (userId: string) => `/api/gists/user/${userId}`,
  GIST_DEMO: "/api/gists/demo",
} as const

// Message strings
export const MESSAGES = {
  GIST_CREATED: "Gist created successfully!",
  GIST_DELETED: "Gist deleted successfully!",
  GIST_UPDATED: "Gist updated successfully!",
  FILE_LIMIT_REACHED: "You can only upload one file per gist",
  FILE_SIZE_TOO_LARGE: "The following files exceed 200 MB limit:",
  AUTH_REQUIRED: "Please sign in to perform this action",
  ERROR_OCCURRED: "An error occurred. Please try again.",
} as const

// Form messages
export const FORM_MESSAGES = {
  FILENAME_REQUIRED: "Please provide a filename with extension",
  CODE_REQUIRED: "Please provide code content",
  BOTH_REQUIRED: "Please provide both filename and code",
} as const
