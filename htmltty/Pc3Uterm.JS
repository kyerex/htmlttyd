

new Pc3Uterm();

/* user parameters should be able to set from login response packet 		*/
/* and some how save from the close of chan 0 								*/

Pc3Uterm.prototype.def_win0_cols=80; 					/* initial window cols 	*/
Pc3Uterm.prototype.def_win0_rows=24; 					/* initial window rows 	*/
Pc3Uterm.prototype.win0_cols=80; 					/* initial window cols 	*/
Pc3Uterm.prototype.win0_rows=24; 					/* initial window rows 	*/
Pc3Uterm.prototype.menu_h=35; 				/* height of menu bar in pixels*/
Pc3Uterm.prototype.status_h=20; 					/* height of status bar in pixels*/
Pc3Uterm.prototype.status_menu_backgr_c="#DEDEDE"; 	/* background color of status and menu bars */
Pc3Uterm.prototype.menu_selected_backgr_c="#91C9F7"
Pc3Uterm.prototype.status_menu_fs=12; 				/* font size status and menu bars */
Pc3Uterm.prototype.smallest_fs=6;
Pc3Uterm.prototype.largest_fs=24;
Pc3Uterm.prototype.fgcolor="FFFFFF";				/* initial forground color */
Pc3Uterm.prototype.bgcolor="000000";				/* initial background color */
Pc3Uterm.prototype.CaretBG="#00FF70";				/* change color or "" for just EditableCaret */
Pc3Uterm.prototype.def_bb_color="FF0000";					/* color for 'BB'



/* chan flag */
Pc3Uterm.prototype.echo=1;
Pc3Uterm.prototype.gen_29=2;
Pc3Uterm.prototype.input_trans=4;
Pc3Uterm.prototype.output_trans=8;
Pc3Uterm.prototype.low_to_up=16;
Pc3Uterm.prototype.sav_echo=32;
Pc3Uterm.prototype.sav_input_trans=64;
/* don't add 128 or not a single byte utf-8 */

/* io_flag */
Pc3Uterm.prototype.record_flag=1
Pc3Uterm.prototype.not_fid0=2	/* console i/o but not on chan 0 */
Pc3Uterm.prototype.open_prog=4	/* opening a program */
Pc3Uterm.prototype.gui_flag=8	/* write gui-read gui-write */
Pc3Uterm.prototype.eof_flag=16	/* end= was specified */
Pc3Uterm.prototype.bin_flag=32	/* bin= was specified */
Pc3Uterm.prototype.archive_flag=64	/* read archive */

/*Screen Output Mnemonics*/
Pc3Uterm.prototype.m_reg_char=0;
Pc3Uterm.prototype.m_single_at=1;
Pc3Uterm.prototype.m_double_at=2;
Pc3Uterm.prototype.m_attr=3;
Pc3Uterm.prototype.m_backgr=4;
Pc3Uterm.prototype.m_bb=5;
Pc3Uterm.prototype.m_bc=6;
Pc3Uterm.prototype.m_be=7;
Pc3Uterm.prototype.m_bg=8;
Pc3Uterm.prototype.m_bi=9;
Pc3Uterm.prototype.m_black=10;
Pc3Uterm.prototype.m_blue=11;
Pc3Uterm.prototype.m_bo=12;
Pc3Uterm.prototype.m_box=13;
Pc3Uterm.prototype.m_br=14;
Pc3Uterm.prototype.m_bs=15;
Pc3Uterm.prototype.m_bu=16;
Pc3Uterm.prototype.m_ce=17;
Pc3Uterm.prototype.m_cf=18;
Pc3Uterm.prototype.m_ch=19;
Pc3Uterm.prototype.m_cl=20;
Pc3Uterm.prototype.m_cr=22;
Pc3Uterm.prototype.m_cs=23;
Pc3Uterm.prototype.m_cyan=24;
Pc3Uterm.prototype.m_dc=25;
Pc3Uterm.prototype.m_dn=26;
Pc3Uterm.prototype.m_default=27;
Pc3Uterm.prototype.m_drop=28;
Pc3Uterm.prototype.m_eb=29;
Pc3Uterm.prototype.m_ee=30;
Pc3Uterm.prototype.m_eg=31;
Pc3Uterm.prototype.m_ei=32;
Pc3Uterm.prototype.m_eo=33;
Pc3Uterm.prototype.m_er=34;
Pc3Uterm.prototype.m_es=35;
Pc3Uterm.prototype.m_eu=36;
Pc3Uterm.prototype.m_ge=37;
Pc3Uterm.prototype.m_goto=38;
Pc3Uterm.prototype.m_green=39;
Pc3Uterm.prototype.m_gs=40;
Pc3Uterm.prototype.m_ic=41;
Pc3Uterm.prototype.m_lc=42;
Pc3Uterm.prototype.m_ld=43;
Pc3Uterm.prototype.m_lf=44;
Pc3Uterm.prototype.m_li=45;
Pc3Uterm.prototype.m_magenta=46;
Pc3Uterm.prototype.m_mode=47;
Pc3Uterm.prototype.m_move=48;
Pc3Uterm.prototype.m_pop=49;
Pc3Uterm.prototype.m_push=50;
Pc3Uterm.prototype.m_rb=51;
Pc3Uterm.prototype.m_rm=52;
Pc3Uterm.prototype.m_red=53;
Pc3Uterm.prototype.m_rgb=54;
Pc3Uterm.prototype.m_rt=55;
Pc3Uterm.prototype.m_rs=56;
Pc3Uterm.prototype.m_sb=57;
Pc3Uterm.prototype.m_scroll=58;
Pc3Uterm.prototype.m_sf=59;
Pc3Uterm.prototype.m_sp=60;
Pc3Uterm.prototype.m_swap=61;
Pc3Uterm.prototype.m_uc=62;
Pc3Uterm.prototype.m_up=63;
Pc3Uterm.prototype.m_view=64;
Pc3Uterm.prototype.m_vt=65;
Pc3Uterm.prototype.m_white=66;
Pc3Uterm.prototype.m_window=67;
Pc3Uterm.prototype.m_wrap=68;
Pc3Uterm.prototype.m_yellow=69;
Pc3Uterm.prototype.m_ci=70;
Pc3Uterm.prototype.m_el=71;
Pc3Uterm.prototype.m_fl=72;
Pc3Uterm.prototype.m_kl=73;
Pc3Uterm.prototype.m_ku=74;
Pc3Uterm.prototype.m_rc=75;
Pc3Uterm.prototype.m_rl=76;
Pc3Uterm.prototype.m_rp=77;
Pc3Uterm.prototype.m_tr=78;
Pc3Uterm.prototype.m_pe=79;
Pc3Uterm.prototype.m_ps=80;
Pc3Uterm.prototype.m_cursor=81;
Pc3Uterm.prototype.m_con=82;
Pc3Uterm.prototype.m_stbl=83;
Pc3Uterm.prototype.m_inputen=84;
Pc3Uterm.prototype.m_re=85;
Pc3Uterm.prototype.m_se=86;
Pc3Uterm.prototype.m_wt=87;
Pc3Uterm.prototype.m_sw=88;
Pc3Uterm.prototype.m_sysmenu=89;
Pc3Uterm.prototype.m_launch=90;
Pc3Uterm.prototype.m_prm=91;
Pc3Uterm.prototype.m_playsound=92;
Pc3Uterm.prototype.m_srpc=93;
Pc3Uterm.prototype.m_messagebox=94;
Pc3Uterm.prototype.m_gwin=95;
Pc3Uterm.prototype.m_menu=96;
Pc3Uterm.prototype.m_status=97;
Pc3Uterm.prototype.m_movewindow=98;
Pc3Uterm.prototype.m_rgbx=99;
Pc3Uterm.prototype.m_cu=100;
Pc3Uterm.prototype.m_99=101;
Pc3Uterm.prototype.m_reset=102;
Pc3Uterm.prototype.m_mpos=103;
Pc3Uterm.prototype.m_dgmode=104;
Pc3Uterm.prototype.m_popall=105;
Pc3Uterm.prototype.m_mwt=106;
Pc3Uterm.prototype.m_fwindow=107;
Pc3Uterm.prototype.m_xt=108;
Pc3Uterm.prototype.m_menuon=109;
Pc3Uterm.prototype.m_menuoff=110;
Pc3Uterm.prototype.m_resize=111;
Pc3Uterm.prototype.m_cp=112;





//graphic char constants
Pc3Uterm.prototype.g_hor=0;
Pc3Uterm.prototype.g_vert=1;
Pc3Uterm.prototype.g_ul=2;
Pc3Uterm.prototype.g_ur=3;
Pc3Uterm.prototype.g_ll=4;
Pc3Uterm.prototype.g_lr=5;
Pc3Uterm.prototype.g_con_r=6;
Pc3Uterm.prototype.g_con_l=7;
Pc3Uterm.prototype.g_con_t=8;
Pc3Uterm.prototype.g_con_b=9;
Pc3Uterm.prototype.g_con_c=10;

Pc3Uterm.prototype.m_bad_mnemonic=9999;
Pc3Uterm.prototype.e_time_out_error=10000;
Pc3Uterm.prototype.e_end_of_file=10002;
Pc3Uterm.prototype.e_device_type_error=10005;
Pc3Uterm.prototype.e_syntax_error=10020;
Pc3Uterm.prototype.e_invalid_mnemonic=10029;
Pc3Uterm.prototype.e_keyboard_locked=10065;
Pc3Uterm.prototype.e_not_implemented=10150;

Pc3Uterm.prototype.max_windows=10;
Pc3Uterm.prototype.fs=12;

Pc3Uterm.prototype.Pc3Write=Pc3Write;
Pc3Uterm.prototype.Pc3Writex=Pc3Writex;
Pc3Uterm.prototype.RecursiveWritex=RecursiveWritex;
Pc3Uterm.prototype.Pc3Read=Pc3Read;
Pc3Uterm.prototype.Pc3Readx=Pc3Readx;
Pc3Uterm.prototype.send_read_res=send_read_res;
Pc3Uterm.prototype.get_mnemonic=get_mnemonic;
Pc3Uterm.prototype.m_get_int=m_get_int;
Pc3Uterm.prototype.m_get_digitx=m_get_digitx;
Pc3Uterm.prototype.m_get_str=m_get_str;
Pc3Uterm.prototype.m_get_str_low=m_get_str_low;
Pc3Uterm.prototype.Dispatch=Dispatch;
Pc3Uterm.prototype.PC3KeyDown=PC3KeyDown;
Pc3Uterm.prototype.reprint_from_ipos=reprint_from_ipos;
Pc3Uterm.prototype.blank_from_ipos=blank_from_ipos;
Pc3Uterm.prototype.get_window_number=get_window_number;
Pc3Uterm.prototype.get_color=get_color;
Pc3Uterm.prototype.read_screen=read_screen;
Pc3Uterm.prototype.DoDebug=DoDebug;
Pc3Uterm.prototype.status=status;
Pc3Uterm.prototype.status_on=status_on;
Pc3Uterm.prototype.status_off=status_off;
Pc3Uterm.prototype.Resize=Resize;
Pc3Uterm.prototype.SetFontSizes=SetFontSizes;
Pc3Uterm.prototype.webview_on=webview_on;
Pc3Uterm.prototype.webview_off=webview_off;
Pc3Uterm.prototype.EndRead=EndRead;
Pc3Uterm.prototype.HTMLWrite=HTMLWrite;
Pc3Uterm.prototype.SendWriteRes=SendWriteRes;
Pc3Uterm.prototype.DocumentLoaded=DocumentLoaded;
Pc3Uterm.prototype.Click=Click;
Pc3Uterm.prototype.dialog_closed=dialog_closed;
Pc3Uterm.prototype.window_info=window_info;
Pc3Uterm.prototype.ChangeMode=ChangeMode;
Pc3Uterm.prototype.DefaultKeys=DefaultKeys;
Pc3Uterm.prototype.XtermWrite=XtermWrite;
Pc3Uterm.prototype.XtWrite=XtWrite;
Pc3Uterm.prototype.NWindow=NWindow;
Pc3Uterm.prototype.DoPop=DoPop;
Pc3Uterm.prototype.CopyAsArray=CopyAsArray;
Pc3Uterm.prototype.XtWaiting=XtWaiting;
Pc3Uterm.prototype.SM32Mnemonic=SM32Mnemonic;
Pc3Uterm.prototype.get_param=get_param;
Pc3Uterm.prototype.eat_space=eat_space;
Pc3Uterm.prototype.load_rbuf=load_rbuf;
Pc3Uterm.prototype.add_rbuf=add_rbuf;
Pc3Uterm.prototype.send_ksa=send_ksa;
Pc3Uterm.prototype.do_rm=do_rm;
Pc3Uterm.prototype.do_resize=do_resize;
Pc3Uterm.prototype.click_con=click_con;
Pc3Uterm.prototype.menu_click=menu_click;


Pc3Uterm.prototype.max_mnem_len=16;

function Pc3Uterm()
{
	if (this.e_not_implemented == undefined) return; // let the prototypes define
	
	var i;

	this.Xt_timer=false;
	
	this.rp=null; // read or readrecord packet
	this.rbuf = new String(); //keyboard input buffer
	this.Timer=null;
	this.menuon=false;
	this.Ustatus=" ";
	this.inp = new String(); // the '01' INPUT(E/N) put data here
	this.windows=new Array();
	this.gui=new Object;
	this.gui.data_ready=false;
	this.gui.data=null;
	this.jsData = new Object;
	
	
	/* font height and width to calculate if font changes on window resize */
	this.fs_width=new Array();
	this.fs_height=new Array();
	
	T_G.bw.cw=0;	// current window

	this.save_h=-1;	//used by resize 
	this.save_w=-1;
	
	this.scr_keys=new Array();
	this.g_chars=new Array();
	
	
	/* menu_on and status for window resize */
	this.cmenu_on=false; // menu is only menu
		
	for (i=0; i != this.max_windows; ++i) {
		T_G.bw.windows[i]=null;
	}
	
	/* screen edit control characters */
	this.scr_keys= new Array();
	this.scr_keys["ctrla"]="\x1A"
	this.scr_keys["ctrlb"]="\x02"
	this.scr_keys["ctrle"]="\x14"
	this.scr_keys["ctrlf"]="\x06"
	this.scr_keys["ctrlh"]="\x01"
	this.scr_keys["ctrlk"]="\x0B"
	this.scr_keys["ctrlu"]="\x15"
	this.scr_keys["ctrlx"]="\x1C"
	this.scr_keys["ctrly"]="\x1D"
	if (true) {
	this.g_chars[this.g_hor]="\u2500";
	this.g_chars[this.g_vert]="\u2502";
	this.g_chars[this.g_ul]="\u250C";
	this.g_chars[this.g_ur]="\u2510";
	this.g_chars[this.g_ll]="\u2514";
	this.g_chars[this.g_lr]="\u2518";
	this.g_chars[this.g_con_r]="\u251C";
	this.g_chars[this.g_con_l]="\u2524";
	this.g_chars[this.g_con_t]="\u2534";
	this.g_chars[this.g_con_b]="\u252C";
	this.g_chars[this.g_con_c]="\u253C";
	}
	else {
	this.g_chars[this.g_hor]="\u2501";
	this.g_chars[this.g_vert]="\u2503";
	this.g_chars[this.g_ul]="\u250F";
	this.g_chars[this.g_ur]="\u2513";
	this.g_chars[this.g_ll]="\u2517";
	this.g_chars[this.g_lr]="\u251B";
	this.g_chars[this.g_con_r]="\u2523";
	this.g_chars[this.g_con_l]="\u252B";
	this.g_chars[this.g_con_t]="\u253B";
	this.g_chars[this.g_con_b]="\u2533";
	this.g_chars[this.g_con_c]="\u254b";
	}
	this.sm32_error=0;
	this.kb_locked=false;
	this.bell_type=0;
	this.open_count=0;
	this.prompt="";
	this.terms="\x0D\x0A\x9C\x9D\x9E\x9F";
	this.terms_ctl="\x00\x00\x01\x02\x03\x04";
	this.scr_on=false;
	this.scr_disp_prm=false;
	this.scr_no_echo_delim=false;
	this.scr_use_pos=false;
	this.scr_pos=0;
	this.mnem_tab = {
		"attr" : this.m_attr,
		"backgr" : this.m_backgr,
		"bb" : this.m_bb,
		"fs" : this.m_bb,
		"bc" : this.m_bc,
		"be" : this.m_be,
		"bg" : this.m_bg,
		"bi" : this.m_bi,
		"black" : this.m_black,
		"blue" : this.m_blue,
		"bo" : this.m_bo,
		"box" : this.m_box,
		"br" : this.m_br,
		"bs" : this.m_bs,
		"bu" : this.m_bu,
		"us" : this.m_bu,
		"ce" : this.m_ce,
		"cf" : this.m_cf,
		"ch" : this.m_ch,
		"cl" : this.m_cl,
		"cr" : this.m_cr,
		"cs" : this.m_cs,
		"cyan" : this.m_cyan,
		"dc" : this.m_dc,
		"dn" : this.m_dn,
		"default" : this.m_default,
		"drop" : this.m_drop,
		"eb" : this.m_eb,
		"ft" : this.m_eb,
		"ee" : this.m_ee,
		"eg" : this.m_eg,
		"ei" : this.m_ei,
		"eo" : this.m_eo,
		"er" : this.m_er,
		"es" : this.m_es,
		"eu" : this.m_eu,
		"ut" : this.m_eu,
		"ff" : this.m_cs,
		"ge" : this.m_ge,
		"goto" : this.m_goto,
		"green" : this.m_green,
		"gs" : this.m_gs,
		"ic" : this.m_ic,
		"lc" : this.m_lc,
		"ld" : this.m_ld,
		"lf" : this.m_lf,
		"li" : this.m_li,
		"magenta" : this.m_magenta,
		"mode" : this.m_mode,
		"move" : this.m_move,
		"pop" : this.m_pop,
		"push" : this.m_push,
		"rb" : this.m_rb,
		"rm" : this.m_rm,
		"red" : this.m_red,
		"rgb" : this.m_rgb,
		"rt" : this.m_rt,
		"rs" : this.m_rs,
		"sb" : this.m_sb,
		"scroll" : this.m_scroll,
		"sf" : this.m_sf,
		"swap" : this.m_swap,
		"uc" : this.m_uc,
		"up" : this.m_up,
		"view" : this.m_view,
		"vt" : this.m_vt,
		"white" : this.m_white,
		"window" : this.m_window,
		"fwindow" : this.m_fwindow,
		"wrap" : this.m_wrap,
		"yellow" : this.m_yellow,
		"ci" : this.m_ci,
		"el" : this.m_el,
		"fl" : this.m_fl,
		"kl" : this.m_kl,
		"ku" : this.m_ku,
		"rc" : this.m_rc,
		"rl" : this.m_rl,
		"rp" : this.m_rp,
		"tr" : this.m_tr,
		"pe" : this.m_pe,
		"ps" : this.m_ps,
		"cursor" : this.m_cursor,
		"con" : this.m_con,
		"00" : this.m_stbl,
		"01" : this.m_inputen,
		"02" : this.m_re,
		"03" : this.m_se,
		"wt" : this.m_wt,
		"sw" : this.m_sw,
		"sysmenu" : this.m_sysmenu,
		"launch" : this.m_launch,
		"prm" : this.m_prm,
		"playsound" : this.m_playsound,
		"srpc" : this.m_srpc,
		"messagebox" : this.m_messagebox,
		"gwin" : this.m_gwin,
		"menu" : this.m_menu,
		"status" : this.m_status,
		"movewindow" : this.m_movewindow,
		"rgbx" : this.m_rgbx,
		"cu" : this.m_cu,
		"99" : this.m_99,
		"reset" : this.m_reset,
		"popall" : this.m_popall,
		"mwt" : this.m_mwt,
		"xt" : this.m_xt, 
		"menuon" : this.m_menuon,
		"menuoff" : this.m_menuoff,
		"resize" : this.m_resize,
		"cp" : this.m_cp,
		"sp" : this.m_sp }; 
};

