import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OwnerAccount } from '../auth/UserData';
import { resolveProfileImage } from '../utils/image';

const { width } = Dimensions.get('window');
const card_width = Math.max(280, Math.min(width - 80, 340));
const card_spacing = 8;
const availableWidth = Math.max(0, width - 40);
const itemWidthWithMargins = card_width + (card_spacing * 2);
const listSidePadding = Math.max(0, (availableWidth - itemWidthWithMargins) / 2);

interface OwnerCardListProps {
  owners: OwnerAccount[];
  onCardChange: (owner: OwnerAccount) => void;
  onCardPress: (owner: OwnerAccount) => void;
}

const OwnerCardList: React.FC<OwnerCardListProps> = ({ owners, onCardChange, onCardPress }) => {
  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  });
  
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems && viewableItems.length > 0) {
      onCardChange(viewableItems[0].item);
    }
  });

  const renderItem = ({ item }: { item: OwnerAccount }) => {
    const markerColor = item.markerColor || '#294C60';
    return (
      <View style={[styles.card, { width: card_width }]}>
        <View style={styles.header}>
          <View style={[styles.profileImageContainer, { borderColor: markerColor }]}>
            {resolveProfileImage(item.profilePic) ? (
              <Image
                source={resolveProfileImage(item.profilePic)!}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, { backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="person" size={20} color="#B0B0B0" />
              </View>
            )}
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.businessName} numberOfLines={1} ellipsizeMode="tail">
              @{item.businessName}
            </Text>
            <Text style={styles.address} numberOfLines={2} ellipsizeMode="tail">
              {item.businessAddress}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => onCardPress(item)}
            style={styles.cardButton}
          >
            <Text style={styles.cardButtonText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={owners}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        horizontal
        snapToInterval={card_width + (card_spacing * 2)}
        snapToAlignment="center"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: listSidePadding,
          alignItems: 'center',
        }}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
      />
      <View style={styles.arrow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    marginHorizontal: card_spacing,
    backgroundColor: '#EFEFEF',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
    shadowColor: '#001B2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImageContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#EFEFEF',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  info: {
    flex: 1,
    minWidth: 0,
    maxWidth: '100%',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001B2E',
    marginBottom: 2,
    flexShrink: 1,
  },
  businessName: {
    fontSize: 14,
    color: '#294C60',
    marginBottom: 2,
    flexShrink: 1,
  },
  address: {
    fontSize: 12,
    color: '#ADB6C4',
    lineHeight: 16,
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cardButton: {
    backgroundColor: '#294C60',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cardButtonText: {
    color: '#EFEFEF',
    fontSize: 14,
    fontWeight: '600',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#EFEFEF',
    marginTop: -1,
    alignSelf: 'center',
  },
});

export default OwnerCardList;
