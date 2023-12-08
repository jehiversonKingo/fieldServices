import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import {colorsTheme} from '../../configurations/configStyle';
import Header from '../../components/Layouts/Header';
import QRCode from 'react-native-qrcode-svg';
import { getUserById } from '../../services/auth.services';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({navigation}) => {
  const [data, setData] = useState({});
  const [countPending, setCountPending] = useState(0);
  const [countComplete, setCountComplete] = useState(0);
  const [isLoading, setIsLoading] = useState(true); 

  const getData = async () => {
    const user = JSON.parse(await AsyncStorage.getItem('@user'));
    const response = await getUserById(user.idUser);
    if (response?.taskUsers) {
      const pending = response.taskUsers.filter(i => i.task.idTaskState == 1);
      const complete = response.taskUsers.filter(i => i.task.idTaskState == 4);
      setCountPending(pending.length);
      setCountComplete(complete.length);
    }
    console.log("RESPONSE =>>", response);
    setData(response);
    setIsLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <View style={styles.container}>
      <Header
        isLeft={true}
        navigation={navigation}
        title={'Perfil'}
      />
      <View style={styles.form}>
        {
          !isLoading ? (
            <>
              <View style={{alignItems: "center"}}>
                <QRCode
                  value={`${data.codeUser}`}
                  size={150}
                  color="black"
                  backgroundColor="white"
                />
                  <View style={{marginVertical: 10}}>
                  <Text style={styles.agentName}>{`${data?.name} ${data?.lastName}`}</Text>
                  <Text style={{...styles.colorText, textAlign: "center"}}>{`Codigo Empleado: ${data?.codeUser}`}</Text>
              </View>

              </View>
              <View style={{marginHorizontal: "10%"}}>
                  <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                      <Text style={styles.subtitle}>{"Tareas completadas:"}</Text>
                      <Text style={styles.colorText}>{countComplete}</Text>
                  </View>
                  
                  <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                      <Text style={styles.subtitle}>{"Tareas pendientes:"}</Text>
                      <Text style={styles.colorText}>{countPending}</Text>
                  </View>
              </View>
            </>
          ) : (
            <View style={{ralignItems: 'center', flex: 1}}>
              <ActivityIndicator size="large" color={colorsTheme.naranja}/>
            </View>
          )
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorsTheme.blanco,
  },
  form: {
    flex: 1,
    marginVertical: 20,
  },
  imgProfile: {
    resizeMode: "contain",
    height: 150,
    width: 150,
  },
  agentName: {
    color: colorsTheme.negro,
    fontWeight: "700",
    fontSize: 25,
    textAlign: "center"
  },
  subtitle: {
    color: colorsTheme.gris80,
    fontWeight: "500",
    fontSize: 18,
  },
  colorText: {
    color: colorsTheme.gris,
    fontWeight: "600",
    fontSize: 18,
  },
  inputLogin: {
    padding:15,
    fontSize: 18,
    color: colorsTheme.negro,
    marginBottom: 10,
    backgroundColor: colorsTheme.blanco,
    borderColor:colorsTheme.naranja,
    borderWidth:1,
    borderRadius: 10,
  },
  buttonLogin: {
    margin: 50,
    backgroundColor: colorsTheme.naranja,
  },
});

export default ProfileScreen;
