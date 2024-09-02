/*
 *
 * Kingo Dev Team
 * 2017/11/16
 *
 *
 */

#ifdef generatev5code
#define generatev5code

#include <stdio.h>

char *GenerateCodeV5(uint32_t Kingo_ID,  uint8_t Second, uint8_t Minute,
    uint8_t Hour, uint16_t Day_of_Year, uint8_t Year_Mod, uint8_t Plan, uint8_t Mask[20]);


char *GenerateCreditV5(uint32_t destination_id, uint8_t credit_type,
                       uint16_t amount, uint32_t origin_id,
                       uint8_t count_codes, uint8_t year_mod,
                       uint16_t day_of_year, char *mask);

extern char *DecodeCreditV5(uint64_t code_received, char mask[30]);

extern uint32_t GetToken(uint8_t second, uint8_t minute, uint8_t hour, uint16_t day_of_year);

#endif
