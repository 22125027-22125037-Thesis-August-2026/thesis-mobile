import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '@/theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
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
    width: width * 1.5,
    height: 400,
    borderRadius: 1000,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: -220,
    left: -(width * 1.5 - width) / 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 80,
    marginBottom: 30,
  },
  formContainer: {
    paddingHorizontal: 24,
  },

  // Hộp báo lỗi đặc biệt (giống hình thiết kế)
  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: -8, // Kéo sát lên input trên
  },
  errorText: {
    color: COLORS.errorText,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  checkboxText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
  },
  roleSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 4,
    marginBottom: 10,
  },
  roleSelectorContainer: {
    marginBottom: 16,
    gap: 10,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
  },
  roleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  roleCardText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  roleCardTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  linkText: {
    color: COLORS.primary, // Hoặc màu xanh lá mạ của link điều khoản
    textDecorationLine: 'underline',
  },

  // Nút Đăng ký (Ghi đè màu nền)
  registerButton: {
    backgroundColor: COLORS.buttonRegister, // Màu nâu nhạt
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginLink: {
    color: COLORS.link,
    fontWeight: 'bold',
    marginLeft: 5,
  },

  // Social Buttons Dài (Khác LoginScreen)
  orText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 20,
  },
  socialBtnLong: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    height: 50,
    marginBottom: 12,
  },
  socialBtnText: {
    marginLeft: 10,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
});
