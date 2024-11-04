import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ToastAndroid, Modal, View, Text, Button, Vibration, ActivityIndicator } from 'react-native';
import BackgroundGeolocation from 'react-native-background-geolocation';

// LOCAL IMPORTS
import { deleteAsyncStorageData } from '../helper/helpers';
import { createFieldTrackerTable, insertLocationToDatabase, insertLocationActivityUser, createActivityUserTable, deleteLocationsFromDatabaseByStatusAndTask } from '../functions/fncTracker';
import { handleGetDataUserLocal } from '../functions/fncGeneral';

export const TrackingContext = createContext();

export const TrackingProvider = ({ children }) => {
    
    const [initService, setInitServices] = useState(false);
    const [locations, setLocations] = useState([]);
    const [timer, setTimer] = useState(0);
    const [changeButton, setChangeButton] = useState(true);
    const [showLoading, setShowLoading] = useState(true);
    const [showBatteryAlert, setShowBatteryAlert] = useState(false);
    const [task, setTask] = useState(false);
    const [taskStatus, setTaskStatus] = useState(false);

    const timerRef = useRef(null);
    const timeRef = useRef(0);
    const firstLocationReceived = useRef(false);
    const locationsRef = useRef([]);
    const saveIntervalRef = useRef(null);

    useEffect(() => {
        console.log("TRACKER")
        if (initService) {
            console.log("--7--")
            startTracking();
            createFieldTrackerTable();

            if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current);
            }

            // saveIntervalRef.current = setInterval(() => {
            //     console.log("-------Toma de coordenadas-------");
            //     getLocation();
            //     console.log("-------Salida de Toma de coordenadas-------");
            // }, 5000);

            saveIntervalRef.current = setInterval(() => {
                console.log("Iniciando el guardado de ubicaciones en la base de datos.");
                saveLocationsToDatabase();
            }, 15000);

            return () => {
                console.log("Limpiando el intervalo de guardado.");
                clearInterval(saveIntervalRef.current);
                clearInterval(timerRef.current);
            };
        }

    }, [initService]);

    const saveLocationsToDatabase = async () => {
        try {
            console.log("--1--");
        console.log("Ubicaciones actuales: ", locationsRef.current.length); // Verifica la longitud
        const locations = locationsRef.current;
        const { user } = await handleGetDataUserLocal();
        
        if (locations.length === 0) {
            console.log("No hay ubicaciones para guardar en la base de datos.");
            return;
        }

        ToastAndroid.showWithGravity(
            `Pase al final cambio de ubicacion `,
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM
        );  

        console.log(`Guardando ${locations.length} ubicaciones en la base de datos...`);

        for (const loc of locations) {
            ToastAndroid.showWithGravity(
                `Esta es ${loc.GPS}`,
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM
            );  
            console.log("()()())()()()()()()()()()", loc, {idUser: user.idUser, idTask:task}, taskStatus)
            await insertLocationToDatabase(loc, {idUser: user.idUser, idTask:task}, taskStatus);
        }
        console.log("Se guardo todo!");
        locationsRef.current = [];
        setLocations([]);

        console.log('Todas las ubicaciones se han guardado en la base de datos.');
        ToastAndroid.showWithGravity(
            'Todas las ubicaciones se han guardado en la base de datos.',
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM
        );     
        } catch (error) {
            console.log("[ERROR]=======>", error);
        }
    };

    const configureGeolocation = async () => {
        try {
            await BackgroundGeolocation.ready({
                desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
                distanceFilter: 10, 
                stopOnTerminate: false,
                stopOnStationary: false,
                startOnBoot: true,
                foregroundService: true,
                enableHeadless: true,
                heartbeatInterval: -1,
                debug: true,
                logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
                notification: {
                    layout: "notification_layout",
                    title: "Rastreo en Curso",
                    text: "El rastreo está activo. Presiona 'Detener' para finalizar.",
                    smallIcon: "mipmap-hdpi/ic_launcher_round",
                    largeIcon: "mipmap-hdpi/ic_launcher_round"
                }
            });

            BackgroundGeolocation.onNotificationAction((buttonId) => {
                console.log("==================================================");
                console.info("[onNotificationAction] - ", buttonId);
                console.log("==================================================");
                if (buttonId === "notificationStopButton") {
                    stopTracking();
                }
            });

            BackgroundGeolocation.setConfig({
                notification: {
                  channelName: "antfieldservice"
                }
              });

              BackgroundGeolocation.onMotionChange(location => {
                if (location.isMoving) {
                    console.log("El usuario ha empezado a moverse.");
                } else {
                    console.log("El usuario se ha detenido.");
                }
            });
    
            BackgroundGeolocation.onConnectivityChange(({ connected }) => {
                if (connected) {
                    console.log("Conectado a la red.");
                } else {
                    console.log("Sin conexión.");
                    saveLocationsToDatabase();
                }
            });
            
        } catch (error) {
            console.error("Error en la configuración de BackgroundGeolocation:", error);
        }
    };

    const updateLocations = (currentLocation, location, timestamp, velocity) => {
        locationsRef.current.push({ GPS: location, Date: timestamp, velocity });
        setLocations((prevLocations) => [...prevLocations, { GPS: location, Date: timestamp, velocity }].slice(-40));
    };
    const startTracking = async () => {
        console.log("--6--")
        try {
            console.log("INICIARE LA TAREA");
            const state = await BackgroundGeolocation.getState();
            
            if (state.enabled) {
                console.log("El servicio ya está activo, se reiniciará.");
                await BackgroundGeolocation.stop();
                clearInterval(timerRef.current);
                setTimer(0);
                locationsRef.current = [];
                setLocations([]);
            }
    
            await configureGeolocation();
            setChangeButton(true);
            setShowLoading(true);
            firstLocationReceived.current = false;
    
            clearInterval(timerRef.current);
            timeRef.current = 0;
            setTimer(0);
            locationsRef.current = [];
            setLocations([]);
    
            await BackgroundGeolocation.start();
    
            timerRef.current = setInterval(() => {
                timeRef.current += 1;
                setTimer(timeRef.current);
            }, 1000);
    
            BackgroundGeolocation.onLocation((location) => {
                console.log("UBICACION OBTENIDA", location);
                const { level } = location.battery;
                const { latitude, longitude, speed } = location.coords;
                const timestamp = new Date(location.timestamp).toISOString();
                const currentLocation = { latitude, longitude };
    
                if (level <= 0.21) {
                    Vibration.vibrate(1000);
                    saveLocationsToDatabase();
                    setShowBatteryAlert(true);
                }
    
                if (!firstLocationReceived.current) {
                    firstLocationReceived.current = true;
                    setShowLoading(false);
                }
    
                updateLocations(currentLocation, `${latitude}, ${longitude}`, timestamp, velocity=speed);
            });
    
        } catch (error) {
            console.log('Error al iniciar BackgroundActions:', error);
        }
    };

    const stopTracking = async (setIsModal, setDataModal) => {
        console.log("--8--")
        try {
            console.info("Deteniendo rastreo...");
            clearInterval(timerRef.current);
            clearInterval(saveIntervalRef.current);
            firstLocationReceived.current = false;

            setTimer(0);
            timerRef.current = null;
            setChangeButton(true);
            setInitServices(false);
    
            await BackgroundGeolocation.removeListeners();
            await BackgroundGeolocation.stop();
    
            // setDataModal({
            //     headerTitle: "Enviando datos...",
            //     subTitle: "Se están enviando las coordenadas para guardarse.",
            // });
            
            //await handleDataSaving(setIsModal, setDataModal);
    
        } catch (error) {
            console.error("Error al detener el tracking:", error);
        }
    };    

    const cancelTracking = async (idTask, taskStatus) => {
        console.log("--9--", idTask, taskStatus)
        try {
            console.info("Cancelando rastreo...");
            console.info({
                itemImage: "info",
                headerTitle: "Cancelando Proceso",
                subTitle: "Se está cancelando la ejecución.",
            });
    
            clearInterval(timerRef.current);
            clearInterval(saveIntervalRef.current);
            firstLocationReceived.current = false;
            setChangeButton(false);
    
            await BackgroundGeolocation.removeListeners();
            await BackgroundGeolocation.stop();
            
            setTimer(0);
            setInitServices(false);
            setLocations([]);
            locationsRef.current = [];
            await deleteLocationsFromDatabaseByStatusAndTask(idTask, taskStatus);
        } catch (error) {
            console.error("Error al cancelar el tracking:", error);
        }
    };    

    const handleDataSaving = async (setIsModal, setDataModal) => {
        console.log("--10--")
        saveLocationsToDatabase();
        const dbLocations = await getLocationsFromDatabase();
        const totalLocations = dbLocations.length;

        if (connected) {
            let successCount = 0;
            let failedCount = 0;

            setDataModal({
                headerTitle: "Subiendo...",
                subTitle: `Total de registros: ${totalLocations}`,
            });
            for (const item of dbLocations) {
                console.info("USUARIO: ", item);
                const transformed = {
                    idMenuAction: item.idMenuAction,
                    idUser: item.idUser,
                    code: item.code,
                    GPS: item.GPS,
                    Date: item.Date,
                    velocity: item.velocity
                };

                try {
                    const response = await addActionContinuesOffline(transformed);

                    if (response.status) {
                        deleteLocationsFromDatabase(item.id);
                        successCount++;
                        console.log(`Registro subido con éxito: ${successCount} de ${totalLocations}`);
                        setDataModal((prev) => ({
                            ...prev,
                            subTitle: `Subido ${successCount} de ${totalLocations} registros...`,
                        }));
                    } else {
                        failedCount++;
                        console.log(`Error al subir el registro con ID ${item.id}.`);
                    }
                } catch (error) {
                    failedCount++;
                    console.error(`Error al intentar subir el registro con ID ${item.id}:`, error);
                }
            }
            if (successCount === totalLocations) {
                console.log("Todos los datos fueron subidos con éxito.");
                setDataModal({
                    itemImage: "success",
                    headerTitle: "Datos enviados al servidor",
                    subTitle: "Se envio correctamente los datos al servidor.",
                    btnText1: "Ok",
                    onPressBtn1: () => {
                    setIsModal(false);
                    }
                });
            } else {
                console.log(`Fallaron ${failedCount} de ${totalLocations} registros.`);
        
                setDataModal({
                    itemImage: "error",
                    headerTitle: "Error parcial",
                    subTitle: `Error al subir algunos registros. Subidos ${successCount} de ${totalLocations}.`,
                    btnText1: "Ok",
                    onPressBtn1: () => {
                    setIsModal(false);
                    },
                });
            }
        } else {
            setDataModal({
                itemImage: "info",
                headerTitle: "Sin conexión",
                subTitle: "La información se guardó localmente.",
                btnText1: "Ok",
                onPressBtn1: () => {
                    setIsModal(false);
                }
            });
        }
    };

    return (
        <TrackingContext.Provider
            value={{
                initService,
                startTracking,
                locations,
                timer,
                setInitServices,
                changeButton,
                stopTracking,
                cancelTracking,
                setTask,
                setTaskStatus
            }}>
            {children}
            <Modal
                transparent={true}
                visible={showLoading && initService}
                animationType="slide"
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
                        <Text style={{ color: 'gray' }}>Esperando respuesta de coordenadas...</Text>
                        <ActivityIndicator size="large" color={"#6fb327"} />
                    </View>
                </View>
            </Modal>

            <Modal
                transparent={true}
                visible={showBatteryAlert}
                animationType="slide"
                onRequestClose={() => setShowBatteryAlert(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
                        <Text style={{ color: 'red', marginBottom: 10 }}>¡Batería baja!</Text>
                        <Text style={{ marginBottom: 20, color: 'gray' }}>La batería está por debajo del 20%. Considera detener el proceso para conservar energía.</Text>
                        <Button color={"blue"} title="OK" onPress={() => setShowBatteryAlert(false)} />
                    </View>
                </View>
            </Modal>
        </TrackingContext.Provider>
    );
};

export const useTracking = () => {
    const {
        initService,
        startTracking,
        locations,
        timer,
        setInitServices,
        changeButton,
        stopTracking,
        cancelTracking,
        setTask,
        setTaskStatus
    } = useContext(TrackingContext);

    return {
        initService,
        startTracking,
        locations,
        timer,
        setInitServices,
        changeButton,
        stopTracking,
        cancelTracking,
        setTask,
        setTaskStatus
    };
};
