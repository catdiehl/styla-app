import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import OwnerProfileScreen from './OwnerProfileScreen';
import { OwnerAccount } from '../auth/UserData';

interface OwnerProfileModalProps {
  visible: boolean;
  owner: OwnerAccount | null;
  onClose: () => void;
  onSelectFav: (id: number) => void;
  onFocusOnMap?: (owner: OwnerAccount) => void;
}

const OwnerProfileModal: React.FC<OwnerProfileModalProps> = ({ visible, owner, onClose, onSelectFav, onFocusOnMap }) => {
  return (
    <Modal
      isVisible={visible}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      useNativeDriver
    >
      <View style={styles.container}>
        {owner && (
          <OwnerProfileScreen owner={owner} onBack={onClose} onSelectFav={onSelectFav} onFocusOnMap={onFocusOnMap} />
        )}
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    width: width * 0.95,
    height: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    alignSelf: 'flex-end',
  },
});

export default OwnerProfileModal;
