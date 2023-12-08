import React from 'react';
import { View, StyleSheet, Text, Image} from 'react-native';
import Logo from '../../../assets/img/Isotipo-Kingo.png';
// import * as Progress from 'react-native-progress';

import {colorsTheme} from '../../configurations/configStyle';

function Loading() {

    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.imgLogo} />
            <Text style={{color:colorsTheme.naranja, fontSize:35, fontWeight:'bold', top:10, marginBottom:35}}>{process.env.REACT_APP_NAME}</Text>
            {/* <Progress.Bar size={30} indeterminate={true} color={colorsTheme.naranja}/> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imgLogo: {
        height: 150,
        width: 140,
      },
});

export default Loading;
