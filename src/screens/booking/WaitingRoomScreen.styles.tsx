import { StyleSheet } from 'react-native';
import { COLORS } from '@/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.chipSelected,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  timeDateRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  dateText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    marginTop: 14,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.chipSelected,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusText: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.primary,
    fontWeight: '600',
  },
  joinButton: {
    marginTop: 16,
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  infoTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORS.facebook,
  },
  reasonText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.text,
  },
  therapistRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: COLORS.journalBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  therapistInfo: {
    marginLeft: 12,
    flex: 1,
  },
  therapistName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  therapistDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },
});

export default styles;