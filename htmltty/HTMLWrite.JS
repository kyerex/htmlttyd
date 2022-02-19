
function HTMLWrite(p)
{
    let w;
    let o;
    let theForm;
    let cwin=T_G.bw.windows[T_G.bw.cw];
    if (cwin.dialog_w == null) {
        w=cwin.w;
    }
    else {
    
        w=cwin.dialog_w;
    }
    w.x=this;
    this.gui.data_ready=false;
    this.gui.data=null;
    
    if (cwin.html_mode != true && cwin.dialog_w == null && p.data.type != "dialog_open" ) {
        console.log("not in html mode");
        this.sm32_error = this.e_invalid_mnemonic;
        return true;
    }
    if (p.data.protocol == undefined || p.data.type == undefined) {
        console.log("must specify protocol and type");
        this.sm32_error = this.e_invalid_mnemonic;
        return true;
    }
    this.gui.protocol=p.data.protocol; // write gui sets protocol for next read gui
    switch ( parseInt(this.gui.protocol) ) {
        case 0:
            this.o=new Object();
            o=this.o;
            if (p.data.type == "load" || p.data.type == "loadform") {
                if (p.data.html.length != 1 ) {
                    w.document.open();
                    w.document.write(p.data.html);
                    if (p.data.entry != null) {
                        w.location.href=p.data.entry;
                    }
                    else {
                        w.scrollTo(0,0);
                    }
                    w.document.body.addEventListener("mouseover", function(event) {
                        T_G.bw.m.mKillMenuMaybe();
                    });	 
                    w.document.close();        //close should make elements available
                } /* else we are working with already loaded window */
                if(p.data.type == "loadform") {
                    theForm = w.document.getElementById("THEFORM");
                    if (theForm == undefined) {
                        console.log("No Form")
                        this.sm32_error = this.e_invalid_mnemonic; // should not happen
                        return true;    
                    }
                    o.type="formdata";
                    theForm.addEventListener("submit", (event) => {
                        let submitter = event.submitter;
                          let pu=T_G.pu;
                          pu.o[submitter.name]=submitter.value;
                      });            
                    theForm.onsubmit = function(event) {
                        event.preventDefault();
                        let pu=T_G.pu;
                        let cwin=T_G.bw.windows[T_G.bw.cw];
                        if (cwin.dialog_w == null) {
                            w=cwin.w;
                        }
                        else {
                            w=cwin.dialog_w;
                        }
                        o=pu.o;
                        let formData = new FormData(w.document.getElementById("THEFORM"));
                        // load the key/value pairs
                        for(let pair of formData.entries()) {
                               o[pair[0]]=pair[1]; 
                        }
                        if (pu.sm32_mode) {
                            pu.gui.data=o;
                            pu.gui.data_ready=true;
                            if (pu.rp != null) pu.Pc3Read();
                        }
                        else {
                            pu.send_ksa(o);
                        }
                    }
                }
                else {
                    o.type="hdata";
                }    
                return true;
            }
            // only load and loadform
            console.log("invalid type;"+p.data.type);
            this.sm32_error = this.e_invalid_mnemonic;
            return true;    
        break;
        
        case 8: /* do all the set and get html */
            let o1=new Object();
            if (p.data.type.length < 8) {
                console.log("invalid type;"+p.data.type);
                this.sm32_error = this.e_invalid_mnemonic;
                return true;    
            }
            if (p.data.type == "window_open") {
                let name=p.data.name;
                if (name==undefined) name="";
                let neww=T_G.bw.topw.open("about:blank",name,p.data.params);
                if (neww == null) {
                    console.log("window did not open");
                    this.sm32_error = this.e_invalid_mnemonic;
                    return true;    
                }
                neww.document.open();
                neww.document.write(p.data.html);
                if (p.data.entry != null) {
                    neww.location.href=p.data.entry;
                }
                else {
                     neww.scrollTo(0,0);
                }
                neww.document.close();
                return true;
            }
            if (p.data.type == "dialog_open") {
                if (cwin.dialog_w != null) {
                    console.log("can't open dialog from dialog");
                    this.sm32_error = this.e_invalid_mnemonic;
                    return true;    
                }                    
                cwin.dialog_w=T_G.bw.topw.open("about:blank","",p.data.params);
                if (cwin.dialog_w == null) {
                    console.log("window did not open: params="+p.data.params);
                    this.sm32_error = this.e_invalid_mnemonic;
                    return true;    
                }
                w=cwin.w;
                w.document.body.addEventListener("click", function(event) {
                        let cwin=T_G.bw.windows[T_G.bw.cw];
                        cwin.body_click();
                });    
                T_G.dw=cwin.dialog_w;
                T_G.timer = setInterval(function() {   
                    let cwin=T_G.bw.windows[T_G.bw.cw];
                    if(T_G.dw.closed) {  
                         T_G.pu.dialog_closed();  
                      }  
                }, 500);                 
                return true;
            }
            if (p.data.type == "dialog_close") {
                if (cwin.dialog_w == null) {
                    console.log("No dialog to close");
                    this.sm32_error = this.e_invalid_mnemonic;
                    return true;    
                }
                cwin.dialog_w.close();
                cwin.dialog_w=null;
                w=cwin.w;
                w.document.body.removeEventListener("click", function(event) {
                        let cwin=T_G.bw.windows[T_G.bw.cw];
                        cwin.body_click();
                });
                return true;    //dialog_closed called above does the rest                
            }

            if (p.data.type == "delete_element") {
                 let id=w.document.getElementById(p.data.ElementId);
                if (id == undefined) {
                    console.log("invalid id;"+p.data.ElementId);
                    this.sm32_error = this.e_invalid_mnemonic;
                    return true;    
                }
                id.remove();
                return true;                
            }
            
            let c=p.data.type;
            let x=c.substr(3);
            /* no way read gui is active - haven't returned form write gui */            
            if (c.substr(0,3) == "GET") {

                if (x == "screenINFO") {
                    let cwin=T_G.bw.windows[T_G.bw.cw];
                    if (cwin.dialog_w == null) {
                        w=T_G.bw.topw;
                    }
                    else {
                        w=cwin.dialog_w;
                    }
                    let s=w.screen;
                    o1.type="screenINFO"
                    o1.availHeight=""+s.availHeight;
                    o1.availWidth=""+s.availWidth;
                    o1.height=""+s.height;
                    o1.width=""+s.width
                    o1.innerHeight=""+w.innerHeight;
                    o1.innerWidth=""+w.innerWidth;
                    o1.outerHeight=""+w.outerHeight;
                    o1.outerWidth=""+w.outerWidth;
                    o1.screenX=""+w.screenX;
                    o1.screenY=""+w.screenY;
                    if (this.sm32_mode) {
                        this.gui.data=o1;
                        this.gui.data_ready=true;                        
                    }
                    else {
                        this.send_ksa(o1);
                    }
                    return true;
                }

                if (x == "jsData") {
                    o1.type="jsData";
                    o1.str=""+this.jsData[p.data.key];
                    if (this.sm32_mode){
                        this.gui.data=o1;
                        this.gui.data_ready=true;                        
                    }
                    else {
                        this.send_ksa(o1);
                    }
                    return true;
                }
                
                let id=w.document.getElementById(p.data.ElementId);
                if (id == undefined) {
                    console.log("invalid id;"+p.data.ElementId);
                    this.sm32_error = this.e_invalid_mnemonic;
                    return true;    
                }
                
                if (x == "outerHTML") {
                    o1.Text=id.outerHTML;
                    o1.type="outerHTML";
                    if (this.sm32_mode){
                        this.gui.data=o1;
                        this.gui.data_ready=true;                
                    }
                    else {
                        this.send_ksa(o1);
                    }
                    return true;
                }
                if (x=="value") {
                    o1.Text=id.value;
                    o1.type="value";
                    if (this.sm32_mode) {
                        this.gui.data=o1;
                        this.gui.data_ready=true;                
                    }
                    else {
                        this.send_ksa(o1);
                    }
                    return true;
                }

                // fall thru to bad type
            }
            if (c.substr(0,3) == "SET" ) {
                if (x == "jsData") {
                    this.jsData[p.data.key]=p.data.str;
                    return true;
                }
                let id=w.document.getElementById(p.data.ElementId);
                if (id == undefined) {
                    console.log("invalid id;"+p.data.ElementId);
                    this.sm32_error = this.e_invalid_mnemonic;
                    return true;    
                }            
                if (x == "outerHTML") {
                    if (id.nodeName != "IFRAME") {
                        id.outerHTML=p.data.Text;
                    }
                    else {
                        let iw=id.contentWindow;
                        iw.document.open();
                        iw.document.write(p.data.Text);
                        if (p.data.entry != null) {
                            iw.location.href=p.data.entry;
                        }
                        else {
                            iw.scrollTo(0,0);
                        }
                        iw.document.close();
                    }
                    return true;
                }
                if (x == "value") {
                    if (id.tagName == "INPUT" && id.type.toLowerCase() == "checkbox") {
                        if (p.data.Text == "true") {
                            id.checked=true;
                        }
                        else {
                            id.checked=false;
                        }
                    }
                    else {
                        id.value=p.data.Text;
                    }
                    return true;                
                }
            }
            console.log("invalid type;"+p.data.type);
            this.sm32_error = this.e_invalid_mnemonic;
            return true;    
        break;
        
        default:
            console.log("Can Not handle protocol:"+p.protocol);
            break;
    }
    return true;
}

function Click(ele)
{
    let o=this.o;

    if (ele == undefined) {
        o["NO_ELEMENT"]="NO_ELEMENT"
    }
    else {
        if (ele.id == undefined) {
            o["NO_ID"]="NO_ID";
        }
        else {
            o[ele.id]="CLICKED";
        }
    }
    this.click_con()
}

function menu_click(c)
{
    let o=this.o;

    o["MENU_CLICKED"]=""+c;
    this.click_con();
}

function click_con()
{
    let o=this.o;
    let cwin=T_G.bw.windows[T_G.bw.cw];
    if (cwin.dialog_w == null) {
        w=cwin.w;
    }
    else {
        w=cwin.dialog_w;
    }
    if (o.type == "formdata") {
        // this is a link or something out side the form
        let formData = new FormData(w.document.getElementById("THEFORM"));
        // load the key/value pairs
        for(let pair of formData.entries()) {
           o[pair[0]]=pair[1]; 
        }
    }
    if (this.sm32_mode){
        this.gui.data=o;
        this.gui.data_ready=true;
        if (this.rp != null) this.Pc3Read();
    }
    else {
        this.send_ksa(o);
    }
}

function dialog_closed()
{
    clearInterval(T_G.timer); 
    T_G.timer=null; 
    let o1 = new Object();
    let cwin=T_G.bw.windows[T_G.bw.cw];
    o1.type="dialogclosed"
    cwin.dialog_w = null;
    if (this.sm32_mode){
        this.gui.data=o1;
        this.gui.data_ready=true;
        if (this.rp != null) this.Pc3Read();
    }
    else {
        this.send_ksa(o1);
    }
}
