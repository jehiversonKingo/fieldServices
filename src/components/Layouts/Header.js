import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import DeviceInfo from 'react-native-device-info';
import {colorsTheme} from '../../configurations/configStyle';

//Images
import Logo from '../../../assets/img/hybrico-logo-blanco.svg';

const Header = ({
  isLeft,
  isRight,
  navigation,
  isRoute,
  route,
  title,
  isOpen,
  isOpenFunction,
  iconRight,
}) => {
  return (
    <>
      <SafeAreaView />
      <View style={styles.container}>
        <View style={styles.containerBack}>
          {isLeft && (
            <TouchableOpacity
              onPress={() =>
                isRoute ? navigation.navigate(route) : navigation.goBack()
              }>
              <View style={{flexDirection: 'row'}}>
                <FontAwesome5
                  name={'arrow-left'}
                  color={colorsTheme.gris20}
                  size={20}
                  style={{marginTop: 24, position: 'absolute', left:5}}
                />
                <Text
                  style={{
                    color: colorsTheme.blanco,
                    fontSize: 18,
                    marginTop: 20,
                    marginLeft: 30,
                  }}>
                  {title}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.containerLogo}>
          {/* <Image source={Logo} style={styles.imgLogo} /> */}
          <Logo height={"30"} width={"90"} />
          <Text style={{color: colorsTheme.blanco}}>{process.env.ENVIROMENT}. {DeviceInfo.getVersion()}</Text>
        </View>
        <View style={styles.containerProfile}>
          {isRight && (
            <TouchableOpacity
              onPress={() => {
                isOpenFunction(isOpen);
              }}
              style={{height:70}}>
              <FontAwesome5
                name={iconRight}
                color={colorsTheme.gris20}
                size={20}
                style={{marginTop: 25, position: 'absolute', right: 20}}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 70,
    backgroundColor: colorsTheme.verdeHybrico,
    flexDirection: 'row',
  },
  containerBack: {
    flex: 1,
  },
  containerLogo: {
    flex: 1,
    height: 65,
    width: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerProfile: {
    flex: 1,
  },
  imgLogo: {
    height: 30,
    width: 90,
    marginTop: 10,
  },
});

export default Header;
