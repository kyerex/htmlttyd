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

int bDebug=1;

uint32_t getlogin(char **h);
extern ServerLog *slog;

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
    TTYDevice *tty0=NULL;
    struct pc2_initpacket *pi;
    struct pc2_loginres *lr;
    struct pc2_schar *ps;
    struct pc2_write *pw;
    uint32_t len;
    char buf[1024];
    char tbuf[MAXTRANSFER];
    char obuf[MAXTRANSFER]; 
    int n;
    fd_set readset,errset;
    int nready,master,maxfd;
    struct sockaddr_in name;
    socklen_t namelen;
    char *nbp;
    int send_ksa=0; // 1 if sending a ksa for a read gui

    char *h;

    if (s->st == HTMLSOCK) {
        len=getlogin(&h);
        s->put(h,len);
        free((void *)h);
        sleep(2);
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
    while (1) {
        FD_ZERO(&readset);
        FD_SET(s->fd, &readset);
        FD_SET(master,&readset);
        FD_ZERO(&errset);
        FD_SET(s->fd, &errset);
        FD_SET(master,&errset);
        //pend forever wait for data from htmltty and slave sid of ptty
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
            continue;
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