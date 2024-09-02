#include <stdint.h>
#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <android/log.h>

#define BIT0 0x01
#define BIT1 0x02
#define BIT2 0x04
#define BIT3 0x08
volatile uint8_t CREDIT_PLAN_HOUR	=	0;
volatile uint8_t CREDIT_PLAN_DAY = 1;
volatile uint8_t CREDIT_PLAN_WEEK =	2;
volatile uint8_t CREDIT_PLAN_MONTH = 3;
volatile uint8_t CREDIT_PLAN_TRIMESTER = 4;
volatile uint8_t CREDIT_PLAN_SEMESTER = 5;
volatile uint8_t CREDIT_PLAN_3_DAYS = 99;
volatile uint8_t CREDIT_PLAN_15_DAYS = 7;
volatile uint8_t CREDIT_PLAN_YEAR =	6;

volatile uint8_t KINGO_Mask[20] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
volatile uint8_t KINGO_Mask18[18] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};


volatile uint8_t iValidate[17] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
volatile uint8_t iMask[24] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
volatile uint8_t credit_plan;

volatile uint8_t codeBaseCredit[11] = {1, 2, 0, 1, 0, 2, 0, 1, 2, 1, 0};
volatile uint8_t codeBaseAdmin[11] = {0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1};
volatile uint8_t codeBaseService[11] = {1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1};
volatile uint8_t codeBaseSales[11] = {0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0};
volatile uint8_t codeBaseUnhacked[11] = {1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1};

void selectBase(char country[3])
{
  uint8_t k = 0;
  uint8_t codeBaseCredit_col[11]   = { 0, 2, 1, 0, 1, 2, 1, 0, 2, 0, 1 };
  uint8_t codeBaseCredit_gtm[11] = {1, 2, 0, 1, 0, 2, 0, 1, 2, 1, 0};

  if (strcmp(country, "col") == 0)
  {
    for (k = 0; k < 11; k++)
    {
      codeBaseCredit[k] = codeBaseCredit_col[k];
    }
  }
  else
  {
    for (k = 0; k < 11; k++)
    {
      codeBaseCredit[k] = codeBaseCredit_gtm[k];
    }
  }
}

void fillPlan(char country[3], uint8_t version)
{
  if (strcmp(country, "col") == 0) {
    switch (version)
    {
      case 3:
        selectBase("gtm");
        CREDIT_PLAN_DAY = 99;
        CREDIT_PLAN_HOUR	=	0;
        CREDIT_PLAN_3_DAYS = 1;
        CREDIT_PLAN_WEEK =	2;
        CREDIT_PLAN_MONTH = 3;
        CREDIT_PLAN_TRIMESTER = 4;
        CREDIT_PLAN_SEMESTER = 5;
        CREDIT_PLAN_YEAR =	6;
        CREDIT_PLAN_15_DAYS = 7;
        break;
      case 4:
        selectBase(country);
        CREDIT_PLAN_HOUR	=	0;
        CREDIT_PLAN_DAY = 1;
        CREDIT_PLAN_WEEK =	2;
        CREDIT_PLAN_MONTH = 3;
        CREDIT_PLAN_TRIMESTER = 4;
        CREDIT_PLAN_SEMESTER = 5;
        CREDIT_PLAN_3_DAYS = 6;
        CREDIT_PLAN_15_DAYS = 7;
        CREDIT_PLAN_YEAR =	99;
        break;
    }
  //__android_log_print(ANDROID_LOG_ERROR, "CodeGenerator", "CREDIT_PLAN_HOUR %u", CREDIT_PLAN_HOUR);
  //__android_log_print(ANDROID_LOG_ERROR, "CodeGenerator", "CREDIT_PLAN_3_DAYS %u", CREDIT_PLAN_3_DAYS);
  //__android_log_print(ANDROID_LOG_ERROR, "CodeGenerator", "CREDIT_PLAN_WEEK %u", CREDIT_PLAN_WEEK);
  //__android_log_print(ANDROID_LOG_ERROR, "CodeGenerator", "CREDIT_PLAN_MONTH %u", CREDIT_PLAN_MONTH);
  //__android_log_print(ANDROID_LOG_ERROR, "CodeGenerator", "CREDIT_PLAN_TRIMESTER %u", CREDIT_PLAN_TRIMESTER);
  //__android_log_print(ANDROID_LOG_ERROR, "CodeGenerator", "CREDIT_PLAN_SEMESTER %u", CREDIT_PLAN_SEMESTER);
  //__android_log_print(ANDROID_LOG_ERROR, "CodeGenerator", "CREDIT_PLAN_YEAR %u", CREDIT_PLAN_YEAR);
  //__android_log_print(ANDROID_LOG_ERROR, "CodeGenerator", "CREDIT_PLAN_15_DAYS %u", CREDIT_PLAN_15_DAYS);
  }
}

char *JsonString(char plan[15], char code_type[10]) {
  char string[50] = {"\0"};
  char plan_string[20] = {"\0"};
  char code_type_string[20] = {"\0"};

  strcat(string, plan);
  strcat(string, "|");
  strcat(string, code_type);
  return strdup(string);
}

// Convert 4 bit binary to integer
int toInteger(uint8_t *array)
{
  return array[0] * 8 + array[1] * 4 + array[2] * 2 + array[3];
}

// convert integer to 4 bit binary
void toBinary(uint8_t number, uint8_t *array)
{
  int i = 0;
  for (i = 0; i < 4; i++)
  {
    array[3 - i] = number & 0x01; //bitRead(number, 0);
    number = number >> 1;
  }
}


extern void MASK_Complete_24_Digits(unsigned char mask[18])
{
  uint8_t k = 0;

   for (int i = 0; i < 18; i++) {
      KINGO_Mask18[i] = (mask[i] - 48);
    }

  for (k = 0; k < 18; k++)
  {
    iMask[k] = KINGO_Mask18[k];
  }

  iMask[18] = ((16 + (iMask[0] * 10 + iMask[1]) - (iMask[4] * 10 + iMask[5])) % 16) / 10;     //(16 + ((iMask[ 0]*10+iMask[ 1]) - (iMask[ 4]*10+iMask[ 5])) %16) / 10;
  iMask[19] = ((16 + (iMask[0] * 10 + iMask[1]) - (iMask[4] * 10 + iMask[5])) % 16) % 10;     //(16 + ((iMask[ 0]*10+iMask[ 1]) - (iMask[ 4]*10+iMask[ 5])) %16) % 10;
  iMask[20] = ((16 + (iMask[10] * 10 + iMask[11]) - (iMask[4] * 10 + iMask[5])) % 16) / 10;   //(16 + ((iMask[10]*10+iMask[11]) - (iMask[ 4]*10+iMask[ 5])) %16) / 10;
  iMask[21] = ((16 + (iMask[10] * 10 + iMask[11]) - (iMask[4] * 10 + iMask[5])) % 16) % 10;   //(16 + ((iMask[10]*10+iMask[11]) - (iMask[ 4]*10+iMask[ 5])) %16) % 10;
  iMask[22] = ((16 + (iMask[12] * 10 + iMask[13]) - (iMask[10] * 10 + iMask[11])) % 16) / 10; //(16 + ((iMask[12]*10+iMask[13]) - (iMask[10]*10+iMask[11])) %16) / 10;
  iMask[23] = ((16 + (iMask[12] * 10 + iMask[13]) - (iMask[10] * 10 + iMask[11])) % 16) % 10; //(16 + ((iMask[12]*10+iMask[13]) - (iMask[10]*10+iMask[11])) %16) % 10;
}



/* char *DecodeKingoModelV2(unsigned char CODE[16], unsigned char mask18[18], unsigned char country[3], uint8_t version)
{
  char code_type[10];
  char plan_type[15];
  char *response;
  uint8_t Plan = 0;
  uint8_t m = 0;
  MASK_Complete_24_Digits(mask18);
  fillPlan(country, version);

  for (m = 0; m < 16; m++)
  {
    iValidate[m] = CODE[m] - '0';
  }

  uint8_t iCode[12], bCode[48], bMask[48], bChecks[16], spacesToShift;
  uint8_t creditCodeCounter, adminCodeCounter, serviceCodeCounter, salesCodeCounter, unhackedCodeCounter, validateIndex;
  uint8_t newCode[5];

  uint8_t w = 0;
  toBinary(iValidate[0], &bChecks[0]);
  toBinary(iValidate[7], &bChecks[4]);
  toBinary(iValidate[11], &bChecks[8]);
  toBinary(iValidate[15], &bChecks[12]);
  // Code bits (9 digits)
  toBinary(iValidate[1], &bCode[0 * 4]);
  toBinary(iValidate[2], &bCode[1 * 4]);
  toBinary(iValidate[3], &bCode[2 * 4]);
  toBinary(iValidate[4], &bCode[3 * 4]);
  toBinary(iValidate[5], &bCode[4 * 4]);
  toBinary(iValidate[6], &bCode[5 * 4]);
  toBinary(iValidate[8], &bCode[6 * 4]);
  toBinary(iValidate[9], &bCode[7 * 4]);
  toBinary(iValidate[10], &bCode[8 * 4]);
  toBinary(iValidate[12], &bCode[9 * 4]);
  toBinary(iValidate[13], &bCode[10 * 4]);
  toBinary(iValidate[14], &bCode[11 * 4]);
  // Shuffle
  int j = 0;
  for (j = 0; j < 4; j++)
  {
    if (j == 0)
      validateIndex = 15;
    else if (j == 1)
      validateIndex = 11;
    else if (j == 2)
      validateIndex = 7;
    else if (j == 3)
      validateIndex = 0;
    else
      validateIndex = 0;
    spacesToShift = (iValidate[validateIndex] & 0x07) << 2;
    int i = 0;
    for (i = 0; i < 32; i++)
    {
      //The variable bMask will not be used until later. To avoid creating
      //   more variables, we will re-use "bMask" as a temp variable
      bMask[i] = bCode[(3 - j) * 4 + ((i + spacesToShift) % 32)];
    }
    i = 0;
    for (i = 0; i < 32; i++)
    {
      bCode[(3 - j) * 4 + i] = bMask[i];
    }
  }
  int i = 0;
  // Code to integers
  for (i = 0; i < 12; ++i)
  {
    iCode[i] = toInteger(&bCode[i * 4]);
  }
  // Add back 10s
  // bChecks = [ X,0,0,0, X,0,0,0, X,0,0,0, X,0,0,0 ]
  if (bChecks[1] == 1)
    iCode[0] += 10;
  if (bChecks[2] == 1)
    iCode[1] += 10;
  if (bChecks[3] == 1)
    iCode[2] += 10;
  if (bChecks[5] == 1)
    iCode[3] += 10;
  if (bChecks[6] == 1)
    iCode[4] += 10;
  if (bChecks[7] == 1)
    iCode[5] += 10;
  if (bChecks[9] == 1)
    iCode[6] += 10;
  if (bChecks[10] == 1)
    iCode[7] += 10;
  if (bChecks[11] == 1)
    iCode[8] += 10;
  if (bChecks[13] == 1)
    iCode[9] += 10;
  if (bChecks[14] == 1)
    iCode[10] += 10;
  if (bChecks[15] == 1)
    iCode[11] += 10;
  // Convert code back to binary
  for (i = 0; i < 12; ++i)
  {
    toBinary(iCode[i], &bCode[i * 4]);
  }

  // Check MSB from the check nibbles
  bool flag = true;
  if (bChecks[1] == 0 && bChecks[2] == 0)
  {
    if (bChecks[0] != bCode[0])
      flag = false;
  }
  if (bChecks[5] == 0 && bChecks[6] == 0)
  {
    if (bChecks[4] != bCode[8])
      flag = false;
  }
  if (bChecks[9] == 0 && bChecks[10] == 0)
  {
    if (bChecks[8] != bCode[16])
      flag = false;
  }
  if (bChecks[13] == 0 && bChecks[14] == 0)
  {
    if (bChecks[12] != bCode[23])
      flag = false;
  }

  // Mask bits (12 x 4 bits)
  for (i = 0; i < 12; ++i) {
    toBinary(iMask[i * 2] * 10 + iMask[i * 2 + 1], &bMask[i * 4]);
  }

  // XOR
  for (i = 0; i < 48; i++)
  {
    if ((bCode[i] + bMask[i]) == 1)
      bCode[i] = 1;
    else
      bCode[i] = 0;
  }

  // Check randoms duplicates
  if (bCode[0] != bCode[21])
    flag = false;
  if (bCode[2] != bCode[8])
    flag = false;
  if (bCode[4] != bCode[33])
    flag = false;
  if (bCode[7] != bCode[42])
    flag = false;
  if (bCode[10] != bCode[26])
    flag = false;
  if (bCode[15] != bCode[19])
    flag = false;
  if (bCode[17] != bCode[11])
    flag = false;
  if (bCode[22] != bCode[1])
    flag = false;
  if (bCode[23] != bCode[38])
    flag = false;
  if (bCode[24] != bCode[6])
    flag = false;
  if (bCode[29] != bCode[44])
    flag = false;
  if (bCode[31] != bCode[12])
    flag = false;
  if (bCode[32] != bCode[20])
    flag = false;
  if (bCode[39] != bCode[28])
    flag = false;
  if (bCode[40] != bCode[27])
    flag = false;
  if (bCode[45] != bCode[41])
    flag = false;
  if (bCode[46] != bCode[18])
    flag = false;

  // Check plan duplicates
  if (bCode[13] != bCode[30])
    flag = false;
  else if (bCode[16] != bCode[5])
    flag = false;
  else if (bCode[34] != bCode[37])
    flag = false;
  creditCodeCounter = 0;
  adminCodeCounter = 0;
  serviceCodeCounter = 0;
  salesCodeCounter = 0;
  unhackedCodeCounter = 0;
  //iCode is no longer of use. It will store the 11 digits of the base or
  //  the 8 digits of the base and 3 of the plan
  iCode[0] = bCode[3];
  iCode[1] = bCode[5];
  iCode[2] = bCode[9];
  iCode[3] = bCode[14];
  iCode[4] = bCode[25];
  iCode[5] = bCode[30];
  iCode[6] = bCode[35];
  iCode[7] = bCode[36];
  iCode[8] = bCode[37];
  iCode[9] = bCode[43];
  iCode[10] = bCode[47];
  //Check the base codes for each option.
  //The bits related to the plan in the credit codes are set to 2 in order
  //    for them to mismatch with the comparisson.
  for (i = 0; i < 11; i++)
  {
    if (iCode[i] == codeBaseCredit[i])
      creditCodeCounter++;
    if (iCode[i] == codeBaseAdmin[i])
      adminCodeCounter++;
    if (iCode[i] == codeBaseService[i])
      serviceCodeCounter++;
    if (iCode[i] == codeBaseSales[i])
      salesCodeCounter++;
    if (iCode[i] == codeBaseUnhacked[i])
      unhackedCodeCounter++;
  }
  //Check if the plan code is valid
  credit_plan = bCode[5] * 4 + bCode[30] * 2 + bCode[37];
  if ((creditCodeCounter == 8) && (credit_plan > 7)) {
    flag = false;
  }


  //Save the random bits
  //[0][7-5]: MSB-lsb Plan
  newCode[0] = 0;

  newCode[0] |= ((bCode[5] & BIT0) << 7);

  newCode[0] |= ((bCode[30] & BIT0) << 6);

  newCode[0] |= ((bCode[37] & BIT0) << 5);

  //[0][4]-[2][4]: Random digits
  newCode[0] |= ((bCode[1] & BIT0) << 4);
  newCode[0] |= ((bCode[6] & BIT0) << 3);
  newCode[0] |= ((bCode[8] & BIT0) << 2);
  newCode[0] |= ((bCode[11] & BIT0) << 1);
  newCode[0] |= ((bCode[12] & BIT0) << 0);
  newCode[1] = 0;
  newCode[1] |= ((bCode[18] & BIT0) << 7);
  newCode[1] |= ((bCode[19] & BIT0) << 6);
  newCode[1] |= ((bCode[20] & BIT0) << 5);
  newCode[1] |= ((bCode[21] & BIT0) << 4);
  newCode[1] |= ((bCode[26] & BIT0) << 3);
  newCode[1] |= ((bCode[27] & BIT0) << 2);
  newCode[1] |= ((bCode[28] & BIT0) << 1);
  newCode[1] |= ((bCode[33] & BIT0) << 0);

  newCode[2] = 0;
  newCode[2] |= ((bCode[38] & BIT0) << 7);

  newCode[2] |= ((bCode[41] & BIT0) << 6);

  newCode[2] |= ((bCode[42] & BIT0) << 5);

  newCode[2] |= ((bCode[44] & BIT0) << 4);

  if (creditCodeCounter == 8)
  {
    Plan = 1;
    newCode[2] &= ~BIT2;
    newCode[2] &= ~BIT1;
    newCode[2] &= ~BIT0;
  }
  else if (adminCodeCounter == 11)
  {
    Plan = 2;
    newCode[2] &= ~BIT2;
    newCode[2] &= ~BIT1;
    newCode[2] |= BIT0;
  }
  else if (serviceCodeCounter == 11)
  {
    Plan = 3;
    newCode[2] &= ~BIT2;

    newCode[2] |= BIT1;

    newCode[2] &= ~BIT0;
  }
  else if (unhackedCodeCounter == 11)
  {
    Plan = 4;
    newCode[2] &= ~BIT2;
    newCode[2] |= BIT1;
    newCode[2] |= BIT0;
  }
  else if (salesCodeCounter == 11)
  {
    Plan = 5;
    newCode[2] |= BIT2;
    newCode[2] &= ~BIT1;
    newCode[2] &= ~BIT0;
  }
  else
    flag = false;

  if (flag == false)
    Plan = 0;


  //__android_log_print(ANDROID_LOG_ERROR, "CodeGenerator", "plan %u", Plan);

  switch (Plan)
  {
  case 0: //Invalid Plan
    strcpy(plan_type, "ERROR");
    strcpy(code_type, "ERROR");
    break;
  case 1:
    strcpy(plan_type, "CODE");    //Add credit
    if (credit_plan == CREDIT_PLAN_HOUR) //Hour
    {
      strcpy(code_type, "HOUR");
    }
    else if (credit_plan == CREDIT_PLAN_DAY) //Day
    {
      strcpy(code_type, "DAY");

    }
    else if (credit_plan == CREDIT_PLAN_WEEK) //WEEK
    {
      strcpy(code_type, "WEEK");
    }
    else if (credit_plan == CREDIT_PLAN_MONTH) //MONTH
    {
      strcpy(code_type, "MONTH");
    }
    else if (credit_plan == CREDIT_PLAN_TRIMESTER) //TRIMESTER
    {
      strcpy(code_type, "QUARTER");
    }
    else if (credit_plan == CREDIT_PLAN_SEMESTER) //SEMESTER
    {
      strcpy(code_type, "SEMESTER");
    }
    else if (credit_plan == CREDIT_PLAN_YEAR) //YEAR
    {
      strcpy(code_type, "YEAR");
    }
    else if (credit_plan == CREDIT_PLAN_3_DAYS) //3 DAYS
    {
      if(CREDIT_PLAN_3_DAYS == 99)
      {
        strcpy(code_type, "ERROR");
      }
      else {
        strcpy(code_type, "THREE_DAYS");
      }
    }
    else if (credit_plan == CREDIT_PLAN_15_DAYS) //15 DAYS
    {
      strcpy(code_type, "FORTNIGHT");
    }
    break;
  case 2: //Admin mode
    strcpy(plan_type, "ADMIN_MODE");
    strcpy(code_type, "NONE");
    break;
  case 3: //Service Mode
    strcpy(plan_type, "SERVICE_MODE");
    strcpy(code_type, "NONE");
    break;
  case 4: //Unhacked Mode
    strcpy(plan_type, "UNHACKED_MODE");
    strcpy(code_type, "NONE");
    break;
  case 5: //Sales Mode
    strcpy(plan_type, "SALES_MODE");
    strcpy(code_type, "NONE");
    break;
  default:
    strcpy(plan_type, "ERROR");
    strcpy(code_type, "ERROR");
    break;
  }
  response = JsonString(plan_type, code_type);
  return strdup(response);
} */
