import { File, Paths } from 'expo-file-system';
import { createCalculatorMemory } from './calculator-memory';

// App-private persistent inputs, separate from disposable artwork caches.
const file = () => new File(Paths.document, 'calculator-inputs-v1.json');
export const calculatorMemory = createCalculatorMemory({
  async read() {
    const entry = file();
    return entry.exists ? JSON.parse(await entry.text()) : null;
  },
  async write(value) { await file().write(JSON.stringify(value)); },
});
