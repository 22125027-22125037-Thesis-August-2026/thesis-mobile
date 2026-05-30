import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/theme';

interface TagSelectorProps {
  tags: string[];
  selected: string[];
  onToggle: (tag: string) => void;
  disabled?: boolean;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selected,
  onToggle,
  disabled,
}) => (
  <View style={styles.container}>
    {tags.map(tag => {
      const isSelected = selected.includes(tag);
      return (
        <Pressable
          key={tag}
          style={[styles.chip, isSelected && styles.chipSelected]}
          onPress={() => onToggle(tag)}
          disabled={disabled}
        >
          <AppText style={[styles.chipText, isSelected && styles.chipTextSelected]}>
            {tag}
          </AppText>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.borderSubtle,
    backgroundColor: COLORS.journalPillBackground,
  },
  chipSelected: {
    backgroundColor: COLORS.buttonPrimary,
    borderColor: COLORS.buttonPrimary,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
});

export default TagSelector;
