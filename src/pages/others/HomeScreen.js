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
import { getDebetAgent } from '../../services/sales.services';
import { useFocusEffect } from '@react-navigation/native';


const HomeScreen = ({navigation}) => {
  const {signOut, setLoadingState, state} = React.useContext(AuthContext);
  const {inline} = state;
  const [open, setOpen] = React.useState(false);
  const [menu, setMenu] = React.useState([]);
  const [blocked, setBlocked] = React.useState(false);
  const [uploadSync, setUploadSync] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const goTo = route => navigation.navigate(route);

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

  const getMenuOptions = async () => {
    try {
      const data = JSON.parse(await AsyncStorage.getItem('@user'));
      let options = [];
      if (inline) {
        options = await getModulesByRole(data.user.idRole);
        console.log("OPTIONS", options);
        const [getAddon, getKingo, getCommunities] = await Promise.all([
          getListAddon(),
          getListEquipment(),
          getAllCommunities()
        ]);

        await Promise.all([
          updateStep('warehouseAddon', 0, JSON.stringify(getAddon), 0),
          updateStep('warehouseEquipment', 0, JSON.stringify(getKingo), 0),
          updateStep('communities', 1, JSON.stringify(getCommunities), 0),
          updateStep('menuOptions', data.user.idRole, JSON.stringify(options), 0),
        ]);
      } else {
        const storedOptions = JSON.parse(await getStep('menuOptions', data.user.idRole, 0));
        console.log('[ OFFLINE ] ............', storedOptions);
        if (storedOptions) options = storedOptions.filter((item) => item.offline);
      }
      console.log('[ INLINE ] ............', inline);
      options.map(item => console.log(item))
      setMenu(options.sort((a,b) => a.module.text - b.module.text));
    } catch (error) {
      console.error("[ GET MENU OPTIONS ]", error);
      setMenu([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidBlocked = async() => {
    setUploadSync(false);
    setBlocked(false);
    let getDebt = await getDebetAgent();
    let debtUser = JSON.parse(await getStep('debtUser', 0, 0));
    let getWalletCustomers = JSON.parse(await getStep('customersOfflineData', 0, 0));
    console.log('[ DEBET USER OFFLINE ]', parseFloat(debtUser.amount).toFixed(2));
    console.log('[ DEBET USER ]', parseFloat(getDebt.amount).toFixed(2))
    // if (debtUser && getDebt) {
    //   if (parseFloat(debtUser.amount).toFixed(2) !== parseFloat(getDebt.amount).toFixed(2)) {
    //     setBlocked(true)
    //   }
    // }

    if(getWalletCustomers) {
      if(getWalletCustomers.customers.length > 0) {
        setUploadSync(true);
      }
    }

    setIsLoading(false);
  }

  useEffect(() => {
    handleValidBlocked();
    getMenuOptions();
  }, [inline])

  useFocusEffect(
    React.useCallback(() => {
      handleValidBlocked();
      getMenuOptions();
    }, [inline])
  );

  if (blocked || uploadSync) {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', alignContent: "center", flex: 1 }}>
        <Text style={{ color: colorsTheme.naranja, fontSize: 20 }}> Aplicación bloqueada</Text>
        <View style={{ marginHorizontal: 25, flexDirection: "row" }}>
          <Text style={{ color: colorsTheme.negro, fontWeight: "bold" }}>Tienes lotes de información pendiente de subir</Text>
        </View>
        <TouchableOpacity style={{ paddingHorizontal: 45, paddingVertical: 10, backgroundColor: colorsTheme.naranja, borderRadius: 15, marginTop: 10, flexDirection: "row" }}
          onPress={() => navigation.navigate("SyncDataScreen")}
        >
          <FontAwesome5 name='cloud-upload-alt' color={colorsTheme.blanco} size={20} style={{ marginRight: 5 }} />
          <Text style={{ color: "white", fontSize: 15, marginTop: 3 }}>Subir información</Text>
        </TouchableOpacity>
      </View>
    )
  }

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
            elevation: 6,}}
          >
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
                    return (
                      <View key={'_'+index} style={{width : '50%', flexDirection : "row"}}>
                        <RenderMenu key={index} item={item} />
                      </View>
                    );
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
