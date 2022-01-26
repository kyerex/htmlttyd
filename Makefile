CC=	gcc
CPP=	g++
CPPFLAGS= -g $(OPTIMIZE) $(TARGET) -Wall -I.


OBJS=	do.o \
    s_d.o \
	TTYDevice.o \
	Sock2.o \
	hdcon.o \
	ServerLog.o \
	htmlttyd.o


all:	wss

wss:	$(OBJS) $(LIBS) 
	g++ -o htmlttyd $(OBJS) -lm -lutil $(LIBS2)  

clean:
	@rm -f *.o
	@rm -f htmlttyd

