// src/screens/booking/AppointmentsHistoryScreen.styles.ts
import { StyleSheet } from 'react-native';
import { COLORS } from '@/theme';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
  },
  headerContainer: {
    minHeight: 56,
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  rightSpacer: {
    width: 40,
    height: 40,
  },
  titleWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  title: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 999,
    padding: 4,
    marginBottom: 16,
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 7,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: COLORS.appointmentsActive,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.shadowBase,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  therapistRow: {
    flexDirection: 'row',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: COLORS.inputBackground,
    marginRight: 12,
  },
  therapistInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  therapistName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  therapistSpecialty: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.placeholder,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    marginVertical: 12,
  },
  timeDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  seeMoreButton: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeMoreText: {
    marginLeft: 4,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  expandedActions: {
    marginTop: 14,
  },
  actionButton: {
    backgroundColor: COLORS.appointmentsActive,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default styles;
