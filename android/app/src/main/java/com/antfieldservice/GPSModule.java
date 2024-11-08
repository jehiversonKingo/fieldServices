package com.antfieldservice;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class GPSModule extends ReactContextBaseJavaModule {

    public GPSModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "GPSModule";
    } 

    @ReactMethod
    public void getCurrentLocation(final Callback callback) {
        ReactApplicationContext context = getReactApplicationContext();
        LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);

        final boolean[] hasInvokedCallback = {false};

        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
            ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            invokeCallbackWithError(callback, hasInvokedCallback, "Permiso de ubicación no concedido");
            return;
        }

        boolean gpsEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
        boolean networkEnabled = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER);

        if (!gpsEnabled && !networkEnabled) {
            invokeCallbackWithError(callback, hasInvokedCallback, "No hay proveedor de ubicación disponible");
            return;
        }

        LocationListener locationListener = new LocationListener() {
            @Override
            public void onLocationChanged(@NonNull Location location) {
                // Enviar la ubicación obtenida sin realizar más validaciones
                invokeCallbackWithLocation(callback, hasInvokedCallback, location);
                locationManager.removeUpdates(this); // Detener la escucha de nuevas ubicaciones después de la primera lectura
            }

            @Override
            public void onStatusChanged(String provider, int status, Bundle extras) {}

            @Override
            public void onProviderEnabled(@NonNull String provider) {}

            @Override
            public void onProviderDisabled(@NonNull String provider) {
                if (!hasInvokedCallback[0]) {
                    invokeCallbackWithError(callback, hasInvokedCallback, "Proveedor de ubicación desactivado");
                }
            }
        };

        // Solicitar actualizaciones de ubicación de GPS si está habilitado
        if (gpsEnabled) {
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0, 1, locationListener);
        }

        // Solicitar actualizaciones de ubicación de red si está habilitado
        if (networkEnabled) {
            locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0, 1, locationListener);
        }
    }

    private void invokeCallbackWithError(Callback callback, boolean[] hasInvokedCallback, String error) {
        if (!hasInvokedCallback[0]) {
            hasInvokedCallback[0] = true;
            callback.invoke(error);
        }
    }

    private void invokeCallbackWithLocation(Callback callback, boolean[] hasInvokedCallback, Location location) {
        if (!hasInvokedCallback[0]) {
            hasInvokedCallback[0] = true;
            callback.invoke(location.getLatitude(), location.getLongitude(), location.getAccuracy());
        }
    }
}