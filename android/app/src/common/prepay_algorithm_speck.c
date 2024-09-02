/*
 * Prepay_Algorithm_Speck.c
 *
 *  Created on: 10/08/2017
 *  Author: 	Ernesto Lopez
 * 	Modified: 	Kingo Dev Team
 */

/***********************************************************************************/
/*KINGO ENERGY CONFIDENCIAL
 * ------------------------
 * [2016] Kingo Energy
 * All Rights Reserved
 *
 * NOTICE: All information contained herein is, and remains the property of Kingo
 * Energy.
 * The intellectual and technical concepts contained herein are proprietary to Kingo
 * Energy, and may be covered by U.S. and Foreign Patents, patents in process, and
 * are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material is strictly
 * forbidden unless prior written permission is obtained from Kingo Energy.
 */
/***********************************************************************************/

#include <stdint.h>
#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include "./aes/AES.c"
#include "./speck/Speck.c"
#include <time.h>
#include <android/log.h>

int DayOfYear() {
    time_t t = time(NULL);
    struct tm tm = *localtime(&t);

    int DayOfYear = tm.tm_yday;

    return DayOfYear;
}

int ModYear() {
    time_t t = time(NULL);
    struct tm tm = *localtime(&t);

    int yearMod = tm.tm_year % 4;

    return yearMod;
}

//https://www.programmingalgorithms.com/algorithm/damm-algorithm?lang=C
char CheckSum(char* number) {
    const char table[] = "0317598642709215486342068713591750983426612304597836742095815869720134894536201794386172052581436790";
    char interim = '0';

    for (char* p = number; *p != '\0'; ++p) {
        if ((unsigned char)(*p - '0') > 9)
            return '-';

        interim = table[(*p - '0') + (interim - '0') * 10];
    }

    return interim;
}

bool Validate(char* number) {
    return CheckSum(number) == '0';
}

void FillAesData(uint8_t aes_data[], uint8_t mask[],
                 uint8_t start, uint8_t len) {
  uint8_t index = 0;
  for (index = start; index < (start + len); index++) {
    aes_data[index - start] = mask[index];
  }
}

void FillKey(uint32_t key[4], uint8_t aes_data[]) {
  uint8_t index = 0;
  for (index = 0; index < 4; index++) {
    key[index] = (((uint32_t) aes_data[index * 3]) << 16) |
                 (((uint32_t) aes_data[index * 3 + 1]) << 8) |
                 (((uint32_t) aes_data[index * 3 + 2]) << 0);
  }
}

void KeyGenerator(uint32_t key_1[4], uint32_t key_2[4],
                  uint32_t key_3[4], uint8_t mask[], char *type) {
  uint8_t aes_data[16];
  char test_type[5] = "KINGO";
  bool is_kingo = strncmp(type, test_type, strlen(type)) == 0 ? true : false;
  uint8_t aesKey[16] = {
    0x10, 0x12, 0x12, 0x45,
    0x78, 0x79, 0x45, 0x12,
    0x12, 0x14, 0x54, 0x55,
    0x87, 0x78, 0x15, 0x45
};

  FillAesData(aes_data, mask, 0, 16);

  aes_encrypt(aes_data, aesKey);
  FillKey(key_1, aes_data);

  if (is_kingo) {
    FillAesData(aes_data, mask, 16, 4);
  } else {
    FillAesData(aes_data, mask, 16, 14);
  }

  aes_encrypt(aes_data, aesKey);
  FillKey(key_2, aes_data);

  aes_encrypt(aes_data, aesKey);
  FillKey(key_3, aes_data);
}

//Function time_range "24 hrs format"
uint16_t CalculateTimeRange(uint8_t second, uint8_t minute, uint8_t hour) {
  uint16_t total_seconds = second + minute * 60 + (hour + 3) * 60;

  total_seconds = total_seconds % 21600;

  return ((uint16_t)((((double)total_seconds) / 21600) * 511));
}

uint32_t RSA_Encrypt_with_Custom_Key(uint32_t message, uint32_t public_key, uint32_t N_Mod)
{
	uint32_t i	=	1;
	uint64_t Cipher_Message	=	1;

	while(i<= public_key)
	{
		Cipher_Message	=	(Cipher_Message*message)%N_Mod;
		i	=	i+1;
	}

	return ((uint32_t) Cipher_Message);
}

uint32_t GetToken(uint8_t second, uint8_t minute, uint8_t hour, uint16_t day_of_year)  {
  uint16_t time_range = CalculateTimeRange(second, minute, hour);
  volatile uint32_t token_base = ((( (uint32_t) time_range) & 0x1ff) << 4) | ((uint32_t) (day_of_year & 0x0f));
  volatile uint32_t token = 0;
  token = RSA_Encrypt_with_Custom_Key(token_base, 1399, 10001);//1399//7
  token = token % 10000;
  return token;
}

uint64_t CodeGenerationSpeckAlgorithm(uint32_t kingo_id, uint8_t second,
                                      uint8_t minute, uint8_t hour,
                                      uint16_t day_of_year, uint8_t year_mod,
                                      uint8_t plan, uint32_t key_1[4],
                                      uint32_t key_2[4], uint32_t key_3[4]) {
  __android_log_print(ANDROID_LOG_ERROR, "DATOS", "DATOS %i- %i- %i - %i - %i - %i - %i <-------< ",  kingo_id, second, minute, hour, day_of_year, year_mod, plan);
  uint16_t time_range = CalculateTimeRange(second, minute, hour);
  uint64_t message_plain_text = 0;
  message_plain_text = (((uint64_t)(kingo_id & 0x7FFFFFF)) << 26) |
                       (((uint64_t)(time_range & 0x1FF)) << 17) |
                       (((uint64_t)(plan & 0x3F)) << 9) |
                       (((uint64_t)(year_mod & 0x03)) << 15) |
                       (((uint64_t)(day_of_year & 0x1FF)));
  __android_log_print(ANDROID_LOG_ERROR, "message_plain_text", "message_plain_text ---> %li",  message_plain_text);
  uint32_t message_plain_text_array[2] = {
    (uint32_t)((message_plain_text >> 24) & 0x0000000000FFFFFF),
    (uint32_t)(message_plain_text & 0x0000000000FFFFFF)
  };

  uint32_t message_cipher_text_array[2] = {0, 0};

  speck_encrypt_combined(message_plain_text_array, message_cipher_text_array,
                         key_1);

  uint64_t code_generated = 0;
  code_generated = (message_plain_text & 0x001F000000000000) |
                   (((uint64_t)message_cipher_text_array[0]) << 24) |
                   ((uint64_t)message_cipher_text_array[1]);

  message_plain_text_array[0] = (uint32_t)((code_generated >> 29) &
                                 0x0000000000FFFFFF);
  message_plain_text_array[1] = (uint32_t)((code_generated >> 5) &
                                 0x0000000000FFFFFF);

  message_cipher_text_array[0] = 0;
  message_cipher_text_array[1] = 0;

  speck_encrypt_combined(message_plain_text_array, message_cipher_text_array,
                         key_2);

  code_generated = (((uint64_t)message_cipher_text_array[0]) << 29) |
                   (((uint64_t)message_cipher_text_array[1]) << 5) |
                   (code_generated & 0x000000000000001F);

  message_plain_text_array[0] = (uint32_t)((code_generated >> 29) &
                                 0x0000000000FFFFFF);
  message_plain_text_array[1] = (uint32_t)((code_generated >> 0) &
                                 0x0000000000FFFFFF);

  message_cipher_text_array[0] = 0;
  message_cipher_text_array[1] = 0;

  speck_encrypt_combined(message_plain_text_array, message_cipher_text_array,
                         key_3);

  code_generated = (((uint64_t)message_cipher_text_array[0]) << 29) |
                   (((uint64_t)message_cipher_text_array[1]) << 0) |
                   (code_generated & 0x000000001F000000);

  return code_generated;
}

uint8_t CodeDecryptionSpeckAlgorithm(uint32_t kingo_id,
                                        uint64_t code_received,
                                        uint16_t day_of_year, uint8_t year_mod,
                                        uint32_t key_1[4], uint32_t key_2[4],
                                        uint32_t key_3[4]) {

  uint64_t original_message_plain_text = 0;
  uint32_t message_plain_text_array[2] = {0, 0};
  uint32_t message_cipher_text_array[2] = {0, 0};

  message_cipher_text_array[0] = (uint32_t)((code_received >> 29) &
                                  0x0000000000FFFFFF);
  message_cipher_text_array[1] = (uint32_t)((code_received >> 0) &
                                  0x0000000000FFFFFF);

  speck_decrypt_combined(message_cipher_text_array, message_plain_text_array,
                         key_3);

  original_message_plain_text = (((uint64_t)message_plain_text_array[0]) << 29) |
                                (((uint64_t)message_plain_text_array[1]) << 0) |
                                (code_received & 0x000000001F000000);

  message_plain_text_array[0] = 0;
  message_plain_text_array[1] = 0;

  message_cipher_text_array[0] = (uint32_t)((original_message_plain_text >> 29)
                                  & 0x0000000000FFFFFF);
  message_cipher_text_array[1] = (uint32_t)((original_message_plain_text >> 5)
                                  & 0x0000000000FFFFFF);

  speck_decrypt_combined(message_cipher_text_array, message_plain_text_array,
                         key_2);

  original_message_plain_text = (((uint64_t)message_plain_text_array[0]) << 29) |
                                (((uint64_t)message_plain_text_array[1]) << 5) |
                                (original_message_plain_text & 0x1F);

  message_plain_text_array[0] = 0;
  message_plain_text_array[1] = 0;

  message_cipher_text_array[0] = (uint32_t)((original_message_plain_text >> 24) &
                                  0x0000000000FFFFFF);
  message_cipher_text_array[1] = (uint32_t)(original_message_plain_text &
                                  0x0000000000FFFFFF);

  speck_decrypt_combined(message_cipher_text_array, message_plain_text_array,
                         key_1);

  original_message_plain_text = (original_message_plain_text & 0x001F000000000000) |
                                (((uint64_t)message_plain_text_array[0]) << 24) |
                                (((uint64_t)message_plain_text_array[1]));

  uint8_t plan = 255;
  uint32_t kingo_id_From_Code = (uint32_t)((original_message_plain_text >> 26) &
                                 0x0000000007FFFFFF);

  uint8_t plan_From_Code = (uint16_t)((original_message_plain_text >> 9) &
                            0x000000000000003F);

  uint16_t day_of_year_From_Code = (uint16_t)((original_message_plain_text >> 0) &
                                    0x00000000000001FF);
  uint8_t year_mod_From_Code = (uint8_t)((original_message_plain_text >> 15) &
                                0x0000000000000003);
  //uint16_t time_range_From_Code = (uint16_t) ((original_message_plain_text >> 17) & 0x00000000000001FF);

  if (kingo_id_From_Code == kingo_id) {
    if (year_mod_From_Code == year_mod) {
      if (day_of_year_From_Code + 90 >= day_of_year) {
        if (plan_From_Code < 64) {
          plan = plan_From_Code;
        }
      }
    }
    else
    {
    }
  }
  else
  {
    plan = 255;
  }

  return plan;
}

// Safety Pig
// Source: https://www.quora.com/What-is-the-best-comment-in-a-source-code-that-you-have-ever-encountered
//
//  _._ _..._ .-',     _.._(`))
// '-. `     '  /-._.-'    ',/
//    )         \            '.
//   / _    _    |             \
//  |  a    a    /              |
//  \   .-.                     ;
//   '-('' ).-'       ,'       ;
//      '-;           |      .'
//         \           \    /
//         | 7  .__  _.-\   \
//         | |  |  ``/  /`  /
//        /,_|  |   /,_/   /
//           /,_/      '`-'
extern char *GenerateCodeV5(uint32_t kingo_id, uint8_t second, uint8_t minute,
                            uint8_t hour, uint16_t day, uint8_t year, uint8_t plan,
                            char mask[20]) {
  uint64_t code;
  uint32_t key_1[4];
  uint32_t key_2[4];
  uint32_t key_3[4];
  char string_code[17];
  uint8_t int_mask[20];
  char type[5] = "KINGO";

  for (int index = 0; index < 20; index++) {
    int_mask[index] = (mask[index] - 48);
  }

  KeyGenerator(key_1, key_2, key_3, int_mask, type);

  code = CodeGenerationSpeckAlgorithm(kingo_id, second, minute, hour, day, year, plan, key_1, key_2, key_3);
   __android_log_print(ANDROID_LOG_ERROR, "CodeGenerator", "CODIGO 1---> %i",  code);
  sprintf(string_code, "%16llu", code);

  return strdup(string_code);
}



//inicio de algoritmo de generación de creditos
uint64_t CreditGenerationSpeckAlgorithm(uint32_t destination_id, uint8_t credit_type,
                                        uint16_t amount, uint32_t origin_id,
                                        uint8_t count_codes, uint8_t year_mod,
                                        uint16_t day_of_year, uint32_t key_1[4],
                                        uint32_t key_2[4], uint32_t key_3[4]) {
  uint64_t message_plain_text = 0;
  message_plain_text = (((uint64_t)(destination_id & 0x1FFFF)) << 46) |
                       (((uint64_t)(credit_type & 0xF)) << 42) |
                       (((uint64_t)(amount & 0xFF)) << 34) |
                       (((uint64_t)(origin_id & 0x1FFFF)) << 17) |
                       (((uint64_t)(count_codes & 0x1F)) << 12) |
                       (((uint64_t)(year_mod & 0x7)) << 9) |
                       (((uint64_t)(day_of_year & 0x1FF << 0)));

  uint32_t message_plain_text_array[2] = {
    (uint32_t)((message_plain_text >> 24) & 0x0000000000FFFFFF),
    (uint32_t)(message_plain_text & 0x0000000000FFFFFF)
  };

  uint32_t message_cipher_text_array[2] = {0, 0};

  speck_encrypt_combined(message_plain_text_array, message_cipher_text_array,
                         key_1);

  uint64_t code_generated = 0;
  code_generated = (message_plain_text & 0x7FFF000000000000) |
                   (((uint64_t)message_cipher_text_array[0]) << 24) |
                   ((uint64_t)message_cipher_text_array[1]);

  message_plain_text_array[0] = (uint32_t)((code_generated >> 39) &
                                 0x0000000000FFFFFF);
  message_plain_text_array[1] = (uint32_t)((code_generated >> 15) &
                                 0x0000000000FFFFFF);

  message_cipher_text_array[0] = 0;
  message_cipher_text_array[1] = 0;

  speck_encrypt_combined(message_plain_text_array, message_cipher_text_array,
                         key_2);

  code_generated = (((uint64_t)message_cipher_text_array[0]) << 39) |
                   (((uint64_t)message_cipher_text_array[1]) << 15) |
                   (code_generated & 0x0000000000007FFF);

  message_plain_text_array[0] = (uint32_t)((code_generated >> 39) &
                                 0x0000000000FFFFFF);
  message_plain_text_array[1] = (uint32_t)((code_generated >> 0) &
                                 0x0000000000FFFFFF);

  message_cipher_text_array[0] = 0;
  message_cipher_text_array[1] = 0;

  speck_encrypt_combined(message_plain_text_array, message_cipher_text_array,
                         key_3);

  code_generated = (((uint64_t)message_cipher_text_array[0]) << 39) |
                   (((uint64_t)message_cipher_text_array[1]) << 0) |
                   (code_generated & 0x0000007FFF000000);

  return code_generated;
}

char *GenerateCreditV5(uint32_t destination_id, uint8_t credit_type,
                       uint16_t amount, uint32_t origin_id,
                       uint8_t count_codes, uint8_t year_mod,
                       uint16_t day_of_year, char *mask) {
  uint64_t code;
  char string_credit[20] = "";
  char new_credit[21] = "";
  char credit_final[20] = "";
  uint32_t key_1[4] = {0};
  uint32_t key_2[4] = {0};
  uint32_t key_3[4] = {0};
  uint8_t int_mask[30] = {0};
  uint8_t index = 0;
  char type[3] = "POS";

  for (index; index < 30; index++) {
    int_mask[index] = (mask[index] - 48);
  }

  KeyGenerator(key_1, key_2, key_3, int_mask, type);

  code = CreditGenerationSpeckAlgorithm(destination_id, credit_type, amount, origin_id, count_codes, year_mod, day_of_year, key_1, key_2, key_3);
  sprintf(string_credit, "%19llu", code);

  for (int i = 0; i < 19; i++) {
    if (string_credit[i] == 32) {
      string_credit[i] = 48;
    }
    new_credit[i] = string_credit[i];
  }
  char damm = CheckSum(new_credit);
  strncat(new_credit, &damm, 1);

  return strdup(new_credit);
}

char *CreditDecryptionSpeckAlgorithm(uint64_t code_received,
                                       uint32_t *key_1, uint32_t *key_2,
                                       uint32_t *key_3) {
//  __android_log_print(ANDROID_LOG_ERROR, "CodeGenerator", "code_received %llu", code_received);
  uint64_t original_message_plain_text = 0;
  uint32_t message_plain_text_array[2] = {0, 0};
  uint32_t message_cipher_text_array[2] = {0, 0};
  char info_credit[30] = {0};

  message_cipher_text_array[0] = (uint32_t)((code_received >> 39) &
                                  0x0000000000FFFFFF);
  message_cipher_text_array[1] = (uint32_t)((code_received >> 0) &
                                  0x0000000000FFFFFF);

  speck_decrypt_combined(message_cipher_text_array, message_plain_text_array, key_3);

  original_message_plain_text = (((uint64_t)message_plain_text_array[0]) << 39) |
                                (((uint64_t)message_plain_text_array[1]) << 0) |
                                (code_received & 0x0000007FFF000000);

  message_plain_text_array[0] = 0;
  message_plain_text_array[1] = 0;

  message_cipher_text_array[0] = (uint32_t)((original_message_plain_text >> 39)
                                  & 0x0000000000FFFFFF);
  message_cipher_text_array[1] = (uint32_t)((original_message_plain_text >> 15)
                                  & 0x0000000000FFFFFF);

  speck_decrypt_combined(message_cipher_text_array, message_plain_text_array, key_2);

  original_message_plain_text = (((uint64_t)message_plain_text_array[0]) << 39) |
                                (((uint64_t)message_plain_text_array[1]) << 15) |
                                (original_message_plain_text & 0x0000000000007FFF);

  message_plain_text_array[0] = 0;
  message_plain_text_array[1] = 0;

  message_cipher_text_array[0] = (uint32_t)((original_message_plain_text >> 24) &
                                  0x0000000000FFFFFF);
  message_cipher_text_array[1] = (uint32_t)(original_message_plain_text &
                                  0x0000000000FFFFFF);

  speck_decrypt_combined(message_cipher_text_array, message_plain_text_array, key_1);

  original_message_plain_text = (original_message_plain_text & 0x7FFF000000000000) |
                                (((uint64_t)message_plain_text_array[0]) << 24) |
                                (((uint64_t)message_plain_text_array[1]));

  uint32_t destination_id = (uint32_t)((original_message_plain_text >> 46) &
                                 0x000000000001FFFF);

  char destination_id_str[6] = {0};
  sprintf(destination_id_str, "%lu", destination_id);
  strncat(info_credit, &destination_id_str, strlen(destination_id_str));
  strncat(info_credit, "|", 1);

  uint8_t credit_type = (uint8_t)((original_message_plain_text >> 42) &
                         0x000000000000000F);
  char credit_type_srt[2] = {0};
  sprintf(credit_type_srt, "%u", credit_type);
  strncat(info_credit, &credit_type_srt, strlen(credit_type_srt));
  strncat(info_credit, "|", 1);

  uint16_t amount = (uint16_t)((original_message_plain_text >> 34) &
                    0x00000000000000FF);
  char amount_srt[3] = {0};
  sprintf(amount_srt, "%u", amount);
  strncat(info_credit, &amount_srt, strlen(amount_srt));
  strncat(info_credit, "|", 1);


  uint32_t origin_id = (uint32_t)((original_message_plain_text >> 17) &
                       0x000000000001FFFF);
  char origin_id_str[6] = {0};
  sprintf(origin_id_str, "%lu", origin_id);
  strncat(info_credit, &origin_id_str, strlen(origin_id_str));
  strncat(info_credit, "|", 1);


  uint8_t count_codes = (uint8_t)((original_message_plain_text >> 12) &
                         0x000000000000001F);

  char count_codes_str[2] = {0};
  sprintf(count_codes_str, "%u", count_codes);
  strncat(info_credit, &count_codes_str, strlen(count_codes_str));
  strncat(info_credit, "|", 1);


  uint8_t year_mod = (uint8_t)((original_message_plain_text >> 9) &
                         0x0000000000000007);

  char year_mod_str[1] = {0};
  sprintf(year_mod_str, "%u", year_mod);
  strncat(info_credit, &year_mod_str, strlen(year_mod_str));
  strncat(info_credit, "|", 1);

  uint16_t day_of_year = (uint16_t)((original_message_plain_text >> 0) &
                         0x00000000000001FF);
  char day_of_year_str[3] = {0};
  sprintf(day_of_year_str, "%u", day_of_year);
  strncat(info_credit, &day_of_year_str, strlen(day_of_year_str));

  return strdup(info_credit);

}

char *DecodeCreditV5(char code_received[20], char mask[30]) {

  uint32_t key_1[4];
  uint32_t key_2[4];
  uint32_t key_3[4];
  uint8_t mask_int[30];
  char type[3] = "POS";
  uint64_t code_int = 0;
  char new_credit[20] = {0};
  char caracter;
  int zero_count = 0;
  int length = strlen(code_received);
  bool is_valid = Validate(code_received);

  if(is_valid) {

    for (int i = 0; i <= length; i++) {
       if (code_received[i] == 48) {
          zero_count++;
      } else {
        break;
      }
    }
    if(zero_count >= 0) {
      for(int i = zero_count; i <= length; i++) {
        caracter = code_received[i];
        strncat(new_credit, &caracter, 1);
      }
      length = strlen(new_credit);
      new_credit[length-1] = "\0";
      code_int = strtoull(new_credit, NULL, 0);
    } else {
      for(int i = 0; i <= length; i++) {
        caracter = code_received[i];
        strncat(new_credit, &caracter, 1);
      }
      length = strlen(new_credit);
      new_credit[length-1] = "\0";
      code_int = strtoull(new_credit, NULL, 0);
    }

    for (int i = 0; i < 30; i++) {
      mask_int[i] = (mask[i] - 48);
    }
    KeyGenerator(key_1, key_2, key_3, mask_int, type);

    char *credit_info = CreditDecryptionSpeckAlgorithm(code_int, key_1, key_2, key_3);
    return strdup(credit_info);
  } else {
    return strdup("99");
  }
}


char* decodeToString(uint8_t Plan, uint32_t Kingo_ID_From_Code, uint8_t Plan_From_Code, uint16_t Day_of_Year_From_Code, uint8_t Year_Mod_From_Code, uint16_t Time_Range_From_Code) {
     // __android_log_print(ANDROID_LOG_ERROR, "CodeGenerator", "decodeToString");
  char Plan_srt[5] = {0};
  char Kingo_ID_From_Code_srt[10] = {0};
  char Plan_From_Code_srt[5] = {0};
  char Day_of_Year_From_Code_srt[5] = {0};
  char Year_Mod_From_Code_srt[5] = {0};
  char Time_Range_From_Code_srt[10] = {0};

  char string_info[100] = {"\0"};
  if (Plan == 255) {
    sprintf(Plan_srt, "%u", Plan);
    strcat(string_info, Plan_srt);
    strcat(string_info, "|");
  }
  else {
    sprintf(Plan_srt, "%u", Plan);
    strcat(string_info, Plan_srt);
    strcat(string_info, "|");
    sprintf(Kingo_ID_From_Code_srt, "%lu", Kingo_ID_From_Code);
    strcat(string_info, Kingo_ID_From_Code_srt);
    strcat(string_info, "|");
    sprintf(Plan_From_Code_srt, "%u", Plan_From_Code);
    strcat(string_info, Plan_From_Code_srt);
    strcat(string_info, "|");
    sprintf(Day_of_Year_From_Code_srt, "%u", Day_of_Year_From_Code);
    strcat(string_info, Day_of_Year_From_Code_srt);
    strcat(string_info, "|");
    sprintf(Year_Mod_From_Code_srt, "%u", Year_Mod_From_Code);
    strcat(string_info, Year_Mod_From_Code_srt);
    strcat(string_info, "|");
    sprintf(Time_Range_From_Code_srt, "%u", Time_Range_From_Code);
    strcat(string_info, Time_Range_From_Code_srt);
  }
  return strdup(string_info);

}


extern char* DecodeKingoModelV3(uint32_t Kingo_ID, char Code_Received_String[16],  char mask[20])
{
	uint64_t Original_Message_Plain_Text	=	0;
	uint32_t Message_Plain_Text_Array[2]	=	{0,0};
	uint32_t Message_Cipher_Text_Array[2]	=	{0,0};
  uint8_t mask_int[20];
  uint32_t Key_1[4];
  uint32_t Key_2[4];
  uint32_t Key_3[4];
  uint64_t Code_Received = strtoull(Code_Received_String, NULL, 0);;
  char type[5] = "KINGO";

  for (int i = 0; i < 20; i++) {
    mask_int[i] = (mask[i] - 48);
  }

  KeyGenerator(Key_1, Key_2, Key_3, mask_int, type);
  /* for (int i = 0; i <= 3; i++)
  {
    __android_log_print(ANDROID_LOG_ERROR, "CodeGenerator", "Key_1[%d] = %lu", i, Key_1[i]);
    __android_log_print(ANDROID_LOG_ERROR, "CodeGenerator", "Key_2[%d] = %lu", i, Key_2[i]);
    __android_log_print(ANDROID_LOG_ERROR, "CodeGenerator", "Key_3[%d] = %lu", i, Key_3[i]);
  } */

  Message_Cipher_Text_Array[0]	=	(uint32_t) ((Code_Received >> 29) & 0x0000000000FFFFFF);
	Message_Cipher_Text_Array[1]	=	(uint32_t) ((Code_Received >> 0)  & 0x0000000000FFFFFF);
	speck_decrypt_combined(Message_Cipher_Text_Array, Message_Plain_Text_Array,  Key_3);
	Original_Message_Plain_Text		=	(((uint64_t) Message_Plain_Text_Array[0]) << 29)	|
										(((uint64_t) Message_Plain_Text_Array[1]) <<  0)	|
										(Code_Received & 0x000000001F000000);
	Message_Plain_Text_Array[0]	=	0;
	Message_Plain_Text_Array[1]	=	0;

	Message_Cipher_Text_Array[0]	=	(uint32_t) ((Original_Message_Plain_Text >> 29) & 0x0000000000FFFFFF);
	Message_Cipher_Text_Array[1]	=	(uint32_t) ((Original_Message_Plain_Text >> 5)  & 0x0000000000FFFFFF);
	speck_decrypt_combined(Message_Cipher_Text_Array, Message_Plain_Text_Array,  Key_2);
	Original_Message_Plain_Text		=	(((uint64_t) Message_Plain_Text_Array[0]) << 29)	|
										(((uint64_t) Message_Plain_Text_Array[1]) <<  5)	|
										(Original_Message_Plain_Text & 0x1F);

	Message_Plain_Text_Array[0]	=	0;
	Message_Plain_Text_Array[1]	=	0;

	Message_Cipher_Text_Array[0]	=	(uint32_t) ((Original_Message_Plain_Text	 >> 24) & 0x0000000000FFFFFF);
	Message_Cipher_Text_Array[1]	=	(uint32_t) (Original_Message_Plain_Text	 & 0x0000000000FFFFFF);
	speck_decrypt_combined(Message_Cipher_Text_Array, Message_Plain_Text_Array,  Key_1);
	Original_Message_Plain_Text		=	(Original_Message_Plain_Text & 0x001F000000000000)	|
										(((uint64_t) Message_Plain_Text_Array[0]) << 24)	|
										(((uint64_t) Message_Plain_Text_Array[1]));
	uint8_t Plan	=	255;
	uint32_t Kingo_ID_From_Code		=	(uint32_t) ((Original_Message_Plain_Text >> 26) & 0x0000000007FFFFFF);
	uint8_t Plan_From_Code			=	(uint16_t) ((Original_Message_Plain_Text >>  9) & 0x000000000000003F);
	uint16_t Day_of_Year_From_Code	=	(uint16_t) ((Original_Message_Plain_Text >>  0) & 0x00000000000001FF);
	uint8_t Year_Mod_From_Code	=		(uint8_t) ((Original_Message_Plain_Text >>  15) & 0x0000000000000003);
	uint16_t Time_Range_From_Code	=	(uint16_t) ((Original_Message_Plain_Text >> 17) & 0x00000000000001FF);

	if(Kingo_ID_From_Code == Kingo_ID)
	{
    if(Plan_From_Code < 64)
		{
			Plan	=	Plan_From_Code;
		}
		else
		{
			Plan	=	255;
		}

	}
	else
	{
		Plan	=	255;	//Invalid
	}
  char *code_info = decodeToString(Plan,Kingo_ID_From_Code,Plan_From_Code,Day_of_Year_From_Code,Year_Mod_From_Code,Time_Range_From_Code);

	return strdup(code_info);
}

