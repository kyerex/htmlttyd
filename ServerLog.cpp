#include "gsys.h"
#include "ServerLog.h"

#ifdef TGOSWIN32
#include <windows.h>
#include <process.h>
#define getpid _getpid
#endif

#include <errno.h>
#include <stdio.h>
#include <time.h>
#include <string.h>
#include <stdlib.h>

#ifdef TGOSLINUX
#include <unistd.h>
#endif

ServerLog::ServerLog(const char *fname)
{
	if (*fname == '\0') {
		logname=(char *)"";
	}
	else {
		logname=(char *)malloc(strlen(fname)+1);
		strcpy(logname,fname);
	}
}

void ServerLog::wlog(const char *s)
{
	FILE *log;
	
	if (*logname == '\0'){
		printf("%s",s);
	}
	else{
		log=fopen("sm32server.log","a");
		if (log==0){
			::abort();
		}
		fprintf(log,"%s",s);
		fclose(log);
	}
}

void ServerLog::ltime()
{
	struct tm *newtime;
	char am_pm[] = "AM";
	time_t long_time;
	char buf[128];

	time( &long_time );                /* Get time as long integer. */
	newtime = localtime( &long_time ); /* Convert to local time. */
	
	if( newtime->tm_hour > 12 ) {      /* Set up extension. */
		strcpy( am_pm, "PM" );
		newtime->tm_hour -= 12;        /*   to 12-hour clock.  */
	}
	if( newtime->tm_hour == 0 ) {      /*Set hour to 12 if midnight. */
		newtime->tm_hour = 12;
	}
	sprintf(buf, "[%d] %.19s %s  ",getpid(), asctime( newtime ), am_pm );
	wlog(buf);
}

void ServerLog::info(const char *s)
{
	ltime();
	wlog(s);
	wlog((char *)"\n");
}

void ServerLog::error(const char *s)
{
	char mess[512];
	
	mess[0]='\0';
#ifdef TGOSWIN32
	FormatMessage(FORMAT_MESSAGE_FROM_SYSTEM,
          0,
	      GetLastError(),
	      0,
	      mess,
	      512,
	      0);
#endif
#ifdef TGOSLINUX
	strcpy(mess,strerror(errno));
#endif
	wlog((char *)"\n************ ERROR !!!  **************\n\n");
	ltime();
	wlog((char *)"\n");
	wlog((char *)"The following error has occurred :\n");
	wlog((char *)"     ");
	wlog(mess);
	wlog((char *)"\n");
	wlog((char *)"     ");
	wlog(s);
	wlog((char *)"\n**************************************\n\n");
}

void ServerLog::abort(const char *s)
{
	this->error(s);
	::abort();
}
