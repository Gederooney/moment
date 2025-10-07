// Mock for react-native in tests
module.exports = {
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  Image: 'Image',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  TextInput: 'TextInput',
  Button: 'Button',
  Alert: {
    alert: jest.fn(),
  },
  Keyboard: {
    dismiss: jest.fn(),
  },
  Animated: {
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(),
    })),
    timing: jest.fn(() => ({ start: jest.fn() })),
    spring: jest.fn(() => ({ start: jest.fn() })),
    View: 'Animated.View',
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
};
