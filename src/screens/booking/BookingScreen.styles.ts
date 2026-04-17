import { StyleSheet } from 'react-native';
import { COLORS } from '@/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.chipSelected,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 32,
    height: 32,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 130,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  calendarCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 12,
    marginBottom: 20,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  timeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 14,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  timeGrid: {
    marginTop: 4,
  },
  slotsInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 2,
  },
  slotsInfoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  slotsInfoTextInline: {
    marginTop: 0,
    marginLeft: 8,
  },
  slotsErrorText: {
    color: COLORS.errorText,
  },
  timeButton: {
    width: '31%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    marginBottom: 10,
    marginHorizontal: '1.1%',
  },
  timeButtonSelected: {
    backgroundColor: COLORS.buttonPrimary,
    borderColor: COLORS.buttonPrimary,
  },
  timeButtonUnselected: {
    backgroundColor: COLORS.white,
  },
  timeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeButtonTextSelected: {
    color: COLORS.white,
  },
  timeButtonTextUnselected: {
    color: COLORS.text,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.chipSelected,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  confirmButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonActive: {
    backgroundColor: COLORS.buttonPrimary,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  confirmButtonTextActive: {
    color: COLORS.white,
  },
  confirmButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
});

export default styles;
