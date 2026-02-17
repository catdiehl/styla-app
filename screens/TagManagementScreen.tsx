import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');
import {
  useFonts,
  PlayfairDisplay_400Regular,
} from '@expo-google-fonts/playfair-display';
import { OwnerService, OwnerWithTags } from '../services/ownerService';
import { Tag } from '../types/tags';

const COLORS = {
  darkNavy:  '#001B2E',
  slateBlue: '#294C60',
  lightGrey: '#ADB6C4',
  cream:     '#FFEFD3',
  peach:     '#FFC49B',
  white:     '#FFFFFF',
};

interface TagManagementScreenProps {
  navigation: any;
}

const TagManagementScreen: React.FC<TagManagementScreenProps> = ({ navigation }) => {
  const [fontsLoaded] = useFonts({ PlayfairDisplay_400Regular });
  const [owners, setOwners] = useState<OwnerWithTags[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<OwnerWithTags[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  useEffect(() => {
    loadOwners();
    loadTags();
  }, []);

  useEffect(() => {
    filterOwners();
  }, [searchQuery, owners]);

  const loadOwners = async () => {
    try {
      setLoading(true);
      const allOwners = await OwnerService.getAllOwnersWithTags();
      setOwners(allOwners);
    } catch (error) {
      console.error('Failed to load owners:', error);
      Alert.alert('Error', 'Failed to load owners');
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const owners = await OwnerService.getAllOwnersWithTags();
      // Extract unique tags from all owners
      const allTagIds = new Set<string>();
      owners.forEach(owner => {
        if (owner.tagIds) {
          owner.tagIds.forEach(tagId => allTagIds.add(tagId));
        }
      });
      
      // For now, we'll use the tag names that are already loaded with owners
      // In a full implementation, you'd want to load all available tags from TagDatabase
      setAllTags([]); // We don't need this for the current implementation
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const filterOwners = () => {
    if (!searchQuery.trim()) {
      setFilteredOwners(owners);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = owners.filter(owner => {
      const businessName = owner.businessProfile?.businessName?.toLowerCase() || '';
      const businessAddress = owner.businessProfile?.businessAddress?.toLowerCase() || '';
      const ownerId = owner.id.toLowerCase();
      
      return businessName.includes(query) || 
             businessAddress.includes(query) || 
             ownerId.includes(query);
    });
    
    setFilteredOwners(filtered);
  };

  const getTagNames = (tagIds: string[]): string[] => {
    // Since we're using OwnerWithTags that already has tagNames, we can use that
    // This is a fallback in case tagNames is not populated
    return tagIds
      .map(tagId => allTags.find(tag => tag.id === tagId)?.displayName)
      .filter(Boolean) as string[];
  };

  const openOwnerDetails = (owner: OwnerWithTags) => {
    navigation.navigate('OwnerTagEditor', { ownerId: owner.id, owner });
  };

  if (!fontsLoaded) return null; // Fonts will load and component will re-render

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.title}>Tag Management</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.lightGrey} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, business, or ID..."
          placeholderTextColor={COLORS.lightGrey}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.slateBlue} />
          <Text style={styles.loadingText}>Loading owners...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {filteredOwners.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={COLORS.lightGrey} />
              <Text style={styles.emptyTitle}>No owners found</Text>
              <Text style={styles.emptyDescription}>
                {searchQuery ? 'Try adjusting your search terms' : 'No owners in the database yet'}
              </Text>
            </View>
          ) : (
                          <>
                <View style={styles.tableHeader}>
                  <Text style={styles.headerCell}>Owner Information</Text>
                  <Text style={styles.headerCell}>Location</Text>
                  <Text style={styles.headerCell}>Tags</Text>
                </View>
                
                {filteredOwners.map((owner) => (
                  <TouchableOpacity
                    key={owner.id}
                    style={styles.ownerRow}
                    onPress={() => openOwnerDetails(owner)}
                  >
                    <View style={styles.cell}>
                                <Text style={styles.businessName} numberOfLines={1}>
            @{owner.businessProfile?.businessName || 'Unnamed Business'}
          </Text>
                      <Text style={styles.ownerDetails} numberOfLines={1}>
                        {owner.businessProfile?.firstName || 'N/A'} {owner.businessProfile?.lastName || 'N/A'}
                      </Text>
                      <Text style={styles.ownerId}>ID: {owner.id}</Text>
                    </View>
                    
                    <View style={styles.cell}>
                      <Text style={styles.location} numberOfLines={2}>
                        {owner.businessProfile?.businessAddress || 'No address'}
                      </Text>
                    </View>
                    
                    <View style={styles.cell}>
                      <Text style={styles.tags} numberOfLines={3}>
                        {owner.tagNames?.length ? 
                          owner.tagNames.join(', ') : 
                          'No tags'
                        }
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: 40, // Account for status bar
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    backgroundColor: 'rgba(41, 76, 96, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 16,
    color: COLORS.darkNavy,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 16,
    color: COLORS.slateBlue,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 20,
    color: COLORS.darkNavy,
    marginTop: 16,
    fontWeight: '600',
  },
  emptyDescription: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: COLORS.slateBlue,
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 160, // Extra padding to prevent navbar cutoff
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.slateBlue,
    marginBottom: 8,
  },
  headerCell: {
    flex: 1,
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: COLORS.darkNavy,
    fontWeight: 'bold',
  },
  ownerRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 27, 46, 0.1)',
  },
  cell: {
    flex: 1,
    justifyContent: 'center',
  },
  businessName: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 16,
    color: COLORS.darkNavy,
    fontWeight: '600',
  },
  ownerDetails: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: COLORS.slateBlue,
    marginTop: 2,
  },
  ownerId: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: COLORS.lightGrey,
    marginTop: 2,
  },
  location: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: COLORS.slateBlue,
  },
  tags: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: COLORS.slateBlue,
    fontStyle: 'italic',
  },
  editButton: {
    padding: 8,
    backgroundColor: 'rgba(41, 76, 96, 0.1)',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
});

export default TagManagementScreen; 