CC=	gcc
CPP=	g++
CPPFLAGS= -g -O -Wall -I.


OBJS=	do.o \
    s_d.o \
	TTYDevice.o \
	Sock2.o \
	hdcon.o \
	ServerLog.o \
	htmlttyd.o

all:	
	@rm -f loadspa
	(make loadspa)
	@./loadspa
	as spa.s -o spa.o
	(make wss)

wss:	$(OBJS) $(LIBS) 
	g++ -g -O -Wall -o htmlttyd $(OBJS) spa.o -lm -lutil $(LIBS2)  

loadspa:
	g++ -g -O -o loadspa loadspa.cpp

clean:
	@rm -f *.o
	@rm -f htmlttyd
	@rm -f loadspa
	@rm -f spa.s
