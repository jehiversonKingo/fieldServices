import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ToastAndroid, Modal, View, Text, Button, Vibration, ActivityIndicator } from 'react-native';
import BackgroundGeolocation from 'react-native-background-geolocation';

// LOCAL IMPORTS
import { 
    createFieldTrackerTable, 
    insertLocationToDatabase, 
    deleteLocationsFromDatabaseByStatusAndTask 
} from '../functions/fncTracker';
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
    const locationsRef = useRef([]);
    const saveIntervalRef = useRef(null);
    const firstLocationReceived = useRef(false);

    useEffect(() => {
        if (initService) {
            initializeTrackingService();
            return cleanupTrackingService;
        }
    }, [initService]);

    const initializeTrackingService = () => {
        startTracking();
        createFieldTrackerTable();

        // if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
        // saveIntervalRef.current = setInterval(saveLocationsToDatabase, 15000);
    };

    const cleanupTrackingService = () => {
        if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const saveLocationsToDatabase = async () => {
        if (!locationsRef.current.length) {
            console.log("No hay ubicaciones para guardar.");
            return;
        }

        const { user } = await handleGetDataUserLocal();
        console.log(`Guardando ${locationsRef.current.length} ubicaciones...`);
        ToastAndroid.showWithGravity(
            `Guardando ${locationsRef.current.length} ubicaciones en la base de datos.`,
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM
        );

        for (const loc of locationsRef.current) {
            await insertLocationToDatabase(loc, { idUser: user.idUser, idTask: task }, taskStatus);
        }

        locationsRef.current = [];
        setLocations([]);
        console.log("Ubicaciones guardadas.");
    };

    const configureGeolocation = async () => {
        try {
            await BackgroundGeolocation.requestPermission();
            await BackgroundGeolocation.ready({
                desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
                distanceFilter: 0, 
                stopOnTerminate: false,
                startOnBoot: true, 
                foregroundService: true,
                enableHeadless: true,
                heartbeatInterval: 10,
                debug: true,
                logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
                locationUpdateInterval: 10000,
                notification: {
                    title: "Rastreo en Curso",
                    text: "El rastreo está activo.",
                    smallIcon: "mipmap-hdpi/ic_launcher_round"
                }
            });
    
            BackgroundGeolocation.onLocation(async (location) => {
                const { latitude, longitude, speed } = location.coords;
                console.log(`Ubicación: ${latitude}, ${longitude} - Velocidad: ${speed}`);

                const speedThreshold = 5;
    
                const newDistanceFilter = speed > speedThreshold ? 50 : 0;
                BackgroundGeolocation.setConfig({ distanceFilter: newDistanceFilter });
    
                handleLocationUpdate(location);
            });
        } catch (error) {
            console.error("Error en configuración de geolocalización:", error);
        }
    };    

    const updateLocations = (location, timestamp, speed) => {
        const newLocation = { GPS: location, Date: timestamp, velocity: speed };
        locationsRef.current.push(newLocation);
        setLocations((prev) => [...prev, newLocation].slice(-40));
    };

    const startTracking = async () => {
        try {            
            clearInterval(timerRef.current);
            clearInterval(saveIntervalRef.current);
            await BackgroundGeolocation.removeAllListeners("location");
            await BackgroundGeolocation.stop();
            resetTrackingState();
            const state = await BackgroundGeolocation.getState();
            if (state.enabled) await resetGeolocation();
    
            await configureGeolocation();
            setChangeButton(true);
            setShowLoading(true);
    
            timerRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);
            await BackgroundGeolocation.start();
    
            BackgroundGeolocation.removeAllListeners("location");
    
            BackgroundGeolocation.onLocation((location) => handleLocationUpdate(location));
        } catch (error) {
            console.error("Error al iniciar el rastreo:", error);
        }
    };    

    const resetGeolocation = async () => {
        await BackgroundGeolocation.stop();
        clearInterval(timerRef.current);
        setTimer(0);
        locationsRef.current = [];
        setLocations([]);
    };

    const handleLocationUpdate = async (location) => {
        const { latitude, longitude, speed } = location.coords;
        const { level } = location.battery;
        const timestamp = new Date(location.timestamp).toISOString();
    
        const lastLocation = locationsRef.current[locationsRef.current.length - 1];
        if (lastLocation && lastLocation.GPS === `${latitude}, ${longitude}` && lastLocation.Date === timestamp) {
            console.log("Ubicación duplicada detectada, ignorando.");
            return;
        }
    
        if (level <= 0.21) {
            Vibration.vibrate(1000);
            await saveLocationsToDatabase();
            setShowBatteryAlert(true);
        }
    
        if (!firstLocationReceived.current) {
            firstLocationReceived.current = true;
            setShowLoading(false);
        }
    
        updateLocations(`${latitude}, ${longitude}`, timestamp, speed);
        await saveLocationsToDatabase();
    };
        
    const stopTracking = async () => {
        try {
            clearInterval(timerRef.current);
            clearInterval(saveIntervalRef.current);
            await BackgroundGeolocation.removeAllListeners("location");
            await BackgroundGeolocation.stop();
            resetTrackingState();
        } catch (error) {
            console.error("Error al detener el rastreo:", error);
        }
    };    

    const resetTrackingState = () => {
        firstLocationReceived.current = false;
        setTimer(0);
        setChangeButton(true);
        setInitServices(false);
    };

    const cancelTracking = async (idTask, taskStatus) => {
        try {
            await stopTracking();
            await deleteLocationsFromDatabaseByStatusAndTask(idTask, taskStatus);
        } catch (error) {
            console.error("Error al cancelar el rastreo:", error);
        }
    };

    return (
        <TrackingContext.Provider value={{
            initService, startTracking, locations, timer,
            setInitServices, changeButton, stopTracking,
            cancelTracking, setTask, setTaskStatus
        }}>
            {children}
            <TrackingModal showLoading={showLoading && initService} />
            <BatteryAlertModal showBatteryAlert={showBatteryAlert} onClose={() => setShowBatteryAlert(false)} />
        </TrackingContext.Provider>
    );
};

const TrackingModal = ({ showLoading }) => (
    <Modal transparent={true} visible={showLoading} animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
                <Text style={{ color: 'gray' }}>Esperando respuesta de coordenadas...</Text>
                <ActivityIndicator size="large" color={"#6fb327"} />
            </View>
        </View>
    </Modal>
);

const BatteryAlertModal = ({ showBatteryAlert, onClose }) => (
    <Modal transparent={true} visible={showBatteryAlert} animationType="slide" onRequestClose={onClose}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
                <Text style={{ color: 'red', marginBottom: 10 }}>¡Batería baja!</Text>
                <Text style={{ marginBottom: 20, color: 'gray' }}>La batería está por debajo del 20%. Considera detener el proceso para conservar energía.</Text>
                <Button color={"blue"} title="OK" onPress={onClose} />
            </View>
        </View>
    </Modal>
);

export const useTracking = () => useContext(TrackingContext);
