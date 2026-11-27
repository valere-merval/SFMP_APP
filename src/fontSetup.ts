import { Platform, StyleSheet } from 'react-native';

const iosFontMap: Record<string, string> = {
  'Poppins-Regular': 'Poppins-Regular',
  'Poppins-Medium': 'Poppins-Medium',
  'Poppins-SemiBold': 'Poppins-SemiBold',
  'Poppins-Bold': 'Poppins-Bold',
  'Poppins-ExtraBold': 'Poppins-ExtraBold',
  'Oswald-Regular': 'Oswald-Regular',
  'Oswald-Medium': 'Oswald-Medium',
  'Oswald-SemiBold': 'Oswald-SemiBold',
  'Oswald-Bold': 'Oswald-Bold',
  'Oswald-Light': 'Oswald-Light',
  'Oswald-ExtraLight': 'Oswald-ExtraLight',
  'Teko-Regular': 'Teko-Light',
};

if (Platform.OS === 'ios') {
  StyleSheet.setStyleAttributePreprocessor('fontFamily', (nextFontFamily: unknown) => {
    if (typeof nextFontFamily !== 'string') {
      return nextFontFamily;
    }

    return iosFontMap[nextFontFamily] ?? nextFontFamily;
  });
}
