import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, Alert, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    useFonts,
    PlayfairDisplay_400Regular,
  } from '@expo-google-fonts/playfair-display';
import { OwnerAccount } from '../auth/UserData';
import { resolveProfileImage } from '../utils/image';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';
import { OwnerSettingsDatabase, OwnerSettings } from '../services/databaseService';
import { OwnerWithTags } from '../services/ownerService';
import Modal from 'react-native-modal';

interface OwnerProfileScreenProps {
  owner: OwnerAccount;
  onBack: () => void;
  onSelectFav: (favId: number) => void;
  onFocusOnMap?: (owner: OwnerAccount) => void;
}

const OwnerProfileScreen: React.FC<OwnerProfileScreenProps> = ({ owner, onBack, onSelectFav, onFocusOnMap }) => {
    const [fontsLoaded] = useFonts({
        PlayfairDisplay: PlayfairDisplay_400Regular,
      });
  const [favProfiles, setFavProfiles] = useState<OwnerWithTags[]>([]);
  const [ownerSettings, setOwnerSettings] = useState<OwnerSettings | null>(null);
  const { user } = useAuth();
  const [showBioModal, setShowBioModal] = useState(false);

  const profileCustomization = ownerSettings?.profileCustomization;
  const profileBackground = profileCustomization?.profileBackground || owner.profileBackground;
  const isGradient = Array.isArray(profileBackground);
  const textColor = '#000';
  const fontFamily = undefined;
  const profilePic = profileCustomization?.profilePic || owner.profilePic;
  const galleryImages = profileCustomization?.galleryImages || owner.galleryImages;
  const socialLinks = profileCustomization?.socialLinks || owner.socialLinks;
  const bannerImage = (profileCustomization as any)?.bannerImage || galleryImages?.[0] || 'default.png';
  
  const themedText = (style: any) => [
    style,
    { color: textColor, fontFamily },
  ];

  // Derive a color for the stylist (profile ring, etc.). Uses markerColor or explicit primaryServiceColor.
  const primaryServiceColor = useMemo(() => {
    const explicit = (profileCustomization as any)?.primaryServiceColor as string | undefined;
    if (explicit) return explicit;
    return (profileCustomization?.markerColor || owner.markerColor) || '#cccccc';
  }, [profileCustomization, owner.markerColor]);

  useEffect(() => {
    const loadOwnerSettings = async () => {
      try {
        const settings = await OwnerSettingsDatabase.getById(owner.id.toString());
        setOwnerSettings(settings);
      } catch (error) {
        console.error('Failed to load owner settings:', error);
      }
    };

    loadOwnerSettings();
  }, [owner.id]);

  useEffect(() => {
    if (!ownerSettings) return;
    
    const fetchFavs = async () => {
      try {
        const favsToLoad = ownerSettings.favs || [];
        
        if (favsToLoad.length === 0) {
          setFavProfiles([]);
          return;
        }

        const { OwnerService } = await import('../services/ownerService');
        const allOwners = await OwnerService.getAllOwnersWithTags();
        

        const favOwners = allOwners.filter(owner => 
          favsToLoad.includes(parseInt(owner.id))
        );
        
        setFavProfiles(favOwners);
        console.log(`Loaded ${favOwners.length} favs from database`);
      } catch (error) {
        console.error('Failed to load favs:', error);
        setFavProfiles([]);
      }
    };

    fetchFavs();
  }, [ownerSettings?.favs]);

  const handleLocationPress = () => {
    if (onFocusOnMap) {
      onFocusOnMap(owner);
      onBack();
    }
  };

  const handleSharePress = async () => {
    try {
      const url = socialLinks?.website?.url || socialLinks?.instagram?.url || socialLinks?.tiktok?.url;
      await Share.share({
        message: url ? `Check out ${owner.firstName} ${owner.lastName} on Styla: ${url}` : `Check out ${owner.firstName} ${owner.lastName} on Styla`,
      });
    } catch (e) {
      console.error('Share failed', e);
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const formatUrl = (url: string, platform: string): string => {
    if (!url) return '';
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    switch (platform) {
      case 'instagram':
        if (url.startsWith('instagram.com') || url.startsWith('www.instagram.com')) {
          return `https://${url}`;
        }
        if (url.startsWith('@')) {
          return `https://instagram.com/${url.substring(1)}`;
        }
        return `https://instagram.com/${url}`;
      case 'tiktok':
        if (url.startsWith('tiktok.com') || url.startsWith('www.tiktok.com')) {
          return `https://${url}`;
        }
        if (url.startsWith('@')) {
          return `https://tiktok.com/${url}`;
        }
        return `https://tiktok.com/@${url}`;
      case 'website':
      default:
        return `https://${url}`;
    }
  };

  const handleSocialLinkPress = async (platform: 'instagram' | 'tiktok' | 'website', url?: string) => {
    if (!url) {
      Alert.alert('Error', 'No link available for this social media platform.');
      return;
    }

    try {
      const formattedUrl = formatUrl(url, platform);
      
      if (!isValidUrl(formattedUrl)) {
        Alert.alert('Invalid Link', 'The social media link appears to be invalid.');
        return;
      }

      const canOpen = await Linking.canOpenURL(formattedUrl);
      
      if (!canOpen) {
        Alert.alert(
          'Cannot Open Link', 
          `Unable to open ${platform} link. Please make sure you have the app installed or a web browser available.`
        );
        return;
      }

      await Linking.openURL(formattedUrl);
      
    } catch (error) {
      console.error(`Failed to open ${platform} link:`, error);
      Alert.alert(
        'Error Opening Link',
        `There was an error opening the ${platform} link. Please try again later.`
      );
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.outerContainer}>
      {/* Top banner background image */}
      <View style={styles.bannerWrapper}>
        {resolveProfileImage(bannerImage) ? (
          <Image source={resolveProfileImage(bannerImage)!} style={styles.bannerImage} />
        ) : (
          <View style={[styles.bannerImage, { backgroundColor: '#E0E0E0' }]} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header profile cluster (avatar only above the card) */}
        <View style={styles.headerSection}>
          <View style={[styles.profilePicWrapper, { borderColor: primaryServiceColor }]}>
            {resolveProfileImage(profilePic) ? (
              <Image source={resolveProfileImage(profilePic)!} style={styles.profilePic} />
            ) : (
              <View style={[styles.profilePic, { backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="person" size={48} color="#B0B0B0" />
              </View>
            )}
          </View>
        </View>

        {/* White content card that rises up behind the avatar */}
        <View style={styles.contentCard}>
          <Text style={themedText(styles.stylistName)}>{owner.firstName} {owner.lastName}</Text>
          <Text style={themedText(styles.businessName)}>@{ownerSettings?.businessProfile?.businessName || owner.businessName}</Text>
          <Text style={themedText(styles.subheadline)} numberOfLines={2}>
            {/* Placeholder bio line, can be replaced by ownerSettings later */}
            Expert stylist located in {ownerSettings?.businessProfile?.businessAddress || owner.businessAddress}
          </Text>

          {/* Rounded pills for bio and map */}
          <View style={styles.pillRow}>
            <TouchableOpacity style={[styles.pill, styles.pillWide]} onPress={() => setShowBioModal(true)}>
              <Text style={styles.pillText} numberOfLines={1} ellipsizeMode="tail">Full bio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pill, styles.pillWide]} onPress={handleLocationPress}>
              <Ionicons name="location-outline" size={16} color="#6D5470" />
              <Text style={styles.pillText} numberOfLines={1} ellipsizeMode="tail">Map</Text>
            </TouchableOpacity>
          </View>

          {/* Favorite */}
          <View style={styles.primaryActions}>
            <TouchableOpacity style={[styles.ctaSecondary]}>
              <Text style={styles.ctaSecondaryText}>Favorite</Text>
            </TouchableOpacity>
          </View>

          {/* Top 5 Stylas - always show, placeholders if empty */}
          <View style={styles.topStylasSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={themedText(styles.sectionHeader)}>My Top 5 Stylas</Text>
              <Ionicons name="help-circle-outline" size={16} color="#8B8B8B" />
            </View>
            <View style={styles.topStylasRow}>
              {(favProfiles.length > 0 ? favProfiles.slice(0, 5) : new Array(5).fill(null)).map((fav, idx) => {
                const numericId = fav ? parseInt((fav as any).id) : NaN;
                const selectable = fav ? !Number.isNaN(numericId) : false;
                const imageSrc = fav ? resolveProfileImage((fav as any).profileCustomization?.profilePic) : null;
                const label = fav ? (fav as any).businessProfile?.firstName || 'Styla' : 'Styla';
                return (
                  <TouchableOpacity
                    key={`fav-${fav ? (fav as any).id : `placeholder-${idx}`}`}
                    onPress={() => selectable && onSelectFav(numericId)}
                    style={styles.topStylaItem}
                    disabled={!selectable}
                  >
                    <View style={styles.topStylaAvatarRing}>
                      {imageSrc ? (
                        <Image source={imageSrc} style={styles.topStylaAvatar} />
                      ) : fav ? (
                        <View style={styles.topStylaAvatarPlaceholder}>
                          <Ionicons name="person" size={28} color="#BDBDBD" />
                        </View>
                      ) : (
                        <View style={styles.topStylaAvatarPlaceholder}>
                          <Ionicons name="add" size={28} color="#BDBDBD" />
                        </View>
                      )}
                    </View>
                    <Text style={styles.topStylaLabel} numberOfLines={1}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Social buttons stack (no phone) */}
          <View style={styles.socialButtonsStack}>
            {socialLinks?.tiktok?.enabled && (
              <TouchableOpacity style={[styles.socialSquareStack, styles.tiktok]} onPress={() => handleSocialLinkPress('tiktok', socialLinks.tiktok?.url)}>
                <FontAwesome5 name="tiktok" size={20} color="#222" />
              </TouchableOpacity>
            )}
            {socialLinks?.instagram?.enabled && (
              <TouchableOpacity style={[styles.socialSquareStack, styles.instagram]} onPress={() => handleSocialLinkPress('instagram', socialLinks.instagram?.url)}>
                <Ionicons name="logo-instagram" size={20} color="#222" />
              </TouchableOpacity>
            )}
            {socialLinks?.website?.enabled && (
              <TouchableOpacity style={[styles.socialSquareStack, styles.link]} onPress={() => handleSocialLinkPress('website', socialLinks.website?.url)}>
                <Ionicons name="link" size={20} color="#222" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.socialSquareStack, styles.share]} onPress={handleSharePress}>
              <Ionicons name="share-social-outline" size={20} color="#222" />
            </TouchableOpacity>
          </View>

          {/* Full service menu placeholder */}
          <TouchableOpacity style={styles.menuPlaceholder} activeOpacity={0.8}>
            <Text style={styles.menuPlaceholderText}>full service menu</Text>
            <Ionicons name="arrow-forward" size={16} color="#b49a86" />
          </TouchableOpacity>

          {/* Socials gallery placeholder */}
          <View style={styles.galleryPlaceholder}>
            <Text style={styles.galleryTitle}>lets get social</Text>
            <View style={styles.galleryPlaceholderRow}>
              <View style={styles.galleryBox} />
              <View style={styles.galleryBox} />
            </View>
          </View>
          <View style={{ height: 200 }} />
        </View>
      </ScrollView>

      {/* Full Bio Modal */}
      <Modal
        isVisible={showBioModal}
        onBackdropPress={() => setShowBioModal(false)}
        onBackButtonPress={() => setShowBioModal(false)}
        useNativeDriver
      >
        <View style={styles.centerModal}>
          <Text style={styles.centerModalTitle}>About {owner.firstName}</Text>
          <Text style={styles.centerModalBody}>
            {/* Placeholder content, can be replaced with real bio later */}
            {ownerSettings?.businessProfile?.businessName || owner.businessName} is an expert stylist located at {ownerSettings?.businessProfile?.businessAddress || owner.businessAddress}.
          </Text>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: 'relative',
  },
  bannerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    overflow: 'hidden',
    borderTopLeftRadius: 16,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  container: {
    paddingTop: 140,
    paddingHorizontal: 0,
    paddingBottom: 360,
    flexGrow: 1,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePicWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -80,
    marginBottom: 10,
    zIndex: 2,
  },
  profilePic: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  contentCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -70,
    paddingTop: 44,
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignSelf: 'stretch',
    zIndex: 1,
  },
  stylistName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  businessName: {
    fontWeight: 'bold',
    color: '#777',
    marginTop: 2,
  },
  subheadline: {
    fontSize: 14,
    color: '#8B8B8B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },

  pillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
    gap: 8,
    flexWrap: 'nowrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#E9DAD7',
  },
  pillWide: {
    flex: 1,
    height: 46,
  },
  pillText: {
    color: '#6D5470',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },

  primaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  ctaSecondary: {
    backgroundColor: '#F2A78A',
    paddingVertical: 14,
    borderRadius: 26,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  ctaSecondaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  ctaPrimary: {
    paddingVertical: 14,
    borderRadius: 26,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  ctaPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },

  topStylasSection: {
    marginBottom: 16,
  },
  topStylasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  topStylaItem: {
    alignItems: 'center',
    width: '18%',
  },
  topStylaAvatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#d8cfe0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  topStylaAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  topStylaAvatarPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topStylaLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#8B8B8B',
  },

  socialButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  socialSquare: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiktok: { backgroundColor: '#EFD6F5' },
  instagram: { backgroundColor: '#D9CCFF' },
  link: { backgroundColor: '#C6B09B' },
  share: { backgroundColor: '#F2A78A' },

  socialButtonsStack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    alignSelf: 'center',
  },
  socialSquareStack: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  servicesHorizontal: {
    paddingVertical: 12,
    paddingLeft: 20,
    paddingRight: 84,
    gap: 12,
  },
  serviceHCard: {
    width: 228,
    marginRight: 16,
    backgroundColor: '#ECE2DD',
    borderRadius: 16,
    padding: 16,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#453A43',
  },
  serviceSubtitle: {
    fontSize: 12,
    color: '#7C6F77',
    marginTop: 4,
  },
  servicePrice: {
    fontSize: 14,
    color: '#9B7E60',
    marginTop: 2,
  },
  serviceBookBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  serviceBookText: {
    color: '#fff',
    fontWeight: '600',
  },

  menuPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 6,
    marginBottom: 14,
  },
  menuPlaceholderText: {
    color: '#b49a86',
    fontWeight: '600',
    textTransform: 'lowercase',
  },

  galleryPlaceholder: {
    marginBottom: 24,
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  galleryPlaceholderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  galleryBox: {
    backgroundColor: '#ECECEC',
    height: 160,
    borderRadius: 12,
    flex: 1,
  },

  centerModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  centerModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  centerModalBody: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default OwnerProfileScreen;
