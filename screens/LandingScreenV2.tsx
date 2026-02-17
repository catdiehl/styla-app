import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, FlatList } from 'react-native';
import MapView from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';
import { OwnerAccount } from '../auth/UserData';
import { resolveProfileImage } from '../utils/image';
import FeedPreviewCard from '../components/FeedPreviewCard';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

const { width } = Dimensions.get('window');

const COLORS = {
  darkNavy: '#001B2E',
  slateBlue: '#294C60',
  lightGrey: '#ADB6C4',
  cream: '#FFEFD3',
  white: '#FFFFFF',
  text: '#111111',
  lightText: '#8F9AA3',
  divider: '#EDEEF0',
};

const STYLA_ORANGE = '#F65802';
const STYLA_YELLOW = '#E3FF6B';
const STYLA_BROWN = '#4B1328';

const NAVBAR_PAD = 120;
const FOOTER_EXTRA = 48;

type LandingScreenProps = {
  onNavigateToMap: () => void;
  onNavigateToFeed: (postId?: string) => void;
};

const BAUHAUS_STACK = 'Bauhaus 93';

const LandingScreenV2: React.FC<LandingScreenProps> = ({ onNavigateToMap, onNavigateToFeed }) => {
  const { user } = useAuth();
  const region = useCurrentLocation();

  const favoriteOwners: OwnerAccount[] = useMemo(() => [], []);

  const previewPosts = useMemo(
    () => [
      {
        id: '1',
        firstName: 'Maren',
        lastName: 'Mahlman',
        handle: '@marenstyla',
        description:
          'Here is a fall hairstyle that is timeless and easy to do on lazy, overcast mornings! Book today!',
      },
      {
        id: '2',
        firstName: 'Cayla',
        lastName: 'Baxley',
        handle: '@bycaylaa',
        description: 'Soft glam with a focus on natural texture.',
      },
      {
        id: '3',
        firstName: 'Julia',
        lastName: 'Magnone',
        handle: '@juliadoeshair',
        description: 'Luxury hair artist specializing in color and hair extensions.',
      },
    ],
    []
  );
  const [showContinue, setShowContinue] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerWelcome}>Welcome to</Text>
        <Text style={styles.headerBrand}>STYLA</Text>
        {!!user && (
          <Text style={styles.headerHi}>Hi {(user.displayName || user.email || 'stylauser').split('@')[0].split(' ')[0]}</Text>
        )}
      </View>

      {/* Map preview banner with button (keep current minimap design) */}
      <View style={styles.mapSection}>
        {region && (
          <TouchableOpacity style={styles.mapContainer} onPress={onNavigateToMap}>
            <MapView
              style={styles.mapPreview}
              region={region}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            />
            <View style={styles.mapOverlay}>
              <Ionicons name="map" size={24} color="#FFFFFF" />
              <Text style={styles.mapButtonText}>Map</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Top 5 minimalist row */}
      <View style={styles.top5Section}>
        <Text style={styles.sectionTitle}>My Top 5</Text>
        <View style={styles.top5Row}>
          {Array.from({ length: 5 }).map((_, idx) => {
            const owner = favoriteOwners[idx];
            if (owner) {
              const img = resolveProfileImage(owner.profilePic);
              return (
                <View key={`fav-${idx}`} style={styles.avatarWrap}>
                  <View style={styles.avatarCircle}>
                    {img ? (
                      <Image source={img} style={styles.avatarImg} />
                    ) : (
                      <Ionicons name="person" size={24} color="#B0B0B0" />
                    )}
                  </View>
                  <Text style={styles.avatarName}>{owner.firstName}</Text>
                </View>
              );
            }
            return (
              <View key={`ph-${idx}`} style={styles.avatarWrap}>
                <View style={styles.avatarCirclePlaceholder}>
                  <Ionicons name="add" size={24} color={COLORS.lightGrey} />
                </View>
                <Text style={styles.avatarName}>Styla</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Feed preview — occupies remaining space at bottom, up to 3 posts */}
      <View style={styles.feedPreviewSection}>
        <Text style={styles.sectionTitle}>Nearby Stylas Feed</Text>
        <View style={{ flex: 1 }}>
          <FlatList
            data={previewPosts}
            keyExtractor={(p) => p.id}
            renderItem={({ item }) => (
              <View style={{ paddingHorizontal: 2, marginBottom: 10 }}>
                <FeedPreviewCard post={item as any} onPress={() => onNavigateToFeed(item.id)} />
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 0 }}
            ListFooterComponent={
              <View style={styles.footerPad}>
                <TouchableOpacity style={styles.continueBtn} onPress={() => onNavigateToFeed()}>
                  <Text style={styles.continueBtnText}>Continue Feed</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </View>
    </View>
  );
};

const AVATAR_SIZE = 64;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerWelcome: {
    fontSize: 16,
    color: COLORS.lightText,
  },
  headerBrand: {
    marginTop: 2,
    fontSize: 40,
    color: COLORS.text,
    letterSpacing: 2,
    fontFamily: BAUHAUS_STACK,
  },
  headerHi: {
    marginTop: 6,
    fontSize: 18,
    color: COLORS.lightText,
    fontFamily: 'Trebuchet MS',
  },
  top5Section: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  top5Row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  avatarWrap: {
    width: (width - 40 - 4 * 10) / 5,
    alignItems: 'center',
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.divider,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCirclePlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    resizeMode: 'cover',
  },
  avatarName: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.lightText,
  },
  feedPreviewSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 0,
  },
  mapSection: {
    height: 120,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  mapPreview: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: STYLA_ORANGE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: STYLA_ORANGE,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  footerPad: {
    height: NAVBAR_PAD + FOOTER_EXTRA,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 12,
  },
  continueBtn: {
    backgroundColor: STYLA_YELLOW,
    borderWidth: 1,
    borderColor: STYLA_BROWN,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  continueBtnText: {
    color: STYLA_BROWN,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default LandingScreenV2;


