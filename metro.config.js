const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Custom blacklist that ignores .styles and .types files ONLY in the app directory
// This prevents them from being treated as Expo Router routes
// But allows node_modules files like expo-constants/Constants.types.js to work
const projectRoot = __dirname;
const appPath = path.join(projectRoot, 'app');
const componentsPath = path.join(projectRoot, 'components');
const hooksPath = path.join(projectRoot, 'hooks');

config.resolver.blacklistRE = new RegExp(
  `^(${appPath}|${componentsPath}|${hooksPath})/.*\\.(styles|test|spec)\\.(ts|tsx|js|jsx)$`.replace(/\\/g, '\\/')
);

module.exports = config;
