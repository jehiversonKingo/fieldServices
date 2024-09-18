package com.antfieldservice;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;


import org.json.simple.parser.ParseException;
import org.apache.commons.codec.DecoderException;
import org.apache.commons.codec.binary.Hex;
import java.util.Arrays;


import org.apache.commons.codec.binary.Hex;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;

import android.util.Log;

public class KingoModule extends ReactContextBaseJavaModule {

    public KingoModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "KingoModule";
    }

    static {
        System.loadLibrary("v5code");
    }

    private JSONObject getMask(String region, String model, String id, ReadableMap secretsDoc) {
        Log.d("[FOLLOW UP region getMask]", region);
        Log.d("[FOLLOW UP model getMask]", model);

        int len;
        String type = Arrays.asList(model.split(" ")).get(0).toLowerCase();
        Log.d("[FOLLOW UP type getMask]", type);
        JSONObject maskResult = getLegacyMask(region, type, id, secretsDoc);
        Boolean legacyValue = (Boolean) maskResult.get("legacy");
        if (legacyValue != null && legacyValue.booleanValue()) {
            return maskResult;
        } else if (model.equals("pos")) {
            len = 15;
        } else {
            len = 9;
        }

        Mac sha512_HMAC = null;
        String result = null;
        String mask = new String();
        String msg = id;
        ReadableMap secretKeys = secretsDoc.getMap("keys");
        ReadableMap secretKeysByRegion = secretKeys.getMap(region);
        String key = secretKeysByRegion.getString(model);

        try {
            Log.d("MASK", "TR");
            byte[] byteKey = key.getBytes("UTF-8");
            sha512_HMAC = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretkey = new SecretKeySpec(byteKey, "HmacSHA512");
            sha512_HMAC.init(secretkey);
            byte[] mac_data = sha512_HMAC.doFinal(msg.getBytes("UTF-8"));
            result = new String(Hex.encodeHex(mac_data));
        } catch (Exception e) {
            Log.d("MASK", "E");
            e.printStackTrace();
        } finally {
            Log.d("MASK", "F");
            int offset = 2 + ((Integer.parseInt(Character.toString(result.charAt(1)), 16) % 2) * 16 + Integer.parseInt(Character.toString(result.charAt(0)), 16)) % (39 - len);
            for (int i = offset; i < offset + len; ++i) {
                int nibble = Integer.parseInt(Character.toString(result.charAt(i)), 16);
                String nibbleS = "00".concat(String.valueOf(nibble));
                nibbleS = nibbleS.substring(nibbleS.length() - 2);
                mask += nibbleS;
            }
        }

        maskResult.put("key", mask);
        maskResult.put("legacy", false);

        return maskResult;
    }

    private JSONObject getLegacyMask(String region, String type, String id, ReadableMap secretsDoc) {
        JSONObject result = new JSONObject();

        try {
            Log.d("[ ERROR MASK GENERATE]", "INIT MASK LEGACY");
            JSONObject masks = (JSONObject) secretsDoc.getMap("masks");
            Log.d("[ ERROR MASK GENERATE]", "0.1");
            JSONObject masksByRegion = (JSONObject) masks.get(region);
            Log.d("[ ERROR MASK GENERATE]", "0.2");
            JSONObject masksByRegionType = (JSONObject) masksByRegion.get(type);
            Log.d("[ ERROR MASK GENERATE]", "0.3");
            String mask = (String) masksByRegionType.get(id);
            Log.d("[ ERROR MASK GENERATE]", "1");
            if (mask != null) {
                Log.d("[ ERROR MASK GENERATE]", "2");
                result.put("key", mask);
                result.put("legacy", true);
            } else {
                Log.d("[ ERROR MASK GENERATE]", "3");
                result.put("key", "");
                result.put("legacy", true);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return result;
    }

    private static String leftPad(String code) {
        return String.format("%1$" + 16 + "s", code).replace(" ", "0");
    }

    private static String luhn(String mask) {
        if (mask == null)
            return null;
        String digit;

        int[] digits = new int[mask.length()];
        for (int i = 0; i < mask.length(); i++) {
            digits[i] = Character.getNumericValue(mask.charAt(i));
        }

        for (int i = digits.length - 1; i >= 0; i -= 2) {
            digits[i] += digits[i];

            if (digits[i] >= 10) {
                digits[i] = digits[i] - 9;
            }
        }

        int sum = 0;
        for (int i = 0; i < digits.length; i++) {
            sum += digits[i];
        }

        sum = sum * 9;

        digit = sum + "";
        return digit.substring(digit.length() - 1);
    }

    private static String luhnModified(String mask) {
        if (mask == null)
            return null;
        String digit;

        int[] digits = new int[mask.length()];
        for (int i = 0; i < mask.length(); i++) {
            digits[i] = Character.getNumericValue(mask.charAt(i));
        }

        for (int i = digits.length - 2; i >= 0; i -= 2) {
            digits[i] += digits[i];

            if (digits[i] >= 10) {
                digits[i] = digits[i] - 9;
            }
        }

        int sum = 0;
        for (int i = 0; i < digits.length; i++) {
            sum += digits[i];
        }

        sum = sum * 9;

        digit = sum + "";
        return digit.substring(digit.length() - 1);
    }

    public String getInitMask(String region, String model, String id, int initVersion, ReadableMap secretsDoc) {
        Log.d("[FOLLOW UP region]", region);
        Log.d("[FOLLOW UP model]", model);
        Log.d("[FOLLOW UP id]", id);
        Log.d("[FOLLOW UP initVersion]", Integer.toString(initVersion));
        JSONObject maskRes = getMask(region, model, id, secretsDoc);
        String m = (String) maskRes.get("key");

        switch (initVersion) {
            case 1:
                return luhn(m) +
                        m.substring(0, 3) + " " +
                        m.substring(3, 7) + " " +
                        m.substring(7, 11) + " " +
                        m.substring(11, 15) + " " +
                        m.substring(15, 18) + "0";

            case 2:
            default:
                return luhn(m) +
                        m.substring(0, 3) + " " +
                        m.substring(3, 7) + " " +
                        m.substring(7, 11) + " " +
                        m.substring(11, 15) + " " +
                        m.substring(15, 18) +
                        luhnModified(m);
        }
    }

    @ReactMethod
    public void getToken(int second, int minute, int hour, int dayOfYear, Promise promise) {
        try {
            Log.d("CARLOS", Integer.toString(second));
            int token = GetToken(second, minute, hour, dayOfYear);
            promise.resolve(token);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getCreditV5(String region, int destination_id, int credit_type, int amount, int origin_id, int count_codes, int year_mod, int day, ReadableMap secretsDoc, Promise promise) {
        String model = "pos";
        int defaultId = 900000;
        try {
            JSONObject initMask = getMask(region, model, Integer.toString(destination_id), secretsDoc);
            String maskS = (String) initMask.get("key");
            String credit = GenerateCreditV5((destination_id-defaultId), credit_type, amount, (origin_id-defaultId), count_codes, year_mod, day, maskS);
            promise.resolve(credit);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
public void getKingoCodeV5(String region, String model, int kingoID, int second, int minute, int hour, int dayOfYear, int year, int plan, boolean generateToken, ReadableMap secretsDoc, Promise promise) {
    try {
        int initCode = 2;
        Log.d("CARLOS", Integer.toString(1));

        // Crear un JSONObject
        JSONObject codeJson = new JSONObject();

        // Obtener la máscara inicial
        String initMask = getInitMask(region, model, Integer.toString(kingoID), initCode, secretsDoc);
        Log.d("CARLOS", Integer.toString(2));
        initMask = initMask.replace(" ", "");
        Log.d("CARLOS", Integer.toString(3));

        // Generar el código
        String code = leftPad(GenerateCodeV5(kingoID, second, minute, hour, dayOfYear, year, plan, initMask));
        Log.d("CARLOS", Integer.toString(4));
        Log.d("CARLOS", code);

        // Agregar los valores al JSONObject
        codeJson.put("code", code);
        codeJson.put("initMask", initMask);

        // Resolver la promesa con el JSONObject convertido a cadena
        promise.resolve(codeJson.toString());
    } catch (Exception e) {
        promise.reject("ERROR", e.getMessage());
    }
}

    private native int GetToken(int second, int minute, int hour, int dayOfYear);
    private native String GenerateCreditV5(int destination_id, int credit_type, int amount, int origin_id, int count_codes, int year_mod, int day, String maskS);
    private native String GenerateCodeV5(int Kingo_ID, int Second, int Minute, int Hour, int Day_of_Year, int Year_Mod, int Plan, String Mask);
}
