import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  headerTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    minHeight: 160,
    padding: 14,
    fontSize: 15,
    color: COLORS.text,
    textAlignVertical: 'top',
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 12,
  },
  methodButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  methodButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.chipSelected,
  },
  methodButtonInactive: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  methodButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  methodButtonTextActive: {
    color: COLORS.text,
  },
  methodButtonTextInactive: {
    color: COLORS.textSecondary,
  },
  metaText: {
    marginTop: 12,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
    backgroundColor: COLORS.background,
  },
  nextButton: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: COLORS.buttonPrimaryText,
    fontSize: 17,
    fontWeight: '700',
  },
});

export default styles;
