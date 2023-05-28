export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
export const easingFunctions = {
  none: { name: 'Linear', func: t => t },
  easeIn: { name: 'EaseIn', func: t => t * t },
  easeOut: { name: 'EaseOut', func: t => 1 - (1 - t) * (1 - t) },
  easeInOut: { name: 'EaseInOut', func: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 },
};
