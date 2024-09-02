/*
 * Speck.c
 *
 *  Created on: 20/07/2017
 *      Author: Ernesto Lopez Chan
 */


#include "Speck.h"

#include <stdint.h>
#include <stdio.h>
#include <math.h>
#include <stdlib.h>	// for itoa() call


//#define SPECK_TYPE 	uint32_t


  // rotates for word size n=24 bits
  #define ROR(x, r) ((x >> r) | (x << (24 - r))&MASK24)&MASK24
  #define ROL(x, r) ((x << r) | (x >> (24 - r))&MASK24)&MASK24

  #define R(x, y, k) (x = ROR(x, 8), x = (x + y)&MASK24, x ^= k, y = ROL(y, 3), y ^= x)
  #define RR(x, y, k) (y ^= x, y = ROR(y, 3), x ^= k, x = (x - y)&MASK24, x = ROL(x, 8))


void speck_expand(uint32_t K[SPECK_KEY_LEN], uint32_t S[SPECK_ROUNDS])
{
	uint32_t i, b = K[0];
	uint32_t a[SPECK_KEY_LEN - 1];

  for (i = 0; i < (SPECK_KEY_LEN - 1); i++)
  {
    a[i] = K[i + 1];
  }
  S[0] = b;
  for (i = 0; i < SPECK_ROUNDS - 1; i++) {
    R(a[i % (SPECK_KEY_LEN - 1)], b, i);
    S[i + 1] = b;
  }
}

void speck_encrypt(uint32_t  pt[2], uint32_t ct[2], uint32_t K[SPECK_ROUNDS])
{
	uint32_t i;
  ct[0]=pt[0]; ct[1]=pt[1];

  for(i = 0; i < SPECK_ROUNDS; i++){
    R(ct[1], ct[0], K[i]);
  }
}

void speck_decrypt(uint32_t ct[2], uint32_t pt[2], uint32_t K[SPECK_ROUNDS])
{
	uint32_t i;
  pt[0]=ct[0]; pt[1]=ct[1];

  for(i = 0; i < SPECK_ROUNDS; i++){
    RR(pt[1], pt[0], K[(SPECK_ROUNDS - 1) - i]);
  }
}

void speck_encrypt_combined(uint32_t pt[2], uint32_t ct[2], uint32_t K[SPECK_KEY_LEN])
{
	uint32_t i, b = K[0];
	uint32_t a[SPECK_KEY_LEN - 1];
  ct[0]=pt[0]; ct[1]=pt[1];

  for (i = 0; i < (SPECK_KEY_LEN - 1); i++)
  {
    a[i] = K[i + 1];
  }

  R(ct[1], ct[0], b);
  for(i = 0; i < SPECK_ROUNDS - 1; i++){
    R(a[i % (SPECK_KEY_LEN - 1)], b, i);
    R(ct[1], ct[0], b);
  }
}

void speck_decrypt_combined(uint32_t ct[2], uint32_t pt[2], uint32_t K[SPECK_KEY_LEN])
{
  int i;
  uint32_t b = K[0];
  uint32_t a[SPECK_KEY_LEN - 1];
  pt[0]=ct[0]; pt[1]=ct[1];

  for (i = 0; i < (SPECK_KEY_LEN - 1); i++)
  {
    a[i] = K[i + 1];
  }

  for (i = 0; i < SPECK_ROUNDS - 1; i++)
  {
    R(a[i % (SPECK_KEY_LEN - 1)], b, i);
  }

  for(i = 0; i < SPECK_ROUNDS; i++){
    RR(pt[1], pt[0], b);
    RR(a[((SPECK_ROUNDS - 2) - i) % (SPECK_KEY_LEN - 1)], b, ((SPECK_ROUNDS - 2) - i));
  }
}


