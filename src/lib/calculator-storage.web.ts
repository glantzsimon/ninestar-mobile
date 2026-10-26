import { createCalculatorMemory } from './calculator-memory';

export const calculatorMemory = createCalculatorMemory({
  async read() {
    const value = localStorage.getItem('ninestar-calculator-inputs-v1');
    return value ? JSON.parse(value) : null;
  },
  async write(value) { localStorage.setItem('ninestar-calculator-inputs-v1', JSON.stringify(value)); },
});
