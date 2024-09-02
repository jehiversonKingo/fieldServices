#include <stdint.h>
#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include "./aes/AES.h"
#include "./speck/Speck.h"
#include <android/log.h>

void Key_Generator_Coupon(uint32_t Key_1[4], uint32_t Key_2[4], uint32_t Key_3[4], uint8_t Kingo_ID[10], uint8_t Shop_Keeper_ID[10])
{
	uint8_t AES_Data[16];
	uint8_t AES_Key[16] = { 0x48,0x61,0x72,0x64,
							0x77,0x61,0x72,0x65,
							0x20,0x52,0x75,0x6c,
							0x65,0x73,0x21,0x21 };

	//First Key
	uint8_t i = 0;
	for (i = 0; i < 16; i++)
	{
		if(i<10)
			AES_Data[i] = Kingo_ID[i];
		else
			AES_Data[i] = Shop_Keeper_ID[i-10];
	}
	aes_encrypt(AES_Data, AES_Key);

	for (i = 0; i < 4; i++)
	{
		Key_1[i] = (((uint32_t)AES_Data[i * 3]) << 16) | (((uint32_t)AES_Data[i * 3 + 1]) << 8) | (((uint32_t)AES_Data[i * 3 + 2]) << 0);
	}

	//Second Key
	for (i = 0; i < 16; i++)
	{
		if (i<10)
			AES_Data[i] = Shop_Keeper_ID[i];
		else
			AES_Data[i] = Kingo_ID[i - 10];
	}
	aes_encrypt(AES_Data, AES_Key);

	for (i = 0; i < 4; i++)
	{
		Key_2[i] = (((uint32_t)AES_Data[i * 3]) << 16) | (((uint32_t)AES_Data[i * 3 + 1]) << 8) | (((uint32_t)AES_Data[i * 3 + 2]) << 0);
	}

	for (i = 0; i < 16; i++)
	{
		if (i<8)
			AES_Data[i] = Kingo_ID[i+2];
		else
			AES_Data[i] = Shop_Keeper_ID[i - 6];
	}
	aes_encrypt(AES_Data, AES_Key);

	for (i = 0; i < 4; i++)
	{
		Key_3[i] = (((uint32_t)AES_Data[i * 3]) << 16) | (((uint32_t)AES_Data[i * 3 + 1]) << 8) | (((uint32_t)AES_Data[i * 3 + 2]) << 0);
	}
}



uint64_t Coupon_Generation(uint32_t Kingo_ID, uint8_t CheckS, uint8_t Coupon_Type, uint16_t Random, uint8_t Type, uint32_t Key_1[4], uint32_t Key_2[4], uint32_t Key_3[4])
{
	//uint16_t Time_Range	=	Calculate_Time_Range(Second, Minute, Hour);
	uint64_t Message_Plain_Text = 0;
	Message_Plain_Text =	(((uint64_t)(Kingo_ID & 0x3FFFFFFF)) << 23) |
							(((uint64_t)(CheckS & 0x0F)) << 19) |
							(((uint64_t)(Coupon_Type & 0x3F)) << 13) |
							(((uint64_t)(Random & 0x1FF)) << 4) |
							(((uint64_t)(Type & 0x0F)));

	//__no_operation();

	uint32_t Message_Plain_Text_Array[2] = { (uint32_t)((Message_Plain_Text >> 24) & 0x0000000000FFFFFF) ,
		(uint32_t)(Message_Plain_Text & 0x0000000000FFFFFF) };
	uint32_t Message_Cipher_Text_Array[2] = { 0,0 };

	//__no_operation();

	speck_encrypt_combined(Message_Plain_Text_Array, Message_Cipher_Text_Array, Key_1);
	//__no_operation();
	uint64_t Code_Generated = 0;
	Code_Generated = Message_Plain_Text & 0x001F000000000000 |
		(((uint64_t)Message_Cipher_Text_Array[0]) << 24) |
		((uint64_t)Message_Cipher_Text_Array[1]);
	//__no_operation();
	Message_Plain_Text_Array[0] = (uint32_t)((Code_Generated >> 29) & 0x0000000000FFFFFF);
	Message_Plain_Text_Array[1] = (uint32_t)((Code_Generated >> 5) & 0x0000000000FFFFFF);
	//__no_operation();
	Message_Cipher_Text_Array[0] = 0;
	Message_Cipher_Text_Array[1] = 0;

	speck_encrypt_combined(Message_Plain_Text_Array, Message_Cipher_Text_Array, Key_2);
	//__no_operation();
	Code_Generated = (((uint64_t)Message_Cipher_Text_Array[0]) << 29) |
		(((uint64_t)Message_Cipher_Text_Array[1]) << 5) |
		(Code_Generated & 0x000000000000001F);
	//__no_operation();
	Message_Plain_Text_Array[0] = (uint32_t)((Code_Generated >> 29) & 0x0000000000FFFFFF);
	Message_Plain_Text_Array[1] = (uint32_t)((Code_Generated >> 0) & 0x0000000000FFFFFF);
	//__no_operation();
	Message_Cipher_Text_Array[0] = 0;
	Message_Cipher_Text_Array[1] = 0;

	speck_encrypt_combined(Message_Plain_Text_Array, Message_Cipher_Text_Array, Key_3);
	//__no_operation();
	Code_Generated = (((uint64_t)Message_Cipher_Text_Array[0]) << 29) |
		(((uint64_t)Message_Cipher_Text_Array[1]) << 0) |
		(Code_Generated & 0x000000001F000000);
	//__no_operation();
	return Code_Generated;
}


char *CouponGeneration(char *Kingo_ID, uint8_t CheckS, uint8_t Coupon_Type, uint16_t random, uint8_t Type) {
  uint32_t key_1[4];
  uint32_t key_2[4];
  uint32_t key_3[4];
  uint8_t kingo_ID[10];
  uint8_t shop_keeper_ID[10];
  uint32_t k_id;
  char string_kingo_id[10];
  char *ptr;
  char string_coupon[16] = "";

  for (int index = 0; index < 10; index++) {
    string_kingo_id[index] = Kingo_ID[index];
    kingo_ID[index] = (Kingo_ID[index] - 48);
    shop_keeper_ID[index] = (Kingo_ID[index + 10] - 48);
  }

  k_id = strtoul(string_kingo_id, NULL, 10);
  Key_Generator_Coupon(key_1, key_2, key_3, kingo_ID, shop_keeper_ID);


  uint64_t coupon_code = Coupon_Generation(k_id, CheckS, Coupon_Type, random, Type, key_1, key_2, key_3);

  sprintf(string_coupon, "%16llu", coupon_code);

  return strdup(string_coupon);
}


char *Coupon_Decryption(uint32_t Kingo_ID, uint64_t Code_Received, uint8_t Checksum_Received[1], uint8_t Coupon_Type_Received[1], uint16_t Random_Received[1], uint8_t Type_Received[1], uint32_t Key_1[4], uint32_t Key_2[4], uint32_t Key_3[4])
{
  char coupon_info[25] = {"\0"};
	uint64_t Original_Message_Plain_Text = 0;
	uint32_t Message_Plain_Text_Array[2] = { 0,0 };
	uint32_t Message_Cipher_Text_Array[2] = { 0,0 };

	Message_Cipher_Text_Array[0] = (uint32_t)((Code_Received >> 29) & 0x0000000000FFFFFF);
	Message_Cipher_Text_Array[1] = (uint32_t)((Code_Received >> 0) & 0x0000000000FFFFFF);
	//__no_operation();
	speck_decrypt_combined(Message_Cipher_Text_Array, Message_Plain_Text_Array, Key_3);
	//__no_operation();
	Original_Message_Plain_Text = (((uint64_t)Message_Plain_Text_Array[0]) << 29) |
		(((uint64_t)Message_Plain_Text_Array[1]) << 0) |
		(Code_Received & 0x000000001F000000);
	//__no_operation();
	Message_Plain_Text_Array[0] = 0;
	Message_Plain_Text_Array[1] = 0;

	Message_Cipher_Text_Array[0] = (uint32_t)((Original_Message_Plain_Text >> 29) & 0x0000000000FFFFFF);
	Message_Cipher_Text_Array[1] = (uint32_t)((Original_Message_Plain_Text >> 5) & 0x0000000000FFFFFF);
	//__no_operation();
	speck_decrypt_combined(Message_Cipher_Text_Array, Message_Plain_Text_Array, Key_2);
	//__no_operation();
	Original_Message_Plain_Text = (((uint64_t)Message_Plain_Text_Array[0]) << 29) |
		(((uint64_t)Message_Plain_Text_Array[1]) << 5) |
		(Original_Message_Plain_Text & 0x1F);

	//__no_operation();
	Message_Plain_Text_Array[0] = 0;
	Message_Plain_Text_Array[1] = 0;

	Message_Cipher_Text_Array[0] = (uint32_t)((Original_Message_Plain_Text >> 24) & 0x0000000000FFFFFF);
	Message_Cipher_Text_Array[1] = (uint32_t)(Original_Message_Plain_Text & 0x0000000000FFFFFF);
	//__no_operation();
	speck_decrypt_combined(Message_Cipher_Text_Array, Message_Plain_Text_Array, Key_1);
	//__no_operation();
	Original_Message_Plain_Text = (Original_Message_Plain_Text & 0x001F000000000000) |
		(((uint64_t)Message_Plain_Text_Array[0]) << 24) |
		(((uint64_t)Message_Plain_Text_Array[1]));


	uint32_t Kingo_ID_From_Code =	(uint32_t)((Original_Message_Plain_Text >> 23) &	0x000000003FFFFFFF);
	Checksum_Received[0] =			(uint8_t)((Original_Message_Plain_Text >> 19) &		0x000000000000000F);
	Coupon_Type_Received[0] =		(uint8_t)((Original_Message_Plain_Text >> 13) &		0x000000000000003F);
	Random_Received[0] =			(uint8_t)((Original_Message_Plain_Text >> 4) &		0x00000000000001FF);
	Type_Received[0] =				(uint8_t)((Original_Message_Plain_Text >> 0) &		0x000000000000000F);

  char Kingo_ID_From_Code_str[10] = {0};
  sprintf(Kingo_ID_From_Code_str, "%lu", Kingo_ID_From_Code);
  strncat(coupon_info, &Kingo_ID_From_Code_str, strlen(Kingo_ID_From_Code_str));
  strncat(coupon_info, "|", 1);

  char Checksum_Received_str[10] = {0};
  sprintf(Checksum_Received_str, "%u", Checksum_Received[0]);
  strncat(coupon_info, &Checksum_Received_str, strlen(Checksum_Received_str));
  strncat(coupon_info, "|", 1);

  char Coupon_Type_Received_str[10] = {0};
  sprintf(Coupon_Type_Received_str, "%u", Coupon_Type_Received[0]);
  strncat(coupon_info, &Coupon_Type_Received_str, strlen(Coupon_Type_Received_str));
  strncat(coupon_info, "|", 1);

  char Random_Received_str[10] = {0};
  sprintf(Random_Received_str, "%u", Random_Received[0]);
  strncat(coupon_info, &Random_Received_str, strlen(Random_Received_str));
  strncat(coupon_info, "|", 1);

  char Type_Received_str[10] = {0};
  sprintf(Type_Received_str, "%u", Type_Received[0]);
  strncat(coupon_info, &Type_Received_str, strlen(Type_Received_str));
  strncat(coupon_info, "|", 1);

	if (Kingo_ID_From_Code == Kingo_ID)
	{
    return strdup(coupon_info);
	}
	else
	{
		return strdup("0");
	}

}

char *CouponDecryption(char *Kingo_ID, char code[16]) {
  uint32_t key_1[4];
  uint32_t key_2[4];
  uint32_t key_3[4];
  uint8_t kingo_ID[10];
  uint8_t shop_keeper_ID[10];
  uint32_t k_id;
  char string_kingo_id[10] = {"\0"};
  uint64_t coupon_int = 0;
  uint8_t Checksum_Received[1] = {0};
  uint8_t Coupon_Type_Received[1] = {0};
  uint16_t Random_Received[1] = {0};
  uint8_t Type_Received[1] = {0};
  uint8_t info = 0;

  for (int i = 0; i < 10; i++) {
    string_kingo_id[i] = Kingo_ID[i];
    kingo_ID[i] = (Kingo_ID[i] - 48);
    shop_keeper_ID[i] = (Kingo_ID[i + 10] - 48);
  }

  coupon_int = strtoull(code, NULL, 0);

  k_id = strtoul(string_kingo_id, NULL, 10);
  Key_Generator_Coupon(key_1, key_2, key_3, kingo_ID, shop_keeper_ID);

  return Coupon_Decryption(k_id, coupon_int, Checksum_Received, Coupon_Type_Received, Random_Received, Type_Received, key_1, key_2, key_3);

}