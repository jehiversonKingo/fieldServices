import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Button } from '@rneui/base';
import AwesomeAlert from 'react-native-awesome-alerts';
import DeviceInfo from 'react-native-device-info';

//Images
import Logo from '../../../assets/img/logoNaranja.png';

//Context
import { Context as AuthContext } from '../../context/AuthContext';

import { colorsTheme } from '../../configurations/configStyle';
import { ThemeConsumer } from '@rneui/themed';

const { width } = Dimensions.get('screen');

const SignInScreen = ({ }) => {
  const [user, setUser] = useState('carlos.lara@kingoenergy.com');
  const [password, setPassword] = useState('LaraSolano1_');
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle] = useState('¡Atención!');
  const [alertMessage, setAlertMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { state, signIn, setLoadingState } = useContext(AuthContext);

  const logIn = async () => {
    setIsLoading(true);
    if (!user || !password) {
      console.log('entro');
      setAlertMessage("Debes completar todos los campos.");
      setShowAlert(true);
      return;
    }

    const login = await signIn({ user, password });
    setIsLoading(false);
    if (login) setLoadingState();
  };

  useEffect(() => {
    if (state.error) {
      setAlertMessage(`${state.message}`);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    }
  }, [state]);

  return (
    <View style={styles.container}>
      <View style={styles.formLogin}>
        <View style={styles.imgContainer}>
          <Image source={Logo} style={styles.imgLogin} />
        </View>
        <TextInput
          style={styles.inputLogin}
          placeholder='Usuario'
          placeholderTextColor={'gray'}
          onChangeText={value => {
            setUser(value);
          }}
          value={user}
        />
        <TextInput
          secureTextEntry={true}
          placeholder='Contraseña'
          placeholderTextColor={"gray"}
          style={styles.inputLogin} 
          onChangeText={value => {
            setPassword(value);
          }}
          value={password}
        />
        <TouchableOpacity style={{ paddingTop: 25 }}>
          <Button
            title={isLoading ? "cargando..." : "Ingresar"}
            disabled={isLoading}
            size="lg"
            buttonStyle={{ backgroundColor: colorsTheme.naranja, borderRadius:5 }}
            
            onPress={() => logIn()}
          />
        </TouchableOpacity>
      </View> 
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>
          {process.env.REACT_APP_ENVIROMENT} {DeviceInfo.getVersion()}
        </Text>
      </View>
      <AwesomeAlert
        show={showAlert} 
        title={alertTitle} 
        message={alertMessage}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="Aceptar"
        confirmButtonColor={colorsTheme.rojo}
        onConfirmPressed={() => {
          setShowAlert(false);
        }}
      />
    </View>
  );
};

SignInScreen.navigationOptions = {
  header: () => false,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colorsTheme.blanco,
  },
  formLogin: {
    width: width * 0.9,
  },
  imgContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
    backgroundColor: ThemeConsumer.blanco,
  },
  imgLogin: {
    height: 120,
    width: 250,
  },
  colorText: {
    color: colorsTheme.gris,
  },
  inputLogin: {
    padding: 15,
    fontSize: 18,
    color: colorsTheme.negro,
    marginBottom: 10,
    backgroundColor: colorsTheme.blanco,
    borderColor: colorsTheme.naranja,
    borderWidth: 1.5,
    borderRadius: 5,
  },
  buttonLogin: {
    margin: 50,
    backgroundColor: colorsTheme.naranja,
    borderRadius:5
  },
  versionContainer: {
    marginTop: 25
  },
  versionText: {
    color: colorsTheme.gris,
    textAlign: 'center',
  },
});

export default SignInScreen;