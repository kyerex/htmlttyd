#ifndef TTYDEVICE_HEADER
#define TTYDEVICE_HEADER

class TTYDevice {
public:
    TTYDevice(int m);
    ~TTYDevice();
    void TDread(char *bp,uint32_t *len);
    void TDwrite(char *bp,uint32_t len);
private:
    int fd;
};

#endif

