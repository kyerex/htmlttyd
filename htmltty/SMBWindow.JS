/* remember cant place cursor on protected charact
		while ((win->wdata[i].mode_bits & high_intensity) == 0 ) {
			++i;
			++win->col;
			if (win->col == win->s_cols ) {
				if (win->wmode & wrap_off ) {
					set_cursor(ei);
					return;
				}
				win->col = 0;
				inc_row(ei);
				w_row=win->sul_row + win->row;
				w_col=win->sul_col + win->col;
				i=w_row * win->w_cols + w_col;
			}
			set_cursor(ei);
			if ( i == orig_i) {
				// the whole window is in SB
				break; 
			}
		}
*/

/********************** SMBWindow Object **************************************/


function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
	let cwin=T_G.bw.windows[T_G.bw.cw]
  	cwin.fwin.pos3 = e.clientX;
   	cwin.fwin.pos4 = e.clientY;
	cwin.fwin.ifw.document.onmouseup = closeDragElement;
   // call a function whenever the cursor moves:
	cwin.fwin.ifw.document.onmousemove = elementDrag;
}

  function elementDrag(e) {
    //let elmnt;

    e = e || window.event;
    e.preventDefault();
	e.stopPropagation();
    // calculate the new cursor position:
	let cwin=T_G.bw.windows[T_G.bw.cw]
	let fwin=cwin.fwin;
    fwin.pos1 = fwin.pos3 - e.clientX;
    fwin.pos2 = fwin.pos4 - e.clientY;
    fwin.pos3 = e.clientX;
    fwin.pos4 = e.clientY;
    // set the element's new position:
    //elmnt=T_G.bw.topw.document.getElementById(cwin.window_name+"_div");
    cwin.fwin.e.style.top = (cwin.fwin.e.offsetTop - fwin.pos2) + "px";
    cwin.fwin.e.style.left = (cwin.fwin.e.offsetLeft - fwin.pos1) + "px";
}

  function closeDragElement() {
	let cwin=T_G.bw.windows[T_G.bw.cw]
    /* stop moving when mouse button is released:*/
    cwin.fwin.ifw.document.onmouseup = null;
    cwin.fwin.ifw.document.onmousemove = null;
}


function Xt_cs(t)
{
	let col,row,idy,endrow,endcol,frow,lcol;
	
	switch (t) {
		case 0:
			col=this.col;
			lcol=this.s_cols;
			frow=this.row
			endrow=this.s_rows;
			if (this.origin_mode) endrow=this.om_bot_row+1;
			break;
		case 1:
			col=0;
			frow=0;
			if (this.origin_mode) frow=this.om_top_row;
			endrow=this.row+1;
			lcol=this.col+1;
			break;
		case 2:
			col=0;
			frow=0;
			if (this.origin_mode) frow=this.om_top_row;
			endrow=this.s_rows;
			if (this.origin_mode) endrow=this.om_bot_row+1;
			lcol=this.s_cols;
			break;
		default:
			return;
	}

	endcol=this.s_cols;
	for (row=frow;row != endrow;++row) {
		if (row == endrow-1) {
			endcol=lcol;
		}
		while(col != endcol) {
			idy=this.wdata[row][col].achar_idx;
			this.wdata[row][col]=this.BBX_def_char(" ",idy);
			++col;
		}
		col=0;
	}
	this.restore_window();
}

function clear_line(t)
{
	let col,row,lcol,idy;
	let pu=T_G.pu;
	switch (t) {
		case 0:
			col=this.col;
			lcol=this.s_cols;
			break;
		case 1:
			col=0;
			lcol=this.col+1;
			break;
		case 2:
			col=0;
			lcol=this.s_cols;
			break;
		default:
			return;
	}
	row=this.row;
	while(col != lcol) {
		if (this.protect_on && pu.sm32_mode) {
			if (this.wdata[row][col].high_intensity == false) {
				++col;
				continue;
			}
		}
		idy=this.wdata[row][col].achar_idx;
		this.wdata[row][col]=this.BBX_def_char(" ",idy);
		++col;
	}
	this.restore_window();
	if (pu.sm32_mode ) {
		this.high_intensity=true;
	}
}

function cfx()
{
	this.protect_on=true;
	this.col=0;
	this.row=0;
	
	this.ce();
	
	this.protect_on=false;
}

function cux()
{
	this.protect_on=true;
	
	this.ce();
	
	this.protect_on=false;

}

function ce()
{
	let col,row,idy;
	
	col=this.col;
	row=this.row;
	
	while (row != this.s_rows) {
		while(col != this.s_cols) {
			if (this.protect_on) {
				if (this.wdata[row][col].high_intensity == false) {
					++col;
					continue;
				}
			}
			idy=this.wdata[row][col].achar_idx;
			this.wdata[row][col]=this.BBX_def_char(" ",idy);
			++col;
		}
		col=0;
		++row;
	}
	this.restore_window();
	this.high_intensity=true;
}

function drop(wnum)
{
	/* caller already checked the wnum exists and wnum != cw  */
	let save_cw;
	let pu=T_G.pu;
	
	save_cw=T_G.bw.cw;
	T_G.bw.cw=wnum;
	T_G.bw.windows[wnum].pop();
	T_G.bw.cw=save_cw;
	
}

function swap()
{
	let pw,nw;
	let p_pw,p_nw;
	let cwin;
	
	let pu=T_G.pu;
	
	pw=this.pw;
	nw=this.nw;

	if (pw == -1) {
		pu.sm32_error=pu.e_invalid_mnemonic;
		return;
	}
	
	T_G.bw.cw=pw;
	cwin=T_G.bw.windows[pw];
	
	p_pw=cwin.pw;	
	p_nw=cwin.nw;
	cwin.pw=p_nw;
	cwin.nw=nw;
	this.pw=p_pw;
	this.nw=pw;
	if (this.pw != -1) {
		T_G.bw.windows[this.pw].nw=p_nw;
	}
	if (cwin.nw != -1) {
		T_G.bw.windows[cwin.nw].pw=pw;
	}
}

function pop()
{
	let pw,cw,nw;
	let cwin;
	
	let pu=T_G.pu;
	
	pw=this.pw;
	nw=this.nw;
	cw=T_G.bw.cw;
	if (cw == 0) {
		pu.sm32_error=pu.e_invalid_mnemonic;
		return;
	}
	if (pw == -1) {
		// this should only be some one did a swap to win 0 
		cwin=T_G.bw.windows[nw]; //if pw == -1 nw is !=-1
		cwin.pw=-1;
		T_G.bw.cw=nw;
	}
	else {
		cwin=T_G.bw.windows[pw];
		T_G.bw.cw=pw;
		cwin.nw=nw;
		if (nw != -1) {
			T_G.bw.windows[nw].pw=pw;
		}
	}
	if (this.twin != null) {
		this.twin.e.remove();
		delete this.twin;
	}	
    this.e.remove();
    T_G.bw.windows[cw]=null;
	delete this;
}

function box(col,row,cols,rows,title,attribstr)
{
	let p,i;
	let pu=T_G.pu;

	if (col+cols > this.s_cols || row+rows > this.s_rows) {
		pu.sm32_error=pu.e_invalid_mnemonic;
		return;
	}
	if (cols < 3 || rows < 3 || title.length + 2 > cols) {
		pu.sm32_error=pu.e_invalid_mnemonic;
		return;
	}
	let sav_col=this.col; 
	let sav_row=this.row;
	let sav_wrap=this.wrap_off;
	let sav_protect_on=this.protect_on;
	let sav_scroll=this.scroll_off
	let sav_high_intensity=this.high_intensity;
	let sav_reverse_video=this.reverse_video;
	let sav_bbx_underline=this.bbx_underline;
	let sav_blink=this.blink;
	let sav_graphics=this.graphics;	
	let sav_bc_rgb=this.bc_rgb;
	let sav_fc_rgb=this.fc_rgb;	
	
	if (attribstr != "") {
		pu.RecursiveWritex(attribstr);
	}
	this.wrap_off=true;
	this.scroll_off=true;
	this.row = row; this.col=col;
	this.echo_char(pu.g_chars[pu.g_ul]);
	for (i=col+1;i!=col+cols-1;++i) {
		this.echo_char(pu.g_chars[pu.g_hor]);
	}
	this.echo_char(pu.g_chars[pu.g_ur]);
	for (i=row+1;i != row+rows-1;++i) {
		this.row=i;this.col=col;
		this.echo_char(pu.g_chars[pu.g_vert]);
		this.row=i;this.col=col+cols-1;
		this.echo_char(pu.g_chars[pu.g_vert]);
	}
	this.row = row+rows-1; this.col=col;
	this.echo_char(pu.g_chars[pu.g_ll]);
	for (i=col+1;i!=col+cols-1;++i) {
		this.echo_char(pu.g_chars[pu.g_hor]);
	}
	this.echo_char(pu.g_chars[pu.g_lr]);

	if (title != "") {
		this.row = row; this.col=col+2;
		for (i=0; i!=title.length; ++i) {
			this.echo_char(title.substr(i,1));
		}
	}
		
	this.col=sav_col; 
	this.row=sav_row;
	this.wrap_off=sav_wrap;
	this.protect_on=sav_protect_on;
	this.scroll_off=sav_scroll;	
	this.high_intensity=sav_high_intensity;
	this.reverse_video=sav_reverse_video;
	this.bbx_underline=sav_bbx_underline;
	this.blink=sav_blink;
	this.graphics=sav_graphics;	
	this.bc_rgb=sav_bc_rgb;
	this.fc_rgb=sav_fc_rgb;	
}

function move(col,row)
{
	let cols,rows;
	let rec;
	let pu=T_G.pu;
	let t=0;
	if (pu.cmenu_on) {
		t=t+pu.menu_h;
	}

	if (this.fwin != undefined){
		let e;
		if (this.fwin.e != undefined) {
			t=0;
			e=this.fwin.e;
		}
		else {
			e=this.e;
		}
		e.style.top=""+(row+t)+"PX";
		e.style.left=""+col+"PX";
		return;
	}
		
	if (this.twin != null) {
		cols=this.s_cols+2;rows=this.s_rows+2;
		rec=this.get_rect(col,row,cols,rows);
		if (pu.sm32_error) return;
		this.twin.e.style.top=""+(rec.top+t)+"PX";
		this.twin.e.style.left=""+rec.left+"PX";
		this.twin.e.style.width=""+(rec.width+1)+"PX";
		this.twin.e.style.height=""+rec.height+"PX";
		this.twin.wul_ncl=col;	/* win_0 relative col */
		this.twin.wul_nrw=row;	/* win_0 relative left row # */ 
		++col;++row;
	}
	cols=this.s_cols;rows=this.s_rows;
	rec=this.get_rect(col,row,cols,rows);
	if (pu.sm32_error) return;
	this.e.style.top=""+(rec.top+t)+"PX";
	this.e.style.left=""+rec.left+"PX";
	this.e.style.width=""+(rec.width+1)+"PX";
	this.e.style.height=""+rec.height+"PX";
	this.wul_ncl=col;	/* win_0 relative col */
	this.wul_nrw=row;	/* win_0 relative left row # */ 
}

function get_rect(col,row,cols,rows)
{
	let idx,tl_ele,br_ele,x,y,w,h,rec1,rec2;
	let pu=T_G.pu;
	let win0=T_G.bw.windows[0]; // don't use this window use window 0
	
	if (col < 0 || col+cols > win0.s_cols || row < 0 || row+rows > win0.s_rows) {
		pu.sm32_error = pu.e_invalid_mnemonic;
		return;	
	}
	idx=win0.wdata[row][col].achar_idx;
	tl_ele=win0.w.document.getElementById(idx);
	idx=win0.wdata[row+rows-1][col+cols-1].achar_idx;
	br_ele=win0.w.document.getElementById(idx);
	rec1=tl_ele.getBoundingClientRect();
	rec2=br_ele.getBoundingClientRect();
	x=rec1.left;
	y=rec1.top;
	w=(rec2.left+rec2.width)-x;
	h=(rec2.top+rec2.height)-y;
	rec1.left=x;
	rec1.top=y;
	rec1.width=w;
	rec1.height=h;
	
	return rec1;
}


function BBX_char(c,idx)
{
	let r,g,b;
	let t_rgb;
	o=new Object();
	if (c == " ")c="\u00A0"
	o.high_intensity=this.high_intensity;
	o.reverse_video=this.reverse_video;
	o.bbx_underline=this.bbx_underline;
	o.blink=this.blink;
	o.graphics=this.graphics;
	/* the actual char */
	o.achar=c;
	o.bc_rgb=this.bc_rgb;
	o.fc_rgb=this.fc_rgb;
	if (o.blink) {
		o.fc_rgb=this.bb_Color;
	}
	else {
		if (o.bbx_underline) {
			if (this.bu_use_Color) {
				o.fc_rgb=this.bu_Color;
				o.bbx_underline=false;
			}
		}
		else {
			if (o.reverse_video) {
				if (this.br_use_Color) {
					o.fc_rgb=this.br_Color;
					o.reverse_video=false;
				}
			}
			else {
				if (o.high_intensity == false) {
					if (this.sb_use_Color) {
						o.fc_rgb=this.sb_Color;
					}
				}
			}
		}
	}
	if (o.reverse_video) {
		t_rgb=o.fc_rgb;
		o.fc_rgb=o.bc_rgb;
		o.bc_rgb=t_rgb;
	}
	o.achar_idx=idx;
	return o;
}

function BBX_def_char(c,idx)
{
	o=new Object();
	if (c == " ")c="\u00A0"
	o.high_intensity=this.def_high_intensity;
	o.reverse_video=this.def_reverse_video;
	o.bbx_underline=this.def_underline;
	o.blink=this.def_blink;
	o.graphics=this.def_graphics;
	/* the actual char */
	o.achar=c;
	o.bc_rgb=this.def_bc_rgb;
	o.fc_rgb=this.def_fc_rgb;
	o.achar_idx=idx;
	return o;
}

/*** window manipulation routines ***/

function back_space() // destructive backspace
{
	let bbxc,w_col,w_row,e,idx;
	this.back_cursor();
	
	
	// place char in window scroll area
	w_row=this.row;
	w_col=this.col;
	// update wdata
	idx=this.wdata[w_row][w_col].achar_idx;
	this.wdata[w_row][w_col]=bbxc=this.BBX_char("\u00A0",idx);
	// place char on screen
	e=this.w.document.getElementById(idx);
	e.outerHTML='<span ID='+idx + ' STYLE="color:#'+
					bbxc.fc_rgb+'; background-color:#'+bbxc.bc_rgb+';">'+
					bbxc.achar+'</span>';
}

function back_cursor()
{
	this.caret_off();
	if (this.col != 0) {
		--this.col;
	}
	else {
		if ( this.wrap_off == false && this.row !=0 ) {
			this.col = this.s_cols-1;
			--this.row;
		}
	}
}

function inc_col()
{
	let pu=T_G.pu;
	this.caret_off();
	++this.col;

	if ( this.col == this.s_cols ) {
		if ( this.wrap_off ) {
			if (pu.sm32_mode){
				this.col=0; // over write line
			}
			else {
				--this.col; // over write last col
			}
		}
		else {
			this.col = 0;
			this.inc_row();
		}
	}
}

function dec_row()
{
	let col,row;
	this.caret_off();
	if (this.origin_mode) {
		if (this.row > this.om_bot_row) {
			--this.row;
			return;
		}
		// must be ==
		if (this.scroll_off){
			this.row=this.om_bot_row;
			return;
		}
		col=0;
		row=this.om_bot_row;
		while(col != this.s_cols) {
			idy=this.wdata[row][col].achar_idx;
			this.wdata[row][col]=this.BBX_def_char(" ",idy);
			++col;
		}
		this.li(this.om_top_row);
		this.restore_window();
	}
	else {
		if (this.row != 0 ) {
			--this.row;
			return;
		}
		if (this.scroll_off) {
			this.row=this.s_rows-1;
			return;
		}
		this.li(0);
	}
}

function inc_row()
{
	this.caret_off();
	++this.row;
	if (this.origin_mode) {
		if (this.row <= this.om_bot_row) return;
		if (this.scroll_off){
			this.row=this.om_top_row;
			return;
		}
		--this.row;
		this.scrolled = true; /* used by scr read */
		//console.log("top_row="+this.om_top_row+" bot_row="+this.om_bot_row+" row="+this.row);
		this.ld(this.om_top_row);
		this.li(this.om_bot_row);
	}
	else {
		if (this.row < this.s_rows) return;
		if (this.scroll_off) {
			this.row=0;
			return;
		}
		--this.row;
		this.scrolled = true; /* used by scr read */
		this.ld(0);
	}
}

function ld(dr)
{
	let idx,idy,bbxc,i,r,j,s,s1,e;
	
	bbxc=this.wdata[dr][0]; // to get id of div at line being removed
	idy=bbxc.achar_idx;
		
	/* update wdata */
	r=this.wdata[dr];
	for (i=dr+1; i!=this.s_rows; ++i) {
		this.wdata[i-1]=this.wdata[i];
	}
	for (j=0;j!=this.s_cols;++j) {
		idx=r[j].achar_idx;
		r[j]=this.BBX_def_char(" ",idx); /* space and default fg bg colors */
	}	
	this.wdata[i-1]=r;
	s1=this.get_wdata_line(i-1); //get cleared last line
	
	idx=idy.substr(0,idy.indexOf("-"));
	e=this.w.document.getElementById(idx);
	e.innerHTML=s1; // replace line 0 with cleared line
	p=e.parentNode;
	s=p.removeChild(e); /* remove div at line 0 */
	p.appendChild(s);	/* append div to bottom making it last line */

}

function li(dr)
{
	let idx,idy,bbxc,i,r,j,s,s1,e,e2;
	
	bbxc=this.wdata[this.s_rows-1][0]; // to get id of div at line being removed
	idy=bbxc.achar_idx;
	
	if (this.row == this.s_rows-1) {
		this.ld(dr); // just clear line
		return;
	}
	
	/* update wdata */
	r=this.wdata[this.s_rows-1];	// get last row
	for (i=this.s_rows-1; i!=dr; --i) {
		this.wdata[i]=this.wdata[i-1];
	}
	for (j=0;j!=this.s_cols;++j) {
		idx=r[j].achar_idx;
		r[j]=this.BBX_def_char(" ",idx); /* space and default fg bg colors */
	}	
	this.wdata[dr]=r;

	s1=this.get_wdata_line(dr); //get cleared last line
	
	idx=idy.substr(0,idy.indexOf("-"));
	e=this.w.document.getElementById(idx);
	e.innerHTML=s1; // replace line dr with cleared line
	
	bbxc=this.wdata[dr+1][0]; // to get id of div after inserted line
	idy=bbxc.achar_idx;
	idx=idy.substr(0,idy.indexOf("-"));
	e2=this.w.document.getElementById(idx);
	
	p=e.parentNode;
	s=p.removeChild(e); // remove div at line 0
	
	p.insertBefore(s, e2);

}

function echo_char(achar)
{
	let bbxc,w_col,w_row,e,idx,s;

	
	if (this.html_mode) return;
	// place char in window scroll area
	w_row=this.row;
	w_col=this.col;
	// update wdata
	if (this.wdata[w_row][w_col] == undefined) {
		alert("bad col,row ="+this.col+","+this.row);
	}
	idx=this.wdata[w_row][w_col].achar_idx;
	bbxc=this.BBX_char(achar,idx);
	this.wdata[w_row][w_col]=bbxc;
	// place char on screen
	e=this.w.document.getElementById(idx);				
	s='<span ID='+idx + ' STYLE="';
    if (bbxc.bbx_underline) {
        s=s+'text-decoration: underline;';
    }
    if (bbxc.high_intensity) {
    	s=s+'font-weight: bolder;';
    }
	else {
    	s=s+'font-weight: lighter;';
	}
    s=s+' color:#'+
        bbxc.fc_rgb+'; background-color:#'+bbxc.bc_rgb+';">';
    s=s+bbxc.achar;
    s=s+'</span>'
	e.outerHTML=s;				
	this.inc_col();
}

function caret_off()
{
	if (this.caret_row != -1) {
		idx=this.wdata[this.caret_row][this.caret_col].achar_idx;
		e=this.w.document.getElementById(idx);
		e.style.backgroundColor=this.caret_savebg;
		e.contentEditable = false;
		this.caret_row=-1;
	}
}

function caret_on()
{
	let w_col,w_row,e,idx,bbxc,pu;
	
	pu=T_G.pu;
	if (this.html_mode)return;
	w_row=this.row;
	w_col=this.col;
	bbxc=this.wdata[w_row][w_col];
	idx=bbxc.achar_idx;
	this.caret_savebg="#"+bbxc.bc_rgb;
	e=this.w.document.getElementById(idx);
	if(pu.CaretBG != "") e.style.backgroundColor=pu.CaretBG;
	e.contentEditable = true;
	this.caret_row=w_row;
	this.caret_col=w_col;
	e.focus();
}

function body_click()
{
	let e;
	if ((this.dialog_w != null) && !this.dialog_w.closed) {
		this.dialog_w.top.blur();
		this.dialog_w.focus();
	}
	if (this.html_mode)return;
	if (this.caret_row != -1) {
		idx=this.wdata[this.caret_row][this.caret_col].achar_idx;
		e=this.w.document.getElementById(idx);
		e.focus();
	}
}

function WinResize()
{
	let t,l,h,w,i,m1,m2;
	
	let pu=T_G.pu;

	if (this.fwin != undefined) {
		return;
	}

	if (this.full_frame) {
		h=T_G.bw.topBody.scrollHeight;
		w=T_G.bw.topBody.scrollWidth;
		t=0;l=0;
		if (pu.cmenu_on) {
			t=t+pu.menu_h;
			h=h-pu.menu_h;
		}
		if (T_G.bw.status_w != null) {
			h=h-pu.status_h;
		}
		this.e.style.top=""+t+"PX"; //change window 0 position
			
		if (this.window_name == "_win0" ) {
			/* maximum print area from l with width of w and from t with height of h */
			/* so calculate maximun font size in PX */
		
			m1=6;
			for(i=6;i != 31;++i) {
				if (pu.fs_width[i] * this.s_cols + 1 > w ) {
					break;
				}
				m1=i;
			}
			m2=6;
			for(i=6;i != 31;++i) {
				if (pu.fs_height[i] * this.s_rows > h ) {
					break;
				}
				m2=i;
			}
			if (m1 > m2) m1=m2;
			pu.fs=m1;
		}
		if (this.my_fs != pu.fs) {
			this.restore_window();
		}
		return;
	}
	if (this.twin != null) {
		this.move(this.twin.wul_ncl,this.twin.wul_nrw);
	}
	else {
		this.move(this.wul_ncl,this.wul_nrw);
	}
	if (this.my_fs != pu.fs) {
		/* win 0 changed the font size */
		if (this.twin != null) {
			this.twin.restore_window();
		}
		this.restore_window();
	}
}

function restore_window ()
{
		let i,s;
		
		let pu=T_G.pu;
		let w=this.w;		
		
		if (this.html_mode ) {

			return;
		}  
		 
		this.wdata_to_tv();
		let tv=this.tv;             
		w.document.open();

		w.document.write("<html>");
		w.document.write("<head>");
		w.document.write("<style>");
		w.document.write("[contenteditable] {");
		w.document.write("  outline: 0px solid transparent;");
		w.document.write("}");
		w.document.write("</style>");
		w.document.write("</head>");

		if (this.fwin == undefined){
	 		this.my_fs=pu.fs;
		}
	 	s='<body onresize="top.T_G.pu.Resize();" BGCOLOR="#'+this.def_bc_rgb+'" ';
		 s=s+'STYLE="font-family: monospace; font-size: '+this.my_fs+
		 'px; overflow: hidden; cursor: default; margin: 0px;" >';

	 	w.document.write(s);
		w.document.write('<center>');
		for (i=0;i!=this.s_rows;++i) {
			w.document.write(tv[i]);	
		}
		w.document.write("</center>");
		w.document.write("</body>");
		w.document.write("</html>");		
		w.document.close();
		
		
		w.document.body.addEventListener("keydown", function(event) {
        		T_G.pu.PC3KeyDown(event.keyCode,event.getModifierState("CapsLock"),
        							   event.getModifierState("Shift"),
        							   event.getModifierState("Control"),
        							   event.getModifierState("Alt"));
        		event.preventDefault();
    	});	
		
		w.document.body.addEventListener("keypress", function(event) {
        		event.preventDefault();
        });
		w.document.body.addEventListener("keyup", function(event) {
        		event.preventDefault();
    	});	
    	w.document.body.addEventListener("click", function(event) {
				let cwin=T_G.bw.windows[T_G.bw.cw];
				T_G.bw.m.mKillMenu();
    			cwin.body_click();
        		event.preventDefault();
    	});	
    	w.document.body.addEventListener("mouseover", function(event) {
    			let cwin=T_G.bw.windows[T_G.bw.cw];
    			if (cwin.dialog_w != null) {
					cwin.body_click();
				}
				if (cwin.fwin != undefined) {
    				T_G.bw.topw.document.onmouseup = null;
    				T_G.bw.topw.document.onmousemove = null;
				}
    			T_G.bw.m.mKillMenuMaybe();
    	});	   	
}

function cs()
{
	let idx,idy,i,j,s;
	
	this.high_intensity=this.def_high_intensity;
	this.reverse_video=this.def_reverse_video;
	this.bbx_underline=this.def_bbx_underline;
	this.blink=this.def_blink;
	this.graphics=this.def_graphics;
	
	this.wdata = new Array(); 
	for (i=0;i != this.s_rows;++i) {
		idx="idx"+i.toFixed()+"-";
		this.wdata[i]=new Array();
		for (j=0;j != this.s_cols;++j) {
			idy=idx+j.toFixed();
			this.wdata[i][j]=this.BBX_def_char(" ",idy);
		}
	}
	this.restore_window();          
    this.col=0;
    this.row=0;

}

/*** convert the wdata[rows][cols] array to 
     tv[rows] of <div> s with cols <span> s ***/

function wdata_to_tv()
{
	let i,bbxc,idx;
	
	this.tv=new Array(this.s_rows);
	for (i=0 ; i != this.s_rows ; ++i) {
		bbxc=this.wdata[i][0];
		idx=bbxc.achar_idx;
		idx=idx.substr(0,idx.indexOf("-"));
		this.tv[i]='<div id='+idx+'>'+this.get_wdata_line(i)+"</div>";
	}
}

/*** return string with the cols of <spans> for row i ***/

function get_wdata_line(i)
{
    let bbxc,idx,j;
    let s;

    s="";
    for (j=0 ; j != this.s_cols; ++j) {
        bbxc=this.wdata[i][j];
        idx=bbxc.achar_idx;
        s=s+'<span ID='+idx + ' STYLE="';
        if (bbxc.bbx_underline) {
        	s=s+'text-decoration: underline;';
        }
 	    if (bbxc.high_intensity) {
    		s=s+'font-weight: bolder;';
    	}
		else {
    		s=s+'font-weight: lighter;';
		}
        s=s+' color:#'+
        bbxc.fc_rgb+'; background-color:#'+bbxc.bc_rgb+';">'+
        bbxc.achar+'</span>';
    }
    return s;
}


function SMB_window(top,left,cols,rows,name_str,width_str,height_str,float)
{
	let i,j;
	let idx,idy;
	let m1,m2;

	let top_str,left_str,sx;

	if (this.sb_Color == undefined ) return; // let prototypes define
	
	let pu=T_G.pu;
	// i was trying to pass in src but quit
	let src="About:blank";
	
	let t=0;
	if (pu.cmenu_on) {
		t=t+pu.menu_h;
	}	
	if (cols < 4 || rows < 4 || name_str == "") {
		pu.sm32_error = pu.e_invalid_mnemonic;
		delete this;
		return;
	}
	/* BBX_char stuff */
	if ("_win0" == name_str) {
		this.bb_color=pu.def_bb_color;
		this.reverse_video=false;
		this.bbx_underline=false;
		this.blink=false;
		this.graphics=false;
		this.bc_rgb=pu.bgcolor;
		this.fc_rgb=pu.fgcolor;
		if (pu.sm32_mode) {
			this.def_high_intensity=true;
		}
		else {
			this.def_high_intensity=false;
		}
		this.def_reverse_video=false;
		this.def_bbx_underline=false;
		this.def_blink=false;
		this.def_graphics=false;
		this.def_bc_rgb=pu.bgcolor;
		this.def_fc_rgb=pu.fgcolor;
	}
	else {
		let cwin=T_G.bw.windows[T_G.bw.cw];
		this.high_intensity=cwin.high_intensity; 
		this.reverse_video=cwin.reverse_video;
		this.bbx_underline=cwin.bbx_underline;
		this.blink=cwin.blink;
		this.graphics=cwin.graphics;
		
		this.sb_use_Color=cwin.sb_use_Color; /* use 'SB'color and not font-weight: bold; */
		this.sb_Color=cwin.sb_Color; // 'SB' color 
		this.br_use_Color=cwin.br_use_Color; // use 'BR' color or revsre the normal ??
		this.br_Color=cwin.br_Color; // 'BR' color
		this.bu_Color=cwin.bu_Color; // 'BU' color always use a color
		this.bb_Color=cwin.bb_Color; // 'BB' color always use a color		
		
		this.bc_rgb=cwin.bc_rgb;
		this.fc_rgb=cwin.fc_rgb;
		this.def_high_intensity=cwin.def_high_intensity;
		this.def_reverse_video=cwin.def_reverse_video;
		this.def_bbx_underline=cwin.def_bbx_underline;
		this.def_blink=cwin.def_blink;
		this.def_graphics=cwin.def_graphics;
		this.def_bc_rgb=cwin.def_bc_rgb;
		this.def_fc_rgb=cwin.def_fc_rgb;	
	}
	if (float){
		// on a Floating window width_str=title and height_str is style stuff
    	T_G.bw.topw.document.onmouseup = null;
    	T_G.bw.topw.document.onmousemove = null;
		this.fwin=new Object();
		this.fwin.pos1=0;
		this.fwin.pos2=0;
		this.fwin.pos3=0;
		this.fwin.pos4=0;
		this.s_cols=(this.s_cols/2).toFixed(0);
		this.s_rows=(this.s_rows/2).toFixed(0);
		if (width_str == "") {
			height_str=rows+'px';
			width_str=cols+'px';
			top_str=(top+t)+'px';
			left_str=left+'px';

			sx ='<iframe frameborder="0" id='+name_str+' style="width: '+width_str+
			'; height: '+height_str+'; top: '+top_str+'; left: '+left_str+
		     '; display: block; position: fixed; " SRC="'+src+'"></iframe>'
		    T_G.bw.topw.document.write(sx);
		    this.e = T_G.bw.topw.document.getElementById(name_str); // iframe element
			this.w = this.e.contentWindow;
		}
		else {
			top_str=t+'px';
			sx ='<iframe frameborder="0" id="'+name_str+'_if" style="width: 100%;'+
				'  height: 100%; top: '+top_str+'; left: 0px'+
			     '; display: block; position: fixed; " SRC="About:blank"></iframe>'
		    T_G.bw.topw.document.write(sx);
		    this.e = T_G.bw.topw.document.getElementById(name_str+'_if'); // iframe element
			this.fwin.ifw = this.e.contentWindow;	// window
			top_str=top+'px';
			left_str=left+'px';
			sx='<div id="'+name_str+'_div" style="position: fixed; border: 1px solid #000000; top: '+top_str+
			';left: '+left_str+'">';
			sx=sx+'<div id="'+name_str+'_divh" style="padding: 6px; margin: auto; '+height_str+ '" >';
			sx=sx+'<span style="width: 80%;cursor:default;">'+width_str+'</span>';
			sx=sx+'<span style="float: right;cursor:default;" onclick="top.T_G.pu.Click(this);" ID="CLOSE_CLICKED">X</span>';
			sx=sx+'</div>';
			height_str=rows+'px';
			width_str=cols+'px';
			sx =sx+'<iframe frameborder="0" id='+name_str+' style="width: '+width_str+
				'; height: '+height_str+
			     '; " SRC="'+src+'"></iframe>'
		    this.fwin.ifw.document.write(sx);
		    this.fwin.e = this.fwin.ifw.document.getElementById(name_str+"_div"); // div element
		    this.fwin.divh = this.fwin.ifw.document.getElementById(name_str+"_divh"); // divh element
		    this.fwin.if = this.fwin.ifw.document.getElementById(name_str); // iframe element
			this.w = this.fwin.if.contentWindow;	// window
			this.fwin.divh.onmousedown = dragMouseDown;
			this.window_name=name_str;
			this.fwin.ifw.document.body.addEventListener("click", function(event) {
				let cwin=T_G.bw.windows[T_G.bw.cw];
				T_G.bw.m.mKillMenu();
				cwin.body_click();
				event.preventDefault();
			});	
			this.fwin.ifw.document.body.addEventListener("mouseover", function(event) {
				let cwin=T_G.bw.windows[T_G.bw.cw];
				if (cwin.dialog_w != null) {
					cwin.body_click();
				}
				if (cwin.fwin != undefined) {
					T_G.bw.topw.document.onmouseup = null;
					T_G.bw.topw.document.onmousemove = null;
				}
				T_G.bw.m.mKillMenuMaybe();
			});	 
		}
		let w=cols;
		let h=rows;
		m1=6;
		for(i=6;i != 31;++i) {
			if (pu.fs_width[i] * this.s_cols+1 > w ) {
				break;
			}
			m1=i;
		}
		m2=6;
		for(i=6;i != 31;++i) {
			if (pu.fs_height[i] * this.s_rows > h ) {
				break;
			}
			m2=i;
		}
		if (m1 > m2) m1=m2;
		this.my_fs=m1;
	}
	else {
		if (width_str != "") {
			// this is _win0 or a full_frame window
			this.full_frame=true;
			this.wul_ncl=0;	/* win_0 relative col */
			this.wul_nrw=0;	/* win_0 relative left row # */ 
			top_str = "" + top+"PX";
			left_str = "" + left+"PX";
		}
		else {
			// and this is col,row relative
			this.full_frame=false;
			this.wul_ncl=left;	/* win_0 relative col */
			this.wul_nrw=top;	/* win_0 relative left row # */ 
			let rec = this.get_rect(left,top,cols,rows);
			if (pu.sm32_error) {
				delete this;
				return;	
			}
			top_str=""+(rec.top+t)+"PX";
			left_str=""+rec.left+"PX";
			width_str=""+(rec.width+1)+"PX"; // add 1 for cursor
			height_str=""+rec.height+"PX";	
		}
		sx ='<iframe frameborder="0" id='+name_str+' style="width: '+width_str+
			'; height: '+height_str+'; top: '+top_str+'; left: '+left_str+
		     '; display: block; position: fixed; " SRC="'+src+'"></iframe>'
	    T_G.bw.topw.document.write(sx);
	    this.e = T_G.bw.topw.document.getElementById(name_str); // iframe element
		this.w = this.e.contentWindow;	// window
		/* data is contained in wdata[s_rows][s_cols]   */    
		this.s_cols=cols;	/* # of cols  */      
		this.s_rows=rows;	/* # of rows  */  
	}
	this.window_name=name_str;
	this.caret_row=-1;	/* caret position */
	this.caret_col=-1;
	this.twin=null;		/* title window */
	this.scroll_win=false;	/* this window created with 'scroll' ? */
	this.tabs=new Array();
	for (i=0; i!= cols; ++i) {
		this.tabs[i]=false;
	}
	if (cols > 8) {
		for (i=8;i<cols;i=i+8){
			this.tabs[i]=true;
		}
	}
}

new SMB_window(0,0,0,0,"","","","","");

SMB_window.prototype.html_doc_loaded=false;
SMB_window.prototype.html_mode=false;
SMB_window.prototype.pw=-1;   /* parent window # */
SMB_window.prototype.nw=-1;   /* next (child) window # */
SMB_window.prototype.sb_use_Color=false; /* use 'SB'color and not font-weight: bold; */
SMB_window.prototype.sb_Color="FFFFFF"; // 'SB' color 
SMB_window.prototype.br_use_Color=false; // use 'BR' color or reverse the normal ??
SMB_window.prototype.br_Color="FFFFFF"; // 'BR' color
SMB_window.prototype.bu_use_Color=true; // use 'BU' color or underline ??
SMB_window.prototype.bu_Color="969600"; // 'BU'
SMB_window.prototype.bb_Color="FF0000"; // 'BB' color always use a color
SMB_window.prototype.s_cols=80;	/* scroll area # of cols  */      
SMB_window.prototype.s_rows=24;	/* scroll area # of rows  */      
/* col,row are relative to 0,0 of the scroll area   */    
SMB_window.prototype.col=0;		/* current col  */           
SMB_window.prototype.row=0;		/* current row  */
SMB_window.prototype.scrolled=false;	/* this is ugly flag passed back to scr read with insert */
SMB_window.prototype.dialog_w=null;

/* Vt100 origin mode stuff (scroll area) */
SMB_window.prototype.origin_mode=false;
SMB_window.prototype.om_top_row=0;
SMB_window.prototype.om_bot_row=24;
/* wmode bits */ 
SMB_window.prototype.bcolor_flag=false;
SMB_window.prototype.scroll_off=false;
SMB_window.prototype.wrap_off=false;
SMB_window.prototype.protect_on=false; 
// methods
SMB_window.prototype.BBX_char=BBX_char; 
SMB_window.prototype.BBX_def_char=BBX_def_char;  
SMB_window.prototype.wdata_to_tv=wdata_to_tv;  
SMB_window.prototype.inc_row=inc_row; 
SMB_window.prototype.inc_col=inc_col;  
SMB_window.prototype.caret_on=caret_on; 
SMB_window.prototype.caret_off=caret_off;
SMB_window.prototype.echo_char=echo_char;      
SMB_window.prototype.get_wdata_line=get_wdata_line;
SMB_window.prototype.cs=cs;
SMB_window.prototype.body_click=body_click;
SMB_window.prototype.back_space=back_space;
SMB_window.prototype.back_cursor=back_cursor;
SMB_window.prototype.restore_window=restore_window;
SMB_window.prototype.get_rect=get_rect;
SMB_window.prototype.box=box;
SMB_window.prototype.pop=pop;
SMB_window.prototype.drop=drop;
SMB_window.prototype.ce=ce;
SMB_window.prototype.cfx=cfx;
SMB_window.prototype.cux=cux;
SMB_window.prototype.clear_line=clear_line;
SMB_window.prototype.swap=swap;
SMB_window.prototype.ld=ld;
SMB_window.prototype.li=li;
SMB_window.prototype.move=move;
SMB_window.prototype.WinResize=WinResize;
SMB_window.prototype.Xt_cs=Xt_cs;
SMB_window.prototype.dec_row=dec_row; 