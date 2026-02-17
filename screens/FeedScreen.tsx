import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');

const NAVBAR_HEIGHT = 100;
const TOP_SPACER = 52;
const BUTTON_ROW_HEIGHT = 42;
const DESCRIPTION_HEIGHT = 42;
const DEFAULT_MODE_BAR_HEIGHT = TOP_SPACER + BUTTON_ROW_HEIGHT + DESCRIPTION_HEIGHT;
const EXTRA_CONTENT_TOP_GAP = 8;

type FeedCard = {
  id: string;
  firstName: string;
  lastName: string;
  handle: string;
  description: string;
};

const EXAMPLE_POSTS: FeedCard[] = [
  {
    id: '1',
    firstName: 'Maren',
    lastName: 'Mahlman',
    handle: '@marenstyla',
    description:
      'Here is a fall hairstyle that is timeless and easy to do on lazy, overcast mornings! Reach out today!',
  },
  {
    id: '2',
    firstName: 'Cayla',
    lastName: 'Baxley',
    handle: '@bycaylaa',
    description:
      'Soft glam with a focus on natural texture.',
  },
  {
    id: '3',
    firstName: 'Julia',
    lastName: 'Magnone',
    handle: '@juliadoeshair',
    description:
      'Luxury hair artist specializing in color and hair extensions.',
  },
];

const COLORS = {
  background: '#FFFFFF',
  text: '#111111',
  lightText: '#8F9AA3',
  divider: '#EDEEF0',
  mediaGrey: '#D1D5DB',
  accent: '#111111',
  selectedBg: '#F5F7FA',
};

interface FeedScreenProps {
  selectedPostId?: string;
}

const FeedScreen: React.FC<FeedScreenProps> = ({ selectedPostId }) => {
  const data = useMemo(() => EXAMPLE_POSTS, []);
  const [mode, setMode] = useState<'local' | 'mutuals' | 'stars' | 'rising' | 'recent'>('local');
  const [modeBarHeight, setModeBarHeight] = useState<number>(DEFAULT_MODE_BAR_HEIGHT);
  const cardHeight = Math.max(300, height - NAVBAR_HEIGHT - modeBarHeight - EXTRA_CONTENT_TOP_GAP);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (selectedPostId && flatListRef.current) {
      const postIndex = data.findIndex(post => post.id === selectedPostId);
      if (postIndex !== -1) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ 
            index: postIndex, 
            animated: true 
          });
        }, 100);
      }
    }
  }, [selectedPostId, data]);

  const MODE_META: Record<typeof mode, { label: string; description: string } & ({ icon: keyof typeof Ionicons.glyphMap } | { custom: true })> = {
    local: {
      label: 'Local',
      description: 'Shows professionals in your area, prioritizing smaller creators.',
      icon: 'location-outline',
    },
    mutuals: {
      label: 'Mutuals',
      description: 'Creators in your network. Following grows your mutuals.',
      custom: true,
    },
    stars: {
      label: 'Stars',
      description: "Inspiration from Styla's premier names. Ignores location.",
      icon: 'star-outline',
    },
    rising: {
      label: 'Rising',
      description: 'Up‑and‑coming stylists gaining traction. Follow before the hype!',
      icon: 'flame-outline',
    },
    recent: {
      label: 'Recent',
      description: 'Be first to discover new content. Location matters slightly.',
      icon: 'time-outline',
    },
  } as const;

  const renderItem = ({ item }: { item: FeedCard }) => {
    return (
      <View style={[styles.card, { height: cardHeight }]}>        
        {/* Top header */}
        <View style={styles.headerBox}>
          <View style={{ flex: 1 }} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.nameText}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.handleText}>{item.handle}</Text>
          </View>
        </View>

        {/* Media placeholder */}
        <View style={styles.mediaBox} />

        {/* Bottom description */}
        <View style={styles.footerBox}>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Fixed mode bar (does not scroll) */}
      <View style={styles.modeBarWrapper} onLayout={(e) => setModeBarHeight(e.nativeEvent.layout.height)}>
        {/* Buttons row — all visible, non-scrolling */}
        <View style={styles.modeButtonsRow}>
          <ModeButton
            selected={mode === 'local'}
            onPress={() => setMode('local')}
            renderIcon={(color) => (
              <Ionicons name="location-outline" size={20} color={color} />
            )}
          />
          <ModeButton
            selected={mode === 'mutuals'}
            onPress={() => setMode('mutuals')}
            renderIcon={(color) => (
              <View style={{ width: 22, height: 20 }}>
                <Ionicons name="heart-outline" size={16} color={color} style={{ position: 'absolute', left: 0, top: 2 }} />
                <Ionicons name="heart-outline" size={16} color={color} style={{ position: 'absolute', right: 0, top: 2 }} />
              </View>
            )}
          />
          <ModeButton
            selected={mode === 'stars'}
            onPress={() => setMode('stars')}
            renderIcon={(color) => (
              <Ionicons name="star-outline" size={20} color={color} />
            )}
          />
          <ModeButton
            selected={mode === 'rising'}
            onPress={() => setMode('rising')}
            renderIcon={(color) => (
              <Ionicons name="bonfire-outline" size={20} color={color} />
            )}
          />
          <ModeButton
            selected={mode === 'recent'}
            onPress={() => setMode('recent')}
            renderIcon={(color) => (
              <Ionicons name="time-outline" size={20} color={color} />
            )}
          />
        </View>
        {/* Description below the buttons */}
        <View style={styles.modeDescription}>
          <Text style={styles.modeDescriptionTitle}>{MODE_META[mode].label}</Text>
          <Text style={styles.modeDescriptionText}>{MODE_META[mode].description}</Text>
        </View>
      </View>

       <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
         snapToInterval={cardHeight}
        decelerationRate="fast"
        snapToAlignment="start"
        pagingEnabled
        disableIntervalMomentum
         contentContainerStyle={{ paddingTop: modeBarHeight + EXTRA_CONTENT_TOP_GAP, paddingBottom: 12 }}
        style={{ marginTop: 0 }}
         getItemLayout={(_, index) => ({ length: cardHeight, offset: cardHeight * index, index })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modeBarWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingTop: TOP_SPACER,
  },
  modeButtonsRow: {
    height: BUTTON_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  modeDescription: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    justifyContent: 'center',
  },
  modeDescriptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'left',
  },
  modeDescriptionText: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  card: {
    width,
    backgroundColor: COLORS.background,
  },
  headerBox: {
    minHeight: 42,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerTextContainer: {
    alignItems: 'flex-end',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  handleText: {
    marginTop: 2,
    fontSize: 14,
    color: COLORS.lightText,
  },
  mediaBox: {
    flex: 1,
    backgroundColor: COLORS.mediaGrey,
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 8,
  },
  footerBox: {
    minHeight: 120,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  descriptionText: {
    fontSize: 18,
    color: COLORS.text,
    lineHeight: 24,
  },
});

export default FeedScreen;

type ModeButtonProps = {
  selected: boolean;
  onPress: () => void;
  renderIcon: (color: string) => React.ReactNode;
};

const ModeButton: React.FC<ModeButtonProps> = ({ selected, onPress, renderIcon }) => {
  return (
    <View
      onStartShouldSetResponder={() => true}
      onResponderRelease={onPress as any}
      style={[modeButtonStyles.wrapper, selected && modeButtonStyles.wrapperSelected]}
    >
      {renderIcon(selected ? COLORS.accent : COLORS.lightText)}
    </View>
  );
};

const modeButtonStyles = StyleSheet.create({
  wrapper: {
    height: 44,
    flex: 1,
    minWidth: 44,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  wrapperSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.selectedBg,
  },
});


