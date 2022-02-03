CC=	gcc
CPP=	g++
CPPFLAGS= -g -O -Wall -I.


OBJS=	do.o \
    s_d.o \
	TTYDevice.o \
	Sock2.o \
	hdcon.o \
	spa.o \
	ServerLog.o \
	htmlttyd.o

all:
	@rm -f loadspa
	(make loadspa)
	@./loadspa
	(make wss)

wss:	$(OBJS) $(LIBS) 
	g++ -g -O -Wall -o htmlttyd $(OBJS) -lm -lutil $(LIBS2)  

loadspa:
	g++ -g -O -o loadspa loadspa.cpp

clean:
	@rm -f *.o
	@rm -f htmlttyd
	@rm -f loadspa
	@rm -f spa.cpp

