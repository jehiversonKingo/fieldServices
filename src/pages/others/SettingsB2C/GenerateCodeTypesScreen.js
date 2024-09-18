import React, { useState, useEffect, useRef } from 'react';
import { View, Text, NativeModules, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import SelectDropdown from 'react-native-select-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../../../components/Layouts/Header';
import { colorsTheme } from '../../../configurations/configStyle';
import jsonSecrets from '../../../services/json/secrets.json';
import specCodePlan from '../../../services/json/specCodePlan.json';
import { getModel, getCodesV5Time, formatCodeKingo } from './utils/GenerateCodes';
import { setCollection } from '../../../services/general.services';

const GenerateCodeTypesScreen = ({ navigation }) => {
    const { KingoModule } = NativeModules;
    const [idKingo, setIdKingo] = useState('');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState('');
    const [textMessage, setTextMessage] = useState('');
    const [selectCountry, setSelectCountry] = useState(''); 
    const [selectTypeCode, setSelectTypeCode] = useState('');
    const [reason, setReason] = useState('');
    const [typeCode, setTypeCode] = useState([]);
    const [error, setError] = useState(false); 
    const dropdownRef = useRef(null); // Create a reference for the dropdown
    const dropdownRef1 = useRef(null); // Create a reference for the dropdown


    const countries = [{ value: 'gtm-pet', label: 'Guatemala' }, { value: 'gtm-col', label: 'Colombia' }];
    
    const handleValidateCodeOffline = async () => {
        try {
            cleanData();
            const model = await getModel(idKingo);
            if (model !== undefined) {
                setError(false);
                const now = new Date();
                const user = JSON.parse(await AsyncStorage.getItem('@user'));
                const { seconds, minutes, hour, day, year } = getCodesV5Time(now);
                console.log("[..........]", selectCountry, model, parseInt(idKingo), seconds, minutes, hour, day, year, selectTypeCode, false);
                const code = await KingoModule.getKingoCodeV5(selectCountry, model, parseInt(idKingo), seconds, minutes, hour, day, year, selectTypeCode, false, jsonSecrets);
                setData({ model, idKingo, user, code });
                await setCollection({
                    "collection":"settingsGenerateCode",
                    "documentRef":`${JSON.parse(code).code}`,
                    "data":{
                        "code": `${JSON.parse(code).code}`,
                        "kingo": idKingo,
                        "reason": reason,
                        "user": user,
                        "createAt": new Date()
                    }
                  });
                  setIdKingo('');
                  setReason('');
                  setSelectCountry('');
                  setSelectTypeCode('');
                  setError(false);
                  setTextMessage('');
                  dropdownRef.current.reset(); // Reset the dropdown to initial state
                  dropdownRef1.current.reset(); // Reset the dropdown to initial state
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
      dropdownRef1.current.reset(); // Reset the dropdown to initial state
      setError(false);
      setTextMessage('');
    }

    const getData = () => {
        const types = Object.keys(specCodePlan.plan).map(key => ({
            label: key,
            value: specCodePlan.plan[key]
        }));
        
        const typesFilters = types.filter(item => !['hour', 'day', 'three_days', 'five_days', 'week', 'fortnight', 'month', 'quarter', 'semester', 'year'].includes(item.label));

        setTypeCode(typesFilters);
        console.log('typeCode:', typesFilters);
        setLoading(false);
    }

    useEffect(() => {
        getData();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colorsTheme.naranja} />
            </View>
        );
    }

    return (
        <View>
            <Header isLeft={true} navigation={navigation} />
            <View style={{ marginHorizontal: 25, marginTop: 25, alignItems: 'center' }}>
                <Text style={styles.colorText}>ID de Kingo</Text>
            </View>
            <View style={{ marginHorizontal: 25 }}>
                <TextInput
                    style={styles.inputForm}
                    value={idKingo}
                    onChangeText={(text) => { setIdKingo(text); }}
                    keyboardType='number-pad'
                />
            </View>
            <View style={{ marginHorizontal: 25, marginTop: 25, alignItems: 'center' }}>
                <Text style={styles.colorText}>Motivo</Text>
            </View>
            <View style={{ marginHorizontal: 25 }}>
                <TextInput
                    style={[styles.inputForm, { textAlign: 'left' }]}
                    value={reason}
                    onChangeText={(text) => { setReason(text); }}
                    numberOfLines={2}
                />
            </View>
            <View style={styles.rowContainer}>
                <View style={styles.dropdownContainer}>
                    <Text style={styles.colorText}>País</Text>
                    <SelectDropdown
                        ref={dropdownRef} // Attach the dropdown to the ref
                        data={countries}
                        onSelect={(selectedItem) => {
                            setSelectCountry(selectedItem.value);
                        }}
                        defaultButtonText={"Seleccione un país"}
                        buttonStyle={styles.dropdownButton}
                        buttonTextStyle={styles.dropdownButtonText}
                        renderDropdownIcon={() => (
                            <FontAwesome5
                                name='chevron-down'
                                size={16}
                                color={colorsTheme.naranja}
                                style={{ marginRight: 5 }}
                            />
                        )}
                        dropdownStyle={styles.dropdownStyle}
                        rowStyle={styles.dropdownRow}
                        rowTextStyle={styles.dropdownRowText}
                        rowTextForSelection={(item) => item.label}
                        buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                    />
                </View>
                <View style={styles.dropdownContainer}>
                    <Text style={styles.colorText}>Tipo</Text>
                    <SelectDropdown
                    ref={dropdownRef1} // Attach the dropdown to the ref
                        data={typeCode}
                        onSelect={(selectedItem) => {
                            setSelectTypeCode(selectedItem.value);
                        }}
                        defaultButtonText={"Seleccione un tipo"}
                        buttonStyle={styles.dropdownButton}
                        buttonTextStyle={styles.dropdownButtonText}
                        renderDropdownIcon={() => (
                            <FontAwesome5
                                name='chevron-down'
                                size={16}
                                color={colorsTheme.naranja}
                                style={{ marginRight: 5 }}
                            />
                        )}
                        dropdownStyle={styles.dropdownStyle}
                        rowStyle={styles.dropdownRow}
                        rowTextStyle={styles.dropdownRowText}
                        rowTextForSelection={(item) => item.label}
                        buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                    />
                </View>
            </View>
            <TouchableOpacity style={{ backgroundColor: colorsTheme.naranja, padding: 15, alignItems: 'center', marginHorizontal: 25 }} onPress={handleValidateCodeOffline}>
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
                        <Text style={{ fontWeight: 'bold', color: colorsTheme.negro }}>Código:</Text>
                        <Text style={{ color: colorsTheme.negro }}>{formatCodeKingo(JSON.parse(data.code).code)}</Text>
                    </View>
                </View>
            )}

            {
              error && (
                <View style={{ backgroundColor: colorsTheme.rojo, margin: 25, padding: 25, justifyContent:'center', alignItems:'center' }}>
                  <Text style={{ color: colorsTheme.blanco }}>{textMessage}</Text>
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
        elevation: 6,
    },
    colorText: {
        color: colorsTheme.naranja,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    inputForm: {
        fontSize: 17,
        color: colorsTheme.negro,
        marginBottom: 10,
        borderColor: colorsTheme.naranja,
        borderWidth:1,
        borderRadius: 10,
        textAlign: "center",
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 25,
        marginVertical: 25
    },
    dropdownContainer: {
        width: '48%',
    },
    dropdownButton: {
        backgroundColor: colorsTheme.blanco,
        borderWidth: 1,
        borderColor: colorsTheme.naranja,
        borderRadius: 8,
        marginTop: 10,
        width: '100%',
    },
    dropdownButtonText: {
        color: colorsTheme.naranja,
    },
    dropdownStyle: {
        backgroundColor: colorsTheme.blanco,
        borderWidth: 1,
        borderColor: colorsTheme.naranja,
        borderRadius: 8,
    },
    dropdownRow: {
        backgroundColor: colorsTheme.blanco,
    },
    dropdownRowText: {
        color: colorsTheme.naranja,
    },
    consultButton: {
        backgroundColor: colorsTheme.naranja,
        padding: 15,
        alignItems: 'center',
        marginHorizontal: 25,
    },
    consultButtonText: {
        color: colorsTheme.blanco,
    },
    clearButton: {
        backgroundColor: colorsTheme.azul,
        padding: 15,
        alignItems: 'center',
        marginHorizontal: 25,
    },
});

export default GenerateCodeTypesScreen;
