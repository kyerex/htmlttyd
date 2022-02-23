 
function CopyAsArray(iAsA) {
    let key;
    let oAsA = new Array();
    for (key in iAsA){
        oAsA[key]=iAsA[key];
    }
	return oAsA;
}


function ChangeMode(m)
{
    switch (m) {
        case 0:
        case 2:
            console.log("sm32_mode = false");
			this.sm32_mode=false;
            this.XtState = 0;
			this.chan_flag = 0;
			++this.open_count;
            if (m == 0) {
                this.keys = this.CopyAsArray(this.keys2); 
            }
            else {
                this.keys = this.CopyAsArray(this.keys3); 
            }
            break;

        case 1:
            console.log("sm32_mode = true");
    		this.sm32_mode=true;
			this.chan_flag = 0;
            this.keys = this.CopyAsArray(this.keys1); 
            break;

        default:
            alert("Say What ??");
            break;
    }
}

function DoPop()
{

    let cwin=T_G.bw.windows[T_G.bw.cw];
    cwin.pop();
    if (this.sm32_error !=0) return;
    cwin=T_G.bw.windows[T_G.bw.cw];
    cwin.e.style.zIndex = "1";
    if (cwin.fwin != undefined){
        if (cwin.fwin.divh != undefined){
            cwin.fwin.divh.onmousedown=dragMouseDown;
        }
    }
    if (cwin.twin !=null) {
        cwin.twin.e.style.zIndex = "1";
    }
    return cwin;
}

function NWindow (row,col,rows,cols,nstr,tstr,t2str,float)
{
    let i,j;
    let cwin=T_G.bw.windows[T_G.bw.cw];
    let full_frame=false;
    if (float==false && col == -1 && row == -1 && cols == -1 && rows == -1) {
        full_frame=true;
    }
    for (i=0; i!=10 ;++i) {
        if (T_G.bw.windows[i] == null) break;
    }
    if (i == this.max_windows) {
        this.sm32_error = this.e_invalid_mnemonic;
    }
    /* window[i] will be our window */
    if (this.sm32_error != 0) return null;
    cwin.caret_off;
    cwin.e.style.zIndex = "0";
    if (cwin.fwin != undefined){
        if (cwin.fwin.divh != undefined){
            cwin.fwin.divh.onmousedown = null;
        }
    }
    if (cwin.twin !=null) {
        cwin.twin.e.style.zIndex = "0";
    }
    if (nstr == "") {
        nstr="_win"+i;
    }
    j=T_G.bw.cw;
    var twin=null;
    if (float) {
        if (t2str == "") {
            t2str=  "background-color: #C0C0C0; color: #ffffff;"
        }
        cwin=new SMB_window(row,col,cols,rows,nstr,tstr,t2str,true); 
    }
    else {
        if (tstr != "" && full_frame == false) {
            twin=new SMB_window(row,col,cols,rows,nstr+"_T","","",false);
            if (this.sm32_error !=0) return;
            /* temp make twin current window */            
            T_G.bw.cw=i;
            T_G.bw.windows[i]=twin;
            twin.cs();
            twin.pw=-1;
            twin.nw=-1; // not part of chain
            twin.box(0,0,cols,rows,tstr,t2str);
            ++col;++row;
            cols=cols-2;
            rows=rows-2;
        }
        if (full_frame) {
            cwin=new SMB_window(0,0,this.win0_cols,this.win0_rows,nstr,"100%","100%",false);
        }
        else {
            cwin=new SMB_window(row,col,cols,rows,nstr,"","",false); 
        }
        if (this.sm32_error !=0) return;
    }
    cwin.twin=twin;
    cwin.cs();
    T_G.bw.cw=i;
    T_G.bw.windows[i]=cwin;
    cwin.pw=j;
    cwin.nw=T_G.bw.windows[j].nw;
    T_G.bw.windows[j].nw=i;
    if (cwin.nw != -1) {
        T_G.bw.windows[cwin.nw].pw=i;
    }
    cwin.e.style.zIndex = "1";
    if (cwin.twin !=null) {
        cwin.twin.e.style.zIndex = "1";
    } 

    return cwin;
}
/* 
the keys associative array are 4 characters 
the last 3 chars are the 3 digit key #
the 1st char is one of 16 letters A->P
it is determind by adding 0->15 to A
the 0-15 is a combinations of bits indicating
2^3=Caps Lock on, 2^2=shift key down, 2^1=crtl key down and 2^0 Alt key down
Leaving the Alt key down out (Windows menu selector) gives us
A= No Caps Lock - No Shift Key - No Ctrl Key
C= No Caps Lock - No Shift Key -    Ctrl Key
E= No Caps Lock -    Shift Key - No Ctrl Key
G= No Caps Lock -    Shift Key -    Ctrl Key
I=    Caps Lock - No Shift Key - No Ctrl Key
K=    Caps Lock - No Shift Key -    Ctrl Key
M=    Caps Lock -    Shift Key - No Ctrl Key
O=    Caps Lock -    Shift Key -    Ctrl Key
*/

function DefaultKeys()
{
    //use sm32_mode flag for the diff in input keys
    let c,c2,i;
    this.keys1=new Array();
    this.keys2=new Array();
    this.keys3=new Array();
    for (i=65 ; i <= 90 ; ++i) {
        c='A';
        c2="000"+i.toString();
        c=c+c2.substr(-3,3);
        this.keys1[c]=String.fromCharCode(i+32); // a-> z
        c='C';
        c2="000"+i.toString();
        c=c+c2.substr(-3,3);
        this.keys1[c]=String.fromCharCode(i-64); // 0x01 -> 0x1A                       
        c='E';
        c2="000"+i.toString();
        c=c+c2.substr(-3,3);
        this.keys1[c]=String.fromCharCode(i);    // A->Z
        c='G';
        c2="000"+i.toString();
        c=c+c2.substr(-3,3);
        this.keys1[c]=String.fromCharCode(i-64); // 0x01 -> 0x1A   
        c='I';
        c2="000"+i.toString();
        c=c+c2.substr(-3,3);
        this.keys1[c]=String.fromCharCode(i);    //A->Z
        c='K';
        c2="000"+i.toString();
        c=c+c2.substr(-3,3);
        this.keys1[c]=String.fromCharCode(i-64); // 0x01->0x1A    
        c='M';
        c2="000"+i.toString();
        c=c+c2.substr(-3,3);
        this.keys1[c]=String.fromCharCode(i+32); // a->z   
        c='O';
        c2="000"+i.toString();
        c=c+c2.substr(-3,3);
        this.keys1[c]=String.fromCharCode(i-64);                            
    }
    // escape key
    this.keys1["A027"]="\x1B";
    this.keys1["C027"]="\x1B";
    this.keys1["E027"]="\x1B";
    this.keys1["G027"]="\x1B";
    this.keys1["I027"]="\x1B";
    this.keys1["K027"]="\x1B";
    this.keys1["M027"]="\x1B";
    this.keys1["O027"]="\x1B";

    this.keys2=CopyAsArray(this.keys1); // vt100 has all the above the same as SM32
    this.keys3=CopyAsArray(this.keys1); // xterm has all the above the same as SM32

    // 48 - 0) 
    this.keys1["A048"]="0";
    this.keys1["E048"]=")";
    this.keys1["I048"]="0";
    this.keys1["M048"]=")";
    // 49 - 1!
    this.keys1["A049"]="1";
    this.keys1["E049"]="!";
    this.keys1["I049"]="1";
    this.keys1["M049"]="!";
    // 50 - 2@
    this.keys1["A050"]="2";
    this.keys1["E050"]="@";
    this.keys1["I050"]="2";
    this.keys1["M050"]="@";
    // 51 - 3#
    this.keys1["A051"]="3";
    this.keys1["E051"]="#";
    this.keys1["I051"]="3";
    this.keys1["M051"]="#";
    // 52- 4$
    this.keys1["A052"]="4";
    this.keys1["E052"]="$";
    this.keys1["I052"]="4";
    this.keys1["M052"]="$";
    // 53 - 5%
    this.keys1["A053"]="5";
    this.keys1["E053"]="%";
    this.keys1["I053"]="5";
    this.keys1["M053"]="%";
    // 54 - 6^
    this.keys1["A054"]="6";
    this.keys1["E054"]="^";
    this.keys1["I054"]="6";
    this.keys1["M054"]="^";
    // 55 - 7&
    this.keys1["A055"]="7";
    this.keys1["E055"]="&";
    this.keys1["I055"]="7";
    this.keys1["M055"]="&";
    // 56 - 8*
    this.keys1["A056"]="8";
    this.keys1["E056"]="*";
    this.keys1["I056"]="8";
    this.keys1["M056"]="*";
    // 57 - 9(
    this.keys1["A057"]="9";
    this.keys1["E057"]="(";
    this.keys1["I057"]="9";
    this.keys1["M057"]="(";
    // 192 - `~
    this.keys1["A192"]="`";
    this.keys1["E192"]="~";
    this.keys1["I192"]="`";
    this.keys1["M192"]="~";
    // 189 - -_
    this.keys1["A189"]="-";
    this.keys1["E189"]="_";
    this.keys1["I189"]="-";
    this.keys1["M189"]="_";
    // 187 - =+
    this.keys1["A187"]="=";
    this.keys1["E187"]="+";
    this.keys1["I187"]="=";
    this.keys1["M187"]="+";
    // 8 - Backspace
    this.keys1["A008"]="\b";
    this.keys1["E008"]="\b";
    this.keys1["I008"]="\b";    
    this.keys1["M008"]="\b";    
    // 45 - Insert
    this.keys1["A045"]="\x14";
    this.keys1["E045"]="\x14";
    this.keys1["I045"]="\x14";
    this.keys1["M045"]="\x14";
    // 46 - Delete
    this.keys1["A046"]="\x18";
    this.keys1["E046"]="\x18";
    this.keys1["I046"]="\x18";
    this.keys1["M046"]="\x18";
    // 219 - [{
    this.keys1["A219"]="[";
    this.keys1["C219"]="\x1B";
    this.keys1["E219"]="{";
    this.keys1["G219"]="\x1B";
    this.keys1["K219"]="\x1B";
    this.keys1["I219"]="[";
    this.keys1["M219"]="{";
    this.keys1["O219"]="\x1B";
    // 221 - ]}
    this.keys1["A221"]="]";
    this.keys1["C221"]="\x1D";
    this.keys1["E221"]="}";
    this.keys1["G221"]="\x1D";
    this.keys1["I221"]="]";
    this.keys1["K221"]="\x1D";
    this.keys1["M221"]="}";
    this.keys1["O221"]="\x1D";
    // 220 - \|
    this.keys1["A220"]="\\";
    this.keys1["C220"]="\x1C";
    this.keys1["E220"]="|";
    this.keys1["G220"]="\x1C";
    this.keys1["I220"]="\\";
    this.keys1["K220"]="\x1C";
    this.keys1["M220"]="|";
    this.keys1["O220"]="\x1C";
    // 186 - ;:
    this.keys1["A186"]=";";
    this.keys1["E186"]=":";
    this.keys1["I186"]=";";
    this.keys1["M186"]=":";
    // 222 - '"
    this.keys1["A222"]="'";
    this.keys1["E222"]='"';
    this.keys1["I222"]="'";
    this.keys1["M222"]='"';
    // 13 - Enter(keyboard and num pad)
    this.keys1["A013"]="\r";
    this.keys1["E013"]="\r";
    this.keys1["I013"]="\r";
    this.keys1["M013"]="\r";
    // 188 - ,<
    this.keys1["A188"]=",";
    this.keys1["E188"]="<";
    this.keys1["I188"]=",";    
    this.keys1["M188"]="<";    
    // 190 - .>
    this.keys1["A190"]=".";
    this.keys1["E190"]=">";
    this.keys1["I190"]=".";
    this.keys1["M190"]=">";
    // 191 - /?
    this.keys1["A191"]="/";
    this.keys1["E191"]="?";
    this.keys1["I191"]="/";
    this.keys1["M191"]="?";    
    // 37 - Left Arrow
    this.keys1["A037"]="\x1D";
    this.keys1["E037"]="\x1D";
    this.keys1["I037"]="\x1D";
    this.keys1["M037"]="\x1D";
    // 39 - Right Arrow
    this.keys1["A039"]="\x1C";
    this.keys1["I039"]="\x1C";
    this.keys1["E039"]="\x1C";
    this.keys1["M039"]="\x1C";
    // 38 - Up Arrow
    this.keys1["A038"]="\x1E";
    this.keys1["E038"]="\x1E";
    this.keys1["I038"]="\x1E";
    this.keys1["M038"]="\x1E";
    // 40 - Down Arrow
    this.keys1["A040"]="\x1F";
    this.keys1["E040"]="\x1F";
    this.keys1["I040"]="\x1F";
    this.keys1["M040"]="\x1F";
    // 36 - Home
    this.keys1["A036"]="\x01";
    this.keys1["E036"]="\x01";
    this.keys1["I036"]="\x01";
    this.keys1["M036"]="\x01";
    // 35 - End
    this.keys1["A035"]="\x1A";
    this.keys1["E035"]="\x1A";
    this.keys1["I035"]="\x1A";
    this.keys1["M035"]="\x1A";
    // 32 - SpaceBar
    this.keys1["A032"]=" ";
    this.keys1["C032"]=" ";
    this.keys1["E032"]=" ";
    this.keys1["G032"]=" ";
    this.keys1["I032"]=" ";
    this.keys1["K032"]=" ";
    this.keys1["M032"]=" ";
    this.keys1["O032"]=" ";

    // kill cntrl X - used with menu
    this.keys2["C088"]=undefined;
    this.keys2["G088"]=undefined;
    this.keys2["K088"]=undefined;
    this.keys2["O088"]=undefined;

    // 48 - 0) 
    this.keys2["A048"]="0";
    this.keys2["E048"]=")";
    this.keys2["I048"]="0";
    this.keys2["M048"]=")";
    // 49 - 1!
    this.keys2["A049"]="1";
    this.keys2["E049"]="!";
    this.keys2["I049"]="1";
    this.keys2["M049"]="!";
    // 50 - 2@
    this.keys2["A050"]="2";
    this.keys2["E050"]="@";
    this.keys2["I050"]="2";
    this.keys2["M050"]="@";
    // 51 - 3#
    this.keys2["A051"]="3";
    this.keys2["E051"]="#";
    this.keys2["I051"]="3";
    this.keys2["M051"]="#";
    // 52- 4$
    this.keys2["A052"]="4";
    this.keys2["E052"]="$";
    this.keys2["I052"]="4";
    this.keys2["M052"]="$";
    // 53 - 5%
    this.keys2["A053"]="5";
    this.keys2["E053"]="%";
    this.keys2["I053"]="5";
    this.keys2["M053"]="%";
    // 54 - 6^
    this.keys2["A054"]="6";
    this.keys2["E054"]="^";
    this.keys2["I054"]="6";
    this.keys2["M054"]="^";
    // 55 - 7&
    this.keys2["A055"]="7";
    this.keys2["E055"]="&";
    this.keys2["I055"]="7";
    this.keys2["M055"]="&";
    // 56 - 8*
    this.keys2["A056"]="8";
    this.keys2["E056"]="*";
    this.keys2["I056"]="8";
    this.keys2["M056"]="*";
    // 57 - 9(
    this.keys2["A057"]="9";
    this.keys2["E057"]="(";
    this.keys2["I057"]="9";
    this.keys2["M057"]="(";
    // 192 - `~
    this.keys2["A192"]="`";
    this.keys2["E192"]="~";
    this.keys2["I192"]="`";
    this.keys2["M192"]="~";
    // 189 - -_
    this.keys2["A189"]="-";
    this.keys2["E189"]="_";
    this.keys2["I189"]="-";
    this.keys2["M189"]="_";
    // 187 - =+
    this.keys2["A187"]="=";
    this.keys2["E187"]="+";
    this.keys2["I187"]="=";
    this.keys2["M187"]="+";
    // 8 - Backspace
    this.keys2["A008"]="\b";
    this.keys2["E008"]="\b";
    this.keys2["I008"]="\b";    
    this.keys2["M008"]="\b";    
    // 45 - Insert
    this.keys2["A045"]="\x05";
    this.keys2["E045"]="\x05";
    this.keys2["I045"]="\x05";
    this.keys2["M045"]="\x05";
    // 46 - Delete
    this.keys2["A046"]="\x7F";
    this.keys2["E046"]="\x7F";
    this.keys2["I046"]="\x7F";
    this.keys2["M046"]="\x7F";
    // 219 - [{
    this.keys2["A219"]="[";
    this.keys2["E219"]="{";
    this.keys2["I219"]="[";
    this.keys2["M219"]="{";
    // 221 - ]}
    this.keys2["A221"]="]";
    this.keys2["E221"]="}";
    this.keys2["I221"]="]";
    this.keys2["M221"]="}";
    // 220 - \|
    this.keys2["A220"]="\\";
    this.keys2["E220"]="|";
    this.keys2["I220"]="\\";
    this.keys2["M220"]="|";
    // 186 - ;:
    this.keys2["A186"]=";";
    this.keys2["E186"]=":";
    this.keys2["I186"]=";";
    this.keys2["M186"]=":";
    // 222 - '"
    this.keys2["A222"]="'";
    this.keys2["E222"]='"';
    this.keys2["I222"]="'";
    this.keys2["M222"]='"';
    // 13 - Enter(keyboard and num pad)
    this.keys2["A013"]="\r";
    this.keys2["C013"]="\r";
    this.keys2["E013"]="\r";
    this.keys2["G013"]="\r";
    this.keys2["I013"]="\r";
    this.keys2["K013"]="\r";
    this.keys2["M013"]="\r";
    this.keys2["O013"]="\r";
    // 188 - ,<
    this.keys2["A188"]=",";
    this.keys2["E188"]="<";
    this.keys2["I188"]=",";    
    this.keys2["M188"]="<";    
    // 190 - .>
    this.keys2["A190"]=".";
    this.keys2["E190"]=">";
    this.keys2["I190"]=".";
    this.keys2["M190"]=">";
    // 191 - /?
    this.keys2["A191"]="/";
    this.keys2["E191"]="?";
    this.keys2["I191"]="/";
    this.keys2["M191"]="?";    
    // 37 - Left Arrow
    this.keys2["A037"]="\x1BOD";
    this.keys2["C037"]="\x1BOD";
    this.keys2["E037"]="\x1BOD";
    this.keys2["G037"]="\x1BOD";
    this.keys2["I037"]="\x1BOD";
    this.keys2["K037"]="\x1BOD";
    this.keys2["M037"]="\x1BOD";
    this.keys2["O037"]="\x1BOD";
    // 39 - Right Arrow
    this.keys2["A039"]="\x1BOC";
    this.keys2["C039"]="\x1BOC";
    this.keys2["E039"]="\x1BOC";
    this.keys2["G039"]="\x1BOC";
    this.keys2["I039"]="\x1BOC";
    this.keys2["K039"]="\x1BOC";
    this.keys2["M039"]="\x1BOC";
    this.keys2["O039"]="\x1BOC";
    // 38 - Up Arrow
    this.keys2["A038"]="\x1BOA";
    this.keys2["C038"]="\x1BOA";
    this.keys2["E038"]="\x1BOA";
    this.keys2["G038"]="\x1BOA";
    this.keys2["I038"]="\x1BOA";
    this.keys2["K038"]="\x1BOA";
    this.keys2["M038"]="\x1BOA";
    this.keys2["O038"]="\x1BOA";
    // 40 - Down Arrow
    this.keys2["A040"]="\x1BOB";
    this.keys2["C040"]="\x1BOB";
    this.keys2["E040"]="\x1BOB";
    this.keys2["G040"]="\x1BOB";
    this.keys2["I040"]="\x1BOB";
    this.keys2["K040"]="\x1BOB";
    this.keys2["M040"]="\x1BOB";
    this.keys2["O040"]="\x1BOB";
    // 36 - Home
    this.keys2["A036"]="\x1BOq";
    this.keys2["E036"]="\x1BOq";
    this.keys2["I036"]="\x1BOq";
    this.keys2["M036"]="\x1BOq";
    // 35 - End
    this.keys2["A035"]="\x1BOp";
    this.keys2["E035"]="\x1BOp";
    this.keys2["I035"]="\x1BOp";
    this.keys2["M035"]="\x1BOp";
    // 33 - Page Up
    this.keys2["A033"]="\x1BOs";
    this.keys2["E033"]="\x1BOs";
    this.keys2["I033"]="\x1BOs";
    this.keys2["M033"]="\x1BOs";
    // 34 - Page Down
    this.keys2["A034"]="\x1BOn";
    this.keys2["E034"]="\x1BOn";
    this.keys2["I034"]="\x1BOn";
    this.keys2["M034"]="\x1BOn";
    // 9 -Tab
    this.keys2["A009"]="\x09";
    this.keys2["E009"]="\x09";
    this.keys2["I009"]="\x09";
    this.keys2["M009"]="\x09";
    // 12 - Num lock Off 5
    this.keys2["A012"]="\x1BOr";
    this.keys2["E012"]="\x1BOr";
    this.keys2["I012"]="\x1BOr";
    this.keys2["M012"]="\x1BOr";
    // 96 0-with Numlock
    this.keys2["A096"]="0";
    this.keys2["E096"]="0";
    this.keys2["I096"]="0";
    this.keys2["M096"]="0";
    // 97 1-with Numlock
    this.keys2["A097"]="1";
    this.keys2["E097"]="1";
    this.keys2["I097"]="1";
    this.keys2["M097"]="1";
    // 98 2-with Numlock
    this.keys2["A098"]="2";
    this.keys2["E098"]="2";
    this.keys2["I098"]="2";
    this.keys2["M098"]="2";
    // 99 3-with Numlock
    this.keys2["A099"]="3";
    this.keys2["E099"]="3";
    this.keys2["I099"]="3";
    this.keys2["M099"]="3";
    // 100 4-with Numlock
    this.keys2["A100"]="4";
    this.keys2["E100"]="4";
    this.keys2["I100"]="4";
    this.keys2["M100"]="4";
    // 101 5-with Numlock
    this.keys2["A101"]="5";
    this.keys2["E101"]="5";
    this.keys2["I101"]="5";
    this.keys2["M101"]="5";
    // 102 6-with Numlock
    this.keys2["A102"]="6";
    this.keys2["E102"]="6";
    this.keys2["I102"]="6";
    this.keys2["M102"]="6";
    // 103 7-with Numlock
    this.keys2["A103"]="7";
    this.keys2["E103"]="7";
    this.keys2["I103"]="7";
    this.keys2["M103"]="7";
    // 104 8-with Numlock
    this.keys2["A104"]="8";
    this.keys2["E104"]="8";
    this.keys2["I104"]="8";
    this.keys2["M104"]="8";
    // 105 9-with Numlock
    this.keys2["A105"]="9";
    this.keys2["E105"]="9";
    this.keys2["I105"]="9";
    this.keys2["M105"]="9";
    // 111 / - on the numpad
    this.keys2["A111"]="/";
    this.keys2["E111"]="/";
    this.keys2["I111"]="/";
    this.keys2["M111"]="/";
    // 106 * - on the numpad
    this.keys2["A106"]="*";
    this.keys2["E106"]="*";
    this.keys2["I106"]="*";
    this.keys2["M106"]="*";
    // 109 - - on the numpad
    this.keys2["A109"]="-";
    this.keys2["E109"]="-";
    this.keys2["I109"]="-";
    this.keys2["M109"]="-";
    // 107 + - on the numpad
    this.keys2["A107"]="+";
    this.keys2["E107"]="+";
    this.keys2["I107"]="+";
    this.keys2["M107"]="+";
    // 112 F1
    this.keys2["A112"]="\x1BOP";
    this.keys2["E112"]="\x1BOP";
    this.keys2["I112"]="\x1BOP";
    this.keys2["M112"]="\x1BOP";
    // 113 F2
    this.keys2["A113"]="\x1BOQ";
    this.keys2["E113"]="\x1BOQ";
    this.keys2["I113"]="\x1BOQ";
    this.keys2["M113"]="\x1BOQ";
    // 114 F3
    this.keys2["A114"]="\x1BOR";
    this.keys2["E114"]="\x1BOR";
    this.keys2["I114"]="\x1BOR";
    this.keys2["M114"]="\x1BOR";
    // 115 F4
    this.keys2["A115"]="\x1BOS";
    this.keys2["E115"]="\x1BOS";
    this.keys2["I115"]="\x1BOS";
    this.keys2["M115"]="\x1BOS";
    // 116 F5
    this.keys2["A116"]="\x1BOt";
    this.keys2["E116"]="\x1BOt";
    this.keys2["I116"]="\x1BOt";
    this.keys2["M116"]="\x1BOt";
    // 117 F6
    this.keys2["A117"]="\x1BOu";
    this.keys2["E117"]="\x1BOu";
    this.keys2["I117"]="\x1BOu";
    this.keys2["M117"]="\x1BOu";
    // 118 F7
    this.keys2["A118"]="\x1BOv";
    this.keys2["E118"]="\x1BOv";
    this.keys2["I118"]="\x1BOv";
    this.keys2["M118"]="\x1BOv";
    // 119 F8
    this.keys2["A119"]="\x1BOl";
    this.keys2["E119"]="\x1BOl";
    this.keys2["I119"]="\x1BOl";
    this.keys2["M119"]="\x1BOl";
    // 120 F9
    this.keys2["A120"]="\x1BOw";
    this.keys2["E120"]="\x1BOw";
    this.keys2["I120"]="\x1BOw";
    this.keys2["M120"]="\x1BOw";
    // 121 F10
    this.keys2["A121"]="\x1BOx";
    this.keys2["E121"]="\x1BOx";
    this.keys2["I121"]="\x1BOx";
    this.keys2["M121"]="\x1BOx";
    // 122 F11
    // 123 F12
    // 32 - SpaceBar
    this.keys2["A032"]=" ";
    this.keys2["C032"]=" ";
    this.keys2["E032"]=" ";
    this.keys2["G032"]=" ";
    this.keys2["I032"]=" ";
    this.keys2["K032"]=" ";
    this.keys2["M032"]=" ";
    this.keys2["O032"]=" ";

    //xterm

    // kill cntrl X - used with menu
    this.keys3["C088"]=undefined;
    this.keys3["G088"]=undefined;
    this.keys3["K088"]=undefined;
    this.keys3["O088"]=undefined;

    // 48 - 0) 
    this.keys3["A048"]="0";
    this.keys3["E048"]=")";
    this.keys3["I048"]="0";
    this.keys3["M048"]=")";
    // 49 - 1!
    this.keys3["A049"]="1";
    this.keys3["E049"]="!";
    this.keys3["I049"]="1";
    this.keys3["M049"]="!";
    // 50 - 2@
    this.keys3["A050"]="2";
    this.keys3["E050"]="@";
    this.keys3["I050"]="2";
    this.keys3["M050"]="@";
    // 51 - 3#
    this.keys3["A051"]="3";
    this.keys3["E051"]="#";
    this.keys3["I051"]="3";
    this.keys3["M051"]="#";
    // 52- 4$
    this.keys3["A052"]="4";
    this.keys3["E052"]="$";
    this.keys3["I052"]="4";
    this.keys3["M052"]="$";
    // 53 - 5%
    this.keys3["A053"]="5";
    this.keys3["E053"]="%";
    this.keys3["I053"]="5";
    this.keys3["M053"]="%";
    // 54 - 6^
    this.keys3["A054"]="6";
    this.keys3["E054"]="^";
    this.keys3["I054"]="6";
    this.keys3["M054"]="^";
    // 55 - 7&
    this.keys3["A055"]="7";
    this.keys3["E055"]="&";
    this.keys3["I055"]="7";
    this.keys3["M055"]="&";
    // 56 - 8*
    this.keys3["A056"]="8";
    this.keys3["E056"]="*";
    this.keys3["I056"]="8";
    this.keys3["M056"]="*";
    // 57 - 9(
    this.keys3["A057"]="9";
    this.keys3["E057"]="(";
    this.keys3["I057"]="9";
    this.keys3["M057"]="(";
    // 192 - `~
    this.keys3["A192"]="`";
    this.keys3["E192"]="~";
    this.keys3["I192"]="`";
    this.keys3["M192"]="~";
    // 189 - -_
    this.keys3["A189"]="-";
    this.keys3["E189"]="_";
    this.keys3["I189"]="-";
    this.keys3["M189"]="_";
    // 187 - =+
    this.keys3["A187"]="=";
    this.keys3["E187"]="+";
    this.keys3["I187"]="=";
    this.keys3["M187"]="+";
    // 8 - Backspace
    this.keys3["A008"]="\x7F";
    this.keys3["E008"]="\x7F";
    this.keys3["I008"]="\x7F";    
    this.keys3["M008"]="\x7F";    
    // 45 - Insert
    this.keys3["A045"]="\x05";
    this.keys3["E045"]="\x05";
    this.keys3["I045"]="\x05";
    this.keys3["M045"]="\x05";
    // 46 - Delete
    this.keys3["A046"]="\x7F";
    this.keys3["E046"]="\x7F";
    this.keys3["I046"]="\x7F";
    this.keys3["M046"]="\x7F";
    // 219 - [{
    this.keys3["A219"]="[";
    this.keys3["E219"]="{";
    this.keys3["I219"]="[";
    this.keys3["M219"]="{";
    // 221 - ]}
    this.keys3["A221"]="]";
    this.keys3["E221"]="}";
    this.keys3["I221"]="]";
    this.keys3["M221"]="}";
    // 220 - \|
    this.keys3["A220"]="\\";
    this.keys3["E220"]="|";
    this.keys3["I220"]="\\";
    this.keys3["M220"]="|";
    // 186 - ;:
    this.keys3["A186"]=";";
    this.keys3["E186"]=":";
    this.keys3["I186"]=";";
    this.keys3["M186"]=":";
    // 222 - '"
    this.keys3["A222"]="'";
    this.keys3["E222"]='"';
    this.keys3["I222"]="'";
    this.keys3["M222"]='"';
    // 13 - Enter(keyboard and num pad)
    this.keys3["A013"]="\r";
    this.keys3["C013"]="\r";
    this.keys3["E013"]="\r";
    this.keys3["G013"]="\r";
    this.keys3["I013"]="\r";
    this.keys3["K013"]="\r";
    this.keys3["M013"]="\r";
    this.keys3["O013"]="\r";
    // 188 - ,<
    this.keys3["A188"]=",";
    this.keys3["E188"]="<";
    this.keys3["I188"]=",";    
    this.keys3["M188"]="<";    
    // 190 - .>
    this.keys3["A190"]=".";
    this.keys3["E190"]=">";
    this.keys3["I190"]=".";
    this.keys3["M190"]=">";
    // 191 - /?
    this.keys3["A191"]="/";
    this.keys3["E191"]="?";
    this.keys3["I191"]="/";
    this.keys3["M191"]="?";    
    // 37 - Left Arrow
    this.keys3["A037"]="\x1BOD";
    this.keys3["C037"]="\x1BOD";
    this.keys3["E037"]="\x1BOD";
    this.keys3["G037"]="\x1BOD";
    this.keys3["I037"]="\x1BOD";
    this.keys3["K037"]="\x1BOD";
    this.keys3["M037"]="\x1BOD";
    this.keys3["O037"]="\x1BOD";
    // 39 - Right Arrow
    this.keys3["A039"]="\x1BOC";
    this.keys3["C039"]="\x1BOC";
    this.keys3["E039"]="\x1BOC";
    this.keys3["G039"]="\x1BOC";
    this.keys3["I039"]="\x1BOC";
    this.keys3["K039"]="\x1BOC";
    this.keys3["M039"]="\x1BOC";
    this.keys3["O039"]="\x1BOC";
    // 38 - Up Arrow
    this.keys3["A038"]="\x1BOA";
    this.keys3["C038"]="\x1BOA";
    this.keys3["E038"]="\x1BOA";
    this.keys3["G038"]="\x1BOA";
    this.keys3["I038"]="\x1BOA";
    this.keys3["K038"]="\x1BOA";
    this.keys3["M038"]="\x1BOA";
    this.keys3["O038"]="\x1BOA";
    // 40 - Down Arrow
    this.keys3["A040"]="\x1BOB";
    this.keys3["C040"]="\x1BOB";
    this.keys3["E040"]="\x1BOB";
    this.keys3["G040"]="\x1BOB";
    this.keys3["I040"]="\x1BOB";
    this.keys3["K040"]="\x1BOB";
    this.keys3["M040"]="\x1BOB";
    this.keys3["O040"]="\x1BOB";
    // 36 - Home
    this.keys3["A036"]="\x1BOH";
    this.keys3["E036"]="\x1BOH";
    this.keys3["I036"]="\x1BOH";
    this.keys3["M036"]="\x1BOH";
    // 35 - End
    this.keys3["A035"]="\x1BOF";
    this.keys3["E035"]="\x1BOF";
    this.keys3["I035"]="\x1BOF";
    this.keys3["M035"]="\x1BOF";
    // 33 - Page Up
    this.keys3["A033"]="\x1B5~";
    this.keys3["E033"]="\x1B5~";
    this.keys3["I033"]="\x1B5~";
    this.keys3["M033"]="\x1B5~";
    // 34 - Page Down
    this.keys3["A034"]="\x1B6~";
    this.keys3["E034"]="\x1B6~";
    this.keys3["I034"]="\x1B6~";
    this.keys3["M034"]="\x1B6~";
    // 9 -Tab
    this.keys3["A009"]="\x09";
    this.keys3["E009"]="\x1B[Z"; // back tab
    this.keys3["I009"]="\x09";
    this.keys3["M009"]="\x1B[Z"; // back tab
    // 12 - Num lock Off 5
    this.keys3["A012"]="\x1BOE";
    this.keys3["E012"]="\x1BOE";
    this.keys3["I012"]="\x1BOE";
    this.keys3["M012"]="\x1BOE";
    // 96 0-with Numlock
    this.keys3["A096"]="0";
    this.keys3["E096"]="0";
    this.keys3["I096"]="0";
    this.keys3["M096"]="0";
    // 97 1-with Numlock
    this.keys3["A097"]="1";
    this.keys3["E097"]="1";
    this.keys3["I097"]="1";
    this.keys3["M097"]="1";
    // 98 2-with Numlock
    this.keys3["A098"]="2";
    this.keys3["E098"]="2";
    this.keys3["I098"]="2";
    this.keys3["M098"]="2";
    // 99 3-with Numlock
    this.keys3["A099"]="3";
    this.keys3["E099"]="3";
    this.keys3["I099"]="3";
    this.keys3["M099"]="3";
    // 100 4-with Numlock
    this.keys3["A100"]="4";
    this.keys3["E100"]="4";
    this.keys3["I100"]="4";
    this.keys3["M100"]="4";
    // 101 5-with Numlock
    this.keys3["A101"]="5";
    this.keys3["E101"]="5";
    this.keys3["I101"]="5";
    this.keys3["M101"]="5";
    // 102 6-with Numlock
    this.keys3["A102"]="6";
    this.keys3["E102"]="6";
    this.keys3["I102"]="6";
    this.keys3["M102"]="6";
    // 103 7-with Numlock
    this.keys3["A103"]="7";
    this.keys3["E103"]="7";
    this.keys3["I103"]="7";
    this.keys3["M103"]="7";
    // 104 8-with Numlock
    this.keys3["A104"]="8";
    this.keys3["E104"]="8";
    this.keys3["I104"]="8";
    this.keys3["M104"]="8";
    // 105 9-with Numlock
    this.keys3["A105"]="9";
    this.keys3["E105"]="9";
    this.keys3["I105"]="9";
    this.keys3["M105"]="9";
    // 111 / - on the numpad
    this.keys3["A111"]="/";
    this.keys3["E111"]="/";
    this.keys3["I111"]="/";
    this.keys3["M111"]="/";
    // 106 * - on the numpad
    this.keys3["A106"]="*";
    this.keys3["E106"]="*";
    this.keys3["I106"]="*";
    this.keys3["M106"]="*";
    // 109 - - on the numpad
    this.keys3["A109"]="-";
    this.keys3["E109"]="-";
    this.keys3["I109"]="-";
    this.keys3["M109"]="-";
    // 107 + - on the numpad
    this.keys3["A107"]="+";
    this.keys3["E107"]="+";
    this.keys3["I107"]="+";
    this.keys3["M107"]="+";
    // 112 F1
    this.keys3["A112"]="\x1BOP";
    this.keys3["E112"]="\x1BOP";
    this.keys3["I112"]="\x1BOP";
    this.keys3["M112"]="\x1BOP";
    // 113 F2
    this.keys3["A113"]="\x1BOQ";
    this.keys3["E113"]="\x1BOQ";
    this.keys3["I113"]="\x1BOQ";
    this.keys3["M113"]="\x1BOQ";
    // 114 F3
    this.keys3["A114"]="\x1BOR";
    this.keys3["E114"]="\x1BOR";
    this.keys3["I114"]="\x1BOR";
    this.keys3["M114"]="\x1BOR";
    // 115 F4
    this.keys3["A115"]="\x1BOS";
    this.keys3["E115"]="\x1BOS";
    this.keys3["I115"]="\x1BOS";
    this.keys3["M115"]="\x1BOS";
    // 116 F5
    this.keys3["A116"]="\x1BOt";
    this.keys3["E116"]="\x1BOt";
    this.keys3["I116"]="\x1BOt";
    this.keys3["M116"]="\x1BOt";
    // 117 F6
    this.keys3["A117"]="\x1BOu";
    this.keys3["E117"]="\x1BOu";
    this.keys3["I117"]="\x1BOu";
    this.keys3["M117"]="\x1BOu";
    // 118 F7
    this.keys3["A118"]="\x1BOv";
    this.keys3["E118"]="\x1BOv";
    this.keys3["I118"]="\x1BOv";
    this.keys3["M118"]="\x1BOv";
    // 119 F8
    this.keys3["A119"]="\x1BOl";
    this.keys3["E119"]="\x1BOl";
    this.keys3["I119"]="\x1BOl";
    this.keys3["M119"]="\x1BOl";
    // 120 F9
    this.keys3["A120"]="\x1BOw";
    this.keys3["E120"]="\x1BOw";
    this.keys3["I120"]="\x1BOw";
    this.keys3["M120"]="\x1BOw";
    // 121 F10
    this.keys3["A121"]="\x1BOx";
    this.keys3["E121"]="\x1BOx";
    this.keys3["I121"]="\x1BOx";
    this.keys3["M121"]="\x1BOx";
    // 122 F11
    // 123 F12
    // 32 - SpaceBar
    this.keys3["A032"]=" ";
    this.keys3["C032"]=" ";
    this.keys3["E032"]=" ";
    this.keys3["G032"]=" ";
    this.keys3["I032"]=" ";
    this.keys3["K032"]=" ";
    this.keys3["M032"]=" ";
    this.keys3["O032"]=" ";


    return;
}

function DocumentLoaded()
{
    let cwin=T_G.bw.windows[T_G.bw.cw];
    cwin.html_doc_loaded=true;
}

function window_info()
{
    let s;
    let sx;
    let cwin;
    
    cwin=T_G.bw.windows[T_G.bw.cw];
    if (cwin.html_mode) {
        s="WEB";
    }
    else {
        s="CONSOLE";
    }
    w=T_G.bw.topw;
    sx=w.screen;
    s=s+","+w.screenX;
    s=s+","+w.screenY;
    s=s+","+w.outerWidth;
    s=s+","+w.outerHeight;
    s=s+","+(sx.width-sx.availWidth);
    s=s+","+(sx.height-sx.availHeight);
    s=s+","+sx.availWidth;
    s=s+","+sx.availHeight;
    s=s+","+this.fs_width[this.fs];
    s=s+","+this.fs_height[this.fs];
    s=s+","+this.win0_cols;
    s=s+","+this.win0_rows;
    s=s+"\r";
    this.load_rbuf(s); //this wipes unread data ('CI')
}

function webview_on()
{
    let cwin;
    cwin=T_G.bw.windows[T_G.bw.cw];
    if (cwin.window_name == "_win0" ) {
        this.sm32_error = this.e_invalid_mnemonic;
        return;    
    }
    cwin.html_mode=true;
    cwin.e.onload=T_G.pu.DocumentLoaded;
    this.save_h=-1;
    this.Resize();
    this.gui.data_ready=false;
    this.gui.data=null;
}

function webview_off()
{
    var cwin;

    cwin=T_G.bw.windows[T_G.bw.cw];
    cwin.html_mode=false;
    cwin.html_doc_loaded=false;
    cwin.w.onload=undefined;
    this.save_h=-1;
    this.Resize();
    this.gui.data_ready=false;
    this.gui.data=null;
    cwin.restore_window();
}

function SetFontSizes()
{
    var e,s,r;
    
    s='<span ID="test_char" style="font-family: monospace; font-size: 6PX;">X</span>';
    T_G.real_topw.document.write(s);
    for (i=6;i != 31;++i) {
        e=T_G.real_topw.document.getElementById("test_char");
        s='<span ID="test_char" style="font-family: monospace; font-size: '+i+'PX;">X</span>';
        e.outerHTML=s;
        e=T_G.real_topw.document.getElementById("test_char");
        r=e.getBoundingClientRect();
        this.fs_width[i]=r.width;
        this.fs_height[i]=r.height
    }
    e=T_G.real_topw.document.getElementById("test_char");
    e.remove();
}


function do_rm(t2str,tstr)
{
    let cwin,i;

    T_G.bw.cw=0;
    for (i=1; i != this.max_windows; ++i) {
        if (T_G.bw.windows[i] != null) {
            drop(i);
        }
    }
    cwin=T_G.bw.windows[0];
    T_G.bw.m.menu("show","","","","",0);
    this.status_off();
    this.webview_off();
    cwin.bc_rgb=t2str;
    cwin.fc_rgb=tstr;
    cwin.def_bc_rgb=t2str;
    cwin.def_fc_rgb=tstr;
    cwin.high_intensity=true;
    cwin.reverse_video=false;
    cwin.bbx_underline=false;
    cwin.blink=false;
    cwin.graphics=false;
            
    cwin.scroll_off=false;
    cwin.origin_mode=false;
    cwin.wrap_off=false;
    cwin.protect_on=false; 
    this.chan_flag = this.echo | this.gen_29;
    this.do_resize(this.def_win0_cols,this.def_win0_rows);
}
        
function do_resize(cols,rows)
{

    if (T_G.bw.cw !=0 ) {
        this.sm32_error = this.e_invalid_mnemonic;
        return;
    }
    let cwin=T_G.bw.windows[0];
    if (cwin.nw != -1) {
        this.sm32_error = this.e_invalid_mnemonic;
        return;
    }
    if (cols < 20 || rows < 4 || cols > 300 || rows > 100) {
        this.sm32_error = this.e_invalid_mnemonic;
        return;
    }
    this.win0_cols=cols;
    this.win0_row=rows;
    cwin.s_cols=cols;
    cwin.s_rows=rows;
    cwin.cs();
    this.Resize(); 
}

function Resize()
{
    var i,cwin,t,cflag;
    
    var h=T_G.bw.topBody.scrollHeight;
    var w=T_G.bw.topBody.scrollWidth;

    if (this.save_h == h && this.save_w == w) return; // another window already called
    cwin=T_G.bw.windows[T_G.bw.cw];
    this.save_h=h;
    this.save_w=w;
    if (T_G.bw.status_w != null) {
        t=h-this.status_h;
        T_G.bw.status_e.style.top=""+t+"PX";
        T_G.bw.status_e.style.left=""+0+"PX";
    }
    cflag=cwin.caret_row;
    if (cflag != -1) { // in middle of a read
        cwin.caret_off();
    }    
    for( i=0; i != this.max_windows; ++i) {
        cwin=T_G.bw.windows[i];
        if (cwin != null) {
            cwin.WinResize();
        }
    }
    cwin=T_G.bw.windows[T_G.bw.cw];
    if (cflag != -1) { // in middle of a read
        cwin.caret_on();
    }    
}

function status_on()
{
    if (T_G.bw.status_w !=null)return; // status line already on
    
    var t=T_G.bw.topBody.scrollHeight-this.status_h;
    var sx ='<iframe frameborder="0" id="_status_win" style="width: 100%'+
        '; height: '+this.status_h+'PX; left: 0 '+
         '; display: block; position: fixed; top: '+t+'PX; " SRC="about:blank"></iframe>'
    T_G.bw.topw.document.write(sx);
    T_G.bw.status_e = T_G.bw.topw.document.getElementById("_status_win");
    T_G.bw.status_w = T_G.bw.status_e.contentWindow;
    T_G.bw.status_w.document.write("<head>");
    T_G.bw.status_w.document.write("<style>");
    T_G.bw.status_w.document.write("</style>");
    T_G.bw.status_w.document.write("</head>");

    s='<body onresize="top.T_G.pu.Resize();" STYLE="overflow: hidden; font-size: '
        +this.status_menu_fs+'px; margin: 3px; background-color:'+this.status_menu_backgr_c+'" >';
    T_G.bw.status_w.document.write(s);
    T_G.bw.status_w.document.write('&nbsp<span ID="status_text">&nbsp</span>');    
    T_G.bw.status_w.document.write("</body>");
    T_G.bw.status_w.document.close();
    T_G.bw.status_e.style.zIndex = "2";
    T_G.bw.status_te=T_G.bw.status_w.document.getElementById("status_text");
    this.save_h=-1;
    this.Resize();
}

function status_off()
{
    if (T_G.bw.status_w == null) return;
    T_G.bw.status_e.remove();
    T_G.bw.status_w=null;
    T_G.bw.status_e=null;
    this.Resize();
}

function status(s)
{
    if (T_G.bw.status_w == null) return;
    if ( s=="") s=this.Ustatus;
    T_G.bw.status_te.innerHTML=s;
}

function read_screen(c,r,lc,lr)
{
    var x;
    var cwin=T_G.bw.windows[T_G.bw.cw];
    var wd=cwin.wdata;
    
    while (r < lr) {
        while (c < cwin.s_cols) {
            x=wd[r][c].achar.charCodeAt(0,0);
            this.add_rbuf(String.fromCharCode(x & 0x7f));
            ++c;
        }
        c=0;
        ++r;
    }
    // the last row
    while (c <= lc) {
        x=wd[r][c].achar.charCodeAt(0,0);
        this.add_rbuf(String.fromCharCode(x & 0x7f));
        ++c;
    }
    //add cr
    this.add_rbuf(String.fromCharCode(13));
}

function get_color(r,g,b)
{    
    return this.m_get_digitx(r)+this.m_get_digitx(g)+this.m_get_digitx(b);
}

function get_window_number(s)
{
    let i;
    for (i=0; i != this.max_windows; ++i) {
        if (T_G.bw.windows[i] != null) {
            if (T_G.bw.windows[i].window_name == s) {
                return i;
            }
        }
    }
    return -1;
}

/* get mnemonic param force to upper case */
function m_get_str(p)
{
    return this.m_get_str_low(p).toUpperCase();
}

/* get mnemonic param force to preserve case */
function m_get_str_low(p)
{
    var len,s;
    
    if ((len=p.data.charCodeAt(p.pos)) > 250) { /* 0->249 or 250 */
        this.sm32_error = this.e_invalid_mnemonic;
        return "";
    }
    ++p.pos;
    if (len == 250) {
        // 4 byte big endien len
        if (p.pos + 4 > p.dlen1 ) {
            this.sm32_error = this.e_invalid_mnemonic;
            return "";
        }        
        len=p.data.charCodeAt(p.pos)*16777216 +
            p.data.charCodeAt(p.pos+1)*65536 +
            p.data.charCodeAt(p.pos+2)*256 +
            p.data.charCodeAt(p.pos+3);
        p.pos += 4;
    }    
    if (len == 0) return "";
    if (p.pos + len > p.dlen1) {
        this.sm32_error = this.e_invalid_mnemonic;
        return "";
    }
    s=p.data.substr(p.pos,len);
    p.pos += len;
    return s;    
}

function m_get_digitx(x)
{
    var s;
    s=x.toString(16);
    if (s.length == 1) {
        s="0"+s;
    }
    return s;
}

function m_get_int(p)
{    
    var inum,s;
    
    if (p.pos+5 > p.dlen1) { /* at least 5 more chars */
        this.sm32_error = this.e_invalid_mnemonic;
        return 0;
    }
    if ( p.data.charCodeAt(p.pos) == 0xfd ) { 
        /* double */
        alert("No double args allowed in mnemonics");
    } 
    if ( p.data.charCodeAt(p.pos) != 0xfe ) {
        this.sm32_error = this.e_invalid_mnemonic;
        return 0;
    }
    /* integer */
    ++p.pos;
    s = "0x"+this.m_get_digitx(p.data.charCodeAt(p.pos+3)) +
        this.m_get_digitx(p.data.charCodeAt(p.pos+2)) +
        this.m_get_digitx(p.data.charCodeAt(p.pos+1)) +
        this.m_get_digitx(p.data.charCodeAt(p.pos));
    p.pos+=4;
    inum=Number(s);
    if (inum > 2147483647) {
        inum=-(~inum+1);
    }
    return inum;
}

// create mnemonic to look like SM32 mnemonic
function SM32Mnemonic(m)
{
    let s,p,i,m1,o;

    let px=new Pc2Packet("");

    o=m; // save original
    m=this.eat_space(m);
    i=m.search("[^a-zA-Z0-9]")
    if (i == -1) {
        m1=m;
        m="";
    }
    else {
        m1=m.substr(0,i);
        m=m.substr(i);
    }
    if (undefined == this.mnem_tab[m1.toLowerCase()]) {
        console.log("Invalid Mnemonic - "+o)
        return;
    }
    i=m1.length
    if (i == 2) {
        s="\033"+m1;
    }
    else {
        s="\033"+String.fromCharCode(i)+m1;
    }
    if (m != "") {
        // there are parameters
        m=this.eat_space(m);
        while (m.substr(-1) == " ") m=m.substr(0,m.length-1);
        if (m.substr(0,1) != "(" || m.substr(-1,1) != ")") {
            console.log("m = "+m);
            console.log("garbage after mnemonic name - "+o);
            return;
        }
        m=m.substr(1);
        m=m.substr(0,m.length-1);
        m1="";
        px.data=m;
        for (i=0;i!=99;++i) {
            p=this.get_param(px);
            if (p == "\377") {
                console.log("Bad Parameter - "+o);
                return;
            }
            if (p == "")break;
            m1=m1+p;
        }
        if (i ==0) {
            console.log("Empty Param list - "+o);
            return;
        }
        s=s+"\377"+String.fromCharCode(i)+m1;
    }

    /* dummy up a write packet */
    px.type=px.pc2write;
    px.recursive_flag=false;
    px.dlen1 = s.length;
    px.notusedx = 0;
    px.siop = new Object();
    px.siop.chan_flag = this.chan_flag;
    px.siop.siz_eq =0;
    px.siop.len_eq = 0;
    px.siop.tim_eq = 0;
    px.siop.io_flag = 0;
    px.data=s;
    px.pos=0;
    this.sm32_error=0;
    this.Pc3Writex(px);
    if (this.sm32_error != 0) {
        console.log("sm32_error = "+this.sm32_error);
    }
}

function get_param(px)
{
    let c,p,d1,d2,i;

    let m=px.data;
    p="";
    m=this.eat_space(m);
    if (m.length == 0) {
        return "";
    }
    c=m.substr(0,1);
    if (c == "$" || c == '"') {
        // get string param
        while (1) {
            if (c == '$') {
                m=m.substr(1);
                while (m.substr(0,1) != '$') {
                    if (m.length < 3) {
                        console.log("invalid hex string")
                        return "\377";
                    }
                    d1=m.charCodeAt(0)-48;
                    m=m.substr(1);
                    if (d1 > 9) d1=d1-7;
                    d2=m.charCodeAt(0)-48;
                    m=m.substr(1);
                    if (d2 > 9) d2=d2-7;
                    if (d1 < 0 || d2 < 0 || d1 > 15 || d2 > 15) {
                        console.log ("Bad hex digit");
                        return "\377";
                    }
                    p=p+String.fromCharCode(d1*16+d2);
                }
            } 
            else {
                while (1) {
                    if (m.length == 1) {
                        console.log('Missing end " ');
                        return '\377';
                    }
                    m=m.substr(1);
                    if (m.substr(0,1) == '"') {
                        break;
                    }
                    p=p+m.substr(0,1);
                }
            }
            m=m.substr(1); // past $ or "
            m=this.eat_space(m);
            if (m.substr(0,1) != '+') {
                if (p.length > 127) {
                    console.log("String param longer than 127");
                    return "\377";
                }
                p=String.fromCharCode(p.length) + p;
                break; 
            }
            m=m.substr(1);
            m=this.eat_space(m);
            c=m.substr(0,1);
            if (c != '$' && c != '"'){
                console.log("Missing String after + ");
                return "\377";
            }
        }
        //end of stringex
    }
    else {
        // get integer param
        if ( c != '-' & (c < '0' || c > '9')) {
            console.log ("Not String Not a Number ??");
            return '\377';
        }
        do {
            p=p+c;
            m=m.substr(1);
            c=m.substr(0,1);
        } while (c >= '0' && c <='9');
        d1=parseInt(p);
        if (d1 < 0) {
            d1=d1+4294967296; // 32 bit 2's comp
        }
        p="00000000"+d1.toString(16);
        c=p.substr(-8).toUpperCase();
        p="\376";
        for (i=6; i!=-2 ;i=i-2) { //little endian
            d1=c.charCodeAt(i) - 48;
            d2=c.charCodeAt(i+1) - 48;
            if (d1 > 9) d1=d1-7;
            if (d2 > 9) d2=d2-7;
            p=p+String.fromCharCode(16*d1+d2);
        } 
    }
    m=this.eat_space(m);
    if (m.substr(0,1) == ',') m=m.substr(1);
    px.data=m; // only pass back on no error
    return p;
}

function eat_space(m)
{
    while (m.length != 0) {
        if (m.substr(0,1) == " ") {
            m=m.substr(1);
        }
        else {
            return m;
        }
    }
    return m;
}

function get_mnemonic(p)
{
    var achar;
    var mnem=0;
    var save_pos=p.pos;
    if (this.chan_flag & this.output_trans) {
        if ( p.data.charCodeAt(p.pos) == 0x1b ) {
            ++p.pos;
            if (p.pos+2 <= p.dlen1) { /* at least 2 more chars */
                if (p.data.charAt(p.pos) > ' ') {
                    /* 2 character mnemonic */
                    mnem=this.mnem_tab[p.data.substr(p.pos,2).toLowerCase()];
                    p.pos += 2;
                    if (mnem == this.m_eo)return mnem;
                }
            }
            p.pos=save_pos;
        }
        return this.m_reg_char;
    }
    if (p.data.charAt(p.pos) == '\n') {
        ++p.pos
        return this.m_lf;
    }
    if ( p.data.charCodeAt(p.pos) != 0x1b ) {
        return this.m_reg_char;
    }
    ++p.pos;
    if (p.pos+2 > p.dlen1) { /* at least 2 more chars */
        this.sm32_error = this.e_invalid_mnemonic;
        return 0;
    }
    if (p.data.charCodeAt(p.pos) == 0x40) {    /* at positioning */
        ++p.pos;
        if ((achar=p.data.charAt(p.pos)) == '1') { 
            mnem=this.m_single_at;
        }
        else {
            if (achar != '2') {
                this.sm32_error = this.e_invalid_mnemonic;
                return 0;
            }
            mnem=this.m_double_at;
        }
        ++p.pos;
        return mnem;
    }
    if (p.data.charAt(p.pos) > ' ') {
        /* 2 character mnemonic */
        mnem=this.mnem_tab[p.data.substr(p.pos,2).toLowerCase()];
        p.pos += 2;
        return mnem;
    }
    var len=p.data.charCodeAt(p.pos);
    ++p.pos;
    if (p.pos+len > p.dlen1) { /* at least len more chars */
        this.sm32_error = this.e_invalid_mnemonic;
        return 0;
    }
    mnem=this.mnem_tab[p.data.substr(p.pos,len).toLowerCase()];
    p.pos += len;
    return mnem;    
}

function Pc3Write(p)
{
    this.sm32_error=0;
    if (this.sm32_mode) {
        this.chan_flag=p.siop.chan_flag;
    }
    if (p.siop.io_flag & this.gui_flag != 0) {
        if (this.HTMLWrite(p) == false) {
            return; 
        }
    }
    else {
        p.pos=0;
        if (p.dlen1 != p.data.length) {
            alert ("Write Packet dlen1="+p.dlen1+" and data.length="+p.data.length);
        }
        else {
            p.recursive_flag=false;
            if (this.sm32_mode) {
                this.Pc3Writex(p);
            }
            else {
                this.XtermWrite(p);
            }
        }
    }
    this.SendWriteRes();    
}

function SendWriteRes()
{
    p=new Pc2Packet("");
    p.type=p.pc2writeres;
    p.chan_flag=this.chan_flag;
    p.sm32_error=this.sm32_error;
    p_serial(p);
    this.sm32_error=0;
}

function XtWrite(s)
{
    /* test Xterm capabilities not used by SM32 */
    /* dummpy up a write packet */
    p=new Pc2Packet("");
    p.type=p.pc2write;
    p.dlen1 = s.length;
    p.notusedx = 0;
    p.siop = new Object();
    p.siop.chan_flag = this.chan_flag;
    p.siop.siz_eq =0;
    p.siop.len_eq = 0;
    p.siop.tim_eq = 0;
    p.siop.io_flag = 0;
    p.data=s;
    p.pos=0;
    this.sm32_mode=false;
    this.XtState=0;
    this.XtermWrite(p); // any keyboard input could be a problem
    this.sm32_mode=true;
}

/* this is called from 'box' to set the attrib */
function RecursiveWritex(s)
{
    /* dummpy up a write packet */
    p=new Pc2Packet("");
    p.type=p.pc2write;
    p.recursive_flag=true; // don't allow a window/box mnemonic
    p.dlen1 = s.length;
    p.notusedx = 0;
    p.siop = new Object();
    p.siop.chan_flag = this.chan_flag;
    p.siop.siz_eq =0;
    p.siop.len_eq = 0;
    p.siop.tim_eq = 0;
    p.siop.io_flag = 0;
    p.data=s;
    p.pos=0;
    this.Pc3Writex(p);
}

function Pc3Writex(p)
{    
    let col,row,cols,rows;
    let nstr="";
    let nstr_len=0;
    let tstr="";
    let tstr_len=0;
    let t2str="";
    let achar="";
    let c_red,c_green,c_blue;
    let i,j,c2;
    
    let cwin=T_G.bw.windows[T_G.bw.cw];
    while (p.pos != p.dlen1) {
        mnem=this.get_mnemonic(p);
        if (this.sm32_error != 0) return;
        if (mnem == undefined) {
            this.sm32_error = this.e_invalid_mnemonic;
            return;
        }
            
        switch (mnem) {

        case this.m_menuon:
            this.menuon=true;
            break;

        case this.m_menuoff:
            this.menuon=false;
            break;

        case this.m_xt:
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 1 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            nstr=this.m_get_str_low(p);
            this.XtWrite(nstr);
            break;

        case this.m_lf:                            
            cwin.col = 0;
            cwin.inc_row(); 
            break;

        case this.m_single_at: 
            col=p.data.charCodeAt(p.pos);
            ++p.pos;
            if (col < cwin.col) {
                while (col != cwin.col) {
                    cwin.back_cursor();
                }
            }
            else {
                col=col - cwin.col;
                while (col !=0) {
                    cwin.echo_char(" ");
                    --col;
                }
            }
            break;
            
        case this.m_double_at: 
            col=p.data.charCodeAt(p.pos);
            ++p.pos;
            row=p.data.charCodeAt(p.pos);
            ++p.pos;
            if (col >= cwin.s_cols || row >= cwin.s_rows){
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            cwin.col=col;
            cwin.row=row;                
            break;
            
        case this.m_bb:
            if (p.pos == p.dlen1 || p.data.charCodeAt(p.pos) != 0xff) {
                // no arguments
                cwin.blink=true;
            break;    
            }
            if (p.pos == p.dlen1) { /* has to have 3 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos
            if (p.pos == p.dlen1) { /* has to have 3 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 3 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            // get red
            c_red=this.m_get_int(p) & 255;
            if(this.sm32_error != 0) return;
            // get green
            c_green=this.m_get_int(p) & 255;
            if(this.sm32_error != 0) return;
            // get blue
            c_blue=this.m_get_int(p) & 255;
            if(this.sm32_error != 0) return;
            cwin.bb_Color=this.get_color(c_red,c_green,c_blue);
            break;
            
        case this.m_bc:
            cwin.back_cursor();
            break;
    
        case this.m_bs:
            if ( cwin.col != 0) {
                cwin.back_space();
            }
            break;
    
        case this.m_be:
            this.chan_flag |= this.echo;
            break;
    
        case this.m_bg:
            this.chan_flag |= this.gen_29;
            break;
    
        case this.m_bi:
            this.chan_flag |= this.input_trans;
            break;
            
        case this.m_bo:
            this.chan_flag |= this.output_trans;
            break;
                
        case this.m_br:                
            if (p.pos == p.dlen1 || p.data.charCodeAt(p.pos) != 0xff) {
                // no arguments
                cwin.reverse_video=true;
            break;    
            }
            if (p.pos == p.dlen1) { /* has to have 1 or 3 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            if (p.pos == p.dlen1) { /* has to have 1 or 3 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) == 1 ) {
                ++p.pos;
                c_red=this.m_get_int(p); // don't char what it is
                cwin.br_use_Color=false;
                break;
            }            
            if ( p.data.charCodeAt(p.pos) != 3 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            // get red
            c_red=this.m_get_int(p) & 255;
            if(this.sm32_error != 0) return;
            // get green
            c_green=this.m_get_int(p) & 255;
            if(this.sm32_error != 0) return;
            // get blue
            c_blue=this.m_get_int(p) & 255;
            if(this.sm32_error != 0) return;
            cwin.br_Color=this.get_color(c_red,c_green,c_blue);
            cwin.br_use_Color=true;
            break;
    
        case this.m_bu:
            if (p.pos == p.dlen1 || p.data.charCodeAt(p.pos) != 0xff) {
                // no arguments
                cwin.bbx_underline=true;
            break;    
            }
            if (p.pos == p.dlen1) { /* has to have 1 or 3 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            if (p.pos == p.dlen1) { /* has to have 1 or 3 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) == 1 ) {
                ++p.pos;
                c_red=this.m_get_int(p); // don't char what it is
                cwin.bu_use_Color=false;
                break;
            }            
            if ( p.data.charCodeAt(p.pos) != 3 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            // get red
            c_red=this.m_get_int(p) & 255;
            if(this.sm32_error != 0) return;
            // get green
            c_green=this.m_get_int(p) & 255;
            if(this.sm32_error != 0) return;
            // get blue
            c_blue=this.m_get_int(p) & 255;
            if(this.sm32_error != 0) return;
            cwin.bu_Color=this.get_color(c_red,c_green,c_blue);
            cwin.bu_use_Color=true;
            break;
    
        case this.m_ce:
            cwin.ce();
            break;

        case this.m_cu:
            cwin.cux();
            break;

        case this.m_cf:
            cwin.cfx();
            break;

        case this.m_ch:
            cwin.col=0;
            cwin.row=0;
            break;
    
        case this.m_cl:
            cwin.clear_line(0);
            break;
            
        case this.m_cr:
            cwin.col=0;
            break;
    
        case this.m_cs:
            cwin.cs();
            break;
            
        case this.m_dc:
/* DC **********************************************************
            dc(ei);
            goto set_default;
***************************************************************/
            break;
    
        case this.m_dn:
            cwin.inc_row();
            break;
    
        case this.m_eb:
            cwin.blink=false;
            break;
    
        case this.m_ee:
            this.chan_flag &= ~this.echo;
            break;
    
        case this.m_eg:
            this.chan &= ~this.gen_29;
            break;
    
        case this.m_ei:
            this.chan_flag &= ~this.input_trans;
            break;
    
        case this.m_eo:
            this.chan_flag &= ~this.output_trans;
            break;
    
        case this.m_er:
            cwin.reverse_video=false;
            break;
    
        case this.m_es:
            cwin.echo_char('\u001b');
            break;
    
        case this.m_eu:
            cwin.bbx_underline=false;
            break;
    
        case this.m_gs:
            cwin.graphics=true;
            break;
    
        case this.m_ge:
            cwin.graphics=false;
            break;
    
        case this.m_ic:
/* IC **********************************************************
            ic(ei);
            goto set_default;
****************************************************************/
            break;
        case this.m_lc:
            this.chan_flag &= ~this.low_to_up;
            break;
    
        case this.m_ld:
            cwin.ld(cwin.row);
            break
            
        case this.m_li:
            cwin.li(cwin.row);
            break
    
        case this.m_pe:
            cwin.protect_on=false;
            break;
    
        case this.m_ps:
            cwin.protect_on=true;
            break;
    
        case this.m_rb:
            if (p.pos != p.dlen1 && p.data.charCodeAt(p.pos) == 0xff) {
                ++p.pos
                if (p.pos == p.dlen1) { /* has to have 1 argument */
                    this.sm32_error = this.e_invalid_mnemonic;
                    return;
                }
                if ( p.data.charCodeAt(p.pos) != 1 ) {
                    this.sm32_error = this.e_invalid_mnemonic;
                    return;
                }
                ++p.pos;
                c_red=this.m_get_int(p);
                if(this.sm32_error != 0) return;
                this.bell_type=c_red;
            }
            else {
                T_G.bell.play();
            }
            
            break;
    
        case this.m_rm:
            if (p.pos == p.dlen1 || p.data.charCodeAt(p.pos) != 0xff) {    
                tstr=this.fgcolor; //initial fg color 
                t2str=this.bgcolor; //initial bg color
            }
            else {    
                if (p.pos == p.dlen1) { /* has to have 6 arguments */
                    this.sm32_error = this.e_invalid_mnemonic;
                    return;
                }
                if ( p.data.charCodeAt(p.pos) != 0xff ) {
                    this.sm32_error = this.e_invalid_mnemonic;
                    return;
                }
                ++p.pos
                if (p.pos == p.dlen1) { /* has to have 6 arguments */
                    this.sm32_error = this.e_invalid_mnemonic;
                    return;
                }
                if ( p.data.charCodeAt(p.pos) != 6 ) {
                    this.sm32_error = this.e_invalid_mnemonic;
                    return;
                }
                ++p.pos;
                // get fg red
                c_red=this.m_get_int(p) & 255;
                if(this.sm32_error != 0) return;
                // get fg green
                c_green=this.m_get_int(p) & 255;
                if(this.sm32_error != 0) return;
                // get fg blue
                c_blue=this.m_get_int(p) & 255;
                if(this.sm32_error != 0) return;
                
                tstr=this.get_color(c_red,c_green,c_blue);

                // get bg red
                c_red=this.m_get_int(p) & 255;
                if(this.sm32_error != 0) return;
                // get bg green
                c_green=this.m_get_int(p) & 255;
                if(this.sm32_error != 0) return;
                // get bg blue
                c_blue=this.m_get_int(p) & 255;
                if(this.sm32_error != 0) return;
                
                t2str=this.get_color(c_red,c_green,c_blue);                
            }        
            this.do_rm(t2str,tstr);
            break;
    
        case this.m_rs:
            cwin.restore_window();
            break;
    
        case this.m_rt:
            cwin.inc_col();
            break;
    
        case this.m_sb:
            if (p.pos == p.dlen1 || p.data.charCodeAt(p.pos) != 0xff) {
                // no arguments
                cwin.high_intensity=false;
            break;    
            }
            if (p.pos == p.dlen1) { /* has to have 1 or 3 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            if (p.pos == p.dlen1) { /* has to have 1 or 3 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) == 1 ) {
                ++p.pos;
                c_red=this.m_get_int(p); // don't char what it is
                cwin.sb_use_Color=false;
                break;
            }            
            if ( p.data.charCodeAt(p.pos) != 3 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            // get red
            c_red=this.m_get_int(p) & 255;
            if(this.sm32_error != 0) return;
            // get green
            c_green=this.m_get_int(p) & 255;
            if(this.sm32_error != 0) return;
            // get blue
            c_blue=this.m_get_int(p) & 255;
            if(this.sm32_error != 0) return;
            cwin.sb_Color=this.get_color(c_red,c_green,c_blue);
            cwin.sb_use_Color=true;
            break;
    
        case this.m_sf:
            cwin.high_intensity=true;
            break;
            
        case this.m_uc:
            this.chan_flag |= this.low_to_up;            
            break;

        case this.m_up:
        case this.m_vt:
            if (cwin.row == 0) {
                cwin.row=cwin.s_rows-1;
            }
            else {
                --cwin.row;
            }
            break;
    
        case this.m_attr:
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 1 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            /* has to ON.OFF*/
            ++p.pos;
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            nstr=this.m_get_str(p);
            if (nstr.length != 1) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            i=nstr.charCodeAt(0);
            if (i & 1) {
                cwin.high_intensity=true;
            }
            else {
                cwin.high_intensity=false;
            }
            if (i & 2) {
                cwin.reverse_video=true;
            }
            else {
                cwin.reverse_video=false;
            }
            if (i & 4) {
                cwin.bbx_underline=true;
            }
            else {
                cwin.bbx_underline=false;
            }
            if (i & 8) {
                cwin.blink=true;
            }
            else {
                cwin.blink=false;
            }
            if (i & 32) {
                cwin.graphics=true;
            }
            else {
                cwin.graphics=false;
            }
            
            
            break;
    
        case this.m_backgr:
            cwin.bcolor_flag=true;
            break;
    
        case this.m_black:
            tstr=this.get_color(0,0,0);
            if (cwin.bcolor_flag) {
                cwin.bc_rgb=tstr;
            }
            else {
                cwin.fc_rgb=tstr;
            }
            cwin.bcolor_flag=false;
            break;
    
        case this.m_blue:    
            tstr=this.get_color(0,0,255);
            if (cwin.bcolor_flag) {
                cwin.bc_rgb=tstr;
            }
            else {
                cwin.fc_rgb=tstr;
            }
            cwin.bcolor_flag=false;
            break;
            
        case this.m_box:
            tsrt="";t2str="";
            if (p.pos == p.dlen1) { /* has to have 4->7 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos
            if (p.pos == p.dlen1) { /* has to have 4->7 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            i=p.data.charCodeAt(p.pos);
            if (i < 4 || i > 7 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            // get col
            col=this.m_get_int(p);
            if(this.sm32_error != 0) return;
            // get row
            row=this.m_get_int(p);
            if(this.sm32_error != 0) return;
            // get cols
            cols=this.m_get_int(p);
            if(this.sm32_error != 0) return;
            //get rows
            rows=this.m_get_int(p);
            if(this.sm32_error != 0) return;
            if (i > 4 ) {
                tstr = this.m_get_str_low(p);
            }
            if (i > 5) {
                t2str = this.m_get_str_low(p);
            }
            if (i > 6) {
                this.sm32_error = this.e_invalid_mnemonic;
            }
            if (this.sm32_error != 0) return;
            cwin.box(col,row,cols,rows,tstr,t2str);
            if (this.sm32_error != 0) return;
            break;
            
        case this.m_srpc:
/* set rpc server **********************************************
            i=-1; // if no connection # default to PC
            if (len != 0 && *bp == 0xff){ 
                // there are some options
                ++bp;--len;
                if (len == 0) goto gen29;
                args=*bp;++bp;--len;
                if (args != 1) goto gen29;
                m_get_int(&bp,&len,&i); // connection number
            }
            current_rpc=i;
            return;
****************************************************************/
            break;
            
        case this.m_con:
/* CON nection *************************************************
            i=-1; // if no connection # go back to pc
            if (len != 0 && *bp == 0xff){ // there are some options
                ++bp;--len;
                if (len == 0) {
                    goto gen29;
                }
                args=*bp;++bp;--len;
                if (args != 2) {
                    goto gen29;
                }
                m_get_int(&bp,&len,&i); // connection number
                m_get_str_low(&bp,&len,&nstr,&nstr_len);
                if (nstr_len > big_max) goto gen29;
                kb->puts(nstr,nstr_len);
            }
            ci->current_con=i;
            return;
****************************************************************/
            break;
                
        case this.m_cursor:
/* CURSOR ******************************************************
            if (len == 0) {
                goto gen29;
            }
            if (*bp != 0xff) {
                goto gen29;
            }
            ++bp;--len;
            if (len == 0) {
                goto gen29;
            }
            args=*bp;++bp;--len;
            if (args != 1 ) {
                goto gen29;
            }
            tstr=0;tstr_len=0;
            // get cursor command
            if ( m_get_str(&bp,&len,&tstr,&tstr_len) ) {
                goto gen29;
            }
            cursor(ei,tstr,tstr_len);
            if (ei->error) {
                goto gen29;
            }
****************************************************************/
            break;
    
        case this.m_cyan:
            tstr=this.get_color(0,255,255);
            if (cwin.bcolor_flag) {
                cwin.bc_rgb=tstr;
            }
            else {
                cwin.fc_rgb=tstr;
            }
            cwin.bcolor_flag=false;
            break;
    
        case this.m_default:
            cwin.def_high_intensity=cwin.high_intensity;
            cwin.def_reverse_video=cwin.reverse_video;
            cwin.def_bbx_underline=cwin.bbx_underline;
            cwin.def_blink=cwin.blink;
            cwin.def_graphics=cwin.graphics;
            cwin.def_protected=cwin.protected;
            cwin.def_bc_rgb=cwin.bc_rgb;
            cwin.def_fc_rgb=cwin.fc_rgb;
            break;

        case this.m_drop:
            if (p.recursive_flag || cwin.scroll_win) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if (p.pos == p.dlen1) { /* has to have 1 argument */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos
            if (p.pos == p.dlen1) { /* has to have 4->7 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            i=p.data.charCodeAt(p.pos);
            if (i != 1 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            if (p.data.charCodeAt(p.pos) < 250) {
                // string name
                nstr=this.m_get_str_low(p);
                if(this.sm32_error != 0) return;
                col=this.get_window_number(nstr);
                if (col == -1) {
                    this.sm32_error = this.e_invalid_mnemonic;
                    return;    
                }
            }
            else {
                col=this.m_get_int(p);
                if(this.sm32_error != 0) return;
            }
            if (col > this.max_windows) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if (T_G.bw.windows[col] == null) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            cwin.e.style.zIndex = "0";
            if (cwin.fwin != undefined){
                if (cwin.fwin.divh !=undefined){
                    cwin.fwin.divh.onmousedown = null;
                }
            }
            if (cwin.twin !=null) {
                cwin.twin.e.style.zIndex = "0";
            }
            if (col == T_G.bw.cw) {
                cwin.pop();
            }
            else {
                cwin.drop(col);                    
            }
            cwin=T_G.bw.windows[T_G.bw.cw];
            cwin.e.style.zIndex = "1";
            if (cwin.fwin != undefined){
                if (cwin.fwin.divh != undefined){
                    cwin.fwin.divh.onmousedown=dragMouseDown;
                }
            }
            if (cwin.twin !=null) {
                cwin.twin.e.style.zIndex = "1";
            }
            if (this.sm32_error !=0) return;
            break;

        case this.m_goto:
            if (p.recursive_flag || cwin.scroll_win) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if (p.pos == p.dlen1) { /* has to have 1 argument */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos
            if (p.pos == p.dlen1) { 
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            i=p.data.charCodeAt(p.pos);
            if (i != 1 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            if (p.data.charCodeAt(p.pos) < 250) {
                // string name
                nstr=this.m_get_str_low(p);
                if(this.sm32_error != 0) return;
                col=this.get_window_number(nstr);
                if (col == -1) {
                    this.sm32_error = this.e_invalid_mnemonic;
                    return;    
                }
            }
            else {
                col=this.m_get_int(p);
                if(this.sm32_error != 0) return;
            }
            if (col > this.max_windows) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if (T_G.bw.windows[col] == null) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            cwin.e.style.zIndex = "0";
            if (cwin.fwin != undefined){
                if (cwin.fwin.divh != undefined) {
                    cwin.fwin.divh.onmousedown = null;
                }
            }
            if (cwin.twin !=null) {
                cwin.twin.e.style.zIndex = "0";
            }
            T_G.bw.cw=col;
            cwin=T_G.bw.windows[col];
            cwin.e.style.zIndex = "1";
            if (cwin.fwin != undefined){
                if (cwin.fwin.divh != undefined){
                    cwin.fwin.divh.onmousedown=dragMouseDown;
                }
            }
            if (cwin.twin !=null) {
                cwin.twin.e.style.zIndex = "1";
            }
            break;
        
        case this.m_green:
            tstr=this.get_color(0,255,0);
            if (cwin.bcolor_flag) {
                cwin.bc_rgb=tstr;
            }
            else {
                cwin.fc_rgb=tstr;
            }
            cwin.bcolor_flag=false;
            break;
    
        case this.m_magenta:
            tstr=this.get_color(255,0,255);
            if (cwin.bcolor_flag) {
                cwin.bc_rgb=tstr;
            }
            else {
                cwin.fc_rgb=tstr;
            }
            cwin.bcolor_flag=false;
            break;
    
        case this.m_mode:
/* MODE ********************************************************
            if (len == 0) {
                goto gen29;
            }
            if (*bp != 0xff) {
                goto gen29;
            }
            ++bp;--len;
            if (len == 0) {
                goto gen29;
            }
            args=*bp;++bp;--len;
            if ( args > 4 ) {
                goto gen29;
            }
            i=-1;        // font size used for non view -1 (view -1 comes from Prop Sheet)
            cols=-1;    // if font size 0 try to fit cols
            rows=-1;    // if font size 0 rows;
            // get mode byte
            if ( m_get_str(&bp,&len,&tstr,&tstr_len) ) {
                goto gen29;
            }
            if (args > 1) {
                if ( m_get_int(&bp,&len,&i) ) {
                    goto gen29;
                }
                if ( i == 0) {
                    if (args != 4) goto gen29;
                    if ( m_get_int(&bp,&len,&cols) ) {
                        goto gen29;
                    }
                    if ( m_get_int(&bp,&len,&rows) ) {
                        goto gen29;
                    }
                }
                else {
                    if (args != 2) goto gen29;
                }
            }
            os_mode(ei,tstr,tstr_len,i,cols,rows);
            if (ei->error) {
                return;
            }
            goto bloop;
****************************************************************/
            break;
    
        case this.m_move:
            if (T_G.bw.cw == 0) { // can't move window 0
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if (p.pos == p.dlen1) { /* has to have 2 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos
            if (p.pos == p.dlen1) { /* has to have 2 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 2 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            // get col
            col=this.m_get_int(p);
            if(this.sm32_error != 0) return;
            // get row
            row=this.m_get_int(p);
            if(this.sm32_error != 0) return;
            cwin.move(col,row);
            if(this.sm32_error != 0) return;
            break;

        case this.m_cp:
            this.do_resize(132,cwin.s_rows);
            break;
    
        case this.m_sp:
            this.do_resize(80,cwin.s_rows);
            break;

        case this.m_resize:
            if (p.pos == p.dlen1) { /* has to have 2 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos
            if (p.pos == p.dlen1) { /* has to have 2 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 2 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            // get col
            col=this.m_get_int(p);
            if(this.sm32_error != 0) return;
            // get row
            row=this.m_get_int(p);
            if(this.sm32_error != 0) return;
            this.do_resize(col,row);
            break;
    
        case this.m_pop:
            if (p.recursive_flag || cwin.scroll_win) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            cwin=this.DoPop();
            break;
    
        case this.m_push:
            if (p.recursive_flag || cwin.scroll_win || cwin.fwin != undefined) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            col=cwin.wul_ncl;
            row=cwin.wul_nrw;
            cols=cwin.s_cols;
            rows=cwin.s_rows;
            for (i=0; i!=10 ;++i) {
                if (T_G.bw.windows[i] == null) break;
            }
            if (i == this.max_windows) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            /* window[i] will be our window */
            if (this.sm32_error != 0) return;
            cwin.e.style.zIndex = "0";
            if (cwin.fwin != undefined){
                if (cwin.fwin.divh != undefined){
                    cwin.fwin.divh.onmousedown = null;
                }
            }
            if (cwin.twin !=null) {
                cwin.twin.e.style.zIndex = "0";
            }
            nstr="_win"+i;
            j=T_G.bw.cw;
            cwin=new SMB_window(row,col,cols,rows,nstr,"","",""); 
            cwin.cs();
            T_G.bw.cw=i;
            T_G.bw.windows[i]=cwin;
            cwin.pw=j;
            cwin.nw=T_G.bw.windows[j].nw;
            T_G.bw.windows[j].nw=i;
            cwin.e.style.zIndex = "1";
            break;
    
        case this.m_red:
            tstr=this.get_color(255,0,0);
            if (cwin.bcolor_flag) {
                cwin.bc_rgb=tstr;
            }
            else {
                cwin.fc_rgb=tstr;
            }
            cwin.bcolor_flag=false;
            break;
    
        case this.m_rgb:
            if (p.pos == p.dlen1) { /* has to have 1 string or 3 ints */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos
            if (p.pos == p.dlen1) { /* has to have 1 or 3 */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) == 3 ) {
                ++p.pos;
                // get red
                c_red=(this.m_get_int(p) & 3) * 85;
                if(this.sm32_error != 0) return;
                // get green
                c_green=(this.m_get_int(p) & 3) * 85;
                if(this.sm32_error != 0) return;
                // get blue
                c_blue=(this.m_get_int(p) & 255) *85;
                if(this.sm32_error != 0) return;
                tstr=this.get_color(c_red,c_green,c_blue);
                if (cwin.bcolor_flag) {
                    cwin.bc_rgb=tstr;
                }
                else {
                    cwin.fc_rgb=tstr;
                }
            }
            else {
                if ( p.data.charCodeAt(p.pos) != 1 ) {
                    this.sm32_error = this.e_invalid_mnemonic;
                    return                
                }
                ++p.pos;
                tstr=this.m_get_str_low(p);
                if(this.sm32_error != 0) return;
                if (tstr.length != 2) {
                    this.sm32_error = this.e_invalid_mnemonic;
                    return
                }
                c_red=((tstr.charCodeAt(0) >> 4) & 3) * 85;
                c_green=((tstr.charCodeAt(0) >> 2) & 3) * 85;
                c_blue=(tstr.charCodeAt(0) & 3) * 85;
                cwin.bc_rgb=this.get_color(c_red,c_green,c_blue,true);
                c_red=((tstr.charCodeAt(1) >> 4) & 3) * 85;
                c_green=((tstr.charCodeAt(1) >> 2) & 3) * 85;
                c_blue=(tstr.charCodeAt(1) & 3) * 85;
                cwin.fc_rgb=this.get_color(c_red,c_green,c_blue,true);
            }    
            break;
    
        case this.m_rgbx:
            if (p.pos == p.dlen1) { /* has to have 3 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos
            if (p.pos == p.dlen1) { /* has to have 3 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 3 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            // get red
            c_red=this.m_get_int(p) & 255;
            if(this.sm32_error != 0) return;
            // get green
            c_green=this.m_get_int(p) & 255;
            if(this.sm32_error != 0) return;
            // get blue
            c_blue=this.m_get_int(p) & 255;
            if(this.sm32_error != 0) return;
            tstr=this.get_color(c_red,c_green,c_blue);
            if (cwin.bcolor_flag) {
                cwin.bc_rgb=tstr;
            }
            else {
                cwin.fc_rgb=tstr;
            }
            cwin.bcolor_flag=false;
            break;

        case this.m_scroll:
            if (p.pos == p.dlen1) { /* has at least 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos
            if (p.pos == p.dlen1) { /* has at least 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) == 1 ) {
                /* has to ON.OFF,or RESET */
                ++p.pos;
                if (p.pos == p.dlen1) { /* has at least 1 arguments */
                    this.sm32_error = this.e_invalid_mnemonic;
                    return;
                }
                nstr=this.m_get_str(p);
                if (nstr == "OFF") {
                    cwin.scroll_off=true;
                    break;
                }
                if (nstr == "ON") {
                    cwin.scroll_off=false;
                    break;
                }
                if (nstr == "RESET") {
                    if (cwin.scroll_win == false) {
                        this.sm32_error = this.e_invalid_mnemonic;
                        return;
                    }
                    else {
                        /* pop window */
                        cwin.pop();
                        if (this.sm32_error !=0) return;
                        cwin=T_G.bw.windows[T_G.bw.cw];
                        cwin.e.style.zIndex = "1";
                        if (cwin.fwin != undefined){
                            if (cwin.fwin.divh != undefined){
                                cwin.fwin.divh.onmousedown=dragMouseDown;
                            }
                        }
                        if (cwin.twin !=null) {
                            cwin.twin.e.style.zIndex = "1";
                        }
                        break;
                    }
                }                
            }
            else {
                if (p.recursive_flag || cwin.scroll_win || cwin.fwin != undefined) {
                    this.sm32_error = this.e_invalid_mnemonic;
                    return;
                }
                if (p.data.charCodeAt(p.pos) !=4 ) {
                    this.sm32_error = this.e_invalid_mnemonic;
                    return;
                }
                ++p.pos;
                col=this.m_get_int(p);
                if(this.sm32_error !=0)return;
                row=this.m_get_int(p);
                if(this.sm32_error !=0)return;
                cols=this.m_get_int(p);
                if(this.sm32_error !=0)return;
                rows=this.m_get_int(p);
                if(this.sm32_error !=0)return;
                for (i=0; i!=10 ;++i) {
                    if (T_G.bw.windows[i] == null) break;
                }
                if (i == this.max_windows) {
                    this.sm32_error = this.e_invalid_mnemonic;
                    return;
                }
                /* window[i] will be our window */
                if (this.sm32_error != 0) return;
                cwin.e.style.zIndex = "0";
                if (cwin.fwin != undefined){
                    if (cwin.fwin.divh != undefined){
                        cwin.fwin.divh.onmousedown = null;
                    }
                }
                if (cwin.twin !=null) {
                    cwin.twin.e.style.zIndex = "0";
                }
                nstr="_win"+i;
                j=T_G.bw.cw;
                cwin=new SMB_window(row,col,cols,rows,nstr,"","",""); 
                cwin.cs();
                T_G.bw.cw=i;
                T_G.bw.windows[i]=cwin;
                cwin.pw=j;
                cwin.nw=T_G.bw.windows[j].nw;
                T_G.bw.windows[j].nw=i;
                cwin.e.style.zIndex = "1";
                cwin.scroll_win=true;
                break;    
            }
            break; //never be here
    
        case this.m_swap:
            if (p.recursive_flag || cwin.scroll_win) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            cwin.swap();
            if (this.sm32_error !=0) return;
            
            cwin.e.style.zIndex = "0";
            if (cwin.fwin != undefined){
                if (cwin.fwin.divh != undefined){
                    cwin.fwin.divh.onmousedown = null;
                }
            }
            if (cwin.twin !=null) {
                cwin.twin.e.style.zIndex = "0";
            }
            cwin=T_G.bw.windows[T_G.bw.cw];
            cwin.e.style.zIndex = "1";
            if (cwin.fwin != undefined){
                if (cwin.fwin.divh != undefined){
                    cwin.fwin.divh.onmousedown=dragMouseDown;
                }
            }
            if (cwin.twin !=null) {
                cwin.twin.e.style.zIndex = "1";
            }
            break;
            
        case this.m_reset:
            T_G.bw.cw=0;
            for (i=1; i != this.max_windows; ++i) {
                if (T_G.bw.windows[i] != null) {
                    drop(i);
                }
            }
            cwin=T_G.bw.windows[0];
            cwin.cs();
            break;

        case this.m_white:
            tstr=this.get_color(255,255,255);
            if (cwin.bcolor_flag) {
                cwin.bc_rgb=tstr;
            }
            else {
                cwin.fc_rgb=tstr;
            }
            cwin.bcolor_flag=false;
            break;
    
        case this.m_window:
        case this.m_fwindow:
            let float=true;
            if (mnem == this.m_window) {
                float=false;
            }
            if (p.recursive_flag || cwin.scroll_win) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }        
            tsrt="";t2str="";nstr="";
            if (p.pos == p.dlen1) { /* has to have 4->7 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos
            if (p.pos == p.dlen1) { /* has to have 4->7 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            i=p.data.charCodeAt(p.pos);
            if (i < 4 || i > 7 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            // get col
            col=this.m_get_int(p);
            if(this.sm32_error != 0) return;
            // get row
            row=this.m_get_int(p);
            if(this.sm32_error != 0) return;
            // get cols
            cols=this.m_get_int(p);
            if(this.sm32_error != 0) return;
            //get rows
            rows=this.m_get_int(p);
            if(this.sm32_error != 0) return;
            tstr=""
            if (i > 4 ) {
                tstr = this.m_get_str_low(p);
            }
            t2str=""
            if (i > 5) {
                t2str = this.m_get_str_low(p);
            }
            if (i > 6) {
                nstr = this.m_get_str_low(p);
            }
            if (nstr != "") {
                if(nstr.substr(0,1) == "_") {
                    this.sm32_error = this.e_invalid_mnemonic;
                }
            }
            cwin=this.NWindow(row,col,rows,cols,nstr,tstr,t2str,float);
            if (this.sm32_error != 0 || cwin==null) return;
            
            break;

        case this.m_wrap:
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 1 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            /* has to ON.OFF*/
            ++p.pos;
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            nstr=this.m_get_str(p);
            if (nstr == "OFF") {
                cwin.wrap_off=true;
                break;
            }
            if (nstr == "ON") {
                cwin.wrap_off=false;
                break;
            }                
            this.sm32_error = this.e_invalid_mnemonic;
            return;
    
        case this.m_yellow:            
            tstr=this.get_color(255,255,0);
            if (cwin.bcolor_flag) {
                cwin.bc_rgb=tstr;
            }
            else {
                cwin.fc_rgb=tstr;
            }
            cwin.bcolor_flag=false;
            break;
    
        case this.m_ci:
            this.load_rbuf("");
            break;
    
        case this.m_kl:
            this.kb_locked=true;
            break;
    
        case this.m_ku:
            this.kb_locked=false;
            break;
    
        case this.m_rc: //read cursor pos
            this.add_rbuf(String.fromCharCode(32+cwin.row,32+cwin.col,13));
            break;
    
        case this.m_rl: //read all dat in current line
            this.read_screen(0,cwin.row,cwin.s_cols-1,cwin.row);
            if (this.sm32_error) return
            break;
    
        case this.m_rp: //read all data from cursor to end of screen
            this.read_screen(cwin.col,cwin.row,cwin.s_cols-1,cwin.s_rows-1);
            if (this.sm32_error) return
            break;
    
        case this.m_tr: //read all data from 0,0 to the cursor
            this.read_screen(0,0,cwin.col,cwin.row);
            if (this.sm32_error) return
            break;
    
        case this.m_fl:
/* FL func key load ********************************************
            load_func_keys(ei,&fks,kb,&bp,&len,0);
****************************************************************/
            break;
    
        case this.m_el:
/* EL edit key load ********************************************
            load_func_keys(ei,&fks,kb,&bp,&len,1);
****************************************************************/
            break;
    
        case this.m_stbl:
            nstr_len=p.data.charCodeAt(p.pos);
            ++p.pos;
            if (p.pos + nstr_len + 2 > p.dlen1) {
                return;
            }
            if (p.data.charAt(p.pos) != '!') {
                return;
            }
            nstr=p.data.substr(p.pos,nstr_len);
            p.pos += nstr_len;
            tstr_len = 128 * p.data.charCodeAt(p.pos) + p.data.charCodeAt(p.pos+1);
            p.pos += 2;
            if (p.pos + tstr_len > p.dlen1) {
                return;
            }
            if (tstr_len == 0) {
                tstr="";
            }
            else {
                tstr=p.data.substr(p.pos,tstr_len);
            }
            p.pos += tstr_len;
            if (nstr_len == 6 &&  nstr == "!TERMS") {
                if (tstr_len == 0 || tstr_len & 1 == 1) {
                    alert("Bad Mne 1");
                    this.sm32_error = this.e_invalid_mnemonic;
                    return;
                }
                this.terms="";
                this.terms_ctl="";
                for (i=0; i != tstr_len; i=i+2) {
                    this.terms=this.terms + tstr.substr(i,1);
                    this.terms_ctl=this.terms_ctl + tstr.substr(i+1,1);
                }
                return;
            }
            if (nstr_len == 5 && nstr =="!EDIT") {
                if ( tstr_len & 1) {
                    alert("Bad Mne 2");
                    this.sm32_error = this.e_invalid_mnemonic;
                    return;
                }
                if (tstr_len == 0 ) {
                    alert("Bad Mne 3");
                    this.sm32_error = this.e_invalid_mnemonic;
                    return;
                }
                /* edit */
                return;
            }
            if (nstr_len == 7 && nstr =="!JSKEYS") {
                if ( tstr_len & 7) {
                    /* has to be multiple of  */
                    alert("Bad Mne 4");
                    this.sm32_error = this.e_invalid_mnemonic;
                    return;
                }

/*
    if (cl) y=y+8;
    if (sk) y=y+4;
    if (ck) y=y+2;
    if (ak) y=y+1;
    c=String.fromCharCode(65+y);
    c2="000"+x.toString();
    c=c+c2.substr(-3,3);
    c2=this.keys[c];
*/                
                
                
                if (tstr_len != 0 ) {
                    /* load keys1 with  key board */
                    this.keys1=new Array();
                    for (i=0; i != tstr.length; i=i+8 ) {
                        c2=parseInt(tstr.substr(i+4,4),16);
                        this.keys1[tstr.substr(i,4)]=String.fromCharCode(c2);
                    }
                }
                //alert("loading Keyboard");
                this.keys = this.CopyAsArray(this.keys1); 
                return;
            }
            if ( nstr_len == 4 && nstr == "!SCR") { 
                // set scr
                this.scr_on=false;
                this.scr_disp_prm=false;
                this.scr_no_echo_delim=false;
                this.scr_use_pos=false;
                this.scr_pos=0;
                if (tstr_len == 0) {
                    this.scr_on=true;
                }
                else {
                    flag=tstr.charCodeAt(0);
                    if (flag & 0x80) this.scr_on=true;
                    if (flag & 0x40) this.scr_disp_prm=true;
                    if (flag & 0x10) this.scr_no_echo_delim=true;
                    if (flag & 0x08) this.scr_use_pos=true;
                    if ( tstr_len >= 3 ) {
                        this.scr_pos=tstr.charCodeAt(1) * 256 + tstr.charCodeAt(2);
                    }
                }
                return;
            }
            return;
    
        case this.m_re:
/* 02 - restore echo */
            if ( this.chan_flag & this.sav_echo ) {
                this.chan_flag &= ~this.sav_echo;
                this.chan_flag |= this.echo;
            }
            if ( this.chan_flag & this.sav_input_trans ) {
                this.chan_flag &= ~(this.sav_input_trans+this.input_trans);
            }
            break;
    
        case this.m_se:
/* 03 - save echo - echo off */
            if ( this.chan_flag & this.echo ) { 
                this.chan_flag &= ~this.echo;
                this.chan_flag |= this.sav_echo;
            }
            if ( (this.chan_flag & this.input_trans) == 0 ) {
                this.chan_flag |= this.input_trans+this.sav_input_trans;
            }
            break;


        case this.m_99:
/*'99'+"1" caret on '99'+"2" caret off *************************
            // this is not a user nmemonic use bye do_waitio()
            if (len == 0) {
                goto gen29;
            }
            achar=(int)*bp;
            ++bp;--len;
            if (achar == '1') {
                // turn caret on
                os_caret_on(ei);
            }
            if (achar == '2') {
                //turn caret off
                os_caret_off(ei);
            }
****************************************************************/
            break;

        case this.m_wt:
/* WT - window tiltle ******************************************/
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 1 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            nstr=this.m_get_str_low(p);
            w=T_G.bw.topw;
            if (cwin.dialog_w != null) w=cwin.dialog_w;
            w.document.title=nstr;
            break;

        case this.m_mwt:
/* MWT - main window tiltle ************************************
            if (len == 0) {
                goto gen29;
            }
            if (*bp != 0xff) {
                goto gen29;
            }
            ++bp;--len;
            if (len == 0) {
                goto gen29;
            }
            args=*bp;++bp;--len;
            if ( args != 1 ) {
                goto gen29;
            }
            // get string
            if ( m_get_str_low(&bp,&len,&tstr,&tstr_len) ) {
                goto gen29;
            }
            os_set_main_window_text(ei,tstr,tstr_len);
****************************************************************/
            break;

        case this.m_gwin:
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 1 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            nstr=this.m_get_str(p);
            if (nstr == "STATUSOFF") {
                this.status_off();
                break;
            }
            if (nstr == "STATUSON") {
                this.status_on();
                break;
            }
            if (nstr == "WEB") {
                this.webview_on();
                break;
            }
            if (nstr == "CONSOLE") {
                this.webview_off();
                break;
            }
            if (nstr == "WINDOW") {
                this.window_info();
                break;
            }                
            this.sm32_error = this.e_invalid_mnemonic;
            return;
/* GWIN - gui window control ***********************************
            if (len == 0) {
                goto gen29;
            }
            if (*bp != 0xff) {
                goto gen29;
            }
            ++bp;--len;
            if (len == 0) {
                goto gen29;
            }
            args=*bp;++bp;--len;
            if ( args != 1 ) {
                goto gen29;
            }
            // get string
            if ( m_get_str_low(&bp,&len,&tstr,&tstr_len) ) {
                goto gen29;
            }
            os_gwin(ei,tstr,tstr_len);
            if (ei->error) {
                goto gen29;
            }
****************************************************************/
            break;

        case this.m_status:
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 1 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            /* has to ON,OFF*/
            ++p.pos;
            if (p.pos == p.dlen1) { /* has 1 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            nstr=this.m_get_str_low(p);
            if (this.sm32_error != 0)return;
            this.Ustatus=nstr;
            this.status(nstr);
            break;

/* GWIN - gui window control ***********************************
            if (len == 0) {
                goto gen29;
            }
            if (*bp != 0xff) {
                goto gen29;
            }
            ++bp;--len;
            if (len == 0) {
                goto gen29;
            }
            args=*bp;++bp;--len;
            if ( args != 1 ) {
                goto gen29;
            }
            // get string
            if ( m_get_str_low(&bp,&len,&tstr,&tstr_len) ) {
                goto gen29;
            }
            os_status(ei,tstr,tstr_len);
            if (ei->error) {
                goto gen29;
            }
***************************************************************/
            break;

        case this.m_movewindow:
            if (p.pos == p.dlen1) { /* has to have 4 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 0xff ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos
            if (p.pos == p.dlen1) { /* has to have 4 arguments */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if ( p.data.charCodeAt(p.pos) != 4 ) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            col=this.m_get_int(p); /* y pos in pixels */
            if(this.sm32_error != 0) return;
            row=this.m_get_int(p); /* x pos in pixels */
            if(this.sm32_error != 0) return;
            cols=this.m_get_int(p); /* width in pixels */
            if(this.sm32_error != 0) return;
            rows=this.m_get_int(p); /* width in pixels */
            if(this.sm32_error != 0) return;
            T_G.bw.topw.moveTo(col,row);    
            T_G.bw.topw.resizeTo(cols,rows);        
            break;
            
        case this.m_menu:
            var mstr=new Array();
            for (i=0; i != 5; ++i){
                mstr[i]=""
            }
            var mflag=0;
            if (p.pos+2 > p.dlen1) { /* at least 2 more chars */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if (p.data.charCodeAt(p.pos) != 255) { /* has to be min of 2 and a max of 6 param */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos
            if ((c2=p.data.charCodeAt(p.pos)) < 2) { /* has to be 1 param */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if (c2 > 6) {
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos;
            j=c2;
            if (j == 6)j=5;
            for (i=0; i != j; ++i) {         
                mstr[i] = this.m_get_str_low(p);
                if (this.sm32_error != 0) {
                    return;
                }
            }
            if (c2 == 6) {
                mflag=this.m_get_int(p);
                if (this.sm32_error != 0) {
                    return;
                }
            }
            
            T_G.bw.m.menu(mstr[0],mstr[1],mstr[2],mstr[3],mstr[4],mflag);
            if (this.sm32_error != 0) {
                return;
            }
            break;    

        case this.m_sysmenu:
/* sysmenu - append to system menu *****************************
            if (len == 0) {
                goto gen29;
            }
            if (*bp != 0xff) {
                goto gen29;
            }
            ++bp;--len;
            if (len == 0) {
                goto gen29;
            }
            args=*bp;++bp;--len;
            if ( args != 5 ) {
                goto gen29;
            }
            // string nstr is name
            if ( m_get_str_low(&bp,&len,&nstr,&nstr_len) ) {
                goto gen29;
            }
            // string mstr is cmd
            if ( m_get_str_low(&bp,&len,&mstr,&mstr_len) ) {
                goto gen29;
            }
            // string tstr is cur_dir
            if ( m_get_str_low(&bp,&len,&tstr,&tstr_len) ) {
                goto gen29;
            }
            // int col is pri
            if ( m_get_int(&bp,&len,&col) ) {
                goto gen29;
            }
            // int row is screen
            if ( m_get_int(&bp,&len,&row) ) {
                goto gen29;
            }
            os_append_sys_menu(ei,nstr,nstr_len,mstr,mstr_len,
                               tstr,tstr_len,col,row);
****************************************************************/
            break;
    
        case this.m_launch:
/* launch a command on  ****************************************
            if (len == 0) {
                goto gen29;
            }
            if (*bp != 0xff) {
                goto gen29;
            }
            ++bp;--len;
            if (len == 0) {
                goto gen29;
            }
            args=*bp;++bp;--len;
            if ( args != 4 ) {
                goto gen29;
            }
            // string mstr is cmd
            if ( m_get_str_low(&bp,&len,&mstr,&mstr_len) ) {
                goto gen29;
            }
            // string tstr is cur_dir
            if ( m_get_str_low(&bp,&len,&tstr,&tstr_len) ) {
                goto gen29;
            }
            // int col is pri
            if ( m_get_int(&bp,&len,&col) ) {
                goto gen29;
            }
            // int row is screen
            if ( m_get_int(&bp,&len,&row) ) {
                goto gen29;
            }
            os_launch(ei,mstr,mstr_len,tstr,tstr_len,col,row);
****************************************************************/
            break;
    
        case this.m_prm:
            this.prompt=""; // already is ""
            if (p.pos+2 > p.dlen1) { /* at least 3 more chars */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            if (p.data.charCodeAt(p.pos) != 255) { /* has to be 1 param */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos
            if (p.data.charCodeAt(p.pos) != 1) { /* has to be 1 param */
                this.sm32_error = this.e_invalid_mnemonic;
                return;
            }
            ++p.pos            
            this.prompt = this.m_get_str_low(p);
            if (this.sm32_error != 0) return;
            break;
    
        case this.m_playsound:
/* playsound ***************************************************
            if (len == 0) {
                goto gen29;
            }
            if (*bp != 0xff) {
                goto gen29;
            }
            ++bp;--len;
            if (len == 0) {
                goto gen29;
            }
            args=*bp;++bp;--len;
            if ( args != 1 ) {
                goto gen29;
            }
            // string mstr is filename
            if ( m_get_str_low(&bp,&len,&mstr,&mstr_len) ) {
                goto gen29;
            }
            this->os_playsound(mstr,mstr_len);
****************************************************************/
            break;
    
        case this.m_sw:
/* SW - show window DGMODE set window **************************
            if (dgm != 0 && (len == 0 || *bp != 0xff)) {
                this->dgm->state=DGModeState_WaitSetWindowRow;
                this->dgm->StateData.swd.next_row=0;
                goto loop;
            }
            if (len == 0) {
                goto gen29;
            }
            if (*bp != 0xff) {
                //leland sw
                goto gen29;
            }
            ++bp;--len;
            if (len == 0) {
                goto gen29;
            }
            args=*bp;++bp;--len;
            if ( args != 1 ) {
                goto gen29;
            }
            // get string
            if ( m_get_str(&bp,&len,&tstr,&tstr_len) ) {
                goto gen29;
            }
            os_show_window(ei,tstr,tstr_len);
            if (ei->error) return;
****************************************************************/
            break;
    
        case this.m_messagebox:
/* MESSAGEBOX **************************************************
            if (len == 0) {
                goto gen29;
            }
            if (*bp != 0xff) {
                goto gen29;
            }
            ++bp;--len;
            if (len == 0) {
                goto gen29;
            }
            args=*bp;++bp;--len;
            if (args != 3) {
                goto gen29;
            }
            tstr=0;tstr_len=0;
            mstr=0;mstr_len=0;
            nstr=0;nstr_len=0;
            // get title string
            if ( m_get_str_low(&bp,&len,&tstr,&tstr_len) ) {
                goto gen29;
            }
            // get message
            if ( m_get_str_low(&bp,&len,&attribstr,&attribstr_len) ){
                goto gen29;
            }
            // get options
            if ( m_get_str(&bp,&len,&nstr,&nstr_len) ){
                goto gen29;
            }
            os_messagebox(ei,tstr,tstr_len, attribstr,attribstr_len,nstr,nstr_len);
            if (ei->error) {
                return;
            }
****************************************************************/
            break;

        case this.m_inputen:
            /* also rpc
            if ( *bp == 'R' || *bp == 'X'){
                if ( ci->current_con == current_rpc) {
                    // can't rcall your self
                    goto gen29;
                }
                // rcall switches to the current_rpc connection
                ci->current_con=current_rpc;
                kb->empty();
                kb->puts(bp,len);
            }
            */
            this.inp=p.data.substr(p.pos);
            return;
            
        case this.m_reg_char:
            achar=p.data.charAt(p.pos);
            ++p.pos
            if (achar == '\0') {
                break;
            }
            if (achar == ' ') {
                achar='\u00A0';
            }
            if ( cwin.graphics ) {
                if ( achar >= '0' && achar <= ':' ) {
                    switch (achar.charCodeAt(0)-'0'.charCodeAt(0)) {
                    case 0:achar=this.g_chars[this.g_hor]; break;
                    case 1:achar=this.g_chars[this.g_vert]; break;
                    case 2:achar=this.g_chars[this.g_ul]; break;
                    case 3:achar=this.g_chars[this.g_ur]; break;
                    case 4:achar=this.g_chars[this.g_ll]; break;
                    case 5:achar=this.g_chars[this.g_lr]; break;
                    case 6:achar=this.g_chars[this.g_con_r]; break;
                    case 7:achar=this.g_chars[this.g_con_l]; break;
                    case 8:achar=this.g_chars[this.g_con_t]; break;
                    case 9:achar=this.g_chars[this.g_con_b]; break;
                    case 10:achar=this.g_chars[this.g_con_c]; break;
                    }
                }
                else {
                    achar="*";
                }
            }
            cwin.echo_char (achar);
            if ( this.sm32_error ) {
                return;
            }
            break;
    
        default:
/* generate error 29 *******************************************
gen29:
            if ( *cf & gen_29 ) {
                set_error_add(ei);
                ei->sm32_error=invalid_mnemonic;
                return;
            }
****************************************************************/
            break;

        }
    }
    
};
