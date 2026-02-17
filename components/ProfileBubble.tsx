import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileBubbleProps {
  source: ImageSourcePropType | null;
  borderColor?: string;
  isSelected?: boolean;
}

const ProfileBubble: React.FC<ProfileBubbleProps> = ({ 
  source, 
  borderColor = '#FF3B30',
  isSelected = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={[
        styles.outerCircle, 
        { 
          borderColor,
          borderWidth: isSelected ? 8 : 5,
        }
      ]}>
        {source ? (
          <Image 
            source={source} 
            style={styles.image} 
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, { backgroundColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="person" size={22} color="#999" />
          </View>
        )}
      </View>
      <View style={[styles.tail, { borderTopColor: borderColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    outerCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 5,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
      overflow: 'hidden',
    },
    image: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backfaceVisibility: 'hidden',
    },
    tail: {
      width: 0,
      height: 0,
      borderLeftWidth: 12,
      borderRightWidth: 12,
      borderTopWidth: 14,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: '#FF3B30',
      marginTop: -4,
    },
  });

export default ProfileBubble;
