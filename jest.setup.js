const { jest } = require('@jest/globals');
const React = require('react');
const { Text, View } = require('react-native');

jest.mock('@react-navigation/native', () => {
  const ReactLocal = require('react');
  const { View: RNView } = require('react-native');
  return {
    __esModule: true,
    NavigationContainer: ({ children }) => ReactLocal.createElement(RNView, null, children),
    NavigatorScreenParams: {},
  };
});

jest.mock('@react-navigation/bottom-tabs', () => {
  const ReactLocal = require('react');
  const { View: RNView } = require('react-native');
  const Navigator = ({ children }) => ReactLocal.createElement(RNView, null, children);
  const Screen = ({ children, component: Component }) => {
    if (Component) {
      return ReactLocal.createElement(Component);
    }

    if (typeof children === 'function') {
      return children({});
    }

    return children ?? null;
  };

  return {
    __esModule: true,
    createBottomTabNavigator: () => ({ Navigator, Screen }),
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const ReactLocal = require('react');
  const { View: RNView } = require('react-native');
  const Navigator = ({ children }) => ReactLocal.createElement(RNView, null, children);
  const Screen = ({ children, component: Component }) => {
    if (Component) {
      return ReactLocal.createElement(Component);
    }

    if (typeof children === 'function') {
      return children({});
    }

    return children ?? null;
  };

  return {
    __esModule: true,
    createNativeStackNavigator: () => ({ Navigator, Screen }),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const ReactLocal = require('react');
  const { View: RNView } = require('react-native');
  return {
    __esModule: true,
    SafeAreaProvider: ({ children }) => ReactLocal.createElement(RNView, null, children),
  };
});

jest.mock('react-native-maps', () => {
  const MapView = ({ children, ...props }) => React.createElement(View, props, children);
  const Marker = ({ children, title, description, ...props }) =>
    React.createElement(View, props, children ?? React.createElement(Text, null, title || description || 'marker'));

  return {
    __esModule: true,
    default: MapView,
    Marker,
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('react-native-vector-icons/Feather', () => {
  return ({ name, color, size }) => React.createElement(Text, { accessibilityLabel: name, style: { color, fontSize: size } }, name);
});

jest.mock('@react-native-async-storage/async-storage', () => {
  let store = new Map();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key) => (store.has(key) ? store.get(key) : null)),
      setItem: jest.fn(async (key, value) => {
        store.set(key, value);
      }),
      removeItem: jest.fn(async (key) => {
        store.delete(key);
      }),
      clear: jest.fn(async () => {
        store.clear();
      }),
    },
  };
});

jest.mock('react-native-vector-icons/Ionicons', () => {
  return ({ name, color, size }) => React.createElement(Text, { accessibilityLabel: name, style: { color, fontSize: size } }, name);
});
