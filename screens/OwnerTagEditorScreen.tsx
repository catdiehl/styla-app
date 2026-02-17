import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');
import {
  useFonts,
  PlayfairDisplay_400Regular,
} from '@expo-google-fonts/playfair-display';
import { OwnerSettingsDatabase, OwnerSettings } from '../services/databaseService';
import { TagDatabase, OwnerTagProfileDatabase } from '../services/tagService';
import { Tag, TagType, TagCategory } from '../types/tags';
import TagBadge from '../components/TagBadge';

const COLORS = {
  darkNavy:  '#001B2E',
  slateBlue: '#294C60',
  lightGrey: '#ADB6C4',
  cream:     '#FFEFD3',
  peach:     '#FFC49B',
  white:     '#FFFFFF',
};

interface OwnerTagEditorScreenProps {
  navigation: any;
  route: {
    params: {
      ownerId: string;
      owner: OwnerSettings;
    };
  };
}

const OwnerTagEditorScreen: React.FC<OwnerTagEditorScreenProps> = ({ navigation, route }) => {
  const [fontsLoaded] = useFonts({ PlayfairDisplay_400Regular });
  const { ownerId, owner } = route.params;
  
  const [currentTags, setCurrentTags] = useState<Tag[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TagCategory | 'all'>('all');

  useEffect(() => {
    loadOwnerTags();
    loadAvailableTags();
  }, []);

  const loadOwnerTags = async () => {
    try {
      // Get current owner settings
      const ownerSettings = await OwnerSettingsDatabase.getById(ownerId);
      if (ownerSettings?.tagIds) {
        const tags = await TagDatabase.getByIds(ownerSettings.tagIds);
        setCurrentTags(tags);
      }
    } catch (error) {
      console.error('Failed to load owner tags:', error);
      Alert.alert('Error', 'Failed to load owner tags');
    }
  };

  const loadAvailableTags = async () => {
    try {
      const allTags = await TagDatabase.getAll();
      setAvailableTags(allTags);
    } catch (error) {
      console.error('Failed to load available tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = async (tag: Tag) => {
    try {
      setSaving(true);
      
      // Check if tag is already added
      if (currentTags.some(t => t.id === tag.id)) {
        Alert.alert('Tag Already Added', 'This tag is already assigned to this owner.');
        return;
      }

      // Validate tag compatibility
      if (!isTagCompatible(tag)) {
        Alert.alert('Invalid Tag', 'This tag is not compatible with the owner\'s current tags.');
        return;
      }

      // Add tag to owner
      await OwnerTagProfileDatabase.addTagToOwner(ownerId, tag.id);
      
      // Update local state
      setCurrentTags(prev => [...prev, tag]);
      
      Alert.alert('Success', 'Tag added successfully');
    } catch (error) {
      console.error('Failed to add tag:', error);
      Alert.alert('Error', 'Failed to add tag');
    } finally {
      setSaving(false);
    }
  };

  const removeTag = async (tag: Tag) => {
    try {
      setSaving(true);
      
      // Remove tag from owner
      await OwnerTagProfileDatabase.removeTagFromOwner(ownerId, tag.id);
      
      // Update local state
      setCurrentTags(prev => prev.filter(t => t.id !== tag.id));
      
      Alert.alert('Success', 'Tag removed successfully');
    } catch (error) {
      console.error('Failed to remove tag:', error);
      Alert.alert('Error', 'Failed to remove tag');
    } finally {
      setSaving(false);
    }
  };

  const isTagCompatible = (newTag: Tag): boolean => {
    // If it's a primary tag, check if owner already has a primary tag from the same category
    if (newTag.type === TagType.PRIMARY) {
      const existingPrimary = currentTags.find(t => t.type === TagType.PRIMARY && t.category === newTag.category);
      if (existingPrimary) {
        return false;
      }
    }
    
    // If it's a subtag, check if owner has the parent primary tag
    if (newTag.type === TagType.SUBTAG && newTag.parentTagId) {
      const hasParent = currentTags.some(t => t.id === newTag.parentTagId);
      if (!hasParent) {
        return false;
      }
    }
    
    return true;
  };

  const getFilteredAvailableTags = () => {
    if (selectedCategory === 'all') {
      return availableTags.filter(tag => !currentTags.some(t => t.id === tag.id));
    }
    return availableTags.filter(tag => 
      tag.category === selectedCategory && 
      !currentTags.some(t => t.id === tag.id)
    );
  };

  const getCategoryDisplayName = (category: TagCategory): string => {
    switch (category) {
      case TagCategory.HAIR_STYLIST: return 'Hair Stylist';
      case TagCategory.MAKEUP_ARTIST: return 'Makeup Artist';
      case TagCategory.BRIDAL: return 'Bridal';
      case TagCategory.BARBER: return 'Barber';
      case TagCategory.NAILS: return 'Nails';
      case TagCategory.LASHES: return 'Lashes';
      case TagCategory.AESTHETICIAN: return 'Aesthetician';
      case TagCategory.OPTIONAL: return 'Optional';
      default: return category;
    }
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
        <Text style={styles.title}>Edit Tags</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.ownerInfo}>
                  <Text style={styles.businessName}>
            @{owner.businessProfile?.businessName || 'Unnamed Business'}
          </Text>
        <Text style={styles.ownerId}>ID: {ownerId}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.slateBlue} />
          <Text style={styles.loadingText}>Loading tags...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Tags Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Tags ({currentTags.length})</Text>
            {currentTags.length === 0 ? (
              <Text style={styles.emptyText}>No tags assigned</Text>
            ) : (
              <View style={styles.tagsContainer}>
                {currentTags.map(tag => (
                  <View key={tag.id} style={styles.tagWithRemove}>
                    <TagBadge
                      tag={tag}
                      selected={true}
                      onPress={() => {}}
                      size="medium"
                    />
                                         <TouchableOpacity
                       style={styles.removeButton}
                       onPress={() => removeTag(tag)}
                       disabled={saving}
                     >
                       <Ionicons name="close-circle" size={16} color={COLORS.slateBlue} />
                     </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Category Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Tags</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryFilter}
            >
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === 'all' && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory('all')}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === 'all' && styles.categoryButtonTextActive
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              {Object.values(TagCategory).map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.categoryButtonTextActive
                  ]}>
                    {getCategoryDisplayName(category)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Available Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Available Tags ({getFilteredAvailableTags().length})
            </Text>
            {getFilteredAvailableTags().length === 0 ? (
              <Text style={styles.emptyText}>No available tags in this category</Text>
            ) : (
              <View style={styles.tagsContainer}>
                {getFilteredAvailableTags().map(tag => (
                  <TouchableOpacity
                    key={tag.id}
                    onPress={() => addTag(tag)}
                    disabled={saving}
                  >
                    <TagBadge
                      tag={tag}
                      selected={false}
                      onPress={() => addTag(tag)}
                      size="medium"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color={COLORS.white} />
          <Text style={styles.savingText}>Saving changes...</Text>
        </View>
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
  ownerInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 27, 46, 0.1)',
  },
  businessName: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 20,
    color: COLORS.darkNavy,
    fontWeight: '600',
  },
  ownerId: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: COLORS.lightGrey,
    marginTop: 4,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 160, // Extra padding to prevent navbar cutoff
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 18,
    color: COLORS.darkNavy,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: COLORS.lightGrey,
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagWithRemove: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    marginLeft: 2,
  },
  categoryFilter: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(41, 76, 96, 0.1)',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.slateBlue,
  },
  categoryButtonText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: COLORS.slateBlue,
  },
  categoryButtonTextActive: {
    color: COLORS.white,
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 16,
    color: COLORS.white,
    marginTop: 16,
  },
});

export default OwnerTagEditorScreen; 