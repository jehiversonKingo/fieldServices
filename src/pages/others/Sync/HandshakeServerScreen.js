import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    NativeEventEmitter,
    NativeModules,
    PermissionsAndroid,
    Platform,
    Alert,
} from 'react-native';
import Timeline from 'react-native-timeline-flatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AwesomeAlert from 'react-native-awesome-alerts';
import { ActivityIndicator } from 'react-native-paper';
import moment from 'moment';
import uuid from 'react-native-uuid';

import { colorsTheme } from '../../../configurations/configStyle';
import Header from '../../../components/Layouts/Header';
import { getStep, updateStep } from '../../../functions/fncSqlite';
import { findInArray, findIndexArray } from '../../../functions/fncGeneral';
import ButtonProgressStep from '../../../components/General/ButtonProgressStep';

const eventEmitter = new NativeEventEmitter(NativeModules.ServerSocketModule);
const { ServerSocketModule, BluetoothServerModule } = NativeModules;
const HandshakeServerScreen = ({
    navigation,
    route,
    header = true,
    description = '',
    typeScreen = 'handshake',
    nextStep,
    previousStep
}) => {
    const [receivedData, setReceivedData] = useState([]);
    const [statusServer, setStatusServer] = useState('El servidor esta apagado');
    const [statusServerColor, setStatusServerColor] = useState(colorsTheme.rojo);
    const [showAlertBluetooth, setShowAlertBluetooth] = useState(false);
    const [showMessageAlert, setShowMessageAlert] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [messageAlert, setMessageAlert] = useState('');
    const [titleAlert, setTitleAlert] = useState('');
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState(0);
    const [type, setType] = useState(1);
    const [debt, setDebt] = useState(1);
    const [dataCustomer, setDataCustomer] = useState({});
    const [disabledButton, setDisableButton] = useState(true);

    const handleSaveCustomerData = async data => {
        try {
            let userData = await AsyncStorage.getItem('@user');
            let getWalletCustomers = await getStep('customersOfflineData', 0, 0);
            console.log('[-0-]', getWalletCustomers);
            getWalletCustomers =
                getWalletCustomers.length > 1 ? JSON.parse(getWalletCustomers) : [];
            console.log('[-1-]', data);
            let existData = [];
            let message = '';
            for (let lotGive of data.lots) {
                let validUid = await findInArray(
                    getWalletCustomers.customers,
                    'uid',
                    lotGive.data.uid,
                );
                console.log('AQUI PASE ', lotGive.data);

                console.log(
                    'DATOS VALIDOS ========',
                    validUid,
                    lotGive.uid,
                    lotGive.data.uid,
                );
                if (validUid === undefined) {
                    console.log(
                        'HER DATA=======',
                        getWalletCustomers,
                        getWalletCustomers?.customers.length,
                    );
                    if (getWalletCustomers?.customers.length > 0) {
                        console.log('(1)');
                        getWalletCustomers.customers.push(lotGive.data);
                    } else {
                        console.log('(2)');
                        getWalletCustomers = { customers: [lotGive.data] };
                        console.log(getWalletCustomers);
                    }
                    console.log('getWalletCustomers DATOS GUARDADOS', getWalletCustomers);

                    let responseSave = await updateStep(
                        'customersOfflineData',
                        0,
                        JSON.stringify(getWalletCustomers),
                        0,
                    );
                    console.log('Datos recividos', responseSave);
                } else {
                    existData.push(validUid.uid);
                    console.log('YA EXISTE ', validUid.uid);
                }
            }

            console.log('_+_+_+_+_+_+_+_+_+_ ', data.deleteLots);
            if (data?.deleteLots) {
                let dataUploads = JSON.parse(await getStep('uploadLots', 0, 0));
                dataUploads = typeof dataUploads !== 'string' ? dataUploads : [];
                for (let deleteLots of data.deleteLots) {
                    console.log('--1--', dataUploads, typeof dataUploads);
                    if (dataUploads.length > 0) {
                        let indexUploads = await findIndexArray(
                            dataUploads,
                            'uid',
                            deleteLots.uid,
                        );
                        console.log('INDEX', indexUploads);
                        console.log('Element to remove:', dataUploads[indexUploads]);
                        dataUploads.splice(indexUploads, 1);
                        console.log('NEW DATA OFFLINE', dataUploads);
                    }
                }

                await updateStep('uploadLots', 0, JSON.stringify(dataUploads), 0);
            }

            if (existData.length > 0) {
                message = 'Datos de lotes repetidos';
            }

            setTitleAlert('¡Atencón!');
            setMessageAlert('Datos guardados con éxito.');
            setType(2);
            setShowMessageAlert(true);

            return {
                status: true,
                idUser: JSON.parse(userData).idUser,
                time: moment().format('YYYY-MM-DD HH:MM:ss'),
                message,
                repeat: existData,
                lots: getWalletCustomers,
            };
        } catch (error) {
            let userData = await AsyncStorage.getItem('@user');
            console.log('<ERRORRR1>', error);
            setTitleAlert('¡Atencón!');
            setMessageAlert('Error al intentar guardar los datos');
            setShowMessageAlert(true);
            return {
                status: false,
                uid: data[0].data.uid,
                idUser: JSON.parse(userData).idUser,
            };
        }
    };

    const handleReceivedData = async event => {
        console.log('[.........]', event.data);
        try {
            const { action, data } = JSON.parse(event.data);
            let sendResponse = 'NULL RESPONSE';
            // setReceivedData((prevReceivedData) => [...prevReceivedData, event]);
            console.log('[SI PASE AQUI **]', action, data);
            switch (action) {
                case 'AGENT_DATA':
                    console.log('How many times i sent this');
                    setReceivedData(prevReceivedData => [
                        ...prevReceivedData,
                        {
                            time: moment().format('DD/MM HH:MM:ss'),
                            title: action,
                            description: 'TENDERO CONECTADO',
                        },
                    ]);
                    let userData = await AsyncStorage.getItem('@user');
                    let dataLot = await getStep('uploadLots', 0, 0);
                    console.log('SEND THIS ====>', dataLot);
                    sendResponse = { data: userData, lots: dataLot ? dataLot : [], action };
                    console.log('RESPONSE >>', sendResponse);
                    BluetoothServerModule.sendJsonToClient(sendResponse);
                    break;
                case 'VALIDATE_PAYMENT':
                    if (data !== null) {
                        // Obtener datos del usuario desde AsyncStorage
                        const userDataString = await AsyncStorage.getItem('@user');
                        const userData = JSON.parse(userDataString);
                        console.log(
                            '[----1-----]]]]]]]]',
                            userData.user,
                            userData,
                            typeof userData,
                        );
                        setDataCustomer(data.customer);

                        // Obtener datos de la billetera del usuario
                        const walletUserString = await getStep('walletUser', 0, 0);
                        console.log('[----2-----]]]]]]]]', walletUserString);
                        if (JSON.parse(walletUserString)?.idWalletUser) {
                            const walletUser = JSON.parse(walletUserString);
    
                            // Calcular el límite de crédito disponible
                            const creditLimit = (
                                parseFloat(walletUser.wallet.creditLimit) +
                                parseFloat(walletUser.wallet.additionalFinancing) -
                                (parseFloat(walletUser.wallet.debt) + parseFloat(data.amount))
                            ).toFixed(2);
    
                            console.log(
                                '{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{',
                                parseFloat(walletUser.wallet.creditLimit),
                                parseFloat(walletUser.wallet.additionalFinancing),
                                parseFloat(walletUser.wallet.debt) + parseFloat(data.amount),
                            );
                            // Actualizar la deuda del usuario
                            const updatedDebt = (
                                parseFloat(walletUser.wallet.debt) + parseFloat(data.amount)
                            ).toFixed(2);
                            setDebt(updatedDebt);
    
                            // Marcar el inicio de la carga
                            setLoading(true);
    
                            // Mostrar información en consola
                            console.log(
                                'WALLET',
                                parseFloat(walletUser.wallet.creditLimit),
                                parseFloat(walletUser.wallet.additionalFinancing),
                                'PAY++++++++++',
                                updatedDebt,
                            );
                            if (creditLimit >= 0) {
                                setLoading(false);
                                setReceivedData(prevReceivedData => [
                                    ...prevReceivedData,
                                    {
                                        time: moment().format('DD/MM HH:MM:ss'),
                                        title: action,
                                        description: `${data.customer.name
                                            } - Envío un pago de Q ${parseFloat(data.amount).toFixed(2)}`,
                                    },
                                ]);
                                setAmount(data.amount);
                                setTitleAlert(`${data.customer.name}`);
                                setMessageAlert(`¿Pago Q ${parseFloat(data.amount).toFixed(2)}?`);
                                setShowAlert(true);
                                setType(1);
                            } else {
                                setLoading(false);
                                setTitleAlert(`Cantidad no soportada`);
                                setMessageAlert(
                                    `No cuenta con el saldo disponible en su wallet faltan Q${creditLimit * -1
                                    }`,
                                );
                                setShowMessageAlert(true);
                            }
                        } else {
                            setTitleAlert('¡Atencón!');
                            setMessageAlert('Debes cargar datos para realizar handshake');
                            setShowMessageAlert(true);
                        }
                    } else {
                        setReceivedData(prevReceivedData => [
                            ...prevReceivedData,
                            {
                                time: moment().format('DD/MM HH:MM:ss'),
                                title: action,
                                description: 'El tendero no envío la información del pago',
                            },
                        ]);
                    }
                    break;
                case 'CUSTOMER_SENT_OFFLINE_DATA':
                    console.log('ACCCCCTIONNNNNNN', data);
                    if (data !== null) {
                        setReceivedData(prevReceivedData => [
                            ...prevReceivedData,
                            {
                                time: moment().format('DD/MM HH:MM:ss'),
                                title: action,
                                description: 'Se recibio un lote de data del tendero',
                            },
                        ]);
                        let saveData = await handleSaveCustomerData(data);
                        console.log('saveData=====1====', saveData);
                        sendResponse = { data: saveData, action };
                        console.log('RESPONSE >>', sendResponse);
                        BluetoothServerModule.sendJsonToClient(sendResponse);
                    } else {
                        setTitleAlert('¡Atencón!');
                        setMessageAlert('La sulicitud no posee datos.');
                        setShowMessageAlert(true);
                    }
                    break;
                default:
                    BluetoothServerModule.sendDataToClient('NO ENTIENDO QUE NECESITAS');
                    break;
            }
        } catch (error) {
            console.log('[*-0-*]', error);
            return;
        }
    };

    const handleConfirmAmount = async () => {
        try {
            console.log('[TIPO]', type);
            let sendResponse = '';
            switch (type) {
                case 1:
                    sendResponse = JSON.stringify({
                        action: 'VALIDATE_PAYMENT',
                        data: { status: 'OK', message: 'El pago fue recibido', amount },
                    });
                    BluetoothServerModule.sendDataToClient(sendResponse);
                    setReceivedData(prevReceivedData => [
                        ...prevReceivedData,
                        {
                            time: moment().format('HH:MM'),
                            title: 'RECEIVED_PAYMENT',
                            description: 'El pago fue recibido',
                        },
                    ]);
                    let walletUser = JSON.parse(await getStep('walletUser', 0, 0));
                    let debtUser = JSON.parse(await getStep('debtUser', 0, 0));
                    walletUser.wallet.debt = debt;
                    debtUser.amount = debt;

                    console.log('THISISMY NEWDEVT ==>', walletUser);
                    console.log('THISISMY NEWDEVT <==', debtUser);
                    setDisableButton(false)
                    await updateStep('walletUser', 0, JSON.stringify(walletUser), 0);
                    await updateStep('debtUser', 0, JSON.stringify(debtUser), 0);
                    break;
                case 2:
                    setReceivedData(prevReceivedData => [
                        ...prevReceivedData,
                        {
                            time: moment().format('HH:MM'),
                            title: 'RECEIVED_DATA_CUSTOMER',
                            description: 'Datos guardados con éxito',
                        },
                    ]);
                    break;
            }
            setShowAlert(false);
        } catch (error) {
            console.log('[ handleConfirmAmount ERROR ]', error);
        }
    };

    const handleCancelAmount = async () => {
        try {
            switch (type) {
                case 1:
                    let sendResponse = JSON.stringify({
                        action: 'VALIDATE_PAYMENT',
                        data: {
                            status: 'REFUSED',
                            message: 'El pago fue rechazado por el agente',
                        },
                    });
                    BluetoothServerModule.sendDataToClient(sendResponse);
                    setReceivedData(prevReceivedData => [
                        ...prevReceivedData,
                        {
                            time: moment().format('HH:MM'),
                            title: 'REFUSED_PAYMENT',
                            description: 'El pago fue rechazado por el agente',
                        },
                    ]);
                    break;
                case 2:
                    setReceivedData(prevReceivedData => [
                        ...prevReceivedData,
                        {
                            time: moment().format('HH:MM'),
                            title: 'RECEIVED_DATA_CUSTOMER',
                            description: 'Datos guardados con éxito',
                        },
                    ]);
                    break;
            }
            setShowAlert(false);
        } catch (error) {
            console.log('[ handleCancelAmount ERROR ]', error);
        }
    };

    const requestAllPermissions = async () => {
        try {
            let allPerssions = true;
            console.log('{ VERISON APP } ===> ', Platform.Version);
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);
            for (const permission in granted) {
                if (granted[permission] === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log(`${permission} permission granted`);
                    allPerssions = true;
                } else if (
                    Platform.Version > 30 &&
                    (granted[permission] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
                        granted[permission] === PermissionsAndroid.RESULTS.DENIED)
                ) {
                    console.log(
                        `${permission} permission denied Or denied with NEVER ASK AGAIN`,
                    );
                    allPerssions = false;
                    setTitleAlert('Atención');
                    setMessageAlert('Debes aceptar todos los permisos');
                    setShowAlertBluetooth(true);
                    setTimeout(() => {
                        setShowAlertBluetooth(false);
                        navigation.goBack();
                    }, 1500);
                    break;
                } else if (
                    Platform.Version <= 30 &&
                    granted[permission] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
                ) {
                    console.log(`${permission} permission unsupported`);
                }
            }
            return allPerssions;
        } catch (err) {
            console.error('{ PERMISSION ERROR } => ', err);
            setTitleAlert('Acepta los permisos');
            setMessageAlert('Debes aceptar todos los permisos');
            setShowAlertBluetooth(true);
            setTimeout(() => {
                setShowAlertBluetooth(false);
                navigation.goBack();
            }, 1500);
            return false;
        }
    };

    useEffect(() => {
        requestAllPermissions()
            .then(res => {
                if (res) {
                    BluetoothServerModule.startServer()
                        .then(result => {
                            console.log('Servidor iniciado', result);
                            setStatusServer('Servidor iniciado');
                            setStatusServerColor(colorsTheme.verdeClaro);
                            setLoading(false);
                        })
                        .catch(error => {
                            setStatusServer('Servidor apagado');
                            setStatusServerColor(colorsTheme.rojo);
                            console.error('Error al iniciar el servidor', error);
                        });
                } else {
                    setTitleAlert('Atención');
                    setMessageAlert('Debes aceptar todos los permisos');
                    setShowAlertBluetooth(true);
                    setTimeout(() => {
                        setShowAlertBluetooth(false);
                        navigation.goBack();
                    }, 3000);
                }
            })
            .catch(error => console.log(error));

        const dataReceivedListener = eventEmitter.addListener(
            'DATA_SERVER_RECEIVED',
            event => {
                console.log('[ BLUETOOTH DATA 1] =>', event);
                handleReceivedData(event);
            },
        );

        return () => {
            // Cuando se desmonta el componente, detener el servidor y eliminar el suscriptor del evento
            BluetoothServerModule.stopServer()
                .then(res => {
                    console.log('Servidor detenido', res);
                    setStatusServer('Servidor detenido');
                    setStatusServerColor(colorsTheme.naranja60);
                })
                .catch(error => console.error('Error al detener el servidor', error));
            dataReceivedListener.remove();
            // dataBlueReceivedListener.remove();
        };
    }, []);

    return (
        <>
            {header && <Header isLeft={true} navigation={navigation} title={'Handshake'} />}
            <View style={{ flex: 1, backgroundColor: colorsTheme.blanco }}>
                <Text
                    style={{
                        color: colorsTheme.negro,
                        fontWeight: '700',
                        fontSize: 20,
                        textAlign: 'center',
                    }}>
                    HANDSHAKE AGENTE
                </Text>
                <Text
                    style={{
                        color: colorsTheme.gris60,
                        fontSize: 18,
                        textAlign: 'center',
                    }}>
                    <FontAwesome5
                        name={'dot-circle'}
                        color={statusServerColor}
                        size={18}
                    />{' '}
                    {statusServer}
                </Text>
                <Text style={{
                    color: colorsTheme.gris60,
                    fontSize: 14,
                    textAlign: 'center',
                }}>{description}</Text>
                {loading && (
                    <View
                        style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <ActivityIndicator size="large" color={colorsTheme.naranja} />
                    </View>
                )}
                {/* {
                    receivedData.length > 0 && (
                        receivedData.map((item, index) => renderEvent(JSON.parse(item.data), index))
                    )
                } */}
                {receivedData.length > 0 && (
                    <Timeline
                        data={receivedData}
                        titleStyle={{ color: colorsTheme.negro }}
                        descriptionStyle={{ color: colorsTheme.gris }}
                        lineColor={colorsTheme.naranja40}
                        circleColor={colorsTheme.naranja80}
                    />
                )}
                {console.log('[---------------------/ [ TYPESREEN ] /----------------------]', typeScreen)}
                {['task', 'taskSync'].includes(typeScreen) && (
                    <View style={{height: 100, flexDirection: 'row', marginTop: 15}}>
                        <ButtonProgressStep
                            text="Anterior"
                            type={'left'}
                            onPress={() =>{
                                previousStep()
                                setReceivedData([])
                            }}
                        />
                        <ButtonProgressStep
                            text="Siguiente"
                            type={'right'}
                            disabled={disabledButton && typeScreen == 'task'}
                            onPress={() =>{
                                nextStep()
                                setReceivedData([])
                                setDisableButton(true)
                            }}
                        />
                    </View>
                )}
            </View>
            <AwesomeAlert
                show={showAlert}
                title={titleAlert}
                message={messageAlert}
                closeOnTouchOutside={false}
                closeOnHardwareBackPress={false}
                showCancelButton={true}
                showConfirmButton={true}
                confirmText="Sí"
                cancelText="No"
                confirmButtonStyle={{ width: 100, alignItems: 'center' }}
                cancelButtonStyle={{ width: 100, alignItems: 'center' }}
                confirmButtonColor={colorsTheme.verdeClaro}
                cancelButtonColor={colorsTheme.rojo}
                onConfirmPressed={handleConfirmAmount}
                onCancelPressed={handleCancelAmount}
            />
            <AwesomeAlert
                show={showMessageAlert}
                title={titleAlert}
                message={messageAlert}
                closeOnTouchOutside={false}
                closeOnHardwareBackPress={false}
                showConfirmButton={true}
                confirmButtonColor={colorsTheme.verdeClaro}
                confirmButtonStyle={{ width: 100, alignItems: 'center' }}
                confirmText="Ok"
                onConfirmPressed={() => setShowMessageAlert(!showMessageAlert)}
            />
            <AwesomeAlert
                show={showAlertBluetooth}
                title={titleAlert}
                message={messageAlert}
                closeOnTouchOutside={false}
                closeOnHardwareBackPress={false}
            />
        </>
    );
};

export default HandshakeServerScreen;
