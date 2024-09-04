import React, { useState, useRef } from 'react';
import { View, Text, NativeModules, TouchableOpacity, StyleSheet, TextInput, Dimensions } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import SelectDropdown from 'react-native-select-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../../../components/Layouts/Header';
import { colorsTheme } from '../../../configurations/configStyle';
import jsonSecrets from '../../../services/json/secrets.json';
import { getModel, getCodesV5Time, formatCodeKingo } from './utils/GenerateCodes';
import { setCollection } from '../../../services/general.services';

const { width } = Dimensions.get('window');

const SettingsKingoScreen = ({ navigation }) => {
    const { KingoModule } = NativeModules;
    const [idKingo, setIdKingo] = useState('');
    const [data, setData] = useState('');
    const [textMessage, setTextMessage] = useState('');
    const [selectCountry, setSelectCountry] = useState(''); 
    const [error, setError] = useState(false); 
    const dropdownRef = useRef(null); // Create a reference for the dropdown

    const countries = [{ value: 'gtm-pet', label: 'Guatemala' }, { value: 'gtm-col', label: 'Colombia' }];
    
    const handleGetCode = async () => {
        try {
            cleanData();
            const model = await getModel(idKingo);
            if (model !== undefined) {
                setError(false);
                const now = new Date();
                const user = JSON.parse(await AsyncStorage.getItem('@user'));
                const { seconds, minutes, hour, day, year } = getCodesV5Time(now);
                const codeAdmin = await KingoModule.getKingoCodeV5(selectCountry, model, parseInt(idKingo), seconds, minutes, hour, day, year, 7, false, jsonSecrets);
                const codeHour = await KingoModule.getKingoCodeV5(selectCountry, model, parseInt(idKingo), seconds, minutes, hour, day, year, 10, false, jsonSecrets);
                setData({ model, idKingo, codeAdmin, codeHour });
                await setCollection({
                    "collection":"settingsKingo",
                    "documentRef":`${idKingo}`,
                    "data":{
                        "codeAdmin": `${codeAdmin}`,
                        "codeHour": `${codeHour}`,
                        "kingo": idKingo,
                        "user": user,
                        "createAt": new Date()
                    }
                });
                setIdKingo('');
                setSelectCountry('');
                dropdownRef.current.reset(); // Reset the dropdown to initial state
                setError(false);
            } else {
                setTextMessage("Código Invalido");
                setError(true);
            }
        } catch (error) {
            console.log('[ ERROR CATCH ]', error)
            setTextMessage("Error al validar código");
            setError(true);
        }
    };

    const cleanData = () => {
        setData('');
        setIdKingo('');
        setSelectCountry('');
        dropdownRef.current.reset(); // Reset the dropdown to initial state
        setError(false);
        setTextMessage('');
    }

    return (
        <View>
            <Header isLeft={true} navigation={navigation} />
            <View style={{ marginHorizontal: 25, marginTop: 25, alignItems: 'center' }}>
                <Text style={styles.colorText}>ID de Kingo</Text>
            </View>
            <View style={{ marginHorizontal: 45 }}>
                <TextInput
                    style={styles.inputForm}
                    value={idKingo}
                    onChangeText={(text) => { setIdKingo(text); }}
                    keyboardType='number-pad'
                />
            </View>
            <View style={{ margin: 20, alignItems: 'center' }}>
                <Text style={styles.colorText}>País</Text>
                <SelectDropdown
                    ref={dropdownRef} // Attach the dropdown to the ref
                    data={countries}
                    onSelect={(selectedItem, index) => {
                        setSelectCountry(selectedItem.value);
                    }}
                    defaultButtonText={"Seleccione un país"}
                    buttonStyle={{
                        backgroundColor: colorsTheme.blanco,
                        borderWidth: 1,
                        borderColor: colorsTheme.naranja,
                        borderRadius: 8,
                        marginTop: 10,
                        width: width * 0.8,
                    }}
                    buttonTextStyle={{ color: colorsTheme.naranja }}
                    renderDropdownIcon={() => (
                        <FontAwesome5
                            name='chevron-down'
                            size={16}
                            color={colorsTheme.naranja}
                            style={{ marginRight: 5 }}
                        />
                    )}
                    dropdownStyle={{
                        backgroundColor: colorsTheme.blanco,
                        borderWidth: 1,
                        borderColor: colorsTheme.naranja,
                        borderRadius: 8,
                        marginTop: 10,
                        width: width * 0.8,
                    }}
                    rowStyle={{
                        backgroundColor: colorsTheme.blanco,
                    }}
                    rowTextStyle={{ color: colorsTheme.naranja }}
                    rowTextForSelection={(item, index) => {
                        return item.label;
                    }}
                    buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem.label;
                    }}
                />
            </View>

            <TouchableOpacity style={{ backgroundColor: colorsTheme.naranja, padding: 15, alignItems: 'center', marginHorizontal: 25 }} onPress={handleGetCode}>
                <Text style={{ color: colorsTheme.blanco }}>Consultar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: colorsTheme.azul, padding: 15, alignItems: 'center', marginHorizontal: 25 }} onPress={cleanData}>
                <Text style={{ color: colorsTheme.blanco }}>Limpiar</Text>
            </TouchableOpacity>

            {data !== '' && (
                <View>
                    <View style={{ padding: 5, marginHorizontal: 25, marginTop: 25, alignItems: 'center', borderWidth: 1 }}>
                        <Text style={{ fontWeight: 'bold', color: colorsTheme.negro, fontSize: 18 }}>Información de configuración</Text>
                    </View>
                    <View style={{ flexDirection: 'row', padding: 5, marginHorizontal: 25, justifyContent: 'space-between', borderBottomWidth: 1 }}>
                        <Text style={{ fontWeight: 'bold', color: colorsTheme.negro }}>Kingo:</Text>
                        <Text style={{ color: colorsTheme.negro }}>{data.idKingo}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', padding: 5, marginHorizontal: 25, justifyContent: 'space-between', borderBottomWidth: 1 }}>
                        <Text style={{ fontWeight: 'bold', color: colorsTheme.negro }}>Modelo:</Text>
                        <Text style={{ color: colorsTheme.negro }}>{data.model}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', padding: 5, marginHorizontal: 25, justifyContent: 'space-between', borderBottomWidth: 1 }}>
                        <Text style={{ fontWeight: 'bold', color: colorsTheme.negro }}>Modo Administrador:</Text>
                        <Text style={{ color: colorsTheme.negro }}>{formatCodeKingo(data.codeAdmin)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', padding: 5, marginHorizontal: 25, justifyContent: 'space-between', borderBottomWidth: 1 }}>
                        <Text style={{ fontWeight: 'bold', color: colorsTheme.negro }}>Hora:</Text>
                        <Text style={{ color: colorsTheme.negro }}>{formatCodeKingo(data.codeHour)}</Text>
                    </View>
                </View>
            )}

            {
              error&&(
                <View style={{ backgroundColor: colorsTheme.rojo, margin: 25, padding: 25, justifyContent:'center', alignItems:'center', }}>
                  <Text style={{color:colorsTheme.blanco}}>{textMessage}</Text>
                </View>
              )
            }
        </View>
    );
};

const styles = StyleSheet.create({
    userData: {
        flexDirection: 'row',
        marginBottom: 10,
        backgroundColor: colorsTheme.naranja,
    },
    textInformation: { color: colorsTheme.blanco },
    bottomMenu: {
        flex: 1,
        borderRadius: 10,
        margin: 7,
        borderLeftColor: colorsTheme.naranja60,
        borderLeftWidth: 5,
        backgroundColor: colorsTheme.blanco,
        height: 85,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colorsTheme.gris80,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10,
    },
    bottomMenuText: {
        color: colorsTheme.negro,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colorsTheme.negro,
    },
    colorText: {
        color: colorsTheme.naranja,
        fontWeight: 'bold',
        fontSize: 15,
    },
    inputForm: {
        borderColor: colorsTheme.naranja,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        color: colorsTheme.negro,
        textAlign:"center"
    },
    buttonTouch: {
        width: width * 0.75,
        backgroundColor: colorsTheme.naranja,
        padding: 15,
        alignItems: 'center',
    },
});

export default SettingsKingoScreen;
