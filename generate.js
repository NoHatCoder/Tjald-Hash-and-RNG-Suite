const x="x"
const y="y"
const z="z"
const r="r"
const e="e"
const w="w"
const l="l"
const rname=["rsp","rbp","rbx","rax","rdi","rsi","rdx","rcx","r8","r9","r10","r11","r12","r13","r14","r15"]
const ename=["esp","ebp","ebx","eax","edi","esi","edx","ecx","r8d","r9d","r10d","r11d","r12d","r13d","r14d","r15d"]
const wname=["sp","bp","bx","ax","di","si","dx","cx","r8w","r9w","r10w","r11w","r12w","r13w","r14w","r15w"]
const lname=["spl","bpl","bl","al","dil","sil","dl","cl","r8b","r9b","r10b","r11b","r12b","r13b","r14b","r15b"]
//Register conventions
//Unused: rbp,rbx,r12-r15
//r11: Iteration pointer increment, set to 16, 32 or 64
//r9: In ptr/in-out ptr
//r10: Out ptr
//x/y/z 0-11 operation state
//x/y/z 12-15 temporary

var iswin=(process.platform=="win32")
if(process.argv.includes("w")){
	iswin=true
}
if(process.argv.includes("l")){
	iswin=false
}
var calleesave=[0,1,1,0,+iswin,+iswin,0,0,0,0,0,0,1,1,1,1]

var output=""

function push_adjust(rmin,rover,xmin,xover,parameters){
	var a
	var p5l=40
	for(a=rmin;a<rover;a++){
		if(calleesave[a]){
			code("push",sym(r,a))
			p5l+=8
			if(p5l==48){
				pushx()
			}
		}
	}
	if(p5l==40){
		pushx()
	}
	if(iswin){
		if(parameters>=1){
			code("mov",sym(r,4),sym(r,7))
		}
		if(parameters>=2){
			code("mov",sym(r,5),sym(r,6))
		}
		if(parameters>=3){
			code("mov",sym(r,6),sym(r,8))
		}
		if(parameters>=4){
			code("mov",sym(r,7),sym(r,9))
		}
		if(parameters>=5){
			code("mov",sym(r,8),adr(sym(r,0),null,null,p5l))
		}
		if(parameters>=6){
			code("mov",sym(r,9),adr(sym(r,0),null,null,p5l+8))
		}
	}
	function pushx(){
		var b
		if(iswin){
			xmin=Math.max(xmin,6)
			if(xover>xmin){
				var adjustment=(xover-xmin)*16+((p5l==40)?8:0)
				p5l+=adjustment
				code("sub",sym(r,0),sym(adjustment))
				for(b=xmin;b<xover;b++){
					code("movdqa",adr(sym(r,0),null,null,(b-xmin)*16),sym(x,b))
				}
			}
		}
	}
}

function pop(rmin,rover,xmin,xover,gt128){
	var a
	var p5l=40
	var popcount=0
	for(a=rmin;a<rover;a++){
		if(calleesave[a]){
			popcount++
			p5l+=8
		}
	}
	for(a=rover-1;a>=rmin;a--){
		if(calleesave[a]){
			code("pop",sym(r,a))
			p5l-=8
			if(p5l==48){
				popx()
			}
		}
	}
	if(popcount==0){
		popx()
	}
	if(gt128){
		code("vzeroupper")
	}
	function popx(){
		var b
		if(iswin){
			xmin=Math.max(xmin,6)
			if(xover>xmin){
				var adjustment=(xover-xmin)*16+((popcount==0)?8:0)
				for(b=xmin;b<xover;b++){
					code("movdqa",sym(x,b),adr(sym(r,0),null,null,(b-xmin)*16))
				}
				code("add",sym(r,0),sym(adjustment))
			}
		}
	}
}

function sym(t,n){
	if(t=="x"){
		return "xmm"+n
	}
	else if(t=="y"){
		return "ymm"+n
	}
	else if(t=="z"){
		return "zmm"+n
	}
	else if(t=="r"){
		return ""+rname[n]
	}
	else if(t=="e"){
		return ""+ename[n]
	}
	else if(t=="w"){
		return ""+wname[n]
	}
	else if(t=="l"){
		return ""+lname[n]
	}
	else if(t || t===0){
		return ""+t
	}
	else{
		return null
	}
}

function adr(b,i,s,d){
	var parts=[]
	if(b){
		parts.push(b)
	}
	if(s){
		parts.push(i+"*"+s)
	}
	else if(i){
		parts.push(i)
	}
	if(d){
		parts.push(d)
	}
	return ("["+parts.join("+")+"]").replace("+-","-")
}

function code(op,dst){
	if(/^\d[fb]$/.test(dst)){
		dst=".l"+dst.slice(0,1)
	}
	var str="\t"+op
	if((dst && dst.slice(0,3)=="zmm") || (typeof arguments[2] == "string" && arguments[2].slice(0,3)=="zmm")){
		if(op=="vpxor" || op=="vpand"){
			str+="d"
		}
		if(op=="vmovdqu" || op=="vmovdqa"){
			str+="32"
		}
		
	}
	var a
	var first=true
	var symbol
	for(a=1;a<arguments.length;a++){
		symbol=arguments[a]
		if(typeof symbol == "number"){
			console.log("Error, raw number")
			output+="Error, raw number\n"
		}
		if(symbol){
			if(!first){
				str+=","
			}
			first=false
			str+=" "+symbol
		}
	}
	output+=str+"\n"
}

function label(name){
	if(/^\d$/.test(name)){
		output+=".l"+name+":\n"
	}
	else{
		output+=name+":\n"
	}
}

function datasection(){
	output+="default rel\n"
	output+="SECTION .data\n"
	
	label("l3_ptrs")
	output+="\tdq tjald_2_begin_l3\n"
	output+="\tdq tjald_2_absorb_l3\n"
	output+="\tdq tjald_2_end_l3\n"
	output+="\tdq tjald_2_l3\n"
	output+="\tdq tjald_3_begin_l3\n"
	output+="\tdq tjald_3_absorb_l3\n"
	output+="\tdq tjald_3_end_l3\n"
	output+="\tdq tjald_3_l3\n"
	output+="\tdq tjald_4_begin_l3\n"
	output+="\tdq tjald_4_absorb_l3\n"
	output+="\tdq tjald_4_end_l3\n"
	output+="\tdq tjald_4_l3\n"
	output+="\tdq gesus_128_seed_l3\n"
	output+="\tdq gesus_128_rand_l3\n"
	output+="\tdq gesus_512_seed_l3\n"
	output+="\tdq gesus_512_rand_l3\n"
	
	label("l4_ptrs")
	output+="\tdq tjald_2_begin_l4\n"
	output+="\tdq tjald_2_absorb_l4\n"
	output+="\tdq tjald_2_end_l4\n"
	output+="\tdq tjald_2_l4\n"
	output+="\tdq tjald_3_begin_l4\n"
	output+="\tdq tjald_3_absorb_l4\n"
	output+="\tdq tjald_3_end_l4\n"
	output+="\tdq tjald_3_l4\n"
	output+="\tdq tjald_4_begin_l4\n"
	output+="\tdq tjald_4_absorb_l4\n"
	output+="\tdq tjald_4_end_l4\n"
	output+="\tdq tjald_4_l4\n"
	output+="\tdq gesus_128_seed_l3\n"
	output+="\tdq gesus_128_rand_l3\n"
	output+="\tdq gesus_512_seed_l4\n"
	output+="\tdq gesus_512_rand_l4\n"
	
	label("l6_ptrs")
	output+="\tdq tjald_2_begin_l6\n"
	output+="\tdq tjald_2_absorb_l6\n"
	output+="\tdq tjald_2_end_l6\n"
	output+="\tdq tjald_2_l6\n"
	output+="\tdq tjald_3_begin_l6\n"
	output+="\tdq tjald_3_absorb_l6\n"
	output+="\tdq tjald_3_end_l6\n"
	output+="\tdq tjald_3_l6\n"
	output+="\tdq tjald_4_begin_l6\n"
	output+="\tdq tjald_4_absorb_l6\n"
	output+="\tdq tjald_4_end_l6\n"
	output+="\tdq tjald_4_l6\n"
	output+="\tdq gesus_128_seed_l3\n"
	output+="\tdq gesus_128_rand_l3\n"
	output+="\tdq gesus_512_seed_l6\n"
	output+="\tdq gesus_512_rand_l6\n"
}

datasection()

function gesuskernel(x){
	//r8: secret
	//r12: out
	//r10: 1x spacing
	//r11: 3x spacing
	//r7: iteration counter
	label("0")
	code("vmovdqu",sym(x,12),adr(sym(r,8)))
	code("vmovdqu",adr(sym(r,8)),sym(x,8))
	code("vpxor",sym(x,15),sym(x,0),sym(x,12))
	code("vaesenc",sym(x,11),sym(x,15),sym(x,4))
	code("vpxor",sym(x,15),sym(x,4),sym(x,12))
	code("vaesenc",sym(x,0),sym(x,15),sym(x,8))
	code("vpxor",sym(x,15),sym(x,8),sym(x,12))
	code("vaesenc",sym(x,4),sym(x,15),sym(x,1))
	code("vpaddb",sym(x,10),sym(x,10),sym(x,12))
	
	code("vpand",sym(x,12),sym(x,12),sym(x,1))
	code("vpxor",sym(x,12),sym(x,12),sym(x,5))
	code("vaesenc",sym(x,12),sym(x,12),sym(x,9))
	code("vmovdqu",adr(sym(r,12)),sym(x,12))
	
	code("vmovdqu",sym(x,12),adr(sym(r,8),sym(r,10)))
	code("vmovdqu",adr(sym(r,8),sym(r,10)),sym(x,9))
	code("vpxor",sym(x,15),sym(x,1),sym(x,12))
	code("vaesenc",sym(x,8),sym(x,15),sym(x,5))
	code("vpxor",sym(x,15),sym(x,5),sym(x,12))
	code("vaesenc",sym(x,1),sym(x,15),sym(x,9))
	code("vpxor",sym(x,15),sym(x,9),sym(x,12))
	code("vaesenc",sym(x,5),sym(x,15),sym(x,2))
	code("vpaddb",sym(x,11),sym(x,11),sym(x,12))
	
	code("vpand",sym(x,12),sym(x,12),sym(x,2))
	code("vpxor",sym(x,12),sym(x,12),sym(x,6))
	code("vaesenc",sym(x,12),sym(x,12),sym(x,10))
	code("vmovdqu",adr(sym(r,12),sym(r,10)),sym(x,12))
	
	code("vmovdqu",sym(x,12),adr(sym(r,8),sym(r,10),2))
	code("vmovdqu",adr(sym(r,8),sym(r,10),2),sym(x,10))
	code("vpxor",sym(x,15),sym(x,2),sym(x,12))
	code("vaesenc",sym(x,9),sym(x,15),sym(x,6))
	code("vpxor",sym(x,15),sym(x,6),sym(x,12))
	code("vaesenc",sym(x,2),sym(x,15),sym(x,10))
	code("vpxor",sym(x,15),sym(x,10),sym(x,12))
	code("vaesenc",sym(x,6),sym(x,15),sym(x,3))
	code("vpaddb",sym(x,8),sym(x,8),sym(x,12))
	
	code("vpand",sym(x,12),sym(x,12),sym(x,3))
	code("vpxor",sym(x,12),sym(x,12),sym(x,7))
	code("vaesenc",sym(x,12),sym(x,12),sym(x,11))
	code("vmovdqu",adr(sym(r,12),sym(r,10),2),sym(x,12))
	
	code("vmovdqu",sym(x,12),adr(sym(r,8),sym(r,11)))
	code("vmovdqu",adr(sym(r,8),sym(r,11)),sym(x,11))
	code("vpxor",sym(x,15),sym(x,3),sym(x,12))
	code("vaesenc",sym(x,10),sym(x,15),sym(x,7))
	code("vpxor",sym(x,15),sym(x,7),sym(x,12))
	code("vaesenc",sym(x,3),sym(x,15),sym(x,11))
	code("vpxor",sym(x,15),sym(x,11),sym(x,12))
	code("vaesenc",sym(x,7),sym(x,15),sym(x,0))
	code("vpaddb",sym(x,9),sym(x,9),sym(x,12))
	
	code("vpand",sym(x,12),sym(x,12),sym(x,0))
	code("vpxor",sym(x,12),sym(x,12),sym(x,4))
	code("vaesenc",sym(x,12),sym(x,12),sym(x,8))
	code("vmovdqu",adr(sym(r,12),sym(r,11)),sym(x,12))
	
	code("lea",sym(r,8),adr(sym(r,8),sym(r,10),4))
	code("lea",sym(r,12),adr(sym(r,12),sym(r,10),4))

	code("dec",sym(r,7))
	code("jnz","0b")
	code("ret")
}

function tjaldkernel(x){
	label("0")
	code("vmovdqu",sym(x,12),adr(sym(r,8)))
	code("vmovdqu",sym(x,13),adr(sym(r,9)))
	code("vpxor",sym(x,15),sym(x,0),sym(x,12))
	code("vaesenc",sym(x,11),sym(x,15),sym(x,4))
	code("vpxor",sym(x,15),sym(x,4),sym(x,13))
	code("vaesenc",sym(x,0),sym(x,15),sym(x,8))
	code("vpxor",sym(x,15),sym(x,8),sym(x,13))
	code("vaesenc",sym(x,4),sym(x,15),sym(x,1))
	code("vpaddb",sym(x,10),sym(x,10),sym(x,12))
	
	code("vmovdqu",sym(x,12),adr(sym(r,8),sym(r,10)))
	code("vmovdqu",sym(x,13),adr(sym(r,9),sym(r,10)))
	code("vpxor",sym(x,15),sym(x,1),sym(x,12))
	code("vaesenc",sym(x,8),sym(x,15),sym(x,5))
	code("vpxor",sym(x,15),sym(x,5),sym(x,13))
	code("vaesenc",sym(x,1),sym(x,15),sym(x,9))
	code("vpxor",sym(x,15),sym(x,9),sym(x,13))
	code("vaesenc",sym(x,5),sym(x,15),sym(x,2))
	code("vpaddb",sym(x,11),sym(x,11),sym(x,12))
	
	code("vmovdqu",sym(x,12),adr(sym(r,8),sym(r,10),2))
	code("vmovdqu",sym(x,13),adr(sym(r,9),sym(r,10),2))
	code("vpxor",sym(x,15),sym(x,2),sym(x,12))
	code("vaesenc",sym(x,9),sym(x,15),sym(x,6))
	code("vpxor",sym(x,15),sym(x,6),sym(x,13))
	code("vaesenc",sym(x,2),sym(x,15),sym(x,10))
	code("vpxor",sym(x,15),sym(x,10),sym(x,13))
	code("vaesenc",sym(x,6),sym(x,15),sym(x,3))
	code("vpaddb",sym(x,8),sym(x,8),sym(x,12))
	
	code("vmovdqu",sym(x,12),adr(sym(r,8),sym(r,11)))
	code("vmovdqu",sym(x,13),adr(sym(r,9),sym(r,11)))
	code("vpxor",sym(x,15),sym(x,3),sym(x,12))
	code("vaesenc",sym(x,10),sym(x,15),sym(x,7))
	code("vpxor",sym(x,15),sym(x,7),sym(x,13))
	code("vaesenc",sym(x,3),sym(x,15),sym(x,11))
	code("vpxor",sym(x,15),sym(x,11),sym(x,13))
	code("vaesenc",sym(x,7),sym(x,15),sym(x,0))
	code("vpaddb",sym(x,9),sym(x,9),sym(x,12))
	
	code("lea",sym(r,8),adr(sym(r,8),sym(r,10),4))
	code("lea",sym(r,9),adr(sym(r,9),sym(r,10),4))

	code("dec",sym(r,7))
	code("jnz","0b")
	code("ret")
}

function tjaldfinal(){
	label("0")
	code("vpxor",sym(x,14),sym(x,0),sym(x,8))
	code("vaesenc",sym(x,11),sym(x,14),sym(x,4))
	code("vpxor",sym(x,15),sym(x,4),sym(x,1))
	code("vaesenc",sym(x,0),sym(x,15),sym(x,8))
	code("vpxor",sym(x,14),sym(x,8),sym(x,10))
	code("vaesenc",sym(x,4),sym(x,14),sym(x,2))
	code("vpaddb",sym(x,9),sym(x,9),sym(x,10))
	
	code("vpxor",sym(x,14),sym(x,1),sym(x,9))
	code("vaesenc",sym(x,8),sym(x,14),sym(x,5))
	code("vpxor",sym(x,15),sym(x,5),sym(x,2))
	code("vaesenc",sym(x,1),sym(x,15),sym(x,9))
	code("vpxor",sym(x,14),sym(x,9),sym(x,11))
	code("vaesenc",sym(x,5),sym(x,14),sym(x,3))
	code("vpaddb",sym(x,10),sym(x,10),sym(x,11))
	
	code("vpxor",sym(x,14),sym(x,2),sym(x,10))
	code("vaesenc",sym(x,9),sym(x,14),sym(x,6))
	code("vpxor",sym(x,15),sym(x,6),sym(x,3))
	code("vaesenc",sym(x,2),sym(x,15),sym(x,10))
	code("vpxor",sym(x,14),sym(x,10),sym(x,8))
	code("vaesenc",sym(x,6),sym(x,14),sym(x,0))
	code("vpaddb",sym(x,11),sym(x,11),sym(x,8))
	
	code("vpxor",sym(x,14),sym(x,3),sym(x,11))
	code("vaesenc",sym(x,10),sym(x,14),sym(x,7))
	code("vpxor",sym(x,15),sym(x,7),sym(x,0))
	code("vaesenc",sym(x,3),sym(x,15),sym(x,11))
	code("vpxor",sym(x,14),sym(x,11),sym(x,9))
	code("vaesenc",sym(x,7),sym(x,14),sym(x,1))
	code("vpaddb",sym(x,8),sym(x,8),sym(x,9))
	
	code("dec",sym(r,7))
	code("jnz","0b")
	
	code("vpaddb",sym(x,0),sym(x,0),sym(x,1))
	code("vpaddb",sym(x,2),sym(x,2),sym(x,3))
	code("vpaddb",sym(x,4),sym(x,4),sym(x,5))
	code("vpaddb",sym(x,6),sym(x,6),sym(x,8))
	code("vpaddb",sym(x,7),sym(x,7),sym(x,10))
	code("vpxor",sym(x,0),sym(x,0),sym(x,6))
	code("vpxor",sym(x,2),sym(x,2),sym(x,9))
	code("vmovdqu",adr(sym(r,3)),sym(x,0))
	code("vmovdqu",adr(sym(r,3),null,null,16),sym(x,2))
	code("vmovdqu",adr(sym(r,3),null,null,32),sym(x,4))
	code("vmovdqu",adr(sym(r,3),null,null,48),sym(x,7))
	
	code("ret")
}

function tjald_memcpy(x,level,leveldown){
	//rdi/4 outptr
	//rsi/5 inptr
	//rcx/7 len
	var size=Math.pow(2,level+1)
	if(level==5){
		level=6
	}
	label("tjald_memcpy_l"+level)
	code("cmp",sym(r,7),sym(size))
	code("jna","tjald_memcpy_l"+leveldown)
	code("vmovdqu",sym(x,15),adr(sym(r,5),sym(r,7),1,-size))
	code("lea",sym(r,7),adr(sym(r,7),sym(r,4),1,-size))
	code("vmovdqu",adr(sym(r,7)),sym(x,15))
	label("0")
	code("vmovdqu",sym(x,15),adr(sym(r,5)))
	code("vmovdqu",adr(sym(r,4)),sym(x,15))
	code("add",sym(r,5),sym(size))
	code("add",sym(r,4),sym(size))
	code("cmp",sym(r,4),sym(r,7))
	code("js","0b")
	code("ret")
}
function tjald_memcpy_small(){
	//rdi/4 outptr
	//rsi/5 inptr
	//rcx/7 len
	var size=4
	code("cmp",sym(r,7),sym(size))
	code("jna","1f")
	code("mov",sym(e,13),adr(sym(r,5),sym(r,7),1,-size))
	code("lea",sym(r,7),adr(sym(r,7),sym(r,4),1,-size))
	code("mov",adr(sym(r,7)),sym(e,13))
	label("0")
	code("mov",sym(e,13),adr(sym(r,5)))
	code("mov",adr(sym(r,4)),sym(e,13))
	code("add",sym(r,5),sym(size))
	code("add",sym(r,4),sym(size))
	code("cmp",sym(r,4),sym(r,7))
	code("js","0b")
	code("ret")
	label("1")
	code("test",sym(r,7),sym(r,7))
	code("jz","2f")
	label("3")
	code("mov",sym(l,13),adr(sym(r,5)))
	code("mov",adr(sym(r,4)),sym(l,13))
	code("inc",sym(r,5))
	code("inc",sym(r,4))
	code("dec",sym(r,7))
	code("jnz","3b")
	label("2")
	code("ret")
}

function tjald_memxor(x,level,leveldown){
	//rdi/4 outptr
	//rsi/5 inptr
	//rcx/7 len
	var size=Math.pow(2,level+1)
	if(level==5){
		level=6
	}
	label("tjald_memxor_l"+level)
	code("cmp",sym(r,7),sym(size))
	code("jna","tjald_memxor_l"+leveldown)
	code("vmovdqu",sym(x,14),adr(sym(r,5),sym(r,7),1,-size))
	code("lea",sym(r,7),adr(sym(r,7),sym(r,4),1,-size))
	code("vpxor",sym(x,14),sym(x,14),adr(sym(r,7)))
	label("0")
	code("vmovdqu",sym(x,15),adr(sym(r,5)))
	code("vpxor",sym(x,15),sym(x,15),adr(sym(r,4)))
	code("vmovdqu",adr(sym(r,4)),sym(x,15))
	code("add",sym(r,5),sym(size))
	code("add",sym(r,4),sym(size))
	code("cmp",sym(r,4),sym(r,7))
	code("js","0b")
	code("vmovdqu",adr(sym(r,7)),sym(x,14))
	code("ret")
}
function tjald_memxor_small(){
	//rdi/4 outptr
	//rsi/5 inptr
	//rcx/7 len
	var size=4
	code("cmp",sym(r,7),sym(size))
	code("jna","1f")
	code("mov",sym(e,13),adr(sym(r,5),sym(r,7),1,-size))
	code("lea",sym(r,7),adr(sym(r,7),sym(r,4),1,-size))
	code("xor",sym(e,13),adr(sym(r,7)))
	label("0")
	code("mov",sym(e,12),adr(sym(r,5)))
	code("xor",sym(e,12),adr(sym(r,4)))
	code("mov",adr(sym(r,4)),sym(e,12))
	code("add",sym(r,5),sym(size))
	code("add",sym(r,4),sym(size))
	code("cmp",sym(r,4),sym(r,7))
	code("js","0b")
	code("mov",adr(sym(r,7)),sym(e,13))
	code("ret")
	label("1")
	code("test",sym(r,7),sym(r,7))
	code("jz","2f")
	label("3")
	code("mov",sym(l,13),adr(sym(r,5)))
	code("xor",sym(l,13),adr(sym(r,4)))
	code("mov",adr(sym(r,4)),sym(l,13))
	code("inc",sym(r,5))
	code("inc",sym(r,4))
	code("dec",sym(r,7))
	code("jnz","3b")
	label("2")
	code("ret")
}

function tjald_memzero(x,level,leveldown){
	//rdi/4 outptr
	//rcx/7 len
	var size=Math.pow(2,level+1)
	if(level==5){
		level=6
	}
	label("tjald_memzero_l"+level)
	code("cmp",sym(r,7),sym(size))
	code("jna","tjald_memzero_l"+leveldown)
	code("vpxor",sym(x,15),sym(x,15),sym(x,15))
	code("lea",sym(r,7),adr(sym(r,7),sym(r,4),1,-size))
	code("vmovdqu",adr(sym(r,7)),sym(x,15))
	label("0")
	code("vmovdqu",adr(sym(r,4)),sym(x,15))
	code("add",sym(r,4),sym(size))
	code("cmp",sym(r,4),sym(r,7))
	code("js","0b")
	code("ret")
}
function tjald_memzero_small(){
	//rdi/4 outptr
	//rcx/7 len
	var size=4
	code("xor",sym(r,13),sym(r,13))
	code("cmp",sym(r,7),sym(size))
	code("jna","1f")
	code("lea",sym(r,7),adr(sym(r,7),sym(r,4),1,-size))
	code("mov",adr(sym(r,7)),sym(e,13))
	label("0")
	code("mov",adr(sym(r,4)),sym(e,13))
	code("add",sym(r,4),sym(size))
	code("cmp",sym(r,4),sym(r,7))
	code("js","0b")
	code("ret")
	label("1")
	code("test",sym(r,7),sym(r,7))
	code("jz","2f")
	label("3")
	code("mov",adr(sym(r,4),sym(r,7),1,-1),sym(l,13))
	code("dec",sym(r,7))
	code("jnz","3b")
	label("2")
	code("ret")
}

function textsection(){
	output+="SECTION .text\n"
	output+="\tglobal tjald_once_asm_limit\n"
	output+="\textern tjald_seed,tjald_small_seed,tjald_fn_pointers\n"
	
	var a,b
	
	tjald_memcpy(z,5,4)
	tjald_memcpy(y,4,3)
	label("tjald_memcpy_l2")
	label("tjald_memcpy_l1")
	tjald_memcpy(x,3,0)
	label("tjald_memcpy_l0")
	tjald_memcpy_small()
	
	tjald_memxor(z,5,4)
	tjald_memxor(y,4,3)
	label("tjald_memxor_l2")
	label("tjald_memxor_l1")
	tjald_memxor(x,3,0)
	label("tjald_memxor_l0")
	tjald_memxor_small()

	tjald_memzero(z,5,4)
	tjald_memzero(y,4,3)
	label("tjald_memzero_l2")
	label("tjald_memzero_l1")
	tjald_memzero(x,3,0)
	label("tjald_memzero_l0")
	tjald_memzero_small()
	
	label("tjald_kernel_128")
	//Function
	//In
	//r8,r9 data load pointers
	//r10,r11 element offset x1 and x3 - maintain value
	//rcx loop counter
	//x0-x10 state
	//Out
	//x0-x10
	//Scratch
	//x11,x12,x13,x15
	tjaldkernel(x)
	label("tjald_kernel_256")
	tjaldkernel(y)
	label("tjald_kernel_512")
	tjaldkernel(z)
	
	label("tjald_final")
	tjaldfinal()
	
	label("gesus_kernel_128")
	gesuskernel(x)
	label("gesus_kernel_256")
	gesuskernel(y)
	label("gesus_kernel_512")
	gesuskernel(z)
	
	label("tjald_2_begin_l3")
		push_adjust(3,14,15,16,2)
		code("call","tjald_2_begin_l3_inner")
		pop(3,14,15,16,false)
	code("ret")

	label("tjald_2_begin_l3_inner")
		code("test",sym(r,5),sym(r,5))
		code("jnz","0f")
		code("mov",sym(r,5),"$tjald_seed")
		label("0")
		code("mov",sym(r,7),sym(704))
		code("pxor",sym(x,15),sym(x,15))
		code("movdqu",adr(sym(r,4),null,null,704+0),sym(x,15))
		code("movdqu",adr(sym(r,4),null,null,704+16),sym(x,15))
		code("movdqu",adr(sym(r,4),null,null,704+32),sym(x,15))
		code("movdqu",adr(sym(r,4),null,null,704+48),sym(x,15))
		code("call","tjald_memcpy_l3")
	code("ret")
	
	label("tjald_2_absorb_l3")
		push_adjust(1,14,0,16,3)
		code("call","tjald_2_absorb_l3_inner")
		pop(1,14,0,16,false)
	code("ret")
	
	label("tjald_2_absorb_l3_inner") //(tjald_2_state*, input, length)
		code("mov",sym(e,8),adr(sym(r,4),null,null,768-4))
		code("lea",sym(r,7),adr(sym(r,8),sym(r,6),1,0))
		code("mov",sym(r,3),sym(r,6))
		code("add",sym(r,3),sym(-4096))
		code("sbb",sym(r,3),sym(r,3)) //Set r3 to -1 if input length >= 4096
		code("or",sym(r,3),sym(r,8))
		code("and",sym(r,3),sym(-0x80000000))
		code("or",sym(r,7),sym(r,3)) //Set bit 31 if it was already set, or the new input was long
		code("mov",adr(sym(r,4),null,null,768-4),sym(e,7))
		code("and",sym(r,8),sym(511)) //Set r8 to the length of unprocessed data stored
		code("jz","0f") //Jump if no unprocessed data is stored
			code("mov",sym(r,7),sym(r,6)) //Set r7 to input length
			code("add",sym(r,6),sym(r,8)) //Set r6 to the sum of input length and unprocessed data
			code("sub",sym(r,6),sym(512)) //Set r6 to the remaining input length after the partial block has been processed
			code("jns","1f") //Jump if there is enough data to process at least one block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,768)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l3") //Copy input to unprocessed data, using r4,r5 and r7
				code("jmp","2f")
			label("1")
				code("sub",sym(r,7),sym(r,6)) //Set r7 to the amount of data needed to be copied to unprocessed data in order to fill the buffer
				code("mov",sym(r,9),sym(r,4)) //Set r9 to the tjald_2_state pointer
				code("lea",sym(r,3),adr(sym(r,5),sym(r,7))) //Set r3 to point to the input after the partial block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,768)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l3") //Copy input to unprocessed data, using r4,r5 and r7
				code("mov",sym(r,4),sym(r,9)) //Set r4 to the tjald_2_state pointer
				code("lea",sym(r,5),adr(sym(r,4),null,null,768)) //Set r5 to point at the unprocessed data buffer
				code("mov",sym(r,12),sym(512)) //Set r7 to the unprocessed data buffer length
				code("call","tjald_2_innerabsorb_l3") //Using r4, r5 and r12 as parameters
				code("mov",sym(r,5),sym(r,3)) //Set r5 to point at the remaining input string
		label("0")
			code("mov",sym(r,12),sym(r,6)) //Set r7 to the remaining input length, r6 can have two different origins depending on previous branches
			code("call","tjald_2_innerabsorb_l3") //Using r4, r5 and r12 as parameters
			code("and",sym(r,6),sym(511)) //Set r6 to the length of unprocessed input
			code("mov",sym(r,7),sym(r,6))
			code("add",sym(r,4),sym(768)) //Point r4 at the unprocessed data buffer
			code("call","tjald_memcpy_l3") //Copy remaining data to unprocessed buffer
		label("2")
	code("ret")
	
	var bigblocksize=5
	label("tjald_2_innerabsorb_l3") //(tjald_2_state*, input, , r12:length) Updates r5 to be end of input processed
		code("shr",sym(r,12),sym(9)) //Set r12 to the number of whole 512 byte blocks to be processed.
		code("jz","0f") //Return if there are 0 blocks to process
		code("dec",sym(r,12))
		code("mov",sym(r,2),sym(r,12))
		code("shr",sym(r,2),sym(bigblocksize))
		code("and",sym(r,12),sym((1<<bigblocksize)-1))
		code("inc",sym(r,12)) //Set r12 to the number of blocks to process in the first round, from 1 to 32, so that there is a multiple of 32 remaining
		code("inc",sym(r,2)) //Set r2 to the number of 32x blocks to process, with the first one possibly being shorter
		code("mov",sym(r,10),sym(128))
		code("mov",sym(r,11),sym(384)) //Constants used by the inner processing loop
		label("1")
			code("mov",sym(r,1),sym(48)) //Set r1 to be a combined counter for a 4x loop and offset for loading data and state
			label("2")
				code("mov",sym(r,7),sym(r,12))
				code("lea",sym(r,8),adr(sym(r,5),sym(r,1),1,0)) //Set r8 and r9 to point at the data block with offsets applied
				code("lea",sym(r,9),adr(sym(r,5),sym(r,1),1,64))
				for(a=0;a<11;a++){
					code("movdqu",sym(x,a),adr(sym(r,4),sym(r,1),1,a*64)) //Load the state into xmm0 through xmm10
				}
				code("call","tjald_kernel_128") //Call the kernel, it loops r7 times
				for(a=0;a<11;a++){
					code("movdqu",adr(sym(r,4),sym(r,1),1,a*64),sym(x,a)) //Unload the state
				}
				code("sub",sym(r,1),sym(16))
				code("jns","2b")
			code("shl",sym(r,12),sym(9))
			code("add",sym(r,5),sym(r,12)) //Move r5 to point at the next macroblock of input
			code("mov",sym(r,12),sym(1<<bigblocksize)) //Load the next block size into r12, always 32 after the first block
			code("dec",sym(r,2))
			code("jnz","1b")
		label("0")
	code("ret")
	
	label("tjald_2_end_l3") //(tjald_2_state*, out)
		push_adjust(1,14,0,16,2)
		code("call","tjald_2_end_l3_inner")
		pop(1,14,0,16,false)
	code("ret")
	
	label("tjald_2_end_l3_inner") //(tjald_2_state*, out)
		code("mov",sym(r,3),sym(r,5)) //Set r3 to point to the output
		code("mov",sym(r,6),sym(r,4)) //Set r6 to point to the state
		code("mov",sym(e,10),adr(sym(r,4),null,null,768-4))
		code("cmp",sym(r,10),sym(512-4))
		code("ja","0f")
			//Short path, input <= 508 bytes
			code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,768)) //Set r4 to point to the end of data of the unprocessed buffer
			code("lea",sym(r,2),adr(sym(r,10),null,null,127+4))
			code("and",sym(r,2),sym(-128)) //Set r2 to the size of data to be processed including padding
			code("mov",sym(r,7),sym(r,2))
			code("sub",sym(r,7),sym(r,10)) //Set r7 to the size of the padding
			code("call","tjald_memzero_l3") //Zero the padding
			code("mov",adr(sym(r,6),sym(r,2),1,768-4),sym(e,10)) //Insert length at the end of padding
			code("mov",sym(r,7),sym(r,2))
			code("shr",sym(r,7),sym(7)) //Set r7 to the number of 128 byte blocks to be processed
			code("lea",sym(r,8),adr(sym(r,6),null,null,768))
			code("lea",sym(r,9),adr(sym(r,6),null,null,768+16)) //Point r8 and r9 at the buffer to be processed
			code("mov",sym(r,1),sym(r,6)) //Point r1 at the spot to load state
			code("jmp","1f")
		label("0") //Long path, input > 508 bytes
			code("or",sym(r,10),sym(-0x80000000))
			code("mov",adr(sym(r,4),null,null,768-4),sym(e,10))
			code("and",sym(r,10),sym(511))
			code("jz","2f")
				code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,768)) //Set r4 to point to the end of data of the unprocessed buffer
				code("mov",sym(r,7),sym(512))
				code("sub",sym(r,7),sym(r,10)) //Set r7 to the unused length of the unprocessed buffer
				code("call","tjald_memzero_l3") //Zero the unused part
				code("mov",sym(r,4),sym(r,6))
				code("lea",sym(r,5),adr(sym(r,6),null,null,768))
				code("mov",sym(r,12),sym(512))
				code("call","tjald_2_innerabsorb_l3") //Using r4, r5 and r12 as parameters
			label("2")
			code("mov",sym(r,7),sym(6)) //Set r7 to the number of 128 byte blocks to be processed
			code("mov",sym(r,8),sym(r,6))
			code("lea",sym(r,9),adr(sym(r,6),null,null,16))
			code("mov",sym(r,1),"$tjald_seed")
		label("1")
		for(a=0;a<11;a++){
			code("movdqu",sym(x,a),adr(sym(r,1),null,null,a*16)) //Load the state into xmm0 through xmm10
		}
		code("mov",sym(r,10),sym(32))
		code("mov",sym(r,11),sym(96))
		code("call","tjald_kernel_128")
		code("mov",sym(r,7),sym(4))
		code("call","tjald_final")
	code("ret")
	
	label("tjald_2_short")
		code("test",sym(r,4),sym(r,4))
		code("jnz","0f")
		code("mov",sym(r,4),"$tjald_seed")
		label("0")
		code("sub",sym(r,0),sym(256))
		for(a=0;a<11;a++){
			code("movdqu",sym(x,a),adr(sym(r,4),null,null,a*16)) //Load the state into xmm0 through xmm10
		}
		code("mov",sym(r,10),sym(32))
		code("mov",sym(r,11),sym(96))
		code("mov",sym(r,3),sym(r,7)) //Out ptr
		code("mov",sym(r,7),sym(r,6)) //In len
		code("mov",sym(r,12),sym(r,6)) //In len
		code("and",sym(r,6),sym(127)) //Final block length
		code("shr",sym(r,7),sym(7)) //Full blocks
		code("mov",sym(r,2),sym(r,7))
		code("jz","1f")
		
		code("mov",sym(r,8),sym(r,5))
		code("lea",sym(r,9),adr(sym(r,5),null,null,16))
		code("call","tjald_kernel_128")
		label("1")
		
		code("shl",sym(r,2),sym(7))
		code("add",sym(r,5),sym(r,2))
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,7),sym(r,6))
		code("call","tjald_memcpy_l3")
		code("lea",sym(r,4),adr(sym(r,0),sym(r,6))) //Final block padding destination
		code("lea",sym(r,1),adr(sym(r,6),null,null,127+4))
		code("and",sym(r,1),sym(-128)) //Padded length of final block
		code("mov",sym(r,7),sym(r,1))
		code("sub",sym(r,7),sym(r,6))
		code("call","tjald_memzero_l3") //Zero the padding
		code("mov",adr(sym(r,0),sym(r,1),1,-4),sym(e,12)) //Append length
		code("mov",sym(r,8),sym(r,0))
		code("lea",sym(r,9),adr(sym(r,0),null,null,16))
		code("mov",sym(r,7),sym(r,1))
		code("shr",sym(r,7),sym(7)) //Full blocks
		code("call","tjald_kernel_128")
		code("mov",sym(r,7),sym(4))
		code("call","tjald_final")
		
		code("add",sym(r,0),sym(256))
		pop(1,16,0,16,false)
	code("ret")
	
	label("tjald_2_l3")
		push_adjust(1,16,0,16,4)
		code("cmp",sym(r,6),sym(508))
		code("jbe","tjald_2_short")
		code("mov",sym(r,14),sym(r,7)) //Out ptr
		code("mov",sym(r,1),sym(r,5)) //In ptr
		code("mov",sym(r,2),sym(r,6)) //In len
		code("mov",sym(r,5),sym(r,4)) //Key ptr
		code("mov",sym(r,15),sym(r,0)) //Save stack ptr
		code("and",sym(r,0),sym(-64))
		code("sub",sym(r,0),sym(1280)) //State ptr
		code("mov",sym(r,4),sym(r,0))
		code("call","tjald_2_begin_l3_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,1))
		code("mov",sym(r,6),sym(r,2))
		code("call","tjald_2_absorb_l3_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,14))
		code("call","tjald_2_end_l3_inner")
		code("mov",sym(r,0),sym(r,15))
		pop(1,16,0,16,false)
	code("ret")
	
	label("tjald_2_begin_l4")
		push_adjust(3,14,15,16,2)
		code("call","tjald_2_begin_l4_inner")
		pop(3,14,15,16,true)
	code("ret")

	label("tjald_2_begin_l4_inner")
		code("test",sym(r,5),sym(r,5))
		code("jnz","0f")
		code("mov",sym(r,5),"$tjald_seed")
		label("0")
		code("mov",sym(r,7),sym(704))
		code("vpxor",sym(y,15),sym(y,15),sym(y,15))
		code("vmovdqu",adr(sym(r,4),null,null,704+0),sym(y,15))
		code("vmovdqu",adr(sym(r,4),null,null,704+32),sym(y,15))
		code("call","tjald_memcpy_l4")
	code("ret")
	
	label("tjald_2_absorb_l4")
		push_adjust(1,14,0,16,3)
		code("call","tjald_2_absorb_l4_inner")
		pop(1,14,0,16,true)
	code("ret")
	
	label("tjald_2_absorb_l4_inner") //(tjald_2_state*, input, length)
		code("mov",sym(e,8),adr(sym(r,4),null,null,768-4))
		code("lea",sym(r,7),adr(sym(r,8),sym(r,6),1,0))
		code("mov",sym(r,3),sym(r,6))
		code("add",sym(r,3),sym(-4096))
		code("sbb",sym(r,3),sym(r,3)) //Set r3 to -1 if input length >= 4096
		code("or",sym(r,3),sym(r,8))
		code("and",sym(r,3),sym(-0x80000000))
		code("or",sym(r,7),sym(r,3)) //Set bit 31 if it was already set, or the new input was long
		code("mov",adr(sym(r,4),null,null,768-4),sym(e,7))
		code("and",sym(r,8),sym(511)) //Set r8 to the length of unprocessed data stored
		code("jz","0f") //Jump if no unprocessed data is stored
			code("mov",sym(r,7),sym(r,6)) //Set r7 to input length
			code("add",sym(r,6),sym(r,8)) //Set r6 to the sum of input length and unprocessed data
			code("sub",sym(r,6),sym(512)) //Set r6 to the remaining input length after the partial block has been processed
			code("jns","1f") //Jump if there is enough data to process at least one block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,768)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l4") //Copy input to unprocessed data, using r4,r5 and r7
				code("jmp","2f")
			label("1")
				code("sub",sym(r,7),sym(r,6)) //Set r7 to the amount of data needed to be copied to unprocessed data in order to fill the buffer
				code("mov",sym(r,9),sym(r,4)) //Set r9 to the tjald_2_state pointer
				code("lea",sym(r,3),adr(sym(r,5),sym(r,7))) //Set r3 to point to the input after the partial block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,768)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l4") //Copy input to unprocessed data, using r4,r5 and r7
				code("mov",sym(r,4),sym(r,9)) //Set r4 to the tjald_2_state pointer
				code("lea",sym(r,5),adr(sym(r,4),null,null,768)) //Set r5 to point at the unprocessed data buffer
				code("mov",sym(r,12),sym(512)) //Set r7 to the unprocessed data buffer length
				code("call","tjald_2_innerabsorb_l4") //Using r4, r5 and r12 as parameters
				code("mov",sym(r,5),sym(r,3)) //Set r5 to point at the remaining input string
		label("0")
			code("mov",sym(r,12),sym(r,6)) //Set r7 to the remaining input length, r6 can have two different origins depending on previous branches
			code("call","tjald_2_innerabsorb_l4") //Using r4, r5 and r12 as parameters
			code("and",sym(r,6),sym(511)) //Set r6 to the length of unprocessed input
			code("mov",sym(r,7),sym(r,6))
			code("add",sym(r,4),sym(768)) //Point r4 at the unprocessed data buffer
			code("call","tjald_memcpy_l4") //Copy remaining data to unprocessed buffer
		label("2")
	code("ret")
	
	var bigblocksize=5
	label("tjald_2_innerabsorb_l4") //(tjald_2_state*, input, , r12:length) Updates r5 to be end of input processed
		code("shr",sym(r,12),sym(9)) //Set r12 to the number of whole 512 byte blocks to be processed.
		code("jz","0f") //Return if there are 0 blocks to process
		code("dec",sym(r,12))
		code("mov",sym(r,2),sym(r,12))
		code("shr",sym(r,2),sym(bigblocksize))
		code("and",sym(r,12),sym((1<<bigblocksize)-1))
		code("inc",sym(r,12)) //Set r12 to the number of blocks to process in the first round, from 1 to 32, so that there is a multiple of 32 remaining
		code("inc",sym(r,2)) //Set r2 to the number of 32x blocks to process, with the first one possibly being shorter
		code("mov",sym(r,10),sym(128))
		code("mov",sym(r,11),sym(384)) //Constants used by the inner processing loop
		label("1")
			code("mov",sym(r,1),sym(32)) //Set r1 to be a combined counter for a 4x loop and offset for loading data and state
			label("2")
				code("mov",sym(r,7),sym(r,12))
				code("lea",sym(r,8),adr(sym(r,5),sym(r,1),1,0)) //Set r8 and r9 to point at the data block with offsets applied
				code("lea",sym(r,9),adr(sym(r,5),sym(r,1),1,64))
				for(a=0;a<11;a++){
					code("vmovdqu",sym(y,a),adr(sym(r,4),sym(r,1),1,a*64)) //Load the state into xmm0 through xmm10
				}
				code("call","tjald_kernel_256") //Call the kernel, it loops r7 times
				for(a=0;a<11;a++){
					code("vmovdqu",adr(sym(r,4),sym(r,1),1,a*64),sym(y,a)) //Unload the state
				}
				code("sub",sym(r,1),sym(32))
				code("jns","2b")
			code("shl",sym(r,12),sym(9))
			code("add",sym(r,5),sym(r,12)) //Move r5 to point at the next macroblock of input
			code("mov",sym(r,12),sym(1<<bigblocksize)) //Load the next block size into r12, always 32 after the first block
			code("dec",sym(r,2))
			code("jnz","1b")
		label("0")
	code("ret")
	
	label("tjald_2_end_l4") //(tjald_2_state*, out)
		push_adjust(1,14,0,16,2)
		code("call","tjald_2_end_l4_inner")
		pop(1,14,0,16,true)
	code("ret")
	
	label("tjald_2_end_l4_inner") //(tjald_2_state*, out)
		code("mov",sym(r,3),sym(r,5)) //Set r3 to point to the output
		code("mov",sym(r,6),sym(r,4)) //Set r6 to point to the state
		code("mov",sym(e,10),adr(sym(r,4),null,null,768-4))
		code("cmp",sym(r,10),sym(512-4))
		code("ja","0f")
			//Short path, input <= 496 bytes
			code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,768)) //Set r4 to point to the end of data of the unprocessed buffer
			code("lea",sym(r,2),adr(sym(r,10),null,null,127+4))
			code("and",sym(r,2),sym(-128)) //Set r2 to the size of data to be processed including padding
			code("mov",sym(r,7),sym(r,2))
			code("sub",sym(r,7),sym(r,10)) //Set r7 to the size of the padding
			code("call","tjald_memzero_l4") //Zero the padding
			code("mov",adr(sym(r,6),sym(r,2),1,768-4),sym(e,10)) //Insert length at the end of padding
			code("mov",sym(r,7),sym(r,2))
			code("shr",sym(r,7),sym(7)) //Set r7 to the number of 128 byte blocks to be processed
			code("lea",sym(r,8),adr(sym(r,6),null,null,768))
			code("lea",sym(r,9),adr(sym(r,6),null,null,768+16)) //Point r8 and r9 at the buffer to be processed
			code("mov",sym(r,1),sym(r,6)) //Point r1 at the spot to load state
			code("jmp","1f")
		label("0") //Long path, input > 496 bytes
			code("or",sym(r,10),sym(-0x80000000))
			code("mov",adr(sym(r,4),null,null,768-4),sym(e,10))
			code("and",sym(r,10),sym(511))
			code("jz","2f")
				code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,768)) //Set r4 to point to the end of data of the unprocessed buffer
				code("mov",sym(r,7),sym(512))
				code("sub",sym(r,7),sym(r,10)) //Set r7 to the unused length of the unprocessed buffer
				code("call","tjald_memzero_l4") //Zero the unused part
				code("mov",sym(r,4),sym(r,6))
				code("lea",sym(r,5),adr(sym(r,6),null,null,768))
				code("mov",sym(r,12),sym(512))
				code("call","tjald_2_innerabsorb_l4") //Using r4, r5 and r12 as parameters
			label("2")
			code("mov",sym(r,7),sym(6)) //Set r7 to the number of 128 byte blocks to be processed
			code("mov",sym(r,8),sym(r,6))
			code("lea",sym(r,9),adr(sym(r,6),null,null,16))
			code("mov",sym(r,1),"$tjald_seed")
		label("1")
		for(a=0;a<11;a++){
			code("movdqu",sym(x,a),adr(sym(r,1),null,null,a*16)) //Load the state into xmm0 through xmm10
		}
		code("mov",sym(r,10),sym(32))
		code("mov",sym(r,11),sym(96))
		code("call","tjald_kernel_128")
		code("mov",sym(r,7),sym(4))
		code("call","tjald_final")
	code("ret")
	
	label("tjald_2_l4")
		push_adjust(1,16,0,16,4)
		code("cmp",sym(r,6),sym(508))
		code("jbe","tjald_2_short")
		code("mov",sym(r,14),sym(r,7)) //Out ptr
		code("mov",sym(r,1),sym(r,5)) //In ptr
		code("mov",sym(r,2),sym(r,6)) //In len
		code("mov",sym(r,5),sym(r,4)) //Key ptr
		code("mov",sym(r,15),sym(r,0)) //Save stack ptr
		code("and",sym(r,0),sym(-64))
		code("sub",sym(r,0),sym(1280)) //State ptr
		code("mov",sym(r,4),sym(r,0))
		code("call","tjald_2_begin_l4_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,1))
		code("mov",sym(r,6),sym(r,2))
		code("call","tjald_2_absorb_l4_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,14))
		code("call","tjald_2_end_l4_inner")
		code("mov",sym(r,0),sym(r,15))
		pop(1,16,0,16,true)
	code("ret")
	
	label("tjald_2_begin_l6")
		push_adjust(3,14,15,16,2)
		code("call","tjald_2_begin_l6_inner")
		pop(3,14,15,16,true)
	code("ret")

	label("tjald_2_begin_l6_inner")
		code("test",sym(r,5),sym(r,5))
		code("jnz","0f")
		code("mov",sym(r,5),"$tjald_seed")
		label("0")
		code("mov",sym(r,7),sym(704))
		code("vpxor",sym(z,15),sym(z,15),sym(z,15))
		code("vmovdqu",adr(sym(r,4),null,null,704+0),sym(z,15))
		code("call","tjald_memcpy_l6")
	code("ret")
	
	label("tjald_2_absorb_l6")
		push_adjust(1,14,0,16,3)
		code("call","tjald_2_absorb_l6_inner")
		pop(1,14,0,16,true)
	code("ret")
	
	label("tjald_2_absorb_l6_inner") //(tjald_2_state*, input, length)
		code("mov",sym(e,8),adr(sym(r,4),null,null,768-4))
		code("lea",sym(r,7),adr(sym(r,8),sym(r,6),1,0))
		code("mov",sym(r,3),sym(r,6))
		code("add",sym(r,3),sym(-4096))
		code("sbb",sym(r,3),sym(r,3)) //Set r3 to -1 if input length >= 4096
		code("or",sym(r,3),sym(r,8))
		code("and",sym(r,3),sym(-0x80000000))
		code("or",sym(r,7),sym(r,3)) //Set bit 31 if it was already set, or the new input was long
		code("mov",adr(sym(r,4),null,null,768-4),sym(e,7))
		code("and",sym(r,8),sym(511)) //Set r8 to the length of unprocessed data stored
		code("jz","0f") //Jump if no unprocessed data is stored
			code("mov",sym(r,7),sym(r,6)) //Set r7 to input length
			code("add",sym(r,6),sym(r,8)) //Set r6 to the sum of input length and unprocessed data
			code("sub",sym(r,6),sym(512)) //Set r6 to the remaining input length after the partial block has been processed
			code("jns","1f") //Jump if there is enough data to process at least one block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,768)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l6") //Copy input to unprocessed data, using r4,r5 and r7
				code("jmp","2f")
			label("1")
				code("sub",sym(r,7),sym(r,6)) //Set r7 to the amount of data needed to be copied to unprocessed data in order to fill the buffer
				code("mov",sym(r,9),sym(r,4)) //Set r9 to the tjald_2_state pointer
				code("lea",sym(r,3),adr(sym(r,5),sym(r,7))) //Set r3 to point to the input after the partial block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,768)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l6") //Copy input to unprocessed data, using r4,r5 and r7
				code("mov",sym(r,4),sym(r,9)) //Set r4 to the tjald_2_state pointer
				code("lea",sym(r,5),adr(sym(r,4),null,null,768)) //Set r5 to point at the unprocessed data buffer
				code("mov",sym(r,12),sym(512)) //Set r7 to the unprocessed data buffer length
				code("call","tjald_2_innerabsorb_l6") //Using r4, r5 and r12 as parameters
				code("mov",sym(r,5),sym(r,3)) //Set r5 to point at the remaining input string
		label("0")
			code("mov",sym(r,12),sym(r,6)) //Set r7 to the remaining input length, r6 can have two different origins depending on previous branches
			code("call","tjald_2_innerabsorb_l6") //Using r4, r5 and r12 as parameters
			code("and",sym(r,6),sym(511)) //Set r6 to the length of unprocessed input
			code("mov",sym(r,7),sym(r,6))
			code("add",sym(r,4),sym(768)) //Point r4 at the unprocessed data buffer
			code("call","tjald_memcpy_l6") //Copy remaining data to unprocessed buffer
		label("2")
	code("ret")
	
	label("tjald_2_innerabsorb_l6") //(tjald_2_state*, input, , r12:length) Updates r5 to be end of input processed
		code("shr",sym(r,12),sym(9)) //Set r12 to the number of whole 512 byte blocks to be processed.
		code("jz","0f") //Return if there are 0 blocks to process

		code("mov",sym(r,10),sym(128))
		code("mov",sym(r,11),sym(384)) //Constants used by the inner processing loop
		code("mov",sym(r,7),sym(r,12))
		code("mov",sym(r,8),sym(r,5))//Set r8 and r9 to point at the data block with offsets applied
		code("lea",sym(r,9),adr(sym(r,5),null,null,64))
		for(a=0;a<11;a++){
			code("vmovdqu",sym(z,a),adr(sym(r,4),null,null,a*64)) //Load the state into xmm0 through xmm10
		}
		code("call","tjald_kernel_512") //Call the kernel, it loops r7 times
		for(a=0;a<11;a++){
			code("vmovdqu",adr(sym(r,4),null,null,a*64),sym(z,a)) //Unload the state
		}
		code("shl",sym(r,12),sym(9))
		code("add",sym(r,5),sym(r,12)) //Move r5 to point at the end of used input
		label("0")
	code("ret")
	
	label("tjald_2_end_l6") //(tjald_2_state*, out)
		push_adjust(1,14,0,16,2)
		code("call","tjald_2_end_l6_inner")
		pop(1,14,0,16,true)
	code("ret")
	
	label("tjald_2_end_l6_inner") //(tjald_2_state*, out)
		code("mov",sym(r,3),sym(r,5)) //Set r3 to point to the output
		code("mov",sym(r,6),sym(r,4)) //Set r6 to point to the state
		code("mov",sym(e,10),adr(sym(r,4),null,null,768-4))
		code("cmp",sym(r,10),sym(512-4))
		code("ja","0f")
			//Short path, input <= 496 bytes
			code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,768)) //Set r4 to point to the end of data of the unprocessed buffer
			code("lea",sym(r,2),adr(sym(r,10),null,null,127+4))
			code("and",sym(r,2),sym(-128)) //Set r2 to the size of data to be processed including padding
			code("mov",sym(r,7),sym(r,2))
			code("sub",sym(r,7),sym(r,10)) //Set r7 to the size of the padding
			code("call","tjald_memzero_l6") //Zero the padding
			code("mov",adr(sym(r,6),sym(r,2),1,768-4),sym(e,10)) //Insert length at the end of padding
			code("mov",sym(r,7),sym(r,2))
			code("shr",sym(r,7),sym(7)) //Set r7 to the number of 128 byte blocks to be processed
			code("lea",sym(r,8),adr(sym(r,6),null,null,768))
			code("lea",sym(r,9),adr(sym(r,6),null,null,768+16)) //Point r8 and r9 at the buffer to be processed
			code("mov",sym(r,1),sym(r,6)) //Point r1 at the spot to load state
			code("jmp","1f")
		label("0") //Long path, input > 496 bytes
			code("or",sym(r,10),sym(-0x80000000))
			code("mov",adr(sym(r,4),null,null,768-4),sym(e,10))
			code("and",sym(r,10),sym(511))
			code("jz","2f")
				code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,768)) //Set r4 to point to the end of data of the unprocessed buffer
				code("mov",sym(r,7),sym(512))
				code("sub",sym(r,7),sym(r,10)) //Set r7 to the unused length of the unprocessed buffer
				code("call","tjald_memzero_l6") //Zero the unused part
				code("mov",sym(r,4),sym(r,6))
				code("lea",sym(r,5),adr(sym(r,6),null,null,768))
				code("mov",sym(r,12),sym(512))
				code("call","tjald_2_innerabsorb_l6") //Using r4, r5 and r12 as parameters
			label("2")
			code("mov",sym(r,7),sym(6)) //Set r7 to the number of 128 byte blocks to be processed
			code("mov",sym(r,8),sym(r,6))
			code("lea",sym(r,9),adr(sym(r,6),null,null,16))
			code("mov",sym(r,1),"$tjald_seed")
		label("1")
		for(a=0;a<11;a++){
			code("movdqu",sym(x,a),adr(sym(r,1),null,null,a*16)) //Load the state into xmm0 through xmm10
		}
		code("mov",sym(r,10),sym(32))
		code("mov",sym(r,11),sym(96))
		code("call","tjald_kernel_128")
		code("mov",sym(r,7),sym(4))
		code("call","tjald_final")
	code("ret")
	
	label("tjald_2_l6")
		push_adjust(1,16,0,16,4)
		code("cmp",sym(r,6),sym(508))
		code("jbe","tjald_2_short")
		code("mov",sym(r,14),sym(r,7)) //Out ptr
		code("mov",sym(r,1),sym(r,5)) //In ptr
		code("mov",sym(r,2),sym(r,6)) //In len
		code("mov",sym(r,5),sym(r,4)) //Key ptr
		code("mov",sym(r,15),sym(r,0)) //Save stack ptr
		code("and",sym(r,0),sym(-64))
		code("sub",sym(r,0),sym(1280)) //State ptr
		code("mov",sym(r,4),sym(r,0))
		code("call","tjald_2_begin_l6_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,1))
		code("mov",sym(r,6),sym(r,2))
		code("call","tjald_2_absorb_l6_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,14))
		code("call","tjald_2_end_l6_inner")
		code("mov",sym(r,0),sym(r,15))
		pop(1,16,0,16,true)
	code("ret")
	
	
	
	


	label("tjald_3_begin_l3")
		push_adjust(3,14,15,16,2)
		code("call","tjald_3_begin_l3_inner")
		pop(3,14,15,16,false)
	code("ret")

	label("tjald_3_begin_l3_inner")
		code("test",sym(r,5),sym(r,5))
		code("jnz","0f")
		code("mov",sym(r,5),"$tjald_seed")
		label("0")
		code("mov",sym(r,7),sym(704))
		code("mov",sym(r,6),sym(r,4))
		code("call","tjald_memcpy_l3")
		code("lea",sym(r,4),adr(sym(r,6),null,null,704))
		code("mov",sym(r,7),sym(320))
		code("call","tjald_memzero_l3")
	code("ret")

	label("tjald_3_absorb_l3") //(tjald_2_state*, input, length)
		push_adjust(1,14,0,16,3)
		code("call","tjald_3_absorb_l3_inner")
		pop(1,14,0,16,false)
	code("ret")
	
	label("tjald_3_absorb_l3_inner") //(tjald_2_state*, input, length)
		code("mov",sym(e,8),adr(sym(r,4),null,null,1024-4))
		code("lea",sym(r,7),adr(sym(r,8),sym(r,6),1,0))
		code("mov",sym(r,3),sym(r,6))
		code("add",sym(r,3),sym(-4096))
		code("sbb",sym(r,3),sym(r,3)) //Set r3 to -1 if input length >= 4096
		code("or",sym(r,3),sym(r,8))
		code("and",sym(r,3),sym(-0x80000000))
		code("or",sym(r,7),sym(r,3)) //Set bit 31 if it was already set, or the new input was long
		code("mov",adr(sym(r,4),null,null,1024-4),sym(e,7))
		code("and",sym(r,8),sym(2047)) //Set r8 to the length of unprocessed data stored
		code("jz","0f") //Jump if no unprocessed data is stored
			code("mov",sym(r,7),sym(r,6)) //Set r7 to input length
			code("add",sym(r,6),sym(r,8)) //Set r6 to the sum of input length and unprocessed data
			code("sub",sym(r,6),sym(2048)) //Set r6 to the remaining input length after the partial block has been processed
			code("jns","1f") //Jump if there is enough data to process at least one block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,1024)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l3") //Copy input to unprocessed data, using r4,r5 and r7
				code("jmp","2f")
			label("1")
				code("sub",sym(r,7),sym(r,6)) //Set r7 to the amount of data needed to be copied to unprocessed data in order to fill the buffer
				code("mov",sym(r,9),sym(r,4)) //Set r9 to the tjald_2_state pointer
				code("lea",sym(r,3),adr(sym(r,5),sym(r,7))) //Set r3 to point to the input after the partial block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,1024)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l3") //Copy input to unprocessed data, using r4,r5 and r7
				code("mov",sym(r,4),sym(r,9)) //Set r4 to the tjald_2_state pointer
				code("lea",sym(r,5),adr(sym(r,4),null,null,1024)) //Set r5 to point at the unprocessed data buffer
				code("mov",sym(r,12),sym(2048)) //Set r7 to the unprocessed data buffer length
				code("call","tjald_3_innerabsorb_l3") //Using r4, r5 and r12 as parameters
				code("mov",sym(r,5),sym(r,3)) //Set r5 to point at the remaining input string
		label("0")
			code("mov",sym(r,12),sym(r,6)) //Set r7 to the remaining input length, r6 can have two different origins depending on previous branches
			code("call","tjald_3_innerabsorb_l3") //Using r4, r5 and r12 as parameters
			code("and",sym(r,6),sym(2047)) //Set r6 to the length of unprocessed input
			code("mov",sym(r,7),sym(r,6))
			code("add",sym(r,4),sym(1024)) //Point r4 at the unprocessed data buffer
			code("call","tjald_memcpy_l3") //Copy remaining data to unprocessed buffer
		label("2")
	code("ret")
	
	label("tjald_3_innerabsorb_l3") //(tjald_2_state*, input, , r12:length) Updates r5 to be end of input processed
		code("shr",sym(r,12),sym(11)) //Set r12 to the number of whole 2048 byte blocks to be processed.
		code("jz","0f") //Return if there are 0 blocks to process
		code("mov",sym(r,10),sym(128))
		code("mov",sym(r,11),sym(384)) //Constants used by the inner processing loop
		code("movdqu",sym(x,14),"[tjald_small_seed]")
		label("1")
			code("mov",sym(r,1),sym(48)) //Set r1 to be a combined counter for a 4x loop and offset for loading data and state
			label("2")
				for(a=0;a<11;a++){
					code("movdqu",sym(x,a),adr(sym(r,4),sym(r,1),1,a*64)) //Load the state into xmm0 through xmm10
				}
				code("lea",sym(r,8),adr(sym(r,5),sym(r,1),1,0)) //Set r8 and r9 to point at the data block with offsets applied
				code("lea",sym(r,9),adr(sym(r,5),sym(r,1),1,64))
				code("mov",sym(r,7),sym(4))
				code("call","tjald_kernel_128") //Call the kernel, it loops r7 times
				code("vpaddb",sym(x,6),sym(x,6),sym(x,14))
				code("lea",sym(r,8),adr(sym(r,5),sym(r,1),1,64)) //Set r8 and r9 to point at the data block with offsets applied
				code("lea",sym(r,9),adr(sym(r,5),sym(r,1),1,0))
				code("mov",sym(r,7),sym(2))
				code("call","tjald_kernel_128") //Call the kernel, it loops r7 times
				code("vpaddb",sym(x,2),sym(x,2),sym(x,14))
				code("mov",sym(r,7),sym(2))
				code("call","tjald_kernel_128") //Call the kernel, it loops r7 times
				code("vpsubb",sym(x,2),sym(x,2),sym(x,14))
				for(a=0;a<11;a++){
					code("movdqu",adr(sym(r,4),sym(r,1),1,a*64),sym(x,a)) //Unload the state
				}
				code("sub",sym(r,1),sym(16))
				code("jns","2b")
			code("add",sym(r,5),sym(2048)) //Move r5 to point at the next block of input
			code("dec",sym(r,12))
			code("jnz","1b")
		label("0")
	code("ret")
	
	label("tjald_3_end_l3") //(tjald_2_state*, out)
		push_adjust(1,14,0,16,2)
		code("call","tjald_3_end_l3_inner")
		pop(1,14,0,16,false)
	code("ret")
	
	label("tjald_3_end_l3_inner") //(tjald_2_state*, out)
		code("mov",sym(r,3),sym(r,5)) //Set r3 to point to the output
		code("mov",sym(r,6),sym(r,4)) //Set r6 to point to the state
		code("mov",sym(e,10),adr(sym(r,4),null,null,1024-4))
		code("cmp",sym(r,10),sym(2048-4))
		code("ja","0f")
			//Short path, input <= 496 bytes
			code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,1024)) //Set r4 to point to the end of data of the unprocessed buffer
			code("lea",sym(r,2),adr(sym(r,10),null,null,511+4))
			code("and",sym(r,2),sym(-512)) //Set r2 to the size of data to be processed including padding
			code("mov",sym(r,7),sym(r,2))
			code("sub",sym(r,7),sym(r,10)) //Set r7 to the size of the padding
			code("call","tjald_memzero_l3") //Zero the padding
			code("mov",adr(sym(r,6),sym(r,2),1,1024-4),sym(e,10)) //Insert length at the end of padding
			code("mov",sym(r,12),sym(r,2))
			code("shr",sym(r,12),sym(9)) //Set r12 to the number of 512 byte blocks to be processed
			code("mov",sym(r,1),sym(r,6)) //Point r1 at the spot to load state
			code("add",sym(r,6),sym(1024)) //Point r6 at the buffer to be processed
			code("jmp","1f")
		label("0") //Long path, input > 496 bytes
			code("or",sym(r,10),sym(-0x80000000))
			code("mov",adr(sym(r,4),null,null,1024-4),sym(e,10))
			code("and",sym(r,10),sym(2047))
			code("jz","3f")
				code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,1024)) //Set r4 to point to the end of data of the unprocessed buffer
				code("mov",sym(r,7),sym(2048))
				code("sub",sym(r,7),sym(r,10)) //Set r7 to the unused length of the unprocessed buffer
				code("call","tjald_memzero_l3") //Zero the unused part
				code("mov",sym(r,4),sym(r,6))
				code("lea",sym(r,5),adr(sym(r,6),null,null,1024))
				code("mov",sym(r,12),sym(2048))
				code("call","tjald_3_innerabsorb_l3") //Using r4, r5 and r12 as parameters
			label("3")
			code("mov",sym(r,12),sym(2)) //Set r12 to the number of 512 byte blocks to be processed
			code("mov",sym(r,1),"$tjald_seed")
		label("1")
		for(a=0;a<11;a++){
			code("movdqu",sym(x,a),adr(sym(r,1),null,null,a*16)) //Load the state into xmm0 through xmm10
		}
		code("mov",sym(r,10),sym(32))
		code("mov",sym(r,11),sym(96))
		code("movdqu",sym(x,14),"[tjald_small_seed]")
		label("2")
			code("mov",sym(r,8),sym(r,6))
			code("lea",sym(r,9),adr(sym(r,6),null,null,16))
			code("mov",sym(r,7),sym(4))
			code("call","tjald_kernel_128")
			code("vpaddb",sym(x,6),sym(x,6),sym(x,14))
			code("lea",sym(r,8),adr(sym(r,6),null,null,16))
			code("mov",sym(r,9),sym(r,6))
			code("mov",sym(r,7),sym(2))
			code("call","tjald_kernel_128")
			code("vpaddb",sym(x,2),sym(x,2),sym(x,14))
			code("mov",sym(r,7),sym(2))
			code("call","tjald_kernel_128")
			code("vpsubb",sym(x,2),sym(x,2),sym(x,14))
			
			code("add",sym(r,6),sym(512))
			code("dec",sym(r,12))
			code("jnz","2b")
		code("mov",sym(r,7),sym(6))
		code("call","tjald_final")
	code("ret")
	
	label("tjald_3_l3")
		push_adjust(1,16,0,16,4)
		code("mov",sym(r,14),sym(r,7)) //Out ptr
		code("mov",sym(r,1),sym(r,5)) //In ptr
		code("mov",sym(r,2),sym(r,6)) //In len
		code("mov",sym(r,5),sym(r,4)) //Key ptr
		code("mov",sym(r,15),sym(r,0)) //Save stack ptr
		code("and",sym(r,0),sym(-64))
		code("sub",sym(r,0),sym(3072)) //State ptr
		code("mov",sym(r,4),sym(r,0))
		code("call","tjald_3_begin_l3_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,1))
		code("mov",sym(r,6),sym(r,2))
		code("call","tjald_3_absorb_l3_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,14))
		code("call","tjald_3_end_l3_inner")
		code("mov",sym(r,0),sym(r,15))
		pop(1,16,0,16,false)
	code("ret")
	
	
	
	
	
	label("tjald_3_begin_l4")
		push_adjust(3,14,15,16,2)
		code("call","tjald_3_begin_l4_inner")
		pop(3,14,15,16,true)
	code("ret")

	label("tjald_3_begin_l4_inner")
		code("test",sym(r,5),sym(r,5))
		code("jnz","0f")
		code("mov",sym(r,5),"$tjald_seed")
		label("0")
		code("mov",sym(r,7),sym(704))
		code("mov",sym(r,6),sym(r,4))
		code("call","tjald_memcpy_l4")
		code("lea",sym(r,4),adr(sym(r,6),null,null,704))
		code("mov",sym(r,7),sym(320))
		code("call","tjald_memzero_l4")
	code("ret")

	label("tjald_3_absorb_l4") //(tjald_2_state*, input, length)
		push_adjust(1,14,0,16,3)
		code("call","tjald_3_absorb_l4_inner")
		pop(1,14,0,16,true)
	code("ret")
	
	label("tjald_3_absorb_l4_inner") //(tjald_2_state*, input, length)
		code("mov",sym(e,8),adr(sym(r,4),null,null,1024-4))
		code("lea",sym(r,7),adr(sym(r,8),sym(r,6),1,0))
		code("mov",sym(r,3),sym(r,6))
		code("add",sym(r,3),sym(-4096))
		code("sbb",sym(r,3),sym(r,3)) //Set r3 to -1 if input length >= 4096
		code("or",sym(r,3),sym(r,8))
		code("and",sym(r,3),sym(-0x80000000))
		code("or",sym(r,7),sym(r,3)) //Set bit 31 if it was already set, or the new input was long
		code("mov",adr(sym(r,4),null,null,1024-4),sym(e,7))
		code("and",sym(r,8),sym(2047)) //Set r8 to the length of unprocessed data stored
		code("jz","0f") //Jump if no unprocessed data is stored
			code("mov",sym(r,7),sym(r,6)) //Set r7 to input length
			code("add",sym(r,6),sym(r,8)) //Set r6 to the sum of input length and unprocessed data
			code("sub",sym(r,6),sym(2048)) //Set r6 to the remaining input length after the partial block has been processed
			code("jns","1f") //Jump if there is enough data to process at least one block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,1024)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l4") //Copy input to unprocessed data, using r4,r5 and r7
				code("jmp","2f")
			label("1")
				code("sub",sym(r,7),sym(r,6)) //Set r7 to the amount of data needed to be copied to unprocessed data in order to fill the buffer
				code("mov",sym(r,9),sym(r,4)) //Set r9 to the tjald_2_state pointer
				code("lea",sym(r,3),adr(sym(r,5),sym(r,7))) //Set r3 to point to the input after the partial block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,1024)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l4") //Copy input to unprocessed data, using r4,r5 and r7
				code("mov",sym(r,4),sym(r,9)) //Set r4 to the tjald_2_state pointer
				code("lea",sym(r,5),adr(sym(r,4),null,null,1024)) //Set r5 to point at the unprocessed data buffer
				code("mov",sym(r,12),sym(2048)) //Set r7 to the unprocessed data buffer length
				code("call","tjald_3_innerabsorb_l4") //Using r4, r5 and r12 as parameters
				code("mov",sym(r,5),sym(r,3)) //Set r5 to point at the remaining input string
		label("0")
			code("mov",sym(r,12),sym(r,6)) //Set r7 to the remaining input length, r6 can have two different origins depending on previous branches
			code("call","tjald_3_innerabsorb_l4") //Using r4, r5 and r12 as parameters
			code("and",sym(r,6),sym(2047)) //Set r6 to the length of unprocessed input
			code("mov",sym(r,7),sym(r,6))
			code("add",sym(r,4),sym(1024)) //Point r4 at the unprocessed data buffer
			code("call","tjald_memcpy_l4") //Copy remaining data to unprocessed buffer
		label("2")
	code("ret")
	
	label("tjald_3_innerabsorb_l4") //(tjald_2_state*, input, , r12:length) Updates r5 to be end of input processed
		code("shr",sym(r,12),sym(11)) //Set r12 to the number of whole 2048 byte blocks to be processed.
		code("jz","0f") //Return if there are 0 blocks to process
		code("mov",sym(r,10),sym(128))
		code("mov",sym(r,11),sym(384)) //Constants used by the inner processing loop
		code("vmovdqu",sym(y,14),"[tjald_small_seed]")
		label("1")
			code("mov",sym(r,1),sym(32)) //Set r1 to be a combined counter for a 4x loop and offset for loading data and state
			label("2")
				for(a=0;a<11;a++){
					code("vmovdqu",sym(y,a),adr(sym(r,4),sym(r,1),1,a*64)) //Load the state into xmm0 through xmm10
				}
				code("lea",sym(r,8),adr(sym(r,5),sym(r,1),1,0)) //Set r8 and r9 to point at the data block with offsets applied
				code("lea",sym(r,9),adr(sym(r,5),sym(r,1),1,64))
				code("mov",sym(r,7),sym(4))
				code("call","tjald_kernel_256") //Call the kernel, it loops r7 times
				code("vpaddb",sym(y,6),sym(y,6),sym(y,14))
				code("lea",sym(r,8),adr(sym(r,5),sym(r,1),1,64)) //Set r8 and r9 to point at the data block with offsets applied
				code("lea",sym(r,9),adr(sym(r,5),sym(r,1),1,0))
				code("mov",sym(r,7),sym(2))
				code("call","tjald_kernel_256") //Call the kernel, it loops r7 times
				code("vpaddb",sym(y,2),sym(y,2),sym(y,14))
				code("mov",sym(r,7),sym(2))
				code("call","tjald_kernel_256") //Call the kernel, it loops r7 times
				code("vpsubb",sym(y,2),sym(y,2),sym(y,14))
				for(a=0;a<11;a++){
					code("vmovdqu",adr(sym(r,4),sym(r,1),1,a*64),sym(y,a)) //Unload the state
				}
				code("sub",sym(r,1),sym(32))
				code("jns","2b")
			code("add",sym(r,5),sym(2048)) //Move r5 to point at the next block of input
			code("dec",sym(r,12))
			code("jnz","1b")
		label("0")
	code("ret")
	
	label("tjald_3_end_l4") //(tjald_2_state*, out)
		push_adjust(1,14,0,16,2)
		code("call","tjald_3_end_l4_inner")
		pop(1,14,0,16,true)
	code("ret")
	
	label("tjald_3_end_l4_inner") //(tjald_2_state*, out)
		code("mov",sym(r,3),sym(r,5)) //Set r3 to point to the output
		code("mov",sym(r,6),sym(r,4)) //Set r6 to point to the state
		code("mov",sym(e,10),adr(sym(r,4),null,null,1024-4))
		code("cmp",sym(r,10),sym(2048-4))
		code("ja","0f")
			//Short path, input <= 496 bytes
			code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,1024)) //Set r4 to point to the end of data of the unprocessed buffer
			code("lea",sym(r,2),adr(sym(r,10),null,null,511+4))
			code("and",sym(r,2),sym(-512)) //Set r2 to the size of data to be processed including padding
			code("mov",sym(r,7),sym(r,2))
			code("sub",sym(r,7),sym(r,10)) //Set r7 to the size of the padding
			code("call","tjald_memzero_l4") //Zero the padding
			code("mov",adr(sym(r,6),sym(r,2),1,1024-4),sym(e,10)) //Insert length at the end of padding
			code("mov",sym(r,12),sym(r,2))
			code("shr",sym(r,12),sym(9)) //Set r12 to the number of 512 byte blocks to be processed
			code("mov",sym(r,1),sym(r,6)) //Point r1 at the spot to load state
			code("add",sym(r,6),sym(1024)) //Point r6 at the buffer to be processed
			code("jmp","1f")
		label("0") //Long path, input > 496 bytes
			code("or",sym(r,10),sym(-0x80000000))
			code("mov",adr(sym(r,4),null,null,1024-4),sym(e,10))
			code("and",sym(r,10),sym(2047))
			code("jz","3f")
				code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,1024)) //Set r4 to point to the end of data of the unprocessed buffer
				code("mov",sym(r,7),sym(2048))
				code("sub",sym(r,7),sym(r,10)) //Set r7 to the unused length of the unprocessed buffer
				code("call","tjald_memzero_l4") //Zero the unused part
				code("mov",sym(r,4),sym(r,6))
				code("lea",sym(r,5),adr(sym(r,6),null,null,1024))
				code("mov",sym(r,12),sym(2048))
				code("call","tjald_3_innerabsorb_l4") //Using r4, r5 and r12 as parameters
			label("3")
			code("mov",sym(r,12),sym(2)) //Set r12 to the number of 512 byte blocks to be processed
			code("mov",sym(r,1),"$tjald_seed")
		label("1")
		for(a=0;a<11;a++){
			code("movdqu",sym(x,a),adr(sym(r,1),null,null,a*16)) //Load the state into xmm0 through xmm10
		}
		code("mov",sym(r,10),sym(32))
		code("mov",sym(r,11),sym(96))
		code("movdqu",sym(x,14),"[tjald_small_seed]")
		label("2")
			code("mov",sym(r,8),sym(r,6))
			code("lea",sym(r,9),adr(sym(r,6),null,null,16))
			code("mov",sym(r,7),sym(4))
			code("call","tjald_kernel_128")
			code("vpaddb",sym(x,6),sym(x,6),sym(x,14))
			code("lea",sym(r,8),adr(sym(r,6),null,null,16))
			code("mov",sym(r,9),sym(r,6))
			code("mov",sym(r,7),sym(2))
			code("call","tjald_kernel_128")
			code("vpaddb",sym(x,2),sym(x,2),sym(x,14))
			code("mov",sym(r,7),sym(2))
			code("call","tjald_kernel_128")
			code("vpsubb",sym(x,2),sym(x,2),sym(x,14))
			
			code("add",sym(r,6),sym(512))
			code("dec",sym(r,12))
			code("jnz","2b")
		code("mov",sym(r,7),sym(6))
		code("call","tjald_final")
	code("ret")
	
	label("tjald_3_l4")
		push_adjust(1,16,0,16,4)
		code("mov",sym(r,14),sym(r,7)) //Out ptr
		code("mov",sym(r,1),sym(r,5)) //In ptr
		code("mov",sym(r,2),sym(r,6)) //In len
		code("mov",sym(r,5),sym(r,4)) //Key ptr
		code("mov",sym(r,15),sym(r,0)) //Save stack ptr
		code("and",sym(r,0),sym(-64))
		code("sub",sym(r,0),sym(3072)) //State ptr
		code("mov",sym(r,4),sym(r,0))
		code("call","tjald_3_begin_l4_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,1))
		code("mov",sym(r,6),sym(r,2))
		code("call","tjald_3_absorb_l4_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,14))
		code("call","tjald_3_end_l4_inner")
		code("mov",sym(r,0),sym(r,15))
		pop(1,16,0,16,true)
	code("ret")
	
	
	
	
	
	label("tjald_3_begin_l6")
		push_adjust(3,14,15,16,2)
		code("call","tjald_3_begin_l6_inner")
		pop(3,14,15,16,true)
	code("ret")

	label("tjald_3_begin_l6_inner")
		code("test",sym(r,5),sym(r,5))
		code("jnz","0f")
		code("mov",sym(r,5),"$tjald_seed")
		label("0")
		code("mov",sym(r,7),sym(704))
		code("mov",sym(r,6),sym(r,4))
		code("call","tjald_memcpy_l6")
		code("lea",sym(r,4),adr(sym(r,6),null,null,704))
		code("mov",sym(r,7),sym(320))
		code("call","tjald_memzero_l6")
	code("ret")

	label("tjald_3_absorb_l6") //(tjald_2_state*, input, length)
		push_adjust(1,14,0,16,3)
		code("call","tjald_3_absorb_l6_inner")
		pop(1,14,0,16,true)
	code("ret")
	
	label("tjald_3_absorb_l6_inner") //(tjald_2_state*, input, length)
		code("mov",sym(e,8),adr(sym(r,4),null,null,1024-4))
		code("lea",sym(r,7),adr(sym(r,8),sym(r,6),1,0))
		code("mov",sym(r,3),sym(r,6))
		code("add",sym(r,3),sym(-4096))
		code("sbb",sym(r,3),sym(r,3)) //Set r3 to -1 if input length >= 4096
		code("or",sym(r,3),sym(r,8))
		code("and",sym(r,3),sym(-0x80000000))
		code("or",sym(r,7),sym(r,3)) //Set bit 31 if it was already set, or the new input was long
		code("mov",adr(sym(r,4),null,null,1024-4),sym(e,7))
		code("and",sym(r,8),sym(2047)) //Set r8 to the length of unprocessed data stored
		code("jz","0f") //Jump if no unprocessed data is stored
			code("mov",sym(r,7),sym(r,6)) //Set r7 to input length
			code("add",sym(r,6),sym(r,8)) //Set r6 to the sum of input length and unprocessed data
			code("sub",sym(r,6),sym(2048)) //Set r6 to the remaining input length after the partial block has been processed
			code("jns","1f") //Jump if there is enough data to process at least one block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,1024)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l6") //Copy input to unprocessed data, using r4,r5 and r7
				code("jmp","2f")
			label("1")
				code("sub",sym(r,7),sym(r,6)) //Set r7 to the amount of data needed to be copied to unprocessed data in order to fill the buffer
				code("mov",sym(r,9),sym(r,4)) //Set r9 to the tjald_2_state pointer
				code("lea",sym(r,3),adr(sym(r,5),sym(r,7))) //Set r3 to point to the input after the partial block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,1024)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l6") //Copy input to unprocessed data, using r4,r5 and r7
				code("mov",sym(r,4),sym(r,9)) //Set r4 to the tjald_2_state pointer
				code("lea",sym(r,5),adr(sym(r,4),null,null,1024)) //Set r5 to point at the unprocessed data buffer
				code("mov",sym(r,12),sym(2048)) //Set r7 to the unprocessed data buffer length
				code("call","tjald_3_innerabsorb_l6") //Using r4, r5 and r12 as parameters
				code("mov",sym(r,5),sym(r,3)) //Set r5 to point at the remaining input string
		label("0")
			code("mov",sym(r,12),sym(r,6)) //Set r7 to the remaining input length, r6 can have two different origins depending on previous branches
			code("call","tjald_3_innerabsorb_l6") //Using r4, r5 and r12 as parameters
			code("and",sym(r,6),sym(2047)) //Set r6 to the length of unprocessed input
			code("mov",sym(r,7),sym(r,6))
			code("add",sym(r,4),sym(1024)) //Point r4 at the unprocessed data buffer
			code("call","tjald_memcpy_l6") //Copy remaining data to unprocessed buffer
		label("2")
	code("ret")
	
	label("tjald_3_innerabsorb_l6") //(tjald_2_state*, input, , r12:length) Updates r5 to be end of input processed
		code("shr",sym(r,12),sym(11)) //Set r12 to the number of whole 2048 byte blocks to be processed.
		code("jz","0f") //Return if there are 0 blocks to process
		code("mov",sym(r,10),sym(128))
		code("mov",sym(r,11),sym(384)) //Constants used by the inner processing loop
		code("vmovdqu",sym(z,14),"[tjald_small_seed]")
		for(a=0;a<11;a++){
			code("vmovdqu",sym(z,a),adr(sym(r,4),null,null,a*64)) //Load the state into xmm0 through xmm10
		}
		label("1")
			code("mov",sym(r,8),sym(r,5)) //Set r8 and r9 to point at the data block with offsets applied
			code("lea",sym(r,9),adr(sym(r,5),null,null,64))
			code("mov",sym(r,7),sym(4))
			code("call","tjald_kernel_512") //Call the kernel, it loops r7 times
			code("vpaddb",sym(z,6),sym(z,6),sym(z,14))
			code("lea",sym(r,8),adr(sym(r,5),null,null,64)) //Set r8 and r9 to point at the data block with offsets applied
			code("mov",sym(r,9),sym(r,5))
			code("mov",sym(r,7),sym(2))
			code("call","tjald_kernel_512") //Call the kernel, it loops r7 times
			code("vpaddb",sym(z,2),sym(z,2),sym(z,14))
			code("mov",sym(r,7),sym(2))
			code("call","tjald_kernel_512") //Call the kernel, it loops r7 times
			code("vpsubb",sym(z,2),sym(z,2),sym(z,14))
			code("add",sym(r,5),sym(2048)) //Move r5 to point at the next block of input
			code("dec",sym(r,12))
		code("jnz","1b")
		for(a=0;a<11;a++){
			code("vmovdqu",adr(sym(r,4),null,null,a*64),sym(z,a)) //Unload the state
		}
		label("0")
	code("ret")
	
	label("tjald_3_end_l6") //(tjald_2_state*, out)
		push_adjust(1,14,0,16,2)
		code("call","tjald_3_end_l6_inner")
		pop(1,14,0,16,true)
	code("ret")
	
	label("tjald_3_end_l6_inner") //(tjald_2_state*, out)
		code("mov",sym(r,3),sym(r,5)) //Set r3 to point to the output
		code("mov",sym(r,6),sym(r,4)) //Set r6 to point to the state
		code("mov",sym(e,10),adr(sym(r,4),null,null,1024-4))
		code("cmp",sym(r,10),sym(2048-4))
		code("ja","0f")
			//Short path, input <= 496 bytes
			code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,1024)) //Set r4 to point to the end of data of the unprocessed buffer
			code("lea",sym(r,2),adr(sym(r,10),null,null,511+4))
			code("and",sym(r,2),sym(-512)) //Set r2 to the size of data to be processed including padding
			code("mov",sym(r,7),sym(r,2))
			code("sub",sym(r,7),sym(r,10)) //Set r7 to the size of the padding
			code("call","tjald_memzero_l6") //Zero the padding
			code("mov",adr(sym(r,6),sym(r,2),1,1024-4),sym(e,10)) //Insert length at the end of padding
			code("mov",sym(r,12),sym(r,2))
			code("shr",sym(r,12),sym(9)) //Set r12 to the number of 512 byte blocks to be processed
			code("mov",sym(r,1),sym(r,6)) //Point r1 at the spot to load state
			code("add",sym(r,6),sym(1024)) //Point r6 at the buffer to be processed
			code("jmp","1f")
		label("0") //Long path, input > 496 bytes
			code("or",sym(r,10),sym(-0x80000000))
			code("mov",adr(sym(r,4),null,null,1024-4),sym(e,10))
			code("and",sym(r,10),sym(2047))
			code("jz","3f")
				code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,1024)) //Set r4 to point to the end of data of the unprocessed buffer
				code("mov",sym(r,7),sym(2048))
				code("sub",sym(r,7),sym(r,10)) //Set r7 to the unused length of the unprocessed buffer
				code("call","tjald_memzero_l6") //Zero the unused part
				code("mov",sym(r,4),sym(r,6))
				code("lea",sym(r,5),adr(sym(r,6),null,null,1024))
				code("mov",sym(r,12),sym(2048))
				code("call","tjald_3_innerabsorb_l6") //Using r4, r5 and r12 as parameters
			label("3")
			code("mov",sym(r,12),sym(2)) //Set r12 to the number of 512 byte blocks to be processed
			code("mov",sym(r,1),"$tjald_seed")
		label("1")
		for(a=0;a<11;a++){
			code("movdqu",sym(x,a),adr(sym(r,1),null,null,a*16)) //Load the state into xmm0 through xmm10
		}
		code("mov",sym(r,10),sym(32))
		code("mov",sym(r,11),sym(96))
		code("movdqu",sym(x,14),"[tjald_small_seed]")
		label("2")
			code("mov",sym(r,8),sym(r,6))
			code("lea",sym(r,9),adr(sym(r,6),null,null,16))
			code("mov",sym(r,7),sym(4))
			code("call","tjald_kernel_128")
			code("vpaddb",sym(x,6),sym(x,6),sym(x,14))
			code("lea",sym(r,8),adr(sym(r,6),null,null,16))
			code("mov",sym(r,9),sym(r,6))
			code("mov",sym(r,7),sym(2))
			code("call","tjald_kernel_128")
			code("vpaddb",sym(x,2),sym(x,2),sym(x,14))
			code("mov",sym(r,7),sym(2))
			code("call","tjald_kernel_128")
			code("vpsubb",sym(x,2),sym(x,2),sym(x,14))
			
			code("add",sym(r,6),sym(512))
			code("dec",sym(r,12))
			code("jnz","2b")
		code("mov",sym(r,7),sym(6))
		code("call","tjald_final")
	code("ret")
	
	label("tjald_3_l6")
		push_adjust(1,16,0,16,4)
		code("mov",sym(r,14),sym(r,7)) //Out ptr
		code("mov",sym(r,1),sym(r,5)) //In ptr
		code("mov",sym(r,2),sym(r,6)) //In len
		code("mov",sym(r,5),sym(r,4)) //Key ptr
		code("mov",sym(r,15),sym(r,0)) //Save stack ptr
		code("and",sym(r,0),sym(-64))
		code("sub",sym(r,0),sym(3072)) //State ptr
		code("mov",sym(r,4),sym(r,0))
		code("call","tjald_3_begin_l6_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,1))
		code("mov",sym(r,6),sym(r,2))
		code("call","tjald_3_absorb_l6_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,14))
		code("call","tjald_3_end_l6_inner")
		code("mov",sym(r,0),sym(r,15))
		pop(1,16,0,16,true)
	code("ret")
	
	



	label("tjald_4_begin_l3")
		push_adjust(3,14,15,16,2)
		code("call","tjald_4_begin_l3_inner")
		pop(3,14,15,16,false)
	code("ret")
	
	label("tjald_4_begin_l3_inner")
		code("mov",sym(r,5),"$tjald_seed")
		code("mov",sym(r,7),sym(704))
		code("mov",sym(r,6),sym(r,4))
		code("call","tjald_memcpy_l3")
		code("lea",sym(r,4),adr(sym(r,6),null,null,704))
		code("mov",sym(r,7),sym(320))
		code("call","tjald_memzero_l3")
	code("ret")
	
	label("tjald_4_absorb_l3") //(tjald_2_state*, input, length)
		push_adjust(1,14,0,16,3)
		code("call","tjald_4_absorb_l3_inner")
		pop(1,14,0,16,false)
	code("ret")
	
	label("tjald_4_absorb_l3_inner") //(tjald_2_state*, input, length)
		code("mov",sym(e,8),adr(sym(r,4),null,null,1024-4))
		code("lea",sym(r,7),adr(sym(r,8),sym(r,6),1,0))
		code("mov",sym(r,3),sym(r,6))
		code("add",sym(r,3),sym(-4096))
		code("sbb",sym(r,3),sym(r,3)) //Set r3 to -1 if input length >= 4096
		code("or",sym(r,3),sym(r,8))
		code("and",sym(r,3),sym(-0x80000000))
		code("or",sym(r,7),sym(r,3)) //Set bit 31 if it was already set, or the new input was long
		code("mov",adr(sym(r,4),null,null,1024-4),sym(e,7))
		code("and",sym(r,8),sym(4095)) //Set r8 to the length of unprocessed data stored
		code("jz","0f") //Jump if no unprocessed data is stored
			code("mov",sym(r,7),sym(r,6)) //Set r7 to input length
			code("add",sym(r,6),sym(r,8)) //Set r6 to the sum of input length and unprocessed data
			code("sub",sym(r,6),sym(4096)) //Set r6 to the remaining input length after the partial block has been processed
			code("jns","1f") //Jump if there is enough data to process at least one block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,1024)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l3") //Copy input to unprocessed data, using r4,r5 and r7
				code("jmp","2f")
			label("1")
				code("sub",sym(r,7),sym(r,6)) //Set r7 to the amount of data needed to be copied to unprocessed data in order to fill the buffer
				code("mov",sym(r,9),sym(r,4)) //Set r9 to the tjald_2_state pointer
				code("lea",sym(r,3),adr(sym(r,5),sym(r,7))) //Set r3 to point to the input after the partial block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,1024)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l3") //Copy input to unprocessed data, using r4,r5 and r7
				code("mov",sym(r,4),sym(r,9)) //Set r4 to the tjald_2_state pointer
				code("lea",sym(r,5),adr(sym(r,4),null,null,1024)) //Set r5 to point at the unprocessed data buffer
				code("mov",sym(r,12),sym(4096)) //Set r7 to the unprocessed data buffer length
				code("call","tjald_4_innerabsorb_l3") //Using r4, r5 and r12 as parameters
				code("mov",sym(r,5),sym(r,3)) //Set r5 to point at the remaining input string
		label("0")
			code("mov",sym(r,12),sym(r,6)) //Set r7 to the remaining input length, r6 can have two different origins depending on previous branches
			code("call","tjald_4_innerabsorb_l3") //Using r4, r5 and r12 as parameters
			code("and",sym(r,6),sym(4095)) //Set r6 to the length of unprocessed input
			code("mov",sym(r,7),sym(r,6))
			code("add",sym(r,4),sym(1024)) //Point r4 at the unprocessed data buffer
			code("call","tjald_memcpy_l3") //Copy remaining data to unprocessed buffer
		label("2")
	code("ret")
	
	label("tjald_4_innerabsorb_l3") //(tjald_2_state*, input, , r12:length) Updates r5 to be end of input processed
		code("shr",sym(r,12),sym(12)) //Set r12 to the number of whole 4096 byte blocks to be processed.
		code("jz","0f") //Return if there are 0 blocks to process
		code("mov",sym(r,10),sym(128))
		code("mov",sym(r,11),sym(384)) //Constants used by the inner processing loop
		code("movdqu",sym(x,14),"[tjald_small_seed]")
		label("1")
			code("mov",sym(r,1),sym(48)) //Set r1 to be a combined counter for a 4x loop and offset for loading data and state
			label("2")
				for(a=0;a<11;a++){
					code("movdqu",sym(x,a),adr(sym(r,4),sym(r,1),1,a*64)) //Load the state into xmm0 through xmm10
				}
				code("lea",sym(r,8),adr(sym(r,5),sym(r,1),1,0)) //Set r8 and r9 to point at the data block with offsets applied
				code("lea",sym(r,9),adr(sym(r,5),sym(r,1),1,64))
				code("mov",sym(r,7),sym(8))
				code("call","tjald_kernel_128") //Call the kernel, it loops r7 times
				code("vpaddb",sym(x,6),sym(x,6),sym(x,14))
				
				code("mov",sym(r,10),sym(256))
				code("mov",sym(r,11),sym(768)) //Constants used by the inner processing loop
				code("lea",sym(r,8),adr(sym(r,5),sym(r,1),1,0)) //Set r8 and r9 to point at the data block with offsets applied
				code("lea",sym(r,9),adr(sym(r,5),sym(r,1),1,128))
				code("mov",sym(r,7),sym(4))
				code("call","tjald_kernel_128") //Call the kernel, it loops r7 times
				code("vpaddb",sym(x,2),sym(x,2),sym(x,14))
				code("lea",sym(r,8),adr(sym(r,5),sym(r,1),1,64)) //Set r8 and r9 to point at the data block with offsets applied
				code("lea",sym(r,9),adr(sym(r,5),sym(r,1),1,192))
				code("mov",sym(r,7),sym(4))
				code("call","tjald_kernel_128") //Call the kernel, it loops r7 times
				code("vpsubb",sym(x,6),sym(x,6),sym(x,14))
				
				code("mov",sym(r,10),sym(128))
				code("mov",sym(r,11),sym(384)) //Constants used by the inner processing loop
				code("lea",sym(r,8),adr(sym(r,5),sym(r,1),1,64)) //Set r8 and r9 to point at the data block with offsets applied
				code("lea",sym(r,9),adr(sym(r,5),sym(r,1),1,0))
				code("mov",sym(r,7),sym(3))
				code("call","tjald_kernel_128") //Call the kernel, it loops r7 times
				code("vpsubb",sym(x,2),sym(x,2),sym(x,14))
				code("mov",sym(r,7),sym(5))
				code("call","tjald_kernel_128") //Call the kernel, it loops r7 times
				code("vpsubb",sym(x,2),sym(x,2),sym(x,14))
				for(a=0;a<11;a++){
					code("pxor",sym(x,a),adr(sym(r,4),sym(r,1),1,a*64)) //Xor with previous state
					code("movdqu",adr(sym(r,4),sym(r,1),1,a*64),sym(x,a)) //Unload the state
				}
				code("sub",sym(r,1),sym(16))
				code("jns","2b")
			code("add",sym(r,5),sym(4096)) //Move r5 to point at the next block of input
			code("dec",sym(r,12))
			code("jnz","1b")
		label("0")
	code("ret")

	label("tjald_4_end_l3") //(tjald_2_state*, out)
		push_adjust(1,14,0,16,2)
		code("call","tjald_4_end_l3_inner")
		pop(1,14,0,16,false)
	code("ret")

	label("tjald_4_end_l3_inner") //(tjald_2_state*, out)
		code("mov",sym(r,3),sym(r,5)) //Set r3 to point to the output
		code("mov",sym(r,6),sym(r,4)) //Set r6 to point to the state
		code("mov",sym(e,10),adr(sym(r,4),null,null,1024-4))
		code("cmp",sym(r,10),sym(4096-4))
		code("ja","0f")
			//Short path, input <= 496 bytes
			code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,1024)) //Set r4 to point to the end of data of the unprocessed buffer
			code("lea",sym(r,2),adr(sym(r,10),null,null,1023+4))
			code("and",sym(r,2),sym(-1024)) //Set r2 to the size of data to be processed including padding
			code("mov",sym(r,7),sym(r,2))
			code("sub",sym(r,7),sym(r,10)) //Set r7 to the size of the padding
			code("call","tjald_memzero_l3") //Zero the padding
			code("mov",adr(sym(r,6),sym(r,2),1,1024-4),sym(e,10)) //Insert length at the end of padding
			code("mov",sym(r,12),sym(r,2))
			code("shr",sym(r,12),sym(10)) //Set r12 to the number of 1024 byte blocks to be processed
			code("mov",sym(r,1),sym(r,6)) //Point r1 at the spot to load state
			code("add",sym(r,6),sym(1024)) //Point r6 at the buffer to be processed
			code("jmp","1f")
		label("0") //Long path, input > 496 bytes
			code("or",sym(r,10),sym(-0x80000000))
			code("mov",adr(sym(r,4),null,null,1024-4),sym(e,10))
			code("and",sym(r,10),sym(4095))
			code("jz","3f")
				code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,1024)) //Set r4 to point to the end of data of the unprocessed buffer
				code("mov",sym(r,7),sym(4096))
				code("sub",sym(r,7),sym(r,10)) //Set r7 to the unused length of the unprocessed buffer
				code("call","tjald_memzero_l3") //Zero the unused part
				code("mov",sym(r,4),sym(r,6))
				code("lea",sym(r,5),adr(sym(r,6),null,null,1024))
				code("mov",sym(r,12),sym(4096))
				code("call","tjald_4_innerabsorb_l3") //Using r4, r5 and r12 as parameters
			label("3")
			code("lea",sym(r,4),adr(sym(r,6),null,null,1024))
			code("mov",sym(r,1),sym(r,4))
			code("mov",sym(r,5),"$tjald_seed")
			code("mov",sym(r,7),sym(704))
			code("call","tjald_memcpy_l3") //Copy the seed into the unprocessed data buffer
			code("mov",sym(r,12),sym(1)) //Set r12 to the number of 1024 byte blocks to be processed			
		label("1")
		for(a=0;a<11;a++){
			code("movdqu",sym(x,a),adr(sym(r,1),null,null,a*16)) //Load the state into xmm0 through xmm10
		}
		code("mov",sym(r,10),sym(32))
		code("mov",sym(r,11),sym(96))
		code("movdqu",sym(x,14),"[tjald_small_seed]")
		label("2")
			code("mov",sym(r,8),sym(r,6))
			code("lea",sym(r,9),adr(sym(r,6),null,null,16))
			code("mov",sym(r,7),sym(8))
			code("call","tjald_kernel_128")
			code("vpaddb",sym(x,6),sym(x,6),sym(x,14))
			
			code("mov",sym(r,10),sym(64))
			code("mov",sym(r,11),sym(192))
			code("mov",sym(r,8),sym(r,6))
			code("lea",sym(r,9),adr(sym(r,6),null,null,32))
			code("mov",sym(r,7),sym(4))
			code("call","tjald_kernel_128")
			code("vpaddb",sym(x,2),sym(x,2),sym(x,14))
			code("lea",sym(r,8),adr(sym(r,6),null,null,16))
			code("lea",sym(r,9),adr(sym(r,6),null,null,48))
			code("mov",sym(r,7),sym(4))
			code("call","tjald_kernel_128")
			code("vpsubb",sym(x,6),sym(x,6),sym(x,14))
			
			code("mov",sym(r,10),sym(32))
			code("mov",sym(r,11),sym(96))
			code("lea",sym(r,8),adr(sym(r,6),null,null,16))
			code("mov",sym(r,9),sym(r,6))
			code("mov",sym(r,7),sym(3))
			code("call","tjald_kernel_128")
			code("vpsubb",sym(x,2),sym(x,2),sym(x,14))
			code("mov",sym(r,7),sym(5))
			code("call","tjald_kernel_128")
			code("vpsubb",sym(x,2),sym(x,2),sym(x,14))
			
			for(a=0;a<11;a++){
				code("pxor",sym(x,a),adr(sym(r,1),null,null,a*16)) //Xor with previous state
				code("movdqu",adr(sym(r,1),null,null,a*16),sym(x,a)) //Unload the state
			}
			
			code("add",sym(r,6),sym(1024))
			code("dec",sym(r,12))
			code("jnz","2b")
		code("mov",sym(r,7),sym(8))
		code("call","tjald_final")
	code("ret")
	
	label("tjald_4_l3")
		push_adjust(1,16,0,16,4)
		code("mov",sym(r,14),sym(r,6)) //Out ptr
		code("mov",sym(r,1),sym(r,4)) //In ptr
		code("mov",sym(r,2),sym(r,5)) //In len
		code("mov",sym(r,15),sym(r,0)) //Save stack ptr
		code("and",sym(r,0),sym(-64))
		code("sub",sym(r,0),sym(5120)) //State ptr
		code("mov",sym(r,4),sym(r,0))
		code("call","tjald_4_begin_l3_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,1))
		code("mov",sym(r,6),sym(r,2))
		code("call","tjald_4_absorb_l3_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,14))
		code("call","tjald_4_end_l3_inner")
		code("mov",sym(r,0),sym(r,15))
		pop(1,16,0,16,false)
	code("ret")
	
	
	
	
	
	label("tjald_4_begin_l4")
		push_adjust(3,14,15,16,2)
		code("call","tjald_4_begin_l4_inner")
		pop(3,14,15,16,true)
	code("ret")
	
	label("tjald_4_begin_l4_inner")
		code("mov",sym(r,5),"$tjald_seed")
		code("mov",sym(r,7),sym(704))
		code("mov",sym(r,6),sym(r,4))
		code("call","tjald_memcpy_l4")
		code("lea",sym(r,4),adr(sym(r,6),null,null,704))
		code("mov",sym(r,7),sym(320))
		code("call","tjald_memzero_l4")
	code("ret")
	
	label("tjald_4_absorb_l4") //(tjald_2_state*, input, length)
		push_adjust(1,14,0,16,3)
		code("call","tjald_4_absorb_l4_inner")
		pop(1,14,0,16,true)
	code("ret")
	
	label("tjald_4_absorb_l4_inner") //(tjald_2_state*, input, length)
		code("mov",sym(e,8),adr(sym(r,4),null,null,1024-4))
		code("lea",sym(r,7),adr(sym(r,8),sym(r,6),1,0))
		code("mov",sym(r,3),sym(r,6))
		code("add",sym(r,3),sym(-4096))
		code("sbb",sym(r,3),sym(r,3)) //Set r3 to -1 if input length >= 4096
		code("or",sym(r,3),sym(r,8))
		code("and",sym(r,3),sym(-0x80000000))
		code("or",sym(r,7),sym(r,3)) //Set bit 31 if it was already set, or the new input was long
		code("mov",adr(sym(r,4),null,null,1024-4),sym(e,7))
		code("and",sym(r,8),sym(4095)) //Set r8 to the length of unprocessed data stored
		code("jz","0f") //Jump if no unprocessed data is stored
			code("mov",sym(r,7),sym(r,6)) //Set r7 to input length
			code("add",sym(r,6),sym(r,8)) //Set r6 to the sum of input length and unprocessed data
			code("sub",sym(r,6),sym(4096)) //Set r6 to the remaining input length after the partial block has been processed
			code("jns","1f") //Jump if there is enough data to process at least one block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,1024)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l4") //Copy input to unprocessed data, using r4,r5 and r7
				code("jmp","2f")
			label("1")
				code("sub",sym(r,7),sym(r,6)) //Set r7 to the amount of data needed to be copied to unprocessed data in order to fill the buffer
				code("mov",sym(r,9),sym(r,4)) //Set r9 to the tjald_2_state pointer
				code("lea",sym(r,3),adr(sym(r,5),sym(r,7))) //Set r3 to point to the input after the partial block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,1024)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l4") //Copy input to unprocessed data, using r4,r5 and r7
				code("mov",sym(r,4),sym(r,9)) //Set r4 to the tjald_2_state pointer
				code("lea",sym(r,5),adr(sym(r,4),null,null,1024)) //Set r5 to point at the unprocessed data buffer
				code("mov",sym(r,12),sym(4096)) //Set r7 to the unprocessed data buffer length
				code("call","tjald_4_innerabsorb_l4") //Using r4, r5 and r12 as parameters
				code("mov",sym(r,5),sym(r,3)) //Set r5 to point at the remaining input string
		label("0")
			code("mov",sym(r,12),sym(r,6)) //Set r7 to the remaining input length, r6 can have two different origins depending on previous branches
			code("call","tjald_4_innerabsorb_l4") //Using r4, r5 and r12 as parameters
			code("and",sym(r,6),sym(4095)) //Set r6 to the length of unprocessed input
			code("mov",sym(r,7),sym(r,6))
			code("add",sym(r,4),sym(1024)) //Point r4 at the unprocessed data buffer
			code("call","tjald_memcpy_l4") //Copy remaining data to unprocessed buffer
		label("2")
	code("ret")
	
	label("tjald_4_innerabsorb_l4") //(tjald_2_state*, input, , r12:length) Updates r5 to be end of input processed
		code("shr",sym(r,12),sym(12)) //Set r12 to the number of whole 4096 byte blocks to be processed.
		code("jz","0f") //Return if there are 0 blocks to process
		code("mov",sym(r,10),sym(128))
		code("mov",sym(r,11),sym(384)) //Constants used by the inner processing loop
		code("vmovdqu",sym(y,14),"[tjald_small_seed]")
		label("1")
			code("mov",sym(r,1),sym(32)) //Set r1 to be a combined counter for a 4x loop and offset for loading data and state
			label("2")
				for(a=0;a<11;a++){
					code("vmovdqu",sym(y,a),adr(sym(r,4),sym(r,1),1,a*64)) //Load the state into xmm0 through xmm10
				}
				code("lea",sym(r,8),adr(sym(r,5),sym(r,1),1,0)) //Set r8 and r9 to point at the data block with offsets applied
				code("lea",sym(r,9),adr(sym(r,5),sym(r,1),1,64))
				code("mov",sym(r,7),sym(8))
				code("call","tjald_kernel_256") //Call the kernel, it loops r7 times
				code("vpaddb",sym(y,6),sym(y,6),sym(y,14))
				
				code("mov",sym(r,10),sym(256))
				code("mov",sym(r,11),sym(768)) //Constants used by the inner processing loop
				code("lea",sym(r,8),adr(sym(r,5),sym(r,1),1,0)) //Set r8 and r9 to point at the data block with offsets applied
				code("lea",sym(r,9),adr(sym(r,5),sym(r,1),1,128))
				code("mov",sym(r,7),sym(4))
				code("call","tjald_kernel_256") //Call the kernel, it loops r7 times
				code("vpaddb",sym(y,2),sym(y,2),sym(y,14))
				code("lea",sym(r,8),adr(sym(r,5),sym(r,1),1,64)) //Set r8 and r9 to point at the data block with offsets applied
				code("lea",sym(r,9),adr(sym(r,5),sym(r,1),1,192))
				code("mov",sym(r,7),sym(4))
				code("call","tjald_kernel_256") //Call the kernel, it loops r7 times
				code("vpsubb",sym(y,6),sym(y,6),sym(y,14))
				
				code("mov",sym(r,10),sym(128))
				code("mov",sym(r,11),sym(384)) //Constants used by the inner processing loop
				code("lea",sym(r,8),adr(sym(r,5),sym(r,1),1,64)) //Set r8 and r9 to point at the data block with offsets applied
				code("lea",sym(r,9),adr(sym(r,5),sym(r,1),1,0))
				code("mov",sym(r,7),sym(3))
				code("call","tjald_kernel_256") //Call the kernel, it loops r7 times
				code("vpsubb",sym(y,2),sym(y,2),sym(y,14))
				code("mov",sym(r,7),sym(5))
				code("call","tjald_kernel_256") //Call the kernel, it loops r7 times
				code("vpsubb",sym(y,2),sym(y,2),sym(y,14))
				for(a=0;a<11;a++){
					code("vpxor",sym(y,a),sym(y,a),adr(sym(r,4),sym(r,1),1,a*64)) //Xor with previous state
					code("vmovdqu",adr(sym(r,4),sym(r,1),1,a*64),sym(y,a)) //Unload the state
				}
				code("sub",sym(r,1),sym(32))
				code("jns","2b")
			code("add",sym(r,5),sym(4096)) //Move r5 to point at the next block of input
			code("dec",sym(r,12))
			code("jnz","1b")
		label("0")
	code("ret")

	label("tjald_4_end_l4") //(tjald_2_state*, out)
		push_adjust(1,14,0,16,2)
		code("call","tjald_4_end_l4_inner")
		pop(1,14,0,16,true)
	code("ret")

	label("tjald_4_end_l4_inner") //(tjald_2_state*, out)
		code("mov",sym(r,3),sym(r,5)) //Set r3 to point to the output
		code("mov",sym(r,6),sym(r,4)) //Set r6 to point to the state
		code("mov",sym(e,10),adr(sym(r,4),null,null,1024-4))
		code("cmp",sym(r,10),sym(4096-4))
		code("ja","0f")
			//Short path, input <= 496 bytes
			code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,1024)) //Set r4 to point to the end of data of the unprocessed buffer
			code("lea",sym(r,2),adr(sym(r,10),null,null,1023+4))
			code("and",sym(r,2),sym(-1024)) //Set r2 to the size of data to be processed including padding
			code("mov",sym(r,7),sym(r,2))
			code("sub",sym(r,7),sym(r,10)) //Set r7 to the size of the padding
			code("call","tjald_memzero_l4") //Zero the padding
			code("mov",adr(sym(r,6),sym(r,2),1,1024-4),sym(e,10)) //Insert length at the end of padding
			code("mov",sym(r,12),sym(r,2))
			code("shr",sym(r,12),sym(10)) //Set r12 to the number of 1024 byte blocks to be processed
			code("mov",sym(r,1),sym(r,6)) //Point r1 at the spot to load state
			code("add",sym(r,6),sym(1024)) //Point r6 at the buffer to be processed
			code("jmp","1f")
		label("0") //Long path, input > 496 bytes
			code("or",sym(r,10),sym(-0x80000000))
			code("mov",adr(sym(r,4),null,null,1024-4),sym(e,10))
			code("and",sym(r,10),sym(4095))
			code("jz","3f")
				code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,1024)) //Set r4 to point to the end of data of the unprocessed buffer
				code("mov",sym(r,7),sym(4096))
				code("sub",sym(r,7),sym(r,10)) //Set r7 to the unused length of the unprocessed buffer
				code("call","tjald_memzero_l4") //Zero the unused part
				code("mov",sym(r,4),sym(r,6))
				code("lea",sym(r,5),adr(sym(r,6),null,null,1024))
				code("mov",sym(r,12),sym(4096))
				code("call","tjald_4_innerabsorb_l4") //Using r4, r5 and r12 as parameters
			label("3")
			code("lea",sym(r,4),adr(sym(r,6),null,null,1024))
			code("mov",sym(r,1),sym(r,4))
			code("mov",sym(r,5),"$tjald_seed")
			code("mov",sym(r,7),sym(704))
			code("call","tjald_memcpy_l4") //Copy the seed into the unprocessed data buffer
			code("mov",sym(r,12),sym(1)) //Set r12 to the number of 1024 byte blocks to be processed
		label("1")
		for(a=0;a<11;a++){
			code("movdqu",sym(x,a),adr(sym(r,1),null,null,a*16)) //Load the state into xmm0 through xmm10
		}
		code("mov",sym(r,10),sym(32))
		code("mov",sym(r,11),sym(96))
		code("movdqu",sym(x,14),"[tjald_small_seed]")
		label("2")
			code("mov",sym(r,8),sym(r,6))
			code("lea",sym(r,9),adr(sym(r,6),null,null,16))
			code("mov",sym(r,7),sym(8))
			code("call","tjald_kernel_128")
			code("vpaddb",sym(x,6),sym(x,6),sym(x,14))
			
			code("mov",sym(r,10),sym(64))
			code("mov",sym(r,11),sym(192))
			code("mov",sym(r,8),sym(r,6))
			code("lea",sym(r,9),adr(sym(r,6),null,null,32))
			code("mov",sym(r,7),sym(4))
			code("call","tjald_kernel_128")
			code("vpaddb",sym(x,2),sym(x,2),sym(x,14))
			code("lea",sym(r,8),adr(sym(r,6),null,null,16))
			code("lea",sym(r,9),adr(sym(r,6),null,null,48))
			code("mov",sym(r,7),sym(4))
			code("call","tjald_kernel_128")
			code("vpsubb",sym(x,6),sym(x,6),sym(x,14))
			
			code("mov",sym(r,10),sym(32))
			code("mov",sym(r,11),sym(96))
			code("lea",sym(r,8),adr(sym(r,6),null,null,16))
			code("mov",sym(r,9),sym(r,6))
			code("mov",sym(r,7),sym(3))
			code("call","tjald_kernel_128")
			code("vpsubb",sym(x,2),sym(x,2),sym(x,14))
			code("mov",sym(r,7),sym(5))
			code("call","tjald_kernel_128")
			code("vpsubb",sym(x,2),sym(x,2),sym(x,14))
			
			for(a=0;a<11;a++){
				code("pxor",sym(x,a),adr(sym(r,1),null,null,a*16)) //Xor with previous state
				code("movdqu",adr(sym(r,1),null,null,a*16),sym(x,a)) //Unload the state
			}
			
			code("add",sym(r,6),sym(1024))
			code("dec",sym(r,12))
			code("jnz","2b")
		code("mov",sym(r,7),sym(8))
		code("call","tjald_final")
	code("ret")
	
	label("tjald_4_l4")
		push_adjust(1,16,0,16,4)
		code("mov",sym(r,14),sym(r,6)) //Out ptr
		code("mov",sym(r,1),sym(r,4)) //In ptr
		code("mov",sym(r,2),sym(r,5)) //In len
		code("mov",sym(r,15),sym(r,0)) //Save stack ptr
		code("and",sym(r,0),sym(-64))
		code("sub",sym(r,0),sym(5120)) //State ptr
		code("mov",sym(r,4),sym(r,0))
		code("call","tjald_4_begin_l4_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,1))
		code("mov",sym(r,6),sym(r,2))
		code("call","tjald_4_absorb_l4_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,14))
		code("call","tjald_4_end_l4_inner")
		code("mov",sym(r,0),sym(r,15))
		pop(1,16,0,16,true)
	code("ret")
	
	
	
	
	
	
	label("tjald_4_begin_l6")
		push_adjust(3,14,15,16,2)
		code("call","tjald_4_begin_l6_inner")
		pop(3,14,15,16,true)
	code("ret")
	
	label("tjald_4_begin_l6_inner")
		code("mov",sym(r,5),"$tjald_seed")
		code("mov",sym(r,7),sym(704))
		code("mov",sym(r,6),sym(r,4))
		code("call","tjald_memcpy_l6")
		code("lea",sym(r,4),adr(sym(r,6),null,null,704))
		code("mov",sym(r,7),sym(320))
		code("call","tjald_memzero_l6")
	code("ret")
	
	label("tjald_4_absorb_l6") //(tjald_2_state*, input, length)
		push_adjust(1,14,0,16,3)
		code("call","tjald_4_absorb_l6_inner")
		pop(1,14,0,16,true)
	code("ret")
	
	label("tjald_4_absorb_l6_inner") //(tjald_2_state*, input, length)
		code("mov",sym(e,8),adr(sym(r,4),null,null,1024-4))
		code("lea",sym(r,7),adr(sym(r,8),sym(r,6),1,0))
		code("mov",sym(r,3),sym(r,6))
		code("add",sym(r,3),sym(-4096))
		code("sbb",sym(r,3),sym(r,3)) //Set r3 to -1 if input length >= 4096
		code("or",sym(r,3),sym(r,8))
		code("and",sym(r,3),sym(-0x80000000))
		code("or",sym(r,7),sym(r,3)) //Set bit 31 if it was already set, or the new input was long
		code("mov",adr(sym(r,4),null,null,1024-4),sym(e,7))
		code("and",sym(r,8),sym(4095)) //Set r8 to the length of unprocessed data stored
		code("jz","0f") //Jump if no unprocessed data is stored
			code("mov",sym(r,7),sym(r,6)) //Set r7 to input length
			code("add",sym(r,6),sym(r,8)) //Set r6 to the sum of input length and unprocessed data
			code("sub",sym(r,6),sym(4096)) //Set r6 to the remaining input length after the partial block has been processed
			code("jns","1f") //Jump if there is enough data to process at least one block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,1024)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l6") //Copy input to unprocessed data, using r4,r5 and r7
				code("jmp","2f")
			label("1")
				code("sub",sym(r,7),sym(r,6)) //Set r7 to the amount of data needed to be copied to unprocessed data in order to fill the buffer
				code("mov",sym(r,9),sym(r,4)) //Set r9 to the tjald_2_state pointer
				code("lea",sym(r,3),adr(sym(r,5),sym(r,7))) //Set r3 to point to the input after the partial block
				code("lea",sym(r,4),adr(sym(r,4),sym(r,8),1,1024)) //Point r4 at the adding point of unprocessed data
				code("call","tjald_memcpy_l6") //Copy input to unprocessed data, using r4,r5 and r7
				code("mov",sym(r,4),sym(r,9)) //Set r4 to the tjald_2_state pointer
				code("lea",sym(r,5),adr(sym(r,4),null,null,1024)) //Set r5 to point at the unprocessed data buffer
				code("mov",sym(r,12),sym(4096)) //Set r7 to the unprocessed data buffer length
				code("call","tjald_4_innerabsorb_l6") //Using r4, r5 and r12 as parameters
				code("mov",sym(r,5),sym(r,3)) //Set r5 to point at the remaining input string
		label("0")
			code("mov",sym(r,12),sym(r,6)) //Set r7 to the remaining input length, r6 can have two different origins depending on previous branches
			code("call","tjald_4_innerabsorb_l6") //Using r4, r5 and r12 as parameters
			code("and",sym(r,6),sym(4095)) //Set r6 to the length of unprocessed input
			code("mov",sym(r,7),sym(r,6))
			code("add",sym(r,4),sym(1024)) //Point r4 at the unprocessed data buffer
			code("call","tjald_memcpy_l6") //Copy remaining data to unprocessed buffer
		label("2")
	code("ret")
	
	label("tjald_4_innerabsorb_l6") //(tjald_2_state*, input, , r12:length) Updates r5 to be end of input processed
		code("shr",sym(r,12),sym(12)) //Set r12 to the number of whole 4096 byte blocks to be processed.
		code("jz","0f") //Return if there are 0 blocks to process
		code("mov",sym(r,10),sym(128))
		code("mov",sym(r,11),sym(384)) //Constants used by the inner processing loop
		code("vmovdqu",sym(z,14),"[tjald_small_seed]")
		for(a=0;a<11;a++){
			code("vmovdqu",sym(z,a),adr(sym(r,4),null,null,a*64)) //Load the state into xmm0 through xmm10
		}
		label("1")
			code("mov",sym(r,8),sym(r,5)) //Set r8 and r9 to point at the data block with offsets applied
			code("lea",sym(r,9),adr(sym(r,5),null,null,64))
			code("mov",sym(r,7),sym(8))
			code("call","tjald_kernel_512") //Call the kernel, it loops r7 times
			code("vpaddb",sym(z,6),sym(z,6),sym(z,14))
			
			code("mov",sym(r,10),sym(256))
			code("mov",sym(r,11),sym(768)) //Constants used by the inner processing loop
			code("mov",sym(r,8),sym(r,5)) //Set r8 and r9 to point at the data block with offsets applied
			code("lea",sym(r,9),adr(sym(r,5),null,null,128))
			code("mov",sym(r,7),sym(4))
			code("call","tjald_kernel_512") //Call the kernel, it loops r7 times
			code("vpaddb",sym(z,2),sym(z,2),sym(z,14))
			code("lea",sym(r,8),adr(sym(r,5),null,null,64)) //Set r8 and r9 to point at the data block with offsets applied
			code("lea",sym(r,9),adr(sym(r,5),null,null,192))
			code("mov",sym(r,7),sym(4))
			code("call","tjald_kernel_512") //Call the kernel, it loops r7 times
			code("vpsubb",sym(z,6),sym(z,6),sym(z,14))
			
			code("mov",sym(r,10),sym(128))
			code("mov",sym(r,11),sym(384)) //Constants used by the inner processing loop
			code("lea",sym(r,8),adr(sym(r,5),null,null,64)) //Set r8 and r9 to point at the data block with offsets applied
			code("mov",sym(r,9),sym(r,5))
			code("mov",sym(r,7),sym(3))
			code("call","tjald_kernel_512") //Call the kernel, it loops r7 times
			code("vpsubb",sym(z,2),sym(z,2),sym(z,14))
			code("mov",sym(r,7),sym(5))
			code("call","tjald_kernel_512") //Call the kernel, it loops r7 times
			code("vpsubb",sym(z,2),sym(z,2),sym(z,14))
			for(a=0;a<11;a++){
				code("vpxor",sym(z,a),sym(z,a),adr(sym(r,4),null,null,a*64)) //Xor with previous state
				code("vmovdqu",adr(sym(r,4),null,null,a*64),sym(z,a)) //Unload the state
			}
			code("add",sym(r,5),sym(4096)) //Move r5 to point at the next block of input
			code("dec",sym(r,12))
		code("jnz","1b")
		label("0")
	code("ret")

	label("tjald_4_end_l6") //(tjald_2_state*, out)
		push_adjust(1,14,0,16,2)
		code("call","tjald_4_end_l6_inner")
		pop(1,14,0,16,true)
	code("ret")

	label("tjald_4_end_l6_inner") //(tjald_2_state*, out)
		code("mov",sym(r,3),sym(r,5)) //Set r3 to point to the output
		code("mov",sym(r,6),sym(r,4)) //Set r6 to point to the state
		code("mov",sym(e,10),adr(sym(r,4),null,null,1024-4))
		code("cmp",sym(r,10),sym(4096-4))
		code("ja","0f")
			//Short path, input <= 496 bytes
			code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,1024)) //Set r4 to point to the end of data of the unprocessed buffer
			code("lea",sym(r,2),adr(sym(r,10),null,null,1023+4))
			code("and",sym(r,2),sym(-1024)) //Set r2 to the size of data to be processed including padding
			code("mov",sym(r,7),sym(r,2))
			code("sub",sym(r,7),sym(r,10)) //Set r7 to the size of the padding
			code("call","tjald_memzero_l6") //Zero the padding
			code("mov",adr(sym(r,6),sym(r,2),1,1024-4),sym(e,10)) //Insert length at the end of padding
			code("mov",sym(r,12),sym(r,2))
			code("shr",sym(r,12),sym(10)) //Set r12 to the number of 1024 byte blocks to be processed
			code("mov",sym(r,1),sym(r,6)) //Point r1 at the spot to load state
			code("add",sym(r,6),sym(1024)) //Point r6 at the buffer to be processed
			code("jmp","1f")
		label("0") //Long path, input > 496 bytes
			code("or",sym(r,10),sym(-0x80000000))
			code("mov",adr(sym(r,4),null,null,1024-4),sym(e,10))
			code("and",sym(r,10),sym(4095))
			code("jz","3f")
				code("lea",sym(r,4),adr(sym(r,6),sym(r,10),1,1024)) //Set r4 to point to the end of data of the unprocessed buffer
				code("mov",sym(r,7),sym(4096))
				code("sub",sym(r,7),sym(r,10)) //Set r7 to the unused length of the unprocessed buffer
				code("call","tjald_memzero_l6") //Zero the unused part
				code("mov",sym(r,4),sym(r,6))
				code("lea",sym(r,5),adr(sym(r,6),null,null,1024))
				code("mov",sym(r,12),sym(4096))
				code("call","tjald_4_innerabsorb_l6") //Using r4, r5 and r12 as parameters
			label("3")
			code("lea",sym(r,4),adr(sym(r,6),null,null,1024))
			code("mov",sym(r,1),sym(r,4))
			code("mov",sym(r,5),"$tjald_seed")
			code("mov",sym(r,7),sym(704))
			code("call","tjald_memcpy_l6") //Copy the seed into the unprocessed data buffer
			code("mov",sym(r,12),sym(1)) //Set r12 to the number of 1024 byte blocks to be processed
		label("1")
		for(a=0;a<11;a++){
			code("movdqu",sym(x,a),adr(sym(r,1),null,null,a*16)) //Load the state into xmm0 through xmm10
		}
		code("mov",sym(r,10),sym(32))
		code("mov",sym(r,11),sym(96))
		code("movdqu",sym(x,14),"[tjald_small_seed]")
		label("2")
			code("mov",sym(r,8),sym(r,6))
			code("lea",sym(r,9),adr(sym(r,6),null,null,16))
			code("mov",sym(r,7),sym(8))
			code("call","tjald_kernel_128")
			code("vpaddb",sym(x,6),sym(x,6),sym(x,14))
			
			code("mov",sym(r,10),sym(64))
			code("mov",sym(r,11),sym(192))
			code("mov",sym(r,8),sym(r,6))
			code("lea",sym(r,9),adr(sym(r,6),null,null,32))
			code("mov",sym(r,7),sym(4))
			code("call","tjald_kernel_128")
			code("vpaddb",sym(x,2),sym(x,2),sym(x,14))
			code("lea",sym(r,8),adr(sym(r,6),null,null,16))
			code("lea",sym(r,9),adr(sym(r,6),null,null,48))
			code("mov",sym(r,7),sym(4))
			code("call","tjald_kernel_128")
			code("vpsubb",sym(x,6),sym(x,6),sym(x,14))
			
			code("mov",sym(r,10),sym(32))
			code("mov",sym(r,11),sym(96))
			code("lea",sym(r,8),adr(sym(r,6),null,null,16))
			code("mov",sym(r,9),sym(r,6))
			code("mov",sym(r,7),sym(3))
			code("call","tjald_kernel_128")
			code("vpsubb",sym(x,2),sym(x,2),sym(x,14))
			code("mov",sym(r,7),sym(5))
			code("call","tjald_kernel_128")
			code("vpsubb",sym(x,2),sym(x,2),sym(x,14))
			
			for(a=0;a<11;a++){
				code("pxor",sym(x,a),adr(sym(r,1),null,null,a*16)) //Xor with previous state
				code("movdqu",adr(sym(r,1),null,null,a*16),sym(x,a)) //Unload the state
			}
			
			code("add",sym(r,6),sym(1024))
			code("dec",sym(r,12))
			code("jnz","2b")
		code("mov",sym(r,7),sym(8))
		code("call","tjald_final")
	code("ret")
	
	label("tjald_4_l6")
		push_adjust(1,16,0,16,4)
		code("mov",sym(r,14),sym(r,6)) //Out ptr
		code("mov",sym(r,1),sym(r,4)) //In ptr
		code("mov",sym(r,2),sym(r,5)) //In len
		code("mov",sym(r,15),sym(r,0)) //Save stack ptr
		code("and",sym(r,0),sym(-64))
		code("sub",sym(r,0),sym(5120)) //State ptr
		code("mov",sym(r,4),sym(r,0))
		code("call","tjald_4_begin_l6_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,1))
		code("mov",sym(r,6),sym(r,2))
		code("call","tjald_4_absorb_l6_inner")
		code("mov",sym(r,4),sym(r,0))
		code("mov",sym(r,5),sym(r,14))
		code("call","tjald_4_end_l6_inner")
		code("mov",sym(r,0),sym(r,15))
		pop(1,16,0,16,true)
	code("ret")
	
	
	
	
	
	label("gesus_128_seed_l3")
		//r4 struct
		//r5 seed ptr
		//r6 seed length
		push_adjust(2,14,0,16,3)
		code("call","gesus_128_seed_l3_inner")
		pop(2,14,0,16,false)
	code("ret")

	label("gesus_128_seed_l3_inner")
		code("mov",sym(r,3),sym(r,4))
		code("add",sym(r,4),sym(1024)) //Secret ptr
		code("mov",sym(r,7),sym(1024))
		code("call","tjald_memzero_l3")
		code("mov",sym(r,2),sym(r,5)) //Seed ptr
		code("mov",sym(r,5),"$tjald_seed")
		code("mov qword",adr(sym(r,3),null,null,2048+176),sym(0))
		for(a=0;a<11;a++){
			code("vmovdqu",sym(x,a),adr(sym(r,5),null,null,a*16))
		}
		code("vmovdqu",adr(sym(r,3),null,null,2048),sym(x,0))
		code("xor",adr(sym(r,3),null,null,2048),sym(r,6))
		code("vmovdqu",sym(x,0),adr(sym(r,3),null,null,2048))
		code("mov",sym(r,10),sym(16))
		code("mov",sym(r,11),sym(48))
		code("cmp",sym(r,6),sym(256))
		code("jna","0f")
		label("1")
		
			code("mov",sym(r,7),sym(256))
			code("mov",sym(r,5),sym(r,2)) //Seed
			code("lea",sym(r,4),adr(sym(r,3),null,null,1024)) //Secret
			code("call","tjald_memxor_l3")
			code("mov",sym(r,7),sym(256))
			code("mov",sym(r,5),sym(r,2)) //Seed
			code("lea",sym(r,4),adr(sym(r,3),null,null,1024+272)) //Secret
			code("call","tjald_memxor_l3")
			code("mov",sym(r,7),sym(256))
			code("mov",sym(r,5),sym(r,2)) //Seed
			code("lea",sym(r,4),adr(sym(r,3),null,null,1024+736)) //Secret
			code("call","tjald_memxor_l3")
			code("mov",sym(r,12),sym(r,3))
			code("lea",sym(r,8),adr(sym(r,3),null,null,1024))
			code("mov",sym(r,7),sym(16))
			code("call","gesus_kernel_128")
			
			code("add",sym(r,2),sym(256))
			code("sub",sym(r,6),sym(256))
			code("cmp",sym(r,6),sym(256))
		code("ja","1b")
		label("0")
		code("mov",sym(r,7),sym(r,6))
		code("mov",sym(r,5),sym(r,2))
		code("lea",sym(r,4),adr(sym(r,3),null,null,1024))
		code("call","tjald_memxor_l3")
		code("mov",sym(r,7),sym(r,6))
		code("mov",sym(r,5),sym(r,2))
		code("lea",sym(r,4),adr(sym(r,3),null,null,1024+272))
		code("call","tjald_memxor_l3")
		code("mov",sym(r,7),sym(r,6))
		code("mov",sym(r,5),sym(r,2))
		code("lea",sym(r,4),adr(sym(r,3),null,null,1024+736))
		code("call","tjald_memxor_l3")
		code("mov",sym(r,12),sym(r,3))
		code("lea",sym(r,8),adr(sym(r,3),null,null,1024))
		code("mov",sym(r,7),sym(16))
		code("call","gesus_kernel_128")
		
		code("lea",sym(r,4),adr(sym(r,3),null,null,2048+64))
		for(a=0;a<11;a++){
			code("vmovdqu",adr(sym(r,4),null,null,a*16-64),sym(x,a))
		}
	code("ret")

	label("gesus_128_rand_l3")
		//r4 struct
		//r5 out ptr
		//r6 out size
		push_adjust(1,14,0,16,3)
		code("call","gesus_128_rand_l3_inner")
		pop(1,14,0,16,false)
	code("ret")
	
	label("gesus_128_rand_l3_inner")
		code("mov",sym(r,3),adr(sym(r,4),null,null,2048+176))
		code("mov",sym(r,9),sym(r,3)) //Spent length
		code("neg",sym(r,3))
		code("and",sym(r,3),sym(1023))
		code("mov",sym(r,7),sym(r,6))
		code("cmp",sym(r,6),sym(r,3))
		code("jna","2f")
		code("mov",sym(r,7),sym(r,3))
		label("2")
		code("sub",sym(r,6),sym(r,7)) //out len
		code("add",sym(r,9),sym(r,7))
		code("mov",sym(r,2),sym(r,4)) //struct
		code("mov",sym(r,4),sym(r,5))
		code("lea",sym(r,1),adr(sym(r,5),sym(r,7))) //out ptr
		code("lea",sym(r,5),adr(sym(r,2),null,null,1024))
		code("sub",sym(r,5),sym(r,3))
		code("call","tjald_memcpy_l3")
		code("test",sym(r,6),sym(r,6))
		code("jz","3f")

			code("lea",sym(r,3),adr(sym(r,2),null,null,2048+64))
			for(a=0;a<11;a++){
				code("vmovdqu",sym(x,a),adr(sym(r,3),null,null,a*16-64))
			}
			code("mov",sym(r,10),sym(16))
			code("mov",sym(r,11),sym(48))
			code("mov",sym(r,12),sym(r,1))
			code("sub",sym(r,6),sym(1024))
			code("jna","4f")
			label("1")
				code("lea",sym(r,8),adr(sym(r,2),null,null,1024))
				code("mov",sym(r,7),sym(16))
				code("xor",adr(sym(r,8)),sym(r,9))
				code("add",sym(r,9),sym(1024))
				code("call","gesus_kernel_128")
				code("sub",sym(r,6),sym(1024))
			code("ja","1b")
			label("4")
			code("add",sym(r,6),sym(1024))
			code("mov",sym(r,1),sym(r,12))
			code("lea",sym(r,8),adr(sym(r,2),null,null,1024))
			code("mov",sym(r,12),sym(r,2))
			code("mov",sym(r,7),sym(16))
			code("xor",adr(sym(r,8)),sym(r,9))
			code("call","gesus_kernel_128")
			code("add",sym(r,9),sym(r,6))
			
			code("mov",sym(r,7),sym(r,6))
			code("mov",sym(r,4),sym(r,1))
			code("mov",sym(r,5),sym(r,2))
			code("call","tjald_memcpy_l3")
			
			for(a=0;a<11;a++){
				code("vmovdqu",adr(sym(r,3),null,null,a*16-64),sym(x,a))
			}
		label("3")
		code("mov",adr(sym(r,2),null,null,2048+176),sym(r,9))
	code("ret")
	
	
	
	
	
	
	label("gesus_512_seed_l3")
		push_adjust(1,15,0,16,3)
		code("mov",sym(r,14),sym(r,4))
		code("call","gesus_128_seed_l3_inner")
		code("mov",sym(r,4),sym(r,14))
		code("lea",sym(r,5),adr(sym(r,4),null,null,4096))
		code("mov",sym(r,6),sym(1616))
		code("call","gesus_128_rand_l3_inner")
		code("lea",sym(r,4),adr(sym(r,14),null,null,4096+1616))
		code("lea",sym(r,5),adr(sym(r,14),null,null,4096))
		code("mov",sym(r,7),sym(1616))
		code("call","tjald_memcpy_l3")
		code("lea",sym(r,4),adr(sym(r,14),null,null,4096+1616*2))
		code("lea",sym(r,5),adr(sym(r,14),null,null,4096))
		code("mov",sym(r,7),sym(1568))
		code("call","tjald_memcpy_l3")
		
		code("mov",sym(r,10),sym(64))
		code("mov",sym(r,11),sym(192))
		code("mov",sym(r,1),sym(48))
		label("0")
			code("lea",sym(r,2),adr(sym(r,14),sym(r,1)))
			for(a=0;a<11;a++){
				code("vmovdqu",sym(x,a),adr(sym(r,2),null,null,8192+a*64))
			}

			code("mov",sym(r,12),sym(r,2))
			code("lea",sym(r,8),adr(sym(r,2),null,null,4096))
			code("mov",sym(r,7),sym(16))
			code("call","gesus_kernel_128")
			
			for(a=0;a<11;a++){
				code("vmovdqu",adr(sym(r,2),null,null,8192+a*64),sym(x,a))
			}
			code("sub",sym(r,1),sym(16))
		code("jns","0b")
		code("mov qword",adr(sym(r,14),null,null,8192+704),sym(0))
		pop(1,15,0,16,false)
	code("ret")
	
	label("gesus_512_rand_l3")
		push_adjust(1,15,0,16,3)
		code("mov",sym(r,3),adr(sym(r,4),null,null,8192+704))
		code("mov",sym(r,9),sym(r,3)) //Spent length
		code("neg",sym(r,3))
		code("and",sym(r,3),sym(4095))
		code("mov",sym(r,7),sym(r,6))
		code("cmp",sym(r,6),sym(r,3))
		code("jna","2f")
		code("mov",sym(r,7),sym(r,3))
		label("2")
		code("sub",sym(r,6),sym(r,7)) //out len
		code("add",sym(r,9),sym(r,7))
		code("mov",sym(r,2),sym(r,4)) //struct
		code("mov",sym(r,4),sym(r,5))
		code("lea",sym(r,1),adr(sym(r,5),sym(r,7))) //out ptr
		code("lea",sym(r,5),adr(sym(r,2),null,null,4096))
		code("sub",sym(r,5),sym(r,3))
		code("call","tjald_memcpy_l3")
		code("test",sym(r,6),sym(r,6))
		code("jz","3f")
			code("mov",sym(r,10),sym(64))
			code("mov",sym(r,11),sym(192))
			//r9 spent
			//r6 out len
			//r1 out ptr
			//r2 struct
			//r7 r8 r10 r11 r12 reserved for kernel
			label("1")
				code("mov",sym(r,4),sym(r,6))
				code("dec",sym(r,4))
				code("and",sym(r,4),sym(-4096))
			code("jz","0f")
				code("mov",sym(r,3),sym(65536))
				code("cmp",sym(r,4),sym(r,3))
				code("cmova",sym(r,4),sym(r,3))
				code("sub",sym(r,6),sym(r,4))
				code("mov",sym(r,3),sym(r,1))
				code("add",sym(r,1),sym(r,4))
				code("shr",sym(r,4),sym(12))
				code("call","gesus_512_rand_l3_inner")
				code("mov",sym(r,9),sym(r,14))
			code("jmp","1b")
			label("0")
			code("mov",sym(r,4),sym(1))
			code("mov",sym(r,3),sym(r,2))
			code("call","gesus_512_rand_l3_inner")
			code("add",sym(r,9),sym(r,6))
			code("mov",sym(r,4),sym(r,1))
			code("mov",sym(r,5),sym(r,2))
			code("mov",sym(r,7),sym(r,6))
			code("call","tjald_memcpy_l3")
		label("3")
		code("mov",adr(sym(r,2),null,null,8192+704),sym(r,9))
		pop(1,15,0,16,false)
	code("ret")
	
	label("gesus_512_rand_l3_inner")
		//r2 struct
		//r4 loops
		//r3 out
		
		//r14 spent length out
		
		//r5 shift
		//r12 immediate out
		code("mov",sym(r,5),sym(48))
		code("add",sym(r,9),sym(4))
		label("0")
			code("mov",sym(r,13),sym(r,4))
			code("lea",sym(r,12),adr(sym(r,3),sym(r,5)))
			code("dec",sym(r,9))
			code("mov",sym(r,14),sym(r,9))
			for(a=0;a<11;a++){
				code("vmovdqu",sym(x,a),adr(sym(r,2),sym(r,5),1,8192+a*64))
			}
			label("1")
				code("lea",sym(r,8),adr(sym(r,2),sym(r,5),1,4096))
				code("mov",sym(r,7),sym(16))
				code("xor",adr(sym(r,8)),sym(r,14))
				code("add",sym(r,14),sym(4096))
				code("call","gesus_kernel_128")
				code("dec",sym(r,13))
			code("jnz","1b")
			for(a=0;a<11;a++){
				code("vmovdqu",adr(sym(r,2),sym(r,5),1,8192+a*64),sym(x,a))
			}
			code("sub",sym(r,5),sym(16))
		code("jnb","0b")
	code("ret")
	
	
	
	
	
	label("gesus_512_seed_l4")
		push_adjust(1,15,0,16,3)
		code("mov",sym(r,14),sym(r,4))
		code("call","gesus_128_seed_l3_inner")
		code("mov",sym(r,4),sym(r,14))
		code("lea",sym(r,5),adr(sym(r,4),null,null,4096))
		code("mov",sym(r,6),sym(1616))
		code("call","gesus_128_rand_l3_inner")
		code("lea",sym(r,4),adr(sym(r,14),null,null,4096+1616))
		code("lea",sym(r,5),adr(sym(r,14),null,null,4096))
		code("mov",sym(r,7),sym(1616))
		code("call","tjald_memcpy_l4")
		code("lea",sym(r,4),adr(sym(r,14),null,null,4096+1616*2))
		code("lea",sym(r,5),adr(sym(r,14),null,null,4096))
		code("mov",sym(r,7),sym(1568))
		code("call","tjald_memcpy_l4")
		
		code("mov",sym(r,10),sym(64))
		code("mov",sym(r,11),sym(192))
		code("mov",sym(r,1),sym(32))
		label("0")
			code("lea",sym(r,2),adr(sym(r,14),sym(r,1)))
			for(a=0;a<11;a++){
				code("vmovdqu",sym(y,a),adr(sym(r,2),null,null,8192+a*64))
			}

			code("mov",sym(r,12),sym(r,2))
			code("lea",sym(r,8),adr(sym(r,2),null,null,4096))
			code("mov",sym(r,7),sym(16))
			code("call","gesus_kernel_256")
			
			for(a=0;a<11;a++){
				code("vmovdqu",adr(sym(r,2),null,null,8192+a*64),sym(y,a))
			}
			code("sub",sym(r,1),sym(32))
		code("jns","0b")
		code("mov qword",adr(sym(r,14),null,null,8192+704),sym(0))
		pop(1,15,0,16,true)
	code("ret")
	
	label("gesus_512_rand_l4")
		push_adjust(1,15,0,16,3)
		code("mov",sym(r,3),adr(sym(r,4),null,null,8192+704))
		code("mov",sym(r,9),sym(r,3)) //Spent length
		code("neg",sym(r,3))
		code("and",sym(r,3),sym(4095))
		code("mov",sym(r,7),sym(r,6))
		code("cmp",sym(r,6),sym(r,3))
		code("jna","2f")
		code("mov",sym(r,7),sym(r,3))
		label("2")
		code("sub",sym(r,6),sym(r,7)) //out len
		code("add",sym(r,9),sym(r,7))
		code("mov",sym(r,2),sym(r,4)) //struct
		code("mov",sym(r,4),sym(r,5))
		code("lea",sym(r,1),adr(sym(r,5),sym(r,7))) //out ptr
		code("lea",sym(r,5),adr(sym(r,2),null,null,4096))
		code("sub",sym(r,5),sym(r,3))
		code("call","tjald_memcpy_l4")
		code("test",sym(r,6),sym(r,6))
		code("jz","3f")
			code("mov",sym(r,10),sym(64))
			code("mov",sym(r,11),sym(192))
			//r9 spent
			//r6 out len
			//r1 out ptr
			//r2 struct
			//r7 r8 r10 r11 r12 reserved for kernel
			label("1")
				code("mov",sym(r,4),sym(r,6))
				code("dec",sym(r,4))
				code("and",sym(r,4),sym(-4096))
			code("jz","0f")
				code("mov",sym(r,3),sym(65536))
				code("cmp",sym(r,4),sym(r,3))
				code("cmova",sym(r,4),sym(r,3))
				code("sub",sym(r,6),sym(r,4))
				code("mov",sym(r,3),sym(r,1))
				code("add",sym(r,1),sym(r,4))
				code("shr",sym(r,4),sym(12))
				code("call","gesus_512_rand_l4_inner")
				code("mov",sym(r,9),sym(r,14))
			code("jmp","1b")
			label("0")
			code("mov",sym(r,4),sym(1))
			code("mov",sym(r,3),sym(r,2))
			code("call","gesus_512_rand_l4_inner")
			code("add",sym(r,9),sym(r,6))
			code("mov",sym(r,4),sym(r,1))
			code("mov",sym(r,5),sym(r,2))
			code("mov",sym(r,7),sym(r,6))
			code("call","tjald_memcpy_l4")
		label("3")
		code("mov",adr(sym(r,2),null,null,8192+704),sym(r,9))
		pop(1,15,0,16,true)
	code("ret")
	
	label("gesus_512_rand_l4_inner")
		//r2 struct
		//r4 loops
		//r3 out
		
		//r14 spent length out
		
		//r5 shift
		//r12 immediate out
		code("mov",sym(r,5),sym(32))
		code("add",sym(r,9),sym(4))
		label("0")
			code("mov",sym(r,13),sym(r,4))
			code("lea",sym(r,12),adr(sym(r,3),sym(r,5)))
			code("sub",sym(r,9),sym(2))
			code("mov",sym(r,14),sym(r,9))
			for(a=0;a<11;a++){
				code("vmovdqu",sym(y,a),adr(sym(r,2),sym(r,5),1,8192+a*64))
			}
			label("1")
				code("lea",sym(r,8),adr(sym(r,2),sym(r,5),1,4096))
				code("mov",sym(r,7),sym(16))
				code("xor",adr(sym(r,8)),sym(r,14))
				code("inc",sym(r,14))
				code("xor",adr(sym(r,8),null,null,16),sym(r,14))
				code("add",sym(r,14),sym(4095))
				code("call","gesus_kernel_256")
				code("dec",sym(r,13))
			code("jnz","1b")
			for(a=0;a<11;a++){
				code("vmovdqu",adr(sym(r,2),sym(r,5),1,8192+a*64),sym(y,a))
			}
			code("sub",sym(r,5),sym(32))
		code("jnb","0b")
	code("ret")
	
	
	
	
	
	label("gesus_512_seed_l6")
		push_adjust(1,15,0,16,3)
		code("mov",sym(r,14),sym(r,4))
		code("call","gesus_128_seed_l3_inner")
		code("mov",sym(r,4),sym(r,14))
		code("lea",sym(r,5),adr(sym(r,4),null,null,4096))
		code("mov",sym(r,6),sym(1616))
		code("call","gesus_128_rand_l3_inner")
		code("lea",sym(r,4),adr(sym(r,14),null,null,4096+1616))
		code("lea",sym(r,5),adr(sym(r,14),null,null,4096))
		code("mov",sym(r,7),sym(1616))
		code("call","tjald_memcpy_l6")
		code("lea",sym(r,4),adr(sym(r,14),null,null,4096+1616*2))
		code("lea",sym(r,5),adr(sym(r,14),null,null,4096))
		code("mov",sym(r,7),sym(1568))
		code("call","tjald_memcpy_l6")
		
		code("mov",sym(r,10),sym(64))
		code("mov",sym(r,11),sym(192))
		for(a=0;a<11;a++){
			code("vmovdqu",sym(z,a),adr(sym(r,14),null,null,8192+a*64))
		}

		code("mov",sym(r,12),sym(r,14))
		code("lea",sym(r,8),adr(sym(r,14),null,null,4096))
		code("mov",sym(r,7),sym(16))
		code("call","gesus_kernel_512")
		
		for(a=0;a<11;a++){
			code("vmovdqu",adr(sym(r,2),null,null,8192+a*64),sym(z,a))
		}
		code("mov qword",adr(sym(r,14),null,null,8192+704),sym(0))
		pop(1,15,0,16,true)
	code("ret")
	
	label("gesus_512_rand_l6")
		push_adjust(1,14,0,16,3)
		code("mov",sym(r,3),adr(sym(r,4),null,null,8192+704))
		code("mov",sym(r,9),sym(r,3)) //Spent length
		code("neg",sym(r,3))
		code("and",sym(r,3),sym(4095))
		code("mov",sym(r,7),sym(r,6))
		code("cmp",sym(r,6),sym(r,3))
		code("jna","2f")
		code("mov",sym(r,7),sym(r,3))
		label("2")
		code("sub",sym(r,6),sym(r,7)) //out len
		code("add",sym(r,9),sym(r,7))
		code("mov",sym(r,2),sym(r,4)) //struct
		code("mov",sym(r,4),sym(r,5))
		code("lea",sym(r,1),adr(sym(r,5),sym(r,7))) //out ptr
		code("lea",sym(r,5),adr(sym(r,2),null,null,4096))
		code("sub",sym(r,5),sym(r,3))
		code("call","tjald_memcpy_l6")
		code("test",sym(r,6),sym(r,6))
		code("jz","3f")

			for(a=0;a<11;a++){
				code("vmovdqu",sym(z,a),adr(sym(r,2),null,null,8192+a*64))
			}
			code("mov",sym(r,10),sym(64))
			code("mov",sym(r,11),sym(192))
			code("mov",sym(r,12),sym(r,1))
			code("sub",sym(r,6),sym(4096))
			code("jna","4f")
			label("1")
				code("lea",sym(r,8),adr(sym(r,2),null,null,4096))
				code("mov",sym(r,7),sym(16))
				code("xor",adr(sym(r,8)),sym(r,9))
				code("lea",sym(r,3),adr(sym(r,9),null,null,1))
				code("xor",adr(sym(r,8),null,null,16),sym(r,3))
				code("inc",sym(r,3))
				code("xor",adr(sym(r,8),null,null,32),sym(r,3))
				code("inc",sym(r,3))
				code("xor",adr(sym(r,8),null,null,48),sym(r,3))
				code("add",sym(r,9),sym(4096))
				code("call","gesus_kernel_512")
				code("sub",sym(r,6),sym(4096))
			code("ja","1b")
			label("4")
			code("add",sym(r,6),sym(4096))
			code("mov",sym(r,1),sym(r,12))
			code("lea",sym(r,8),adr(sym(r,2),null,null,4096))
			code("mov",sym(r,12),sym(r,2))
			code("mov",sym(r,7),sym(16))
			code("xor",adr(sym(r,8)),sym(r,9))
			code("lea",sym(r,3),adr(sym(r,9),null,null,1))
			code("xor",adr(sym(r,8),null,null,16),sym(r,3))
			code("inc",sym(r,3))
			code("xor",adr(sym(r,8),null,null,32),sym(r,3))
			code("inc",sym(r,3))
			code("xor",adr(sym(r,8),null,null,48),sym(r,3))
			code("call","gesus_kernel_512")
			code("add",sym(r,9),sym(r,6))
			
			code("mov",sym(r,7),sym(r,6))
			code("mov",sym(r,4),sym(r,1))
			code("mov",sym(r,5),sym(r,2))
			code("call","tjald_memcpy_l6")
			
			for(a=0;a<11;a++){
				code("vmovdqu",adr(sym(r,2),null,null,8192+a*64),sym(z,a))
			}
		label("3")
		code("mov",adr(sym(r,2),null,null,8192+704),sym(r,9))
		pop(1,14,0,16,true)
	code("ret")
	
	
	
	
	
	
	label("tjald_once_asm_limit")
		push_adjust(2,12,15,16,1)
		code("mov",sym(r,8),sym(0))
		code("mov",sym(r,9),sym(0))
		code("mov",sym(r,10),sym(0))
		code("mov",sym(r,11),sym(0))
		
		code("mov",sym(r,3),sym(0))
		code("mov",sym(r,7),sym(0))
		code("cpuid")
		code("mov",sym(r,5),sym(r,3))
		code("cmp",sym(r,5),sym(1))
		code("jb","0f")
		code("mov",sym(r,3),sym(1))
		code("mov",sym(r,7),sym(0))
		code("cpuid")
		code("mov",sym(r,8),sym(r,7))
		code("mov",sym(r,9),sym(r,6))
		code("cmp",sym(r,5),sym(7))
		code("jb","0f")
		code("mov",sym(r,3),sym(7))
		code("mov",sym(r,7),sym(0))
		code("cpuid")
		code("mov",sym(r,10),sym(r,2))
		code("mov",sym(r,11),sym(r,7))
		label("0")
		code("mov",sym(r,2),sym(r,8))
		code("shr",sym(r,2),sym(28))
		code("mov",sym(r,5),sym(r,8))
		code("shr",sym(r,5),sym(27))
		code("and",sym(r,2),sym(r,5))
		code("mov",sym(r,3),sym(0))
		code("and",sym(r,2),sym(1))
		code("jz","1f")
		code("mov",sym(r,7),sym(0))
		code("xgetbv")
		label("1")

		code("mov",sym(r,6),sym(r,8))
		code("shr",sym(r,6),sym(25)) //AESNI
		code("mov",sym(r,7),sym(r,8))
		code("shr",sym(r,7),sym(28)) //AVX
		code("and",sym(r,6),sym(r,7))
		code("and",sym(r,6),sym(1))
		code("jz","2f")
		code("cmp",sym(r,4),sym(3))
		code("jb","2f")
		code("mov",sym(r,6),sym(r,3))
		code("and",sym(r,6),sym(6)) //OS_AVX
		code("cmp",sym(r,6),sym(6))
		code("jnz","2f")
		//Level 3, 4 or 6
		code("mov",sym(r,5),sym(3))
		code("mov",sym(r,6),sym(r,11))
		code("shr",sym(r,6),sym(9)) //VAES
		code("mov",sym(r,7),sym(r,10))
		code("shr",sym(r,7),sym(5)) //AVX2
		code("and",sym(r,6),sym(r,7))
		code("and",sym(r,6),sym(1))
		code("jz","3f")
		code("cmp",sym(r,4),sym(4))
		code("jb","3f")
		//Level 4 or 6
		code("mov",sym(r,5),sym(4))
		code("mov",sym(r,6),sym(r,10))
		code("shr",sym(r,6),sym(16)) //AVX512F
		code("mov",sym(r,7),sym(r,10))
		code("shr",sym(r,7),sym(30)) //AVX512BW
		code("and",sym(r,6),sym(r,7))
		code("and",sym(r,6),sym(1))
		code("jz","3f")
		code("cmp",sym(r,4),sym(6))
		code("jb","3f")
		code("mov",sym(r,6),sym(r,3))
		code("and",sym(r,6),sym(0xe6)) //OS_AVX512F
		code("cmp",sym(r,6),sym(0xe6))
		code("jnz","3f")
		//Level 6
		code("mov",sym(r,5),sym(6))
		code("jmp","3f")
		
		label("2")
		//Level 0, 1 or 2
		//code("mov",sym(r,5),sym(0))
		code("mov",sym(r,6),sym(r,8))
		code("shr",sym(r,6),sym(25)) //AESNI
		code("mov",sym(r,7),sym(r,9))
		code("shr",sym(r,7),sym(26)) //SSE2
		code("and",sym(r,6),sym(r,7))
		code("and",sym(r,6),sym(1))
		code("jz","4f")
		code("cmp",sym(r,4),sym(2))
		code("jb","4f")
		code("mov",sym(r,5),sym(2))
		code("jmp","3f")
		label("4")
		//Level 0 or 1
		code("mov",sym(r,5),sym(0))
		code("mov",sym(r,6),sym(r,8))
		code("shr",sym(r,6),sym(9)) //SSSE3
		code("and",sym(r,6),sym(1))
		code("jz","3f")
		code("cmp",sym(r,4),sym(1))
		code("jb","3f")
		//Level 1
		code("mov",sym(r,5),sym(1))
		label("3")
		
		code("mov",sym(r,3),sym(r,5))
		code("mov",sym(r,4),"$tjald_fn_pointers")
		code("mov",sym(r,7),sym(128))
		
		code("cmp",sym(r,3),sym(4))
		code("jz","5f")
		code("jb","6f")
		code("mov",sym(r,5),"$l6_ptrs")
		code("jmp","7f")
		label("5")
		code("mov",sym(r,5),"$l4_ptrs")
		code("jmp","7f")
		label("6")
		code("cmp",sym(r,3),sym(2))
		code("jna","8f")
		code("mov",sym(r,5),"$l3_ptrs")
		label("7")
		code("call","tjald_memcpy_l3")
		label("8")
		pop(2,12,15,16,false)
	code("ret")
	
	
	/*
	output+="\textern print_two\n"
	label("printregs")
		for(a=1;a<16;a++){
			code("push",sym(r,a))
		}
		code("mov",sym(r,1),sym(r,0))
		code("and",sym(r,0),sym(-16))
		code("sub",sym(r,0),sym(256))
		for(a=0;a<16;a++){
			code("vmovdqu",adr(sym(r,0),null,null,a*16),sym(x,a))
		}
		code("sub",sym(r,0),sym(64))
		
		for(a=1;a<16;a++){
		code("mov",sym(r,4),sym(a))
		code("mov",sym(r,5),adr(sym(r,1),null,null,120-a*8))
		code("mov",sym(r,7),sym(r,4))
		code("mov",sym(r,6),sym(r,5))
		
		code("call","print_two")
		}
		
		code("add",sym(r,0),sym(64))
		for(a=0;a<16;a++){
			code("vmovdqu",sym(x,a),adr(sym(r,0),null,null,a*16))
		}
		code("mov",sym(r,0),sym(r,1))
		for(a=15;a>0;a--){
			code("pop",sym(r,a))
		}
	code("ret")
	*/
}

textsection()

var fs = require('fs')
fs.writeFileSync('tjald_assembly.s', output)