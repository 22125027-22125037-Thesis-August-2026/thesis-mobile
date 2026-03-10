// src/screens/booking/TherapistFilterScreen.styles.ts
import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
    zIndex: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 2,
  },
  backButton: {
    padding: 4,
  },
  switchLink: {
    color: COLORS.white,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  brandText: {
    color: COLORS.chipSelected,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subHeader: {
    color: COLORS.white,
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
    maxWidth: width * 0.55,
  },
  headerImage: {
    position: 'absolute',
    bottom: 0,
    right: 16,
    width: width * 0.35,
    height: '100%',
    zIndex: 1,
  },
  leafBackground: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 32,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 36,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resetBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '500',
    overflow: 'hidden',
  },
  chipSelected: {
    backgroundColor: COLORS.chipSelected,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.chipSelected,
  },
  chipUnselected: {
    backgroundColor: COLORS.white,
    color: COLORS.textSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 12,
  },
  footerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalBtnOutline: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 26,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBtnOutlineText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  modalBtnPrimary: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 26,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  footerButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
});

export default styles;
