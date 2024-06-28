import * as React from 'react';

import { PermissionsAndroid } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import NetInfo from '@react-native-community/netinfo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

//Others
import HomeScreen from './src/pages/others/HomeScreen';
import TaskListScreen from './src/pages/others/Task/TaskListScreen';
import TaskDescriptionScreen from './src/pages/others/Task/TaskDescriptionScreen';
import TaskNocValidationScreen from './src/pages/others/Task/TaskNocValidationScreen';
import TaskOffline from './src/pages/others/Task/TaskOffline';
import OrdersListScreen from './src/pages/others/Orders/OrdersListScreen';
import OrdersDescriptionAddScreen from './src/pages/others/Orders/OrdersDescriptionAddScreen';
import OrdersDescriptionToDoScreen from './src/pages/others/Orders/OrdersDescriptionToDoScreen';
import OrdersDescriptionUpdateScreen from './src/pages/others/Orders/OrdersDescriptionUpdateScreen';
import InventoryScreen from './src/pages/others/Inventory/InventoryScreen';

//Operatives
import CameraScreen from './src/pages/others/Operative/CameraScreen';
import CameraMultiShotScreen from './src/pages/others/Operative/CameraMultiShotScreen';
import ScanBarCodeScreen from './src/pages/others/Operative/ScanBarCode';
import OnboardingScreen from './src/pages/others/Operative/OnboardingScreen';
import ImageFullScreen from './src/pages/others/Operative/ImageFullScreen';
import HandshakeServerScreen from './src/pages/others/Sync/HandshakeServerScreen';
import HandshakeClientScreen from './src/pages/others/Operative/HandshakeClientScreen';
import BankPayScreen from './src/pages/others/Bank/BankPayScreen';
import VoucherScreen from './src/pages/others/Bank/VoucherScreen';
import AccountStatus from './src/pages/others/Bank/AccountStatusScreen';
import ScanExample from './src/pages/others/Operative/ScanExample';
import DownloadOfflineDataScreen from './src/pages/others/Operative/DownloadOfflineDataScreen';

//Visit
import VisitScreen from './src/pages/others/Visit/VisitScreen';

//Sync
import SyncListScreen from "./src/pages/others/Sync/SyncListScreen";
import SyncDataScreen from "./src/pages/others/Sync/SyncDataScreen";

//Components
import Loading from './src/components/General/Loading';

//Auth
import SignInScreen from './src/pages/auth/SignInScreen';
import ProfileScreen from './src/pages/auth/ProfileScreen';

//Context
import { Provider as AuthProvider } from './src/context/AuthContext.js';
import { Context as AuthContext } from './src/context/AuthContext';

//Functions
import { requestUserPermission, notificationListener } from './src/helper/pushNotificationHelper';
const AuthStack = createNativeStackNavigator();

const AuthFlow = () => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="Login"
        component={SignInScreen}
      />
    </AuthStack.Navigator>
  );
};

const HomeStack = createNativeStackNavigator();

const HomeFlow = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Principal"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="CameraMultiShot"
        component={CameraMultiShotScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="BarCode"
        component={ScanBarCodeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="BarCodeWithList"
        component={ScanExample}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="ImageFullScreen"
        component={ImageFullScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Task"
        component={TaskListScreen}
        options={{ headerShown: false }}
        initialParams={{ taskStatus: { status: false, message: '' } }}
      />
      <HomeStack.Screen
        name="TaskDescription"
        component={TaskDescriptionScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="TaskNocValidation"
        component={TaskNocValidationScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="TaskOffline"
        component={TaskOffline}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Orders"
        component={OrdersListScreen}
        options={{ headerShown: false }}
        initialParams={{ orderStatus: { status: false, message: '' } }}
      />
      <HomeStack.Screen
        name="AddOrdersDescription"
        component={OrdersDescriptionAddScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="ToDoOrdersDescription"
        component={OrdersDescriptionToDoScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="UpdateOrdersDescription"
        component={OrdersDescriptionUpdateScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="HandshakeServer"
        component={HandshakeServerScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="HandshakeClient"
        component={HandshakeClientScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="BankPay"
        component={BankPayScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="VoucherScreen"
        component={VoucherScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="AccountStatus"
        component={AccountStatus}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="VisitScreen"
        component={VisitScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="DownloadData"
        component={DownloadOfflineDataScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="SyncScreen"
        component={SyncListScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="SyncDataScreen"
        component={SyncDataScreen}
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
};

const Stack = createNativeStackNavigator();

const App = () => {

  const { state, validSession, changeCodeTask, offlineSession } = React.useContext(AuthContext);
  const { session, user } = state;

  const requestAllPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      for (const permission in granted) {
        if (granted[permission] === PermissionsAndroid.RESULTS.GRANTED) {
          console.log(`${permission} permission granted`);
        } else {
          console.log(`${permission} permission denied`);
        }
      }
    } catch (err) {
      console.error("{ PERMISSION ERROR } => ", err);
    }
  };

  React.useEffect(() => {
    requestAllPermissions();
    requestUserPermission();
    notificationListener(changeCodeTask);
    getDataSession();
    const unsubscribe = NetInfo.addEventListener(state => {
      offlineSession(state.isConnected);
      if (state.isConnected) {
        showMessage({
          message: 'Con conección a internet',
          type: 'success',
        });
      } else {
        showMessage({
          message: 'Sin conección a internet',
          type: 'danger',
        });
      }
    });
    return () => unsubscribe();
  }, [user]);

  const getDataSession = async () => {
    const dataSession = await AsyncStorage.getItem('@session');
    if (dataSession && !session) {
      validSession({ type: 'loadingOut', session: true });
    }
    dataSession === null && (validSession({ type: 'loadingOut' }));
  };

  return (
    <NavigationContainer>
      {
        state.isLoading ? (<Loading />) :
          (<>
            <Stack.Navigator>
              {
                session ? (
                  <Stack.Screen
                    options={{ headerShown: false }}
                    name="Home"
                    component={HomeFlow}
                  />
                ) : (
                  <Stack.Screen
                    options={{ headerShown: false }}
                    name="Auth"
                    component={AuthFlow}
                  />
                )
              }
            </Stack.Navigator>
          </>)
      }
      <FlashMessage />
    </NavigationContainer>
  );
};

export default () => {
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <App />
      </GestureHandlerRootView>
    </AuthProvider>
  );
};