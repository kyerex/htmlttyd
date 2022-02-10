function tohex(s)
{
    let o="";
    for (i=0;i!=s.length;++i){
        o=o+s.charCodeAt(i).toString(16)+" ";
    }
    console.log(s);
    console.log(o);
}
// states 0 -> x
// 0 - no state looking for escape
// 1 - escape received
// 2 - waiting Operating Sysytem Command
// 4 - wait for ;
// 5 - got osc wait for st or bel
// 6 - wait for \ from st
// 7 - handle csi command
function XtermWrite(pk)
{
    let achar,w,i,s1,c,p,p2;
    let col,row,rowt,rowb;
    let cwin=T_G.bw.windows[T_G.bw.cw];
    cwin.caret_off();
    if (this.Xt_timer) {
        clearTimeout(this.Xt_THandle);
        this.Xt_timer=false;
    }
    //let s=pk.data;
    let s=decodeURIComponent(escape(pk.data));
    //tohex(pk.data);
    this.sm32_error=0;
    while (s.length != 0) {
        achar=s.substr(0,1);
        s=s.substr(1);
        switch (this.XtState) {
            case 0:
                i=achar.charCodeAt(0);
                if (i > 31) {
                    if (i == 127) continue; // ansi eats del
                    cwin.echo_char (achar);
                    continue;
                }
                switch (i) {
                    default:
                        console.log("control char="+i);
                        continue;
                    case 0:
                        continue;
                    case 7:
                        T_G.bell.play();
                        continue;
                    case 8:
                        cwin.back_cursor();
                        continue;
                    case 9:
                        cwin.caret_off;
                        while(cwin.col != cwin.s_cols-1) {
                            ++cwin.col;
                            if (cwin.tabs[cwin.col]) break;
                        }
                        continue;
                    case 10:
                        cwin.inc_row();
                        continue;
                    case 13:
                        cwin.col=0;
                        continue;
                    case 27:
                        this.XtState=1;
                        continue;
                }
                // never get here
                console.log("should not be here !!!");
                continue;
            case 1:
                // escape sequence
                //looking for char after escape
                c=achar.charCodeAt(0);
                this.XtState=0; // if not csi or osc go back to state 0
                if (c==0 || c == 61 || c== 62) {
                    continue;
                }
                if (c < 48 || c > 126) {
                    console.log("invalid escape sequence c="+c);
                    continue;
                }
                switch (c-48) {
                    default:
                        console.log("FE escape sequence char - "+achar+" - "+c);
                        continue;
                    case 12: // <
                        continue; // always in ansii
                    case 14: // >
                        continue; // user can use num lock
                    case 16: // @
                        // ignore esc @
                        continue;
                    case 20: // D
                        cwin.inc_row();
                        continue;
                    case 24: // H
                        cwin.tabs[cwin.col]=true;
                        continue;
                    case 29: // M
                        cwin.dec_row()
                        continue;
                    case 43: // [
                        //  CSI - Control Sequence Introducer
                        this.Xt_cmd="";
                        this.XtState=7;
                        continue;
                    case 45: // ]
                        //  OSC - Operating System Command
                        this.Xt_cmd="";
                        i=s.indexOf("\033");
                        if (i == -1) {
                            this.Xt_cmd=s;
                            s="";
                        }
                        else {
                            this.Xt_cmd=s.slice(0,i);
                            s=s.slice(i);
                        }
                        this.XtState=2;
                        continue;
                    case 51: // c reset
                        this.do_rm(this.bgcolor,this.fgcolor);
                        continue;
                }
            case 2:
                // Handle - OSC - Operating System Command
                // Get all until st
                if (achar == "\033") {
                    this.XtState=4;
                    continue;
                }
                this.Xt_cmd=this.Xt_cmd+achar;
                i=s.indexOf("\033");
                if (i == -1) {
                    this.Xt_cmd=this.Xt_cmd+s;
                    s="";
                }
                else {
                    this.Xt_cmd=this.Xt_cmd+s.slice(0,i);
                    s=s.slice(i+1);
                    this.XtState=4;
                }
                continue;
            case 4:
                if ( achar !=  '\\') { // this should be st
                    //Escape sequence in OSC command ??
                    this.Xt_cmd=this.Xt_cmd+"\033"+achar;
                    this.XtState=2;
                    continue;
                }

                // have OSC code in Xt_cmd
                this.XtState=0;
                i=this.Xt_cmd.indexOf(";");
                if (i == -1) {
                    console.log("OSC no command - "+this.Xt_cmd);
                }
                s1=this.Xt_cmd.substr(i+1);
                if (i != 0) {
                   i=Number(this.Xt_cmd.substr(0,i));
                }
                if (isNaN(i)) {
                    console.log("OSC non numeric command - "+this.Xt_cmd);
                    continue;
                }
                switch (i) {
                    default:
                        console.log("OSC - only do 0,2,98 and 99 got:"+this.Xt_cmd)
                        continue;
                    case 0:
                    case 2:
                        w=T_G.bw.topw;
                        if (cwin.dialog_w != null) w=cwin.dialog_w;
                        w.document.title=s1;
                        continue;
                    case 98:
                        if (s1.slice(0,1) == "*") {
                            //should rarely get here
                            //s1 has an * +  a 8 byte len, then write gui packet
                            s1=s1.slice(1);
                            i=Number(s1.slice(0,8));
                            console.log("Got long html len="+i);
                            s1=s1.slice(9);
                            if (i != s1.length-1) {
                                console.log("Bad Length write gui i="+i+" len="+s.length);
                            }
                        }
                        p2=new Pc2Packet(s1);
                        if (p2.data == undefined){
                            console.log("Bad Write Gui");
                            p2="";
                            continue;
                        }
                        this.HTMLWrite(p2);
                        p2="";
                        continue;
                    case 99:
                        //s1 has a SM32 mnemonic
                        //console.log("SM32 Mnemonic:"+s1);
                        this.SM32Mnemonic(s1);
                        cwin=T_G.bw.windows[T_G.bw.cw];
                        continue;
                }

            case 7:
                // handle - CSI - Control Sequence Introducer 
                c=achar.charCodeAt(0);
                if (c < 64) {
                    this.Xt_cmd=this.Xt_cmd+achar;
                    continue;
                }
                //valid command are @->~ (64->126)
                p=this.Xt_cmd; // parameters
                this.XtState=0; // handle CSI and got back to 0
                switch (c-64) {
                    default:
                        console.log("CSI Command:"+achar+" Not implemented p=["+p+"]");
                        continue;
                    case 1: // A
                        //CUU - cursor up
                        i=parseInt(p);
                        if (isNaN(i)) i=1;
                        if (i==0) i=1
                        while (i != 0 ){
                            --i;
                            if (cwin.origin_mode){
                                if (cwin.row == cwin.om_top_row) break; //at top of scroll area
                            }
                            else{
                                if (cwin.row == 0) break; //already in 1st row
                            }
                            --cwin.row;
                        }
                        continue;
                    case 2: // B
                        //CUD - cursor down
                        i=parseInt(p);
                        if (isNaN(i)) i=1;
                        if (i==0) i=1;
                        while (i != 0){
                            --i;
                            if (cwin.origin_mode){
                                if (cwin.row == cwin.om_bot_row) break; //at bottom of scroll area
                            }
                            else{
                                if (cwin.row+1 == cwin.s_rows) break; //already in last col
                            }
                            ++cwin.row;
                        }
                        continue;
                    case 3: // C
                        //CUF - cursor forward
                        i=parseInt(p);
                        if (isNaN(i)) i=1;
                        if (i==0) i=1;
                        while (i != 0){
                            --i;
                            if (cwin.col+1 == cwin.s_cols) break; //already in last col
                            ++cwin.col;
                        }
                        continue;
                    case 4: // D
                        //CUB - cursor backward
                        i=parseInt(p);
                        if (isNaN(i)) i=1;
                        if (i==0) i=1
                        while (i != 0 ){
                            --i;
                            if (cwin.col == 0) break; //already in 1st col
                            --cwin.col;
                        }
                        continue;
                    case 38: // f
                    case 8: // H
                        //CUP -cursor postion (1 relative in stead of 0)
                        if (p == "") {
                            col=0;
                            row=0;
                        }
                        else {
                            if (p.substr(0,1) == ';') {
                                row=0;
                                p=p.substr(1);
                            }
                            else {
                                row=parseInt(p);
                                i=p.indexOf(';');
                                if (i == -1) {
                                    p="";
                                }
                                else {
                                    p=p.substr(i+1)
                                }
                            }
                            if (p=="") {
                                col=0;
                            }
                            else {
                                col=parseInt(p);
                            }
                        }
                        if (isNaN(col)) {
                            col=0;
                            console.log("got NaN for col from parseInt()");
                        }
                        if (isNaN(row)) {
                            row=0;
                            console.log("got NaN for row from parseInt()");
                        }
                        if (col > 0) --col;
                        if (row > 0) --row;
                        if (col >= cwin.s_cols) col=cwin.s_cols-1;
                        if (row >= cwin.s_rows) row=cwin.s_rows-1;
                        if (cwin.origin_mode) {
                            row=row+cwin.om_top_row;
                            if (row < cwin.om_top_row) row=cwin.om_top_row;
                            if (row > cwin.om_bot_row) row=cwin.om_bot_row;
                        }
                        cwin.col=col;
                        cwin.row=row;
                        continue;
                    case 10: // J
                        // clear screen sub command 0,1,2
                        if (p == "") {
                            i=0;
                        }
                        else {
                            i=parseInt(p);
                            if (i == NaN) i=0;
                        }
                        if (i < 0 || i > 2) i=0;
                        cwin.Xt_cs(i);
                        continue;
                    case 11: // K
                        // clear line - sub command 0,1,2
                        if (p == "") {
                            i=0;
                        }
                        else {
                            i=parseInt(p);
                            if (i == NaN) i=0;
                        }
                        if (i < 0 || i >2) i=0;
                        cwin.clear_line(i);
                        continue;
                    case 16: // P
                        i=parseInt(p);
                        if (isNaN(i)) i=1;
                        if (i==0) i=1
                        while (i !=0 ){
                            --i;
                            cwin.back_space();
                        }
                        continue;
                    case 39: // g
                        if (p == "") {
                            i=0;
                        }
                        else {
                            i=parseInt(p);
                            if (i == NaN) i=0;
                        }
                        if (i != 0 && i != 3) {
                            console.log("Bad Clear tab -"+i);
                        }
                        if (i == 0) {
                            cwin.tabs[cwin.col]=false;
                        }
                        else {
                            for (i=0; i!=cwin.s_cols; ++i) {
                                cwin.tabs[i]=false;
                            }
                        }
                        continue;
                    case 40: // h
                        if (p.charAt(0) == '?') {
                            p=p.substr(1);
                            while (p.length != 0) {
                                c=parseInt(p);
                                if (isNaN(c)) {
                                    break;
                                    }
                                i=p.indexOf(";");
                                if (i == -1) {
                                    p=""
                                }
                                else {
                                    p=p.substr(i+1);
                                }
                                switch (c) {
                                    default:
                                        console.log("?h - "+c+" Not Implimented");
                                        continue;
                                    case 1:
                                        //aplication keypad on
                                        continue; // ignore use num lock
                                    case 2:
                                        continue;   //always in ansi mode
                                    case 3:
                                        this.do_resize(132,cwin.s_rows);
                                        break;
                                    case 4:
                                        continue; // no change in scrolling
                                    case 5: // goto black fg white bg
                                        cwin.bc_rgb=this.get_color(255,255,255);
                                        cwin.fc_rgb=this.get_color(0,0,0);
                                        cwin.def_fc_rgb=cwin.fc_rgb;
                                        cwin.def_bc_rgb=cwin.bc_rgb;
                                        cwin.Xt_cs(2);
                                        continue;
                                    case 6:
                                        //DECOM set
                                        cwin.origin_mode=true;
                                        cwin.col=0;
                                        cwin.row=cwin.om_top_row;
                                        continue;
                                    case 7:
                                        //auto wrap to next line on
                                        cwin.wrap_off=false;
                                        continue;
                                    case 8: // auto repaet - whatever chrome does
                                        continue;
                                    case 1049:
                                        cwin=this.NWindow(-1,-1,-1,-1,"","","",false);
                                        continue;
                                }
                            }
                        }
                        else {
                            c=parseInt(p);
                            if (isNaN(c)) {
                                continue;
                            }
                            switch (c) {
                                // there is only 0 and 20
                                // 0 is ignored and 20 is linefeed mode ??
                                default:
                                    console.log("h - "+c+" Not Implimented");
                                    continue;
                            }
                        }
                        continue; 
                    case 44: // l 
                        if (p.charAt(0) == '?') {
                            p=p.substr(1);
                            while (p.length != 0) {
                                c=parseInt(p);
                                if (isNaN(c)) {
                                    break;
                                    }
                                i=p.indexOf(";");
                                if (i == -1) {
                                    p=""
                                }
                                else {
                                    p=p.substr(i+1);
                                }
                                switch (c) {
                                    default:
                                        console.log("?l - "+c+" Not Implimented");
                                        continue;
                                    case 1:
                                        //aplication keypad off
                                        continue; // ignore use num lock
                                    case 2:
                                        continue; //always in ansi:w

                                    case 3:
                                        this.do_resize(80,cwin.s_rows);
                                        continue;
                                    case 4:
                                        continue; // no change in scrolling
                                    case 5: // goto white fg black bg
                                        cwin.fc_rgb=this.get_color(255,255,255);
                                        cwin.bc_rgb=this.get_color(0,0,0);
                                        cwin.def_fc_rgb=cwin.fc_rgb;
                                        cwin.def_bc_rgb=cwin.bc_rgb;
                                        cwin.Xt_cs(2);
                                        continue;
                                    case 6:
                                        //DECOM reset
                                        cwin.origin_mode=false;
                                        cwin.col=0;
                                        cwin.row=0;
                                        continue;
                                    case 7:
                                        //auto wrap off stay in last col
                                        cwin.wrap_off=true;
                                        continue;
                                    case 8: // auto repaet - whatever chrome does
                                        continue;
                                    case 1049:
                                        cwin=this.DoPop();
                                        continue;
                                }
                            }
                        }
                        else {
                            c=parseInt(p);
                            if (isNaN(c)) {
                                continue;
                            }
                            switch (c) {
                                default:
                                    console.log("h - "+c+" Not Implimented");
                                    continue;
                            }
                        }
                        continue; 
                    case 45: // m
                        // Character Attributes
                        if (p == "") p="0";
                        while (p != "") {
                            c=parseInt(p);
                            if (isNaN(c)) {
                                //default
                                c=0;
                            }
                            i=p.indexOf(";");
                            if (i == -1) {
                                p=""
                            }
                            else {
                                p=p.substr(i+1);
                            }
                            switch (c) {
                                case 0:
                                    // Reset or normal
                                    cwin.high_intensity=false;
                                    cwin.reverse_video=false;
                                    cwin.bbx_underline=false;
                                    cwin.blink=false;
                                    cwin.graphics=false;
                                    cwin.bc_rgb=cwin.def_bc_rgb;
                                    cwin.fc_rgb=cwin.def_fc_rgb;
                                    continue; 
                                case 1:
                                    // Bold or increased intensity
                                    cwin.high_intensity=true;
                                    continue;
                                case 2:
                                    // Bold or increased intensity off
                                    cwin.high_intensity=false;
                                    continue;
                                case 4:
                                    cwin.bbx_underline=true;
                                    continue;
                                case 5:
                                    cwin.blink=true;
                                    continue;
                                case 7:
                                    cwin.reverse_video=true;
                                    continue;
                                case 23:
                                    //Neither italic, nor blackletter - no char set support
                                    continue
                                case 24:
                                    cwin.bbx_underline=false;
                                    continue;
                                case 27:
                                    cwin.reverse_video=false;
                                case 29:
                                    //Not crossed out - no char set support
                                    continue
                                case 30:
                                    //Black
                                    cwin.fc_rgb="000000";
                                    continue;
                                case 31:
                                    //Red
                                    cwin.fc_rgb="FF0000";
                                    continue;
                                case 32:
                                    //Green
                                    cwin.fc_rgb="00FF00";
                                    continue;
                                case 33:
                                    //Yellow
                                    cwin.fc_rgb="FFFF00";
                                    continue;
                                case 34:
                                    //Blue
                                    cwin.fc_rgb="0000FF";
                                    continue;
                                case 35:
                                    //Magenta
                                    cwin.fc_rgb="FF00FF";
                                    continue;
                                case 36:
                                    //Cyan
                                    cwin.fc_rgb="00FFFF";
                                    continue;
                                case 37:
                                    //White
                                    cwin.fc_rgb="FFFFFF";
                                    continue;
                                case 39:
                                    //Default
                                    cwin.fc_rgb=cwin.def_fc_rgb;
                                    continue;
                                case 40:
                                    //Black
                                    cwin.bc_rgb="000000";
                                    continue;
                                case 41:
                                    //Red
                                    cwin.bc_rgb="FF0000";
                                    continue;
                                case 42:
                                    //Green
                                    cwin.bc_rgb="00FF00";
                                    continue;
                                case 43:
                                    //Yellow
                                    cwin.bc_rgb="FFFF00";
                                    continue;
                                case 44:
                                    //Blue
                                    cwin.bc_rgb="0000FF";
                                    continue;
                                case 45:
                                    //Magenta
                                    cwin.bc_rgb="FF00FF";
                                    continue;
                                case 46:
                                    //Cyan
                                    cwin.bc_rgb="00FFFF";
                                    continue;
                                case 47:
                                    //White
                                    cwin.bc_rgb="FFFFFF";
                                    continue;
                                case 49:
                                    //Default
                                    cwin.bc_rgb=cwin.def_bc_rgb;
                                    continue;
                                
                                default:
                                    console.log("Command=m"+" sub c="+c+" p="+p);
                                    break;
                            }
                        }
                        this.XtState=0;
                        continue;
                    case 50: //r
                        //DECSTBM - set relative origin margins
                        if (p == "") {
                            rowt=1;
                            rowb=cwin.s_rows;
                        }
                        else {
                            if (p.substr(0,1) == ';') {
                                rowt=1;
                                p=p.substr(1);
                            }
                            else {
                                rowt=parseInt(p);
                                i=p.indexOf(';');
                                if (i == -1) {
                                    p="";
                                }
                                else {
                                    p=p.substr(i+1)
                                }
                            }
                            if (p=="") {
                                rowb=cwin.s_rows;
                            }
                            else {
                                rowb=parseInt(p);
                            }
                        }
                        if (isNaN(rowt)) {
                            console.log("got NaN for top row from parseInt()");
                            continue; // dom set om
                        }
                        if (isNaN(rowb)) {
                            console.log("got NaN for bot row from parseInt()");
                            continue; // dom set om
                        }
                        if (rowt < 1) rowt=1;
                        if (rowb > cwin.s_rows) rowb=cwin.s_rows;
                        if (rowt+3 > rowb) continue;
                        --rowt;
                        --rowb;
                        cwin.om_top_row=rowt;
                        cwin.om_bot_row=rowb;
                        // automatically set origin mode
                        cwin.origin_mode=true;
                        cwin.col=0;
                        cwin.row=cwin.om_top_row;
                        continue;
                    case 52: // t
                        // ignore for now
                        console.log("Got Here p="+p);
                        continue;
                }
        }
    }
    if (this.XtState != 0) {
        // go back to state 0 after waiting 2 seconds
        this.Xt_timer=true;
        this.Xt_THandle=setTimeout(XtWaiting,2000);
    }
    cwin.caret_on();
    return;
}

function XtWaiting()
{
    console.log("Time Out State:"+T_G.pu.XtState);
    clearTimeout(T_G.pu.Xt_THandle);
    T_G.pu.XtState=0;
    T_G.pu.Xt_timer=false;
}