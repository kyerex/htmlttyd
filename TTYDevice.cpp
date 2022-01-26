#include "gsys.h"
#include "TTYDevice.h"
#include <stdlib.h>
#include <string.h>



/*********** TTYDevice ***************/

TTYDevice::~TTYDevice()
{
    close(fd);
}

TTYDevice::TTYDevice (int m) 
{
    fd=m;
}

void TTYDevice::TDread(char *bp,uint32_t *len)
{
    ssize_t n;

    *len=0;
    n=read(fd,bp,2800); // if there is more than 2800 select will still catch the rest
    if (n == -1) {
        return;
    }
    *len=n;
}


void TTYDevice::TDwrite(char *bp,uint32_t len)
{
    if ((ssize_t)len != write(fd,bp,len)) {
        abort();
    }
}
