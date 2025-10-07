// Jest setup file

// Mock react-native
jest.mock('react-native', () => {
  const React = require('react');

  return {
    Platform: { OS: 'ios', select: jest.fn((obj) => obj.ios) },
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    View: ({ children, ...props }: any) => React.createElement('View', props, children),
    Text: ({ children, ...props }: any) => React.createElement('Text', props, children),
    TouchableOpacity: ({ children, onPress, ...props }: any) =>
      React.createElement('TouchableOpacity', { ...props, onPress }, children),
    Image: (props: any) => React.createElement('Image', props),
    ScrollView: ({ children, ...props }: any) => React.createElement('ScrollView', props, children),
    FlatList: ({ data, renderItem, ...props }: any) =>
      React.createElement('FlatList', props, data?.map((item: any, index: number) => renderItem({ item, index }))),
    TextInput: (props: any) => React.createElement('TextInput', props),
    Button: (props: any) => React.createElement('Button', props),
    Modal: ({ children, visible, ...props }: any) =>
      visible ? React.createElement('Modal', props, children) : null,
    KeyboardAvoidingView: ({ children, ...props }: any) =>
      React.createElement('KeyboardAvoidingView', props, children),
    Alert: { alert: jest.fn() },
    Keyboard: { dismiss: jest.fn() },
    Pressable: ({ children, onPress, ...props }: any) =>
      React.createElement('Pressable', { ...props, onPress }, children),
    Animated: {
      View: ({ children, ...props }: any) => React.createElement('Animated.View', props, children),
      Text: ({ children, ...props }: any) => React.createElement('Animated.Text', props, children),
      Value: jest.fn(() => ({
        interpolate: jest.fn(),
        setValue: jest.fn(),
      })),
      timing: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback()),
      })),
      spring: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback()),
      })),
      sequence: jest.fn(),
      parallel: jest.fn(),
      loop: jest.fn(),
    },
  };
});

// Mock AsyncStorage for testing
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: () => 'test-id-' + Math.random().toString(36).substring(7),
}));

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
