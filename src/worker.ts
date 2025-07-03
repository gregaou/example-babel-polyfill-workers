/**
 * Calculates the Nth Fibonacci number.
 * This is a CPU-intensive task, good for demonstrating Web Workers.
 * @param n The number in the Fibonacci sequence to calculate.
 * @returns The Nth Fibonacci number.
 */
function fibonacci(n: number): number {
  if (n <= 1) {
    return n;
  }
  let a = 0, b = 1, temp;
  for (let i = 2; i <= n; i++) {
    temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}

self.onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data;

  console.log(`Worker received message: ${type} with payload:`, payload);

  switch (type) {
    case 'calculate_fibonacci':
      const n = payload as number;
      if (typeof n !== 'number' || n < 0) {
        self.postMessage({ type: 'error', message: 'Invalid input for fibonacci calculation. Please provide a non-negative number.' });
        return;
      }
      try {
        const result = fibonacci(n);
        self.postMessage({ type: 'fibonacci_result', result: result, input: n });
      } catch (error) {
        self.postMessage({ type: 'error', message: `Fibonacci calculation failed: ${error.message}` });
      }
      break;

    case 'echo_message':
      self.postMessage({ type: 'echo_response', message: `Worker echoes: ${payload}` });
      break;

    default:
      self.postMessage({ type: 'error', message: `Unknown message type: ${type}` });
  }
};

console.log('Web Worker loaded and ready.');