#include <stdint.h>
#include <stdio.h>
#include <math.h>
#include <stdlib.h>

#ifndef KINGOLIBRARIES_PREPAY_ALGORITHM_SPECK_H_
#define KINGOLIBRARIES_PREPAY_ALGORITHM_SPECK_H_

uint64_t Coupon_Generation(uint32_t Kingo_ID, uint8_t CheckS, uint8_t Coupon_Type, uint16_t Random, uint8_t Type, uint32_t Key_1[4], uint32_t Key_2[4], uint32_t Key_3[4]);
extern char *CouponGeneration(char *Kingo_ID, uint8_t CheckS, uint8_t Coupon_Type, uint16_t random, uint8_t Type);

char *Coupon_Decryption(uint32_t Kingo_ID, uint64_t Code_Received, uint8_t Checksum_Received[1], uint8_t Coupon_Type_Received[1], uint16_t Random_Received[1], uint8_t Type_Received[1], uint32_t Key_1[4], uint32_t Key_2[4], uint32_t Key_3[4]);

extern char *CouponDecryption(char *Kingo_ID, char code[16]);

#endif /* KINGOLIBRARIES_PREPAY_ALGORITHM_SPECK_H_ */
