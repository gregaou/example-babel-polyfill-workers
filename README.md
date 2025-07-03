# Demonstration of Babel Polyfill Issue with Web Workers

This repository aims to demonstrate a compatibility issue between `core-js` polyfills (injected by `@babel/preset-env`) and Webpack's Web Worker loading mechanism.

## The Problem

When targeting older browsers that do not natively support the `new URL(..., import.meta.url)` syntax (e.g., `chrome >= 52`), `@babel/preset-env` injects a polyfill for the `URL` constructor.

This polyfill is incompatible with how Webpack handles the instantiation of Web Workers. Instead of letting Webpack inject the correct path to the worker's chunk, the `URL` polyfill is used, resulting in an incorrect path and a runtime error.

## How to Reproduce

    ```bash
    yarn
    yarn build
    ```


### Scenario 1: Incorrect Behavior (`chrome >= 52`)

With this target, `@babel/preset-env` decides that the `URL` constructor needs a polyfill.

**Fichier `.browserslistrc` :**
```
chrome >= 52
```

**Code generated in `chrome52/main.bundle.js`:**

The worker instantiation code is incorrectly transpiled. The `URL` constructor is replaced by a call to the `core-js` polyfill, which prevents Webpack from correctly resolving the worker's path.

```javascript
// Incorrect: The `URL` polyfill is used
const newFibWorker = new Worker(new (core_js_pure_stable_url_index_js__WEBPACK_IMPORTED_MODULE_2___default())('./worker.ts', "file:///.../src/index.tsx"));
```

This code will fail in the browser because the path to the worker isn't a valid URL that the browser can load.

---

### Scenario 2: Expected Behavior (`chrome >= 67`)

With a more modern target, `@babel/preset-env` knows that the `URL` constructor is natively supported and doesn't polyfill it.

**To test, modify `.browserslistrc` :**
```
chrome >= 67
```

**Generated code (similar to `chrome67/main.bundle.js`) :**

Webpack can then correctly interpret the `new URL(...)` syntax and replace it with its own chunk loading mechanism for workers.

```javascript
// Correct: Webpack handles worker loading
const newFibWorker = new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u("src_worker_ts-_..."), __webpack_require__.b));
```

This code works perfectly because Webpack generates a valid URL for the worker's chunk.


## Explanation

The problem arises because `@babel/preset-env`, based on the target browser list, injects a polyfill for the `URL` constructor via core-js. This polyfill doesn't know how to interact with the Webpack runtime.

Webpack, on the other hand, has special handling for the `new URL('...', import.meta.url)` syntax when it comes to Web Workers. It detects it at compile time to create a separate "chunk" for the worker and replaces the call with its own loading code (`__webpack_require__.p + ...`).

When the polyfill is present, the syntax that Webpack looks for is altered, and Webpack's worker loading mechanism is never triggered.