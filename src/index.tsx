import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

declare global {
  interface Window {
    Worker: typeof Worker;
  }
}

interface WorkerMessage {
  type: string;
  payload?: any;
  result?: any;
  message?: string;
  input?: number;
}

const App = () => {
  const [fibonacciResult, setFibonacciResult] = useState(null);
  const [echoResult, setEchoResult] = useState(null);
  const [workerStatus, setWorkerStatus] = useState('Not started');
  const [fibonacciWorker, setFibonacciWorker] = useState(null);
  const [echoWorker, setEchoWorker] = useState(null);

  useEffect(() => {
    if (typeof Worker === 'undefined') {
      setWorkerStatus('Web Workers are not supported in this browser.');
      return;
    }

    setWorkerStatus('Initializing workers...');

    try {
      const newFibWorker = new Worker(new URL('./worker.ts', import.meta.url), {
        type: 'classic'
      });
      setFibonacciWorker(newFibWorker);

      const newEchoWorker = new Worker(new URL('./worker.ts', import.meta.url), {
        type: 'classic'
      });
      setEchoWorker(newEchoWorker);

      setWorkerStatus('Workers initialized. Waiting for tasks...');
    } catch (error) {
      console.error('Error initializing workers:', error);
      setWorkerStatus(`Error initializing workers: ${error.message}`);
    }

    return () => {
      if (fibonacciWorker) fibonacciWorker.terminate();
      if (echoWorker) echoWorker.terminate();
      console.log('Workers terminated during cleanup.');
    };
  }, []);

  useEffect(() => {
    if (fibonacciWorker) {
      const handleFibonacciMessage = (event: MessageEvent<WorkerMessage>) => {
        const { type, result, message, input } = event.data;
        if (type === 'fibonacci_result') {
          setFibonacciResult(`Fibonacci(${input}) = ${result}`);
          setWorkerStatus('Fibonacci calculation complete.');
        } else if (type === 'error') {
          setFibonacciResult(`Error from Fibonacci worker: ${message}`);
          setWorkerStatus('Fibonacci worker encountered an error.');
        }
      };

      fibonacciWorker.addEventListener('message', handleFibonacciMessage);

      return () => {
        fibonacciWorker.removeEventListener('message', handleFibonacciMessage);
      };
    }
  }, [fibonacciWorker]); 

  useEffect(() => {
    if (echoWorker) {
      const handleEchoMessage = (event: MessageEvent<WorkerMessage>) => {
        const { type, message } = event.data;
        if (type === 'echo_response') {
          setEchoResult(message);
          setWorkerStatus('Echo message received.');
        } else if (type === 'error') {
          setEchoResult(`Error from Echo worker: ${message}`);
          setWorkerStatus('Echo worker encountered an error.');
        }
      };

      echoWorker.addEventListener('message', handleEchoMessage);

      return () => {
        echoWorker.removeEventListener('message', handleEchoMessage);
      };
    }
  }, [echoWorker]);

  const handleCalculateFibonacci = () => {
    if (fibonacciWorker) {
      setFibonacciResult('Calculating Fibonacci...');
      setWorkerStatus('Sending task to Fibonacci worker...');
      fibonacciWorker.postMessage({ type: 'calculate_fibonacci', payload: 40 });
    } else {
      setFibonacciResult('Fibonacci Worker not ready or supported.');
      setWorkerStatus('Fibonacci Worker not available.');
    }
  };

  const handleSendEchoMessage = () => {
    if (echoWorker) {
      setEchoResult('Sending echo message...');
      setWorkerStatus('Sending task to Echo worker...');
      echoWorker.postMessage({ type: 'echo_message', payload: 'Hello from Main Thread!' });
    } else {
      setEchoResult('Echo Worker not ready or supported.');
      setWorkerStatus('Echo Worker not available.');
    }
  };

  return (
    <div className="container" style={{
      fontFamily: 'Inter, sans-serif',
      padding: '20px',
      maxWidth: '800px',
      margin: '40px auto',
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        color: '#1a202c',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        Web Worker Demo
      </h1>

      <p style={{
        fontSize: '1.1rem',
        color: '#4a5568',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        This application demonstrates the use of Web Workers to perform computationally intensive tasks
        (like Fibonacci calculation) and simple message passing in a separate thread,
        keeping the main UI thread responsive.
      </p>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <p style={{
          fontSize: '1rem',
          color: '#2d3748',
          fontWeight: 'bold',
          marginBottom: '10px'
        }}>
          Worker Status: <span style={{ color: '#2b6cb0' }}>{workerStatus}</span>
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            color: '#2d3748',
            marginBottom: '15px'
          }}>
            Fibonacci Calculator (CPU-bound)
          </h2>
          <p style={{ color: '#4a5568', marginBottom: '15px' }}>
            Click the button to calculate the 40th Fibonacci number in a Web Worker.
            This prevents blocking the main thread.
          </p>
          <button
            onClick={handleCalculateFibonacci}
            disabled={!fibonacciWorker}
            style={{
              padding: '12px 25px',
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease, transform 0.2s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              outline: 'none',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3182ce')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4299e1')}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(1px)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            Calculate Fibonacci (40)
          </button>
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#e6fffa',
            border: '1px solid #b2f5ea',
            borderRadius: '8px',
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            color: '#2c7a7b',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            Result: {fibonacciResult || 'No calculation performed.'}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            color: '#2d3748',
            marginBottom: '15px'
          }}>
            Echo Message (Simple Communication)
          </h2>
          <p style={{ color: '#4a5568', marginBottom: '15px' }}>
            Send a simple message to a Web Worker and get an echo back.
          </p>
          <button
            onClick={handleSendEchoMessage}
            disabled={!echoWorker}
            style={{
              padding: '12px 25px',
              backgroundColor: '#68d391',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease, transform 0.2s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              outline: 'none',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#48bb78')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#68d391')}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(1px)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            Send Echo Message
          </button>
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#fffaf0',
            border: '1px solid #feebc8',
            borderRadius: '8px',
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            color: '#9c4221',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            Response: {echoResult || 'No message sent.'}
          </div>
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
} else {
  console.error("Failed to find the root element to render the React application.");
}