#include "gsys.h"
#include "do.h"
#include "wspackets.h"
#include <malloc.h>
#include <memory.h>
#include <ctype.h>
#include <stdio.h>
#include <string.h>
#ifdef TGOSLINUX
#include <alloca.h>
#include <stdlib.h>
#endif


void encode_tmp(char *bp,uint32_t len,char *rbp,uint32_t *rlen)
{
	uint32_t len2;

	*rlen=(len + 2) / 3 * 4 +1;
	do_hta64((byt *)bp,len,(byt *)rbp, &len2);
	if (len2 != *rlen - 1) abort(); //??
	*(rbp + len2)='*';
	// return '*' terminated base 64 encoded string
}

int get_uint32_t(byt **bpx,uint32_t *lenx, uint32_t *resx)
{
	byt *bp;
	uint32_t len;
	uint32_t res;

	res=0;
	bp=*bpx;
	len=*lenx;

	while (*bp == ' ') {
		++bp;--len;
		if (len == 0) return 1;
	}
	*bpx=bp;
	while (*bp != ',') {
		if ( ! isdigit(*bp) )return 1;
		res=res * 10 +(*bp -'0');
		++bp;--len;
		if (len == 0) return 1;
	}
	++bp;--len;
	*bpx=bp;*lenx=len;*resx=res;
	return 0;
}

int get_str(byt **bpx,uint32_t *lenx, byt **rbp, uint32_t *rlen)
{
	byt *bp;
	uint32_t len;
	
	bp=*bpx;
	len=*lenx;

	*rbp=bp;
	*rlen=0;
	while (*bp != ',') {
		++bp;--len;
		if (len == 0) return 1;
		++*rlen;
	}
	++bp;--len;
	*bpx=bp;*lenx=len;
	return 0;
}


int deserialize(byt *bp,uint32_t len)

{
	byt *bp2,*ibp;
	uint32_t len2;
	uint32_t l,t,ctl,dlm;
	uint32_t *lp;
	struct pc2_initpacket *pc2_init;
	struct pc2_openres *pc2_or;
	struct pc2_writeres *pc2_wr;
	struct pc2_readrecordres *pc2_rrr;
	struct pc2_readres *pc2_rdr;
	struct pc2_closeres *pc2_clr;
	struct pc2_escape *pc2_pes;
	struct pc2_schar *pc2_sch;
	char tbuf[4096];

	do_ath64(bp,len,bp,&len);
	lp=0;
	ibp=bp;
	if (len == 0)return 1;
	if (get_uint32_t(&bp,&len,&l)) return 1;
	if (l < pc2pstart || l > pc2end) return 1;
	switch (l) {
		case pc2init:
			pc2_init=(struct pc2_initpacket *)tbuf;
			memset(pc2_init,0,sizeof(*pc2_init));
			pc2_init->lenl=sizeof (*pc2_init);
			pc2_init->type=(swrd)l;
			if (get_str(&bp,&len,&bp2,&len2)) return 1;
			if (len2+1 > sizeof(pc2_init->info)) return 1;
			memcpy(pc2_init->info,bp2,len2);
			lp=&pc2_init->lenl;
			break;

		case pc2openres:
			pc2_or=(struct pc2_openres *)tbuf;
			memset(pc2_or,0,sizeof(*pc2_or));
			pc2_or->lenl=sizeof (*pc2_or);
			pc2_or->type=(swrd)l;
			if (get_uint32_t(&bp,&len,&l)) return 1;
			pc2_or->sm32_error=(swrd)l;
			if (get_uint32_t(&bp,&len,&l)) return 1;
			pc2_or->chan_flag=(int)l;
			lp=&pc2_or->lenl;
			break;

		case pc2escape:
			pc2_pes=(struct pc2_escape *)tbuf;
			memset(pc2_pes,0,sizeof(*pc2_pes));
			pc2_pes->lenl=sizeof (*pc2_pes);
			pc2_pes->type=(swrd)l;
			lp=&pc2_pes->lenl;
			break;

		case pc2writeres:
			pc2_wr=(struct pc2_writeres *)tbuf;
			memset(pc2_wr,0,sizeof(*pc2_wr));
			pc2_wr->lenl=sizeof (*pc2_wr);
			pc2_wr->type=(swrd)l;
			if (get_uint32_t(&bp,&len,&l)) return 1;
			pc2_wr->sm32_error=(swrd)l;
			if (get_uint32_t(&bp,&len,&l)) return 1;
			pc2_wr->chan_flag=(int)l;
			lp=&pc2_wr->lenl;
			break;

		case pc2readguires:
		case pc2readrecordres:
			t=l;
			if (get_uint32_t(&bp,&len,&l)) return 1; //l=sm32_error
			len2=sizeof(*pc2_rrr)-4+len;
			pc2_rrr=(struct pc2_readrecordres *)tbuf;
			pc2_rrr->type=t;
			pc2_rrr->lenl=len2;
			pc2_rrr->dlenl=len;
			pc2_rrr->sm32_error=(swrd)l;
			memcpy(pc2_rrr->data,bp,len);
			lp=&pc2_rrr->lenl;
			break;


	case pc2readres:
			if (get_uint32_t(&bp,&len,&l)) return 1; //sm32_error
			if (get_uint32_t(&bp,&len,&ctl)) return 1; 
			if (get_uint32_t(&bp,&len,&dlm)) return 1; 
			len2=sizeof(*pc2_rdr)-4+len;
			pc2_rdr=(struct pc2_readres *)tbuf;
			pc2_rdr->type=pc2readres;
			pc2_rdr->lenl=len2;
			pc2_rdr->dlenl=len;
			pc2_rdr->sm32_error=(swrd)l;
			pc2_rdr->ctl=(int)ctl;
			pc2_rdr->dlm=(int)dlm;
			memcpy(pc2_rdr->data,bp,len);
			lp=&pc2_rdr->lenl;
			break;

		case pc2closeres:
			pc2_clr=(struct pc2_closeres *)tbuf;
			memset(pc2_clr,0,sizeof(*pc2_clr));
			pc2_clr->lenl=sizeof (*pc2_clr);
			pc2_clr->type=(swrd)l;
			lp=&pc2_clr->lenl;
			break;

		case pc2schar:
			if (get_uint32_t(&bp,&len,&l)) return 1; 
			len2=sizeof(*pc2_sch)-4+len;
			pc2_sch=(struct pc2_schar *)tbuf;
			pc2_sch->type=pc2schar;
			pc2_sch->lenl=len2;
			pc2_sch->dlenl=len;
			pc2_sch->ikey=(swrd)l;
			memcpy(pc2_sch->data,bp,len);
			lp=&pc2_sch->lenl;
			break;

		default:
		    return 1;

	}
	memcpy(ibp,lp,*lp);
	return 0;
}

int serialize(char *pk,uint32_t *len)

{
	struct pc2_loginres *pc2_lr;
	struct pc2_open *pc2_o;
	struct pc2_write *pc2_w;
	struct pc2_readrecord *pc2_rr;
	struct pc2_read *pc2_rd;
	struct pc2_close *pc2_cl;
	char tbuf[4096];
	swrd type;
	uint32_t len2;

	pc2_o=(struct pc2_open *)pk;
	type = pc2_o->type;

	switch (type) {

		case pc2loginres:
			pc2_lr=(struct pc2_loginres *)pk;
			sprintf(tbuf,"%u,%u,%u,",
				(uint32_t)pc2_lr->type,pc2_lr->res,(uint32_t)pc2_lr->mode);
			break;

		case pc2open:
			sprintf(tbuf,"%u,%u,",
				(uint32_t)pc2_o->type,(uint32_t)pc2_o->chan);
			break;

		case pc2write:
			pc2_w=(struct pc2_write *)pk;
			sprintf(tbuf,"%u,%u,%u,%u,%u,%u,%u,",
				(uint32_t)pc2_w->type,
				(uint32_t)pc2_w->siop.chan_flag,
				(uint32_t)pc2_w->siop.siz_eq,(uint32_t)pc2_w->siop.len_eq,
				(uint32_t)pc2_w->siop.tim_eq,(uint32_t)pc2_w->siop.io_flag,
				(uint32_t)pc2_w->dlenl );

			len2=strlen(tbuf);
			memcpy(tbuf+len2,pc2_w->data,pc2_w->dlenl);
			encode_tmp(tbuf,len2+pc2_w->dlenl,pk,len);
			return 0;

		case pc2readrecord:
			pc2_rr=(struct pc2_readrecord *)pk;
			sprintf(tbuf,"%u,%u,%u,%u,%u,%u,",
				(uint32_t)pc2_rr->type,
				(uint32_t)pc2_rr->siop.chan_flag,
				(uint32_t)pc2_rr->siop.siz_eq,(uint32_t)pc2_rr->siop.len_eq,
				(uint32_t)pc2_rr->siop.tim_eq,(uint32_t)pc2_rr->siop.io_flag);
			break;

		case pc2read:
			pc2_rd=(struct pc2_read *)pk;
			sprintf(tbuf,"%u,%u,%u,%u,%u,%u,",
				(uint32_t)pc2_rd->type,
				(uint32_t)pc2_rd->siop.chan_flag,
				(uint32_t)pc2_rd->siop.siz_eq,(uint32_t)pc2_rd->siop.len_eq,
				(uint32_t)pc2_rd->siop.tim_eq,(uint32_t)pc2_rd->siop.io_flag);
			break;

		case pc2close:
			pc2_cl=(struct pc2_close *)pk;
			sprintf(tbuf,"%u,",
				(uint32_t)pc2_cl->type);
			break;
		default: return 1;
	}
	encode_tmp(tbuf,strlen(tbuf),pk,len);
	return 0;
}
