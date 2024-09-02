#include <string.h>
#include <jni.h>
#include "../../common/prepay_algorithm_speck.c"

jint Java_com_antfieldservice_KingoModule_GetToken(JNIEnv* env, jobject thiz, jint j_Second, jint j_Minute, jint j_Hour, jint j_Day_of_Year) {
    int Second = (int) j_Second;
    int Minute = (int) j_Minute;
    int Hour = (int) j_Hour;
    int Day_of_Year = (int) j_Day_of_Year;

    int token = GetToken(Second, Minute, Hour, Day_of_Year);

    return token;
}

jstring
Java_com_antfieldservice_KingoModule_GenerateCreditV5(JNIEnv* env, jobject thiz, jint j_destination_id, jint j_credit_type, jint j_amount, jint j_origin_id, jint j_count_codes, jint j_year_mod, jint j_day, jstring j_mask)
{
    int destination_id = (int) j_destination_id;
    int credit_type = (int) j_credit_type;
    int amount = (int) j_amount;
    int origin_id = (int) j_origin_id;
    int count_codes = (int) j_count_codes;
    int year_mod = (int) j_year_mod;
    int day = (int) j_day;
    const char *mask = (*env)->GetStringUTFChars(env, j_mask, 0);

    char *credit = GenerateCreditV5(destination_id, credit_type, amount, origin_id, count_codes, year_mod, day, mask);

  return (*env)->NewStringUTF(env,credit);
}

jstring
Java_com_antfieldservice_KingoModule_GenerateCodeV5(JNIEnv* env, jobject thiz, jint j_Kingo_ID, jint j_Second, jint j_Minute, jint j_Hour, jint j_Day_of_Year, jint j_Year_Mod, jint j_Plan, jstring j_Mask)
{
    int Kingo_ID = (int) j_Kingo_ID;
    int Second = (int) j_Second;
    int Minute = (int) j_Minute;
    int Hour = (int) j_Hour;
    int Day_of_Year = (int) j_Day_of_Year;
    int Year_Mod = (int) j_Year_Mod;
    int Plan = (int) j_Plan;
    const char *Mask = (*env)->GetStringUTFChars(env, j_Mask, 0);

    char *codeV5 = GenerateCodeV5(Kingo_ID, Second, Minute, Hour, Day_of_Year, Year_Mod, Plan, Mask);

  return (*env)->NewStringUTF(env,codeV5);
}