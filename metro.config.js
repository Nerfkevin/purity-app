// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Reduce the number of file system watchers
config.watchFolders = [__dirname];

// Optimize caching
config.cacheStores = [];

// Increase the max workers
config.maxWorkers = 4;

// Increase transformer and resolver timeouts
config.transformerPath = require.resolve('metro-transform-worker');
config.resolver.resolverMainFields = ['browser', 'main'];
config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json', 'cjs'];
config.resolver.assetExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'ttf', 'db'];

// Updated configuration for nanoid v5
config.resolver.alias = {
  ...config.resolver.alias,
  'nanoid': path.resolve(__dirname, 'node_modules/nanoid')
};

module.exports = config;