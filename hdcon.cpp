#include <pty.h>
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

#include "Sock2.h"
#include "TTYDevice.h"
#include "ServerLog.h"
#include "wspackets.h"
#include "spa.h"

int wait_writeres(Sock2 *s);
char *findstr(const char *hs,uint32_t len,const char *s);

int bDebug=1;

extern ServerLog *slog;
TTYDevice *tty0=NULL;
int send_ksa=0; // 1 if sending a ksa for a read gui

int readsock(Sock2 *s,char *bp, uint32_t *len)
{
    char *bp2;

    if (Sock2::READY != s->get(&bp2,len)) {
        return 1;
    }
    if (*len > MAXTRANSFER) {
        return 1;
    }
    memcpy(bp,bp2,*len);
    free(bp2);
    return 0;
}

int HDCon(char *argv0,Sock2 *s)
{
    struct pc2_initpacket *pi;
    struct pc2_loginres *lr;
    struct pc2_schar *ps;
    struct pc2_write *pw;
    char *big_pw;
    uint32_t len,len2,len3;
    char buf[1024];
    char tbuf[MAXTRANSFER];
    char obuf[MAXTRANSFER]; 
    int n;
    fd_set readset,errset;
    int nready,master,maxfd;
    struct sockaddr_in name;
    socklen_t namelen;
    char *nbp,*bp;
    struct sockaddr *sa;
    char my_address[32];

    char *h;

    len=1024;
    sa=(struct sockaddr *)buf;
    if (0 == getsockname(s->fd,sa,&len)) {
        if (sa->sa_family == AF_INET) {
            memset(my_address,' ',32);
            sprintf(my_address,",\"%u.%u.%u.%u:%u\",",(uint8_t)sa->sa_data[2],(uint8_t)sa->sa_data[3],
                (uint8_t)sa->sa_data[4],(uint8_t)sa->sa_data[5],(uint8_t)sa->sa_data[0]*256 + (uint8_t)sa->sa_data[1]);
            my_address[strlen(my_address)]=' ';
        }
        else {
            my_address[0]='\0';
        }
    }
    
    if (Sock2::READY != s->waitsock(120)) {
        slog->info("No Handshake Received - exiting");
        s->close();
        return 0;
    }

    s->DoHandShake();

    if (s->st == NOTDEFINED) {
        //slog->info("Invalid HandShake");
        //always browser with extra connection
        s->close();
        return 0;
    }

    if (s->st == HTMLSOCK) {
        if (memcmp(s->hsbuf,"GET / HTTP/1.1\r\n",16) == 0) {
            len=spa_html_len;
            h=(char *)alloca(len);
            memcpy(h,&spa_html_start,len);
            bp=strstr(h,",\"127.0.0.1:5001");
            if (bp != NULL && my_address[0] !='\0') {
                memcpy(bp,my_address,32);
            }
            sprintf(tbuf,
"HTTP/1.1 200 OK\r\n\
Content-Type: text/html; charset=utf-8\r\n\
Cache-Control: no-cache\r\n\
Content-Length: %u\r\n\r\n",len);
            s->put_data(tbuf,strlen(tbuf));
            s->put_data(h,len);
            sleep(2);
            s->close();
            return 0; //child exit
        }
        if (memcmp(s->hsbuf,"GET /favicon.ico HTTP/1.1\r\n",27) == 0) {
            len=htty_gif_len;
            h=&htty_gif_start;
            sprintf(tbuf,
"HTTP/1.1 200 OK\r\n\
Content-Type: image/gif; charset=utf-8\r\n\
Cache-Control: no-cache\r\n\
Content-Length: %u\r\n\r\n",len);
            s->put_data(tbuf,strlen(tbuf));
            s->put_data(h,len);
            sleep(2);
            s->close();
            return 0;
        }
        // send 404
        slog->info("do not recognize request");
        slog->info(s->hsbuf);
        s->close();
        return 0;
    }
    namelen=sizeof(name);
    if ( getpeername(s->fd,(struct sockaddr *)&name,&namelen) ) {
        goto bad_init;
    }
    nbp=inet_ntoa( name.sin_addr);
    sprintf(buf,"Got Connection From:%s:%d",nbp,htons(name.sin_port));
    slog->info(buf);

    FD_ZERO(&readset);
    FD_SET(s->fd,&readset);
    n=select((int)(s->fd+1),&readset,NULL,NULL,NULL);
    if (n !=1) {
        goto bad_init;
    }
    if (readsock(s,tbuf,&len)){
bad_init:
        slog->info("bad init packet");
        return 1;
    }
    if (tbuf[len-1] != '*') {
        goto bad_init;
    }
    if (deserialize((unsigned char *)&tbuf,len-1)){
        goto bad_init;
    }
    pi=(struct pc2_initpacket *)tbuf;
    if (pi->type != pc2init) {
        goto bad_init;
    }
    // we can be pretty sure we have a valid pc2_initpacket
    sprintf(buf,"Connection: %s",pi->username); // username is now info1
    slog->info(buf);

    lr=(struct pc2_loginres*)tbuf;
    lr->lenl=sizeof(*lr);
    lr->type=pc2loginres;
    lr->res=0;
    lr->keynum=0;
    lr->os_error=0;
    lr->mode=0; //not sm32 mode and vt100 keyboard
    if (strcmp(pi->password,"xterm") == 0) {
        lr->mode=2; // not sm32 mode and xterm keyboard
    }

    if (serialize(tbuf,(uint32_t *)&len)) {
        return 1;
    }
    s->put(tbuf,len);

    n=forkpty(&master,buf,NULL,NULL);
    if (n == -1) {
        return 1;
    }
    if (n == 0) {
        if (lr->mode == 2) {
            putenv((char *)"TERM=xterm");
        }
        else {
            putenv((char *)"TERM=vt100");
        }
        if (-1 == execl("/bin/login","/bin/login",NULL)) {
            sprintf(buf,"Unable to Start /bin/login");
            slog->info(buf);
        }
        return 0;
    }

    tty0=new TTYDevice(master);
    
    sprintf(tbuf,"Connected on:%s",buf);
    slog->info(tbuf);
    maxfd=s->fd;
    if (master > maxfd)maxfd=master;
    big_pw=0;
    while (1) {
        FD_ZERO(&readset);
        FD_SET(s->fd, &readset);
        FD_SET(master,&readset);
        FD_ZERO(&errset);
        FD_SET(s->fd, &errset);
        FD_SET(master,&errset);
        //pend forever wait for data from htmltty and slave side of ptty
        nready = select(maxfd + 1, &readset, 0, &errset, 0); // add error set on the 2 file descriptors
        if (s->fd == INVALID_SOCKET || nready == -1) {
            slog->abort((char *)"Error return from select");
            // no return
        }
        if (FD_ISSET(master,&errset) || FD_ISSET(s->fd,&errset)) {
            // don't tolerate any errors
            close(master);
            s->close();
            exit(0);
        }
        if (FD_ISSET(master,&readset)) {
            tty0->TDread(tbuf,(uint32_t *)&len);
            if (len == 0) {
                slog->info((char *)"Closing Connection");
                close(master);
                s->close();
                exit(0);
            }
            if (big_pw != 0) {
                len2=len;
                if (len3 < len2) {
                    len2=len3;
                }
                memcpy(nbp,tbuf,len2);
                nbp=nbp+len2;
                len3=len3-len2;
                len=len-len2;
                if (len3 == 0) {
                    nbp=nbp-3;
                    if (memcmp(nbp,"*\033\\",3) != 0) {
                        slog->abort("bad big_pw");
                        return 0;
                    }
                    ++nbp;
                    if (Sock2::READY != s->put(big_pw,nbp-big_pw) ){
                        slog->abort((char *)"Error writing to websocket");
                        return 0;
                    }
                    free (big_pw);
                    big_pw=0;
                    if (1 != wait_writeres(s)) {
                        return 0;
                    }
                }
                if (len == 0) {
                    continue;
                }
                nbp=nbp+2;
                memcpy(tbuf,nbp,len);
            }
            tbuf[len]='\0';
            if ((bp=findstr(tbuf,len,"\033]98;*")) != 0 ) {
                nbp=bp+6,len3=0;
                len2=len - (nbp-tbuf); // len2 len left after *
                if (0 == get_uint32_t((unsigned char **)&nbp,&len2,&len3)) {
                    //nbp and len2 get updated by get_unit32_t
                    len3=len3+3;        //3 for * esc backslash
                    len=bp-tbuf;        //len in front of osc 98
                    big_pw=(char *)malloc(len3);
                    if (big_pw == 0) {
                        slog->abort("memory error");
                    }
                    memcpy(big_pw,nbp,len2);
                    nbp=big_pw+len2;  // nbp is next to copy to
                    len3=len3-len2;         // len3 is the bytes left to come
                    if (len == 0) {
                        continue;
                    }
                }
                else {
                    slog->info("get_unit32_t failed");
                }
                //else fall thru and send len bytes from tbuf
            }
            pw=(struct pc2_write *)obuf;
            memset(pw,0,sizeof(*pw));
            pw->dlenl=len;
            pw->lenl=len+sizeof(*pw)-4;
            pw->type=pc2write;
            memcpy(pw->data,tbuf,len);
            if (serialize(obuf,(uint32_t *)&len)) {
                slog->abort((char *)"serialize failed");
                return 0;
            }
            if (Sock2::READY != s->put(obuf,len) ){
                slog->abort((char *)"Error writing to websocket");
                return 0;
            }
            if (wait_writeres(s)) {
                continue;
            }
            return 0;
        }
        if (FD_ISSET(s->fd,&readset)) {
            if (readsock(s,tbuf,&len)) {
                slog->abort((char *) "Error reading WebSocket");
                return 0;
            }
            if (send_ksa) {
                // in packet mode send straight thru
                tty0->TDwrite(tbuf,len);
                if (send_ksa && tbuf[len-1] == '*') {
                    send_ksa=0;
                }
            }
            else {
                // this better be an pc2schar packet
                if (deserialize( (byt *)tbuf,len-1) ) {
                    slog->abort((char *)"Error return from deserialize");
                    // no return
                    return 0;
                }
                ps=(struct pc2_schar *)tbuf;
                if (ps->type != pc2schar) {
                    slog->abort((char *)"invalid packet from HTMLTerminal Stream mode ??");
                    // no return
                    return 0;

                }
                if (ps->ikey == 30000) {
                    send_ksa=1;
                }
                else {
                    tty0->TDwrite(ps->data,ps->dlenl);
                }
            }
            continue;
        }
        slog->abort((char *)"Cant Be here");
    }

    return 0;
}

int wait_writeres(Sock2 *s)
{
    struct pc2_schar *ps;
    char tbuf[MAXTRANSFER];
    uint32_t len;

    while (1) {
        readsock(s,tbuf,&len);
        if (send_ksa) {
            send_ksa=0;
            if (tbuf[len-1] != '*') { // check this is an object
                slog->abort((char *)"HTMLTerminal sent bad packet?");
                return 0;
            }
            tty0->TDwrite(tbuf,len);
            continue;
        }
        if ( deserialize((byt *)tbuf,len-1) ) {
            slog->abort((char *)"unable to deserialize write result packet");
            return 0;
        }
        ps=(struct pc2_schar *)tbuf;
        if (ps->type == pc2schar) {
            if (ps->ikey == 30000) {
                send_ksa=1;
                continue; //read object
            }
            // keyboard input
            tty0->TDwrite(ps->data,ps->dlenl);
            continue;
        }
        if (ps->type == pc2writeres) {
            break;
        }
        slog->abort((char *)"Bad Write reponse");
        return 0;
    }

    return 1;
}

// hs haystack can contain 0x00 s needle cannot
char *findstr(const char *hs,uint32_t len,const char *s)
{
    char *bp,*bpend;
    uint32_t lens;

    lens=(uint32_t)strlen(s);
    if (len < lens) {
        return 0;
    }

    bp=(char *)hs;
    bpend=bp+len-lens;
    while (bp <= bpend) {
        if (memcmp(bp,s,lens)== 0) {
            return bp;
        }
        ++bp;
    }
    return 0;

}