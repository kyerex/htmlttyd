
#ifndef DO_INCLUDED
#define DO_INCLUDED

#include "gsys.h"

void do_hta64(byt*, uint32_t, byt*, uint32_t*);
void do_ath64(byt*, uint32_t, byt*, uint32_t*);
uint32_t getulen(byt *bpx,uint32_t lenx);
int get_uint32_t(byt **bpx,uint32_t *lenx, uint32_t *resx);

/* ================ sha1.h ================ */
/*
SHA-1 in C
By Steve Reid <steve@edmweb.com>
100% Public Domain
*/

#define U_32_T unsigned int

typedef struct {
	U_32_T state[5];
	U_32_T count[2];
	U_32_T buffer[64];
} SHA1_CTX;

void SHA1Transform(U_32_T state[5], const unsigned char buffer[64]);
void SHA1Init(SHA1_CTX* context);
void SHA1Update(SHA1_CTX* context, const unsigned char* data, U_32_T len);
void SHA1Final(unsigned char digest[20], SHA1_CTX* context);
void do_sha1 (char *,unsigned int,char *);


#endif 
