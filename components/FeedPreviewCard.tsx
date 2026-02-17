import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#FFFFFF',
  text: '#111111',
  lightText: '#8F9AA3',
  divider: '#EDEEF0',
  mediaGrey: '#D1D5DB',
  accent: '#111111',
};

type Post = {
  firstName: string;
  lastName: string;
  handle: string;
  description: string;
};

type FeedPreviewCardProps = {
  post: Post;
  onPress: () => void;
};

const FeedPreviewCard: React.FC<FeedPreviewCardProps> = ({ post, onPress }) => {

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.nameText}>{post.firstName} {post.lastName}</Text>
        <Text style={styles.handleText}>{post.handle}</Text>
      </View>

      {/* Media placeholder */}
      <View style={styles.mediaBox} />

    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 8,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  handleText: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.lightText,
  },
  mediaBox: {
    height: 120,
    backgroundColor: COLORS.mediaGrey,
    borderRadius: 8,
  },
});

export default FeedPreviewCard;
