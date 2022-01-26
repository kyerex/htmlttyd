#ifndef PC2PACKETS_INCLUDED
#define PC2PACKETS_INCLUDED

#include "gsys.h"


int get_str(byt **bpx,uint32_t *lenx, byt **rbp, uint32_t *rlen);
int get_uint32_t(byt **bpx,uint32_t *lenx, uint32_t *resx);
int deserialize(byt *bp,uint32_t len);
int serialize(char *pk,uint32_t *len);

/* packet types */

#define pc2pstart 12345
#define pc2init pc2pstart
#define pc2loginres pc2init+1
#define pc2open pc2loginres+1
#define pc2openres pc2open+1
#define pc2fin pc2openres+1
#define pc2finres pc2fin+1
#define pc2write pc2finres+1
#define pc2writeres pc2write+1
#define pc2readrecord pc2writeres+1
#define pc2readrecordres pc2readrecord+1
#define pc2read pc2readrecordres+1
#define pc2readres pc2read+1
#define pc2close pc2readres+1
#define pc2closeres pc2close+1
#define pc2escape pc2closeres+1
#define pc2readguires pc2escape+1
#define pc2schar pc2readguires+1
#define pc2end pc2schar

struct pc2_short_iop {
	int chan_flag;
	int siz_eq;
	int len_eq;
	int tim_eq;
	int io_flag;
};


struct pc2_initpacket {
    uint32_t lenl;
    swrd type;
	swrd crc;
	uint32_t dsz;
    char username[32];
    char password[32];
    char idir[256];   
    char config[32];
};

struct pc2_loginres {
    uint32_t lenl;
    swrd type;
    uint32_t res;    
    // 0 == ok , 
    // 1 == logonuser failed
    // 2 == pipe function failed
    // 3 == spawn failed
    uint32_t os_error;
    int keynum;    // cryptor keynum if res == 0
    int mode;
};

struct pc2_open {
    uint32_t lenl;
    swrd type;
    int chan;
};

struct pc2_openres {
    uint32_t lenl;
    swrd type;
    swrd sm32_error;
    int chan_flag;
};

struct pc2_escape {
    uint32_t lenl;
    swrd type;
};

struct pc2_finres {
    uint32_t lenl;
    swrd type;
    swrd sm32_error;
    byt finbuf[32];
};

struct pc2_write {
    uint32_t lenl;
    swrd type;
    struct pc2_short_iop siop;
    uint32_t dlenl;
	byt data[4];
};

struct pc2_writeres {
    uint32_t lenl;
    swrd type;
    swrd sm32_error;
    int chan_flag;
};

struct pc2_readrecord {
    uint32_t lenl;
    swrd type;
    struct pc2_short_iop siop;
};

struct pc2_readrecordres {
    uint32_t lenl;
    swrd type;
    swrd sm32_error;
    uint32_t dlenl;
    byt data[4];
};

struct pc2_read {
    uint32_t lenl;
    swrd type;
	swrd notused;
    struct pc2_short_iop siop;
};

struct pc2_readres {
    uint32_t lenl;
    swrd type;
    swrd sm32_error;
    int ctl;
    int dlm;
    uint32_t dlenl;
    byt data[4];
};

struct pc2_close {
    uint32_t lenl;
    swrd type;
	swrd notused;
    struct pc2_short_iop siop;
};

struct pc2_closeres {
    uint32_t lenl;
    swrd type;
};

struct pc2_schar {
    uint32_t lenl;
    swrd type;
	swrd ikey;
    uint32_t dlenl;
    char data[4];
};
//!gn!
#endif

