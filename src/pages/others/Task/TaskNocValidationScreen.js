import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  TextInput,
} from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';
import {setCodeNoc} from '../../../services/task.services';
import {Button} from '@rneui/base';
import Header from '../../../components/Layouts/Header';

import {Context as AuthContext} from '../../../../src/context/AuthContext';

import {colorsTheme} from '../../../configurations/configStyle';

const TaskNocValidationScreen = ({navigation, route}) => {

  const {state} = React.useContext(AuthContext);

  const [code, setCode] = useState('');
  const [isAlert, setIsAlert] = useState(false);
  const [isAlertButtom, setAlertButtom] = useState(false);
  const [titleAlert, setTitleAlert] = useState('');
  const { id } = route.params;

  useEffect(()=>{
    if (state.code !== ''){setCode(state.code); handleSendCode();}
  },[state.code]);

  const handleSendCode = async() =>{
    if (code !== '' && code !== null && code !== undefined || state.code !== ''){
      let codeValid = (code !== '' && code !== null && code !== undefined) ? code : state.code;
      setIsAlert(true);
      setTitleAlert('Validando Codigo...');
      let taskStatus = await setCodeNoc({code: codeValid, idTask:id});
      setIsAlert(false);
      if (taskStatus.status){
        navigation.navigate('Task', {taskStatus});
      } else {
        setAlertButtom(true);
        setTitleAlert(taskStatus.message);
      }
    } else {
      setAlertButtom(true);
      setTitleAlert('Debes completar los campos del formulario');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header isLeft={true} navigation={navigation} />
      <View style={{
        flex: 1,
        marginHorizontal: 20,
        marginTop: 15,
          marginBottom: 15}}>
        <Text style={styles.colorText}>Número de confirmación de NOC</Text>
        <TextInput
          style={styles.inputForm}
          placeholder={'Número de NOC'}
          placeholderTextColor={'gray'}
          onChangeText={text =>
            setCode(text)
          }
          value={code}
        />
        <TouchableOpacity style={{paddingTop: 25}}>
          <Button
            title="Validar"
            size="lg"
            buttonStyle={{backgroundColor: colorsTheme.naranja, borderRadius: 30}}
            containerStyle={{
              marginHorizontal: 50,
              marginVertical: 10,
            }}
            onPress={() => handleSendCode()}
          />
        </TouchableOpacity>
      </View>
      <AwesomeAlert
        show={isAlert}
        showProgress={true}
        title={titleAlert}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
      />
      <AwesomeAlert
        show={isAlertButtom}
        title={titleAlert}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="Aceptar"
        confirmButtonColor={colorsTheme.rojo}
        onConfirmPressed={() => {
          setAlertButtom(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  colorText: {
    color: colorsTheme.gris80,
  },
  inputForm: {
    fontSize: 17,
    color: colorsTheme.negro,
    marginBottom: 10,
    backgroundColor: colorsTheme.blanco,
    borderRadius: 10,
  },
  buttonTextStyle: {
    backgroundColor: colorsTheme.naranja,
    borderRadius: 5,
    padding: 15,
    position: 'absolute',
    right: 0,
  },
});

export default TaskNocValidationScreen;
