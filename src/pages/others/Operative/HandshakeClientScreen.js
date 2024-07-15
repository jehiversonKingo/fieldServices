import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    NativeEventEmitter,
    NativeModules,
} from 'react-native';

import {colorsTheme} from '../../../configurations/configStyle';
import Header from '../../../components/Layouts/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

const eventEmitter = new NativeEventEmitter(NativeModules.ServerSocketModule);
const {ServerSocketModule} = NativeModules;
const HandshakeServerScreen = ({navigation, route}) => {
    const [receivedData, setReceivedData] = useState([]);
    const [statusServer, setStatusServer] = useState('El servidor esta apagado');


    const handleReceivedData = async (event) => {
        console.log("DATA_RECEIVED", event)
        setReceivedData([...receivedData, event]);
        switch (event.data) {
            case 'AGENT_DATA':
                const userData = await JSON.parse(AsyncStorage.getItem("@user"));
                console.log("USER DATA >>", userData)
                ServerSocketModule.sendDataToClient({data: userData, action: event.data});
                break;
            case 'GET_CUSTOMER':
                console.log(event)
                break;
            default:
                ServerSocketModule.sendDataToClient("NO ENTIENDO QUE NECESITAS");
                break;
        }
    }

    useEffect(() => {
        ServerSocketModule.startServer()
        .then(result => {
            console.log('Servidor iniciado', result)
            setStatusServer('Servidor iniciado')
        })
        .catch(error => {
            setStatusServer('Error al iniciar el servidor')
            console.error('Error al iniciar el servidor', error)
        });

        const dataReceivedListener = eventEmitter.addListener('DATA_RECEIVED', event => handleReceivedData(event));

        return () => {
            // Cuando se desmonta el componente, detener el servidor y eliminar el suscriptor del evento
            NativeModules.ServerSocketModule.stopServer()
                .then(() => console.log('Servidor detenido'))
                .catch(error => console.error('Error al detener el servidor', error));
            dataReceivedListener.remove();
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
                <Text style={{color: colorsTheme.negro}}>HANDSHAKE SERVE</Text>
                <Text style={{color: colorsTheme.negro}}>{statusServer}</Text>
                {
                    receivedData.length > 0 && (
                        receivedData.map((item, index) => {
                            return (
                                <Text style={{color: colorsTheme.negro}} key={index}>{item.data}</Text>
                            )
                        })
                    )
                }
            </View>
        </>
    );
};

export default HandshakeServerScreen;