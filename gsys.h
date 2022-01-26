
#ifndef GSYSH_INCLUDED
#define GSYSH_INCLUDED

#include <stdint.h>
#include <unistd.h>
#include <sys/select.h>
#define TGOSLINUX
typedef int SOCKET;
#define INVALID_SOCKET -1

#define LOG_ON

#define byt unsigned char
#define swrd unsigned short int
#define PACKED4 __attribute__ ((aligned (4), packed))

#define MAXTRANSFER 4096 // max base 64 encoded packet is 4000

#endif