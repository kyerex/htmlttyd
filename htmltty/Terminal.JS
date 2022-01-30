


function init(info1,info2,idir,config,ip_port,typestr)
{
    T_G.shutdown=function (){
        self.close();
    }
	T_G.CallType=typestr;
	T_G.timer=null;
	T_G.real_topw=self;
	T_G.connected = 0; //1 after sucessfull login 2 after 1st non login packet
	T_G.bell=document.getElementById("mybell");

	T_G.sock = new WebSocket("ws://"+ip_port+"/");
	T_G.bw = new Object();
	T_G.bw.windows = new Array();
	T_G.pu = new Pc3Uterm();

	T_G.bw_stack = new Array();

	T_G.bw.topw=self;
	T_G.bw.m=new MenuObj(T_G.pu.menu_h);
	T_G.bw.status_w=null;
	T_G.bw.status_e=null;
	T_G.bw.status_te=null;
	T_G.bw.windows[0]=new SMB_window(0,0,T_G.pu.win0_cols,T_G.pu.win0_rows,"_win0","100%","100%","");
	T_G.bw.cw=0; // current window
	T_G.bw.windows[0].pw=-1; // previous window
	T_G.bw.windows[0].nw=-1; // next window
	T_G.bw.topBody=null;

	T_G.pu.DefaultKeys();

	T_G.pu.SetFontSizes();

	T_G.sock.onclose = function(e) {
		T_G.shutdown();
		console.log("Got Here");
	};

	T_G.sock.onopen = function (e){
		p = new Pc2Packet("");
    	p.type=p.pc2init;
    	p.username=info1;
    	p.password=info2;
    	p.idir=idir;  
		p.uinfo=config;
    	p_serial(p);
    };
    
    T_G.sock.onmessage=function (e){
		var m = e.data;
		p=new Pc2Packet(m);

		if ( T_G.connected == 0 ) {
			T_G.connected = 1;
			if (p.type != p.pc2loginres) {
				alert("Did not get Login Response packet\n"+p.type);
				T_G.sock.close();
				T_G.real_topw.close();
				return;
			}
			if (p.res !=0 ) {
				alert("Connection Not Accepted");
				T_G.sock.close();
				T_G.real_topw.close();
				return;
			}
			T_G.pu.ChangeMode(p.mode_flag);
		}
		else {
			if (T_G.connected == 1) {
				T_G.connected = 2;
				starttext();
			}
			T_G.pu.Dispatch(p);
		}

	};
};

function starttext()
{
	
	var cwin=T_G.bw.windows[T_G.bw.cw];
	cwin.cs();
	T_G.bw.topBody=T_G.bw.topw.document.getElementsByTagName("BODY")[0];
	T_G.bw.topw.document.title="htmltty";
	cwin.WinResize();
};

//copied off net
function dosleep(ms)
{
	return new Promise(resolve => setTimeout(resolve, ms));
};
async function sleep(ms)
{
	console.log("start sleep");
	dosleep(ms);
	console.log("stop sleep");

} 