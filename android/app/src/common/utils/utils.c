#include <time.h>
#include <stdio.h>
#include <stdbool.h>
#include <stdint.h>

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
