import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    NativeEventEmitter,
    NativeModules,
    PermissionsAndroid,
} from 'react-native';

import {colorsTheme} from '../../../configurations/configStyle';
import Header from '../../../components/Layouts/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AwesomeAlert from 'react-native-awesome-alerts';
import { ActivityIndicator } from 'react-native-paper';
import Timeline from 'react-native-timeline-flatlist';
import moment from 'moment';

const eventEmitter = new NativeEventEmitter(NativeModules.ServerSocketModule);
const {ServerSocketModule, BluetoothServerModule} = NativeModules;
const HandshakeServerScreen = ({navigation, route}) => {
    const [receivedData, setReceivedData] = useState([]);
    const [statusServer, setStatusServer] = useState('El servidor esta apagado');
    const [statusServerColor, setStatusServerColor] = useState(colorsTheme.rojo);
    const [showAlertBluetooth, setShowAlertBluetooth] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [messageAlert, setMessageAlert] = useState('');
    const [titleAlert, setTitleAlert] = useState('');
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState(0);

    const handleSaveCustomerData = async (event) => {
        try {
            const {idCustomer, lots} = event;
            const arrayLots = [];
            if (lots.length > 0) {
                // for (let i = 0; i < lots.length; i++) {
                //     const lote = lots[i];
                //     arrayLots.push({
                //     })
                // }
            } else {
                setTitleAlert('¡Atencón!')
                setMessageAlert('No se encontró ningun lote de datos')
                setShowAlert(true)
            }
        } catch (error) {
            console.log(error);
        }
    }
    const handleReceivedData = async (event) => {
        const {action, data} = JSON.parse(event.data)
        let sendResponse = "NULL RESPONSE"
        console.log(action, data)
        // setReceivedData((prevReceivedData) => [...prevReceivedData, event]);
        switch (action) {
            case 'AGENT_DATA':
                setReceivedData((prevReceivedData) => [...prevReceivedData, {time: moment().format("DD/MM HH:MM:ss"), title: action, description: "TENDERO CONECTADO"}]);
                let userData = await AsyncStorage.getItem("@user");
                sendResponse = JSON.stringify({data: userData, action})
                console.log("RESPONSE >>", sendResponse)
                // ServerSocketModule.sendDataToClient(sendResponse);
                BluetoothServerModule.sendDataToClient(sendResponse);
                break;
            case 'VALIDATE_PAYMENT':
                if (data !== null) {
                    setReceivedData((prevReceivedData) => [...prevReceivedData, {time: moment().format("DD/MM HH:MM:ss"), title: action, description:`${data.customer.name} - Envío un pago de Q ${parseFloat(data.amount).toFixed(2)}`}]);
                    setLoading(true)
                    setLoading(false)
                    setAmount(data.amount)
                    setTitleAlert(`${data.customer.name}`)
                    setMessageAlert(`¿Pago Q ${parseFloat(data.amount).toFixed(2)}?`)
                    setShowAlert(true)
                } else {
                    setReceivedData((prevReceivedData) => [...prevReceivedData, {time: moment().format("DD/MM HH:MM:ss"), title: action, description: "El tendero no envío la información del pago"}]);
                }
                break;
            case 'CUSTOMER_SEND_OFFLINE_DATA':
                if (data !== null) {
                    setReceivedData((prevReceivedData) => [...prevReceivedData, {time: moment().format("DD/MM HH:MM:ss"), title: action, description: "Se recibio un lote de data del tendero"}]);
                    let userData = await AsyncStorage.getItem("@user");
                    let dataResponse = {
                        agent: userData,
                        totalData: typeof data === "object" ? data.length : 0,
                    }

                    await handleSaveCustomerData(data);

                    sendResponse = JSON.stringify({data: dataResponse, action})
                    console.log("RESPONSE >>", sendResponse)
                    BluetoothServerModule.sendDataToClient(sendResponse);
                } else {
                    setTitleAlert('¡Atencón!')
                    setMessageAlert('La sulicitud no posee datos.')
                    setShowAlert(true)
                }
                break;
            default:
                BluetoothServerModule.sendDataToClient("NO ENTIENDO QUE NECESITAS");
                break;
        }
    }

    const handleConfirmAmount = async () => {
        try {
            setShowAlert(false)
            let sendResponse = JSON.stringify({action: "VALIDATE_PAYMENT", data: {status: "OK", message: "El pago fue recibido", amount}})
            BluetoothServerModule.sendDataToClient(sendResponse);
            setReceivedData((prevReceivedData) => [...prevReceivedData, {time: moment().format("HH:MM"), title: "RECEIVED_PAYMENT", description: "El pago fue recibido"}]);
        } catch (error) {
            console.log("[ handleConfirmAmount ERROR ]", error)
        }
    }

    const handleCancelAmount = async () => {
        try {
            setShowAlert(false)
            let sendResponse = JSON.stringify({action: "VALIDATE_PAYMENT", data: {status: "REFUSED", message: "El pago fue rechazado por el agente"}})
            // let sendLocalResponse = {"data": JSON.stringify({action: "REFUSED_PAYMENT", data: {status: "REFUSED", message: "El pago fue rechazado por el agente"}})}
            BluetoothServerModule.sendDataToClient(sendResponse);
            setReceivedData((prevReceivedData) => [...prevReceivedData, {time: moment().format("HH:MM"), title: "REFUSED_PAYMENT", description: "El pago fue rechazado por el agente"}]);
            // setReceivedData((prevReceivedData) => [...prevReceivedData, sendLocalResponse]);
        } catch (error) {
            console.log("[ handleCancelAmount ERROR ]", error)
        }
    }

    const requestAllPermissions = async () => {
        try {
            let allPerssions = true;
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);
            for (const permission in granted) {
                if (granted[permission] === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log(`${permission} permission granted`);
                    allPerssions = true;
                } else {
                    console.log(`${permission} permission denied`);
                    allPerssions = false;
                    setTitleAlert("Atención")
                    setMessageAlert("Debes aceptar todos los permisos")
                    setShowAlertBluetooth(true)
                    setTimeout(() => {
                        setShowAlertBluetooth(false);
                        navigation.goBack();
                    }, 1500)
                    break;
                }
            }
            return allPerssions;
        } catch (err) {
            console.error("{ PERMISSION ERROR } => ", err);
            setTitleAlert("Acepta los permisos")
            setMessageAlert("Debes aceptar todos los permisos")
            setShowAlertBluetooth(true)
            setTimeout(() => {
                setShowAlertBluetooth(false);
                navigation.goBack();
            }, 1500)
            return false;

        }
    };

    useEffect(() => {
        requestAllPermissions()
            .then((res) => {
                if (res) {
                    BluetoothServerModule.startServer()
                    .then(result => {
                        console.log('Servidor iniciado', result)
                        setStatusServer('Servidor iniciado')
                        setStatusServerColor(colorsTheme.verdeClaro)
                        setLoading(false)
                    })
                    .catch(error => {
                        setStatusServer('Servidor apagado')
                        setStatusServerColor(colorsTheme.rojo)
                        console.error('Error al iniciar el servidor', error)
                    });
                } else {
                    setTitleAlert("Atención")
                    setMessageAlert("Debes aceptar todos los permisos")
                    setShowAlertBluetooth(true)
                    setTimeout(() => {
                        setShowAlertBluetooth(false);
                        navigation.goBack();
                    }, 1500)
                }
            })
            .catch((error) => console.log(error));

        const dataReceivedListener = eventEmitter.addListener('DATA_RECEIVED', event => {
            console.log("[ SERVER_RECEIVED ] >>>", event)
            handleReceivedData(event)
        });
        eventEmitter.addListener('DATA_SERVER_RECEIVED', (event) => {
            console.log("[ BLUETOOTH DATA ] =>", event)
            handleReceivedData(event)
        });
        return () => {
            // Cuando se desmonta el componente, detener el servidor y eliminar el suscriptor del evento
            BluetoothServerModule.stopServer()
                .then((res) => {
                    console.log('Servidor detenido', res)
                    setStatusServer('Servidor detenido')
                    setStatusServerColor(colorsTheme.naranja60)
                })
                .catch(error => console.error('Error al detener el servidor', error));
            dataReceivedListener.remove();
            // dataBlueReceivedListener.remove();
        };
    }, []);

    return (
        <>
            <Header
                isLeft={true}
                navigation={navigation}
                title={'Handshake'}
            />
            <View style={{flex: 1, backgroundColor: colorsTheme.blanco}}>
                <Text style={{color: colorsTheme.negro, fontWeight: "700", fontSize: 20, textAlign: "center"}}>HANDSHAKE AGENTE</Text>
                <Text style={{color: colorsTheme.gris60, fontSize: 18, textAlign: "center"}}>
                    <FontAwesome5
                        name={'dot-circle'}
                        color={statusServerColor}
                        size={18}
                    /> {statusServer}
                </Text>
                {
                    loading && (
                        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
                            <ActivityIndicator size="large" color={colorsTheme.naranja}/>
                        </View>
                    )
                }
                {/* {
                    receivedData.length > 0 && (
                        receivedData.map((item, index) => renderEvent(JSON.parse(item.data), index))
                    )
                } */}
                {
                    receivedData.length > 0 && (
                        <Timeline
                            data={receivedData}
                            titleStyle={{color: colorsTheme.negro}}
                            descriptionStyle={{color: colorsTheme.gris}}
                            lineColor={colorsTheme.naranja40}
                            circleColor={colorsTheme.naranja80}
                        />
                    )
                }
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
                confirmButtonStyle={{width: 100, alignItems: "center"}}
                cancelButtonStyle={{width: 100, alignItems: "center"}}
                confirmButtonColor={colorsTheme.verdeClaro}
                cancelButtonColor={colorsTheme.rojo}
                onConfirmPressed={handleConfirmAmount}
                onCancelPressed={handleCancelAmount}
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