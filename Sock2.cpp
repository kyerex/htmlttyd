#include "gsys.h"
#include "Sock2.h"
#include "do.h"
#include "ServerLog.h"
#include <stdio.h>
extern "C" {
#ifdef TGOSLINUX
#include <sys/socket.h>        /* shutdown() */
#include <netdb.h>			/* getservent() */
#include <netinet/in.h>        /* struct sockaddr_in, INADDR_NONE */
#include <netinet/tcp.h>
#include <netinet/ip.h>
#include <arpa/inet.h>        /* inet_addr() */
#include <sys/ioctl.h>        /* ioctl() */
#include <sys/times.h>              /* times() */
#include <sys/termios.h>        /* fstat() */
#include <sched.h>
#include <fcntl.h>        /* fcntl() */
#include <string.h>        /* bcopy() */
#include <errno.h>        /* errno */
#include <stdlib.h>        /* exit() */
#include <sys/types.h>
#include <sys/time.h>
#include <unistd.h>        /* close(),sleep(),chdir(), select(),getopt() */
#include <sys/types.h>
#include <sys/stat.h>        /* fstat() */
#endif
}


/* I used to have i think for diff version of unix
#if EWOULDBLOCK-EAGAIN
    !! error Sock::get assumes EAGAIN == EWOULDBLOCK
#endif
*/

#ifdef TGOSLINUX
int closesocket (SOCKET s)
{
    return ::close(s);
}

#define GETERR errno
#endif

#ifdef TGOSWIN32

static int startup_count=0;

int Sock2::startup ()
{
    WSADATA WSAData;

    if (startup_count == 0) {
        if (::WSAStartup (MAKEWORD(2,0), &WSAData) != 0) {
            return 1;
        }
    }
    ++startup_count;
    return 0;
}

int Sock2::cleanup ()
{
    if (startup_count == 0) {
        return 1;
    }
    --startup_count;
    if (startup_count == 0) {
        if (0 !=::WSACleanup() ) {
            return 1;
        }
    }
    return 0;
}
#endif

extern ServerLog *slog;

Sock2::~Sock2()
{
    this->close();
#ifdef TGOSWIN32
    cleanup();
#endif
}

Sock2::Sock2()
{
    fd=INVALID_SOCKET;
    st=NOTDEFINED;
    buffer=NULL;
#ifdef TGOSWIN32
    startup();
#endif

}

// connect to server on port # 
void Sock2::open(const char *host,int port) 
{
    open(host,port,LONGLEN);
}
void Sock2::open(const char *host,int port,int t)
{
    fd=INVALID_SOCKET;

    if (t == LONGLEN)  {
        open(host,port,t,16777215);
    }
    if (t == SHORTLEN) {
        open(host,port,t,65535);
    }
    return; // any bad type leaves fd=INVALID_SOCKET;
}

void Sock2::open(const char *host,int port,int t,uint32_t m)
{
    struct hostent *phe;
    struct sockaddr_in addr;
    u_long  inaddr;
    int  tries;

    fd=INVALID_SOCKET;

    if (t != LONGLEN && t != SHORTLEN) {
        return;
    }
    st=t;
    if (t == LONGLEN) {
        if (m <128 || m > 16777215) {
            m=16777215;
        }
    }
    else {
        if (m <128 || m > 65536) {
            m=65535;
        }
    }
    mlength=m;
    memset((char *)&addr,'\0', sizeof(addr));
    addr.sin_family = AF_INET;
    if ((inaddr = inet_addr(host)) != INADDR_NONE) {
        memcpy((char *)&addr.sin_addr,(char *)&inaddr, sizeof(inaddr));
    }
    else {
        if ((phe = gethostbyname(host)) == NULL) {
            return;
        }
        memcpy((char*)&addr.sin_addr,phe->h_addr, phe->h_length);
    }

    addr.sin_port = htons(port);
    if ((fd = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
        slog->abort("Sock2::open(char *host,int port) "
                    "Error return from socket(AF_INET, SOCK_STREAM, 0)");
        fd=INVALID_SOCKET;
        return;
    }

#ifdef TGOSLINUX
    int lowdelay = IPTOS_LOWDELAY;
    setsockopt(fd,IPPROTO_IP, IP_TOS,
                                 (void *)&lowdelay,sizeof(lowdelay));
#endif
    int on = 1;
    setsockopt(fd, IPPROTO_TCP, TCP_NODELAY, (char *)&on, sizeof(on));

    tries=0;
    while (1) {
        if (connect(fd, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
            err=GETERR;
            if (err == ETIMEDOUT || err == ECONNREFUSED ) {
                if (++tries < 10 ) {
#ifdef TGOSWIN32
                    Sleep(1000);
#endif
#ifdef TGOSLINUX
                    sleep(1);
#endif
                    continue;
                }
                closesocket(fd);
                fd=INVALID_SOCKET;
                slog->abort("Sock2::open(char *host,int port,int sizeof_len) "
                            "Error return from(10 retries): "
                            "connect(fd, (struct sockaddr *)&addr, "
                "sizeof(addr)");
                return;
            }
            else {
                closesocket(fd);
                fd=INVALID_SOCKET;
                slog->abort("Sock2::open(char *host,int port,int sizeof_len) "
                            "Error return from "
                            "connect(fd, (struct sockaddr *)&addr, "
                "sizeof(addr)");
                return;
            }
        }
        break;
    }
    // set to non-blocking
#ifdef TGOSWIN32
    unsigned long noblock=1;
    ioctlsocket(fd,FIONBIO,&noblock);
#endif
#ifdef TGOSLINUX
    fcntl(fd,F_SETFL,fcntl(fd,F_GETFL,0) | FNDELAY);
#endif
    length = 0;
    offset = 0;
    state  = INVALID;
    buffer=NULL;
    DoCHandShake();
    return;
}

// serve a port #
void Sock2::open(int port)
{
    open(port, (unsigned int)INADDR_ANY);
}

// serve a port # on a specified interface
void Sock2::open(int port,char *inter)
{
    u_long inaddr;

    if ((inaddr = inet_addr(inter)) == INADDR_NONE) {
        fd=INVALID_SOCKET;
        slog->abort("Sock2::open(int port,int sizeof_len,char *inter) "
                    "error return from inet_addr(inter) - bad interface name");
        return;
    }
    open(port, inaddr);
}

// serve port port on interface s_addr
void Sock2::open(int port,unsigned int sadd)
{
    struct sockaddr_in addr;

    memset((char *)&addr,'\0', sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr=sadd;
    addr.sin_port = htons(port);
    if ((fd = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
        fd=INVALID_SOCKET;
        slog->abort("Sock2::open(int port,int sizeof_len,unsigned long sadd) "
                    "error return from socket(AF_INET, SOCK_STREAM, 0)");
        return;
    }
    
#ifdef TGOSLINUX
    int lowdelay = IPTOS_LOWDELAY;
    setsockopt(fd,IPPROTO_IP, IP_TOS,
                                 (void *)&lowdelay,sizeof(lowdelay));
#endif
    int on = 1;
    setsockopt(fd, IPPROTO_TCP, TCP_NODELAY, (char *)&on, sizeof(on));

    if ( 0 != bind(fd,(struct sockaddr *)&addr,sizeof(addr)) ) {
        closesocket(fd);
        fd=INVALID_SOCKET;
        slog->abort("Sock2::open(int port,int sizeof_len,unsigned long sadd) "
                    "error return from bind(fd,(struct sockaddr *)&addr,"
            "sizeof(addr))");
        return;
    }
    buffer=NULL;
    (void) listen(fd, 5);
    // set to non-blocking
#ifdef TGOSWIN32
    unsigned long noblock=1;
    ioctlsocket(fd,FIONBIO,&noblock);
#endif
#ifdef TGOSLINUX
    fcntl(fd,F_SETFL,fcntl(fd,F_GETFL,0) | FNDELAY);
#endif

    state  = SERVING;
    return;
}

// accept a call from a serving Sock object
void Sock2::open(const Sock2 &s)
{
    struct sockaddr_in from;
#ifdef TGOSLINUX
    socklen_t fromlen;
#endif
#ifdef TGOSWIN32
    int fromlen;
#endif

    fd=INVALID_SOCKET;
    if (s.fd == INVALID_SOCKET || s.state != SERVING) {
        slog->abort("Sock2::open(const Sock &s) "
                    "attempt to accept call from now serving object");
        return;
    }
    fromlen=sizeof(from);
    fd=accept(s.fd,(struct sockaddr *)&from,&fromlen);
    if (INVALID_SOCKET == fd) {
        slog->error("Sock2::open(const Sock &s) "
                    "error return from accept(s.fd,(struct sockaddr *)"
            "&from,&fromlen))");
        return;
    }
    // set to non-blocking
#ifdef TGOSWIN32
    unsigned long noblock=1;
    ioctlsocket(fd,FIONBIO,&noblock);
#endif
#ifdef TGOSLINUX
    fcntl(fd,F_SETFL,fcntl(fd,F_GETFL,0) | FNDELAY);
#endif
    buffer=NULL;
    length = 0;
    offset = 0;
    state  = INVALID;
    return;
}

void Sock2::close()
{
    SOCKET x;
    /* if fd==INVALID_SOCKET a socket was never connected and nothing allocated */
    if (fd != INVALID_SOCKET) {
        x=fd;
        fd=INVALID_SOCKET;
        closesocket(x);
    }
    buffer=NULL;
}

void Sock2::apply_mask(char *obp,uint32_t len) 
{
    byt *bp;
    uint32_t i;
    int j;

    j=0;
    bp=(byt *)obp;
    for (i=0;i!=len;++i){
        j=j%4;
        *bp = *bp ^ mask[j];
        ++j;++bp;
    }
}

enum Sock2::SockRet Sock2::get_datax(char *d,uint32_t l)
{
    enum SockRet ret;

    while (1) {
        ret = get_data(d,l);
        if (ret == NOT_READY) {
            if (READY != waitsock(5)){ // once some data ready hang a max of 5 seconds
                return ERR;
            }
            continue;
        }
        break;
    }
    return ret;
}

enum Sock2::SockRet Sock2::get_data(char *rdata, uint32_t rlen)
{
    int n;

    if (fd < 0) {
        slog->abort("Sock2::getdata(char *rdata, int *rdlen) "
                "Sock object not open");
        return(ERR);
    }
    if (state == INVALID) {
        /* start of read */
        buffer=(unsigned char *)rdata;
        offset = 0;
        length = rlen;
        state  = READING; // goto READING state
    }

    if (state == READING) {
        while (length) {
            n = recv(fd, (char *)&buffer[offset], length,0);
            if (!n) {
                return CLOSED;
            }
            if (n < 0) {
                err=GETERR;
                if (err == EWOULDBLOCK || err == EINTR) {
                    return(NOT_READY);
                }
                slog->error("Sock2::getdata(char *rdata, int *rdlen) "
                             "error returned "
                             "from recv(fd, (char *)&buffer[offset], length,0)");
                state=INVALID;
                return ERR;
            }
            length -= n;
            offset += n;
        }
        buffer=NULL;
        state=INVALID;
        return READY;
    }
    state = INVALID;
    slog->abort("Sock::getdata(char *rdata, int *rdlen) "
                "logic error can't be here");
    return ERR;
}    // Sock2::get_data

enum Sock2::SockRet Sock2::waitsock(int tim)
{
    fd_set readfds;
    struct timeval tv;
    struct timeval *tvx;

    while (1) {
        FD_ZERO(&readfds);
        FD_SET(fd,&readfds);
        if (tim == -1) {
            tvx=0;
        }
        else {
            tv.tv_usec=0;
            tv.tv_sec=(long)tim;
            tvx=&tv;
        }
        if (1 != select((int)fd+1,&readfds,0,0,tvx)) {
            if (errno == EINTR) continue;
            return ERR; //timout 0 returned
        }
        break;
    }
    return READY;
}

enum Sock2::SockRet Sock2::getwait(char **data, uint32_t *len,int tim)
{
    if (st == HTMLSOCK) {
        return NOT_READY;
    }
    if (READY != waitsock(tim)) {
        return NOT_READY;
    }
    return get(data,len);
}

enum Sock2::SockRet Sock2::get(char **data, uint32_t *len)
{
    enum SockRet ret;

    if (st == HTMLSOCK) {
        return NOT_READY;
    }
    *data=NULL;
    if (READY != get_len(len)){ //assume full length is avaiable
        slog->info("Error on Get len\n");
        return ERR;
    }
    *data=(char *)malloc(*len);
    ret = get_datax(*data,*len);
    if (ret == READY) {
        if (st == WEBSOCK) {
            apply_mask(*data,*len);
        }
        return READY;
    }
    slog->info("error reading data\n");
    free(*data);
    *data=NULL;
    return ERR;
}   // Sock2::getwait

enum Sock2::SockRet Sock2::put(char *data,uint32_t dlen)
{
    enum SockRet ret;

    ret = put_len(dlen);
    if (ret != READY) {
        return ret;
    }
    return put_data(data,dlen);
}
enum Sock2::SockRet Sock2::put_data(char *data,uint32_t dlen)
{
    int n,len;
    int offset;
    char *wbuf;

    int wait_time=10000; // Give up time slot 10000 times on stalled output

    if (fd < 0) {
        slog->abort("Sock2::put(const unsigned short *data) "
                    "Sock object not open");
        return(ERR);
    }
    len=(int)dlen;
    offset=0;
    wbuf=data;
    while (len) {
        n = send(fd, &wbuf[offset], len,0);
        if (n < 0) {
            err=GETERR;
            if (err == EWOULDBLOCK && wait_time != 0) {
#ifdef TGOSLINUX
                //sched_yield();
                usleep(1000);
#endif
#ifdef TGOSWIN32
                Sleep(1);
#endif
                --wait_time;
                continue;;
            }
            slog->error("Sock2::put(const unsigned short *data) "
                        "error return send(fd, (char *)&wbuf[offset], len,0)");
            return(ERR); // lost connection
        }
        len    -= n;
        offset += n;
    }
    return(READY);
}    // Sock2::put

const char *connected="connected";

// should be called by child
void Sock2::DoHandShake()
{
    char key[2048];
    char *bp;
    int n,len;

    st=NOTDEFINED; // should already be NOTDEFINED
    bp=hsbuf;n=1;
    if (READY != get_datax(bp,1)) {
        return;
    }
    if (*bp == 'S' || *bp == 'L'){
        while (*bp != '\0') {
            ++bp;++n;
           if (n==2048) {
                return;;
            }
            if (READY != get_datax(bp,1)) {
                return;
            }
        }
    }
    else {
        if (READY != get_datax(bp+1,31)) {
            return;
        }
        bp=&hsbuf[32];n=32;
        while (memcmp(&hsbuf[n-4],"\r\n\r\n",4) !=0 ) {
            if (READY != get_datax(bp,1)) {
                return;
            }
            ++bp;++n;
            if (n==2048) {
                return;
            }
        }
    }
    if (n>4 && hsbuf[n-1] == '\0') {
        len=-1; // check for LONG or SHORT handshake
        if (memcmp(hsbuf,"SHORT",5) == 0) {
            st=SHORTLEN;
            if (n > 5 && hsbuf[5] == ',') {
                len=atoi(&hsbuf[6]);
                if (len < 128 || len >65535) {
                    len=65535;
                }
            }
            else {
                len=65535;

            }
        }
        if (memcmp(hsbuf,"LONG",4) == 0) {
            st=LONGLEN;
            if (n > 4 && hsbuf[4] == ',') {
                len=atoi(&hsbuf[5]);
                if (len < 128 || len >16777215) {
                    len=16777215;
                }
            }
            else {
                len=16777215;

            }
        }
        if ( len != -1) {
            mlength=(uint32_t)len;
            strcpy(hsbuf,connected);
            len=strlen(hsbuf)+1;
            n = send(fd,hsbuf,len,0);
            if (n != (int)len) {
                st=NOTDEFINED;
            }
            return;
        } // else fall thru to check for websock handshake
    }
    hsbuf[n]='\0';
    if (n < 32) {
        return;
    }
    if (strstr (hsbuf,"Upgrade: websocket") == 0) {
        if (memcmp(hsbuf,"GET /",4) == 0) {
            st=HTMLSOCK;
            mlength=16777215;
        }
        //st="NOTDEFINED"
        return;
    }
    if (memcmp(hsbuf,"GET / HTTP/1.1\r\n",16) != 0) return;
    if (strstr (hsbuf,"Connection: Upgrade") == 0) return;
    if (strstr (hsbuf,"Sec-WebSocket-Version: 13") == 0) return;
    if ((bp=strstr (hsbuf,"Sec-WebSocket-Key:")) == 0) return;
    strcpy(key,bp+18);
    bp=key;while (*bp==' ')++bp;
    strcpy(hsbuf,bp);
    bp=hsbuf;while(*bp > ' ')++bp;
    *bp='\0';
    strcpy(key,hsbuf);
    strcat(key,(char *)"258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
    do_sha1 (key,(unsigned int)strlen(key),hsbuf);
    do_hta64((byt *)hsbuf,20,(byt *)key,(uint32_t *)&len);
    key[len]='\0';
    strcpy(hsbuf,"HTTP/1.1 101 Switching Protocols\r\n");
    strcat(hsbuf,"Upgrade: websocket\r\n");
    strcat(hsbuf,"Connection: Upgrade\r\n");
    strcat(hsbuf,"Sec-WebSocket-Accept: ");
    strcat(hsbuf,key);
    strcat(hsbuf,"\r\n\r\n");
    len=(unsigned int)strlen(hsbuf);
    n = send(fd,hsbuf,len,0);
    if (n != (int)len) return;
    st=WEBSOCK;
    mlength=16777215;
}

void Sock2::DoCHandShake()
{
    char buf[128];
    int n,len;

    if (st == LONGLEN) {
        sprintf(buf,"LONG,%u",mlength);
    }
    else {
        sprintf(buf,"SHORT,%u",mlength);
    }
    len=strlen(buf)+1;
    n = send(fd,buf,len,0);
    if (n != (int)len) {
bad_chandshake:
        close();
        slog->error((char *)"Client Hand Shake error aborting connection");
        return;
    }
    //pend 5 seconds
    if (READY != waitsock(5)){
        goto bad_chandshake;
    }
    len=strlen(connected)+1;
    if (READY != get_datax(buf,len)){
        goto bad_chandshake;
    }
    if (memcmp(buf,connected,len) !=0) {
        goto bad_chandshake;
    }
}

enum Sock2::SockRet Sock2::put_len(uint32_t dlen)
{
    unsigned short s;
    unsigned long l;
    char tbuf[128];
    unsigned char *bp,*bp2;

    if (dlen > mlength) {
        slog->error("Sock2::SockRet Sock2::put_len(uint32_t dlen)"
                        "Data Len greater than mlength");
        return ERR;
    }
    s=htons((unsigned short)dlen);
    l=htonl((unsigned long)dlen);

    switch (st) {
        case SHORTLEN:
            return put_data((char *)&s,2);

        case LONGLEN:
            return put_data((char *)&l,4);

        case WEBSOCK:
            bp=(unsigned char *)tbuf;
            *bp=0x81;++bp;
            if (dlen < 126) {
                *bp=(byt)dlen;
                ++bp;
            }
            else {
                if (dlen > 0xffff) {
                *bp = 0x7f; ++bp;
                *bp = 0; ++bp;
                *bp = 0; ++bp;
                *bp = 0; ++bp;
                *bp = 0; ++bp;
                bp2=(unsigned char *)&l; //l is in net long
                *bp=*bp2; ++bp; ++bp2;
                *bp=*bp2; ++bp; ++bp2;
                *bp=*bp2; ++bp; ++bp2;
                *bp=*bp2; ++bp; ++bp2;
                }
                else {
                    *bp = 0x7e; ++bp;
                    bp2=(unsigned char *)&s; //s is in net long
                    *bp=*bp2; ++bp; ++bp2;
                    *bp=*bp2; ++bp; ++bp2;
                }
            }
            return put_data(tbuf,(char *)bp-tbuf);

        default:
            // HTMLSOCK handles len elsewhere
            slog->info("enum Sock2::SockRet Sock2::put_len(uint32_t dlen) "
                "logic error can't be here");
            return NOT_READY;

    }
    return READY;
}

enum Sock2::SockRet Sock2::get_len(uint32_t *dlen)
{
    unsigned short s;
    unsigned long l;
    enum SockRet ret;
    char tbuf[128];
    uint32_t len;

    switch (st) {
        case SHORTLEN:
            ret = get_datax((char *)&s,2);
            if( ret != READY) {
                return ret;
            }
            s=ntohs(s);
            *dlen=(uint32_t)s;
            return READY;
        case LONGLEN:
            ret = get_datax((char *)&l,4);
            if( ret != READY) {
                return ret;
            }
            l=ntohl(l);
            *dlen=l;
            return READY;

        case WEBSOCK:
            ret = get_datax(tbuf,2);
            if (ret != READY) {
                return ERR;
            }
            if ((byt)tbuf[0] != (byt)0x81) {
                return ERR;;
            }
            if ((tbuf[1] & 0x80) != 0x80) {
                return ERR;
            }
            len = (int)(tbuf[1] & 0x7f);
            if (len == 126) {
                ret = get_datax(tbuf,2);
                if (ret != READY) {
                    return ERR;
                }
                len=256 * (byt)tbuf[0] + (byt)tbuf[1];
            }
            else {
                if (len == 127) {
                    ret = get_datax(tbuf,8);
                    if (ret != READY) {
                        return ERR;
                    }
                    if (tbuf[0] !=0 || tbuf[1] !=0 || tbuf[2] !=0 || tbuf[3] !=0 ) {
                        return ERR;
                    }
                    len = 16777216*(byt)tbuf[4]+65536 * (byt)tbuf[5] + 256 * (byt)tbuf[6] + (byt)tbuf[7];
                }
            }
            if (len > mlength) {
                return ERR;
            }
            ret = get_datax(tbuf,4);
            if (ret != READY) {
                return ERR;
            }
            mask[0]=tbuf[0];
            mask[1]=tbuf[1];
            mask[2]=tbuf[2];
            mask[3]=tbuf[3];
            *dlen=len;
            return READY;
        default:
            slog->abort("Sock2::get_len(uint32_t *dlen) "
                "logic error can't be here");
            // no return
    }
    return READY;
}