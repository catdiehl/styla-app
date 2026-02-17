import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import TagBadge from './TagBadge';
import { Tag, TagType, TagCategory } from '../types/tags';
import { TagDatabase } from '../services/tagService';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
  tagType?: TagType;
  category?: TagCategory;
  placeholder?: string;
  maxSelections?: number;
  showCount?: boolean;
  parentTagIds?: string[];
  showSelected?: boolean;
  allowedTagIds?: string[];
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  tagType,
  category,
  maxSelections,
  showCount = false,
  parentTagIds = [],
  showSelected = true,
  allowedTagIds,
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (tagType === TagType.PRIMARY) {
      if (hasLoadedRef.current) {
        return;
      }
      loadTags().then(() => {
        hasLoadedRef.current = true;
      });
      return;
    }
    loadTags();
  }, [tagType, category, parentTagIds]);

  const loadTags = async () => {
    try {
      setLoading(true);
      let loadedTags: Tag[] = [];

      if (tagType === TagType.SUBTAG && parentTagIds.length > 0) {
        const allSubtags: Tag[] = [];
        for (const parentTagId of parentTagIds) {
          const subtags = await TagDatabase.getSubtagsForPrimary(parentTagId);
          allSubtags.push(...subtags);
        }
        loadedTags = allSubtags;
      } else if (tagType === TagType.SUBTAG && parentTagIds.length === 0) {
        setTags([]);
        setLoading(false);
        return;
      } else if (tagType) {
        loadedTags = await TagDatabase.getCachedTags(tagType);
      } else if (category) {
        loadedTags = await TagDatabase.getByCategory(category);
      } else {
        loadedTags = await TagDatabase.getAll();
      }

      if (allowedTagIds && allowedTagIds.length > 0) {
        loadedTags = loadedTags.filter(tag => allowedTagIds.includes(tag.id));
      }

      setTags(loadedTags);
    } catch (error) {
      console.error('Failed to load tags:', error);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTagPress = (tagId: string) => {
    const isSelected = selectedTags.includes(tagId);
    
    if (isSelected) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      if (maxSelections && selectedTags.length >= maxSelections) {
        const newTags = [...selectedTags.slice(1), tagId];
        onTagsChange(newTags);
      } else {
        onTagsChange([...selectedTags, tagId]);
      }
    }
  };

  const isTagSelected = (tagId: string) => selectedTags.includes(tagId);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading tags...</Text>
      </View>
    );
  }

  if (tags.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>
          {tagType === TagType.SUBTAG && parentTagIds.length === 0 
            ? 'Select a main service first' 
            : 'No tags available'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.tagList} showsVerticalScrollIndicator={false}>
        <View style={styles.tagGrid}>
          {tags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              selected={isTagSelected(tag.id)}
              onPress={() => handleTagPress(tag.id)}
              size="medium"
              showCount={showCount}
              count={tag.usageCount}
            />
          ))}
        </View>
      </ScrollView>

      {showSelected && selectedTags.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedTitle}>Selected:</Text>
          <View style={styles.selectedTags}>
            {selectedTags.map((tagId) => {
              const tag = tags.find(t => t.id === tagId);
              return tag ? (
                <TagBadge
                  key={tagId}
                  tag={tag}
                  selected={true}
                  onPress={() => handleTagPress(tagId)}
                  size="small"
                />
              ) : null;
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  tagList: {
    flex: 1,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  selectedContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});

export default TagSelector; 