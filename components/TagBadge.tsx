import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Tag, OwnerTag } from '../types/tags';

export interface TagBadgeProps {
  tag: Tag;
  ownerTag?: OwnerTag;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  count?: number;
}

export const parseTagBadges = (
  tags: Tag[],
  ownerTags?: { [tagId: string]: OwnerTag }
): TagBadgeProps[] => {
  return tags.map(tag => ({
    tag,
    ownerTag: ownerTags?.[tag.id]
  }));
};

const TagBadge: React.FC<TagBadgeProps> = ({ 
  tag, 
  ownerTag, 
  onPress, 
  selected = false,
  disabled = false,
  size = 'medium',
  showCount = false,
  count
}) => {
  const displayText = ownerTag?.customTitle || tag.displayName;
  const sizeStyles = {
    small: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      fontSize: 10,
      borderRadius: 12
    },
    medium: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      fontSize: 12,
      borderRadius: 16
    },
    large: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      fontSize: 14,
      borderRadius: 20
    }
  };

  const currentSize = sizeStyles[size];

  const textStyle = [
    styles.badgeText,
    { 
      fontSize: currentSize.fontSize,
      opacity: disabled ? 0.5 : 1
    },
  ];

  const badgeStyle = [
    styles.badge,
    {
      paddingHorizontal: currentSize.paddingHorizontal,
      paddingVertical: currentSize.paddingVertical,
      borderRadius: currentSize.borderRadius,
      opacity: disabled ? 0.5 : 1,
      borderColor: selected ? '#007AFF' : '#ddd',
      borderWidth: selected ? 2 : 1,
      backgroundColor: selected ? '#f0f8ff' : '#fff'
    }
  ];

  const content = (
    <>
      <Text style={textStyle}>{displayText}</Text>
      {showCount && count !== undefined && (
        <Text style={[textStyle, styles.countText]}>({count})</Text>
      )}
    </>
  );

  const badgeContent = (
    <View style={styles.wrapper}>
      <View style={badgeStyle}>
        {content}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        disabled={disabled}
        style={styles.touchable}
      >
        {badgeContent}
      </TouchableOpacity>
    );
  }

  return badgeContent;
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    margin: 2,
    position: 'relative',
  },
  touchable: {
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  badgeText: {
    fontWeight: '600',
    color: '#333',
  },
  countText: {
    marginLeft: 4,
    fontSize: 10,
    color: '#666',
  },
});

export default TagBadge; 