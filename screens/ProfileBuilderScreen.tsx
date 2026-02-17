import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  OwnerSettingsDatabase,
  OwnerSettings,
  OwnerSearchService,
} from '../services/databaseService';
import { resolveProfileImage } from '../utils/image';
import { uploadProfileImage, uploadBannerImage } from '../services/storageService';

const COLORS = {
  darkNavy: '#001B2E',
  slateBlue: '#294C60',
  lightGrey: '#ADB6C4',
  cream: '#FFEFD3',
  white: '#FFFFFF',
};

type TabKey = 'basic' | 'media' | 'social' | 'developer';

interface ProfileBuilderScreenProps {
  navigation: { goBack: () => void };
  route: { params: { ownerId: string } };
}

const PROFILE_PALETTES: { name: string; background: string | [string, string]; swatches: string[] }[] = [
  {
    name: 'Lavender Dreams',
    background: ['#C7B8FF', '#EAD9FF'] as [string, string],
    swatches: ['#BFA6FF', '#D7C6FF', '#EAD9FF', '#F2ECFF', '#A895D1', '#3A2337'],
  },
  {
    name: 'Sunset Glow',
    background: ['#FF9A8B', '#FAD0C4'] as [string, string],
    swatches: ['#FF9A8B', '#FFB3A7', '#F7C3B0', '#FFE1D6', '#B38E86', '#6B1E1C'],
  },
];


interface SocialState {
  enabled: boolean;
  stream?: boolean;
  url?: string;
}

interface BuilderForm {
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  location: string;
  businessLat: string;
  businessLong: string;
  profileColor: string | [string, string];
  profilePic: string;
  bannerImage?: string;
  favs: number[];
  social: {
    instagram: SocialState;
    tiktok: SocialState;
    website: SocialState;
  };
}

const ProfileBuilderScreen: React.FC<ProfileBuilderScreenProps> = ({ navigation, route }) => {
  const { ownerId } = route.params;
  const [tab, setTab] = useState<TabKey>('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BuilderForm>({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    location: '',
    businessLat: '',
    businessLong: '',
    profileColor: PROFILE_PALETTES[0].background,
    profilePic: '',
    bannerImage: undefined,
    favs: [],
    social: {
      instagram: { enabled: false, url: '', stream: false },
      tiktok: { enabled: false, url: '', stream: false },
      website: { enabled: false, url: '' },
    },
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OwnerSettings[]>([]);
  const [favDetails, setFavDetails] = useState<OwnerSettings[]>([]);

  const [localProfileUri, setLocalProfileUri] = useState<string | null>(null);
  const [localBannerUri, setLocalBannerUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const settings = await OwnerSettingsDatabase.getById(ownerId);
        if (!settings) {
          Alert.alert('Error', 'Owner not found');
          navigation.goBack();
          return;
        }
        setForm({
          firstName: settings.businessProfile?.firstName || '',
          lastName: settings.businessProfile?.lastName || '',
          username: settings.businessProfile?.businessName || '',
          bio: settings.businessProfile?.bio || '',
          location: settings.businessProfile?.businessAddress || '',
          businessLat: settings.businessProfile?.businessLat?.toString() || '',
          businessLong: settings.businessProfile?.businessLong?.toString() || '',
          profileColor: settings.profileCustomization?.profileBackground || PROFILE_PALETTES[0].background,
          profilePic: settings.profileCustomization?.profilePic || '',
          bannerImage: (settings.profileCustomization as any)?.bannerImage,
          favs: settings.favs || [],
          social: {
            instagram: {
              enabled: !!settings.profileCustomization?.socialLinks?.instagram?.enabled,
              url: settings.profileCustomization?.socialLinks?.instagram?.url || '',
              stream: !!settings.profileCustomization?.socialLinks?.instagram?.stream,
            },
            tiktok: {
              enabled: !!settings.profileCustomization?.socialLinks?.tiktok?.enabled,
              url: settings.profileCustomization?.socialLinks?.tiktok?.url || '',
              stream: !!settings.profileCustomization?.socialLinks?.tiktok?.stream,
            },
            website: {
              enabled: !!settings.profileCustomization?.socialLinks?.website?.enabled,
              url: settings.profileCustomization?.socialLinks?.website?.url || '',
            },
          },
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [ownerId]);

  const update = <K extends keyof BuilderForm>(key: K, value: BuilderForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateSocial = (
    platform: keyof BuilderForm['social'],
    field: keyof SocialState,
    value: boolean | string | undefined
  ) => {
    setForm(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: { ...prev.social[platform], [field]: value } as SocialState,
      },
    }));
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const res = await OwnerSearchService.searchOwners(q);
    setSearchResults(res.filter(o => o.id !== ownerId));
  };

  const addFav = (id: string) => {
    const numeric = parseInt(id);
    if (form.favs.includes(numeric) || form.favs.length >= 5) return;
    update('favs', [...form.favs, numeric]);
  };
  const removeFav = (id: number) => {
    update('favs', form.favs.filter(f => f !== id));
  };

  useEffect(() => {
    (async () => {
      try {
        if (!form.favs.length) {
          setFavDetails([]);
          return;
        }
        const all = await OwnerSettingsDatabase.getAllOwners();
        const match = all.filter(o => form.favs.includes(parseInt(o.id)));
        setFavDetails(match);
      } catch {
        setFavDetails([]);
      }
    })();
  }, [form.favs]);

  const pickImage = async (type: 'profile' | 'banner') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [16, 9],
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const uri = result.assets[0].uri;
    if (type === 'profile') {
      setLocalProfileUri(uri);
    } else {
      setLocalBannerUri(uri);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const existing = await OwnerSettingsDatabase.getById(ownerId);
      if (!existing) {
        Alert.alert('Error', 'Owner settings not found.');
        return;
      }

      let profilePicUrl = form.profilePic;
      let bannerImageUrl = form.bannerImage;

      if (localProfileUri) {
        profilePicUrl = await uploadProfileImage(ownerId, localProfileUri);
      }
      if (localBannerUri) {
        bannerImageUrl = await uploadBannerImage(ownerId, localBannerUri);
      }

      const updated: OwnerSettings = {
        ...existing,
        businessProfile: {
          ...existing.businessProfile,
          firstName: form.firstName,
          lastName: form.lastName,
          businessName: form.username,
          bio: form.bio,
          businessAddress: form.location,
          businessLat: form.businessLat ? parseFloat(form.businessLat) : existing.businessProfile?.businessLat,
          businessLong: form.businessLong ? parseFloat(form.businessLong) : existing.businessProfile?.businessLong,
        },
        profileCustomization: {
          ...existing.profileCustomization,
          profileBackground: form.profileColor,
          profilePic: profilePicUrl,
          bannerImage: bannerImageUrl,
          socialLinks: {
            instagram: {
              enabled: !!form.social.instagram.enabled,
              url: form.social.instagram.enabled ? form.social.instagram.url || '' : '',
              stream: !!form.social.instagram.stream,
            },
            tiktok: {
              enabled: !!form.social.tiktok.enabled,
              url: form.social.tiktok.enabled ? form.social.tiktok.url || '' : '',
              stream: !!form.social.tiktok.stream,
            },
            website: {
              enabled: !!form.social.website.enabled,
              url: form.social.website.enabled ? form.social.website.url || '' : '',
            },
          },
        },
        favs: form.favs,
      };
      await OwnerSettingsDatabase.createOrUpdate(updated);

      setLocalProfileUri(null);
      setLocalBannerUri(null);

      update('profilePic', profilePicUrl || '');
      update('bannerImage', bannerImageUrl);

      Alert.alert('Success', 'Profile updated successfully');
    } catch (e) {
      console.error('Failed to save profile:', e);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const renderTabs = () => (
    <View style={styles.tabs}>
      {([
        { key: 'basic', label: 'Basic Info' },
        { key: 'media', label: 'Media' },
        { key: 'social', label: 'Social' },
        { key: 'developer', label: 'Dev' },
      ] as const).map(t => (
        <TouchableOpacity
          key={t.key}
          style={[styles.tab, tab === t.key && styles.tabActive]}
          onPress={() => setTab(t.key)}
        >
          <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderBasic = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
      <Text style={styles.sectionTitle}>Profile Photo</Text>
      <View style={styles.photoRow}>
        <View style={styles.photoWrapper}>
          {localProfileUri ? (
            <Image source={{ uri: localProfileUri }} style={styles.photo} />
          ) : resolveProfileImage(form.profilePic) ? (
            <Image source={resolveProfileImage(form.profilePic)!} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person" size={36} color="#B0B0B0" />
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.pillButton}
          onPress={() => pickImage('profile')}
        >
          <Ionicons name="camera" size={16} color="#fff" />
          <Text style={styles.pillButtonText}>{form.profilePic || localProfileUri ? 'Change Photo' : 'Upload Photo'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Basic Information</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={`${form.firstName} ${form.lastName}`.trim()}
          onChangeText={text => {
            const parts = text.split(' ');
            update('firstName', parts[0] || '');
            update('lastName', parts.slice(1).join(' ') || '');
          }}
          placeholder="Full name"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={form.username}
          onChangeText={t => update('username', t.replace('@', ''))}
          placeholder="@username"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, { height: 90 }]}
          value={form.bio}
          onChangeText={t => update('bio', t)}
          placeholder="Tell clients about yourself"
          multiline
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Location (Address)</Text>
        <TextInput
          style={styles.input}
          value={form.location}
          onChangeText={t => update('location', t)}
          placeholder="123 Main St, City, ST"
        />
      </View>

      <Text style={styles.sectionTitle}>Color Palette</Text>
      <View style={styles.paletteRow}>
        {PROFILE_PALETTES.map((p) => {
          const selected =
            (Array.isArray(form.profileColor) &&
              Array.isArray(p.background) &&
              form.profileColor[0] === p.background[0] &&
              form.profileColor[1] === p.background[1]) ||
            (!Array.isArray(form.profileColor) && form.profileColor === p.background);
          return (
            <TouchableOpacity
              key={p.name}
              style={[styles.paletteCard, selected && styles.paletteCardSelected]}
              onPress={() => update('profileColor', p.background)}
            >
              {Array.isArray(p.background) ? (
                <LinearGradient colors={p.background} style={styles.palettePreview} />
              ) : (
                <View style={[styles.palettePreview, { backgroundColor: p.background }]} />
              )}
              <View style={styles.swatchRow}>
                {p.swatches.map(s => (
                  <View key={s} style={[styles.swatchDot, { backgroundColor: s }]} />
                ))}
              </View>
              <Text style={styles.paletteName}>{p.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderMedia = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
      <Text style={styles.sectionTitle}>Banner Image</Text>
      <TouchableOpacity
        style={styles.bannerUploadArea}
        onPress={() => pickImage('banner')}
        activeOpacity={0.7}
      >
        {localBannerUri ? (
          <Image source={{ uri: localBannerUri }} style={styles.bannerPreview} />
        ) : resolveProfileImage(form.bannerImage) ? (
          <Image source={resolveProfileImage(form.bannerImage)!} style={styles.bannerPreview} />
        ) : (
          <View style={styles.bannerPlaceholder}>
            <Ionicons name="image-outline" size={40} color="#B0B0B0" />
            <Text style={styles.bannerPlaceholderText}>Tap to upload banner</Text>
          </View>
        )}
        <View style={styles.bannerEditBadge}>
          <Ionicons name="pencil" size={14} color="#fff" />
        </View>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: 10 }]}>My Top 5 Stylas</Text>
      <View style={styles.searchCard}>
        <Text style={styles.cardTitle}>Search stylists</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={16} color="#666" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stylists by name…"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>
      {searchResults.length > 0 && (
        <View style={styles.resultsBox}>
          <Text style={styles.cardTitle}>Results</Text>
          {searchResults.slice(0, 10).map(o => (
            <TouchableOpacity
              key={o.id}
              style={styles.resultRow}
              disabled={form.favs.length >= 5}
              onPress={() => addFav(o.id)}
            >
              <Text style={styles.resultName}>
                {o.businessProfile?.firstName} {o.businessProfile?.lastName} @{o.businessProfile?.businessName}
              </Text>
              <Ionicons
                name={form.favs.length >= 5 ? 'close-circle-outline' : 'add-circle-outline'}
                size={22}
                color={form.favs.length >= 5 ? '#CCC' : COLORS.slateBlue}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.resultsBox}>
        <Text style={styles.cardTitle}>Your Top Stylas ({form.favs.length}/5)</Text>
        {favDetails.length === 0 ? (
          <Text style={styles.emptyText}>No stylas added yet</Text>
        ) : (
          favDetails.map(f => (
            <View key={f.id} style={styles.resultRow}>
              <Text style={styles.resultName}>
                {f.businessProfile?.firstName} {f.businessProfile?.lastName} @{f.businessProfile?.businessName}
              </Text>
              <TouchableOpacity onPress={() => removeFav(parseInt(f.id))}>
                <Ionicons name="close-circle-outline" size={22} color="#D9534F" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );

  const renderSocial = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>
      <Text style={styles.sectionTitle}>Social Media Connections</Text>

      {/* Instagram */}
      <View style={styles.socialCard}>
        <View style={styles.socialHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="logo-instagram" size={24} color="#C13584" />
            <Text style={styles.socialTitle}>Instagram</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              const enabled = !form.social.instagram.enabled;
              updateSocial('instagram', 'enabled', enabled);
              if (!enabled) {
                updateSocial('instagram', 'stream', false);
                updateSocial('instagram', 'url', '');
              }
            }}
            style={[styles.connectButton, form.social.instagram.enabled && styles.disconnectButton]}
          >
            <Text style={[styles.connectText, form.social.instagram.enabled && styles.disconnectText]}>
              {form.social.instagram.enabled ? 'Disconnect' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
        {!!form.social.instagram.enabled && (
          <>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchTitle}>Stream posts to profile</Text>
                <Text style={styles.switchSubtitle}>Show your instagram content</Text>
              </View>
              <Switch
                value={!!form.social.instagram.stream}
                onValueChange={v => updateSocial('instagram', 'stream', v)}
                trackColor={{ false: '#E0E0E0', true: '#B9B4F4' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Link</Text>
              <TextInput
                style={styles.input}
                value={form.social.instagram.url || ''}
                onChangeText={t => updateSocial('instagram', 'url', t)}
                placeholder="@yourhandle or URL"
                autoCapitalize="none"
              />
            </View>
          </>
        )}
      </View>

      {/* TikTok */}
      <View style={styles.socialCard}>
        <View style={styles.socialHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FontAwesome5 name="tiktok" size={20} color="#111" />
            <Text style={styles.socialTitle}>Tiktok</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              const enabled = !form.social.tiktok.enabled;
              updateSocial('tiktok', 'enabled', enabled);
              if (!enabled) {
                updateSocial('tiktok', 'stream', false);
                updateSocial('tiktok', 'url', '');
              }
            }}
            style={[styles.connectButton, form.social.tiktok.enabled && styles.disconnectButton]}
          >
            <Text style={[styles.connectText, form.social.tiktok.enabled && styles.disconnectText]}>
              {form.social.tiktok.enabled ? 'Disconnect' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
        {!!form.social.tiktok.enabled && (
          <>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchTitle}>Stream posts to profile</Text>
                <Text style={styles.switchSubtitle}>Show your tiktok content</Text>
              </View>
              <Switch
                value={!!form.social.tiktok.stream}
                onValueChange={v => updateSocial('tiktok', 'stream', v)}
                trackColor={{ false: '#E0E0E0', true: '#B9B4F4' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Link</Text>
              <TextInput
                style={styles.input}
                value={form.social.tiktok.url || ''}
                onChangeText={t => updateSocial('tiktok', 'url', t)}
                placeholder="Enter tiktok URL or handle"
                autoCapitalize="none"
              />
            </View>
          </>
        )}
      </View>

      {/* Website */}
      <View style={styles.socialCard}>
        <View style={styles.socialHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="link" size={22} color={COLORS.slateBlue} />
            <Text style={styles.socialTitle}>Website</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              const enabled = !form.social.website.enabled;
              updateSocial('website', 'enabled', enabled);
              if (!enabled) {
                updateSocial('website', 'url', '');
              }
            }}
            style={[styles.connectButton, form.social.website.enabled && styles.disconnectButton]}
          >
            <Text style={[styles.connectText, form.social.website.enabled && styles.disconnectText]}>
              {form.social.website.enabled ? 'Disconnect' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
        {!!form.social.website.enabled && (
          <View style={styles.field}>
            <Text style={styles.label}>Link</Text>
            <TextInput
              style={styles.input}
              value={form.social.website.url || ''}
              onChangeText={t => updateSocial('website', 'url', t)}
              placeholder="https://your-site.com"
              autoCapitalize="none"
            />
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderDeveloper = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
      <View style={styles.devWarningBox}>
        <Ionicons name="warning" size={20} color="#B8860B" />
        <Text style={styles.devWarningText}>
          Developer only. Coordinates can be found by searching the address in Google Maps and copying the latitude/longitude values (up to 4 decimal places).
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Business Coordinates</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Latitude</Text>
        <TextInput
          style={styles.input}
          value={form.businessLat}
          onChangeText={t => update('businessLat', t)}
          placeholder="e.g. 37.7749"
          keyboardType="numeric"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Longitude</Text>
        <TextInput
          style={styles.input}
          value={form.businessLong}
          onChangeText={t => update('businessLong', t)}
          placeholder="e.g. -122.4194"
          keyboardType="numeric"
        />
      </View>

      {form.businessLat && form.businessLong ? (
        <View style={styles.coordPreview}>
          <Ionicons name="location" size={16} color={COLORS.slateBlue} />
          <Text style={styles.coordPreviewText}>
            {parseFloat(form.businessLat).toFixed(4)}, {parseFloat(form.businessLong).toFixed(4)}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={22} color={COLORS.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.title}>Profile Settings</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveIcon} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.darkNavy} />
          ) : (
            <Ionicons name="save-outline" size={20} color={COLORS.darkNavy} />
          )}
        </TouchableOpacity>
      </View>

      {renderTabs()}

      {tab === 'basic' ? renderBasic() : tab === 'media' ? renderMedia() : tab === 'social' ? renderSocial() : renderDeveloper()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  saveIcon: {
    padding: 8,
    borderRadius: 14,
    backgroundColor: '#EBF2FF',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#F6F6F6',
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#EFEFEF',
  },
  tabActive: {
    backgroundColor: '#E4E0FF',
  },
  tabText: {
    color: '#6E6E6E',
    fontWeight: '600',
    fontSize: 15,
  },
  tabTextActive: {
    color: COLORS.darkNavy,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginBottom: 12,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18,
  },
  photoWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#E9E56E',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#B9B4F4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  pillButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A3B4E',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#111',
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 12,
  },
  paletteCard: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 16,
    alignItems: 'center',
  },
  paletteCardSelected: {
    borderColor: '#B9B4F4',
  },
  palettePreview: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    marginBottom: 8,
  },
  swatchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 6,
  },
  swatchDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  paletteName: {
    fontWeight: '600',
    color: COLORS.darkNavy,
    fontSize: 13,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 42,
  },
  bannerUploadArea: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
    position: 'relative',
  },
  bannerPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerPlaceholderText: {
    marginTop: 8,
    color: '#B0B0B0',
    fontSize: 14,
    fontWeight: '600',
  },
  bannerEditBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    padding: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111',
  },
  resultsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  resultName: {
    color: COLORS.darkNavy,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 10,
  },
  helperText: {
    textAlign: 'center',
    color: '#999',
    paddingTop: 6,
    fontSize: 12,
  },
  socialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    padding: 14,
    marginBottom: 12,
  },
  socialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  socialTitle: {
    marginLeft: 10,
    color: COLORS.darkNavy,
    fontWeight: '700',
    fontSize: 16,
  },
  disconnectButton: {
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  disconnectText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 12,
  },
  connectButton: {
    backgroundColor: '#E9F2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  connectText: {
    color: '#1E5AA8',
    fontWeight: '600',
    fontSize: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchTitle: {
    color: COLORS.darkNavy,
    fontWeight: '600',
  },
  switchSubtitle: {
    color: COLORS.slateBlue,
    fontSize: 12,
  },
  devWarningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  devWarningText: {
    flex: 1,
    color: '#5D4037',
    fontSize: 13,
    lineHeight: 18,
  },
  coordPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F4FF',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  coordPreviewText: {
    color: COLORS.slateBlue,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ProfileBuilderScreen;


