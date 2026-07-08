const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Fix: @insforge/sdk references Node's `crypto` module internally.
// It's never actually called at runtime on mobile/web, but Metro still tries
// to resolve it. This alias points it to an empty shim.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: path.resolve(__dirname, 'empty-module.js'),
};

// Fix: zustand v5 ships ESM .mjs files (in esm/) that use `import.meta.env`.
// Metro bundles web as a classic <script>, which doesn't support import.meta,
// causing "SyntaxError: Cannot use 'import.meta' outside a module".
// We intercept zustand module resolution on web to use CJS .js files instead.
const zustandBase = path.dirname(require.resolve('zustand/package.json'));
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName.startsWith('zustand')) {
    let cjsFile;

    if (moduleName === 'zustand') {
      cjsFile = path.join(zustandBase, 'index.js');
    } else {
      const subpath = moduleName.replace('zustand/', '');
      cjsFile = path.join(zustandBase, `${subpath}.js`);
    }

    if (fs.existsSync(cjsFile)) {
      return { type: 'sourceFile', filePath: cjsFile };
    }
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
