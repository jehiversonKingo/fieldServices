import React, { useRef, useContext, useState, useMemo } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PhoneInput from 'react-native-phone-number-input';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FitImage from 'react-native-fit-image';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { handleIsValidUrl, handleCutString } from '../../functions/fncGeneral';

import { hasCameraPermission } from '../../functions/fncCamera';
import { handleGetLocation } from '../../functions/fncLocation';
import { handleChange } from '../../functions/functionChangeValue';
import { handleValidateEmojiAndSpecialCharacter, handleSplitLocation } from '../../functions/fncGeneral';
import { colorsTheme } from '../../configurations/configStyle';

import { Context as AuthContext } from '../../context/AuthContext';
import orderBy from 'lodash/orderBy';

const Inputs = ({
    item,
    index,
    informacion,
    setInformation,
    isFocus,
    setIsAlert,
    setTitleAlert,
    setMessageAlert,
    navigation,
    selectLabel = "label",
    selectValue = "value",
    searchStep = true,
    disable = false,
    editable = true,
    selectData = [],
    bottonSheet,
    evidences,
    setEvidences,
    idTaskSteps,

}) => {

    const { state } = useContext(AuthContext);
    const { inline } = state;
    const { search } = searchStep;
    const { width } = Dimensions.get('screen');
    const [selectOption, setSelectOption] = useState([]);

    const handleClickPhoto = async () => {
        if (editable) {
            const hasPermission = await hasCameraPermission();
            if (hasPermission) {
                navigation.navigate('Camera', { label: item.label, area: 'task', index: index, data: informacion, setData: setInformation });
            }
        }
    };

    const handleClickBarcode = async () => {
        if (editable) {
            const hasPermission = await hasCameraPermission();
            if (hasPermission) {
                navigation.navigate('BarCode', { index: index, data: informacion, setData: setInformation });
            }
        }
    };

    const handleClickLocation = async () => {
        if (editable) {
            if (inline) {
                await handleGetLocation(setInformation, informacion, index, setIsAlert, setTitleAlert, setMessageAlert);
            } else {
                setIsAlert(true);
                setTitleAlert('Error offline');
                setMessageAlert('No se puede obtener localización offline.');
                handleChange(index,
                    {
                        latitude: 0,
                        longitude: 0,
                    },
                    'value',
                    informacion,
                    setInformation);
                setTimeout(() => {
                    setIsAlert(false);
                }, 2000);
            }
        }
    };

    const handleChangeText = async (text) => {
        let flagText = handleValidateEmojiAndSpecialCharacter(text);
        if (flagText) {
            handleChange(index, text, 'value', informacion, setInformation);
        }
    };

    const renderSelectData = () => {
        let arrayData = [];
        console.log("DATA SELECT >>", selectValue);
        if (selectData.length > 0) {
            selectData.forEach(element => {
                arrayData.push({ value: element[selectValue], label: element[selectLabel] })
            });
        }

        return orderBy(arrayData, [selectValue], ['asc']);
    }

    const toggleBottomSheet = () => {
        console.log(bottonSheet.current);
        handleChange(index, 'sync', 'value', informacion, setInformation);
        bottonSheet.current?.expand();
    };

    const toggleCamera = async () => {
        console.log("[FUNCION onClickValidate]");
        const hasPermission = await hasCameraPermission();
        console.log("[IDTASKSTEP]", idTaskSteps);
        if (hasPermission) {
            try {
                navigation.navigate('CameraMultiShot', {
                    setData: setEvidences,
                    data: evidences,
                    idTaskStep: idTaskSteps,
                  });
            } catch (error) {
                console.log("[ERROR] >", error);
            }
        }
    };

    let validType = item?.screenElement?.elementType?.name ? item.screenElement.elementType.name : item?.elementType?.name ? item.elementType.name : item.type;
    switch (validType) {
        case 'photo':
            return (
                <>
                    <View style={{ flexDirection: 'row', marginTop: 10 }} key={`photo-${item.id}`}>
                        <View style={{ width: `${width}` * 0.75, marginRight: 10 }}>
                            <Text style={styles.colorText}>{item.screenElement.label}</Text>
                            <TextInput
                                style={styles.inputForm}
                                value={item.value === '' ? '' : handleCutString(item.value.path ? item.value.path : item.value, '/', true)}
                                editable={false}
                            />
                        </View>
                        <View style={{ width: `${width}` * 0.3, marginTop: 20 }}>
                            <TouchableOpacity onPress={() => { handleClickPhoto(); }}>
                                <Ionicons name={'camera'} color={colorsTheme.naranja} size={40} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View>
                        <FitImage
                            indicator={true}
                            indicatorColor={colorsTheme.naranja}
                            indicatorSize="small"
                            source={{
                                uri:
                                    item.value !== '' ?
                                        handleIsValidUrl(item.value) ?
                                            item.value :
                                            'file://' + item.value.path
                                        : 'https://via.placeholder.com/300',
                            }
                            }
                            style={{ width: 100, height: 100 }}
                        />
                    </View>
                </>
            );
        case 'barcode':
            return (
                <View style={{ flexDirection: 'row' }} key={`barcode-${item.id}`}>
                    <View style={{ width: `${width}` * 0.75, marginRight: 10 }}>
                        <Text style={styles.colorText}>{item?.addon ? item.addon.name : item.screenElement.label}</Text>
                        <TextInput
                            style={styles.inputForm}
                            value={item.value}
                            editable={false}
                        />
                    </View>
                    <View style={{ width: `${width}` * 0.1, marginTop: 20 }}>
                        <TouchableOpacity onPress={() => { handleClickBarcode(); }}>
                            <Ionicons name={'barcode'} color={colorsTheme.naranja} size={40} style={styles.icon} />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        case 'location':
            let location = item.value !== null ? item.value !== '' ? typeof item.value === 'object' ? item.value : handleSplitLocation(item.value) : '' : '';
            return (
                <View style={{ flexDirection: 'row' }} key={`location-${item.id}`}>
                    <View style={{ width: `${width}` * 0.35, marginRight: 10 }}>
                        <Text style={styles.colorText}>{item?.addon ? item.addon.name : item.screenElement.label}</Text>
                        <TextInput
                            style={styles.inputForm}
                            value={typeof location === 'string' ? '' : location.length > 1 ? location[0] : location.latitude.toString()}
                            placeholder={'Latitud'}
                            placeholderTextColor={colorsTheme.gris80}
                            editable={editable}
                        />
                    </View>
                    <View style={{ width: `${width}` * 0.35, marginRight: 10 }}>
                        <Text style={styles.colorText}>{''}</Text>
                        <TextInput
                            style={styles.inputForm}
                            value={typeof location === 'string' ? '' : location.length > 1 ? location[1] : location.longitude.toString()}
                            placeholder={'Longitud'}
                            placeholderTextColor={colorsTheme.gris80}
                            editable={editable}
                        />
                    </View>
                    <View style={{ width: `${width}` * 0.106, marginTop: 20 }}>
                        <TouchableOpacity onPress={() => { handleClickLocation(); }}>
                            <Ionicons name={'location'} color={colorsTheme.naranja} size={40} style={styles.icon} />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        case 'cellphone':
            const phoneInputRef = useRef(null);
            const phoneValue = item.value !== '' && item.value !== null ? item.value.split('+502') : '';
            if (phoneInputRef.current !== null) {
                phoneInputRef.current.state.number =
                    item.value !== '' && item.value !== null
                        ? phoneValue[1] : '';
            }
            return (
                <View key={`cellphone-${item.id}`}>
                    <Text style={styles.colorText}>{item?.addon ? item.addon.name : item.screenElement.label}</Text>
                    <PhoneInput
                        ref={phoneInputRef}
                        defaultCode="GT"
                        layout="first"
                        placeholderTextColor={colorsTheme.gris80}
                        withShadow={false}
                        value={phoneValue[1]}
                        onChangeFormattedText={(text) => {
                            handleChange(index, ` ${text}`, 'value', informacion, setInformation);
                        }}
                        containerStyle={{ width: 380, borderRadius: 18, marginTop: 10, height: 75 }}
                        countryPickerButtonStyle={{ color: colorsTheme.gris80 }}
                        placeholder="Número de celular"
                        disabled={!editable}
                    />
                </View>
            );
        case 'text':
            return (
                <View key={`text-${item.id}`}>
                    <Text style={styles.colorText}>{item?.addon ? item.addon.name : item.screenElement.label}</Text>
                    <TextInput
                        style={styles.inputForm}
                        onChangeText={handleChangeText}
                        value={item.value}
                        editable={editable}
                    />
                </View>
            );
        case 'selects':
            return (
                <View key={`selects-${item.id}`}>
                    {console.log("SCREEN ELEMENT", item)}
                    <Text style={styles.colorText}>{item?.addon ? item.addon.name : (item.screenElement?.label ?? item.label)}</Text>
                    <Dropdown
                        style={[styles.dropdown, isFocus && { borderColor: colorsTheme.naranja }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        itemTextStyle={{ color: colorsTheme.gris80 }}
                        iconStyle={styles.iconStyle}
                        data={renderSelectData()}
                        search={true}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        value={item.value}
                        placeholder={!isFocus ? 'Selecciona una opción' : '...'}
                        searchPlaceholder="Buscar..."
                        disable={disable}
                        onChange={valueChange => {
                            handleChange(index, valueChange.value, 'value', informacion, setInformation);
                        }}
                        renderLeftIcon={() => (
                            <AntDesign
                                style={styles.icon}
                                color={isFocus ? colorsTheme.naranja : colorsTheme.gris80}
                                name="Safety"
                                size={20}
                            />
                        )}
                    />
                </View>
            );
        case 'handshake':
            return (
                <>
                    <TouchableOpacity onPress={toggleBottomSheet} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                            style={{ ...styles.inputForm, flex: 1 }}
                            value={'Configurar Tendero'}
                            editable={false}
                        />
                        <TouchableOpacity onPress={toggleCamera}>
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name={'camera'} color={colorsTheme.naranja} size={40} style={styles.icon} />
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>

                </>
            )
    }
};

const styles = StyleSheet.create({
    icon: {
        color: colorsTheme.naranja,
        marginRight: 5,
    },
    colorText: {
        color: colorsTheme.gris80,
    },
    inputForm: {
        fontSize: 17,
        color: colorsTheme.negro,
        marginBottom: 10,
        backgroundColor: colorsTheme.gris20,
        borderRadius: 10,
    },

    dropdown: {
        height: 50,
        backgroundColor: colorsTheme.blanco,
        borderColor: colorsTheme.blanco,
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    label: {
        color: colorsTheme.gris80,
    },
    placeholderStyle: {
        fontSize: 16,
        color: colorsTheme.gris80,
    },
    selectedTextStyle: {
        color: colorsTheme.gris80,
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        color: colorsTheme.gris80,
        height: 40,
        fontSize: 16,
    },
    textItem: {
        color: colorsTheme.gris80,
    },
});

export default Inputs;
