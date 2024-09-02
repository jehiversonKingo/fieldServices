/*
 * Prepay_Algorithm_Speck.h
 *
 *  Created on: 10/08/2017
 *      Author: Ernesto Lopez
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

#ifndef KINGOLIBRARIES_PREPAY_ALGORITHM_SPECK_H_
#define KINGOLIBRARIES_PREPAY_ALGORITHM_SPECK_H_

extern uint64_t CODE_GENERATION_Speck_Algorithm(uint32_t Kingo_ID, uint8_t Second, uint8_t Minute, uint8_t Hour, uint16_t Day_of_Year, uint8_t Year_Mod_8, uint8_t Plan, uint32_t Key_1[4], uint32_t Key_2[4], uint32_t Key_3[4]);

extern uint8_t CODE_DECRYPTION_Speck_Algorithm(uint32_t Kingo_ID, uint64_t Code_Received, uint16_t Day_of_Year, uint8_t Year_Mod_8, uint32_t Key_1[4], uint32_t Key_2[4], uint32_t Key_3[4]);

extern char *DecodeCreditV5(uint64_t code_received, char mask[30]);

#endif /* KINGOLIBRARIES_PREPAY_ALGORITHM_SPECK_H_ */
