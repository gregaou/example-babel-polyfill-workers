/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/worker.ts":
/*!***********************!*\
  !*** ./src/worker.ts ***!
  \***********************/
/***/ (() => {

eval("/**\n * Calculates the Nth Fibonacci number.\n * This is a CPU-intensive task, good for demonstrating Web Workers.\n * @param n The number in the Fibonacci sequence to calculate.\n * @returns The Nth Fibonacci number.\n */\nfunction fibonacci(n) {\n  if (n <= 1) {\n    return n;\n  }\n  let a = 0,\n    b = 1,\n    temp;\n  for (let i = 2; i <= n; i++) {\n    temp = a + b;\n    a = b;\n    b = temp;\n  }\n  return b;\n}\n\n// Event listener for messages coming from the main thread\nself.onmessage = event => {\n  const {\n    type,\n    payload\n  } = event.data;\n  console.log(`Worker received message: ${type} with payload:`, payload);\n  switch (type) {\n    case 'calculate_fibonacci':\n      const n = payload;\n      if (typeof n !== 'number' || n < 0) {\n        self.postMessage({\n          type: 'error',\n          message: 'Invalid input for fibonacci calculation. Please provide a non-negative number.'\n        });\n        return;\n      }\n      try {\n        const result = fibonacci(n);\n        // Post the result back to the main thread\n        self.postMessage({\n          type: 'fibonacci_result',\n          result: result,\n          input: n\n        });\n      } catch (error) {\n        self.postMessage({\n          type: 'error',\n          message: `Fibonacci calculation failed: ${error.message}`\n        });\n      }\n      break;\n    case 'echo_message':\n      // Simply echo the received message back\n      self.postMessage({\n        type: 'echo_response',\n        message: `Worker echoes: ${payload}`\n      });\n      break;\n    default:\n      self.postMessage({\n        type: 'error',\n        message: `Unknown message type: ${type}`\n      });\n  }\n};\nconsole.log('Web Worker loaded and ready.');\n\n//# sourceURL=webpack://webpack-worker-demo/./src/worker.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/worker.ts"]();
/******/ 	
/******/ })()
;