const { jest } = require('@jest/globals');
const React = require('react');
const { Text, View } = require('react-native');

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

jest.mock('react-native-vector-icons/Ionicons', () => {
  return ({ name, color, size }) => React.createElement(Text, { accessibilityLabel: name, style: { color, fontSize: size } }, name);
});
