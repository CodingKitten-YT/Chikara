import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CategoryPillProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

const CategoryPill: React.FC<CategoryPillProps> = ({
  label,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected ? styles.selectedContainer : {},
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.label,
          isSelected ? styles.selectedLabel : {},
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedContainer: {
    backgroundColor: '#769267',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4A5568',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
});

export default CategoryPill;