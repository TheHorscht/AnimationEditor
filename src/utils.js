export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
export const easingFunctions = {
  none: { displayName: 'Linear', func: t => t },
  easeIn: { displayName: 'EaseIn', func: t => t * t },
  easeOut: { displayName: 'EaseOut', func: t => 1 - (1 - t) * (1 - t) },
  easeInOut: { displayName: 'EaseInOut', func: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 },
};
