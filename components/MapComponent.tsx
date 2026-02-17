import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Region, Marker, Circle } from 'react-native-maps';
import { OwnerWithTags } from '../services/ownerService';
import { OwnerAccount } from '../auth/UserData';
import OwnerMarkers from './OwnerMarkers';

interface MapComponentProps {
  region: Region;
  searchResults?: OwnerWithTags[];
  selectedOwner?: OwnerWithTags | null;
  onOwnerSelect: (owner: OwnerWithTags) => void;
  onOpenProfile: (owner: OwnerWithTags) => void;
  isProfileModalOpen?: boolean;
  isOwnerCardsOpen?: boolean;
  onCardPress?: (owner: OwnerAccount) => void;
  onOpenSingleCard?: (owner: OwnerWithTags) => void;
}

export interface MapComponentRef {
  recenterMap: (region: Region) => void;
}

const MapComponent = forwardRef<MapComponentRef, MapComponentProps>(
  ({ 
    region, 
    searchResults = [], 
    selectedOwner = null, 
    onOwnerSelect, 
    onOpenProfile,
    isProfileModalOpen = false,
    isOwnerCardsOpen = false,
    onCardPress,
    onOpenSingleCard
  }, ref) => {
    const mapRef = useRef<MapView>(null);
    const [currentRegion, setCurrentRegion] = useState(region);
    const [zoom, setZoom] = useState(15);

    useImperativeHandle(ref, () => ({
      recenterMap: (newRegion: Region) => {
        setCurrentRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
      },
    }));

    useEffect(() => {
      setCurrentRegion(region);
    }, [region]);

    const handleRegionChangeComplete = (newRegion: Region) => {
      setCurrentRegion(newRegion);
      const zoomLevel = Math.round(Math.log(360 / newRegion.latitudeDelta) / Math.LN2);
      setZoom(zoomLevel);
    };

    const handleOwnerSelect = (owner: OwnerWithTags) => {
      onOwnerSelect(owner);
    };

    return (
      <MapView 
        ref={mapRef} 
        style={styles.map} 
        region={currentRegion} 
        onRegionChangeComplete={handleRegionChangeComplete}
        moveOnMarkerPress={false}
        maxZoomLevel={20}
        minZoomLevel={3}
      >
        <Marker
          coordinate={{ 
            latitude: Number(region.latitude.toFixed(4)), 
            longitude: Number(region.longitude.toFixed(4)) 
          }}
          title="You are here"
          description="Current Location"
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
          zIndex={1000}
        />
        <OwnerMarkers 
          userLocation={currentRegion} 
          zoom={zoom}
          searchResults={searchResults}
          selectedOwnerId={selectedOwner?.id || null}
          onOwnerSelect={handleOwnerSelect}
          onOpenProfile={onOpenProfile}
          isProfileModalOpen={isProfileModalOpen}
          isOwnerCardsOpen={isOwnerCardsOpen}
          onCardPress={onCardPress}
          onOpenSingleCard={onOpenSingleCard}
        />
      </MapView>
    );
  }
);

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default MapComponent;