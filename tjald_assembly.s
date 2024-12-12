default rel
SECTION .data
l3_ptrs:
	dq tjald_2_begin_l3
	dq tjald_2_absorb_l3
	dq tjald_2_end_l3
	dq tjald_2_l3
	dq tjald_3_begin_l3
	dq tjald_3_absorb_l3
	dq tjald_3_end_l3
	dq tjald_3_l3
	dq tjald_4_begin_l3
	dq tjald_4_absorb_l3
	dq tjald_4_end_l3
	dq tjald_4_l3
	dq gesus_128_seed_l3
	dq gesus_128_rand_l3
	dq gesus_512_seed_l3
	dq gesus_512_rand_l3
l4_ptrs:
	dq tjald_2_begin_l4
	dq tjald_2_absorb_l4
	dq tjald_2_end_l4
	dq tjald_2_l4
	dq tjald_3_begin_l4
	dq tjald_3_absorb_l4
	dq tjald_3_end_l4
	dq tjald_3_l4
	dq tjald_4_begin_l4
	dq tjald_4_absorb_l4
	dq tjald_4_end_l4
	dq tjald_4_l4
	dq gesus_128_seed_l3
	dq gesus_128_rand_l3
	dq gesus_512_seed_l4
	dq gesus_512_rand_l4
l6_ptrs:
	dq tjald_2_begin_l6
	dq tjald_2_absorb_l6
	dq tjald_2_end_l6
	dq tjald_2_l6
	dq tjald_3_begin_l6
	dq tjald_3_absorb_l6
	dq tjald_3_end_l6
	dq tjald_3_l6
	dq tjald_4_begin_l6
	dq tjald_4_absorb_l6
	dq tjald_4_end_l6
	dq tjald_4_l6
	dq gesus_128_seed_l3
	dq gesus_128_rand_l3
	dq gesus_512_seed_l6
	dq gesus_512_rand_l6
SECTION .text
	global tjald_once_asm_limit
	extern tjald_seed,tjald_small_seed,tjald_fn_pointers
tjald_memcpy_l6:
	cmp rcx, 64
	jna tjald_memcpy_l4
	vmovdqu32 zmm15, [rsi+rcx*1-64]
	lea rcx, [rcx+rdi*1-64]
	vmovdqu32 [rcx], zmm15
.l0:
	vmovdqu32 zmm15, [rsi]
	vmovdqu32 [rdi], zmm15
	add rsi, 64
	add rdi, 64
	cmp rdi, rcx
	js .l0
	ret
tjald_memcpy_l4:
	cmp rcx, 32
	jna tjald_memcpy_l3
	vmovdqu ymm15, [rsi+rcx*1-32]
	lea rcx, [rcx+rdi*1-32]
	vmovdqu [rcx], ymm15
.l0:
	vmovdqu ymm15, [rsi]
	vmovdqu [rdi], ymm15
	add rsi, 32
	add rdi, 32
	cmp rdi, rcx
	js .l0
	ret
tjald_memcpy_l2:
tjald_memcpy_l1:
tjald_memcpy_l3:
	cmp rcx, 16
	jna tjald_memcpy_l0
	vmovdqu xmm15, [rsi+rcx*1-16]
	lea rcx, [rcx+rdi*1-16]
	vmovdqu [rcx], xmm15
.l0:
	vmovdqu xmm15, [rsi]
	vmovdqu [rdi], xmm15
	add rsi, 16
	add rdi, 16
	cmp rdi, rcx
	js .l0
	ret
tjald_memcpy_l0:
	cmp rcx, 4
	jna .l1
	mov r13d, [rsi+rcx*1-4]
	lea rcx, [rcx+rdi*1-4]
	mov [rcx], r13d
.l0:
	mov r13d, [rsi]
	mov [rdi], r13d
	add rsi, 4
	add rdi, 4
	cmp rdi, rcx
	js .l0
	ret
.l1:
	test rcx, rcx
	jz .l2
.l3:
	mov r13b, [rsi]
	mov [rdi], r13b
	inc rsi
	inc rdi
	dec rcx
	jnz .l3
.l2:
	ret
tjald_memxor_l6:
	cmp rcx, 64
	jna tjald_memxor_l4
	vmovdqu32 zmm14, [rsi+rcx*1-64]
	lea rcx, [rcx+rdi*1-64]
	vpxord zmm14, zmm14, [rcx]
.l0:
	vmovdqu32 zmm15, [rsi]
	vpxord zmm15, zmm15, [rdi]
	vmovdqu32 [rdi], zmm15
	add rsi, 64
	add rdi, 64
	cmp rdi, rcx
	js .l0
	vmovdqu32 [rcx], zmm14
	ret
tjald_memxor_l4:
	cmp rcx, 32
	jna tjald_memxor_l3
	vmovdqu ymm14, [rsi+rcx*1-32]
	lea rcx, [rcx+rdi*1-32]
	vpxor ymm14, ymm14, [rcx]
.l0:
	vmovdqu ymm15, [rsi]
	vpxor ymm15, ymm15, [rdi]
	vmovdqu [rdi], ymm15
	add rsi, 32
	add rdi, 32
	cmp rdi, rcx
	js .l0
	vmovdqu [rcx], ymm14
	ret
tjald_memxor_l2:
tjald_memxor_l1:
tjald_memxor_l3:
	cmp rcx, 16
	jna tjald_memxor_l0
	vmovdqu xmm14, [rsi+rcx*1-16]
	lea rcx, [rcx+rdi*1-16]
	vpxor xmm14, xmm14, [rcx]
.l0:
	vmovdqu xmm15, [rsi]
	vpxor xmm15, xmm15, [rdi]
	vmovdqu [rdi], xmm15
	add rsi, 16
	add rdi, 16
	cmp rdi, rcx
	js .l0
	vmovdqu [rcx], xmm14
	ret
tjald_memxor_l0:
	cmp rcx, 4
	jna .l1
	mov r13d, [rsi+rcx*1-4]
	lea rcx, [rcx+rdi*1-4]
	xor r13d, [rcx]
.l0:
	mov r12d, [rsi]
	xor r12d, [rdi]
	mov [rdi], r12d
	add rsi, 4
	add rdi, 4
	cmp rdi, rcx
	js .l0
	mov [rcx], r13d
	ret
.l1:
	test rcx, rcx
	jz .l2
.l3:
	mov r13b, [rsi]
	xor r13b, [rdi]
	mov [rdi], r13b
	inc rsi
	inc rdi
	dec rcx
	jnz .l3
.l2:
	ret
tjald_memzero_l6:
	cmp rcx, 64
	jna tjald_memzero_l4
	vpxord zmm15, zmm15, zmm15
	lea rcx, [rcx+rdi*1-64]
	vmovdqu32 [rcx], zmm15
.l0:
	vmovdqu32 [rdi], zmm15
	add rdi, 64
	cmp rdi, rcx
	js .l0
	ret
tjald_memzero_l4:
	cmp rcx, 32
	jna tjald_memzero_l3
	vpxor ymm15, ymm15, ymm15
	lea rcx, [rcx+rdi*1-32]
	vmovdqu [rcx], ymm15
.l0:
	vmovdqu [rdi], ymm15
	add rdi, 32
	cmp rdi, rcx
	js .l0
	ret
tjald_memzero_l2:
tjald_memzero_l1:
tjald_memzero_l3:
	cmp rcx, 16
	jna tjald_memzero_l0
	vpxor xmm15, xmm15, xmm15
	lea rcx, [rcx+rdi*1-16]
	vmovdqu [rcx], xmm15
.l0:
	vmovdqu [rdi], xmm15
	add rdi, 16
	cmp rdi, rcx
	js .l0
	ret
tjald_memzero_l0:
	xor r13, r13
	cmp rcx, 4
	jna .l1
	lea rcx, [rcx+rdi*1-4]
	mov [rcx], r13d
.l0:
	mov [rdi], r13d
	add rdi, 4
	cmp rdi, rcx
	js .l0
	ret
.l1:
	test rcx, rcx
	jz .l2
.l3:
	mov [rdi+rcx*1-1], r13b
	dec rcx
	jnz .l3
.l2:
	ret
tjald_kernel_128:
.l0:
	vmovdqu xmm12, [r8]
	vmovdqu xmm13, [r9]
	vpxor xmm15, xmm0, xmm12
	vaesenc xmm11, xmm15, xmm4
	vpxor xmm15, xmm4, xmm13
	vaesenc xmm0, xmm15, xmm8
	vpxor xmm15, xmm8, xmm13
	vaesenc xmm4, xmm15, xmm1
	vpaddb xmm10, xmm10, xmm12
	vmovdqu xmm12, [r8+r10]
	vmovdqu xmm13, [r9+r10]
	vpxor xmm15, xmm1, xmm12
	vaesenc xmm8, xmm15, xmm5
	vpxor xmm15, xmm5, xmm13
	vaesenc xmm1, xmm15, xmm9
	vpxor xmm15, xmm9, xmm13
	vaesenc xmm5, xmm15, xmm2
	vpaddb xmm11, xmm11, xmm12
	vmovdqu xmm12, [r8+r10*2]
	vmovdqu xmm13, [r9+r10*2]
	vpxor xmm15, xmm2, xmm12
	vaesenc xmm9, xmm15, xmm6
	vpxor xmm15, xmm6, xmm13
	vaesenc xmm2, xmm15, xmm10
	vpxor xmm15, xmm10, xmm13
	vaesenc xmm6, xmm15, xmm3
	vpaddb xmm8, xmm8, xmm12
	vmovdqu xmm12, [r8+r11]
	vmovdqu xmm13, [r9+r11]
	vpxor xmm15, xmm3, xmm12
	vaesenc xmm10, xmm15, xmm7
	vpxor xmm15, xmm7, xmm13
	vaesenc xmm3, xmm15, xmm11
	vpxor xmm15, xmm11, xmm13
	vaesenc xmm7, xmm15, xmm0
	vpaddb xmm9, xmm9, xmm12
	lea r8, [r8+r10*4]
	lea r9, [r9+r10*4]
	dec rcx
	jnz .l0
	ret
tjald_kernel_256:
.l0:
	vmovdqu ymm12, [r8]
	vmovdqu ymm13, [r9]
	vpxor ymm15, ymm0, ymm12
	vaesenc ymm11, ymm15, ymm4
	vpxor ymm15, ymm4, ymm13
	vaesenc ymm0, ymm15, ymm8
	vpxor ymm15, ymm8, ymm13
	vaesenc ymm4, ymm15, ymm1
	vpaddb ymm10, ymm10, ymm12
	vmovdqu ymm12, [r8+r10]
	vmovdqu ymm13, [r9+r10]
	vpxor ymm15, ymm1, ymm12
	vaesenc ymm8, ymm15, ymm5
	vpxor ymm15, ymm5, ymm13
	vaesenc ymm1, ymm15, ymm9
	vpxor ymm15, ymm9, ymm13
	vaesenc ymm5, ymm15, ymm2
	vpaddb ymm11, ymm11, ymm12
	vmovdqu ymm12, [r8+r10*2]
	vmovdqu ymm13, [r9+r10*2]
	vpxor ymm15, ymm2, ymm12
	vaesenc ymm9, ymm15, ymm6
	vpxor ymm15, ymm6, ymm13
	vaesenc ymm2, ymm15, ymm10
	vpxor ymm15, ymm10, ymm13
	vaesenc ymm6, ymm15, ymm3
	vpaddb ymm8, ymm8, ymm12
	vmovdqu ymm12, [r8+r11]
	vmovdqu ymm13, [r9+r11]
	vpxor ymm15, ymm3, ymm12
	vaesenc ymm10, ymm15, ymm7
	vpxor ymm15, ymm7, ymm13
	vaesenc ymm3, ymm15, ymm11
	vpxor ymm15, ymm11, ymm13
	vaesenc ymm7, ymm15, ymm0
	vpaddb ymm9, ymm9, ymm12
	lea r8, [r8+r10*4]
	lea r9, [r9+r10*4]
	dec rcx
	jnz .l0
	ret
tjald_kernel_512:
.l0:
	vmovdqu32 zmm12, [r8]
	vmovdqu32 zmm13, [r9]
	vpxord zmm15, zmm0, zmm12
	vaesenc zmm11, zmm15, zmm4
	vpxord zmm15, zmm4, zmm13
	vaesenc zmm0, zmm15, zmm8
	vpxord zmm15, zmm8, zmm13
	vaesenc zmm4, zmm15, zmm1
	vpaddb zmm10, zmm10, zmm12
	vmovdqu32 zmm12, [r8+r10]
	vmovdqu32 zmm13, [r9+r10]
	vpxord zmm15, zmm1, zmm12
	vaesenc zmm8, zmm15, zmm5
	vpxord zmm15, zmm5, zmm13
	vaesenc zmm1, zmm15, zmm9
	vpxord zmm15, zmm9, zmm13
	vaesenc zmm5, zmm15, zmm2
	vpaddb zmm11, zmm11, zmm12
	vmovdqu32 zmm12, [r8+r10*2]
	vmovdqu32 zmm13, [r9+r10*2]
	vpxord zmm15, zmm2, zmm12
	vaesenc zmm9, zmm15, zmm6
	vpxord zmm15, zmm6, zmm13
	vaesenc zmm2, zmm15, zmm10
	vpxord zmm15, zmm10, zmm13
	vaesenc zmm6, zmm15, zmm3
	vpaddb zmm8, zmm8, zmm12
	vmovdqu32 zmm12, [r8+r11]
	vmovdqu32 zmm13, [r9+r11]
	vpxord zmm15, zmm3, zmm12
	vaesenc zmm10, zmm15, zmm7
	vpxord zmm15, zmm7, zmm13
	vaesenc zmm3, zmm15, zmm11
	vpxord zmm15, zmm11, zmm13
	vaesenc zmm7, zmm15, zmm0
	vpaddb zmm9, zmm9, zmm12
	lea r8, [r8+r10*4]
	lea r9, [r9+r10*4]
	dec rcx
	jnz .l0
	ret
tjald_final:
.l0:
	vpxor xmm14, xmm0, xmm8
	vaesenc xmm11, xmm14, xmm4
	vpxor xmm15, xmm4, xmm1
	vaesenc xmm0, xmm15, xmm8
	vpxor xmm14, xmm8, xmm10
	vaesenc xmm4, xmm14, xmm2
	vpaddb xmm9, xmm9, xmm10
	vpxor xmm14, xmm1, xmm9
	vaesenc xmm8, xmm14, xmm5
	vpxor xmm15, xmm5, xmm2
	vaesenc xmm1, xmm15, xmm9
	vpxor xmm14, xmm9, xmm11
	vaesenc xmm5, xmm14, xmm3
	vpaddb xmm10, xmm10, xmm11
	vpxor xmm14, xmm2, xmm10
	vaesenc xmm9, xmm14, xmm6
	vpxor xmm15, xmm6, xmm3
	vaesenc xmm2, xmm15, xmm10
	vpxor xmm14, xmm10, xmm8
	vaesenc xmm6, xmm14, xmm0
	vpaddb xmm11, xmm11, xmm8
	vpxor xmm14, xmm3, xmm11
	vaesenc xmm10, xmm14, xmm7
	vpxor xmm15, xmm7, xmm0
	vaesenc xmm3, xmm15, xmm11
	vpxor xmm14, xmm11, xmm9
	vaesenc xmm7, xmm14, xmm1
	vpaddb xmm8, xmm8, xmm9
	dec rcx
	jnz .l0
	vpaddb xmm0, xmm0, xmm1
	vpaddb xmm2, xmm2, xmm3
	vpaddb xmm4, xmm4, xmm5
	vpaddb xmm6, xmm6, xmm8
	vpaddb xmm7, xmm7, xmm10
	vpxor xmm0, xmm0, xmm6
	vpxor xmm2, xmm2, xmm9
	vmovdqu [rax], xmm0
	vmovdqu [rax+16], xmm2
	vmovdqu [rax+32], xmm4
	vmovdqu [rax+48], xmm7
	ret
gesus_kernel_128:
.l0:
	vmovdqu xmm12, [r8]
	vmovdqu [r8], xmm8
	vpxor xmm15, xmm0, xmm12
	vaesenc xmm11, xmm15, xmm4
	vpxor xmm15, xmm4, xmm12
	vaesenc xmm0, xmm15, xmm8
	vpxor xmm15, xmm8, xmm12
	vaesenc xmm4, xmm15, xmm1
	vpaddb xmm10, xmm10, xmm12
	vpand xmm12, xmm12, xmm1
	vpxor xmm12, xmm12, xmm5
	vaesenc xmm12, xmm12, xmm9
	vmovdqu [r12], xmm12
	vmovdqu xmm12, [r8+r10]
	vmovdqu [r8+r10], xmm9
	vpxor xmm15, xmm1, xmm12
	vaesenc xmm8, xmm15, xmm5
	vpxor xmm15, xmm5, xmm12
	vaesenc xmm1, xmm15, xmm9
	vpxor xmm15, xmm9, xmm12
	vaesenc xmm5, xmm15, xmm2
	vpaddb xmm11, xmm11, xmm12
	vpand xmm12, xmm12, xmm2
	vpxor xmm12, xmm12, xmm6
	vaesenc xmm12, xmm12, xmm10
	vmovdqu [r12+r10], xmm12
	vmovdqu xmm12, [r8+r10*2]
	vmovdqu [r8+r10*2], xmm10
	vpxor xmm15, xmm2, xmm12
	vaesenc xmm9, xmm15, xmm6
	vpxor xmm15, xmm6, xmm12
	vaesenc xmm2, xmm15, xmm10
	vpxor xmm15, xmm10, xmm12
	vaesenc xmm6, xmm15, xmm3
	vpaddb xmm8, xmm8, xmm12
	vpand xmm12, xmm12, xmm3
	vpxor xmm12, xmm12, xmm7
	vaesenc xmm12, xmm12, xmm11
	vmovdqu [r12+r10*2], xmm12
	vmovdqu xmm12, [r8+r11]
	vmovdqu [r8+r11], xmm11
	vpxor xmm15, xmm3, xmm12
	vaesenc xmm10, xmm15, xmm7
	vpxor xmm15, xmm7, xmm12
	vaesenc xmm3, xmm15, xmm11
	vpxor xmm15, xmm11, xmm12
	vaesenc xmm7, xmm15, xmm0
	vpaddb xmm9, xmm9, xmm12
	vpand xmm12, xmm12, xmm0
	vpxor xmm12, xmm12, xmm4
	vaesenc xmm12, xmm12, xmm8
	vmovdqu [r12+r11], xmm12
	lea r8, [r8+r10*4]
	lea r12, [r12+r10*4]
	dec rcx
	jnz .l0
	ret
gesus_kernel_256:
.l0:
	vmovdqu ymm12, [r8]
	vmovdqu [r8], ymm8
	vpxor ymm15, ymm0, ymm12
	vaesenc ymm11, ymm15, ymm4
	vpxor ymm15, ymm4, ymm12
	vaesenc ymm0, ymm15, ymm8
	vpxor ymm15, ymm8, ymm12
	vaesenc ymm4, ymm15, ymm1
	vpaddb ymm10, ymm10, ymm12
	vpand ymm12, ymm12, ymm1
	vpxor ymm12, ymm12, ymm5
	vaesenc ymm12, ymm12, ymm9
	vmovdqu [r12], ymm12
	vmovdqu ymm12, [r8+r10]
	vmovdqu [r8+r10], ymm9
	vpxor ymm15, ymm1, ymm12
	vaesenc ymm8, ymm15, ymm5
	vpxor ymm15, ymm5, ymm12
	vaesenc ymm1, ymm15, ymm9
	vpxor ymm15, ymm9, ymm12
	vaesenc ymm5, ymm15, ymm2
	vpaddb ymm11, ymm11, ymm12
	vpand ymm12, ymm12, ymm2
	vpxor ymm12, ymm12, ymm6
	vaesenc ymm12, ymm12, ymm10
	vmovdqu [r12+r10], ymm12
	vmovdqu ymm12, [r8+r10*2]
	vmovdqu [r8+r10*2], ymm10
	vpxor ymm15, ymm2, ymm12
	vaesenc ymm9, ymm15, ymm6
	vpxor ymm15, ymm6, ymm12
	vaesenc ymm2, ymm15, ymm10
	vpxor ymm15, ymm10, ymm12
	vaesenc ymm6, ymm15, ymm3
	vpaddb ymm8, ymm8, ymm12
	vpand ymm12, ymm12, ymm3
	vpxor ymm12, ymm12, ymm7
	vaesenc ymm12, ymm12, ymm11
	vmovdqu [r12+r10*2], ymm12
	vmovdqu ymm12, [r8+r11]
	vmovdqu [r8+r11], ymm11
	vpxor ymm15, ymm3, ymm12
	vaesenc ymm10, ymm15, ymm7
	vpxor ymm15, ymm7, ymm12
	vaesenc ymm3, ymm15, ymm11
	vpxor ymm15, ymm11, ymm12
	vaesenc ymm7, ymm15, ymm0
	vpaddb ymm9, ymm9, ymm12
	vpand ymm12, ymm12, ymm0
	vpxor ymm12, ymm12, ymm4
	vaesenc ymm12, ymm12, ymm8
	vmovdqu [r12+r11], ymm12
	lea r8, [r8+r10*4]
	lea r12, [r12+r10*4]
	dec rcx
	jnz .l0
	ret
gesus_kernel_512:
.l0:
	vmovdqu32 zmm12, [r8]
	vmovdqu32 [r8], zmm8
	vpxord zmm15, zmm0, zmm12
	vaesenc zmm11, zmm15, zmm4
	vpxord zmm15, zmm4, zmm12
	vaesenc zmm0, zmm15, zmm8
	vpxord zmm15, zmm8, zmm12
	vaesenc zmm4, zmm15, zmm1
	vpaddb zmm10, zmm10, zmm12
	vpandd zmm12, zmm12, zmm1
	vpxord zmm12, zmm12, zmm5
	vaesenc zmm12, zmm12, zmm9
	vmovdqu32 [r12], zmm12
	vmovdqu32 zmm12, [r8+r10]
	vmovdqu32 [r8+r10], zmm9
	vpxord zmm15, zmm1, zmm12
	vaesenc zmm8, zmm15, zmm5
	vpxord zmm15, zmm5, zmm12
	vaesenc zmm1, zmm15, zmm9
	vpxord zmm15, zmm9, zmm12
	vaesenc zmm5, zmm15, zmm2
	vpaddb zmm11, zmm11, zmm12
	vpandd zmm12, zmm12, zmm2
	vpxord zmm12, zmm12, zmm6
	vaesenc zmm12, zmm12, zmm10
	vmovdqu32 [r12+r10], zmm12
	vmovdqu32 zmm12, [r8+r10*2]
	vmovdqu32 [r8+r10*2], zmm10
	vpxord zmm15, zmm2, zmm12
	vaesenc zmm9, zmm15, zmm6
	vpxord zmm15, zmm6, zmm12
	vaesenc zmm2, zmm15, zmm10
	vpxord zmm15, zmm10, zmm12
	vaesenc zmm6, zmm15, zmm3
	vpaddb zmm8, zmm8, zmm12
	vpandd zmm12, zmm12, zmm3
	vpxord zmm12, zmm12, zmm7
	vaesenc zmm12, zmm12, zmm11
	vmovdqu32 [r12+r10*2], zmm12
	vmovdqu32 zmm12, [r8+r11]
	vmovdqu32 [r8+r11], zmm11
	vpxord zmm15, zmm3, zmm12
	vaesenc zmm10, zmm15, zmm7
	vpxord zmm15, zmm7, zmm12
	vaesenc zmm3, zmm15, zmm11
	vpxord zmm15, zmm11, zmm12
	vaesenc zmm7, zmm15, zmm0
	vpaddb zmm9, zmm9, zmm12
	vpandd zmm12, zmm12, zmm0
	vpxord zmm12, zmm12, zmm4
	vaesenc zmm12, zmm12, zmm8
	vmovdqu32 [r12+r11], zmm12
	lea r8, [r8+r10*4]
	lea r12, [r12+r10*4]
	dec rcx
	jnz .l0
	ret
tjald_2_begin_l3:
	push rdi
	sub rsp, 16
	movdqa [rsp], xmm15
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_2_begin_l3_inner
	pop r13
	pop r12
	pop rsi
	movdqa xmm15, [rsp]
	add rsp, 16
	pop rdi
	ret
tjald_2_begin_l3_inner:
	test rsi, rsi
	jnz .l0
	mov rsi, $tjald_seed
.l0:
	mov rcx, 704
	pxor xmm15, xmm15
	movdqu [rdi+704], xmm15
	movdqu [rdi+720], xmm15
	movdqu [rdi+736], xmm15
	movdqu [rdi+752], xmm15
	call tjald_memcpy_l3
	ret
tjald_2_absorb_l3:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	call tjald_2_absorb_l3_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	ret
tjald_2_absorb_l3_inner:
	mov r8d, [rdi+764]
	lea rcx, [r8+rdx*1]
	mov rax, rdx
	add rax, -4096
	sbb rax, rax
	or rax, r8
	and rax, -2147483648
	or rcx, rax
	mov [rdi+764], ecx
	and r8, 511
	jz .l0
	mov rcx, rdx
	add rdx, r8
	sub rdx, 512
	jns .l1
	lea rdi, [rdi+r8*1+768]
	call tjald_memcpy_l3
	jmp .l2
.l1:
	sub rcx, rdx
	mov r9, rdi
	lea rax, [rsi+rcx]
	lea rdi, [rdi+r8*1+768]
	call tjald_memcpy_l3
	mov rdi, r9
	lea rsi, [rdi+768]
	mov r12, 512
	call tjald_2_innerabsorb_l3
	mov rsi, rax
.l0:
	mov r12, rdx
	call tjald_2_innerabsorb_l3
	and rdx, 511
	mov rcx, rdx
	add rdi, 768
	call tjald_memcpy_l3
.l2:
	ret
tjald_2_innerabsorb_l3:
	shr r12, 9
	jz .l0
	dec r12
	mov rbx, r12
	shr rbx, 5
	and r12, 31
	inc r12
	inc rbx
	mov r10, 128
	mov r11, 384
.l1:
	mov rbp, 48
.l2:
	mov rcx, r12
	lea r8, [rsi+rbp*1]
	lea r9, [rsi+rbp*1+64]
	movdqu xmm0, [rdi+rbp*1]
	movdqu xmm1, [rdi+rbp*1+64]
	movdqu xmm2, [rdi+rbp*1+128]
	movdqu xmm3, [rdi+rbp*1+192]
	movdqu xmm4, [rdi+rbp*1+256]
	movdqu xmm5, [rdi+rbp*1+320]
	movdqu xmm6, [rdi+rbp*1+384]
	movdqu xmm7, [rdi+rbp*1+448]
	movdqu xmm8, [rdi+rbp*1+512]
	movdqu xmm9, [rdi+rbp*1+576]
	movdqu xmm10, [rdi+rbp*1+640]
	call tjald_kernel_128
	movdqu [rdi+rbp*1], xmm0
	movdqu [rdi+rbp*1+64], xmm1
	movdqu [rdi+rbp*1+128], xmm2
	movdqu [rdi+rbp*1+192], xmm3
	movdqu [rdi+rbp*1+256], xmm4
	movdqu [rdi+rbp*1+320], xmm5
	movdqu [rdi+rbp*1+384], xmm6
	movdqu [rdi+rbp*1+448], xmm7
	movdqu [rdi+rbp*1+512], xmm8
	movdqu [rdi+rbp*1+576], xmm9
	movdqu [rdi+rbp*1+640], xmm10
	sub rbp, 16
	jns .l2
	shl r12, 9
	add rsi, r12
	mov r12, 32
	dec rbx
	jnz .l1
.l0:
	ret
tjald_2_end_l3:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_2_end_l3_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	ret
tjald_2_end_l3_inner:
	mov rax, rsi
	mov rdx, rdi
	mov r10d, [rdi+764]
	cmp r10, 508
	ja .l0
	lea rdi, [rdx+r10*1+768]
	lea rbx, [r10+131]
	and rbx, -128
	mov rcx, rbx
	sub rcx, r10
	call tjald_memzero_l3
	mov [rdx+rbx*1+764], r10d
	mov rcx, rbx
	shr rcx, 7
	lea r8, [rdx+768]
	lea r9, [rdx+784]
	mov rbp, rdx
	jmp .l1
.l0:
	or r10, -2147483648
	mov [rdi+764], r10d
	and r10, 511
	jz .l2
	lea rdi, [rdx+r10*1+768]
	mov rcx, 512
	sub rcx, r10
	call tjald_memzero_l3
	mov rdi, rdx
	lea rsi, [rdx+768]
	mov r12, 512
	call tjald_2_innerabsorb_l3
.l2:
	mov rcx, 6
	mov r8, rdx
	lea r9, [rdx+16]
	mov rbp, $tjald_seed
.l1:
	movdqu xmm0, [rbp]
	movdqu xmm1, [rbp+16]
	movdqu xmm2, [rbp+32]
	movdqu xmm3, [rbp+48]
	movdqu xmm4, [rbp+64]
	movdqu xmm5, [rbp+80]
	movdqu xmm6, [rbp+96]
	movdqu xmm7, [rbp+112]
	movdqu xmm8, [rbp+128]
	movdqu xmm9, [rbp+144]
	movdqu xmm10, [rbp+160]
	mov r10, 32
	mov r11, 96
	call tjald_kernel_128
	mov rcx, 4
	call tjald_final
	ret
tjald_2_short:
	test rdi, rdi
	jnz .l0
	mov rdi, $tjald_seed
.l0:
	sub rsp, 256
	movdqu xmm0, [rdi]
	movdqu xmm1, [rdi+16]
	movdqu xmm2, [rdi+32]
	movdqu xmm3, [rdi+48]
	movdqu xmm4, [rdi+64]
	movdqu xmm5, [rdi+80]
	movdqu xmm6, [rdi+96]
	movdqu xmm7, [rdi+112]
	movdqu xmm8, [rdi+128]
	movdqu xmm9, [rdi+144]
	movdqu xmm10, [rdi+160]
	mov r10, 32
	mov r11, 96
	mov rax, rcx
	mov rcx, rdx
	mov r12, rdx
	and rdx, 127
	shr rcx, 7
	mov rbx, rcx
	jz .l1
	mov r8, rsi
	lea r9, [rsi+16]
	call tjald_kernel_128
.l1:
	shl rbx, 7
	add rsi, rbx
	mov rdi, rsp
	mov rcx, rdx
	call tjald_memcpy_l3
	lea rdi, [rsp+rdx]
	lea rbp, [rdx+131]
	and rbp, -128
	mov rcx, rbp
	sub rcx, rdx
	call tjald_memzero_l3
	mov [rsp+rbp*1-4], r12d
	mov r8, rsp
	lea r9, [rsp+16]
	mov rcx, rbp
	shr rcx, 7
	call tjald_kernel_128
	mov rcx, 4
	call tjald_final
	add rsp, 256
	pop r15
	pop r14
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	ret
tjald_2_l3:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	push r14
	push r15
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	mov rcx, r9
	cmp rdx, 508
	jbe tjald_2_short
	mov r14, rcx
	mov rbp, rsi
	mov rbx, rdx
	mov rsi, rdi
	mov r15, rsp
	and rsp, -64
	sub rsp, 1280
	mov rdi, rsp
	call tjald_2_begin_l3_inner
	mov rdi, rsp
	mov rsi, rbp
	mov rdx, rbx
	call tjald_2_absorb_l3_inner
	mov rdi, rsp
	mov rsi, r14
	call tjald_2_end_l3_inner
	mov rsp, r15
	pop r15
	pop r14
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	ret
tjald_2_begin_l4:
	push rdi
	sub rsp, 16
	movdqa [rsp], xmm15
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_2_begin_l4_inner
	pop r13
	pop r12
	pop rsi
	movdqa xmm15, [rsp]
	add rsp, 16
	pop rdi
	vzeroupper
	ret
tjald_2_begin_l4_inner:
	test rsi, rsi
	jnz .l0
	mov rsi, $tjald_seed
.l0:
	mov rcx, 704
	vpxor ymm15, ymm15, ymm15
	vmovdqu [rdi+704], ymm15
	vmovdqu [rdi+736], ymm15
	call tjald_memcpy_l4
	ret
tjald_2_absorb_l4:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	call tjald_2_absorb_l4_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_2_absorb_l4_inner:
	mov r8d, [rdi+764]
	lea rcx, [r8+rdx*1]
	mov rax, rdx
	add rax, -4096
	sbb rax, rax
	or rax, r8
	and rax, -2147483648
	or rcx, rax
	mov [rdi+764], ecx
	and r8, 511
	jz .l0
	mov rcx, rdx
	add rdx, r8
	sub rdx, 512
	jns .l1
	lea rdi, [rdi+r8*1+768]
	call tjald_memcpy_l4
	jmp .l2
.l1:
	sub rcx, rdx
	mov r9, rdi
	lea rax, [rsi+rcx]
	lea rdi, [rdi+r8*1+768]
	call tjald_memcpy_l4
	mov rdi, r9
	lea rsi, [rdi+768]
	mov r12, 512
	call tjald_2_innerabsorb_l4
	mov rsi, rax
.l0:
	mov r12, rdx
	call tjald_2_innerabsorb_l4
	and rdx, 511
	mov rcx, rdx
	add rdi, 768
	call tjald_memcpy_l4
.l2:
	ret
tjald_2_innerabsorb_l4:
	shr r12, 9
	jz .l0
	dec r12
	mov rbx, r12
	shr rbx, 5
	and r12, 31
	inc r12
	inc rbx
	mov r10, 128
	mov r11, 384
.l1:
	mov rbp, 32
.l2:
	mov rcx, r12
	lea r8, [rsi+rbp*1]
	lea r9, [rsi+rbp*1+64]
	vmovdqu ymm0, [rdi+rbp*1]
	vmovdqu ymm1, [rdi+rbp*1+64]
	vmovdqu ymm2, [rdi+rbp*1+128]
	vmovdqu ymm3, [rdi+rbp*1+192]
	vmovdqu ymm4, [rdi+rbp*1+256]
	vmovdqu ymm5, [rdi+rbp*1+320]
	vmovdqu ymm6, [rdi+rbp*1+384]
	vmovdqu ymm7, [rdi+rbp*1+448]
	vmovdqu ymm8, [rdi+rbp*1+512]
	vmovdqu ymm9, [rdi+rbp*1+576]
	vmovdqu ymm10, [rdi+rbp*1+640]
	call tjald_kernel_256
	vmovdqu [rdi+rbp*1], ymm0
	vmovdqu [rdi+rbp*1+64], ymm1
	vmovdqu [rdi+rbp*1+128], ymm2
	vmovdqu [rdi+rbp*1+192], ymm3
	vmovdqu [rdi+rbp*1+256], ymm4
	vmovdqu [rdi+rbp*1+320], ymm5
	vmovdqu [rdi+rbp*1+384], ymm6
	vmovdqu [rdi+rbp*1+448], ymm7
	vmovdqu [rdi+rbp*1+512], ymm8
	vmovdqu [rdi+rbp*1+576], ymm9
	vmovdqu [rdi+rbp*1+640], ymm10
	sub rbp, 32
	jns .l2
	shl r12, 9
	add rsi, r12
	mov r12, 32
	dec rbx
	jnz .l1
.l0:
	ret
tjald_2_end_l4:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_2_end_l4_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_2_end_l4_inner:
	mov rax, rsi
	mov rdx, rdi
	mov r10d, [rdi+764]
	cmp r10, 508
	ja .l0
	lea rdi, [rdx+r10*1+768]
	lea rbx, [r10+131]
	and rbx, -128
	mov rcx, rbx
	sub rcx, r10
	call tjald_memzero_l4
	mov [rdx+rbx*1+764], r10d
	mov rcx, rbx
	shr rcx, 7
	lea r8, [rdx+768]
	lea r9, [rdx+784]
	mov rbp, rdx
	jmp .l1
.l0:
	or r10, -2147483648
	mov [rdi+764], r10d
	and r10, 511
	jz .l2
	lea rdi, [rdx+r10*1+768]
	mov rcx, 512
	sub rcx, r10
	call tjald_memzero_l4
	mov rdi, rdx
	lea rsi, [rdx+768]
	mov r12, 512
	call tjald_2_innerabsorb_l4
.l2:
	mov rcx, 6
	mov r8, rdx
	lea r9, [rdx+16]
	mov rbp, $tjald_seed
.l1:
	movdqu xmm0, [rbp]
	movdqu xmm1, [rbp+16]
	movdqu xmm2, [rbp+32]
	movdqu xmm3, [rbp+48]
	movdqu xmm4, [rbp+64]
	movdqu xmm5, [rbp+80]
	movdqu xmm6, [rbp+96]
	movdqu xmm7, [rbp+112]
	movdqu xmm8, [rbp+128]
	movdqu xmm9, [rbp+144]
	movdqu xmm10, [rbp+160]
	mov r10, 32
	mov r11, 96
	call tjald_kernel_128
	mov rcx, 4
	call tjald_final
	ret
tjald_2_l4:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	push r14
	push r15
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	mov rcx, r9
	cmp rdx, 508
	jbe tjald_2_short
	mov r14, rcx
	mov rbp, rsi
	mov rbx, rdx
	mov rsi, rdi
	mov r15, rsp
	and rsp, -64
	sub rsp, 1280
	mov rdi, rsp
	call tjald_2_begin_l4_inner
	mov rdi, rsp
	mov rsi, rbp
	mov rdx, rbx
	call tjald_2_absorb_l4_inner
	mov rdi, rsp
	mov rsi, r14
	call tjald_2_end_l4_inner
	mov rsp, r15
	pop r15
	pop r14
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_2_begin_l6:
	push rdi
	sub rsp, 16
	movdqa [rsp], xmm15
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_2_begin_l6_inner
	pop r13
	pop r12
	pop rsi
	movdqa xmm15, [rsp]
	add rsp, 16
	pop rdi
	vzeroupper
	ret
tjald_2_begin_l6_inner:
	test rsi, rsi
	jnz .l0
	mov rsi, $tjald_seed
.l0:
	mov rcx, 704
	vpxord zmm15, zmm15, zmm15
	vmovdqu32 [rdi+704], zmm15
	call tjald_memcpy_l6
	ret
tjald_2_absorb_l6:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	call tjald_2_absorb_l6_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_2_absorb_l6_inner:
	mov r8d, [rdi+764]
	lea rcx, [r8+rdx*1]
	mov rax, rdx
	add rax, -4096
	sbb rax, rax
	or rax, r8
	and rax, -2147483648
	or rcx, rax
	mov [rdi+764], ecx
	and r8, 511
	jz .l0
	mov rcx, rdx
	add rdx, r8
	sub rdx, 512
	jns .l1
	lea rdi, [rdi+r8*1+768]
	call tjald_memcpy_l6
	jmp .l2
.l1:
	sub rcx, rdx
	mov r9, rdi
	lea rax, [rsi+rcx]
	lea rdi, [rdi+r8*1+768]
	call tjald_memcpy_l6
	mov rdi, r9
	lea rsi, [rdi+768]
	mov r12, 512
	call tjald_2_innerabsorb_l6
	mov rsi, rax
.l0:
	mov r12, rdx
	call tjald_2_innerabsorb_l6
	and rdx, 511
	mov rcx, rdx
	add rdi, 768
	call tjald_memcpy_l6
.l2:
	ret
tjald_2_innerabsorb_l6:
	shr r12, 9
	jz .l0
	mov r10, 128
	mov r11, 384
	mov rcx, r12
	mov r8, rsi
	lea r9, [rsi+64]
	vmovdqu32 zmm0, [rdi]
	vmovdqu32 zmm1, [rdi+64]
	vmovdqu32 zmm2, [rdi+128]
	vmovdqu32 zmm3, [rdi+192]
	vmovdqu32 zmm4, [rdi+256]
	vmovdqu32 zmm5, [rdi+320]
	vmovdqu32 zmm6, [rdi+384]
	vmovdqu32 zmm7, [rdi+448]
	vmovdqu32 zmm8, [rdi+512]
	vmovdqu32 zmm9, [rdi+576]
	vmovdqu32 zmm10, [rdi+640]
	call tjald_kernel_512
	vmovdqu32 [rdi], zmm0
	vmovdqu32 [rdi+64], zmm1
	vmovdqu32 [rdi+128], zmm2
	vmovdqu32 [rdi+192], zmm3
	vmovdqu32 [rdi+256], zmm4
	vmovdqu32 [rdi+320], zmm5
	vmovdqu32 [rdi+384], zmm6
	vmovdqu32 [rdi+448], zmm7
	vmovdqu32 [rdi+512], zmm8
	vmovdqu32 [rdi+576], zmm9
	vmovdqu32 [rdi+640], zmm10
	shl r12, 9
	add rsi, r12
.l0:
	ret
tjald_2_end_l6:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_2_end_l6_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_2_end_l6_inner:
	mov rax, rsi
	mov rdx, rdi
	mov r10d, [rdi+764]
	cmp r10, 508
	ja .l0
	lea rdi, [rdx+r10*1+768]
	lea rbx, [r10+131]
	and rbx, -128
	mov rcx, rbx
	sub rcx, r10
	call tjald_memzero_l6
	mov [rdx+rbx*1+764], r10d
	mov rcx, rbx
	shr rcx, 7
	lea r8, [rdx+768]
	lea r9, [rdx+784]
	mov rbp, rdx
	jmp .l1
.l0:
	or r10, -2147483648
	mov [rdi+764], r10d
	and r10, 511
	jz .l2
	lea rdi, [rdx+r10*1+768]
	mov rcx, 512
	sub rcx, r10
	call tjald_memzero_l6
	mov rdi, rdx
	lea rsi, [rdx+768]
	mov r12, 512
	call tjald_2_innerabsorb_l6
.l2:
	mov rcx, 6
	mov r8, rdx
	lea r9, [rdx+16]
	mov rbp, $tjald_seed
.l1:
	movdqu xmm0, [rbp]
	movdqu xmm1, [rbp+16]
	movdqu xmm2, [rbp+32]
	movdqu xmm3, [rbp+48]
	movdqu xmm4, [rbp+64]
	movdqu xmm5, [rbp+80]
	movdqu xmm6, [rbp+96]
	movdqu xmm7, [rbp+112]
	movdqu xmm8, [rbp+128]
	movdqu xmm9, [rbp+144]
	movdqu xmm10, [rbp+160]
	mov r10, 32
	mov r11, 96
	call tjald_kernel_128
	mov rcx, 4
	call tjald_final
	ret
tjald_2_l6:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	push r14
	push r15
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	mov rcx, r9
	cmp rdx, 508
	jbe tjald_2_short
	mov r14, rcx
	mov rbp, rsi
	mov rbx, rdx
	mov rsi, rdi
	mov r15, rsp
	and rsp, -64
	sub rsp, 1280
	mov rdi, rsp
	call tjald_2_begin_l6_inner
	mov rdi, rsp
	mov rsi, rbp
	mov rdx, rbx
	call tjald_2_absorb_l6_inner
	mov rdi, rsp
	mov rsi, r14
	call tjald_2_end_l6_inner
	mov rsp, r15
	pop r15
	pop r14
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_3_begin_l3:
	push rdi
	sub rsp, 16
	movdqa [rsp], xmm15
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_3_begin_l3_inner
	pop r13
	pop r12
	pop rsi
	movdqa xmm15, [rsp]
	add rsp, 16
	pop rdi
	ret
tjald_3_begin_l3_inner:
	test rsi, rsi
	jnz .l0
	mov rsi, $tjald_seed
.l0:
	mov rcx, 704
	mov rdx, rdi
	call tjald_memcpy_l3
	lea rdi, [rdx+704]
	mov rcx, 320
	call tjald_memzero_l3
	ret
tjald_3_absorb_l3:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	call tjald_3_absorb_l3_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	ret
tjald_3_absorb_l3_inner:
	mov r8d, [rdi+1020]
	lea rcx, [r8+rdx*1]
	mov rax, rdx
	add rax, -4096
	sbb rax, rax
	or rax, r8
	and rax, -2147483648
	or rcx, rax
	mov [rdi+1020], ecx
	and r8, 2047
	jz .l0
	mov rcx, rdx
	add rdx, r8
	sub rdx, 2048
	jns .l1
	lea rdi, [rdi+r8*1+1024]
	call tjald_memcpy_l3
	jmp .l2
.l1:
	sub rcx, rdx
	mov r9, rdi
	lea rax, [rsi+rcx]
	lea rdi, [rdi+r8*1+1024]
	call tjald_memcpy_l3
	mov rdi, r9
	lea rsi, [rdi+1024]
	mov r12, 2048
	call tjald_3_innerabsorb_l3
	mov rsi, rax
.l0:
	mov r12, rdx
	call tjald_3_innerabsorb_l3
	and rdx, 2047
	mov rcx, rdx
	add rdi, 1024
	call tjald_memcpy_l3
.l2:
	ret
tjald_3_innerabsorb_l3:
	shr r12, 11
	jz .l0
	mov r10, 128
	mov r11, 384
	movdqu xmm14, [tjald_small_seed]
.l1:
	mov rbp, 48
.l2:
	movdqu xmm0, [rdi+rbp*1]
	movdqu xmm1, [rdi+rbp*1+64]
	movdqu xmm2, [rdi+rbp*1+128]
	movdqu xmm3, [rdi+rbp*1+192]
	movdqu xmm4, [rdi+rbp*1+256]
	movdqu xmm5, [rdi+rbp*1+320]
	movdqu xmm6, [rdi+rbp*1+384]
	movdqu xmm7, [rdi+rbp*1+448]
	movdqu xmm8, [rdi+rbp*1+512]
	movdqu xmm9, [rdi+rbp*1+576]
	movdqu xmm10, [rdi+rbp*1+640]
	lea r8, [rsi+rbp*1]
	lea r9, [rsi+rbp*1+64]
	mov rcx, 4
	call tjald_kernel_128
	vpaddb xmm6, xmm6, xmm14
	lea r8, [rsi+rbp*1+64]
	lea r9, [rsi+rbp*1]
	mov rcx, 2
	call tjald_kernel_128
	vpaddb xmm2, xmm2, xmm14
	mov rcx, 2
	call tjald_kernel_128
	vpsubb xmm2, xmm2, xmm14
	movdqu [rdi+rbp*1], xmm0
	movdqu [rdi+rbp*1+64], xmm1
	movdqu [rdi+rbp*1+128], xmm2
	movdqu [rdi+rbp*1+192], xmm3
	movdqu [rdi+rbp*1+256], xmm4
	movdqu [rdi+rbp*1+320], xmm5
	movdqu [rdi+rbp*1+384], xmm6
	movdqu [rdi+rbp*1+448], xmm7
	movdqu [rdi+rbp*1+512], xmm8
	movdqu [rdi+rbp*1+576], xmm9
	movdqu [rdi+rbp*1+640], xmm10
	sub rbp, 16
	jns .l2
	add rsi, 2048
	dec r12
	jnz .l1
.l0:
	ret
tjald_3_end_l3:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_3_end_l3_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	ret
tjald_3_end_l3_inner:
	mov rax, rsi
	mov rdx, rdi
	mov r10d, [rdi+1020]
	cmp r10, 2044
	ja .l0
	lea rdi, [rdx+r10*1+1024]
	lea rbx, [r10+515]
	and rbx, -512
	mov rcx, rbx
	sub rcx, r10
	call tjald_memzero_l3
	mov [rdx+rbx*1+1020], r10d
	mov r12, rbx
	shr r12, 9
	mov rbp, rdx
	add rdx, 1024
	jmp .l1
.l0:
	or r10, -2147483648
	mov [rdi+1020], r10d
	and r10, 2047
	jz .l3
	lea rdi, [rdx+r10*1+1024]
	mov rcx, 2048
	sub rcx, r10
	call tjald_memzero_l3
	mov rdi, rdx
	lea rsi, [rdx+1024]
	mov r12, 2048
	call tjald_3_innerabsorb_l3
.l3:
	mov r12, 2
	mov rbp, $tjald_seed
.l1:
	movdqu xmm0, [rbp]
	movdqu xmm1, [rbp+16]
	movdqu xmm2, [rbp+32]
	movdqu xmm3, [rbp+48]
	movdqu xmm4, [rbp+64]
	movdqu xmm5, [rbp+80]
	movdqu xmm6, [rbp+96]
	movdqu xmm7, [rbp+112]
	movdqu xmm8, [rbp+128]
	movdqu xmm9, [rbp+144]
	movdqu xmm10, [rbp+160]
	mov r10, 32
	mov r11, 96
	movdqu xmm14, [tjald_small_seed]
.l2:
	mov r8, rdx
	lea r9, [rdx+16]
	mov rcx, 4
	call tjald_kernel_128
	vpaddb xmm6, xmm6, xmm14
	lea r8, [rdx+16]
	mov r9, rdx
	mov rcx, 2
	call tjald_kernel_128
	vpaddb xmm2, xmm2, xmm14
	mov rcx, 2
	call tjald_kernel_128
	vpsubb xmm2, xmm2, xmm14
	add rdx, 512
	dec r12
	jnz .l2
	mov rcx, 6
	call tjald_final
	ret
tjald_3_l3:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	push r14
	push r15
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	mov rcx, r9
	mov r14, rcx
	mov rbp, rsi
	mov rbx, rdx
	mov rsi, rdi
	mov r15, rsp
	and rsp, -64
	sub rsp, 3072
	mov rdi, rsp
	call tjald_3_begin_l3_inner
	mov rdi, rsp
	mov rsi, rbp
	mov rdx, rbx
	call tjald_3_absorb_l3_inner
	mov rdi, rsp
	mov rsi, r14
	call tjald_3_end_l3_inner
	mov rsp, r15
	pop r15
	pop r14
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	ret
tjald_3_begin_l4:
	push rdi
	sub rsp, 16
	movdqa [rsp], xmm15
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_3_begin_l4_inner
	pop r13
	pop r12
	pop rsi
	movdqa xmm15, [rsp]
	add rsp, 16
	pop rdi
	vzeroupper
	ret
tjald_3_begin_l4_inner:
	test rsi, rsi
	jnz .l0
	mov rsi, $tjald_seed
.l0:
	mov rcx, 704
	mov rdx, rdi
	call tjald_memcpy_l4
	lea rdi, [rdx+704]
	mov rcx, 320
	call tjald_memzero_l4
	ret
tjald_3_absorb_l4:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	call tjald_3_absorb_l4_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_3_absorb_l4_inner:
	mov r8d, [rdi+1020]
	lea rcx, [r8+rdx*1]
	mov rax, rdx
	add rax, -4096
	sbb rax, rax
	or rax, r8
	and rax, -2147483648
	or rcx, rax
	mov [rdi+1020], ecx
	and r8, 2047
	jz .l0
	mov rcx, rdx
	add rdx, r8
	sub rdx, 2048
	jns .l1
	lea rdi, [rdi+r8*1+1024]
	call tjald_memcpy_l4
	jmp .l2
.l1:
	sub rcx, rdx
	mov r9, rdi
	lea rax, [rsi+rcx]
	lea rdi, [rdi+r8*1+1024]
	call tjald_memcpy_l4
	mov rdi, r9
	lea rsi, [rdi+1024]
	mov r12, 2048
	call tjald_3_innerabsorb_l4
	mov rsi, rax
.l0:
	mov r12, rdx
	call tjald_3_innerabsorb_l4
	and rdx, 2047
	mov rcx, rdx
	add rdi, 1024
	call tjald_memcpy_l4
.l2:
	ret
tjald_3_innerabsorb_l4:
	shr r12, 11
	jz .l0
	mov r10, 128
	mov r11, 384
	vmovdqu ymm14, [tjald_small_seed]
.l1:
	mov rbp, 32
.l2:
	vmovdqu ymm0, [rdi+rbp*1]
	vmovdqu ymm1, [rdi+rbp*1+64]
	vmovdqu ymm2, [rdi+rbp*1+128]
	vmovdqu ymm3, [rdi+rbp*1+192]
	vmovdqu ymm4, [rdi+rbp*1+256]
	vmovdqu ymm5, [rdi+rbp*1+320]
	vmovdqu ymm6, [rdi+rbp*1+384]
	vmovdqu ymm7, [rdi+rbp*1+448]
	vmovdqu ymm8, [rdi+rbp*1+512]
	vmovdqu ymm9, [rdi+rbp*1+576]
	vmovdqu ymm10, [rdi+rbp*1+640]
	lea r8, [rsi+rbp*1]
	lea r9, [rsi+rbp*1+64]
	mov rcx, 4
	call tjald_kernel_256
	vpaddb ymm6, ymm6, ymm14
	lea r8, [rsi+rbp*1+64]
	lea r9, [rsi+rbp*1]
	mov rcx, 2
	call tjald_kernel_256
	vpaddb ymm2, ymm2, ymm14
	mov rcx, 2
	call tjald_kernel_256
	vpsubb ymm2, ymm2, ymm14
	vmovdqu [rdi+rbp*1], ymm0
	vmovdqu [rdi+rbp*1+64], ymm1
	vmovdqu [rdi+rbp*1+128], ymm2
	vmovdqu [rdi+rbp*1+192], ymm3
	vmovdqu [rdi+rbp*1+256], ymm4
	vmovdqu [rdi+rbp*1+320], ymm5
	vmovdqu [rdi+rbp*1+384], ymm6
	vmovdqu [rdi+rbp*1+448], ymm7
	vmovdqu [rdi+rbp*1+512], ymm8
	vmovdqu [rdi+rbp*1+576], ymm9
	vmovdqu [rdi+rbp*1+640], ymm10
	sub rbp, 32
	jns .l2
	add rsi, 2048
	dec r12
	jnz .l1
.l0:
	ret
tjald_3_end_l4:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_3_end_l4_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_3_end_l4_inner:
	mov rax, rsi
	mov rdx, rdi
	mov r10d, [rdi+1020]
	cmp r10, 2044
	ja .l0
	lea rdi, [rdx+r10*1+1024]
	lea rbx, [r10+515]
	and rbx, -512
	mov rcx, rbx
	sub rcx, r10
	call tjald_memzero_l4
	mov [rdx+rbx*1+1020], r10d
	mov r12, rbx
	shr r12, 9
	mov rbp, rdx
	add rdx, 1024
	jmp .l1
.l0:
	or r10, -2147483648
	mov [rdi+1020], r10d
	and r10, 2047
	jz .l3
	lea rdi, [rdx+r10*1+1024]
	mov rcx, 2048
	sub rcx, r10
	call tjald_memzero_l4
	mov rdi, rdx
	lea rsi, [rdx+1024]
	mov r12, 2048
	call tjald_3_innerabsorb_l4
.l3:
	mov r12, 2
	mov rbp, $tjald_seed
.l1:
	movdqu xmm0, [rbp]
	movdqu xmm1, [rbp+16]
	movdqu xmm2, [rbp+32]
	movdqu xmm3, [rbp+48]
	movdqu xmm4, [rbp+64]
	movdqu xmm5, [rbp+80]
	movdqu xmm6, [rbp+96]
	movdqu xmm7, [rbp+112]
	movdqu xmm8, [rbp+128]
	movdqu xmm9, [rbp+144]
	movdqu xmm10, [rbp+160]
	mov r10, 32
	mov r11, 96
	movdqu xmm14, [tjald_small_seed]
.l2:
	mov r8, rdx
	lea r9, [rdx+16]
	mov rcx, 4
	call tjald_kernel_128
	vpaddb xmm6, xmm6, xmm14
	lea r8, [rdx+16]
	mov r9, rdx
	mov rcx, 2
	call tjald_kernel_128
	vpaddb xmm2, xmm2, xmm14
	mov rcx, 2
	call tjald_kernel_128
	vpsubb xmm2, xmm2, xmm14
	add rdx, 512
	dec r12
	jnz .l2
	mov rcx, 6
	call tjald_final
	ret
tjald_3_l4:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	push r14
	push r15
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	mov rcx, r9
	mov r14, rcx
	mov rbp, rsi
	mov rbx, rdx
	mov rsi, rdi
	mov r15, rsp
	and rsp, -64
	sub rsp, 3072
	mov rdi, rsp
	call tjald_3_begin_l4_inner
	mov rdi, rsp
	mov rsi, rbp
	mov rdx, rbx
	call tjald_3_absorb_l4_inner
	mov rdi, rsp
	mov rsi, r14
	call tjald_3_end_l4_inner
	mov rsp, r15
	pop r15
	pop r14
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_3_begin_l6:
	push rdi
	sub rsp, 16
	movdqa [rsp], xmm15
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_3_begin_l6_inner
	pop r13
	pop r12
	pop rsi
	movdqa xmm15, [rsp]
	add rsp, 16
	pop rdi
	vzeroupper
	ret
tjald_3_begin_l6_inner:
	test rsi, rsi
	jnz .l0
	mov rsi, $tjald_seed
.l0:
	mov rcx, 704
	mov rdx, rdi
	call tjald_memcpy_l6
	lea rdi, [rdx+704]
	mov rcx, 320
	call tjald_memzero_l6
	ret
tjald_3_absorb_l6:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	call tjald_3_absorb_l6_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_3_absorb_l6_inner:
	mov r8d, [rdi+1020]
	lea rcx, [r8+rdx*1]
	mov rax, rdx
	add rax, -4096
	sbb rax, rax
	or rax, r8
	and rax, -2147483648
	or rcx, rax
	mov [rdi+1020], ecx
	and r8, 2047
	jz .l0
	mov rcx, rdx
	add rdx, r8
	sub rdx, 2048
	jns .l1
	lea rdi, [rdi+r8*1+1024]
	call tjald_memcpy_l6
	jmp .l2
.l1:
	sub rcx, rdx
	mov r9, rdi
	lea rax, [rsi+rcx]
	lea rdi, [rdi+r8*1+1024]
	call tjald_memcpy_l6
	mov rdi, r9
	lea rsi, [rdi+1024]
	mov r12, 2048
	call tjald_3_innerabsorb_l6
	mov rsi, rax
.l0:
	mov r12, rdx
	call tjald_3_innerabsorb_l6
	and rdx, 2047
	mov rcx, rdx
	add rdi, 1024
	call tjald_memcpy_l6
.l2:
	ret
tjald_3_innerabsorb_l6:
	shr r12, 11
	jz .l0
	mov r10, 128
	mov r11, 384
	vmovdqu32 zmm14, [tjald_small_seed]
	vmovdqu32 zmm0, [rdi]
	vmovdqu32 zmm1, [rdi+64]
	vmovdqu32 zmm2, [rdi+128]
	vmovdqu32 zmm3, [rdi+192]
	vmovdqu32 zmm4, [rdi+256]
	vmovdqu32 zmm5, [rdi+320]
	vmovdqu32 zmm6, [rdi+384]
	vmovdqu32 zmm7, [rdi+448]
	vmovdqu32 zmm8, [rdi+512]
	vmovdqu32 zmm9, [rdi+576]
	vmovdqu32 zmm10, [rdi+640]
.l1:
	mov r8, rsi
	lea r9, [rsi+64]
	mov rcx, 4
	call tjald_kernel_512
	vpaddb zmm6, zmm6, zmm14
	lea r8, [rsi+64]
	mov r9, rsi
	mov rcx, 2
	call tjald_kernel_512
	vpaddb zmm2, zmm2, zmm14
	mov rcx, 2
	call tjald_kernel_512
	vpsubb zmm2, zmm2, zmm14
	add rsi, 2048
	dec r12
	jnz .l1
	vmovdqu32 [rdi], zmm0
	vmovdqu32 [rdi+64], zmm1
	vmovdqu32 [rdi+128], zmm2
	vmovdqu32 [rdi+192], zmm3
	vmovdqu32 [rdi+256], zmm4
	vmovdqu32 [rdi+320], zmm5
	vmovdqu32 [rdi+384], zmm6
	vmovdqu32 [rdi+448], zmm7
	vmovdqu32 [rdi+512], zmm8
	vmovdqu32 [rdi+576], zmm9
	vmovdqu32 [rdi+640], zmm10
.l0:
	ret
tjald_3_end_l6:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_3_end_l6_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_3_end_l6_inner:
	mov rax, rsi
	mov rdx, rdi
	mov r10d, [rdi+1020]
	cmp r10, 2044
	ja .l0
	lea rdi, [rdx+r10*1+1024]
	lea rbx, [r10+515]
	and rbx, -512
	mov rcx, rbx
	sub rcx, r10
	call tjald_memzero_l6
	mov [rdx+rbx*1+1020], r10d
	mov r12, rbx
	shr r12, 9
	mov rbp, rdx
	add rdx, 1024
	jmp .l1
.l0:
	or r10, -2147483648
	mov [rdi+1020], r10d
	and r10, 2047
	jz .l3
	lea rdi, [rdx+r10*1+1024]
	mov rcx, 2048
	sub rcx, r10
	call tjald_memzero_l6
	mov rdi, rdx
	lea rsi, [rdx+1024]
	mov r12, 2048
	call tjald_3_innerabsorb_l6
.l3:
	mov r12, 2
	mov rbp, $tjald_seed
.l1:
	movdqu xmm0, [rbp]
	movdqu xmm1, [rbp+16]
	movdqu xmm2, [rbp+32]
	movdqu xmm3, [rbp+48]
	movdqu xmm4, [rbp+64]
	movdqu xmm5, [rbp+80]
	movdqu xmm6, [rbp+96]
	movdqu xmm7, [rbp+112]
	movdqu xmm8, [rbp+128]
	movdqu xmm9, [rbp+144]
	movdqu xmm10, [rbp+160]
	mov r10, 32
	mov r11, 96
	movdqu xmm14, [tjald_small_seed]
.l2:
	mov r8, rdx
	lea r9, [rdx+16]
	mov rcx, 4
	call tjald_kernel_128
	vpaddb xmm6, xmm6, xmm14
	lea r8, [rdx+16]
	mov r9, rdx
	mov rcx, 2
	call tjald_kernel_128
	vpaddb xmm2, xmm2, xmm14
	mov rcx, 2
	call tjald_kernel_128
	vpsubb xmm2, xmm2, xmm14
	add rdx, 512
	dec r12
	jnz .l2
	mov rcx, 6
	call tjald_final
	ret
tjald_3_l6:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	push r14
	push r15
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	mov rcx, r9
	mov r14, rcx
	mov rbp, rsi
	mov rbx, rdx
	mov rsi, rdi
	mov r15, rsp
	and rsp, -64
	sub rsp, 3072
	mov rdi, rsp
	call tjald_3_begin_l6_inner
	mov rdi, rsp
	mov rsi, rbp
	mov rdx, rbx
	call tjald_3_absorb_l6_inner
	mov rdi, rsp
	mov rsi, r14
	call tjald_3_end_l6_inner
	mov rsp, r15
	pop r15
	pop r14
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_4_begin_l3:
	push rdi
	sub rsp, 16
	movdqa [rsp], xmm15
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_4_begin_l3_inner
	pop r13
	pop r12
	pop rsi
	movdqa xmm15, [rsp]
	add rsp, 16
	pop rdi
	ret
tjald_4_begin_l3_inner:
	mov rsi, $tjald_seed
	mov rcx, 704
	mov rdx, rdi
	call tjald_memcpy_l3
	lea rdi, [rdx+704]
	mov rcx, 320
	call tjald_memzero_l3
	ret
tjald_4_absorb_l3:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	call tjald_4_absorb_l3_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	ret
tjald_4_absorb_l3_inner:
	mov r8d, [rdi+1020]
	lea rcx, [r8+rdx*1]
	mov rax, rdx
	add rax, -4096
	sbb rax, rax
	or rax, r8
	and rax, -2147483648
	or rcx, rax
	mov [rdi+1020], ecx
	and r8, 4095
	jz .l0
	mov rcx, rdx
	add rdx, r8
	sub rdx, 4096
	jns .l1
	lea rdi, [rdi+r8*1+1024]
	call tjald_memcpy_l3
	jmp .l2
.l1:
	sub rcx, rdx
	mov r9, rdi
	lea rax, [rsi+rcx]
	lea rdi, [rdi+r8*1+1024]
	call tjald_memcpy_l3
	mov rdi, r9
	lea rsi, [rdi+1024]
	mov r12, 4096
	call tjald_4_innerabsorb_l3
	mov rsi, rax
.l0:
	mov r12, rdx
	call tjald_4_innerabsorb_l3
	and rdx, 4095
	mov rcx, rdx
	add rdi, 1024
	call tjald_memcpy_l3
.l2:
	ret
tjald_4_innerabsorb_l3:
	shr r12, 12
	jz .l0
	mov r10, 128
	mov r11, 384
	movdqu xmm14, [tjald_small_seed]
.l1:
	mov rbp, 48
.l2:
	movdqu xmm0, [rdi+rbp*1]
	movdqu xmm1, [rdi+rbp*1+64]
	movdqu xmm2, [rdi+rbp*1+128]
	movdqu xmm3, [rdi+rbp*1+192]
	movdqu xmm4, [rdi+rbp*1+256]
	movdqu xmm5, [rdi+rbp*1+320]
	movdqu xmm6, [rdi+rbp*1+384]
	movdqu xmm7, [rdi+rbp*1+448]
	movdqu xmm8, [rdi+rbp*1+512]
	movdqu xmm9, [rdi+rbp*1+576]
	movdqu xmm10, [rdi+rbp*1+640]
	lea r8, [rsi+rbp*1]
	lea r9, [rsi+rbp*1+64]
	mov rcx, 8
	call tjald_kernel_128
	vpaddb xmm6, xmm6, xmm14
	mov r10, 256
	mov r11, 768
	lea r8, [rsi+rbp*1]
	lea r9, [rsi+rbp*1+128]
	mov rcx, 4
	call tjald_kernel_128
	vpaddb xmm2, xmm2, xmm14
	lea r8, [rsi+rbp*1+64]
	lea r9, [rsi+rbp*1+192]
	mov rcx, 4
	call tjald_kernel_128
	vpsubb xmm6, xmm6, xmm14
	mov r10, 128
	mov r11, 384
	lea r8, [rsi+rbp*1+64]
	lea r9, [rsi+rbp*1]
	mov rcx, 3
	call tjald_kernel_128
	vpsubb xmm2, xmm2, xmm14
	mov rcx, 5
	call tjald_kernel_128
	vpsubb xmm2, xmm2, xmm14
	pxor xmm0, [rdi+rbp*1]
	movdqu [rdi+rbp*1], xmm0
	pxor xmm1, [rdi+rbp*1+64]
	movdqu [rdi+rbp*1+64], xmm1
	pxor xmm2, [rdi+rbp*1+128]
	movdqu [rdi+rbp*1+128], xmm2
	pxor xmm3, [rdi+rbp*1+192]
	movdqu [rdi+rbp*1+192], xmm3
	pxor xmm4, [rdi+rbp*1+256]
	movdqu [rdi+rbp*1+256], xmm4
	pxor xmm5, [rdi+rbp*1+320]
	movdqu [rdi+rbp*1+320], xmm5
	pxor xmm6, [rdi+rbp*1+384]
	movdqu [rdi+rbp*1+384], xmm6
	pxor xmm7, [rdi+rbp*1+448]
	movdqu [rdi+rbp*1+448], xmm7
	pxor xmm8, [rdi+rbp*1+512]
	movdqu [rdi+rbp*1+512], xmm8
	pxor xmm9, [rdi+rbp*1+576]
	movdqu [rdi+rbp*1+576], xmm9
	pxor xmm10, [rdi+rbp*1+640]
	movdqu [rdi+rbp*1+640], xmm10
	sub rbp, 16
	jns .l2
	add rsi, 4096
	dec r12
	jnz .l1
.l0:
	ret
tjald_4_end_l3:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_4_end_l3_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	ret
tjald_4_end_l3_inner:
	mov rax, rsi
	mov rdx, rdi
	mov r10d, [rdi+1020]
	cmp r10, 4092
	ja .l0
	lea rdi, [rdx+r10*1+1024]
	lea rbx, [r10+1027]
	and rbx, -1024
	mov rcx, rbx
	sub rcx, r10
	call tjald_memzero_l3
	mov [rdx+rbx*1+1020], r10d
	mov r12, rbx
	shr r12, 10
	mov rbp, rdx
	add rdx, 1024
	jmp .l1
.l0:
	or r10, -2147483648
	mov [rdi+1020], r10d
	and r10, 4095
	jz .l3
	lea rdi, [rdx+r10*1+1024]
	mov rcx, 4096
	sub rcx, r10
	call tjald_memzero_l3
	mov rdi, rdx
	lea rsi, [rdx+1024]
	mov r12, 4096
	call tjald_4_innerabsorb_l3
.l3:
	lea rdi, [rdx+1024]
	mov rbp, rdi
	mov rsi, $tjald_seed
	mov rcx, 704
	call tjald_memcpy_l3
	mov r12, 1
.l1:
	movdqu xmm0, [rbp]
	movdqu xmm1, [rbp+16]
	movdqu xmm2, [rbp+32]
	movdqu xmm3, [rbp+48]
	movdqu xmm4, [rbp+64]
	movdqu xmm5, [rbp+80]
	movdqu xmm6, [rbp+96]
	movdqu xmm7, [rbp+112]
	movdqu xmm8, [rbp+128]
	movdqu xmm9, [rbp+144]
	movdqu xmm10, [rbp+160]
	mov r10, 32
	mov r11, 96
	movdqu xmm14, [tjald_small_seed]
.l2:
	mov r8, rdx
	lea r9, [rdx+16]
	mov rcx, 8
	call tjald_kernel_128
	vpaddb xmm6, xmm6, xmm14
	mov r10, 64
	mov r11, 192
	mov r8, rdx
	lea r9, [rdx+32]
	mov rcx, 4
	call tjald_kernel_128
	vpaddb xmm2, xmm2, xmm14
	lea r8, [rdx+16]
	lea r9, [rdx+48]
	mov rcx, 4
	call tjald_kernel_128
	vpsubb xmm6, xmm6, xmm14
	mov r10, 32
	mov r11, 96
	lea r8, [rdx+16]
	mov r9, rdx
	mov rcx, 3
	call tjald_kernel_128
	vpsubb xmm2, xmm2, xmm14
	mov rcx, 5
	call tjald_kernel_128
	vpsubb xmm2, xmm2, xmm14
	pxor xmm0, [rbp]
	movdqu [rbp], xmm0
	pxor xmm1, [rbp+16]
	movdqu [rbp+16], xmm1
	pxor xmm2, [rbp+32]
	movdqu [rbp+32], xmm2
	pxor xmm3, [rbp+48]
	movdqu [rbp+48], xmm3
	pxor xmm4, [rbp+64]
	movdqu [rbp+64], xmm4
	pxor xmm5, [rbp+80]
	movdqu [rbp+80], xmm5
	pxor xmm6, [rbp+96]
	movdqu [rbp+96], xmm6
	pxor xmm7, [rbp+112]
	movdqu [rbp+112], xmm7
	pxor xmm8, [rbp+128]
	movdqu [rbp+128], xmm8
	pxor xmm9, [rbp+144]
	movdqu [rbp+144], xmm9
	pxor xmm10, [rbp+160]
	movdqu [rbp+160], xmm10
	add rdx, 1024
	dec r12
	jnz .l2
	mov rcx, 8
	call tjald_final
	ret
tjald_4_l3:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	push r14
	push r15
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	mov rcx, r9
	mov r14, rdx
	mov rbp, rdi
	mov rbx, rsi
	mov r15, rsp
	and rsp, -64
	sub rsp, 5120
	mov rdi, rsp
	call tjald_4_begin_l3_inner
	mov rdi, rsp
	mov rsi, rbp
	mov rdx, rbx
	call tjald_4_absorb_l3_inner
	mov rdi, rsp
	mov rsi, r14
	call tjald_4_end_l3_inner
	mov rsp, r15
	pop r15
	pop r14
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	ret
tjald_4_begin_l4:
	push rdi
	sub rsp, 16
	movdqa [rsp], xmm15
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_4_begin_l4_inner
	pop r13
	pop r12
	pop rsi
	movdqa xmm15, [rsp]
	add rsp, 16
	pop rdi
	vzeroupper
	ret
tjald_4_begin_l4_inner:
	mov rsi, $tjald_seed
	mov rcx, 704
	mov rdx, rdi
	call tjald_memcpy_l4
	lea rdi, [rdx+704]
	mov rcx, 320
	call tjald_memzero_l4
	ret
tjald_4_absorb_l4:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	call tjald_4_absorb_l4_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_4_absorb_l4_inner:
	mov r8d, [rdi+1020]
	lea rcx, [r8+rdx*1]
	mov rax, rdx
	add rax, -4096
	sbb rax, rax
	or rax, r8
	and rax, -2147483648
	or rcx, rax
	mov [rdi+1020], ecx
	and r8, 4095
	jz .l0
	mov rcx, rdx
	add rdx, r8
	sub rdx, 4096
	jns .l1
	lea rdi, [rdi+r8*1+1024]
	call tjald_memcpy_l4
	jmp .l2
.l1:
	sub rcx, rdx
	mov r9, rdi
	lea rax, [rsi+rcx]
	lea rdi, [rdi+r8*1+1024]
	call tjald_memcpy_l4
	mov rdi, r9
	lea rsi, [rdi+1024]
	mov r12, 4096
	call tjald_4_innerabsorb_l4
	mov rsi, rax
.l0:
	mov r12, rdx
	call tjald_4_innerabsorb_l4
	and rdx, 4095
	mov rcx, rdx
	add rdi, 1024
	call tjald_memcpy_l4
.l2:
	ret
tjald_4_innerabsorb_l4:
	shr r12, 12
	jz .l0
	mov r10, 128
	mov r11, 384
	vmovdqu ymm14, [tjald_small_seed]
.l1:
	mov rbp, 32
.l2:
	vmovdqu ymm0, [rdi+rbp*1]
	vmovdqu ymm1, [rdi+rbp*1+64]
	vmovdqu ymm2, [rdi+rbp*1+128]
	vmovdqu ymm3, [rdi+rbp*1+192]
	vmovdqu ymm4, [rdi+rbp*1+256]
	vmovdqu ymm5, [rdi+rbp*1+320]
	vmovdqu ymm6, [rdi+rbp*1+384]
	vmovdqu ymm7, [rdi+rbp*1+448]
	vmovdqu ymm8, [rdi+rbp*1+512]
	vmovdqu ymm9, [rdi+rbp*1+576]
	vmovdqu ymm10, [rdi+rbp*1+640]
	lea r8, [rsi+rbp*1]
	lea r9, [rsi+rbp*1+64]
	mov rcx, 8
	call tjald_kernel_256
	vpaddb ymm6, ymm6, ymm14
	mov r10, 256
	mov r11, 768
	lea r8, [rsi+rbp*1]
	lea r9, [rsi+rbp*1+128]
	mov rcx, 4
	call tjald_kernel_256
	vpaddb ymm2, ymm2, ymm14
	lea r8, [rsi+rbp*1+64]
	lea r9, [rsi+rbp*1+192]
	mov rcx, 4
	call tjald_kernel_256
	vpsubb ymm6, ymm6, ymm14
	mov r10, 128
	mov r11, 384
	lea r8, [rsi+rbp*1+64]
	lea r9, [rsi+rbp*1]
	mov rcx, 3
	call tjald_kernel_256
	vpsubb ymm2, ymm2, ymm14
	mov rcx, 5
	call tjald_kernel_256
	vpsubb ymm2, ymm2, ymm14
	vpxor ymm0, ymm0, [rdi+rbp*1]
	vmovdqu [rdi+rbp*1], ymm0
	vpxor ymm1, ymm1, [rdi+rbp*1+64]
	vmovdqu [rdi+rbp*1+64], ymm1
	vpxor ymm2, ymm2, [rdi+rbp*1+128]
	vmovdqu [rdi+rbp*1+128], ymm2
	vpxor ymm3, ymm3, [rdi+rbp*1+192]
	vmovdqu [rdi+rbp*1+192], ymm3
	vpxor ymm4, ymm4, [rdi+rbp*1+256]
	vmovdqu [rdi+rbp*1+256], ymm4
	vpxor ymm5, ymm5, [rdi+rbp*1+320]
	vmovdqu [rdi+rbp*1+320], ymm5
	vpxor ymm6, ymm6, [rdi+rbp*1+384]
	vmovdqu [rdi+rbp*1+384], ymm6
	vpxor ymm7, ymm7, [rdi+rbp*1+448]
	vmovdqu [rdi+rbp*1+448], ymm7
	vpxor ymm8, ymm8, [rdi+rbp*1+512]
	vmovdqu [rdi+rbp*1+512], ymm8
	vpxor ymm9, ymm9, [rdi+rbp*1+576]
	vmovdqu [rdi+rbp*1+576], ymm9
	vpxor ymm10, ymm10, [rdi+rbp*1+640]
	vmovdqu [rdi+rbp*1+640], ymm10
	sub rbp, 32
	jns .l2
	add rsi, 4096
	dec r12
	jnz .l1
.l0:
	ret
tjald_4_end_l4:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_4_end_l4_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_4_end_l4_inner:
	mov rax, rsi
	mov rdx, rdi
	mov r10d, [rdi+1020]
	cmp r10, 4092
	ja .l0
	lea rdi, [rdx+r10*1+1024]
	lea rbx, [r10+1027]
	and rbx, -1024
	mov rcx, rbx
	sub rcx, r10
	call tjald_memzero_l4
	mov [rdx+rbx*1+1020], r10d
	mov r12, rbx
	shr r12, 10
	mov rbp, rdx
	add rdx, 1024
	jmp .l1
.l0:
	or r10, -2147483648
	mov [rdi+1020], r10d
	and r10, 4095
	jz .l3
	lea rdi, [rdx+r10*1+1024]
	mov rcx, 4096
	sub rcx, r10
	call tjald_memzero_l4
	mov rdi, rdx
	lea rsi, [rdx+1024]
	mov r12, 4096
	call tjald_4_innerabsorb_l4
.l3:
	lea rdi, [rdx+1024]
	mov rbp, rdi
	mov rsi, $tjald_seed
	mov rcx, 704
	call tjald_memcpy_l4
	mov r12, 1
.l1:
	movdqu xmm0, [rbp]
	movdqu xmm1, [rbp+16]
	movdqu xmm2, [rbp+32]
	movdqu xmm3, [rbp+48]
	movdqu xmm4, [rbp+64]
	movdqu xmm5, [rbp+80]
	movdqu xmm6, [rbp+96]
	movdqu xmm7, [rbp+112]
	movdqu xmm8, [rbp+128]
	movdqu xmm9, [rbp+144]
	movdqu xmm10, [rbp+160]
	mov r10, 32
	mov r11, 96
	movdqu xmm14, [tjald_small_seed]
.l2:
	mov r8, rdx
	lea r9, [rdx+16]
	mov rcx, 8
	call tjald_kernel_128
	vpaddb xmm6, xmm6, xmm14
	mov r10, 64
	mov r11, 192
	mov r8, rdx
	lea r9, [rdx+32]
	mov rcx, 4
	call tjald_kernel_128
	vpaddb xmm2, xmm2, xmm14
	lea r8, [rdx+16]
	lea r9, [rdx+48]
	mov rcx, 4
	call tjald_kernel_128
	vpsubb xmm6, xmm6, xmm14
	mov r10, 32
	mov r11, 96
	lea r8, [rdx+16]
	mov r9, rdx
	mov rcx, 3
	call tjald_kernel_128
	vpsubb xmm2, xmm2, xmm14
	mov rcx, 5
	call tjald_kernel_128
	vpsubb xmm2, xmm2, xmm14
	pxor xmm0, [rbp]
	movdqu [rbp], xmm0
	pxor xmm1, [rbp+16]
	movdqu [rbp+16], xmm1
	pxor xmm2, [rbp+32]
	movdqu [rbp+32], xmm2
	pxor xmm3, [rbp+48]
	movdqu [rbp+48], xmm3
	pxor xmm4, [rbp+64]
	movdqu [rbp+64], xmm4
	pxor xmm5, [rbp+80]
	movdqu [rbp+80], xmm5
	pxor xmm6, [rbp+96]
	movdqu [rbp+96], xmm6
	pxor xmm7, [rbp+112]
	movdqu [rbp+112], xmm7
	pxor xmm8, [rbp+128]
	movdqu [rbp+128], xmm8
	pxor xmm9, [rbp+144]
	movdqu [rbp+144], xmm9
	pxor xmm10, [rbp+160]
	movdqu [rbp+160], xmm10
	add rdx, 1024
	dec r12
	jnz .l2
	mov rcx, 8
	call tjald_final
	ret
tjald_4_l4:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	push r14
	push r15
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	mov rcx, r9
	mov r14, rdx
	mov rbp, rdi
	mov rbx, rsi
	mov r15, rsp
	and rsp, -64
	sub rsp, 5120
	mov rdi, rsp
	call tjald_4_begin_l4_inner
	mov rdi, rsp
	mov rsi, rbp
	mov rdx, rbx
	call tjald_4_absorb_l4_inner
	mov rdi, rsp
	mov rsi, r14
	call tjald_4_end_l4_inner
	mov rsp, r15
	pop r15
	pop r14
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_4_begin_l6:
	push rdi
	sub rsp, 16
	movdqa [rsp], xmm15
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_4_begin_l6_inner
	pop r13
	pop r12
	pop rsi
	movdqa xmm15, [rsp]
	add rsp, 16
	pop rdi
	vzeroupper
	ret
tjald_4_begin_l6_inner:
	mov rsi, $tjald_seed
	mov rcx, 704
	mov rdx, rdi
	call tjald_memcpy_l6
	lea rdi, [rdx+704]
	mov rcx, 320
	call tjald_memzero_l6
	ret
tjald_4_absorb_l6:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	call tjald_4_absorb_l6_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_4_absorb_l6_inner:
	mov r8d, [rdi+1020]
	lea rcx, [r8+rdx*1]
	mov rax, rdx
	add rax, -4096
	sbb rax, rax
	or rax, r8
	and rax, -2147483648
	or rcx, rax
	mov [rdi+1020], ecx
	and r8, 4095
	jz .l0
	mov rcx, rdx
	add rdx, r8
	sub rdx, 4096
	jns .l1
	lea rdi, [rdi+r8*1+1024]
	call tjald_memcpy_l6
	jmp .l2
.l1:
	sub rcx, rdx
	mov r9, rdi
	lea rax, [rsi+rcx]
	lea rdi, [rdi+r8*1+1024]
	call tjald_memcpy_l6
	mov rdi, r9
	lea rsi, [rdi+1024]
	mov r12, 4096
	call tjald_4_innerabsorb_l6
	mov rsi, rax
.l0:
	mov r12, rdx
	call tjald_4_innerabsorb_l6
	and rdx, 4095
	mov rcx, rdx
	add rdi, 1024
	call tjald_memcpy_l6
.l2:
	ret
tjald_4_innerabsorb_l6:
	shr r12, 12
	jz .l0
	mov r10, 128
	mov r11, 384
	vmovdqu32 zmm14, [tjald_small_seed]
	vmovdqu32 zmm0, [rdi]
	vmovdqu32 zmm1, [rdi+64]
	vmovdqu32 zmm2, [rdi+128]
	vmovdqu32 zmm3, [rdi+192]
	vmovdqu32 zmm4, [rdi+256]
	vmovdqu32 zmm5, [rdi+320]
	vmovdqu32 zmm6, [rdi+384]
	vmovdqu32 zmm7, [rdi+448]
	vmovdqu32 zmm8, [rdi+512]
	vmovdqu32 zmm9, [rdi+576]
	vmovdqu32 zmm10, [rdi+640]
.l1:
	mov r8, rsi
	lea r9, [rsi+64]
	mov rcx, 8
	call tjald_kernel_512
	vpaddb zmm6, zmm6, zmm14
	mov r10, 256
	mov r11, 768
	mov r8, rsi
	lea r9, [rsi+128]
	mov rcx, 4
	call tjald_kernel_512
	vpaddb zmm2, zmm2, zmm14
	lea r8, [rsi+64]
	lea r9, [rsi+192]
	mov rcx, 4
	call tjald_kernel_512
	vpsubb zmm6, zmm6, zmm14
	mov r10, 128
	mov r11, 384
	lea r8, [rsi+64]
	mov r9, rsi
	mov rcx, 3
	call tjald_kernel_512
	vpsubb zmm2, zmm2, zmm14
	mov rcx, 5
	call tjald_kernel_512
	vpsubb zmm2, zmm2, zmm14
	vpxord zmm0, zmm0, [rdi]
	vmovdqu32 [rdi], zmm0
	vpxord zmm1, zmm1, [rdi+64]
	vmovdqu32 [rdi+64], zmm1
	vpxord zmm2, zmm2, [rdi+128]
	vmovdqu32 [rdi+128], zmm2
	vpxord zmm3, zmm3, [rdi+192]
	vmovdqu32 [rdi+192], zmm3
	vpxord zmm4, zmm4, [rdi+256]
	vmovdqu32 [rdi+256], zmm4
	vpxord zmm5, zmm5, [rdi+320]
	vmovdqu32 [rdi+320], zmm5
	vpxord zmm6, zmm6, [rdi+384]
	vmovdqu32 [rdi+384], zmm6
	vpxord zmm7, zmm7, [rdi+448]
	vmovdqu32 [rdi+448], zmm7
	vpxord zmm8, zmm8, [rdi+512]
	vmovdqu32 [rdi+512], zmm8
	vpxord zmm9, zmm9, [rdi+576]
	vmovdqu32 [rdi+576], zmm9
	vpxord zmm10, zmm10, [rdi+640]
	vmovdqu32 [rdi+640], zmm10
	add rsi, 4096
	dec r12
	jnz .l1
.l0:
	ret
tjald_4_end_l6:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	call tjald_4_end_l6_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_4_end_l6_inner:
	mov rax, rsi
	mov rdx, rdi
	mov r10d, [rdi+1020]
	cmp r10, 4092
	ja .l0
	lea rdi, [rdx+r10*1+1024]
	lea rbx, [r10+1027]
	and rbx, -1024
	mov rcx, rbx
	sub rcx, r10
	call tjald_memzero_l6
	mov [rdx+rbx*1+1020], r10d
	mov r12, rbx
	shr r12, 10
	mov rbp, rdx
	add rdx, 1024
	jmp .l1
.l0:
	or r10, -2147483648
	mov [rdi+1020], r10d
	and r10, 4095
	jz .l3
	lea rdi, [rdx+r10*1+1024]
	mov rcx, 4096
	sub rcx, r10
	call tjald_memzero_l6
	mov rdi, rdx
	lea rsi, [rdx+1024]
	mov r12, 4096
	call tjald_4_innerabsorb_l6
.l3:
	lea rdi, [rdx+1024]
	mov rbp, rdi
	mov rsi, $tjald_seed
	mov rcx, 704
	call tjald_memcpy_l6
	mov r12, 1
.l1:
	movdqu xmm0, [rbp]
	movdqu xmm1, [rbp+16]
	movdqu xmm2, [rbp+32]
	movdqu xmm3, [rbp+48]
	movdqu xmm4, [rbp+64]
	movdqu xmm5, [rbp+80]
	movdqu xmm6, [rbp+96]
	movdqu xmm7, [rbp+112]
	movdqu xmm8, [rbp+128]
	movdqu xmm9, [rbp+144]
	movdqu xmm10, [rbp+160]
	mov r10, 32
	mov r11, 96
	movdqu xmm14, [tjald_small_seed]
.l2:
	mov r8, rdx
	lea r9, [rdx+16]
	mov rcx, 8
	call tjald_kernel_128
	vpaddb xmm6, xmm6, xmm14
	mov r10, 64
	mov r11, 192
	mov r8, rdx
	lea r9, [rdx+32]
	mov rcx, 4
	call tjald_kernel_128
	vpaddb xmm2, xmm2, xmm14
	lea r8, [rdx+16]
	lea r9, [rdx+48]
	mov rcx, 4
	call tjald_kernel_128
	vpsubb xmm6, xmm6, xmm14
	mov r10, 32
	mov r11, 96
	lea r8, [rdx+16]
	mov r9, rdx
	mov rcx, 3
	call tjald_kernel_128
	vpsubb xmm2, xmm2, xmm14
	mov rcx, 5
	call tjald_kernel_128
	vpsubb xmm2, xmm2, xmm14
	pxor xmm0, [rbp]
	movdqu [rbp], xmm0
	pxor xmm1, [rbp+16]
	movdqu [rbp+16], xmm1
	pxor xmm2, [rbp+32]
	movdqu [rbp+32], xmm2
	pxor xmm3, [rbp+48]
	movdqu [rbp+48], xmm3
	pxor xmm4, [rbp+64]
	movdqu [rbp+64], xmm4
	pxor xmm5, [rbp+80]
	movdqu [rbp+80], xmm5
	pxor xmm6, [rbp+96]
	movdqu [rbp+96], xmm6
	pxor xmm7, [rbp+112]
	movdqu [rbp+112], xmm7
	pxor xmm8, [rbp+128]
	movdqu [rbp+128], xmm8
	pxor xmm9, [rbp+144]
	movdqu [rbp+144], xmm9
	pxor xmm10, [rbp+160]
	movdqu [rbp+160], xmm10
	add rdx, 1024
	dec r12
	jnz .l2
	mov rcx, 8
	call tjald_final
	ret
tjald_4_l6:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	push r14
	push r15
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	mov rcx, r9
	mov r14, rdx
	mov rbp, rdi
	mov rbx, rsi
	mov r15, rsp
	and rsp, -64
	sub rsp, 5120
	mov rdi, rsp
	call tjald_4_begin_l6_inner
	mov rdi, rsp
	mov rsi, rbp
	mov rdx, rbx
	call tjald_4_absorb_l6_inner
	mov rdi, rsp
	mov rsi, r14
	call tjald_4_end_l6_inner
	mov rsp, r15
	pop r15
	pop r14
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
gesus_128_seed_l3:
	push rbx
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	call gesus_128_seed_l3_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbx
	ret
gesus_128_seed_l3_inner:
	mov rax, rdi
	add rdi, 1024
	mov rcx, 1024
	call tjald_memzero_l3
	mov rbx, rsi
	mov rsi, $tjald_seed
	mov qword [rax+2224], 0
	vmovdqu xmm0, [rsi]
	vmovdqu xmm1, [rsi+16]
	vmovdqu xmm2, [rsi+32]
	vmovdqu xmm3, [rsi+48]
	vmovdqu xmm4, [rsi+64]
	vmovdqu xmm5, [rsi+80]
	vmovdqu xmm6, [rsi+96]
	vmovdqu xmm7, [rsi+112]
	vmovdqu xmm8, [rsi+128]
	vmovdqu xmm9, [rsi+144]
	vmovdqu xmm10, [rsi+160]
	vmovdqu [rax+2048], xmm0
	xor [rax+2048], rdx
	vmovdqu xmm0, [rax+2048]
	mov r10, 16
	mov r11, 48
	cmp rdx, 256
	jna .l0
.l1:
	mov rcx, 256
	mov rsi, rbx
	lea rdi, [rax+1024]
	call tjald_memxor_l3
	mov rcx, 256
	mov rsi, rbx
	lea rdi, [rax+1296]
	call tjald_memxor_l3
	mov rcx, 256
	mov rsi, rbx
	lea rdi, [rax+1760]
	call tjald_memxor_l3
	mov r12, rax
	lea r8, [rax+1024]
	mov rcx, 16
	call gesus_kernel_128
	add rbx, 256
	sub rdx, 256
	cmp rdx, 256
	ja .l1
.l0:
	mov rcx, rdx
	mov rsi, rbx
	lea rdi, [rax+1024]
	call tjald_memxor_l3
	mov rcx, rdx
	mov rsi, rbx
	lea rdi, [rax+1296]
	call tjald_memxor_l3
	mov rcx, rdx
	mov rsi, rbx
	lea rdi, [rax+1760]
	call tjald_memxor_l3
	mov r12, rax
	lea r8, [rax+1024]
	mov rcx, 16
	call gesus_kernel_128
	lea rdi, [rax+2112]
	vmovdqu [rdi-64], xmm0
	vmovdqu [rdi-48], xmm1
	vmovdqu [rdi-32], xmm2
	vmovdqu [rdi-16], xmm3
	vmovdqu [rdi], xmm4
	vmovdqu [rdi+16], xmm5
	vmovdqu [rdi+32], xmm6
	vmovdqu [rdi+48], xmm7
	vmovdqu [rdi+64], xmm8
	vmovdqu [rdi+80], xmm9
	vmovdqu [rdi+96], xmm10
	ret
gesus_128_rand_l3:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	call gesus_128_rand_l3_inner
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	ret
gesus_128_rand_l3_inner:
	mov rax, [rdi+2224]
	mov r9, rax
	neg rax
	and rax, 1023
	mov rcx, rdx
	cmp rdx, rax
	jna .l2
	mov rcx, rax
.l2:
	sub rdx, rcx
	add r9, rcx
	mov rbx, rdi
	mov rdi, rsi
	lea rbp, [rsi+rcx]
	lea rsi, [rbx+1024]
	sub rsi, rax
	call tjald_memcpy_l3
	test rdx, rdx
	jz .l3
	lea rax, [rbx+2112]
	vmovdqu xmm0, [rax-64]
	vmovdqu xmm1, [rax-48]
	vmovdqu xmm2, [rax-32]
	vmovdqu xmm3, [rax-16]
	vmovdqu xmm4, [rax]
	vmovdqu xmm5, [rax+16]
	vmovdqu xmm6, [rax+32]
	vmovdqu xmm7, [rax+48]
	vmovdqu xmm8, [rax+64]
	vmovdqu xmm9, [rax+80]
	vmovdqu xmm10, [rax+96]
	mov r10, 16
	mov r11, 48
	mov r12, rbp
	sub rdx, 1024
	jna .l4
.l1:
	lea r8, [rbx+1024]
	mov rcx, 16
	xor [r8], r9
	add r9, 1024
	call gesus_kernel_128
	sub rdx, 1024
	ja .l1
.l4:
	add rdx, 1024
	mov rbp, r12
	lea r8, [rbx+1024]
	mov r12, rbx
	mov rcx, 16
	xor [r8], r9
	call gesus_kernel_128
	add r9, rdx
	mov rcx, rdx
	mov rdi, rbp
	mov rsi, rbx
	call tjald_memcpy_l3
	vmovdqu [rax-64], xmm0
	vmovdqu [rax-48], xmm1
	vmovdqu [rax-32], xmm2
	vmovdqu [rax-16], xmm3
	vmovdqu [rax], xmm4
	vmovdqu [rax+16], xmm5
	vmovdqu [rax+32], xmm6
	vmovdqu [rax+48], xmm7
	vmovdqu [rax+64], xmm8
	vmovdqu [rax+80], xmm9
	vmovdqu [rax+96], xmm10
.l3:
	mov [rbx+2224], r9
	ret
gesus_512_seed_l3:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	push r14
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	mov r14, rdi
	call gesus_128_seed_l3_inner
	mov rdi, r14
	lea rsi, [rdi+4096]
	mov rdx, 1616
	call gesus_128_rand_l3_inner
	lea rdi, [r14+5712]
	lea rsi, [r14+4096]
	mov rcx, 1616
	call tjald_memcpy_l3
	lea rdi, [r14+7328]
	lea rsi, [r14+4096]
	mov rcx, 1568
	call tjald_memcpy_l3
	mov r10, 64
	mov r11, 192
	mov rbp, 48
.l0:
	lea rbx, [r14+rbp]
	vmovdqu xmm0, [rbx+8192]
	vmovdqu xmm1, [rbx+8256]
	vmovdqu xmm2, [rbx+8320]
	vmovdqu xmm3, [rbx+8384]
	vmovdqu xmm4, [rbx+8448]
	vmovdqu xmm5, [rbx+8512]
	vmovdqu xmm6, [rbx+8576]
	vmovdqu xmm7, [rbx+8640]
	vmovdqu xmm8, [rbx+8704]
	vmovdqu xmm9, [rbx+8768]
	vmovdqu xmm10, [rbx+8832]
	mov r12, rbx
	lea r8, [rbx+4096]
	mov rcx, 16
	call gesus_kernel_128
	vmovdqu [rbx+8192], xmm0
	vmovdqu [rbx+8256], xmm1
	vmovdqu [rbx+8320], xmm2
	vmovdqu [rbx+8384], xmm3
	vmovdqu [rbx+8448], xmm4
	vmovdqu [rbx+8512], xmm5
	vmovdqu [rbx+8576], xmm6
	vmovdqu [rbx+8640], xmm7
	vmovdqu [rbx+8704], xmm8
	vmovdqu [rbx+8768], xmm9
	vmovdqu [rbx+8832], xmm10
	sub rbp, 16
	jns .l0
	mov qword [r14+8896], 0
	pop r14
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	ret
gesus_512_rand_l3:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	push r14
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	mov rax, [rdi+8896]
	mov r9, rax
	neg rax
	and rax, 4095
	mov rcx, rdx
	cmp rdx, rax
	jna .l2
	mov rcx, rax
.l2:
	sub rdx, rcx
	add r9, rcx
	mov rbx, rdi
	mov rdi, rsi
	lea rbp, [rsi+rcx]
	lea rsi, [rbx+4096]
	sub rsi, rax
	call tjald_memcpy_l3
	test rdx, rdx
	jz .l3
	mov r10, 64
	mov r11, 192
.l1:
	mov rdi, rdx
	dec rdi
	and rdi, -4096
	jz .l0
	mov rax, 65536
	cmp rdi, rax
	cmova rdi, rax
	sub rdx, rdi
	mov rax, rbp
	add rbp, rdi
	shr rdi, 12
	call gesus_512_rand_l3_inner
	mov r9, r14
	jmp .l1
.l0:
	mov rdi, 1
	mov rax, rbx
	call gesus_512_rand_l3_inner
	add r9, rdx
	mov rdi, rbp
	mov rsi, rbx
	mov rcx, rdx
	call tjald_memcpy_l3
.l3:
	mov [rbx+8896], r9
	pop r14
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	ret
gesus_512_rand_l3_inner:
	mov rsi, 48
	add r9, 4
.l0:
	mov r13, rdi
	lea r12, [rax+rsi]
	dec r9
	mov r14, r9
	vmovdqu xmm0, [rbx+rsi*1+8192]
	vmovdqu xmm1, [rbx+rsi*1+8256]
	vmovdqu xmm2, [rbx+rsi*1+8320]
	vmovdqu xmm3, [rbx+rsi*1+8384]
	vmovdqu xmm4, [rbx+rsi*1+8448]
	vmovdqu xmm5, [rbx+rsi*1+8512]
	vmovdqu xmm6, [rbx+rsi*1+8576]
	vmovdqu xmm7, [rbx+rsi*1+8640]
	vmovdqu xmm8, [rbx+rsi*1+8704]
	vmovdqu xmm9, [rbx+rsi*1+8768]
	vmovdqu xmm10, [rbx+rsi*1+8832]
.l1:
	lea r8, [rbx+rsi*1+4096]
	mov rcx, 16
	xor [r8], r14
	add r14, 4096
	call gesus_kernel_128
	dec r13
	jnz .l1
	vmovdqu [rbx+rsi*1+8192], xmm0
	vmovdqu [rbx+rsi*1+8256], xmm1
	vmovdqu [rbx+rsi*1+8320], xmm2
	vmovdqu [rbx+rsi*1+8384], xmm3
	vmovdqu [rbx+rsi*1+8448], xmm4
	vmovdqu [rbx+rsi*1+8512], xmm5
	vmovdqu [rbx+rsi*1+8576], xmm6
	vmovdqu [rbx+rsi*1+8640], xmm7
	vmovdqu [rbx+rsi*1+8704], xmm8
	vmovdqu [rbx+rsi*1+8768], xmm9
	vmovdqu [rbx+rsi*1+8832], xmm10
	sub rsi, 16
	jnb .l0
	ret
gesus_512_seed_l4:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	push r14
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	mov r14, rdi
	call gesus_128_seed_l3_inner
	mov rdi, r14
	lea rsi, [rdi+4096]
	mov rdx, 1616
	call gesus_128_rand_l3_inner
	lea rdi, [r14+5712]
	lea rsi, [r14+4096]
	mov rcx, 1616
	call tjald_memcpy_l4
	lea rdi, [r14+7328]
	lea rsi, [r14+4096]
	mov rcx, 1568
	call tjald_memcpy_l4
	mov r10, 64
	mov r11, 192
	mov rbp, 32
.l0:
	lea rbx, [r14+rbp]
	vmovdqu ymm0, [rbx+8192]
	vmovdqu ymm1, [rbx+8256]
	vmovdqu ymm2, [rbx+8320]
	vmovdqu ymm3, [rbx+8384]
	vmovdqu ymm4, [rbx+8448]
	vmovdqu ymm5, [rbx+8512]
	vmovdqu ymm6, [rbx+8576]
	vmovdqu ymm7, [rbx+8640]
	vmovdqu ymm8, [rbx+8704]
	vmovdqu ymm9, [rbx+8768]
	vmovdqu ymm10, [rbx+8832]
	mov r12, rbx
	lea r8, [rbx+4096]
	mov rcx, 16
	call gesus_kernel_256
	vmovdqu [rbx+8192], ymm0
	vmovdqu [rbx+8256], ymm1
	vmovdqu [rbx+8320], ymm2
	vmovdqu [rbx+8384], ymm3
	vmovdqu [rbx+8448], ymm4
	vmovdqu [rbx+8512], ymm5
	vmovdqu [rbx+8576], ymm6
	vmovdqu [rbx+8640], ymm7
	vmovdqu [rbx+8704], ymm8
	vmovdqu [rbx+8768], ymm9
	vmovdqu [rbx+8832], ymm10
	sub rbp, 32
	jns .l0
	mov qword [r14+8896], 0
	pop r14
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
gesus_512_rand_l4:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	push r14
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	mov rax, [rdi+8896]
	mov r9, rax
	neg rax
	and rax, 4095
	mov rcx, rdx
	cmp rdx, rax
	jna .l2
	mov rcx, rax
.l2:
	sub rdx, rcx
	add r9, rcx
	mov rbx, rdi
	mov rdi, rsi
	lea rbp, [rsi+rcx]
	lea rsi, [rbx+4096]
	sub rsi, rax
	call tjald_memcpy_l4
	test rdx, rdx
	jz .l3
	mov r10, 64
	mov r11, 192
.l1:
	mov rdi, rdx
	dec rdi
	and rdi, -4096
	jz .l0
	mov rax, 65536
	cmp rdi, rax
	cmova rdi, rax
	sub rdx, rdi
	mov rax, rbp
	add rbp, rdi
	shr rdi, 12
	call gesus_512_rand_l4_inner
	mov r9, r14
	jmp .l1
.l0:
	mov rdi, 1
	mov rax, rbx
	call gesus_512_rand_l4_inner
	add r9, rdx
	mov rdi, rbp
	mov rsi, rbx
	mov rcx, rdx
	call tjald_memcpy_l4
.l3:
	mov [rbx+8896], r9
	pop r14
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
gesus_512_rand_l4_inner:
	mov rsi, 32
	add r9, 4
.l0:
	mov r13, rdi
	lea r12, [rax+rsi]
	sub r9, 2
	mov r14, r9
	vmovdqu ymm0, [rbx+rsi*1+8192]
	vmovdqu ymm1, [rbx+rsi*1+8256]
	vmovdqu ymm2, [rbx+rsi*1+8320]
	vmovdqu ymm3, [rbx+rsi*1+8384]
	vmovdqu ymm4, [rbx+rsi*1+8448]
	vmovdqu ymm5, [rbx+rsi*1+8512]
	vmovdqu ymm6, [rbx+rsi*1+8576]
	vmovdqu ymm7, [rbx+rsi*1+8640]
	vmovdqu ymm8, [rbx+rsi*1+8704]
	vmovdqu ymm9, [rbx+rsi*1+8768]
	vmovdqu ymm10, [rbx+rsi*1+8832]
.l1:
	lea r8, [rbx+rsi*1+4096]
	mov rcx, 16
	xor [r8], r14
	inc r14
	xor [r8+16], r14
	add r14, 4095
	call gesus_kernel_256
	dec r13
	jnz .l1
	vmovdqu [rbx+rsi*1+8192], ymm0
	vmovdqu [rbx+rsi*1+8256], ymm1
	vmovdqu [rbx+rsi*1+8320], ymm2
	vmovdqu [rbx+rsi*1+8384], ymm3
	vmovdqu [rbx+rsi*1+8448], ymm4
	vmovdqu [rbx+rsi*1+8512], ymm5
	vmovdqu [rbx+rsi*1+8576], ymm6
	vmovdqu [rbx+rsi*1+8640], ymm7
	vmovdqu [rbx+rsi*1+8704], ymm8
	vmovdqu [rbx+rsi*1+8768], ymm9
	vmovdqu [rbx+rsi*1+8832], ymm10
	sub rsi, 32
	jnb .l0
	ret
gesus_512_seed_l6:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	push r14
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	mov r14, rdi
	call gesus_128_seed_l3_inner
	mov rdi, r14
	lea rsi, [rdi+4096]
	mov rdx, 1616
	call gesus_128_rand_l3_inner
	lea rdi, [r14+5712]
	lea rsi, [r14+4096]
	mov rcx, 1616
	call tjald_memcpy_l6
	lea rdi, [r14+7328]
	lea rsi, [r14+4096]
	mov rcx, 1568
	call tjald_memcpy_l6
	mov r10, 64
	mov r11, 192
	vmovdqu32 zmm0, [r14+8192]
	vmovdqu32 zmm1, [r14+8256]
	vmovdqu32 zmm2, [r14+8320]
	vmovdqu32 zmm3, [r14+8384]
	vmovdqu32 zmm4, [r14+8448]
	vmovdqu32 zmm5, [r14+8512]
	vmovdqu32 zmm6, [r14+8576]
	vmovdqu32 zmm7, [r14+8640]
	vmovdqu32 zmm8, [r14+8704]
	vmovdqu32 zmm9, [r14+8768]
	vmovdqu32 zmm10, [r14+8832]
	mov r12, r14
	lea r8, [r14+4096]
	mov rcx, 16
	call gesus_kernel_512
	vmovdqu32 [rbx+8192], zmm0
	vmovdqu32 [rbx+8256], zmm1
	vmovdqu32 [rbx+8320], zmm2
	vmovdqu32 [rbx+8384], zmm3
	vmovdqu32 [rbx+8448], zmm4
	vmovdqu32 [rbx+8512], zmm5
	vmovdqu32 [rbx+8576], zmm6
	vmovdqu32 [rbx+8640], zmm7
	vmovdqu32 [rbx+8704], zmm8
	vmovdqu32 [rbx+8768], zmm9
	vmovdqu32 [rbx+8832], zmm10
	mov qword [r14+8896], 0
	pop r14
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
gesus_512_rand_l6:
	push rbp
	sub rsp, 160
	movdqa [rsp], xmm6
	movdqa [rsp+16], xmm7
	movdqa [rsp+32], xmm8
	movdqa [rsp+48], xmm9
	movdqa [rsp+64], xmm10
	movdqa [rsp+80], xmm11
	movdqa [rsp+96], xmm12
	movdqa [rsp+112], xmm13
	movdqa [rsp+128], xmm14
	movdqa [rsp+144], xmm15
	push rbx
	push rdi
	push rsi
	push r12
	push r13
	mov rdi, rcx
	mov rsi, rdx
	mov rdx, r8
	mov rax, [rdi+8896]
	mov r9, rax
	neg rax
	and rax, 4095
	mov rcx, rdx
	cmp rdx, rax
	jna .l2
	mov rcx, rax
.l2:
	sub rdx, rcx
	add r9, rcx
	mov rbx, rdi
	mov rdi, rsi
	lea rbp, [rsi+rcx]
	lea rsi, [rbx+4096]
	sub rsi, rax
	call tjald_memcpy_l6
	test rdx, rdx
	jz .l3
	vmovdqu32 zmm0, [rbx+8192]
	vmovdqu32 zmm1, [rbx+8256]
	vmovdqu32 zmm2, [rbx+8320]
	vmovdqu32 zmm3, [rbx+8384]
	vmovdqu32 zmm4, [rbx+8448]
	vmovdqu32 zmm5, [rbx+8512]
	vmovdqu32 zmm6, [rbx+8576]
	vmovdqu32 zmm7, [rbx+8640]
	vmovdqu32 zmm8, [rbx+8704]
	vmovdqu32 zmm9, [rbx+8768]
	vmovdqu32 zmm10, [rbx+8832]
	mov r10, 64
	mov r11, 192
	mov r12, rbp
	sub rdx, 4096
	jna .l4
.l1:
	lea r8, [rbx+4096]
	mov rcx, 16
	xor [r8], r9
	lea rax, [r9+1]
	xor [r8+16], rax
	inc rax
	xor [r8+32], rax
	inc rax
	xor [r8+48], rax
	add r9, 4096
	call gesus_kernel_512
	sub rdx, 4096
	ja .l1
.l4:
	add rdx, 4096
	mov rbp, r12
	lea r8, [rbx+4096]
	mov r12, rbx
	mov rcx, 16
	xor [r8], r9
	lea rax, [r9+1]
	xor [r8+16], rax
	inc rax
	xor [r8+32], rax
	inc rax
	xor [r8+48], rax
	call gesus_kernel_512
	add r9, rdx
	mov rcx, rdx
	mov rdi, rbp
	mov rsi, rbx
	call tjald_memcpy_l6
	vmovdqu32 [rbx+8192], zmm0
	vmovdqu32 [rbx+8256], zmm1
	vmovdqu32 [rbx+8320], zmm2
	vmovdqu32 [rbx+8384], zmm3
	vmovdqu32 [rbx+8448], zmm4
	vmovdqu32 [rbx+8512], zmm5
	vmovdqu32 [rbx+8576], zmm6
	vmovdqu32 [rbx+8640], zmm7
	vmovdqu32 [rbx+8704], zmm8
	vmovdqu32 [rbx+8768], zmm9
	vmovdqu32 [rbx+8832], zmm10
.l3:
	mov [rbx+8896], r9
	pop r13
	pop r12
	pop rsi
	pop rdi
	pop rbx
	movdqa xmm6, [rsp]
	movdqa xmm7, [rsp+16]
	movdqa xmm8, [rsp+32]
	movdqa xmm9, [rsp+48]
	movdqa xmm10, [rsp+64]
	movdqa xmm11, [rsp+80]
	movdqa xmm12, [rsp+96]
	movdqa xmm13, [rsp+112]
	movdqa xmm14, [rsp+128]
	movdqa xmm15, [rsp+144]
	add rsp, 160
	pop rbp
	vzeroupper
	ret
tjald_once_asm_limit:
	push rbx
	sub rsp, 16
	movdqa [rsp], xmm15
	push rdi
	push rsi
	mov rdi, rcx
	mov r8, 0
	mov r9, 0
	mov r10, 0
	mov r11, 0
	mov rax, 0
	mov rcx, 0
	cpuid
	mov rsi, rax
	cmp rsi, 1
	jb .l0
	mov rax, 1
	mov rcx, 0
	cpuid
	mov r8, rcx
	mov r9, rdx
	cmp rsi, 7
	jb .l0
	mov rax, 7
	mov rcx, 0
	cpuid
	mov r10, rbx
	mov r11, rcx
.l0:
	mov rbx, r8
	shr rbx, 28
	mov rsi, r8
	shr rsi, 27
	and rbx, rsi
	mov rax, 0
	and rbx, 1
	jz .l1
	mov rcx, 0
	xgetbv
.l1:
	mov rdx, r8
	shr rdx, 25
	mov rcx, r8
	shr rcx, 28
	and rdx, rcx
	and rdx, 1
	jz .l2
	cmp rdi, 3
	jb .l2
	mov rdx, rax
	and rdx, 6
	cmp rdx, 6
	jnz .l2
	mov rsi, 3
	mov rdx, r11
	shr rdx, 9
	mov rcx, r10
	shr rcx, 5
	and rdx, rcx
	and rdx, 1
	jz .l3
	cmp rdi, 4
	jb .l3
	mov rsi, 4
	mov rdx, r10
	shr rdx, 16
	mov rcx, r10
	shr rcx, 30
	and rdx, rcx
	and rdx, 1
	jz .l3
	cmp rdi, 6
	jb .l3
	mov rdx, rax
	and rdx, 230
	cmp rdx, 230
	jnz .l3
	mov rsi, 6
	jmp .l3
.l2:
	mov rdx, r8
	shr rdx, 25
	mov rcx, r9
	shr rcx, 26
	and rdx, rcx
	and rdx, 1
	jz .l4
	cmp rdi, 2
	jb .l4
	mov rsi, 2
	jmp .l3
.l4:
	mov rsi, 0
	mov rdx, r8
	shr rdx, 9
	and rdx, 1
	jz .l3
	cmp rdi, 1
	jb .l3
	mov rsi, 1
.l3:
	mov rax, rsi
	mov rdi, $tjald_fn_pointers
	mov rcx, 128
	cmp rax, 4
	jz .l5
	jb .l6
	mov rsi, $l6_ptrs
	jmp .l7
.l5:
	mov rsi, $l4_ptrs
	jmp .l7
.l6:
	cmp rax, 2
	jna .l8
	mov rsi, $l3_ptrs
.l7:
	call tjald_memcpy_l3
.l8:
	pop rsi
	pop rdi
	movdqa xmm15, [rsp]
	add rsp, 16
	pop rbx
	ret
