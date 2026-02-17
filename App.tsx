import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import MapComponent, { MapComponentRef } from './components/MapComponent';
import OwnerProfileModal from './components/OwnerProfileModal';
import NavigationBar from './components/NavBar';
import SearchModal from './components/SearchModal';
import OwnerCardList from './components/OwnerCardList';
import { useCurrentLocation } from './hooks/useCurrentLocation';
import ProfileScreen from './screens/ProfileScreen';
import AdminPanelScreen from './screens/AdminPanelScreen';
import TagManagementScreen from './screens/TagManagementScreen';
import OwnerTagEditorScreen from './screens/OwnerTagEditorScreen';
import FeedScreen from './screens/FeedScreen';
import ProfileManagementScreen from './screens/ProfileManagementScreen';
import LandingScreenV2 from './screens/LandingScreenV2';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { initializeAppTags } from './utils/initializeTags';
import { OwnerService, OwnerWithTags } from './services/ownerService';
import { OwnerAccount } from './auth/UserData';
const fetchFonts = () => {
  return Font.loadAsync({
    ...Ionicons.font,
  });
};

const COLORS = {
  darkNavy: '#001B2E',
};

const DEFAULT_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

const AppContent = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const region = useCurrentLocation();
  const mapRef = useRef<MapComponentRef | null>(null);
  const [appIsReady, setAppIsReady] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [hasPassedStartup, setHasPassedStartup] = useState(true);

  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const [ownerCardsOpen, setOwnerCardsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<OwnerWithTags[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<OwnerWithTags | null>(null);
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'main' | 'admin' | 'tagManagement' | 'ownerTagEditor' | 'profileBuilder' | 'profileManagement'>('main');
  const [showFeed, setShowFeed] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | undefined>(undefined);
  const [adminNavigationParams, setAdminNavigationParams] = useState<any>({});

  useEffect(() => {
    async function prepare() {
      try {
        await fetchFonts();    
        await initializeAppTags();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const toggleSearchModal = () => {
    setSearchModalOpen((prev) => !prev);
  };

  const closeSearchModal = () => {
    if (isSearchModalOpen) setSearchModalOpen(false);
  };

  const performSearch = async ({
    nameQuery,
    selectedPrimaryTags,
    selectedSubtags,
    selectedOptionalTags,
    maxDistance,
    zipOverride,
  }: {
    nameQuery: string;
    selectedPrimaryTags: string[];
    selectedSubtags: string[];
    selectedOptionalTags: string[];
    maxDistance: number;
    zipOverride?: string;
  }) => {
    if (!region) {
      console.error("Region is not provided for search");
      return;
    }

    try {
      const results = await OwnerService.searchOwnersWithFilters({
        nameQuery,
        selectedPrimaryTags,
        selectedSubtags,
        selectedOptionalTags,
        maxDistance,
        originLat: region.latitude,
        originLong: region.longitude
      });

      setSearchResults(results);
      setOwnerCardsOpen(results.length > 0);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setOwnerCardsOpen(false);
    }
  };

  const handleSearchSubmit = (query: {
    nameQuery: string;
    selectedPrimaryTags: string[];
    selectedSubtags: string[];
    selectedOptionalTags: string[];
    maxDistance: number;
    zipOverride?: string;
  }) => {
    performSearch(query);
    setSearchModalOpen(false);
  };

  const handleCardChange = (owner: OwnerWithTags) => {
    setSelectedOwner(owner);
    if (mapRef.current && owner.businessProfile) {
      mapRef.current.recenterMap({
        latitude: owner.businessProfile.businessLat || 0,
        longitude: owner.businessProfile.businessLong || 0,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleOpenProfile = (owner: OwnerWithTags) => {
    setSelectedOwner(owner);
    setProfileModalVisible(true);
  };

  const handleOpenSingleCard = (owner: OwnerWithTags) => {
    setSearchResults([owner]);
    setOwnerCardsOpen(true);
    setSelectedOwner(owner);
    if (mapRef.current && owner.businessProfile) {
      mapRef.current.recenterMap({
        latitude: owner.businessProfile.businessLat || 0,
        longitude: owner.businessProfile.businessLong || 0,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleOwnerCardPress = (owner: OwnerAccount) => {
    const ownerWithTags = searchResults.find(o => o.id === owner.id.toString());
    if (ownerWithTags) {
      handleOpenProfile(ownerWithTags);
    }
  };

  const handleCloseProfile = () => {
    setProfileModalVisible(false);
    setSelectedOwner(null);
  };

  const handleFocusOnMap = (owner: any) => {
    if (mapRef.current && owner.businessProfile) {
      mapRef.current.recenterMap({
        latitude: owner.businessProfile.businessLat,
        longitude: owner.businessProfile.businessLong,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleProfilePress = async () => {
    if (!user) {
      try {
        console.log('Profile pressed - triggering login...');
        await signInWithGoogle();
      } catch (error) {
        console.error('Login failed:', error);
      }
    } else {
      setShowProfile(true);
      closeSearchModal();
      setOwnerCardsOpen(false);
      setProfileModalVisible(false);
    }
  };

  const handleAdminPress = () => {
    if (user) {
      setShowAdminPanel(true);
      setCurrentScreen('admin');
      closeSearchModal();
      setOwnerCardsOpen(false);
      setProfileModalVisible(false);
      setShowProfile(false);
    }
  };

  const handleAdminNavigation = (screen: 'admin' | 'tagManagement' | 'ownerTagEditor' | 'profileBuilder' | 'profileManagement', params?: any) => {
    setCurrentScreen(screen);
    if (params) {
      setAdminNavigationParams(params);
    }
  };

  const handleBackToMain = () => {
    setShowAdminPanel(false);
    setCurrentScreen('main');
    setAdminNavigationParams({});
  };

  const handleLandingPress = () => {
    setShowLanding(true);
    setShowFeed(false);
    setShowProfile(false);
    setShowAdminPanel(false);
    closeSearchModal();
    setOwnerCardsOpen(false);
    setProfileModalVisible(false);
  };

  const handleNavigateToMap = () => {
    setShowLanding(false);
    setShowFeed(false);
    setShowProfile(false);
    setShowAdminPanel(false);
    closeSearchModal();
    setOwnerCardsOpen(false);
    setProfileModalVisible(false);
  };

  const handleNavigateToFeed = (postId?: string) => {
    setSelectedPostId(postId);
    setShowLanding(false);
    setShowFeed(true);
    setShowProfile(false);
    setShowAdminPanel(false);
    closeSearchModal();
    setOwnerCardsOpen(false);
    setProfileModalVisible(false);
  };

  const effectiveRegion = region || DEFAULT_REGION;

  const mainAppContent = (
    <View style={styles.container}>
      <MapComponent
        ref={mapRef}
        region={effectiveRegion}
        searchResults={searchResults}
        selectedOwner={selectedOwner}
        onOwnerSelect={handleCardChange}
        onOpenProfile={handleOpenProfile}
        onCardPress={handleOwnerCardPress}
        onOpenSingleCard={handleOpenSingleCard}
      />
      {isSearchModalOpen && <SearchModal onSubmit={handleSearchSubmit} />}
      {ownerCardsOpen && !isSearchModalOpen && (
        <OwnerCardList
          owners={searchResults.map(owner => ({
            id: parseInt(owner.id),
            firstName: owner.businessProfile?.firstName || '',
            lastName: owner.businessProfile?.lastName || '',
            businessName: owner.businessProfile?.businessName || '',
            businessLat: owner.businessProfile?.businessLat || 0,
            businessLong: owner.businessProfile?.businessLong || 0,
            businessAddress: owner.businessProfile?.businessAddress || '',
            email: '',
            availability: 1,
            profilePic: owner.profileCustomization?.profilePic || 'default.png',
            favs: owner.favs || [],
            galleryImages: owner.profileCustomization?.galleryImages || [],
            profileBackground: owner.profileCustomization?.profileBackground || '#ffffff',
            textColor: owner.profileCustomization?.textColor,
            fontFamily: owner.profileCustomization?.fontFamily,
            markerColor: owner.profileCustomization?.markerColor,
          }))}
          onCardChange={(owner) => {
            const ownerWithTags = searchResults.find(o => o.id === owner.id.toString());
            if (ownerWithTags) {
              handleCardChange(ownerWithTags);
            }
          }}
          onCardPress={(owner) => {
            const ownerWithTags = searchResults.find(o => o.id === owner.id.toString());
            if (ownerWithTags) {
              handleOpenProfile(ownerWithTags);
            }
          }}
        />
      )}
      <OwnerProfileModal
        visible={isProfileModalVisible}
        owner={selectedOwner ? {
          id: parseInt(selectedOwner.id),
          firstName: selectedOwner.businessProfile?.firstName || '',
          lastName: selectedOwner.businessProfile?.lastName || '',
          businessName: selectedOwner.businessProfile?.businessName || '',
          businessLat: selectedOwner.businessProfile?.businessLat || 0,
          businessLong: selectedOwner.businessProfile?.businessLong || 0,
          businessAddress: selectedOwner.businessProfile?.businessAddress || '',
          email: '',
          availability: 1,
          profilePic: selectedOwner.profileCustomization?.profilePic || 'default.png',
          favs: selectedOwner.favs || [],
          galleryImages: selectedOwner.profileCustomization?.galleryImages || [],
          profileBackground: selectedOwner.profileCustomization?.profileBackground || '#ffffff',
          textColor: selectedOwner.profileCustomization?.textColor,
          fontFamily: selectedOwner.profileCustomization?.fontFamily,
          socialLinks: selectedOwner.profileCustomization?.socialLinks,
          markerColor: selectedOwner.profileCustomization?.markerColor,
        } : null}
        onClose={handleCloseProfile}
        onFocusOnMap={() => selectedOwner && handleFocusOnMap(selectedOwner)}
        onSelectFav={(favId) => {
          const newOwner = searchResults.find(o => o.id === favId.toString());
          if (newOwner) {
            setProfileModalVisible(false);
            setTimeout(() => {
              setSelectedOwner(newOwner);
              setProfileModalVisible(true);
            }, 450);
          }
        }}
      />
      <NavigationBar
        onLandingPress={handleLandingPress}
        onHomePress={() => {
          handleNavigateToMap();
          if (region) mapRef.current?.recenterMap(region);
        }}
        onSearchPress={() => {
          toggleSearchModal();
          setOwnerCardsOpen(false);
          setProfileModalVisible(false);
        }}
        onProfilePress={handleProfilePress}
        onAdminPress={handleAdminPress}
        showAdminButton={!!user}
      />
      <StatusBar style="auto" />
    </View>
  );

  if (showProfile) {
    return (
      <View style={styles.container}>
        <ProfileScreen />
        <NavigationBar
          onLandingPress={handleLandingPress}
          onHomePress={() => {
            handleNavigateToMap();
            if (region) mapRef.current?.recenterMap(region);
          }}
          onSearchPress={() => {
            handleNavigateToMap();
            toggleSearchModal();
          }}
          onProfilePress={() => {
          }}
          onAdminPress={handleAdminPress}
          showAdminButton={!!user}
        />
        <StatusBar style="auto" />
      </View>
    );
  }

  if (showAdminPanel) {
    return (
      <View style={styles.container}>
        {currentScreen === 'admin' && (
          <AdminPanelScreen
            navigation={{
              navigate: (screen: string, params?: any) => {
                if (screen === 'TagManagement') {
                  handleAdminNavigation('tagManagement', params);
                } else if (screen === 'ProfileManagement') {
                  handleAdminNavigation('profileManagement', params);
                }
              },
              goBack: handleBackToMain
            }}
          />
        )}
        {currentScreen === 'tagManagement' && (
          <TagManagementScreen
            navigation={{
              navigate: (screen: string, params?: any) => {
                if (screen === 'OwnerTagEditor') {
                  handleAdminNavigation('ownerTagEditor', params);
                }
              },
              goBack: () => handleAdminNavigation('admin')
            }}
          />
        )}
        {currentScreen === 'ownerTagEditor' && (
          <OwnerTagEditorScreen
            navigation={{
              goBack: () => handleAdminNavigation('tagManagement')
            }}
            route={{
              params: adminNavigationParams
            }}
          />
        )}
        {currentScreen === 'profileManagement' && (
          <ProfileManagementScreen
            navigation={{
              navigate: (screen: string, params?: any) => {
                if (screen === 'ProfileBuilder') {
                  handleAdminNavigation('profileBuilder', params);
                }
              },
              goBack: () => handleAdminNavigation('admin')
            }}
            route={{ params: adminNavigationParams }}
          />
        )}
        {currentScreen === 'profileBuilder' && (
          React.createElement(require('./screens/ProfileBuilderScreen').default, {
            navigation: {
              goBack: () => handleAdminNavigation('profileManagement', { mode: 'builder' })
            },
            route: {
              params: adminNavigationParams
            }
          })
        )}
        <NavigationBar
          onLandingPress={() => {
            handleBackToMain();
            setTimeout(() => handleLandingPress(), 100);
          }}
          onHomePress={handleBackToMain}
          onSearchPress={() => {
            handleBackToMain();
            setTimeout(() => {
              handleNavigateToMap();
              toggleSearchModal();
            }, 100);
          }}
          onProfilePress={() => {
            handleBackToMain();
            setTimeout(() => {
              handleProfilePress();
            }, 100);
          }}
          onAdminPress={() => {
          }}
          showAdminButton={false}
        />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.background} />
      {showLanding ? (
        <>
          <LandingScreenV2 
            onNavigateToMap={handleNavigateToMap}
            onNavigateToFeed={handleNavigateToFeed}
          />
          <NavigationBar
            onLandingPress={handleLandingPress}
            onHomePress={handleNavigateToMap}
            onSearchPress={() => {
              handleNavigateToMap();
              toggleSearchModal();
            }}
            onProfilePress={handleProfilePress}
            onAdminPress={handleAdminPress}
            showAdminButton={!!user}
          />
        </>
      ) : showFeed ? (
        <>
          <FeedScreen selectedPostId={selectedPostId} />
          <NavigationBar
            onLandingPress={handleLandingPress}
            onHomePress={() => {
              handleNavigateToMap();
              if (region) mapRef.current?.recenterMap(region);
            }}
            onSearchPress={() => {
              handleNavigateToMap();
              toggleSearchModal();
            }}
            onProfilePress={handleProfilePress}
            onAdminPress={handleAdminPress}
            showAdminButton={!!user}
          />
        </>
      ) : (
        mainAppContent
      )}
    </View>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.darkNavy,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
