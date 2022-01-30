#include "gsys.h"
#include <stdlib.h>
#include <stdio.h>

#include <unistd.h>
#include <shadow.h>
#include <pwd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <malloc.h>
#include <string.h>
#include <ctype.h>
#include <sys/select.h>
#include <time.h>
#include <signal.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <errno.h>
#include <sys/ioctl.h>
#include <net/if.h> 
#include <netinet/in.h>
#include <utmp.h>
#include <fcntl.h>

uint32_t getfile(const char *fname,char **h);

uint32_t getlogin(char **h)
{
    char *lfile;
    uint32_t len,len2,llen;
    char *bp,*bp2,*l;
    char fn[128];
    *h=NULL;


    len=getfile("htmltty/login.html",&bp);
    lfile=(char *)alloca(len+1);
    memcpy(lfile,bp,len);
    lfile[len]='\0';
    free (bp);

    bp=strstr(lfile,"<script SRC=\"");
    if (bp == NULL) {
        return 0;
    }
    llen=bp-lfile;
    l=(char *)malloc(llen);
    if (l == NULL) {
        return 0;
    }
    memcpy(l,lfile,llen);
    lfile=bp;
    while (0 == memcmp("<script SRC=\"",lfile,13) ) {
        bp2=lfile+13;
        bp=strchr(bp2,'"');
        if (bp == 0) {
            return 0;
        }
        *bp='\0';
        strcpy(fn,"htmltty/");
        strcat(fn,bp2);
        lfile=bp+1;
        bp=strchr(lfile,'\n');
        lfile=bp+1;
        len=getfile(fn,&bp2);
        if (bp2 == NULL) {
            return 0;
        }
        len2=llen+20+len;
        bp=(char *)malloc(len2);
        if (bp ==NULL) {
            return 0;
        }
        memcpy(bp,l,llen);
        free(l);
        l=bp;
        bp=l+llen;
        llen=len2;
        memcpy(bp,"<script>\n",9);
        bp=bp+9;
        memcpy(bp,bp2,len);
        bp=bp+len;
        memcpy(bp,"\n</script>\n",11);
    }
    *h=(char *)malloc(llen+strlen(lfile)+1);
    if (*h == NULL) {
        free(l);
        return 0;
    }
    memcpy(*h,l,llen);
    free(l);
    strcpy(*h+llen,lfile);
    return llen+strlen(lfile);
}

uint32_t getfile(const char *fname,char **h)
{
	int fdx;
	struct stat stx;

    *h=NULL;

    fdx=open(fname,O_RDONLY);
	if (fdx == -1) {
		return 0;
	}
    if ( 0 != fstat(fdx,&stx)) {
    	return 0;
    }
    *h=(char *)malloc(stx.st_size+1);
    if (stx.st_size != read(fdx,*h,stx.st_size)) {
    	free((void *)*h);
        *h=NULL;
    	close(fdx);
    	return 0;
    }

    close(fdx);
    return stx.st_size;
}