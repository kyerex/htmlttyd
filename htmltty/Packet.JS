

new Pc2Packet("");
Pc2Packet.prototype.pc2init=12345;
Pc2Packet.prototype.pc2loginres = 12346;
Pc2Packet.prototype.pc2open = 12347;
Pc2Packet.prototype.pc2openres = 12348;
Pc2Packet.prototype.pc2fin = 12349;
Pc2Packet.prototype.pc2finres = 12350;
Pc2Packet.prototype.pc2write = 12351;
Pc2Packet.prototype.pc2writeres = 12352;
Pc2Packet.prototype.pc2readrecord = 12353;
Pc2Packet.prototype.pc2readrecordres = 12354;
Pc2Packet.prototype.pc2read = 12355;
Pc2Packet.prototype.pc2readres = 12356;
Pc2Packet.prototype.pc2close = 12357;
Pc2Packet.prototype.pc2closeres = 12358;
Pc2Packet.prototype.pc2escape=12359;
Pc2Packet.prototype.pc2readguires=12360;        // pc2readguires is the same as pc3readrecordres
Pc2Packet.prototype.pc2schar=12361;             // streaming mode input char - each char sent as typed
Pc2Packet.prototype.pc2xpmode=12362;            // exit packet mode back to streaming mode

function Pc2Packet(s)
{
    var s2,k,d,x;
    
    if (s != "") {
        if (s.substr(-1,1) != "*") {
            s="0,0,0," //invalid packet
        }
        else {
            s=atob(s.slice(0,-1));
        }
        var s1 = s.split(",")
        this.type = s1[0] - 0;
        switch(this.type) {
                
            case this.pc2loginres:
                this.res = s1[1] - 0;
                this.mode_flag = s1[2] -0;
                break;
            
            case this.pc2open:
                this.chan = s1[1] - 0;
                break;
            
            case this.pc2write:
                this.siop = new Object();
                this.siop.chan_flag = s1[1] - 0;
                this.siop.siz_eq = s1[2] - 0;
                this.siop.len_eq = s1[3] - 0;
                this.siop.tim_eq = s1[4] - 0;
                this.siop.io_flag = s1[5] - 0;
                this.dlen1=s1[6] -0;
                var l = s1[0].length + s1[1].length + s1[2].length + s1[3].length;
                l = l  + s1[4].length + s1[5].length + s1[6].length + 7;
                if (this.dlen1 == 0) {
                    this.data="";
                }
                else {
                    this.data=s.substr(l);
                }
                //this.dlen1=this.data.length;
                if (this.siop.io_flag & T_G.pu.gui_flag) {
                	//write gui the data hould be an assosiative array
                	s2=this.data;
                	this.data=new Object();
                    if (s2.substr(-3,3) != "\0\0\0") {
                        console.log("Invalid HTML ksa - no triple null: "+s2);
                        this.data=undefined;
                        return;
                    }
                	while (s2 != '\0\0') {
                		x=s2.search('\0');
                        if (x < 1) {
                            console.log("HTML ksa bad key: "+s2);
                            this.data=undefined;
                            return
                        }
                		k=s2.substr(0,x);
                		s2=s2.substr(x+1);
                		x=s2.search('\0');
                        if (x == -1) {
                            console.log("HTML ksa no data ??: "+s2);
                            this.data=undefined;
                            return;
                        }
                		d=s2.substr(0,x);
                		s2=s2.substr(x+1);
                		this.data[k]=d;
                        if (s2.length < 2) {
                            console.log("HTML ksa ran out of data: "+s2);
                            this.data=undefined;
                            return;
                        }
                	}
                }
                break;

            case this.pc2readrecord:
            case this.pc2read:
                this.siop = new Object();
                this.siop.chan_flag = s1[1] - 0;
                this.siop.siz_eq = s1[2] - 0;
                this.siop.len_eq = s1[3] - 0;
                this.siop.tim_eq = s1[4] - 0;
                this.siop.io_flag = s1[5] - 0;
                break;


            case this.pc2close:
                break;

            default:
                console.log("received invalid packet");
                this.type=this.pc2close;
                this.siop = new Object();
                this.siop.chan_flag = 0;
                this.siop.siz_eq = 0;
                this.siop.len_eq = 0;
                this.siop.tim_eq = 0;
                this.siop.io_flag = 0;
                break;
        }
                	
    }
}

function p_serial(p)
{
    switch(p.type) {
        case p.pc2init:
            var ps=""+p.type+","+p.username+","+p.password+","+p.idir+","+p.uinfo+",";
            break;
            
        case p.pc2openres:
            var ps=""+p.type+","+p.sm32_error+","+p.chan_flag+",";
            break;
        
        case p.pc2escape:    
        case p.pc2closeres:        	
            var ps=""+p.type+",";
            break;
            
        case p.pc2writeres:
            var ps=""+p.type+","+p.sm32_error+","+p.chan_flag+",";
            break;
            
        case p.pc2readrecordres:
            var ps=""+p.type+","+p.sm32_error+","+p.data;
            break;
            
        case p.pc2readguires:
            // in a read gui the data item is a ksa(object)
            var s,k;
            s="";
            for (k in p.data) {
                s=s+k+'\0'+p.data[k]+'\0';
            }
            s=s+'\0\0';
            
            var ps=""+p.type+","+p.sm32_error+","+s;
            break;
        
        case p.pc2readres:
            var ps=""+p.type+","+p.sm32_error+","+p.ctl+","+p.dlm+","+p.data;
            break;

        case p.pc2schar:
            var ps=""+p.type+","+p.ikey+","+p.data;
            break;
    }
    ps=btoa(ps)+"*";
    while (ps.length > 4000) {
        s=ps.substring(0,4000);
        ps=ps.substring(4000);
        T_G.sock.send(s);
    }
    T_G.sock.send(ps);
    return;
}
