#include "gsys.h"
#include "Sock2.h"
#include "ServerLog.h"
#include <stdio.h>

//#define DEBUGGING

#include <signal.h>
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

ServerLog *slog;

extern int HDCon(char *,Sock2 *);

int main(int argc,char *argv[])
{
    Sock2 s;
    Sock2 c;
    int port;
    int ret;
    fd_set readset;
    char buf[1000];

    if (argc < 2) {
        port=5001;
    }
    else {
        port=atoi(argv[1]);
        if (port <1024 || port > 49149) {
            port=5001;
        }
    }
    if (argc < 3) {
        slog = new ServerLog(""); // send log to console
    }
    else {
        slog = new ServerLog(argv[2]); // send log to file
    }
    s.open(port); // serve port
    
    sprintf(buf,"\n\n\nServing Port:%d ",port);
    slog->info(buf);
    signal(SIGCHLD,SIG_IGN);
    while (1) {
        FD_ZERO(&readset);
        FD_SET(s.fd,&readset);
        // pend forever waiting for connection request
        ret=select((int)(s.fd+1),&readset,NULL,NULL,NULL);
        if (ret == -1 && errno == EINTR) {
            continue;
        }
        if (ret == -1 || s.fd == INVALID_SOCKET) {
            slog->error((char *)"Error Ret from select\n");
            break;
        }
        //accept connection
        c.open(s); //child of fork must call DoHandShake
        if (c.fd == -2) {
            continue;
        }
        if (c.fd == INVALID_SOCKET) {
            slog->error((char *)"open failed ??\n");
            continue;
        }
#ifdef DEBUGGING
        HDCon(argv[0],&c); // pass connected Sock2 to HDCon
	    return 0;
#else
        if (0 == fork() ) {
            s.close();
            HDCon(argv[0],&c); // pass connected Sock2 to HDCon
	        return 0;
        }
        c.close(); // child server has the socket
#endif
    }
    s.close();
    return 0;
}
