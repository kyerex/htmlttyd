
function Dispatch(p)
{
	var s;
	var cwin;
	
	this.sm32_error=0;
	cwin=T_G.bw.windows[T_G.bw.cw];
	switch(p.type) {
		case p.pc2open:
		if (p.chan == 0) {
			this.chan_flag = this.echo | this.gen_29;
		}
		else {
			this.chan_flag = this.gen_29;
		}
		++T_G.pu.open_count;
		p=new Pc2Packet("");
		p.type=p.pc2openres;
		p.chan_flag=this.chan_flag;
		p.sm32_error=0;
		p_serial(p);
		break;
			
		case p.pc2write:
		this.Pc3Write(p);
		break;
				
		case p.pc2readrecord:
		case p.pc2read:
		if (this.sm32_mode) {
			this.chan_flag=p.siop.chan_flag;
		}
		p.ibuf=String(); // the data we read
		p.pos=0; // current pos in ibuf
		p.inp=this.inp; // for input(e/n)
		this.inp="";
		p.prompt=this.prompt;
		this.prompt="";
		p.insert=false;
		// set p.rtype
		p.rtype=99;
		if (p.type == p.pc2readrecord) {
			p.rtype=5;
			if (p.siop.io_flag & this.gui_flag == 0) {
				if (p.siop.len_eq != 0) {
					if (p.siop.siz_eq != 0) {
						this.sm32_error=this.e_syntax_error; //pc3readx will cause an error return;
					}
					p.siop.siz_eq=p.siop.len_eq;
				}
				if (p.siop.siz_eq == 0) {
					this.sm32_error=this.e_device_type_error; //pc3readx will cause an error return;
				}
			}	
		}
		else {
			if (p.inp=="") {
				if (this.scr_on && (this.chan_flag & this.echo)) {
					p.rtype=1;
					if (this.scr_disp_prm) {
						p.ibuf=p.prompt;
						p.prompt="";
						p.pos=p.ibuf.length;
						for (i=0; i < p.pos; ++i) {
							cwin.echo_char(p.ibuf.substr(i,1));
						}
						if (this.scr_use_pos && this.scr_pos < p.pos) {
							while (p.pos != this.scr_pos) {
								cwin.back_cursor(); // if error read will catch it
								--p.pos;
							}
						}			
					}
				}
				else {
					p.rtype=2;
				}
			}
			else {
				// need to call an init routine for now let fail on first char
				s=p.inp.charAt(0);
				if (s=="E") {
					p.rtype=3;
				}
				else {
					if (s=="N") {
						p.rtype=4;
					}
					else {
						if (s=="I") {
							p.rtype=6;
						}
					}
				}
			}
		}
		this.rp=p;
		if (p.siop.tim_eq != 4294967295) { // no tim= is -1
			if (p.siop.tim_eq == 0) {
			    this.load_rbuf("");
			    this.sm32_error=this.e_time_out_error;this.EndRead();
			    break;
			}
			else {
			    this.Timer = setTimeout(function()
				{ T_G.pu.sm32_error=T_G.pu.e_time_out_error;T_G.pu.EndRead(); }, 1000*p.siop.tim_eq);
			}
		}
		this.Pc3Read();
		break;
				
		case p.pc2close:
		--T_G.pu.open_count;
		p=new Pc2Packet("");
		p.type=p.pc2closeres;
		p.notused=0;
		p.notused2=0;
		p_serial(p);
		if (T_G.pu.open_count == 0) {
			T_G.sock.close();
			do_close_all_windows();
		}
		break;
			
		default:
		alert("Invalid Request");
		do_close_all_windows();
		T_G.sock.close();
	}		
};

function do_close_all_windows()
{
	let cwin=T_G.bw.windows[T_G.bw.cw];
	if (cwin.dialog_w != null) {
		cwin.dialog_w.close();
	}
	T_G.bw.m.croot_node.e.remove();
	cwin.e.remove();
	if (T_G.bw.status_e != null) {
		T_G.bw.status_e.remove();
	}
	while (T_G.bw_stack.length !=0) {
		T_G.bw=T_G.bw_stack.pop();
		let cwin=T_G.bw.windows[T_G.bw.cw];
		if (cwin.dialog_w != null) {
			cwin.dialog_w.close();
		}
		T_G.bw.topw.close();
	}
}

