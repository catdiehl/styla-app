import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OwnerAccount } from '../auth/UserData';
import { resolveProfileImage } from '../utils/image';

interface MarkerTooltipProps {
  owner: OwnerAccount;
  onCardPress?: (owner: OwnerAccount) => void;
  onClose: () => void;
}

const MarkerTooltip: React.FC<MarkerTooltipProps> = ({ owner, onCardPress, onClose }) => {
  const markerColor = owner.markerColor || '#294C60';
  
  return (
    <View style={styles.container}>
      <View style={styles.tooltip}>
        <View style={styles.header}>
          <View style={[styles.profileImageContainer, { borderColor: markerColor }]}>
            {resolveProfileImage(owner.profilePic) ? (
              <Image 
                source={resolveProfileImage(owner.profilePic)!} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={[styles.profileImage, { backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="person" size={18} color="#B0B0B0" />
              </View>
            )}
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>
              {owner.firstName} {owner.lastName}
            </Text>
            <Text style={styles.businessName}>
              @{owner.businessName}
            </Text>
            <Text style={styles.address}>
              {owner.businessAddress}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => {
              onCardPress && onCardPress(owner);
              onClose();
            }}
            style={styles.cardButton}
          >
            <Text style={styles.cardButtonText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  tooltip: {
    backgroundColor: '#EFEFEF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#001B2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 280,
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
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001B2E',
    marginBottom: 2,
  },
  businessName: {
    fontSize: 14,
    color: '#294C60',
    marginBottom: 2,
  },
  address: {
    fontSize: 12,
    color: '#ADB6C4',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ADB6C4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#EFEFEF',
    fontWeight: 'bold',
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
  },
});

export default MarkerTooltip; 