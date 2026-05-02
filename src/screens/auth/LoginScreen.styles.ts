import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONT_SIZES } from '@/theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    overflow: 'hidden',
    zIndex: -1,
  },
  circle: {
    width: width * 1.2,
    height: 400,
    borderRadius: 1000,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: -220,
    left: -(width * 1.2 - width) / 2,
  },
  headerContainer: {
    marginTop: 60,
    marginBottom: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.socialBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  linkText: {
    color: COLORS.link,
    fontWeight: 'bold',
  },
  forgotPasswordLink: {
    marginTop: 10,
  },
});
