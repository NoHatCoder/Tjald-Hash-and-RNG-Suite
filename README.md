# Tjald Hash and RNG Suite
A collection of hash and RNG functions that rely on hardware AES instructions.

## Warning - Incomplete software
This library is in a pre-release state, while it is technically usable it lacks proper documentation and not all planned code paths have been implemented yet.

## Warning - Experimental cryptography
The functions of this library have been developed to meet a set of cryptographic claims. None of these claims have yet been verified by 3rd party cryptographers. This library should not be used for cryptographic purposes until it has been properly reviewed.

## Request for collaboration
This library needs better documentation, it needs a better reference for cryptographers, it needs more code paths, in particular constant time without hardware support.

## Goal
The goal of this library is to provide the fastest possible hash and RNG functions for modern X86 and Arm cores by utilizing AES acceleration instructions. Fast implementations for several other architectures should also be possible, but they have not yet been implemented.

## The functions
- Tjald2 - Suitable for hash tables with hash-flooding resistance. Also suitable as a non-cryptographic hash function.
- Tjald3 - A MAC function, 128b of claimed strength.
- Tjald4 - A full cryptographic hash function with 256b/256b of claimed strength.
- Gesus128 - A cryptographic RNG, 256b of claimed strength. Cannot take advantage of 256b and 512b vector instructions, but is initialized faster than Gesus512.
- Gesus512 - A cryptographic RNG, 256b of claimed strength.

## Performance
On a Zen4 CPU I have measured Tjald2 to process up to around 30 bytes per clock when reading from L2 cache. This is faster than any other hash function that I am aware of. Tjald3 and Tjald4 can similarly do approximately 15 and 10 bytes per clock respectively, this is approximately an order of magnitude faster than any other cryptographic hash function. Gesus512 can generate approximately 10 bytes per clock, while Gesus128 can do half of that.

## Design considerations
The high performance is achieved by a combination of several advancements relative to most other competing functions. AES acceleration instructions will generally do a lot more useful cryptographic work than any other instructions available on modern CPUs, including all other instructions specifically designed for cryptography, most other functions use instructions that do far less work per invocation. The algorithms are designed to work directly on 512 bit vector registers, most other functions are designed around 32 or 64 bit integers, with vector implementations being an afterthought, this tends to result in a lot of wasted time moving data around, and only moderate gains. The algorithms make use of a large 11-register state, this allows many instructions to be processed in parallel, most other algorithms simply cannot issue enough non-dependent instructions to saturate a core with vector instructions.

The constructions use single round AES instructions rather than the full 10 round AES schedule, this allows for a much faster mixing pattern.

Tjald4 processes data in blocks of 1 KiB, iterating over the block 3 times. While this is similar to the prominent Merkle-Damgård constructions, the block is much larger. This makes the amount of work performed per block similarly larger, which in turn means that an attack on a single block will either have to maintain a state difference for much longer, or resynchronise the state 3 times instead of 1. Tjald3 uses a similar but lighter construction.

Gesus128 uses 11 128b registers of state, along with 1 KiB of additional slowly cycled state. This means that a state recovery attack will have to work on more than 1 KiB of output, and take into consideration all of the transformations for that period of output.

All Tjald functions have a separate code path for short inputs, which use 128b vectors. The long path is cryptographically identical, but use 512b vectors to run 4 instances simultaneously, these are finally joined by hashing the combined state using the short path. Similarly Gesus512 is 4 instances of Gesus128 running in parallel.

## Files included
- reference.c - A simple implementation that favours readability over speed. Very slow. Not for production use. Has no header file, to be included directly in the code that calls it.
- tjald_impl.c - Several implementations, the `tjald_once` function automatically enables the best for the current CPU. Can optionally select one of the assembly paths if these have been linked.
- tjald_header.h - Header file for `tjald_impl.c`.

Object files, necessary for AVX2 and AVX512 paths.
- tjald_assembly.obj - Baked assembly code for Windows X86_64.
- tjald_assembly_linux.o - Baked assembly file that might be fit for several other X86_64 systems (untested).

Source of object files, build with Node.js and NASM. These files are not necessary for using the library.
- generate.js - Assembly generator.
- tjald_assembly.s - Auto generated.
- tjald_assembly_l.s - Auto generated.

Benchmark, test and example program (Windows only).
- test.c
- test.h

## Compiler invocations
- `gcc -o test.exe test.c tjald_impl.c tjald_assembly.obj -O3`

- `clang -o test.exe test.c tjald_impl.c tjald_assembly.obj -O3`

- `if not defined DevEnvDir (call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat")`
- `"C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\14.40.33807\bin\Hostx64\x64\cl" test.c tjald_impl.c /O2 /link /out:test.exe tjald_assembly.obj`

- `node generate.js l`
- `nasm -o tjald_assembly_linux.o tjald_assembly.s -f elf64`

- `node generate.js w`
- `nasm -o tjald_assembly.obj tjald_assembly.s -f win64`

## Function list
- tjald_once - Must be run before any other function, this sets the function pointers to appropriate implementations for the local machine. Return an integer indicating what implementation was selected. 6: AVX512+VAES. 4: AVX2+VAES. 3: AVX+AESNI. 2: SSE2+AESNI/Arm AES. 0: Portable C. -1: No suitable implementation present.
- tjald_once_limit - Can be used in place of `tjald_once` to force selecting a lower implementation level.
- tjald_self_test - A small test function to verify that the build is working. Returns 69 on success.
- tjald_expand_seed - Expands an arbitrary length seed into a 704 byte key for Tjald2 and Tjald3.

- tjald_2_begin/tjald_3_begin/tjald_4_begin - Initialize a Tjald state struct in preparation for computing a hash value. Tjald2 and Tjald3 take an optional key, pass a null pointer instead of the key to use the default seed.
- tjald_2_absorb/tjald_3_absorb/tjald_4_absorb - Absorb an arbitrary amount of data. Can be called many times. Must only be called after the struct has been initialized.
- tjald_2_end/tjald_3_end/tjald_4_end - Finalises the hashing process and writes the result to the given buffer. No further calls may be made before the struct has been initialized again.
- tjald_2/tjald_3/tjald_4 - One shot functions that allocate a struct on the stack and call each of the three functions above once each.

- gesus_128_seed/gesus_512_seed - Initializes a Gesus state struct using an arbitrary length seed.
- gesus_128_rand/gesus_512_rand - Writes an arbitrary amount of output to a given output buffer. The state struct must be initialized before this function is called.