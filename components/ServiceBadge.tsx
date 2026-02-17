import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface ServiceBadgeProps {
  service: string;
  color?: string | [string, string];
  title?: string;
  fontFamily?: string;
}

export const parseServiceBadges = (
  rawBadges: (string | ServiceBadgeProps)[]
): ServiceBadgeProps[] => {
  return rawBadges.map((badge) =>
    typeof badge === 'string' ? { service: badge } : badge
  );
};

export const isColorDark = (hex: string): boolean => {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 128;
};

const ServiceBadge: React.FC<ServiceBadgeProps> = ({ service, color, title, fontFamily }) => {
  const label = title ? `${service} | ${title}` : service;
  const isGradient = Array.isArray(color);
  const backgroundColor = !isGradient && color ? color : 'rgba(255, 255, 255, 0.3)';
  const textColor = !isGradient && color && isColorDark(color) ? '#fff' : '#000';

  const textStyle = [
    styles.badgeText,
    { color: textColor, fontFamily: fontFamily || undefined },
  ];

  return (
    <View style={styles.wrapper}>
      {isGradient ? (
        <LinearGradient
          colors={color as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badge}
        >
          <Text style={textStyle}>{label}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.badge, { backgroundColor }]}>
          <Text style={textStyle}>{label}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    margin: 4,
    position: 'relative',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ServiceBadge;