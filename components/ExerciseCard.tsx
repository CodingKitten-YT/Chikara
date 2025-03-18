import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ExerciseCardProps {
  title: string;
  level: string;
  imageUrl: string;
  onPress: () => void;
  compact?: boolean;
  tag?: string;
}

const ExerciseCard = ({
  title,
  level,
  imageUrl,
  onPress,
  compact = false,
  tag
}: ExerciseCardProps): React.ReactElement => {
  const { colors } = useTheme();
  const formattedTag = tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : null;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.cardBackground },
        compact ? styles.compactContainer : {}
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.image,
          compact ? styles.compactImage : {}
        ]}
        resizeMode="cover"
      />
      <View style={[styles.overlay, { backgroundColor: colors.exerciseOverlay }]} />
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.tagsContainer}>
            {formattedTag && (
              <View style={[styles.tagContainer, { backgroundColor: colors.primary }]}>
                <Text style={styles.tagText}>{formattedTag}</Text>
              </View>
            )}
            <View style={[styles.levelContainer, { backgroundColor: colors.levelBadgeBackground }]}>
              <Text style={[styles.levelText, { color: colors.levelBadgeText }]}>{level}</Text>
            </View>
          </View>
        </View>
        {!compact && (
          <View style={[styles.arrowContainer, { backgroundColor: colors.levelBadgeBackground }]}>
            <ArrowRight color={colors.levelBadgeText} size={20} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    height: 180,
    width: '100%',
  },
  compactContainer: {
    height: 120,
    width: Dimensions.get('window').width * 0.7,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  compactImage: {
    height: 120,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  levelContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExerciseCard;