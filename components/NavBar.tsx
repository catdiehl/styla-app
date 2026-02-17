import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type NavigationBarProps = {
  onLandingPress: () => void;
  onHomePress: () => void;
  onSearchPress: () => void;
  onProfilePress: () => void;
  onAdminPress?: () => void;
  showAdminButton?: boolean;
};

const COLORS = {
  darkNavy:  '#001B2E',
  slateBlue: '#294C60',
  lightGrey: '#ADB6C4',
  cream:     '#FFEFD3',
  peach:     '#FFC49B',
  white:     '#FFFFFF',
};

const NavigationBar: React.FC<NavigationBarProps> = ({ 
  onLandingPress,
  onHomePress, 
  onSearchPress,
  onProfilePress, 
  onAdminPress, 
  showAdminButton = false 
}) => {
  return (
    <View style={styles.navigationBar}>
      {/* Landing page button */}
      <TouchableOpacity style={styles.navButton} onPress={onLandingPress}>
        <Ionicons name="home" size={28} color={COLORS.slateBlue} />
      </TouchableOpacity>
      {/* Home/Map button */}
      <TouchableOpacity style={styles.navButton} onPress={onHomePress}>
        <Ionicons name="navigate-circle-outline" size={32} color={COLORS.slateBlue} />
      </TouchableOpacity>
      {/* Search button */}
      <TouchableOpacity style={styles.navButton} onPress={onSearchPress}>
        <Ionicons name="search" size={28} color={COLORS.slateBlue} />
      </TouchableOpacity>
      {/* Profile button */}
      <TouchableOpacity style={styles.navButton} onPress={onProfilePress}>
        <Ionicons name="person-circle-outline" size={28} color={COLORS.slateBlue} />
      </TouchableOpacity>
      {/* Admin button - only show if user is logged in */}
      {showAdminButton && onAdminPress && (
        <TouchableOpacity style={styles.navButton} onPress={onAdminPress}>
          <Ionicons name="settings-outline" size={28} color={COLORS.slateBlue} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navigationBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 100,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 27, 46, 0.1)', // Subtle top border
    shadowColor: COLORS.darkNavy,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NavigationBar;