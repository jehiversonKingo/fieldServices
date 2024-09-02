#include <stdint.h>
#include <stdio.h>
#include <math.h>
#include <stdlib.h>

#ifndef KINGOLIBRARIES_UTILS_H
#define KINGOLIBRARIES_UTILS_H

int DayOfYear();

int ModYear();

extern bool Validate(char* number);

extern char CheckSum(char* number);

#endif
