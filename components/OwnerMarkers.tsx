import React, { useState, useEffect, useRef } from 'react';
import { Region, Marker } from 'react-native-maps';
import { OwnerWithTags } from '../services/ownerService';
import ProfileBubble from './ProfileBubble';
import MarkerTooltip from './MarkerTooltip';
import { resolveProfileImage } from '../utils/image';
import { OwnerAccount } from '../auth/UserData';

interface OwnerMarkersProps {
  userLocation: Region;
  zoom: number;
  onOwnerSelect: (owner: OwnerWithTags) => void;
  onOpenProfile: (owner: OwnerWithTags) => void;
  searchResults?: OwnerWithTags[];
  selectedOwnerId?: string | null;
  isProfileModalOpen?: boolean;
  isOwnerCardsOpen?: boolean;
  onCardPress?: (owner: OwnerAccount) => void;
  onOpenSingleCard?: (owner: OwnerWithTags) => void;
}

interface MarkerState {
  owner: OwnerWithTags;
  zIndex: number;
  isVisible: boolean;
  isSelected: boolean;
  stableCoordinate: { latitude: number; longitude: number };
}

const OwnerMarkers: React.FC<OwnerMarkersProps> = ({
  userLocation,
  zoom,
  onOwnerSelect,
  onOpenProfile,
  searchResults = [],
  selectedOwnerId = null,
  isProfileModalOpen = false,
  isOwnerCardsOpen = false,
  onCardPress,
  onOpenSingleCard
}) => {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [markerStates, setMarkerStates] = useState<MarkerState[]>([]);


  useEffect(() => {
    const initializeMarkers = async () => {
      try {
        console.log('Initializing markers...');
        const startTime = Date.now();

        const { OwnerService } = await import('../services/ownerService');
        const ownersToShow: OwnerWithTags[] = await OwnerService.getAllOwnersWithTags();
        console.log(`Loaded ${ownersToShow.length} owners from database`);

        let initialStates: MarkerState[] = ownersToShow.map((owner, index) => {
          const lat = owner.businessProfile?.businessLat || 0;
          const lng = owner.businessProfile?.businessLong || 0;

          return {
            owner,
            zIndex: 0,
            isVisible: true,
            isSelected: false,
            stableCoordinate: {
              latitude: Number(Number(lat).toFixed(6)),
              longitude: Number(Number(lng).toFixed(6))
            }
          };
        });

        initialStates = initialStates.filter(state =>
          !isNaN(state.stableCoordinate.latitude) &&
          !isNaN(state.stableCoordinate.longitude) &&
          state.stableCoordinate.latitude !== 0 &&
          state.stableCoordinate.longitude !== 0
        );

        setMarkerStates(initialStates);

        const loadTime = Date.now() - startTime;
        console.log(`Markers initialized in ${loadTime}ms`);
      } catch (error) {
        console.error('Failed to load owners for markers:', error);
        setMarkerStates([]);
      }
    };

    initializeMarkers();
  }, []);

  useEffect(() => {
    if (!isProfileModalOpen && !isOwnerCardsOpen) {
      setSelectedMarkerId(null);
      setShowTooltip(false);
      
      setMarkerStates(prevStates => {
        return prevStates.map((state, index) => ({
          ...state,
          isSelected: false,
          zIndex: 0,
        }));
      });
    }
  }, [isProfileModalOpen, isOwnerCardsOpen]);

  const handleMarkerSelect = (markerState: MarkerState) => {
    setSelectedMarkerId(markerState.owner.id);
    onOwnerSelect(markerState.owner);
    if (onOpenSingleCard) {
      onOpenSingleCard(markerState.owner);
    }
  };

  const handleTooltipClose = () => {
    setShowTooltip(false);
    setSelectedMarkerId(null);
  };

  const prevProfileOpenRef = useRef<boolean>(isProfileModalOpen);
  const prevCardsOpenRef = useRef<boolean>(isOwnerCardsOpen);
  useEffect(() => {
    const prevProfileOpen = prevProfileOpenRef.current;
    const prevCardsOpen = prevCardsOpenRef.current;
    if (prevProfileOpen && !isProfileModalOpen) {
      setSelectedMarkerId(null);
      setShowTooltip(false);
    }
    if (prevCardsOpen && !isOwnerCardsOpen) {
      setSelectedMarkerId(null);
      setShowTooltip(false);
    }
    prevProfileOpenRef.current = isProfileModalOpen;
    prevCardsOpenRef.current = isOwnerCardsOpen;
  }, [isProfileModalOpen, isOwnerCardsOpen]);

  const selectedOwner = markerStates.find(state => state.owner.id === selectedMarkerId);

  return (
    <>
      {markerStates.map((markerState, index) => {
        const isSelected = selectedMarkerId === markerState.owner.id || selectedOwnerId === markerState.owner.id;
        const finalZIndex = isSelected ? 9999 : markerState.zIndex;
        
        if (isNaN(markerState.stableCoordinate.latitude) || isNaN(markerState.stableCoordinate.longitude)) {
          console.warn(`Invalid coordinates for marker ${markerState.owner.id}, skipping render`);
          return null;
        }

        return (
          <Marker
            key={markerState.owner.id}
            coordinate={markerState.stableCoordinate}
            onPress={() => handleMarkerSelect(markerState)}
            tracksViewChanges={false}
            zIndex={finalZIndex}
          >
            <ProfileBubble
              source={resolveProfileImage(markerState.owner.profileCustomization?.profilePic)}
              borderColor={markerState.owner.profileCustomization?.markerColor || '#294C60'}
              isSelected={isSelected}
            />
          </Marker>
        );
      }).filter(Boolean)}
      
      {/* Tooltip intentionally disabled for test path */}
    </>
  );
};

export default OwnerMarkers;
