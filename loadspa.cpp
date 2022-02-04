#include <alloca.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <stdint.h>
#include <sys/select.h>

#define LLEN 16

uint32_t getfile(const char *fname,char **h);
uint32_t getlogin(char **h);
void write_array(const char *name,char *bp,int cfd,unsigned int len);

int main(int argc,char *argv[])
{
    uint32_t len;
    int cfd;
    char buf[1024];
    char *hbp;
    size_t n;

    cfd=creat("spa.s",0666);

    strcpy(buf,"/* created by loadspa */\n\n");
    n=write(cfd,buf,strlen(buf));
    strcpy(buf,"\t.globl\tspa_html_len\n");
    n=write(cfd,buf,strlen(buf));
    strcpy(buf,"\t.globl\tspa_html_start\n");
    n=write(cfd,buf,strlen(buf));
    strcpy(buf,"\t.globl\thtty_gif_len\n");
    n=write(cfd,buf,strlen(buf));
    strcpy(buf,"\t.globl\thtty_gif_start\n");
    n=write(cfd,buf,strlen(buf));

    strcpy(buf,"\t.data\n");
    n=write(cfd,buf,strlen(buf));
    
    len=getlogin(&hbp);;
    if (hbp == NULL) {
        printf("Could not load SPA from login.html\n");
        abort(); //spa load failed
    }
    strcpy(buf,"\t.align 4\n");
    n=write(cfd,buf,strlen(buf));
    strcpy(buf,"spa_html_len:\n");
    n=write(cfd,buf,strlen(buf));

    sprintf(buf,"\t.long\t%u\n\n",len);
    n=write(cfd,buf,strlen(buf));
 
    write_array("spa_html_start",hbp,cfd,len+1); // include trail 0
    free(hbp);

    len=getfile("htmltty/htty.gif",&hbp);
    if (hbp == NULL) {
        printf("Could not load SPA favicon from htty.gif\n");
        abort(); //image load failed
    }
    strcpy(buf,"\t.align 4\n");
    n=write(cfd,buf,strlen(buf));
    strcpy(buf,"htty_gif_len:\n");
    n=write(cfd,buf,strlen(buf));

    sprintf(buf,"\t.long\t%u\n\n",len);
    n=write(cfd,buf,strlen(buf));

    write_array("htty_gif_start",hbp,cfd,len);
    free(hbp);
    close(cfd);

    return 0;
}

void write_array(const char *name,char *bpx,int cfd,unsigned int len)
{
    int i;
    char buf[1024];
    size_t n;
    unsigned char *bp;

    bp=(unsigned char *)bpx;

    strcpy(buf,"\t.align 1\n");
    n=write(cfd,buf,strlen(buf));
    sprintf(buf,"%s:\n",name);
    n=write(cfd,buf,strlen(buf));

    i=0;
    strcpy(buf,"\t.byte\t");
    n=write(cfd,buf,strlen(buf));
    while (len != 0) {
        sprintf(buf,"%u",(unsigned int)*bp);
        if (i == LLEN-1) {
            strcat(buf,"\n");
            n=write(cfd,buf,strlen(buf));
            strcpy(buf,"\t.byte\t");
            n=write(cfd,buf,strlen(buf));
            i=0;++bp;--len;
        }
        else {
            strcat(buf,",");
            n=write(cfd,buf,strlen(buf));
            ++bp;++i;--len;
        }
    }
    while (i < LLEN) {
        strcpy(buf,"0");
        if (i == LLEN-1) {
            strcat(buf,"\n\n\n");
            n=write(cfd,buf,strlen(buf));
        }
        else {
            strcat(buf,",");
            n=write(cfd,buf,strlen(buf));
        }
        ++i;
    }
}

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
    *(*h+stx.st_size)='\0';
    return stx.st_size;
}