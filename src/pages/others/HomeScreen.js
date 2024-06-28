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

import { SpeedDial } from '@rneui/themed';
//Components
import Header from '../../components/Layouts/Header';
import {Context as AuthContext} from '../../context/AuthContext';

import {colorsTheme} from '../../configurations/configStyle';
import {getListEquipment, getListAddon} from '../../services/inventory.services';
import {getStep, updateStep} from '../../functions/fncSqlite';
import { getAllCommunities, getModulesByRole } from '../../services/settings.services';
import AsyncStorage from '@react-native-async-storage/async-storage';


const HomeScreen = ({navigation}) => {
  const {signOut, setLoadingState, state} = React.useContext(AuthContext);
  const {inline} = state;
  const [open, setOpen] = React.useState(false);
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

  const getAllDataToOffline = async () => {
    if (!inline) {
      setIsAlert(true);
      setTitleAlert("Error de red");
      setMessageAlert("Asegúrate de tener conexión a internet");
      setShowIsAlert(false);
      return;
    }

    try {
      const getTaskData = await getTasks();
      await updateStep('taskList', 0, JSON.stringify(getTaskData), 0);

      for (const task of getTaskData) {
        const dataTask = await getElemetScreen(task.idTask);
        const { steps } = dataTask;

        // SAVE DATA STEP 1
        await updateStep('taskDescription', task.idTask, JSON.stringify(dataTask), 0);

        for (const step of steps) {
          const dataStepsToDo = await getStepInstruction(step.idStep);
          await updateStep('taskDescriptionToDo', step.idStep, JSON.stringify(dataStepsToDo), 0);
        }
      }

      const [getAddon, getKingo, getCommunities] = await Promise.all([
        getListAddon(),
        getListEquipment(),
        getAllCommunities()
      ]);

      await Promise.all([
        updateStep('warehouseAddon', 0, JSON.stringify(getAddon), 0),
        updateStep('warehouseEquipment', 0, JSON.stringify(getKingo), 0),
        updateStep('communities', 1, JSON.stringify(getCommunities), 0)
      ]);

      setIsAlert(true);
      setTitleAlert("Datos locales");
      setMessageAlert("Datos cargados localmente con éxito");
      setShowIsAlert(false);
    } catch (error) {
      setIsAlert(true);
      setTitleAlert("Error al cargar datos");
      setMessageAlert("Ocurrió un error al cargar los datos: " + error.message);
      setShowIsAlert(false);
    }
  };

  const getMenuOptions = async () => {
    try {
      const data = JSON.parse(await AsyncStorage.getItem('@user'));
      let options = [];

      if (inline) {
        options = await getModulesByRole(data.user.idRole);
        await updateStep('menuOptions', data.user.idRole, JSON.stringify(options), 0);

        const [getAddon, getKingo, getCommunities] = await Promise.all([
          getListAddon(),
          getListEquipment(),
          getAllCommunities()
        ]);

        await Promise.all([
          updateStep('warehouseAddon', 0, JSON.stringify(getAddon), 0),
          updateStep('warehouseEquipment', 0, JSON.stringify(getKingo), 0),
          updateStep('communities', 1, JSON.stringify(getCommunities), 0)
        ]);
      } else {
        const storedOptions = await getStep('menuOptions', data.user.idRole, 0);
        options = JSON.parse(storedOptions);
      }

      console.log("OPTIONS", options);
      setMenu(options);
    } catch (error) {
      console.error("[ GET MENU OPTIONS ]", error);
      setMenu([]);
    } finally {
      setIsLoading(false);
    }
  };


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
