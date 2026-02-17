import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { OwnerService, OwnerWithTags } from '../services/ownerService';

const { height } = Dimensions.get('window');
import {
  useFonts,
  PlayfairDisplay_400Regular,
} from '@expo-google-fonts/playfair-display';

const COLORS = {
  darkNavy: '#001B2E',
  slateBlue: '#294C60',
  lightGrey: '#ADB6C4',
  cream: '#FFEFD3',
  peach: '#FFC49B',
  white: '#EEEEEE',
};

interface ProfileManagementScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route?: {
    params?: {
      mode?: 'builder' | 'editor';
    };
  };
}

const ProfileManagementScreen: React.FC<ProfileManagementScreenProps> = ({ navigation, route }) => {
  const [fontsLoaded] = useFonts({ PlayfairDisplay_400Regular });
  const [owners, setOwners] = useState<OwnerWithTags[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<OwnerWithTags[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOwners();
  }, []);

  useEffect(() => {
    filterOwners();
  }, [searchQuery, owners]);

  const loadOwners = async () => {
    try {
      setLoading(true);
      const allOwners = await OwnerService.getAllOwnersWithTags();
      setOwners(allOwners);
      setFilteredOwners(allOwners);
    } catch (error) {
      console.error('Failed to load owners:', error);
      Alert.alert('Error', 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const filterOwners = () => {
    if (!searchQuery.trim()) {
      setFilteredOwners(owners);
      return;
    }

    const filtered = owners.filter(owner => {
      const businessName = owner.businessProfile?.businessName?.toLowerCase() || '';
      const firstName = owner.businessProfile?.firstName?.toLowerCase() || '';
      const lastName = owner.businessProfile?.lastName?.toLowerCase() || '';
      const ownerId = owner.id.toLowerCase();
      const query = searchQuery.toLowerCase();

      return businessName.includes(query) || 
             firstName.includes(query) || 
             lastName.includes(query) || 
             ownerId.includes(query);
    });

    setFilteredOwners(filtered);
  };

  const handleOwnerSelect = (owner: OwnerWithTags) => {
    navigation.navigate('ProfileBuilder', { ownerId: owner.id });
  };

  if (!fontsLoaded) return null;

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profiles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile Management</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, business, or ID..."
          placeholderTextColor={COLORS.lightGrey}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.ownersList} showsVerticalScrollIndicator={false}>
        {filteredOwners.length === 0 ? (
          <Text style={styles.noResultsText}>
            {searchQuery ? 'No profiles found matching your search.' : 'No profiles available.'}
          </Text>
        ) : (
          filteredOwners.map((owner) => (
            <TouchableOpacity
              key={owner.id}
              style={styles.ownerRow}
              onPress={() => handleOwnerSelect(owner)}
            >
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>
                  @{owner.businessProfile?.businessName || 'Unnamed Business'}
                </Text>
                <Text style={styles.ownerDetails}>
                  {owner.businessProfile?.firstName || ''} {owner.businessProfile?.lastName || ''} • ID: {owner.id}
                </Text>
                <Text style={styles.ownerAddress}>
                  {owner.businessProfile?.businessAddress || 'No address'}
                </Text>
              </View>
              <Text style={styles.selectText}>Edit →</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.darkNavy,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_400Regular',
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontFamily: 'PlayfairDisplay_400Regular',
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  searchInput: {
    backgroundColor: 'rgba(41, 76, 96, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_400Regular',
    color: COLORS.darkNavy,
  },
  ownersList: {
    flex: 1,
    paddingBottom: 120,
  },
  ownerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(41, 76, 96, 0.1)',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay_400Regular',
    fontWeight: 'bold',
    color: COLORS.darkNavy,
    marginBottom: 4,
  },
  ownerDetails: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay_400Regular',
    color: COLORS.slateBlue,
    marginBottom: 2,
  },
  ownerAddress: {
    fontSize: 12,
    fontFamily: 'PlayfairDisplay_400Regular',
    color: COLORS.lightGrey,
  },
  selectText: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay_400Regular',
    color: COLORS.slateBlue,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_400Regular',
    color: COLORS.darkNavy,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_400Regular',
    color: COLORS.lightGrey,
  },
});

export default ProfileManagementScreen; 