import React from 'react';
import {View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';

import {colorsTheme} from '../../configurations/configStyle';

const ModalComponent = ({isOpen, toggleModal, children}) => {
  return (
    <Modal
      isVisible={isOpen}
      onBackButtonPress={() => toggleModal(false)}
      onBackdropPress={() => toggleModal(false)}
    >
      <View style={{
        backgroundColor: colorsTheme.blanco,
        padding: "3%",
        borderRadius: 10
      }}>
        {children}
      </View>
    </Modal>
  );
};

export default ModalComponent;
