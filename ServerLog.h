#ifndef SERVERLOG_HEADER
#define SERVERLOG_HEADER

class ServerLog 
{
public:
	ServerLog(const char *fname);
	~ServerLog() {};
	void wlog(const char *);
	void info(const char *);
	void abort(const char *);
	void error(const char *);
private:
	void ltime();
	char *logname;
};

#endif //SERVERLOG_HEADER
