export class Handle {
  constructor(t, value, easingFunction) {
    this.t = t;
    this.value = value || 0;
    this.easingFunction = easingFunction || 'easeInOut';
  }
}
