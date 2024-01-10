import React, {useContext, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AwesomeAlert from 'react-native-awesome-alerts';

import { SpeedDial } from '@rneui/themed';
//Components
import Header from '../../components/Layouts/Header';
import {Context as AuthContext} from '../../context/AuthContext';

import {colorsTheme} from '../../configurations/configStyle';
import { getTasks, getElemetScreen, getStepInstruction } from '../../services/task.services';
import {getListEquipment, getListAddon} from '../../services/inventory.services';
import {getStep, updateStep} from '../../functions/fncSqlite';
import { getAllCommunities, getModulesByRole } from '../../services/settings.services';
import AsyncStorage from '@react-native-async-storage/async-storage';


const HomeScreen = ({navigation}) => {
  const {signOut, setLoadingState, state} = React.useContext(AuthContext);
  const {inline} = state;
  const [open, setOpen] = React.useState(false);
  const [showIsAlert, setShowIsAlert] = React.useState(false);
  const [isAlert, setIsAlert] = React.useState(false);
  const [messageAlert, setMessageAlert] = React.useState('');
  const [titleAlert, setTitleAlert] = React.useState('');
  const [menu, setMenu] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const goTo = route => {
    navigation.navigate(route);
  };

  const RenderMenu = ({item}) => (
    <TouchableOpacity
      style={styles.bottomMenu}
      onPress={() => goTo(item.module.screen)}>
       <FontAwesome5
        name={item.module.icon}
        color={colorsTheme.naranja}
        size={item.module.size}
        style={styles.bottomMenu.icon}
      />
      <Text
        style={{
          ...styles.bottomMenu.text,
          color: colorsTheme.gris80,
          fontWeight: '500',
          marginTop: -5,
        }}>
        {item.module.text}
      </Text>
    </TouchableOpacity>
  );

  const fncSingOut = () => {
    setLoadingState();
    signOut();
  };

  const getAllDataToOffline = async() => {
    setOpen(false);
    setShowIsAlert(true);
    setTitleAlert("Cargando datos")
    setMessageAlert("Recopilando datos para almacenamiento...")

    if(inline){
      getTaskData = await getTasks();
      await updateStep('taskList',0, JSON.stringify(getTaskData), 0);
      getTaskData.forEach(async (task) => {
        let dataTask = await getElemetScreen(task.idTask);
        const {steps} = dataTask;
        
        await updateStep('taskDescription',task.idTask, JSON.stringify(dataTask), 0);
        console.log("---",steps)
        steps.forEach(async (step) => {
          let dataStepsToDo = await getStepInstruction(step.idStep)
          await updateStep('taskDescriptionToDo',step.idStep, JSON.stringify(dataStepsToDo), 0);
        });
      });

      console.log('*1*');
      getAddon = await getListAddon();
      await updateStep('warehouseAddon', 0, JSON.stringify(getAddon), 0);

      getKingo = await getListEquipment();
      await updateStep('warehouseEquipment', 0, JSON.stringify(getKingo), 0);
      
      let getCommunities = await getAllCommunities();
      await updateStep('communities', 1, JSON.stringify(getCommunities), 0);

      setIsAlert(true);
      setTitleAlert("Datos locales")
      setMessageAlert("Datos cargados localmente con éxito")
      setShowIsAlert(false);

    }else{

      //setShowIsAlert(false);
      setIsAlert(true);
      setTitleAlert("Error de red")
      setMessageAlert("No te encuentras en linea para realizar este proceso")
      setShowIsAlert(false);
    }

   /*  setTimeout(() => {
      setIsAlert(false)
    }, 6000); */

  }

  const getMenuOptions = async () => {
    try {
      const data = JSON.parse(await AsyncStorage.getItem('@user'));
      let options = [];
      if (inline) {
        options = await getModulesByRole(data.user.idRole)
        await updateStep('menuOptions', data.user.idRole, JSON.stringify(options), 0);

        getAddon = await getListAddon();
        await updateStep('warehouseAddon', 0, JSON.stringify(getAddon), 0);

        getKingo = await getListEquipment();
        await updateStep('warehouseEquipment', 0, JSON.stringify(getKingo), 0);
        
        let getCommunities = await getAllCommunities();
        await updateStep('communities', 1, JSON.stringify(getCommunities), 0);
      } else {
        options = JSON.parse(await getStep('menuOptions', data.user.idRole, 0));
      }
      console.log("OPTIONS", options);
      setMenu(options);
      setIsLoading(false);
    } catch (error) {
      console.log("[ GET MENU OPITONS ]", error)
      setMenu([]);
      setIsLoading(false);
    }
  }
  
  useEffect(() => {
    getMenuOptions();
  }, [])

  return (
    <SafeAreaView style={{flex:1}}>
      <Header />
      <View>
        <View style={{padding: 20}}>
          <View style={{backgroundColor: colorsTheme.naranja, alignItems: 'center', shadowColor: colorsTheme.gris80,
        shadowOffset: {
          width: 0,
          height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 6,}}>
            <Text style={styles.bottomMenu.text}>Menu Principal</Text>
          </View>
          <ScrollView 
          contentContainerStyle={{
              flexDirection: 'row',
              flexWrap: 'wrap'}}
            >
            {
              isLoading ? (
                <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
                  <ActivityIndicator size="large" color={colorsTheme.naranja}/>
                </View>
              ) : (
                menu.length > 0 ? (
                  menu.map((item, index) => {
                    if (item.offline) {
                      return (
                        <View key={'_'+index} style={{width : '50%', flexDirection : "row"}}>
                          <RenderMenu key={index} item={item} />
                        </View>
                      );
                    }
                  })
                ) : (
                  <View style={{
                    backgroundColor: colorsTheme.naranja60,
                    flex: 1,
                    justifyContent:'center',
                    alignItems: 'center',
                    borderRadius: 100,
                    marginVertical: 20,
                    padding: 10
                  }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight:'bold',
                      textAlign: 'center',
                      color:colorsTheme.blanco
                    }}>{"Actualmente no tienes acceso a ningún módulo."}</Text>
                  </View>
                )
              )
            }
          </ScrollView>
        </View>
      </View>
      <SpeedDial
        isOpen={open}
        color={colorsTheme.naranja}
        icon={{ name: 'dns', color: '#fff' }}
        openIcon={{ name: 'close', color: '#fff' }}
        onOpen={() => setOpen(!open)}
        onClose={() => setOpen(!open)}
      >
        <SpeedDial.Action
          icon={{ name: 'cloud-upload', color: '#fff' }}
          color={colorsTheme.naranja}
          title="Sincronizar Tareas"
          onPress={() => navigation.navigate('TaskOffline')}
        />
        <SpeedDial.Action
          icon={{ name: 'handshake', type: "font-awesome-5", color: '#fff' }}
          color={colorsTheme.naranja}
          title="Handshake"
          onPress={() => navigation.navigate('HandshakeServer')}
        />
        <SpeedDial.Action
          icon={{ name: 'sync-alt', color: '#fff' }}
          color={colorsTheme.naranja}
          title="Cargar Datos"
          onPress={() => getAllDataToOffline()}
        />
        <SpeedDial.Action
          icon={{ name: 'person', color: '#fff' }}
          color={colorsTheme.naranja}
          title="Perfil"
          onPress={() => navigation.navigate('Profile')}
        />
        <SpeedDial.Action
          icon={{ name: 'power-off', color: '#fff' }}
          color={colorsTheme.naranja}
          title="Cerrar Sesión"
          onPress={() => fncSingOut()}
        />
      </SpeedDial>
      <AwesomeAlert
        show={isAlert}
        title={titleAlert}
        message={messageAlert}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="Aceptar"
        confirmButtonColor={colorsTheme.rojo}
        onConfirmPressed={() => {
          setIsAlert(false);
        }}
      />
      <AwesomeAlert
        show={showIsAlert}
        showProgress={true}
        title={titleAlert}
        message={messageAlert}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
      />
    </SafeAreaView>
  );
};

HomeScreen.navigationOptions = {
  header: () => false,
};

const styles = StyleSheet.create({
  userData: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: colorsTheme.naranja,
  },
  textInformation: {color: colorsTheme.blanco},
  bottomMenu: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 10,
    margin:7,
    borderLeftColor: colorsTheme.naranja60,
    borderLeftWidth: 5,
    backgroundColor: colorsTheme.blanco,
    height: 85,
    justifyContent: 'center',
    alignItems:'center',
    text: {
      fontSize: 17,
      color: colorsTheme.blanco,
      padding: 10,
      fontWeight: '700',
    },
    icon: {
      paddingRight: 15,
      color: colorsTheme.naranja,
    },
    shadowColor: colorsTheme.gris80,
        shadowOffset: {
          width: 0,
          height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 6,
  },
});

export default HomeScreen;
