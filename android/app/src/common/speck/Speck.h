/*
 * Speck.h
 *
 *  Created on: 20/07/2017
 *      Author: Ernesto Lopez Chan
 */

#ifndef KINGOLIBRARIES_SPECK_H_
#define KINGOLIBRARIES_SPECK_H_


#include <stdint.h>

#define MASK24 0xFFFFFF
#define MASK48 0xFFFFFFFFFFFF

/*
 * define speck type to use (one of SPECK_32_64, SPECK_64_128, SPECK_128_256)
 */
//#define SPECK_32_64	0



/*
#ifdef SPECK_32_64
#define SPECK_TYPE uint16_t
#define SPECK_ROUNDS 22
#define SPECK_KEY_LEN 4
#endif

#ifdef SPECK_48_72
#define SPECK_TYPE uint32_t
#define SPECK_ROUNDS 22
#define SPECK_KEY_LEN 3
#define WORDSIZE 24
#endif

#ifdef SPECK_48_96
#define SPECK_TYPE uint32_t
#define SPECK_ROUNDS 23
#define SPECK_KEY_LEN 4
#define WORDSIZE 24
#endif

#ifdef SPECK_64_128
#define SPECK_TYPE uint32_t
#define SPECK_ROUNDS 27
#define SPECK_KEY_LEN 4
#endif

#ifdef SPECK_96_96
#define SPECK_TYPE uint64_t
#define SPECK_ROUNDS 28
#define SPECK_KEY_LEN 2
#define WORDSIZE 48
#endif

#ifdef SPECK_96_144
#define SPECK_TYPE uint64_t
#define SPECK_ROUNDS 29
#define SPECK_KEY_LEN 3
#define WORDSIZE 48
#endif

#ifdef SPECK_128_256
#define SPECK_TYPE uint64_t
#define SPECK_ROUNDS 34
#define SPECK_KEY_LEN 4
#endif
*/

#define SPECK_ROUNDS 23
#define SPECK_KEY_LEN 4
#define WORDSIZE 24

extern void speck_expand(uint32_t K[SPECK_KEY_LEN], uint32_t S[SPECK_ROUNDS]);
extern void speck_encrypt(uint32_t pt[2], uint32_t ct[2], uint32_t K[SPECK_ROUNDS]);
extern void speck_decrypt(uint32_t ct[2], uint32_t pt[2], uint32_t K[SPECK_ROUNDS]);


extern void speck_encrypt_combined(uint32_t pt[2], uint32_t ct[2], uint32_t K[SPECK_KEY_LEN]);
extern void speck_decrypt_combined(uint32_t ct[2], uint32_t pt[2], uint32_t K[SPECK_KEY_LEN]);



#endif /* KINGOLIBRARIES_SPECK_H_ */
