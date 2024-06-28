import React, { useState } from "react";
import { Modal, TouchableOpacity, StyleSheet, View, Text, ActivityIndicator } from "react-native";
import FeatherIcon from 'react-native-vector-icons/Feather';

const AlertShow = ({ isVisible, setIsVisible, data, showButtons=true}) => {
  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <Modal
      visible={isVisible}
      onRequestClose={handleClose}
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            {(data.type === "success" || data.type === undefined) &&(<FeatherIcon size={48} color={"green"} name='check-circle' />)}
            {data.type === "error" &&(<FeatherIcon size={48} color={"red"} name='x-circle' />)}
            {data.type === "info" &&(<FeatherIcon size={48} color={"skyblue"} name='alert-circle' />)}
            {data.type === "loading" &&(<ActivityIndicator size="large" color={"green"} />)}
          </View>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.subtitle}>{data.subTitle}</Text>
          {showButtons && (
          <View style={styles.buttonContainer}>
            {data.blocked !== true &&(
              <TouchableOpacity
              style={styles.button}
              onPress={handleClose}
            >
              <Text style={{ color: "white" }}>Cerrar</Text>
            </TouchableOpacity>
            )}
            {data.secondButton && (
              <TouchableOpacity
                style={[styles.button, {backgroundColor:"green", paddingHorizontal:25}]}
                onPress={data.secondAction}
              >
                <Text style={{ color: "white" }}>Ok</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 10,
    width: 300,
    alignItems: 'center', // Centrar horizontalmente
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: 'center', // Centrar el texto horizontalmente
  },
  subtitle: {
    color: "black",
    fontSize: 14,
    textAlign: 'center', // Centrar el texto horizontalmente
  },
  button: {
    marginTop: 20,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    margin:10
  },
  buttonContainer:{
    flexDirection:"row"
  }
});

export default AlertShow;
