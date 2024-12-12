#ifndef TJALD_HEADER_INCLUDED
#define TJALD_HEADER_INCLUDED

#include <stdint.h>

#if defined(__GNUC__)
	#define TJALD_ALIGN __attribute__((aligned(64)))
	#define TJALD_ALIGN16 __attribute__((aligned(16)))
#elif defined(_MSC_VER)
	#define TJALD_ALIGN __declspec(align(64))
	#define TJALD_ALIGN16 __declspec(align(16))
#else
	#define TJALD_ALIGN _Alignas(64)
	#define TJALD_ALIGN16 _Alignas(16)
#endif

#define tjald_2_begin tjald_fn_pointers.tjald_2_begin_i
#define tjald_2_absorb tjald_fn_pointers.tjald_2_absorb_i
#define tjald_2_end tjald_fn_pointers.tjald_2_end_i
#define tjald_2 tjald_fn_pointers.tjald_2_i
#define tjald_3_begin tjald_fn_pointers.tjald_3_begin_i
#define tjald_3_absorb tjald_fn_pointers.tjald_3_absorb_i
#define tjald_3_end tjald_fn_pointers.tjald_3_end_i
#define tjald_3 tjald_fn_pointers.tjald_3_i
#define tjald_4_begin tjald_fn_pointers.tjald_4_begin_i
#define tjald_4_absorb tjald_fn_pointers.tjald_4_absorb_i
#define tjald_4_end tjald_fn_pointers.tjald_4_end_i
#define tjald_4 tjald_fn_pointers.tjald_4_i
#define gesus_128_seed tjald_fn_pointers.gesus_128_seed_i
#define gesus_128_rand tjald_fn_pointers.gesus_128_rand_i
#define gesus_512_seed tjald_fn_pointers.gesus_512_seed_i
#define gesus_512_rand tjald_fn_pointers.gesus_512_rand_i
#define TJALD_NICE 69

typedef struct tjald_2_state{
	TJALD_ALIGN uint8_t state[4*11*16+64];
	TJALD_ALIGN uint8_t buffer[4*128];
} tjald_2_state;

typedef struct tjald_3_state{
	TJALD_ALIGN uint8_t state[4*11*16+320];
	TJALD_ALIGN uint8_t buffer[4*512];
} tjald_3_state;

typedef struct tjald_4_state{
	TJALD_ALIGN uint8_t state[4*11*16+320];
	TJALD_ALIGN uint8_t buffer[4*1024];
} tjald_4_state;

typedef struct gesus_128_state{
	TJALD_ALIGN16 uint8_t output[1024];
	TJALD_ALIGN16 uint8_t secret[1024];
	TJALD_ALIGN16 uint8_t state[176]; 
	uint64_t spent;
} gesus_128_state;

typedef struct gesus_512_state{
	TJALD_ALIGN uint8_t output[4096];
	TJALD_ALIGN uint8_t secret[4096];
	TJALD_ALIGN uint8_t state[704]; 
	uint64_t spent;
} gesus_512_state;

struct tjald_fn_pointers_{
	void (*tjald_2_begin_i)(tjald_2_state* state,const uint8_t key[704]);
	void (*tjald_2_absorb_i)(tjald_2_state* state,const void* input,size_t input_length);
	void (*tjald_2_end_i)(tjald_2_state* state,uint8_t out[64]);
	void (*tjald_2_i)(const uint8_t key[704],const void* input,size_t input_length,uint8_t out[64]);

	void (*tjald_3_begin_i)(tjald_3_state* state,const uint8_t key[704]);
	void (*tjald_3_absorb_i)(tjald_3_state* state,const void* input,size_t input_length);
	void (*tjald_3_end_i)(tjald_3_state* state,uint8_t out[64]);
	void (*tjald_3_i)(const uint8_t key[704],const void* input,size_t input_length,uint8_t out[64]);

	void (*tjald_4_begin_i)(tjald_4_state* state);
	void (*tjald_4_absorb_i)(tjald_4_state* state,const void* input,size_t input_length);
	void (*tjald_4_end_i)(tjald_4_state* state,uint8_t out[64]);
	void (*tjald_4_i)(const void* input,size_t input_length,uint8_t out[64]);
	
	void (*gesus_128_seed_i)(gesus_128_state* state,const void* seed,size_t seed_length);
	void (*gesus_128_rand_i)(gesus_128_state* state,void* output,size_t output_length);

	void (*gesus_512_seed_i)(gesus_512_state* state,const void* seed,size_t seed_length);
	void (*gesus_512_rand_i)(gesus_512_state* state,void* output,size_t output_length);
};

extern struct tjald_fn_pointers_ tjald_fn_pointers;

#if defined(__cplusplus)
	extern "C" {
#endif
int tjald_once();
int tjald_once_limit(int limit);
int tjald_self_test();
void tjald_expand_seed(const void* seed,size_t seed_length,uint8_t expanded_key[704]);
#if defined(__cplusplus)
	}
#endif

#endif

