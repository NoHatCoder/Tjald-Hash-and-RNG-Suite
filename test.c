#include <stdio.h>
#include "tjald_header.h"
#include "reference.c"
#include "test.h"

int main(){
	printf("Begin test\n");
	int32_t r=10;
	while(r>0){
		r=tjald_once_limit(r-1);
		printf("Test level: %i\n",r);
		printf("Self test: %i\n",tjald_self_test());
		testmain();
		printf("%s",outbuffer);
		outbufferused=0;
	}
	
	r=tjald_once_limit(6);
	tjald_fn_pointers.tjald_2_i=&tjaldr_2;
	tjald_fn_pointers.tjald_3_i=&tjaldr_3;
	tjald_fn_pointers.tjald_4_i=&tjaldr_4;
	tjald_fn_pointers.gesus_128_seed_i=&gesusr_128_seed;
	tjald_fn_pointers.gesus_128_rand_i=&gesusr_128_rand;
	tjald_fn_pointers.gesus_512_seed_i=&gesusr_512_seed;
	tjald_fn_pointers.gesus_512_rand_i=&gesusr_512_rand;
	printf("Test level: %ir\n",r);
	printf("Self test: %i\n",tjald_self_test());
	testmain();

	printf("%s",outbuffer);
	outbufferused=0;
}
/*
void print_two(uint64_t one,uint64_t two){
	printf("%llu %llu\n",one,two);
}
*/