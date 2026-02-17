import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';

const COLORS = {
  darkNavy: '#001B2E',
  slateBlue: '#294C60',
  lightGrey: '#ADB6C4',
  cream: '#FFEFD3',
  peach: '#FFC49B',
};

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Not logged in</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {user.photoURL ? (
          <Image
            source={{ uri: user.photoURL }}
            style={styles.profileImage}
          />
        ) : (
          <View style={[styles.profileImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>
              {user.displayName?.[0] || user.email?.[0] || '?'}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{user.displayName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email Verified:</Text>
          <Text style={styles.value}>
            {user.emailVerified ? 'Yes' : 'No'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{user.uid}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Provider:</Text>
          <Text style={styles.value}>
            {user.providerData[0]?.providerId || 'Unknown'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkNavy,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  placeholderImage: {
    backgroundColor: COLORS.slateBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
    color: COLORS.cream,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.cream,
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: COLORS.lightGrey,
    marginBottom: 24,
  },
  infoSection: {
    padding: 20,
    backgroundColor: COLORS.slateBlue,
    margin: 20,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkNavy,
  },
  label: {
    fontSize: 16,
    color: COLORS.lightGrey,
  },
  value: {
    fontSize: 16,
    color: COLORS.cream,
    flex: 1,
    textAlign: 'right',
    marginLeft: 20,
  },
  logoutButton: {
    backgroundColor: COLORS.peach,
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.darkNavy,
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    color: COLORS.cream,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProfileScreen; 