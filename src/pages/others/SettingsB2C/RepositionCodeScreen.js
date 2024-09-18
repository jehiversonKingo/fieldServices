import React, { useState, useRef } from 'react';
import { View, Text, NativeModules, TouchableOpacity, StyleSheet, TextInput, Dimensions } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import SelectDropdown from 'react-native-select-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';

import specCodePlanJson from './utils/json/specCodePlan.json';
import Header from '../../../components/Layouts/Header';
import { colorsTheme } from '../../../configurations/configStyle';
import jsonSecrets from '../../../services/json/secrets.json';
import { getModel, getCodesV5Time, formatCodeKingo } from './utils/GenerateCodes';
import { setCollection } from '../../../services/general.services';

const { width } = Dimensions.get('window');

const RepositionCodeScreen = ({ navigation }) => {
    const { KingoModule } = NativeModules;
    const [idKingo, setIdKingo] = useState('');
    const [reason, setReason] = useState('');
    const [data, setData] = useState('');
    const [textMessage, setTextMessage] = useState('');
    const [selectCountry, setSelectCountry] = useState(''); 
    const [selectPlan, setSelectPlan] = useState(''); 
    const [error, setError] = useState(false); 
    const dropdownRef = useRef(null); // Create a reference for the dropdown
    const dropdownRef1 = useRef(null); // Create a reference for the dropdown

    const countries = [{ value: 'gtm-pet', label: 'Guatemala' }, { value: 'col-lag', label: 'Colombia' }];
    const plans = [{value: 'day', label:'Dia'}, {value: 'week', label:'Semana'}, {value: 'month', label:'Mes'}, {value: 'quarter', label:'Trimestre'}, {value: 'semester', label:'Semestre'}, {value: 'year', label:'Año'}]
    
    const handleGenerateCode = async () => {
        try {
            cleanData();
            const model = await getModel(idKingo);
            if (model !== undefined) {
                setError(false);
                const now = new Date();
                const planCode = specCodePlanJson.plan[selectPlan];
                const user = JSON.parse(await AsyncStorage.getItem('@user'));
                const { seconds, minutes, hour, day, year } = getCodesV5Time(now);
                const code = await KingoModule.getKingoCodeV5(selectCountry, model, parseInt(idKingo), seconds, minutes, hour, day, year, planCode, false, jsonSecrets);
                console.log("[COOOODE]", code)
                setData({ model, idKingo, code });
                await setCollection({
                  "collection":"repositionGenerateCodeKingo",
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
                  setSelectPlan('');
                  dropdownRef.current.reset();
                  dropdownRef1.current.reset();
                  setError(false);
                  setTextMessage('');
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
      setReason('');
      dropdownRef.current.reset();
      dropdownRef1.current.reset();
      setSelectCountry('');
      setSelectPlan('');
      setError(false);
      setTextMessage('');
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
                    placeholder={'ID Kingo'}
                    keyboardType='number-pad'
                />
            </View>
            <View style={{ marginHorizontal: 25, marginTop: 25, alignItems: 'center' }}>
                <Text style={styles.colorText}>Motivo</Text>
            </View>
            <View style={{ marginHorizontal: 25 }}>
                <TextInput
                    style={[styles.inputForm, { textAlign: 'center' }]}
                    value={reason}
                    onChangeText={(text) => { setReason(text); }}
                    numberOfLines={2}
                />
            </View>
            {/* Contenedor que agrupa País y Plan en una sola línea */}
            <View style={styles.rowContainer}>
                <View style={styles.dropdownContainer}>
                    <Text style={styles.colorText}>País</Text>
                    <SelectDropdown
                        ref={dropdownRef1}
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
                    <Text style={styles.colorText}>Plan</Text>
                    <SelectDropdown
                        ref={dropdownRef}
                        data={plans}
                        onSelect={(selectedItem) => {
                            setSelectPlan(selectedItem.value);
                        }}
                        defaultButtonText={"Seleccione un plan"}
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
            <TouchableOpacity style={styles.consultButton} onPress={handleGenerateCode}>
                <Text style={styles.consultButtonText}>Consultar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={cleanData}>
                <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>

            {data !== '' && (
                <View>
                    <View style={styles.infoTitleContainer}>
                        <Text style={styles.infoTitle}>Información de código</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Kingo:</Text>
                        <Text style={styles.infoText}>{data.idKingo}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Modelo:</Text>
                        <Text style={styles.infoText}>{data.model}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Código:</Text>
                        <Text style={styles.infoText}>{formatCodeKingo(JSON.parse(data.code).code)}</Text>
                    </View>
                </View>
            )}

            {
                error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{textMessage}</Text>
                    </View>
                )
            }
        </View>
    );
};

const styles = StyleSheet.create({
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
    clearButtonText: {
        color: colorsTheme.blanco,
    },
    infoTitleContainer: {
        padding: 5,
        marginHorizontal: 25,
        marginTop: 25,
        alignItems: 'center',
        borderWidth: 1,
    },
    infoTitle: {
        fontWeight: 'bold',
        color: colorsTheme.negro,
        fontSize: 18,
    },
    infoRow: {
        flexDirection: 'row',
        padding: 5,
        marginHorizontal: 25,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1
    },
    infoLabel: {
        fontWeight: 'bold',
        color: colorsTheme.negro,
        fontSize: 15,
    },
    infoText: {
        color: colorsTheme.negro,
        fontSize: 15,
    },
    errorContainer: {
        backgroundColor: colorsTheme.rojo,
        marginHorizontal: 25,
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    errorText: {
        color: colorsTheme.blanco,
        textAlign: 'center',
    },
    colorText: {
        color: colorsTheme.naranja,
        fontWeight: 'bold',
    },
    inputForm: {
        backgroundColor: colorsTheme.blanco,
        padding: 10,
        borderWidth: 1,
        borderColor: colorsTheme.naranja,
        borderRadius: 8,
        color:'black',
        textAlign:'center'
    },
});

export default RepositionCodeScreen;
