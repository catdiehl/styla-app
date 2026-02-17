import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  PlayfairDisplay_400Regular,
} from '@expo-google-fonts/playfair-display';

const COLORS = {
  darkNavy:  '#001B2E',
  slateBlue: '#294C60',
  lightGrey: '#ADB6C4',
  cream:     '#FFEFD3',
  peach:     '#FFC49B',
  white:     '#FFFFFF',
};

interface AdminPanelScreenProps {
  navigation: any;
}

const AdminPanelScreen: React.FC<AdminPanelScreenProps> = ({ navigation }) => {
  const [fontsLoaded] = useFonts({ PlayfairDisplay_400Regular });

  if (!fontsLoaded) return null;

  const adminFeatures = [
    {
      id: 'tag-management',
      title: 'Tag Management',
      description: 'Manage owner tags and service assignments',
      icon: 'pricetag-outline',
      onPress: () => navigation.navigate('TagManagement'),
    },
    {
      id: 'profile-management',
      title: 'Profile Management',
      description: 'Edit owner profiles and settings',
      icon: 'person-outline',
      onPress: () => navigation.navigate('ProfileManagement'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Panel</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Administrative Tools</Text>
        
        {adminFeatures.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={styles.featureCard}
            onPress={feature.onPress}
          >
            <View style={styles.featureIcon}>
              <Ionicons name={feature.icon as any} size={32} color={COLORS.slateBlue} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.lightGrey} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 27, 46, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 24,
    color: COLORS.darkNavy,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 20,
    color: COLORS.darkNavy,
    marginBottom: 20,
    fontWeight: '600',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: COLORS.darkNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 27, 46, 0.1)',
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(41, 76, 96, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 18,
    color: COLORS.darkNavy,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: COLORS.slateBlue,
    lineHeight: 20,
  },
});

export default AdminPanelScreen; 