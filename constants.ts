export const ZOOM = 25; // Scaled up slightly for better visibility
export const GAME_X_OFFSET = 0; // We will center via canvas translation
export const GAME_Y_OFFSET = 0;
export const BOARD_HEIGHT = 20;
export const BOARD_WIDTH = 10;

export const COLORS = [
  "rgb(20, 20, 25)",    // Empty - darker background
  "rgb(168, 85, 247)",  // Purple (T)
  "rgb(34, 211, 238)",  // Cyan (I)
  "rgb(234, 179, 8)",   // Yellow (O)
  "rgb(34, 197, 94)",   // Green (S)
  "rgb(239, 68, 68)",   // Red (Z)
  "rgb(59, 130, 246)",  // Blue (J)
  "rgb(249, 115, 22)",  // Orange (L)
];

// Figure definitions matching the original Python/JS logic
export const FIGURES_DATA = [
  [[1, 5, 9, 13], [4, 5, 6, 7]], // I
  [[4, 5, 9, 10], [2, 6, 5, 9]], // Z
  [[6, 7, 9, 10], [1, 5, 6, 10]], // S
  [[1, 2, 5, 9], [0, 4, 5, 6], [1, 5, 9, 8], [4, 5, 6, 10]], // J
  [[1, 2, 6, 10], [5, 6, 7, 9], [2, 6, 10, 11], [3, 5, 6, 7]], // L
  [[1, 4, 5, 6], [1, 4, 5, 9], [4, 5, 6, 9], [1, 5, 6, 9]], // T
  [[1, 2, 5, 6]], // O
];