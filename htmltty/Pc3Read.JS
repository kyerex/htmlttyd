
function reprint_from_ipos()
{
    var save_col,save_row,save_wrap_off,i;
    var p=this.rp;
	var cwin=T_G.bw.windows[T_G.bw.cw];
	
	save_col=cwin.col;
	save_row=cwin.row;
	for (i=p.pos; i < p.ibuf.length; ++i) {
		cwin.echo_char(p.ibuf.substr(i,1));
	}
	save_wrap_off=cwin.wrap_off;
	cwin.wrap_off=true;
	cwin.echo_char(" ");
	cwin.wrap_off=save_wrap_off;
	cwin.col=save_col;
	cwin.row=save_row;
}

function blank_from_ipos()
{
    var save_col,save_row,i;
    var p=this.rp;
	var cwin=T_G.bw.windows[T_G.bw.cw];
	
	save_col=cwin.col;
	save_row=cwin.row;
	for (i=p.pos; i < p.ibuf.length; ++i) {
		cwin.echo_char(" ");
	}
	cwin.echo_char(" ");
	cwin.col=save_col;
	cwin.row=save_row;
}

function EndRead()
{
	/* read bailed with error maybe end= from menu */
	po=new Pc2Packet("");
	p=this.rp;
	if (p.type == p.pc2read) {
		po.type=po.pc2readres;
		po.ctl=0;
		po.dlm=0;
	}
	else {
		po.type=po.pc2readrecordres; // this could have been a readgui also
	}
	po.dlen1=0;
	po.sm32_error=this.sm32_error; /* this will be non zero */
	po.data="";
	this.rp=null; // read finished
	p_serial(po);
	T_G.bw.windows[T_G.bw.cw].caret_off();
	this.gui.data_ready=false;
	this.gui.data=null;
	if (this.Timer != null) {
	    clearTimeout(this.Timer);
	    this.Timer=null;
	}
}

function Pc3Read()
{
	var flag,po;
	
	if (this.kb_locked) {
		this.kb_locked=false;
		this.sm32_error=this.e_keyboard_locked;
		flag=true;
	}
	else {
		flag=this.Pc3Readx();
	}
	if (flag) {
		this.EndRead();
		return;
	}
	if (this.rp != null) {/* if we are still reading turn on caret */
		T_G.bw.windows[T_G.bw.cw].caret_on();
	}
}

function Pc3Readx()
{
    var s,px,c,po;
    var p=this.rp;
	var cwin=T_G.bw.windows[T_G.bw.cw];
	
	cwin.caret_off();
    while (true) {	
       	if (this.sm32_error != 0) {
       	 	return true;
       	}
		switch (p.rtype) {
        	case 1: // READ with screenedit   	
 			if (p.siop.siz_eq !=0 && p.ibuf.length == p.siop.siz_eq) {
        		this.reprint_from_ipos();
 	        	this.send_read_res(p,5,0);
 	        	return false;
 			}
 			if (p.pos >= p.prompt.length) p.prompt="";
         	if (this.rbuf.length == 0) {
         		if (p.insert) {
         			cwin.scrolled=false;
         			cwin.echo_char(" ");
         			this.reprint_from_ipos();
         			cwin.back_cursor();
         			if (cwin.scrolled) {
         				--cwin.row;
         			}	
         		}
         		else {
         			this.reprint_from_ipos();
         		}
         		return false;
         	}
 			/*** get next char ***/     	
       	 	s=this.rbuf.substr(0,1);
	    	this.rbuf=this.rbuf.substr(1);
	    	
        	if ( (px=this.terms.indexOf(s)) != -1) {
        		this.reprint_from_ipos();
        		this.send_read_res(p,this.terms_ctl.charCodeAt(px),s.charCodeAt(0));
				if (this.scr_no_echo_delim == false) {
		    		cwin.col=0;
		    		cwin.inc_row();
				}
				return false;
        	}
        	
             /*** handle specialchars ***/
             
       	 	if (s =="\b") {					//backspace
       	 		if (p.pos == 0) {
       	 			T_G.bell.play();
       	 			continue; // get next char
       	 		}
       	 		if (p.ibuf.length == p.pos) {
       	 			if (p.ibuf.length == 1) {
       	 				p.ibuf="";
       	 			}
       	 			else {
       	 				p.ibuf=p.ibuf.substr(0,p.ibuf.length-1);
       	 			}
       	 			--p.pos;
       	 			cwin.back_space();
       	 			continue; // get next char
       	 		}
       	 		else {
       	 			if (p.pos > p.ibuf.length) {
       	 				alert ("SCR Read Error");
       	 				continue;
       	 			}
       	 			--p.pos;
       	 			if (p.pos == 0) {
       	 				p.ibuf=p.ibuf.substr(1);
       	 			}
       	 			else {
						p.ibuf=p.ibuf.substr(0,p.pos)+p.ibuf.substr(p.pos+1);
					}
					cwin.back_cursor();
					this.reprint_from_ipos();
       	 			continue;
       	 		}
       	 	}
       	 	
       	 	if (s == this.scr_keys["ctrla"] ) { // move to end of prompt
       	 		while (p.pos < p.ibuf.length) {
       	 			cwin.echo_char(p.ibuf.substr(p.pos,1));
       	 			++p.pos;
       	 		}
       	 		while (p.pos < p.prompt.length) {
       	 			s=p.prompt.substr(p.pos,1);
       	 			p.ibuf=p.ibuf+s;
       	 			cwin.echo_char(s);
       	 			++p.pos;
       	 		}
       	 		p.prompt=""
       	 		continue;
       	 	}
       	 	
        	if (s == this.scr_keys["ctrlb"] ) { // move left to next non space after a space
        		while (p.pos != 0 && p.ibuf.substr(p.pos,1) != " ") {
        			cwin.back_cursor();
        			--p.pos;	
        		}
        		while (p.pos != 0 && p.ibuf.substr(p.pos,1) == " ") {
         			cwin.back_cursor();
        			--p.pos;     		
        		}
        		continue;
        	}
        	
        	if (s == this.scr_keys["ctrle"] ) { // insert on/off
        		if (p.insert) {
        			p.insert=false;
        			continue;
        		}
        		p.insert=true;
        		continue;
        	}
 
         	if (s == this.scr_keys["ctrlf"] ) { // move left to next non space after a space
        		while (p.pos != p.ibuf.length && (s=p.ibuf.substr(p.pos,1)) != " ") {
        			cwin.echo_char(s);
        			++p.pos;	
        		}
        		while (p.pos != p.ibuf.length && (s=p.ibuf.substr(p.pos,1)) == " ") {
         			cwin.echo_char(s);
        			++p.pos;     		
        		}
        		continue;
        	}
        	
 
         	if (s == this.scr_keys["ctrlh"] ) { // move left
        		while (p.pos != 0 ){
        			cwin.back_cursor();
        			--p.pos;
        		}
        		continue;
        	}     	
 
 
          	if (s == this.scr_keys["ctrlk"] ) { // kill line from current pos
          		if (p.ibuf.length !=0) {
					this.blank_from_ipos();
					p.ibuf=p.ibuf.substr(0,p.pos);
				}
				p.prompt="";
        		continue;
        	}    
 
           	if (s == this.scr_keys["ctrlu"] ) { // empty whole line
          		if (p.ibuf.length !=0) {
          			while (p.pos != 0) {
          				--p.pos;
          				cwin.back_cursor();
          			}
					this.blank_from_ipos();
					p.ibuf="";
				}
				p.prompt="";
        		continue;
        	} 
 
       	 	if (s == this.scr_keys["ctrlx"] ) {   // move right 1 character 	 	
       	 		if (p.pos < p.ibuf.length) {
       	 			if (p.insert) {
       	 				cwin.echo_char(p.ibuf.substr(p.pos,1));
       	 			}
       	 			else {
       	 				cwin.inc_col();
       	 			}
       	 			++p.pos;
       	 			continue;
       	 		}
       	 		if (p.pos < p.prompt.length) {
       	 			s=p.prompt.substr(p.pos,1);
       	 			p.ibuf=p.ibuf+s;
       	 			++p.pos;
       	 			cwin.echo_char(s);
       	 			continue;
       	 		}
       	 		/* why do this ?? */
       	 		p.ibuf=p.ibuf+" ";
       	 		++p.pos;
       	 		cwin.echo_char(" ");
       	 		continue;	
       	 	}

       	 	if (s == this.scr_keys["ctrly"] ) { // move left 1 character 
       	 		if (p.pos == 0) {
       	 			T_G.bell.play();
       	 			continue; // get next char
       	 		}
       	 		--p.pos;
       	 		cwin.back_cursor();
       	 		continue
       	 	}
       	 	     	
			if (p.pos == p.ibuf.length) {
				p.ibuf=p.ibuf+s;
			}
			else {
				if (p.insert) {
					p.ibuf=p.ibuf.substr(0,p.pos)+s+p.ibuf.substr(p.pos);
				}
				else {
					p.ibuf=p.ibuf.substr(0,p.pos)+s+p.ibuf.substr(p.pos+1);
				}
			}
    		cwin.echo_char(s);
    		++p.pos;
    		continue; // get next char

			case 2: //READ
			if (p.siop.siz_eq !=0 && p.ibuf.length == p.siop.siz_eq) {
 	        	this.send_read_res(p,5,0);
 	        	return false;
 			}
			if (this.rbuf.length == 0) return false;
			/*** get next char ***/  
       	 	s=this.rbuf.substr(0,1);
       	 	this.rbuf=this.rbuf.substr(1);
       	 	
       	 	if (this.chan_flag & this.low_to_up) {
       	 		s=s.toUpperCase();
       	 	}
       	 	if ((this.chan_flag & this.input_trans) == 0 && s =="\b") {
       	 		if (p.ibuf.length == 0) {
       	 			T_G.bell.play();
       	 			continue; // get next char
       	 		}
       	 		if (p.ibuf.length == 1) {
       	 			p.ibuf="";
       	 		}
       	 		else {
       	 			p.ibuf=p.ibuf.substr(0,p.ibuf.length-1);
       	 		}
       	 		if (this.chan_flag & this.echo) {
       	 			cwin.back_space();
       	 		}
       	 		continue; // get next char
       	 	}       	 	    	 	   	
        	if ( (px=this.terms.indexOf(s)) != -1) {
        		this.send_read_res(p,this.terms_ctl.charCodeAt(px),s.charCodeAt(0));
				if (this.chan_flag & this.echo) {
		    		cwin.col=0;
		    		cwin.inc_row();
				}
				return false;
        	}
        	if (p.ibuf.length != 0 && p.siop.len_eq == p.ibuf.length) {
        		T_G.bell.play();
        		continue; // get next char user must hit delim char
        	}
			p.ibuf=p.ibuf+s;
			if (this.chan_flag & this.echo) {
    			cwin.echo_char(s);
    		}
			continue; // get next char
			
			case 3: //INPUTE
			this.sm32_error=this.e_not_implemented;
			return true;

			case 4: //INPUTN
			this.sm32_error=this.e_not_implemented;
			return true;
			
			case 5: //READRECORD
			if ((p.siop.io_flag & this.gui_flag) != 0) {
				if (this.gui.data_ready==false) {
					return false;
				}
				po=new Pc2Packet("");
				po.type=po.pc2readguires;
				po.dlen1=0;
				po.sm32_error=this.sm32_error;
				po.data=this.gui.data;
				this.gui.data_ready=false;
				this.gui.data=null; // make room for next
				this.rp=null; // read finished
				p_serial(po);
				if (this.Timer != null) {
	    			clearTimeout(this.Timer);
	    			this.Timer=null;
				}
				return false; 				
			}
			if (this.rbuf.length == 0) return false;
			/*** get next char ***/  
       	 	s=this.rbuf.substr(0,1);
       	 	this.rbuf=this.rbuf.substr(1);
       	 	
       	 	if (this.chan_flag & this.low_to_up) {
       	 		s=s.toUpperCase();
       	 	}
       	 	if ((this.chan_flag & this.input_trans) == 0 && s =="\b") {
       	 		if (p.ibuf.length == 0) {
       	 			T_G.bell.play();
       	 			continue; // get next char
       	 		}
       	 		if (p.ibuf.length == 1) {
       	 			p.ibuf="";
       	 		}
       	 		else {
       	 			p.ibuf=p.ibuf.substr(0,p.ibuf.length-1);
       	 		}
       	 		if (this.chan_flag & this.echo) {
       	 			cwin.back_space();
       	 		}
       	 		continue; // get next char
       	 	}    
			p.ibuf=p.ibuf+s;
			if (this.chan_flag & this.echo) {
    			cwin.echo_char(s);
    		}
    		if (p.ibuf.length == p.siop.siz_eq) {
				po=new Pc2Packet("");
				po.type=po.pc2readrecordres;
				po.dlen1=p.ibuf.length;
				po.sm32_error=this.sm32_error;
				po.data=p.ibuf;
				this.rp=null; // read finished
				p_serial(po);
				if (this.Timer != null) {
	    			clearTimeout(this.Timer);
	    			this.Timer=null;
				}
				return false;    			
    		}
			continue; // get next char
			
			case 6: //inpute_ret_initpos ???
			this.sm32_error=this.e_not_implemented;
			return true;
			
			default: //can't be here
			this.sm32_error=this.e_not_implemented;
			return true;
        }
    } //loop until no chars in type ahead buffer 
}

function send_read_res(p,ctl,dlm)
{
	po=new Pc2Packet("");
	po.type=po.pc2readres;
	po.dlen1=p.ibuf.length;
	po.sm32_error=this.sm32_error;
	po.ctl=ctl;
	po.dlm=dlm;
	po.data=p.ibuf;
	this.rp=null; // read finished
	p_serial(po);
	if (this.Timer != null) {
	    clearTimeout(this.Timer);
	    this.Timer=null;
	}
}

function convertToHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += ''+str.charCodeAt(i).toString(16);
    }
    return hex;
}

function convertToHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += ''+str.charCodeAt(i).toString(16);
    }
    return hex;
}

function PC3KeyDown(x,cl,sk,ck,ak)
{
	var y=0;
	var c,c2;
	if ( x== 16 || x==17 || x==18) return; // shift and control and alt
	if (x == 123) {
		this.DoDebug();
	}
	if (T_G.bw.windows[T_G.bw.cw].html_mode) return;
	if (this.sm32_mode) {
		if (x == 27) {
			if (this.rp == null) {
				p = new Pc2Packet("");
 		   		p.type=p.pc2escape;
				p.notused=0;
				p.notused2=0;
 		   		p_serial(p);
 		   	}
 		   	else {
 		   		p=this.rp;
				po=new Pc2Packet("");
				if (p.type == p.pc2read) {
					po.type=po.pc2readres;
					po.ctl=0;
					po.dlm=0;
				}
				else {
					po.type=po.pc2readrecordres;
				}
				po.dlen1=0;
				po.sm32_error=0xffff; /* escape flag */
				po.data="";
				this.rp=null; // read finished
				p_serial(po);
				if (this.Timer != null) {
		    		clearTimeout(this.Timer);
		    		this.Timer=null;
				}
				T_G.bw.windows[T_G.bw.cw].caret_off();
 		   	}
 		   	return;
		}
	}
	if (cl) y=y+8;
	if (sk) y=y+4;
	if (ck) y=y+2;
	if (ak) y=y+1;
	c=String.fromCharCode(65+y);
	c2="000"+x.toString();
	c=c+c2.substr(-3,3);
	//console.log("key=["+c+"]");
	if (this.keys[c]==undefined) {
		//console.log("undefined");
		if (ak) {
			if (this.cmenu_on) {
				T_G.bw.m.mStartAccessMode()
			}
		}
		return;
	}
	c2=this.keys[c];
	if ((this.chan_flag & this.low_to_up) != 0) {
		c2=c2.toUpperCase();
	}
	this.add_rbuf(c2);
}
function load_rbuf(s)
{
	this.rbuf="";
	this.add_rbuf(s);
}

function add_rbuf(c2)
{
	if (c2 == "") return;
	if (!this.sm32_mode) {
		let p = new Pc2Packet("");
   		p.type=p.pc2schar;
		p.ikey=0;
		p.data=c2;
		//tohex(p.data);
    	p_serial(p);
	}
	else {
	    this.rbuf=this.rbuf+c2;
	    if (this.rp != null) this.Pc3Read();
	}
}

function send_ksa(o)
{
	//must not be in sm32 mode
	let k,s1;
	let s="";
	let p = new Pc2Packet("");
  	p.type=p.pc2schar;
	p.ikey=30000; // flag wss that a serialize object is coming
	p.data=" ";
    p_serial(p);
	for (k in o) {
		s=s+k+'\0'+o[k]+'\0';
	}
	s=s+'\0\0';
	s=btoa(s)+"*";
    while (s.length > 4000) {
        s1=s.substring(0,4000);
        s=s.substring(4000);
        T_G.sock.send(s1);
    }
    T_G.sock.send(s);
}

function DoDebug()
{
	/* write code to dump stuff to console when F12 is pressed */
	
	var cwin,xw,s;
	
	cwin=T_G.bw.windows[T_G.bw.cw];
	xw=T_G.bw.cw;
	console.log ("cw="+xw);
	while (cwin.pw != -1) {
		xw=cwin.pw;
		cwin=T_G.bw.windows[xw];
	}
	s="forward chain: "+xw;
	while (cwin.nw != -1) {
		xw=cwin.nw;
		s=s+"->"+xw;
		cwin=T_G.bw.windows[xw];
	}
	console.log(s);
	s="backward chain: "+xw;
	while (cwin.pw != -1) {
		xw=cwin.pw;
		s=s+"->"+xw;
		cwin=T_G.bw.windows[xw];
	}
}