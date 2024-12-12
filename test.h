#include <windows.h>
#include <string.h>
#include <stdio.h>
#include <time.h>
#include <profileapi.h>

char outbuffer[10000000];
int outbufferused=0;

TJALD_ALIGN uint8_t testbuffer[1000000];
uint8_t resultsbuffer[256*100000+63];

void printchars(uint8_t* input, uint64_t length){
	if(outbufferused>9000000){
		return;
	}
	uint64_t a;
	for(a=0;a<length;a++){
		outbufferused+=sprintf(outbuffer+outbufferused,"%.2x",input[a]);
	}
	outbufferused+=sprintf(outbuffer+outbufferused,"\n");
}
void printint(int64_t input){
	if(outbufferused>9000000){
		return;
	}
	outbufferused+=sprintf(outbuffer+outbufferused,"%lld",input);
}
void printstr(const void* input){
	if(outbufferused>9000000){
		return;
	}
	outbufferused+=sprintf(outbuffer+outbufferused,"%s",(char*)input);
}
void printchars48(uint8_t* input){
	if(outbufferused>9000000){
		return;
	}
	uint64_t a;
	outbufferused+=sprintf(outbuffer+outbufferused,"(");
	for(a=0;a<24;a++){
		outbufferused+=sprintf(outbuffer+outbufferused,"%.2x",input[a]);
	}
	outbufferused+=sprintf(outbuffer+outbufferused,"...)\n");
}
void printdecimal(uint64_t input){
	if(outbufferused>9000000){
		return;
	}
	uint64_t first=input/10000000;
	uint64_t last=input%10000000;
	outbufferused+=sprintf(outbuffer+outbufferused,"%llu.%.7llu",first,last);
}

int64_t equal(void* b1,void* b2,uint64_t len){
	uint64_t a;
	uint8_t* b18=(uint8_t*)b1;
	uint8_t* b28=(uint8_t*)b2;
	for(a=0;a<len;a++){
		if(b18[a]!=b28[a]){
			return 0;
		}
	}
	return 1;
}

int testmain(){
	gesus_128_state fixedrng;
	gesus_128_state timerng;
	int64_t now=time(NULL);
	//int64_t now=1684849230;
	int64_t begintime=time(NULL);
	int64_t begintime2;
	QueryPerformanceCounter((LARGE_INTEGER*)&begintime2);
	printstr("Seed: ");
	printint(now);
	printstr("\n");
	gesus_128_seed(&fixedrng,"Fixed seed",10);
	gesus_128_seed(&timerng,&now,8);
	gesus_128_rand(&timerng,testbuffer,1000000);
	int64_t a,b,c;
	uint8_t rngbuffer[16];
	tjald_4_state finalhash;
	tjald_4_begin(&finalhash);
	for(a=0;a<10000;a++){
		gesus_128_rand(&fixedrng,rngbuffer,3);
		uint64_t testlen=rngbuffer[0]+rngbuffer[1]*rngbuffer[2];
		gesus_128_rand(&fixedrng,testbuffer,testlen);
		uint8_t testkey[704];
		gesus_128_rand(&fixedrng,testkey,704);
		uint8_t resultbuffer1[192];
		uint8_t resultbuffer2[192];
		tjald_2(testkey,testbuffer,testlen,resultbuffer1);
		tjald_3(testkey,testbuffer,testlen,resultbuffer1+64);
		tjald_4(testbuffer,testlen,resultbuffer1+128);
		tjald_2_state state2;
		tjald_3_state state3;
		tjald_4_state state4;
		tjald_2_begin(&state2,testkey);
		tjald_3_begin(&state3,testkey);
		tjald_4_begin(&state4);
		uint64_t testabsorbed=0;
		while(testabsorbed<testlen){
			gesus_128_rand(&timerng,rngbuffer,7);
			uint64_t copylen=(rngbuffer[0]*rngbuffer[1]*rngbuffer[2]+rngbuffer[3]*rngbuffer[4])>>8;
			if(copylen+testabsorbed>testlen){
				copylen=testlen-testabsorbed;
			}
			uint8_t* copyspot=testbuffer+100000+rngbuffer[5]+(rngbuffer[6]<<8);
			memcpy(copyspot,testbuffer+testabsorbed,copylen);
			tjald_2_absorb(&state2,copyspot,copylen);
			tjald_3_absorb(&state3,copyspot,copylen);
			tjald_4_absorb(&state4,copyspot,copylen);
			testabsorbed+=copylen;
			gesus_128_rand(&timerng,copyspot,copylen);
		}
		tjald_2_end(&state2,resultbuffer2);
		tjald_3_end(&state3,resultbuffer2+64);
		tjald_4_end(&state4,resultbuffer2+128);
		if(equal(resultbuffer1,resultbuffer2,192)==0){
			printstr("Unequal hashes, test ");
			printint(a);
			printstr("\nLength ");
			printint(testlen);
			printstr("\n");
			printchars(resultbuffer1,192);
			printchars(resultbuffer2,192);
			printstr("\n");
		}
		tjald_4_absorb(&finalhash,resultbuffer1,192);
		tjald_4_absorb(&finalhash,resultbuffer2,192);
	}
	gesus_128_rand(&timerng,testbuffer,100000);
	
	gesus_128_rand(&fixedrng,testbuffer+7,12345);
	gesus_128_state test_gesus_128;
	gesus_512_state test_gesus_512;
	tjald_2_state test_gesus_128_hash;
	tjald_2_state test_gesus_512_hash;
	uint8_t gesushashes[64*8];
	memset(gesushashes,0,64*8);
	for(a=0;a<2;a++){
		gesus_128_seed(&test_gesus_128,testbuffer+7,12345);
		gesus_512_seed(&test_gesus_512,testbuffer+7,12345);
		tjald_2_begin(&test_gesus_128_hash,(uint8_t*)0);
		tjald_2_begin(&test_gesus_512_hash,(uint8_t*)0);
		uint64_t remaining=100000000;
		while(remaining>0){
			gesus_128_rand(&timerng,rngbuffer,8);
			uint64_t copylen=(rngbuffer[0]*rngbuffer[1]*rngbuffer[2]+rngbuffer[3]*rngbuffer[4])>>8;
			if(copylen>remaining){
				copylen=remaining;
			}
			uint8_t* copyspot=testbuffer+100000+rngbuffer[5]+(rngbuffer[6]<<8);
			
			gesus_128_rand(&test_gesus_128,copyspot,copylen);
			tjald_2_absorb(&test_gesus_128_hash,copyspot,copylen);

			gesus_512_rand(&test_gesus_512,copyspot,copylen);
			tjald_2_absorb(&test_gesus_512_hash,copyspot,copylen);
			
			gesus_128_rand(&timerng,copyspot,copylen);
			remaining-=copylen;
		}
		tjald_2_end(&test_gesus_128_hash,gesushashes+a*128);
		tjald_2_end(&test_gesus_512_hash,gesushashes+64+a*128);
	}
	if(equal(gesushashes,gesushashes+128,128)==0){
		printstr("Rng test mismatch\n");
		printchars(gesushashes,64);
		printchars(gesushashes+64,64);
		printchars(gesushashes+128,64);
		printchars(gesushashes+192,64);
	}
	
	else{
		printstr("Rng test no mismatch\n");
		printchars48(gesushashes);
		printchars48(gesushashes+64);
	}
		
	tjald_4_absorb(&finalhash,gesushashes,384);
	
	tjald_4_end(&finalhash,testbuffer);
	printstr("Final hash: ");
	printchars48(testbuffer);
	int64_t endtime=time(NULL);
	int64_t endtime2;
	QueryPerformanceCounter((LARGE_INTEGER*)&endtime2);
	int64_t timerclock;
	QueryPerformanceFrequency((LARGE_INTEGER*)&timerclock);
	printstr("Time taken: ");
	printint(endtime-begintime);
	printstr("s\n");
	printstr("Time taken: ");
	printdecimal((endtime2-begintime2)*10000000/timerclock);
	printstr(" s\n\n");
	
	gesus_128_state perfrng;
	gesus_128_seed(&perfrng,"data for performance test",25);
	gesus_128_rand(&perfrng,testbuffer,1000000);
	uint8_t perfres[64];
	
	int64_t perfstart;
	int64_t perfend;
	
	QueryPerformanceCounter((LARGE_INTEGER*)&perfstart);
	tjald_2_state perf_state2;
	tjald_2_begin(&perf_state2,(uint8_t*)0);
	for(a=0;a<1000;a++){
		tjald_2_absorb(&perf_state2,testbuffer,1000000);
	}
	tjald_2_end(&perf_state2,perfres);
	QueryPerformanceCounter((LARGE_INTEGER*)&perfend);
	printstr("Tjald2 ");
	printint((1000*timerclock)/(perfend-perfstart));
	printstr(" MB/s ");
	printchars48(perfres);
	
	QueryPerformanceCounter((LARGE_INTEGER*)&perfstart);
	tjald_2_begin(&perf_state2,(uint8_t*)0);
	for(a=0;a<10000;a++){
		tjald_2_absorb(&perf_state2,testbuffer,100000);
	}
	tjald_2_end(&perf_state2,perfres);
	QueryPerformanceCounter((LARGE_INTEGER*)&perfend);
	printstr("Tjald2 ");
	printint((1000*timerclock)/(perfend-perfstart));
	printstr(" MB/s ");
	printchars48(perfres);
	
	QueryPerformanceCounter((LARGE_INTEGER*)&perfstart);
	tjald_2_begin(&perf_state2,(uint8_t*)0);
	for(a=0;a<10000;a++){
		tjald_2_absorb(&perf_state2,testbuffer,102400);
	}
	tjald_2_end(&perf_state2,perfres);
	QueryPerformanceCounter((LARGE_INTEGER*)&perfend);
	printstr("Tjald2 ");
	printint((1024*timerclock)/((perfend-perfstart)));
	printstr(" MB/s ");
	printchars48(perfres);
	
	QueryPerformanceCounter((LARGE_INTEGER*)&perfstart);
	tjald_2_begin(&perf_state2,(uint8_t*)0);
	for(a=0;a<100000;a++){
		tjald_2_absorb(&perf_state2,testbuffer,10240);
	}
	tjald_2_end(&perf_state2,perfres);
	QueryPerformanceCounter((LARGE_INTEGER*)&perfend);
	printstr("Tjald2 ");
	printint((1024*timerclock)/((perfend-perfstart)));
	printstr(" MB/s ");
	printchars48(perfres);
	
	QueryPerformanceCounter((LARGE_INTEGER*)&perfstart);
	tjald_3_state perf_state3;
	tjald_3_begin(&perf_state3,(uint8_t*)0);
	for(a=0;a<1000;a++){
		tjald_3_absorb(&perf_state3,testbuffer,1000000);
	}
	tjald_3_end(&perf_state3,perfres);
	QueryPerformanceCounter((LARGE_INTEGER*)&perfend);
	printstr("Tjald3 ");
	printint((1000*timerclock)/(perfend-perfstart));
	printstr(" MB/s ");
	printchars48(perfres);
	
	QueryPerformanceCounter((LARGE_INTEGER*)&perfstart);
	tjald_4_state perf_state4;
	tjald_4_begin(&perf_state4);
	for(a=0;a<1000;a++){
		tjald_4_absorb(&perf_state4,testbuffer,1000000);
	}
	tjald_4_end(&perf_state4,perfres);
	QueryPerformanceCounter((LARGE_INTEGER*)&perfend);
	printstr("Tjald4 ");
	printint((1000*timerclock)/(perfend-perfstart));
	printstr(" MB/s ");
	printchars48(perfres);
	
	QueryPerformanceCounter((LARGE_INTEGER*)&perfstart);
	tjald_4_begin(&perf_state4);
	for(a=0;a<100000;a++){
		tjald_4_absorb(&perf_state4,testbuffer,16384);
	}
	tjald_4_end(&perf_state4,perfres);
	QueryPerformanceCounter((LARGE_INTEGER*)&perfend);
	printstr("Tjald4 ");
	printint((16384*timerclock)/((perfend-perfstart)*10));
	printstr(" MB/s ");
	printchars48(perfres);
	printstr("\n");
	
	QueryPerformanceCounter((LARGE_INTEGER*)&perfstart);
	for(a=0;a<10000;a++){
		for(b=0;b<64;b++){
			tjald_2((uint8_t*)0,testbuffer+a,b,resultsbuffer+a*64+b);
		}
	}
	QueryPerformanceCounter((LARGE_INTEGER*)&perfend);
	printstr("Tjald2 ");
	printint(100000000*(perfend-perfstart)/(timerclock*1*64));
	printstr(" ps ");
	tjald_2((uint8_t*)0,resultsbuffer,64*10000+63,perfres);
	printchars48(perfres);
	
	QueryPerformanceCounter((LARGE_INTEGER*)&perfstart);
	for(a=0;a<10000;a++){
		for(b=0;b<64;b++){
			tjald_3((uint8_t*)0,testbuffer+a,b,resultsbuffer+a*64+b);
		}
	}
	QueryPerformanceCounter((LARGE_INTEGER*)&perfend);
	printstr("Tjald3 ");
	printint(100000000*(perfend-perfstart)/(timerclock*1*64));
	printstr(" ps ");
	tjald_2((uint8_t*)0,resultsbuffer,64*10000+63,perfres);
	printchars48(perfres);
	
	QueryPerformanceCounter((LARGE_INTEGER*)&perfstart);
	for(a=0;a<10000;a++){
		for(b=0;b<64;b++){
			tjald_4(testbuffer+a,b,resultsbuffer+a*64+b);
		}
	}
	QueryPerformanceCounter((LARGE_INTEGER*)&perfend);
	printstr("Tjald4 ");
	printint(100000000*(perfend-perfstart)/(timerclock*1*64));
	printstr(" ps ");
	tjald_2((uint8_t*)0,resultsbuffer,64*10000+63,perfres);
	printchars48(perfres);
	printstr("\n");
	
	
	
	
	
	QueryPerformanceCounter((LARGE_INTEGER*)&perfstart);
	gesus_128_state perf_state_128;
	gesus_128_seed(&perf_state_128,"a",1);
	for(a=0;a<100;a++){
		gesus_128_rand(&perf_state_128,testbuffer,1000000);
	}
	QueryPerformanceCounter((LARGE_INTEGER*)&perfend);
	printstr("Gesus 128 ");
	printint((100*timerclock)/(perfend-perfstart));
	printstr(" MB/s ");
	printchars48(testbuffer);
	
	QueryPerformanceCounter((LARGE_INTEGER*)&perfstart);
	gesus_512_state perf_state_512;
	gesus_512_seed(&perf_state_512,"a",1);
	for(a=0;a<100;a++){
		gesus_512_rand(&perf_state_512,testbuffer,1000000);
	}
	QueryPerformanceCounter((LARGE_INTEGER*)&perfend);
	printstr("Gesus 512 ");
	printint((100*timerclock)/(perfend-perfstart));
	printstr(" MB/s ");
	printchars48(testbuffer);
	printstr("\n");
	
	QueryPerformanceCounter((LARGE_INTEGER*)&perfstart);
	gesus_128_state perf_state_128s;
	gesus_128_seed(&perf_state_128s,"a",1);
	for(a=0;a<1000000;a++){
		gesus_128_rand(&perf_state_128s,testbuffer,100);
	}
	QueryPerformanceCounter((LARGE_INTEGER*)&perfend);
	printstr("Gesus 128 short ");
	printint((100*timerclock)/(perfend-perfstart));
	printstr(" MB/s ");
	printchars48(testbuffer);
	
	QueryPerformanceCounter((LARGE_INTEGER*)&perfstart);
	gesus_512_state perf_state_512s;
	gesus_512_seed(&perf_state_512s,"a",1);
	for(a=0;a<1000000;a++){
		gesus_512_rand(&perf_state_512s,testbuffer,100);
	}
	QueryPerformanceCounter((LARGE_INTEGER*)&perfend);
	printstr("Gesus 512 short ");
	printint((100*timerclock)/(perfend-perfstart));
	printstr(" MB/s ");
	printchars48(testbuffer);
	printstr("\n");
	
	return 0;
}