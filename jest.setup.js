// Jest setup file

// Mock react-native
jest.mock('react-native', () => ({
  Platform: { OS: 'ios', select: jest.fn((obj) => obj.ios) },
  StyleSheet: { create: jest.fn((styles) => styles) },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  Image: 'Image',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  TextInput: 'TextInput',
  Button: 'Button',
  Alert: { alert: jest.fn() },
  Keyboard: { dismiss: jest.fn() },
}));

// Mock AsyncStorage for testing
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
