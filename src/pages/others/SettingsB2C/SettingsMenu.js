import React, {useContext, useEffect} from 'react';
import {View, Text, NativeModules, TouchableOpacity, StyleSheet, FlatList} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import Header from '../../../components/Layouts/Header';
import jsonData from '../../../services/json/secrets.json';
import {colorsTheme} from '../../../configurations/configStyle';

const SettingsMenu = ({navigation}) => {
    const { KingoModule } = NativeModules;
  
    const goTo = route => {
        navigation.navigate(route);
      };

    const renderItemMenu = ({item}) => (
        <TouchableOpacity
            style={styles.bottomMenu}
            onPress={() => goTo(item.screen)}>
                <FontAwesome5
                    name={item.icon}
                    color={colorsTheme.naranja}
                    size={30}
                    style={styles.bottomMenu.icon}
                />
                <Text
                style={{
                    ...styles.bottomMenu.text,
                    color: colorsTheme.gris80,
                    fontWeight: '500',
                    marginTop: -5
                }}>
                    {item.text}
                </Text>
        </TouchableOpacity>
      );
      
    const data = [
        {
            screen:'SettingsKingoScreen',
            text: 'Configurar Kingo',
            icon: 'cogs',
        },
        {
            screen:'RepositionCodeScreen',
            text: 'Restablecer Plan',
            icon: 'cogs',
        },
        {
            screen:'GenerateCodeTypesScreen',
            text: 'Códigos de configuracion',
            icon: 'cogs',
        }
    ]

    return(
        <View>
            <Header isLeft={true} navigation={navigation} />
            <FlatList 
                data={data}
                renderItem={renderItemMenu}
            />
        </View>
    );
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

export default SettingsMenu;
