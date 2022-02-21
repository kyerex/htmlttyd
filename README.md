# htmlttyd/htmltty - add html to a character based program.

### htmlttyd
htmlttyd linux is a terminal server, similar to a telnet daemon. It communicates to a java script client htmltty over websockets.
It also acts as a mini web server serving up htmltty as a single page app(SPA) and its favicon. login.html and 
all the .js files are turned into data that is linked into htmlttyd at make time.

It can be executed in su mode by

#./htmlttyd 5001 htmlttyd.log &

1st param port 2nd log name.

### htmltty
htmltty is the SPA served up by htmlttyd. It can also be bought up by modifying the tlogin.html with the appropriate ip:port. It was originally made to run 
with my sm32 server but has been modified to include a vt100 terminal emulation.
htmltty currently only works under chrome or chromium.

if you are trying to bring up htmltty on the same box as htmlttyd you can do something like:

/usr/bin/google-chrome --app=http://127.0.0.1:5001 2>/dev/null &

or from a windows box to your linux box make the target of a shortcut something like:

"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app=http://192.168.1.72:5001

Download and build the demo project for a how to.
