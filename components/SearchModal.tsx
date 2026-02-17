import React, { useEffect, useState, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import TagSelector from './TagSelector';
import TagBadge from './TagBadge';
import { TagType, TagCategory } from '../types/tags';
import { TagDatabase } from '../services/tagService';
import { Tag } from '../types/tags';
import Checkbox from 'expo-checkbox';

const { width, height } = Dimensions.get('window');

interface SearchModalProps {
  onSubmit: (query: {
    nameQuery: string;
    selectedPrimaryTags: string[];
    selectedSubtags: string[];
    selectedOptionalTags: string[];
    maxDistance: number;
    zipOverride?: string;
  }) => void;
}

const COLORS = {
  stylaOrange: '#F65802',
  stylaBrown:  '#4B1328',
  lightGrey:   '#ADB6C4',
  cream:       '#FFEFD3',
  peach:       '#FFC49B',
  white:       '#EEEEEE',
};
const BAUHAUS_STACK = '"Bauhaus 93", "ITC Bauhaus", "Josefin Sans", "Futura", "Trebuchet MS", Arial';

const SearchModal: React.FC<SearchModalProps> = ({ onSubmit }) => {
  const translateX = useRef(new Animated.Value(width)).current;
  const [nameQuery, setNameQuery] = useState('');
  const [selectedPrimaryTags, setSelectedPrimaryTags] = useState<string[]>([]);
  const [selectedSubtags, setSelectedSubtags] = useState<string[]>([]);
  const [selectedOptionalTags, setSelectedOptionalTags] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState('10');
  const [useCustomZip, setUseCustomZip] = useState(false);
  const [customZip, setCustomZip] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    loadAllTags();
  }, []);

  const loadAllTags = async () => {
    try {
      const tags = await TagDatabase.getAll();
      setAllTags(tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };


  const handleSubmit = () => {
    onSubmit({
      nameQuery,
      selectedPrimaryTags,
      selectedSubtags,
      selectedOptionalTags,
      maxDistance: parseFloat(maxDistance),
      zipOverride: useCustomZip ? customZip : undefined,
    });
  };

  const toggleMoreFilters = () => {
    setShowMoreFilters(!showMoreFilters);
  };

  const getSelectedTags = () => {
    const selectedTags: Tag[] = [];
    selectedPrimaryTags.forEach(tagId => {
      const tag = allTags.find(t => t.id === tagId);
      if (tag) selectedTags.push(tag);
    });
    
    selectedSubtags.forEach(tagId => {
      const tag = allTags.find(t => t.id === tagId);
      if (tag) selectedTags.push(tag);
    });
    
    selectedOptionalTags.forEach(tagId => {
      const tag = allTags.find(t => t.id === tagId);
      if (tag) selectedTags.push(tag);
    });
    
    return selectedTags;
  };

  const renderSelectedTags = () => {
    const selectedTags = getSelectedTags();
    if (selectedTags.length === 0) return null;

    return (
      <View style={styles.selectedSection}>
        <Text style={styles.selectedTitle}>Selected Services:</Text>
        <View style={styles.selectedTagsContainer}>
          {selectedPrimaryTags.map(tagId => {
            const primaryTag = allTags.find(t => t.id === tagId);
            if (!primaryTag) return null;
            
            const childSubtags = selectedSubtags.filter(subtagId => {
              const subtag = allTags.find(t => t.id === subtagId);
              return subtag?.parentTagId === tagId;
            });
            
            return (
              <View key={tagId} style={styles.primaryTagGroup}>
                <TagBadge
                  tag={primaryTag}
                  selected={true}
                  onPress={() => setSelectedPrimaryTags(prev => prev.filter(id => id !== tagId))}
                  size="small"
                />
                {childSubtags.length > 0 && (
                  <View style={styles.subtagsContainer}>
                    {childSubtags.map(subtagId => {
                      const subtag = allTags.find(t => t.id === subtagId);
                      if (!subtag) return null;
                      return (
                        <TagBadge
                          key={subtagId}
                          tag={subtag}
                          selected={true}
                          onPress={() => setSelectedSubtags(prev => prev.filter(id => id !== subtagId))}
                          size="small"
                        />
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
          
          {/* Show optional tags as primary */}
          {selectedOptionalTags.map(tagId => {
            const tag = allTags.find(t => t.id === tagId);
            if (!tag) return null;
            return (
              <TagBadge
                key={tagId}
                tag={tag}
                selected={true}
                onPress={() => setSelectedOptionalTags(prev => prev.filter(id => id !== tagId))}
                size="small"
              />
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.modal,
        {
          width: width * 0.7,
          height: height - 100,
          transform: [{ translateX }],
        },
      ]}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Search by Name</Text>
        <TextInput
          placeholder="Search by name, business, or address"
          placeholderTextColor={COLORS.lightGrey}
          style={styles.input}
          value={nameQuery}
          onChangeText={setNameQuery}
        />

        <Text style={styles.sectionLabel}>Main Services</Text>
        <TagSelector
          selectedTags={selectedPrimaryTags}
          onTagsChange={setSelectedPrimaryTags}
          tagType={TagType.PRIMARY}
          maxSelections={5}
          showCount={true}
          showSelected={false}
        />

        {selectedPrimaryTags.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Specific Services</Text>
            <TagSelector
              selectedTags={selectedSubtags}
              onTagsChange={setSelectedSubtags}
              tagType={TagType.SUBTAG}
              maxSelections={10}
              showCount={true}
              parentTagIds={selectedPrimaryTags}
              showSelected={false}
            />
          </>
        )}

        <TouchableOpacity
          style={styles.moreFiltersButton}
          onPress={toggleMoreFilters}
        >
          <Text style={styles.moreFiltersText}>
            {showMoreFilters ? 'Hide' : 'Show'} More Filters
          </Text>
        </TouchableOpacity>

        {showMoreFilters && (
          <View style={styles.moreFiltersContainer}>
            <Text style={styles.sectionLabel}>Additional Options</Text>
            <TagSelector
              selectedTags={selectedOptionalTags}
              onTagsChange={setSelectedOptionalTags}
              tagType={TagType.OPTIONAL}
              maxSelections={8}
              showCount={true}
              showSelected={false}
            />
          </View>
        )}

        <Text style={styles.sectionLabel}>Within</Text>
        <View style={styles.milesRow}>
          <TextInput
            placeholder="10"
            placeholderTextColor={COLORS.lightGrey}
            keyboardType="numeric"
            value={maxDistance}
            onChangeText={setMaxDistance}
            style={[styles.input, { flex: 1, marginRight: 8 }]}
          />
          <Text style={styles.milesLabel}>mi</Text>
        </View>

        <Text style={styles.sectionLabel}>From</Text>
        <View style={styles.fromOptions}>
          <TouchableOpacity
            style={[
              styles.toggleBox,
              !useCustomZip && styles.toggleBoxActive,
            ]}
            onPress={() => setUseCustomZip(false)}
          >
            <Text style={styles.toggleText}>Me</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBox,
              useCustomZip && styles.toggleBoxActive,
            ]}
            onPress={() => setUseCustomZip(true)}
          >
            <Text style={styles.toggleText}>ZIP</Text>
          </TouchableOpacity>
        </View>

        {useCustomZip && (
          <TextInput
            placeholder="Enter ZIP code"
            placeholderTextColor={COLORS.lightGrey}
            keyboardType="numeric"
            value={customZip}
            onChangeText={setCustomZip}
            style={styles.input}
          />
        )}

        {renderSelectedTags()}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modal: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  content: {
    paddingTop: 40,
    paddingBottom: 120,
  },
  sectionLabel: {
    fontFamily: BAUHAUS_STACK,
    fontSize: 20,
    color: COLORS.stylaBrown,
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(75, 19, 40, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    color: COLORS.stylaBrown,
    marginBottom: 12,
    fontFamily: BAUHAUS_STACK,
    borderWidth: 1,
    borderColor: 'rgba(75, 19, 40, 0.16)',
  },
  button: {
    backgroundColor: COLORS.stylaOrange,
    padding: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
    shadowColor: COLORS.stylaBrown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: BAUHAUS_STACK,
  },
  fromOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  toggleBox: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(75, 19, 40, 0.06)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(75, 19, 40, 0.16)',
  },
  toggleBoxActive: {
    backgroundColor: COLORS.stylaOrange,
    borderColor: COLORS.stylaOrange,
  },
  toggleText: {
    fontFamily: BAUHAUS_STACK,
    color: COLORS.stylaBrown,
    fontSize: 14,
  },
  milesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  milesLabel: {
    fontFamily: BAUHAUS_STACK,
    fontSize: 16,
    color: COLORS.stylaBrown,
    marginLeft: 8,
  },
  moreFiltersButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(75, 19, 40, 0.05)',
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(75, 19, 40, 0.12)',
  },
  moreFiltersText: {
    fontFamily: BAUHAUS_STACK,
    fontSize: 14,
    color: COLORS.stylaBrown,
    textAlign: 'center',
    fontWeight: '600',
  },
  moreFiltersContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(75, 19, 40, 0.1)',
  },
  selectedSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(75, 19, 40, 0.1)',
  },
  selectedTitle: {
    fontFamily: BAUHAUS_STACK,
    fontSize: 16,
    color: COLORS.stylaBrown,
    marginBottom: 12,
    fontWeight: '600',
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  primaryTagGroup: {
    marginBottom: 8,
  },
  subtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginLeft: 16,
    marginTop: 4,
  },
});

export default SearchModal;