
function menu_on_off()
{
	var pu=T_G.pu;

	if (pu.cmenu_on) {
		this.croot_node.e.style.display="block";
	}
	else {
		this.croot_node.e.style.display="none";
	}	
}


function CheckReadEndEq()
{
	var pu=T_G.pu;
	
	if (pu.sm32_mode) {
		if (pu.rp != null) {	//read active //
			if (pu.rp.siop.io_flag & pu.eof_flag) return false;
		}
	}
	else {
		if (pu.menuon) return false;
	}
	this.mKillMenu();
	return true;
}

function mUnderline(flag)
{
	var n;
	
	n=this.active_menu[0]
	this.mUnderlinex(n,flag);
}

function mUnderlinex(n,flag)
{
	var i,cn,d,e,s1,x;
	
	for (i=0;i!=n.child_nodes.length;++i) {
		cn=n.child_nodes[i];
		if (n.created == 2) {
			if (cn.access_letter != "" ) {
				e=n.w.document.getElementById(cn.idx);
				s=e.innerHTML;
				if (flag) {
					x=s.search(cn.name);
					s1=cn.name.replace(cn.access_letter,'<u>'+cn.access_letter+'</u>')
					s=s.substr(0,x)+s1+s.substr(x+cn.name.length);
				}
				else{
					s=s.replace('<u>',"");
					s=s.replace('</u>',"");
				}
				e.innerHTML=s;
			}
		}
		if (cn.access_letter != "" ) {
			if (flag) {
				cn.name=cn.name.replace(cn.access_letter,'<u>'+cn.access_letter+'</u>');
			}
			else {
				cn.name=cn.name.replace('<u>',"");
				cn.name=cn.name.replace('</u>',"");
			}
		}
		if (cn.child_nodes != undefined) {
			this.mUnderlinex(cn,flag);
		}
	}
}

function mStartAccessMode()
{
	if (CheckReadEndEq() ) return;
	this.mUnderline(true);
	this.mOverTop(0);
	this.CAccessNode=this.active_menu[0].child_nodes[0];
}

function mStopAccessMode()
{
	if (this.CAccessNode==null) return;
	this.mUnderline(false);
	this.CAccessNode=null;
}

function mKeyDown(x,cl,sk,ck,ak)
{
	var n,cns;
	
	if ((n=this.CAccessNode)==null) return;
	switch (x) {
		case 13:
			// enter
			this.ItemMenuSelected(n);
			break;
		case 37:
			// left arrow
			if (n.pn.name=="") {
				this.HiLiteNext(n,false);
				return;
			}
			if (n.pn.pn.name=="") {
				this.NextTop(n,false);
				return;
			}
			// move up out of sub menu
			this.NextLeft(n);
			return;
		case 38:
			// up arrow
			if (n.pn.name=="") {
				if (n.child_nodes == undefined) return; // ignore up if its an item in menu bar
				// up in menubar same as enter
				this.ItemMenuSelected(n);
				return;
			}
			this.HiLiteNext(n,false);
			return;
		case 39:
			// right arrow
			if (n.pn.name=="") {
				this.HiLiteNext(n,true);
				return;
			}
			if (n.child_nodes == undefined) {
				// move right to next on menu bar
				this.NextTop(n,true);
				return;
			}
			// same as enter for menu
			this.ItemMenuSelected(n);
			return;
		case 40:
			// down arrow
			if (n.pn.name=="") {
				if (n.child_nodes == undefined) return; // ignore down if its an item in menu bar
				// down in menubar same as enter
				this.ItemMenuSelected(n);
				return;
			}
			this.HiLiteNext(n,true);
			return;
			
		case 123: // f12 - debug
			this.mDebug();
			return;
		
		default:
			for (i=0;i!=n.pn.child_nodes.length;++i) {
				cn=n.pn.child_nodes[i];
				if ((s=cn.access_letter) != "") {
					if (x == s.toUpperCase(s).charCodeAt(0)) {
						this.ItemMenuSelected(cn);
						return;
					}
				}	
			}
			return;
	}
}

function mDebug()
{
	var n;
	
	n=this.active_menu[0]
	this.dump_node(n,"");
}

function dump_node(n,s)
{
	var i,cn,d;
	
	for (i=0;i!=n.child_nodes.length;++i) {
		cn=n.child_nodes[i];
		console.log(s+cn.name);
		if (cn.child_nodes != undefined) {
			d=s+"[created="+cn.created+"]";
			if (cn.created == 2) d=d+"[display="+cn.e.style.display+"]";
			console.log(d);
			this.dump_node(cn,s+"    ");
		}
	}
}

function NextLeft(n)
{
	var x,e,i,d,nx;
	
	n=n.pn;	
	d=1;
	nx=n;
	while (nx.pn.name != "") {
		++d;
		nx=nx.pn;
	}
	this.mKillMenuToD(d,this.HBClicked);
	e=n.pn.w.document.getElementById(n.idx);
	e.style.backgroundColor=pu.menu_selected_backgr_c;
	pu.status(n.status);
	if (this.HBClicked) {	
		this.ShowSubMenu(n);
	}
	n.pn.w.focus();
	this.CAccessNode=n;
}

function NextTop(n,right)
{
	var x,e,i;
	
	while (n.pn.name != "") n=n.pn; // get active node on menu bar
	this.mKillMenuToD(1,this.HBClicked);
	x=this.active_menu[0];
	for (i=0;x.child_nodes[i] != n;++i);
	if (right) {
		++i;
		if (i==x.child_nodes.length) i=0;
	}
	else { // go left
		--i;
		if (i==-1) i=x.child_nodes.length-1;
	}
	n=x.child_nodes[i];
	e=n.pn.w.document.getElementById(n.idx);
	e.style.backgroundColor=pu.menu_selected_backgr_c;
	pu.status(n.status);
	if (n.child_nodes != undefined) {// could be an item
		if (this.HBClicked) {	
			this.ShowSubMenu(n);
		}
	}
	n.pn.w.focus();
	this.CAccessNode=n;
}

function HiLiteNext(n,right)
{
	var e,i,d,nx;
	
	d=1;
	nx=n;
	while (nx.pn.name != "") {
		++d;
		nx=nx.pn;
	}
	this.mKillMenuToD(d,this.HBClicked);
	e=n.pn.w.document.getElementById(n.idx);
	if (!n.disable) {
		e.style.backgroundColor=pu.status_menu_backgr_c;
	}
	for (i = 0;i != n.pn.child_nodes.length; ++i) {
		if (n.pn.child_nodes[i]==n) {
			if (right) {
				++i;
			}
			else {
				--i;
			}
			break;
		}
	}
	if ( i == n.pn.child_nodes.length) {
		i=0;
	}
	if (i == -1) {
		i=n.pn.child_nodes.length-1;
	}
	n=n.pn.child_nodes[i];
	while (n.separator) {
		if (right) {
			++i;
		}
		else {
			--i;
		}
		if ( i == n.pn.child_nodes.length) {
			i=0;
		}
		if (i == -1) {
			i=n.pn.child_nodes.length-1;
		}
		n=n.pn.child_nodes[i];				
	}
	pu.status(n.status);
	e=n.pn.w.document.getElementById(n.idx);
	if (!n.disable) {
		e.style.backgroundColor=pu.menu_selected_backgr_c;
	}
	if (n.child_nodes != undefined) {// could be an item in menu bar
		if (this.HBClicked) {	
			this.ShowSubMenu(n);
		}
	}
	this.CAccessNode=n;	
}

function ItemMenuSelected(n)
{
	var c,e,nx,d;
	
	var pu=T_G.pu;
	
	d=1;
	nx=n;
	while (nx.pn.name != "") {
		++d;
		nx=nx.pn;
	}
	this.mKillMenuToD(d,this.HBClicked);

	if (n.child_nodes == undefined) {
		// this is a Item
		c=n.code;
		if (n.disable) return;
		this.mKillMenu();
		mSendItemCode(c);
		return;
	}
	// menu
	if (n.child_nodes[0]==undefined) return; // empty menu
	this.ShowSubMenu(n);
	this.HBClicked=true;
	n=n.child_nodes[0];
	pu.status(n.status);
	e=n.pn.w.document.getElementById(n.idx);
	if (!n.disable) {
		e.style.backgroundColor=pu.menu_selected_backgr_c;
	}
	this.CAccessNode=n;
}


function mKillMenuMaybe()
{
	/* don't kill menu started by Alt key *
	/* if just mouse over SMBWindow or Top-HR */
	if (this.CAccessNode != null) return;
	this.mKillMenu();
}

function mKillMenu()
{
	var pu=T_G.pu;
	this.mKillMenuToD(1,false);
	pu.status("");
	T_G.bw.windows[T_G.bw.cw].body_click();
	this.mStopAccessMode();	
}

function mKillMenuToD(d,flag)
{
	var e,n,x,j;
	var pu=T_G.pu;
	if (this.active_menu.length == 0) return;
	while (this.active_menu.length != d){ // pop all menus to depth d
		x=this.active_menu.pop();	
		for (j=0;j!=x.child_nodes.length;++j){
			n=x.child_nodes[j];
			if (n.separator == false) {
				e=n.pn.w.document.getElementById(n.idx);
				e.style.backgroundColor=pu.status_menu_backgr_c;
			}
		}
		x.e.style.display="none";
	}
	x=this.active_menu.pop();this.active_menu.push(x);
	for (j=0;j!=x.child_nodes.length;++j){
		n=x.child_nodes[j];
		if (n.separator == false) {
			e=n.pn.w.document.getElementById(n.idx);
			e.style.backgroundColor=pu.status_menu_backgr_c;
		}
	}
	this.HBClicked=flag;
}

function mOverItem(di)
{
	var e,n,x,j,d,i;
	
	var pu=T_G.pu;
	if (this.CheckReadEndEq()) return false;
	this.mStopAccessMode();
	i=di%1000;
	d=(di-i)/1000;
	this.mKillMenuToD(d,this.HBClicked);
	x=this.active_menu.pop(); this.active_menu.push(x);
	for (j=0;j!=x.child_nodes.length;++j) {
		n=x.child_nodes[j];
		if (n.separator==false) {
			e=n.pn.w.document.getElementById(n.idx);
			if (i == j && !n.disable) {
				e.style.backgroundColor=pu.menu_selected_backgr_c;
				pu.status(n.status);
			}
			else {
				e.style.backgroundColor=pu.status_menu_backgr_c;
			}
		}
	}
	return false;
}

function mClickItem(i)
{
	var c,x;
	
	var pu=T_G.pu;
	if (this.CheckReadEndEq()) return false;
	x=this.active_menu.pop(); this.active_menu.push(x);
	c=x.child_nodes[i].code;
	if (x.child_nodes[i].disable) return;
	this.mKillMenu();
	this.mSendItemCode(c);
	return false;
}

function mSendItemCode(c)
{
	var pu=T_G.pu;
	if (pu.sm32_mode) {
		pu.sm32_error=pu.e_end_of_file;
		pu.EndRead();
		pu.load_rbuf(""+c+"\r");
	}
	else {
		pu.add_rbuf("\x18"); "send ctrl X"
		//sleep(1000);
		pu.add_rbuf(""+c+"\r");
	}

}

function mOverTop(i)
{
	var e,n,x,saveHBC;
	
	var pu=T_G.pu;
	if (this.CheckReadEndEq()) return false;
	this.mStopAccessMode();
	this.mKillMenuToD(1,this.HBClicked);
	x=this.active_menu[0];
	n=x.child_nodes[i];
	e=n.pn.w.document.getElementById(n.idx);
	e.style.backgroundColor=pu.menu_selected_backgr_c;
	pu.status(n.status);
	if (this.HBClicked) {	
		this.ShowSubMenu(n);
	}
	n.pn.w.focus();
	return false;
}

function mOver(di)
{
	var e,n,rec,t,l,x,d,i;
	
	var pu=T_G.pu;
	if (this.CheckReadEndEq()) return false;
	this.mStopAccessMode();
	i=di%1000;
	d=(di-i)/1000;
	this.mKillMenuToD(d,this.HBClicked);
	x=this.active_menu.pop();this.active_menu.push(x);
	n=x.child_nodes[i];
	n.pn.e.style.display="BLOCK";
	e=n.pn.w.document.getElementById(n.idx);
	e.style.backgroundColor=pu.menu_selected_backgr_c;	
	pu.status(n.status);	
	this.ShowSubMenu(n);
}


function mClickTop(i)
{
	var e,doc,n,rec,t,l,x;
	
	var pu=T_G.pu;
	if (this.CheckReadEndEq()) return false;
	x=this.active_menu[0];
	n=x.child_nodes[i];
	e=n.pn.w.document.getElementById(n.idx);
	e.style.backgroundColor=pu.menu_selected_backgr_c;
	this.ShowSubMenu(n);
	this.HBClicked=true;
	return false;
}

function ShowSubMenu (n)
{
	var i,ml,x,e,w,h,doc,rec,char_height,char_width,s,di,fgc,lws,name;
	if (n.child_nodes.length == 0) {
		return;
	}
	this.active_menu.push(n);
	if (n.created == 2) {
		n.e.style.display="block";
		return;	
	}
	if (n.created == 0) {
		/* get window size */
		x=this.active_menu[0]; //root node
		e=x.w.document.getElementById("GetSize");
		rec=e.getBoundingClientRect();
		char_height=rec.height;
		char_width=rec.width;
		ml=0;
		for (i=0;i != n.child_nodes.length; ++i) {
			c=n.child_nodes[i];
			name=c.name.replace('<u>',"");
			name=name.replace('</u>',"")
			x=name.length + 8; 			//4 for checked in front of name 4 for the > after name
			if (x > ml) ml=x;
		}
		w=char_width * ml + 9;
		h=char_height * i + 7;
		e=n.pn.w.document.getElementById(n.idx);
		rec=e.getBoundingClientRect();
		if (n.pn == this.active_menu[0]) {
			n.mytop=rec.top+rec.height;
			n.myleft=rec.left;
			
		}
		else {
			n.mytop=rec.top + n.pn.mytop;
			n.myleft=rec.left+rec.width+n.pn.myleft;
		}
		s=n.idx+"-w";
		var sx ='<iframe frameborder="1" id="'+s+'" style="width: '+w+'PX'+
				'; height: '+h+'PX; top: '+n.mytop+'PX; left: '+n.myleft+'PX; z-index: 3'+
	    	 	'; display: block; position: fixed; " SRC="about:blank"></iframe>'
	  	T_G.bw.topw.document.write(sx);
  		n.e=T_G.bw.topw.document.getElementById(s);
  		n.w=n.e.contentWindow;
  	}
  	// n.created == 1(menu bar) or == 0 (sub menu)
  	doc=n.w.document;
	doc.open();
	doc.write("<head>");
	doc.write("<style>");
	doc.write("</style>");
	doc.write("</head>");
	s='<body STYLE="overflow: hidden;font-family: monospace; font-size: '+T_G.pu.status_menu_fs+
	          'PX; margin: 3px; background-color:'+T_G.pu.status_menu_backgr_c+'" >';
	doc.write(s);
	if (n.created == 1) {
		doc.write('<hr ID="Top-HR" >');
		e=doc.getElementById('Top-HR');
		e.onmouseover = function(){T_G.bw.m.mKillMenuMaybe();};
		doc.write('<span style="cursor:default" ID="GetSize">&nbsp</span>');
	}
	lws=true;	
	for (i=0;i != n.child_nodes.length; ++i) {
		c=n.child_nodes[i];
		c.pn=n;			// parent node
		c.idx=n.idx+"-"+i;
		if (c.child_nodes != undefined) {
			/* this is a menu */
			if (n.created == 1) {
				doc.write('<span style="cursor:default" ID="'+c.idx+'">&nbsp'+c.name+'</span>');
				e=doc.getElementById(c.idx);		
				e.onmouseover = ( function(n){ return function(){T_G.bw.m.mOverTop(n); return false;} } )( i );
				e.onclick = ( function(n){ return function(){T_G.bw.m.mClickTop(n);return false} } )( i );	
			}
			else {
				s='&nbsp&nbsp&nbsp&nbsp'+c.name+'&nbsp&nbsp&nbsp>'
				if (lws) {
					doc.write('<span style="cursor:default" ID="'+c.idx+'">'+s+'</span>');
					lws=false;
				}
				else {
					doc.write('<br><span style="cursor:default" ID="'+c.idx+'">'+s+'</span>');
				}
				di=1000*this.active_menu.length +i;
				e=doc.getElementById(c.idx);
				e.onmouseover = ( function(n){ return function(){T_G.bw.m.mOver(n);return false;} } )( di );		
			}
		}
		else {
			/* this is an item */
			if (c.separator) {
				doc.write('<hr>');
				lws=true;
			}
			else {
				fgc="#000000";
				if (c.disable) fgc="#7f7f7f";
				if (n.created == 1) {
					doc.write('<span style="color:'+fgc+'; cursor:default" ID="'+c.idx+'">&nbsp'+c.name+'</span>');
					e=doc.getElementById(c.idx);
					e.onmouseover = ( function(n){ return function(){T_G.bw.m.mOverItem(n); return false;} } )( 1000+i );
					e.onclick = ( function(n){ return function(){T_G.bw.m.mClickItem(n);return false} } )( i );	
				}
				else {			
					s='&nbsp&nbsp'+c.name+'&nbsp&nbsp&nbsp&nbsp'
					if (c.checked){
						s='<b style="padding-left: 4px; background-color:'+pu.menu_selected_backgr_c+';">\u2713</b>'+s;
					}
					else {
						s='&nbsp&nbsp'+s;
					}
			
					if (lws) {
						doc.write('<span style="color:'+fgc+'; cursor:default" ID="'+c.idx+'">'+s+'</span>');
						lws=false;
					}
					else {
						doc.write('<br><span style="color:'+fgc+'; cursor:default" ID="'+c.idx+'">'+s+'</span>');
					}
					di=1000*this.active_menu.length +i;
					e=doc.getElementById(c.idx);
					e.onmouseover = ( function(n){ return function(){T_G.bw.m.mOverItem(n); return false;} } )( di );
					e.onclick = ( function(n){ return function(){T_G.bw.m.mClickItem(n);return false} } )( i );	
				}
			}
		}		
	}
	doc.write("</body>");
	doc.close();
	doc.body.addEventListener("keydown", function(event) {
		T_G.bw.m.mKeyDown(event.keyCode,event.getModifierState("CapsLock"),
        							   event.getModifierState("Shift"),
        							   event.getModifierState("Control"),
        							   event.getModifierState("Alt"));
		event.preventDefault();
    });	
	n.created=2;

}

function kill_child_windows(n)
{
	var i;
	
	for (i = 0; i != n.child_nodes.length; ++ i) {
		if (n.child_nodes[i].child_nodes != undefined) {
			this.kill_windows(n.child_nodes[i]);
		}
	}
}

function kill_windows(n)
{
	var i;
	// would not be here if n was not a sub menu
	if (n.created == 2) {
		for (i = 0; i != n.child_nodes.length; ++ i) {
			if (n.child_nodes[i].child_nodes != undefined) {
				if (n.child_nodes[i].child_nodes != undefined) {
					this.kill_windows(n.child_nodes[i]);
				}
			}
		}
		n.e.remove();// remove window
		n.created=0;
	}
	n.e=null;
	n.w=null;	
	n.created=0;
	n.pn=null;
	n.idx="";	
}

function FindItemNode(n,x)
{
	var i,n2;
	if (n.child_nodes.length == 0) return null;
	for (i=0;i!=n.child_nodes.length;++i) {
		if (n.child_nodes[i].child_nodes != undefined) {
			n2=this.FindItemNode(n.child_nodes[i],x);
			if (n2 != null) return n2;
		}
		else {
			if (n.child_nodes[i].code == x) return n.child_nodes[i];
		}
	}
	return null;
}

function ReShow(name)
{	
	var menu_node,s,n;
			
	n=this.croot_node;
	if (n.child_nodes.length != 0) { // length will be 0 for append,delete,insert
		this.kill_child_windows(n);		//kill windows
	}
	this.active_menu = new Array(); // keep track of active sub menu
	s=name;
	menu_node=this.menus[s];			
	this.HBClicked=false;
	n.idx=menu_node.idx;
	n.child_nodes=menu_node.child_nodes; // move child nodes to root child nodes (just moves pointer)
	n.created=1; // reprint toolbar			
	this.ShowSubMenu(n);
}

function GetMenuItem(name,pos) 
{
	var s,x,menu_node;
	if (pos == "") {
		pu.sm32_error = pu.e_invalid_mnemonic;
		return;	
	}
	s=pos.split(",");
	if (s.length == 1) {
		pos = "";
		x=Number(s[0]);
	}
	else {
		x=Number(s.pop());
		pos=s.join(",");
	}
	if (x == NaN) {
		pu.sm32_error = pu.e_invalid_mnemonic;
		return;
	}
	o=new Object();
	o.menu_node=this.GetMenuNode(name,pos);
	o.x=x;
	return o; // return index into menu in pos
}

function GetMenuNode(name,pos) 
{
	var s,x,x;
	
	var pu=T_G.pu;
	
	s=name;
	menu_node=this.menus[s];
	if (menu_node == undefined) {
		pu.sm32_error = pu.e_invalid_mnemonic;
		return;				
	}
	if (pos != "") {
		s=pos.split(",");
		for (i=0;i!=s.length;++i){
			x=Number(s[i]);
			if (x == NaN) {
				pu.sm32_error = pu.e_invalid_mnemonic;
				return;						
			}
			menu_node=menu_node.child_nodes[x];
			if (menu_node == undefined) {
				pu.sm32_error = pu.e_invalid_mnemonic;
				return;				
			}
			if (menu_node.child_nodes == undefined) {  // this is an item not a menu
				pu.sm32_error = pu.e_invalid_mnemonic;
				return;				
			}
		}
	}
	return menu_node;
}
function LoadNode (data,status,flag)
{
	var pu=T_G.pu;
	var s,x,n,e,v;
	var menu_node,current_node;

	if (data.toUpperCase() == "SEPARATOR") {
		current_node=new MenuItem();			
		current_node.separator=true;
	}
	else {
		s=data.split(",");
		if (s[0].toUpperCase() == "ITEM" && s.length == 3) {
			current_node=new MenuItem();
			x=Number(s[1]);
			if (x == NaN) {
				current_node=undefined;
				pu.sm32_error = pu.e_invalid_mnemonic;
				return;				
			}
			current_node.code=x;
			current_node.name=s[2].replace("&","");
			if ((x=s[2].search("&")) != -1) {
				current_node.access_letter=s[2].substr(x+1,1);
				
			}
			current_node.status=status;
			if ((flag & 1) == 1) {
				current_node.checked=true;
			}
			else {
				current_node.checked=false;
			}
			if ((flag & 2) == 2) {
				current_node.disable=true;
			}
			else {
				current_node.disable=false;
			}					
		}
		else {
			if (s[0].toUpperCase() == "MENU" && s.length == 2) {
				current_node=new MenuNode();
				current_node.name=s[1].replace("&","");	
				if ((x=s[1].search("&")) != -1) {
					current_node.access_letter=s[1].substr(x+1,1);
				}	
				current_node.status=status;
				if ((flag & 1) == 1) {
					current_node.checked=true;
				}
				else {
					current_node.checked=false;
				}
				if ((flag & 2) == 2) {
					current_node.disable=true;
				}
				else {
					current_node.disable=false;
				}
			}
			else {
				pu.sm32_error = pu.e_invalid_mnemonic;
				return;	
			}
		}
	}
	return current_node;
}

function MenuActive(name)
{
	var menu_node,s;
	
	n=this.croot_node;
	if (T_G.pu.cmenu_on == false) return false;
	s=name;
	menu_node=this.menus[s]; /* root of menu */			
	if (menu_node == undefined) {
		return false; /* ?? */				
	}
	if (menu_node.idx == n.idx) return true;
	return false;
}

function menu(command,name,pos,data,status,flag)
{
	var pu=T_G.pu;
	var s,x,n,e,i,fgc,di;
	var menu_node,current_node;
	
	if (command =="") {
		pu.sm32_error = pu.e_invalid_mnemonic;
		return;
	}
	command=command.toUpperCase();

	if (this.commands[command] == undefined) {
		pu.sm32_error = pu.e_invalid_mnemonic;
		return;
	}
	
	switch (this.commands[command]) {
	
		/* SHOW */
		case 0:
			// show menu name "" turns off menu
			n=this.croot_node;
			if (n.child_nodes.length != 0) {
				this.kill_child_windows(n);		//kill windows
			}
			n.child_nodes=new Array();
			n.idx="";
			if (name == "") {
				pu.cmenu_on=false;
				this.active_menu = new Array(); // keep track of active sub menu
			}
			else {
				s=name;
				menu_node=this.menus[s];			
				if (menu_node == undefined) {
					pu.sm32_error = pu.e_invalid_mnemonic;
					return;				
				}
				this.active_menu = new Array();
				this.HBClicked=false;
				n.idx=menu_node.idx;
				n.child_nodes=menu_node.child_nodes; // move child nodes to root child nodes (just moves pointer)
				n.created=1;
				
				this.ShowSubMenu(n);
				pu.cmenu_on=true;				
			}
			pu.save_h=-1;
			pu.Resize();
			this.menu_on_off();
			return;
		
		/* CREATE */
		case 1:
			if (name == "") {
				pu.sm32_error = pu.e_invalid_mnemonic;
				return;			
			}
			s=name;
			this.menus[s]=new MenuNode();	// should wipe out previous menu
			this.menus[s].idx=s;			// all id add to this during show
			return;
		
		/* DELETE */
		case 2:
			if (name == "") {
				pu.sm32_error = pu.e_invalid_mnemonic;
				return;			
			}
			if (pos == "") {
				/* delete menu */	
				n=this.croot_node;
				if (n.child_nodes.length != 0) {
					this.kill_child_windows(n);		//kill windows
				}
				n.child_nodes=new Array();
				n.idx="";
				pu.cmenu_on=false;
				this.active_menu = new Array(); // keep track of active sub menu
				s=name;
				this.menus[s] = undefined;
				pu.save_h=-1;
				pu.Resize();
				this.menu_on_off();
				return;
			}
			var o=this.GetMenuItem(name,pos);
			if (pu.sm32_error != 0){
				return;
			}
			menu_node=o.menu_node;
			n=menu_node.child_nodes[o.x];
			if (n == undefined) {
				pu.sm32_error = pu.e_invalid_mnemonic;
				return;				
			}
			n=this.croot_node;
			if (x=this.MenuActive(name)) {
				this.kill_child_windows(n);		// kill windows before we delete
			}
			/* delete item or menu at o.x from menu_node */
			i=menu_node.child_nodes.length-1;
			if (i != o.x) { //highest node being deleted
				for (i=o.x; i != menu_node.child_nodes.length-1; ++i) {
					menu_node.child_nodes[i]=menu_node.child_nodes[i+1];
				}
			}	
			menu_node.child_nodes.pop();
			if (x) {
				this.ReShow(name);
			}			
			break;
		
		/* APPEND */
		case 3:
			if (name == "") {
				pu.sm32_error = pu.e_invalid_mnemonic;
				return;			
			}
			menu_node=this.GetMenuNode(name,pos)
			if (pu.sm32_error != 0) {
				alert("app 1 - name="+name+" pos="+pos);
				return;
			}
			/* this item or menu gets added at end of child */
			current_node=LoadNode(data,status,flag);
			if (pu.sm32_error !=0 ){
				alert("app 2");
				return;
			}
			n=this.croot_node;
			if (x=this.MenuActive(name)) {
				this.kill_child_windows(n);		//kill windows before we append	
			}
			menu_node.child_nodes.push(current_node);
			if (x) {
				this.ReShow(name);
			}
			break;
		
		/* INSERT */
		case 4:		
			if (name == "") {
				pu.sm32_error = pu.e_invalid_mnemonic;
				return;			
			}
			var o=this.GetMenuItem(name,pos);
			if (pu.sm32_error != 0){
				return;
			}
			menu_node=o.menu_node;
			n=menu_node.child_nodes[o.x];
			if (n == undefined) {
				pu.sm32_error = pu.e_invalid_mnemonic;
				return;				
			}
			/* this item or menu get inserted before o.x here */
			current_node=LoadNode(data,status,flag);
			if (pu.sm32_error !=0 )return;
			n=this.croot_node;
			if (x=this.MenuActive(name)) {
				this.kill_child_windows(n);		//kill windows before we insert	
			}
			for (i=menu_node.child_nodes.length ;i != o.x;--i) {
				menu_node.child_nodes[i]=menu_node.child_nodes[i-1];
			}	
			menu_node.child_nodes[o.x]=current_node;
			if (x) {
				this.ReShow(name);
			}			
			break;
		/* MODIFY */
		case 5:
			if (name == "") {
				pu.sm32_error = pu.e_invalid_mnemonic;
				return;			
			}
			var o=this.GetMenuItem(name,pos);
			if (pu.sm32_error != 0){
				return;
			}
			menu_node=o.menu_node;
			n=menu_node.child_nodes[o.x];
			if (n == undefined) {
				pu.sm32_error = pu.e_invalid_mnemonic;
				return;				
			}
			n.status=status;
			if ((flag & 1) == 1) {
				n.checked=true;
			}
			else {
				n.checked=false;
			}
			if ((flag & 2) == 2) {
				n.disable=true;
			}
			else {
				n.disable=false;
			}
			if (this.MenuActive(name)) { 
				// this menu/item is in the active menu
				this.ReShow(name);
			}
			break;
				
		/* SETFLAG */
		case 6:
			if (name == "") {
				pu.sm32_error = pu.e_invalid_mnemonic;
				return;			
			}
			s=name;
			menu_node=this.menus[s];
			if (menu_node == undefined) {
				pu.sm32_error = pu.e_invalid_mnemonic;
				return;				
			}
			x=Number(data);
			if (x == NaN) {
				current_node=undefined;
				pu.sm32_error = pu.e_invalid_mnemonic;
				return;				
			}
			/* find item node */
			n=this.FindItemNode(menu_node,x);
			if (n==null) {
				pu.sm32_error = pu.e_invalid_mnemonic;
				return;				
			}
			n.status=status;
			if ((flag & 1) == 1) {
				n.checked=true;
			}
			else {
				n.checked=false;
			}
			if ((flag & 2) == 2) {
				n.disable=true;
			}
			else {
				n.disable=false;
			}
			if (this.MenuActive(name)) { 
				// this menu/item is in the active menu
				this.ReShow(name);
			}			
			break;
			
		default:
			pu.sm32_error = pu.e_invalid_mnemonic;
			return;	
	}
}

new MenuObj(0);

/*methods*/
MenuObj.prototype.menu=menu;

MenuObj.prototype.mOverTop=mOverTop;
MenuObj.prototype.mClickTop=mClickTop;
MenuObj.prototype.mOverItem=mOverItem;
MenuObj.prototype.mClickItem=mClickItem;
MenuObj.prototype.mOver=mOver;

MenuObj.prototype.mKillMenu=mKillMenu;
MenuObj.prototype.mKillMenuToD=mKillMenuToD;
MenuObj.prototype.mKillMenuMaybe=mKillMenuMaybe;
MenuObj.prototype.ShowSubMenu=ShowSubMenu;
MenuObj.prototype.kill_child_windows=kill_child_windows;
MenuObj.prototype.kill_windows=kill_windows;
MenuObj.prototype.FindItemNode=FindItemNode;
MenuObj.prototype.CheckReadEndEq=CheckReadEndEq;
MenuObj.prototype.ReShow=ReShow;
MenuObj.prototype.GetMenuNode=GetMenuNode;
MenuObj.prototype.GetMenuItem=GetMenuItem;
MenuObj.prototype.MenuActive=MenuActive;
MenuObj.prototype.mStartAccessMode=mStartAccessMode;
MenuObj.prototype.mStopAccessMode=mStopAccessMode;
MenuObj.prototype.mKeyDown=mKeyDown;
MenuObj.prototype.ItemMenuSelected=ItemMenuSelected;
MenuObj.prototype.HiLiteNext=HiLiteNext;
MenuObj.prototype.NextTop=NextTop;
MenuObj.prototype.NextLeft=NextLeft;
MenuObj.prototype.mDebug=mDebug;
MenuObj.prototype.dump_node=dump_node;
MenuObj.prototype.mUnderline=mUnderline;
MenuObj.prototype.mUnderlinex=mUnderlinex;
MenuObj.prototype.menu_on_off=menu_on_off;
MenuObj.prototype.mSendItemCode=mSendItemCode;

/* constants */
MenuObj.prototype.Max_something=16;

function MenuObj(h)
{
	if (this.Max_something == undefined) return; // let the prototypes define
	var doc;
	var pu=T_G.pu;
	this.commands=new Object();
	this.commands.SHOW=0;
	this.commands.CREATE=1;
	this.commands.DELETE=2;
	this.commands.APPEND=3;
	this.commands.INSERT=4;
	this.commands.MODIFY=5;
	this.commands.SETFLAG=6;
	
	this.menus = new Array();			// array of menus by menu name
	
	this.active_menu = new Array(); 	//this is a stack current menu node is active_menu[0]; 
	this.HBClicked=false;
	this.CAccessNode=null;				//current access node 
	
	var sx ='<iframe frameborder="0" id="_menu_win" style="width: 100%'+
			'; height: '+h+'PX; top: 0; left: 0; z-index: 2'+
	     	'; display: none; position: fixed; " SRC="about:blank"></iframe>'
  	T_G.bw.topw.document.write(sx);
  	this.croot_node= new MenuNode(); // when menu changes the child_nodes from menu replace croot_node.child_nodes
  	this.croot_node.e = T_G.bw.topw.document.getElementById("_menu_win");
	this.croot_node.w = this.croot_node.e.contentWindow;
	
	doc=this.croot_node.w.document;
	doc.open();
	doc.write("<head>");
	doc.write("<style>");
	doc.write("</style>");
	doc.write("</head>");
	s='<body STYLE="overflow: hidden;font-family: monospace; font-size: '+pu.status_menu_fs+'PX; margin: 3px; background-color:'+pu.status_menu_backgr_c+'" >';
	doc.write(s);
	doc.write('<hr ID="Top-HR" >');
	e=doc.getElementById('Top-HR');
	e.onmouseover = function(){T_G.bw.m.mKillMenuMaybe();};
	doc.write('<span style="cursor:default" ID="GetSize">&nbsp</span>');
	doc.close();
};

function MenuNode ()
{
	this.created=0;					// 0 = no window no data,1 = window created reprint data(tool bar),2 = good to display
	this.pn=null;					// parent node
	this.child_nodes = new Array(); // child nodes
	this.name="";					// if == "" child nodes are top menu bar
	this.status="";
	this.idx="";
	this.e=null; 					// this node window ele
	this.w=null; 					// this nodes window 
	this.separator=false;			// a menu is never a separator
	this.access_letter=""			// letter to underline for keyboard access
}

function MenuItem ()
{
	this.name="";
	this.code=0;
	this.status="";
	this.idx=""
	this.checked=false;
	this.disable=false;
	this.separator=false;
	this.access_letter=""			// letter to underline for keyboard access
}