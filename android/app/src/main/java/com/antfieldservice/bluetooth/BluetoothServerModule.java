package com.antfieldservice.bluetooth;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothServerSocket;
import android.bluetooth.BluetoothSocket;
import android.os.Handler;
import android.os.Message;
import android.util.Log;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.UUID;

import org.json.JSONException;
import org.json.JSONObject;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Intent;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;

public class BluetoothServerModule extends ReactContextBaseJavaModule {
    private static final String TAG = "BluetoothServerModule";
    private static final String EVENT_DATA_RECEIVED = "DATA_SERVER_RECEIVED";

    private final BluetoothAdapter bluetoothAdapter;
    private AcceptThread acceptThread;
    private ConnectedThread connectedThread;
    private final UUID uuid;
    private boolean isServerRunning = false; // Variable de estado para rastrear si el servidor está en ejecución

    private StringBuilder receivedDataBuffer = new StringBuilder(); // Buffer para los datos recibidos

    public BluetoothServerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        uuid = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB"); // UUID de servicio SPP (Serial Port Profile)
    }

    public boolean isBluetoothEnabled() {
        return bluetoothAdapter != null && bluetoothAdapter.isEnabled();
    }

    @Override
    public String getName() {
        return "BluetoothServerModule";
    }

    @ReactMethod
    public void sendDataToClient(String data, Promise promise) {
        if (connectedThread != null) {
            connectedThread.write(data);
            promise.resolve("Data sent to client");
        } else {
            promise.reject("ERROR", "Client not connected or socket is closed.");
        }
    }

    // Método para enviar JSON al cliente
  @ReactMethod
    public void sendJsonToClient(ReadableMap jsonMap, Promise promise) {
        // Convertir ReadableMap a JSONObject
        JSONObject jsonObject = new JSONObject(jsonMap.toHashMap());
        String jsonString = jsonObject.toString();

        if (connectedThread != null) {
            connectedThread.write(jsonString);
            Log.d(TAG, "[...............]");
            Log.d(TAG, jsonString);
            promise.resolve("JSON data sent to client");
        } else {
            Log.d(TAG, "Error: 3");
            promise.reject("ERROR", "Client not connected or socket is closed.");
        }
    }



    // Nuevo método para iniciar el servidor
    @ReactMethod
    public void startServer(Promise promise) {
        if (!isServerRunning && isBluetoothEnabled()) {
            acceptThread = new AcceptThread();
            acceptThread.start();
            isServerRunning = true;
            promise.resolve("Server started");
        } else {
            if (!isBluetoothEnabled()) {
                promise.reject("ERROR", "Bluetooth is not enabled. Please turn it on.");
            } else {
                promise.reject("ERROR", "Server is already running");
            }
        }
    }

    // Nuevo método para detener el servidor
    @ReactMethod
    public void stopServer(Promise promise) {
        if (isServerRunning) {
            if (connectedThread != null) {
                connectedThread.cancel();
                connectedThread = null;
            }

            if (acceptThread != null) {
                acceptThread.cancel();
                acceptThread = null;
            }

            isServerRunning = false;
            promise.resolve("Server stopped");
        } else {
            promise.reject("ERROR", "Server is not running");
        }
    }

    // Resto del código sin cambios

    private void manageConnectedSocket(BluetoothSocket socket) {
        if (connectedThread != null) {
            connectedThread.cancel();
        }
        connectedThread = new ConnectedThread(socket);
        connectedThread.start();
    }

    private void sendEvent(String eventName, String data) {
        WritableMap params = Arguments.createMap();
        params.putString("data", data);

        getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }

    private class AcceptThread extends Thread {
        private final BluetoothServerSocket serverSocket;

        public AcceptThread() {
            BluetoothServerSocket tmp = null;
            try {
                tmp = bluetoothAdapter.listenUsingRfcommWithServiceRecord("YourApp", uuid);
            } catch (IOException e) {
                // Manejar la excepción
            }
            serverSocket = tmp;
        }

        public void run() {
            BluetoothSocket socket = null;
            while (true) {
                try {
                    socket = serverSocket.accept();
                } catch (IOException e) {
                    // Manejar la excepción
                    break;
                }

                if (socket != null) {
                    manageConnectedSocket(socket);
                }
            }
        }

        public void cancel() {
            try {
                serverSocket.close();
            } catch (IOException e) {
                // Manejar la excepción
            }
        }
    }

    private class ConnectedThread extends Thread {
        private final BluetoothSocket socket;
        private final InputStream inputStream;
        private final OutputStream outputStream;

        public ConnectedThread(BluetoothSocket socket) {
            this.socket = socket;
            InputStream tmpIn = null;
            OutputStream tmpOut = null;

            try {
                tmpIn = socket.getInputStream();
                tmpOut = socket.getOutputStream();
            } catch (IOException e) {
                // Manejar la excepción
            }

            inputStream = tmpIn;
            outputStream = tmpOut;
        }

        public void run() {
            byte[] buffer = new byte[8196];
            int bytesRead;

            while (true) {
                try {
                    bytesRead = inputStream.read(buffer);
                    String receivedData = new String(buffer, 0, bytesRead);
                    receivedDataBuffer.append(receivedData); // Agregar datos al buffer

                    try {
                        // Intentar parsear el JSON completo
                        new JSONObject(receivedDataBuffer.toString());
                        // Si se parsea correctamente, enviar el evento
                        sendEvent(EVENT_DATA_RECEIVED, receivedDataBuffer.toString());
                        receivedDataBuffer.setLength(0); // Limpiar el buffer
                    } catch (JSONException e) {
                        // Si el JSON no está completo, esperar más datos
                        Log.d(TAG, "JSON incompleto, esperando más datos...");
                    }
                } catch (IOException e) {
                    // Manejar la excepción
                    break;
                }
            }
        }

        public void write(String data) {
            try {
                outputStream.write(data.getBytes());
                outputStream.flush();
            } catch (IOException e) {
                Log.d(TAG, "Error: 1");
            }
        }

        public void cancel() {
            try {
                socket.close();
            } catch (IOException e) {
               Log.d(TAG, "Error: 2");
            }
        }
    }
}
