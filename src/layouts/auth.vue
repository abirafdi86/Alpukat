<script setup lang="ts">
import { Leaf, Sprout } from 'lucide-vue-next'
import AppBrand from '@/components/AppBrand.vue'
</script>

<template>
  <div class="min-h-dvh bg-slate-50 lg:grid lg:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.1fr)]">
    <aside class="relative hidden min-h-dvh flex-col overflow-hidden border-r border-green-100 bg-green-50 px-10 py-9 lg:flex xl:px-16">
      <AppBrand />
      <div class="relative z-10 my-auto max-w-md py-16">
        <span class="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-green-700"><Sprout :size="16" aria-hidden="true" />{{ $t('authLayout.eyebrow') }}</span>
        <h2 class="text-4xl font-semibold leading-tight tracking-tight text-green-950 xl:text-5xl">{{ $t('authLayout.title') }}</h2>
        <p class="mt-6 max-w-sm text-base leading-7 text-green-900/70">{{ $t('authLayout.description') }}</p>
        <div class="mt-10 flex items-center gap-3 border-t border-green-200 pt-6 text-sm text-green-800"><Leaf :size="20" class="shrink-0" aria-hidden="true" /><span>{{ $t('authLayout.caption') }}</span></div>
      </div>
      <div class="pointer-events-none absolute -right-20 bottom-12 size-72 rounded-[70%_0_70%_0] border border-green-200/70 bg-green-100/40 -rotate-12" aria-hidden="true"></div>
      <div class="pointer-events-none absolute -right-2 bottom-24 size-44 rounded-[70%_0_70%_0] border border-green-200/60 rotate-12" aria-hidden="true"></div>
    </aside>
    <div class="flex min-h-dvh flex-col px-5 py-7 sm:px-8 sm:py-9">
      <div class="mb-8 lg:hidden"><AppBrand /></div>
      <main id="auth-content" class="mx-auto my-auto w-full max-w-md py-4 sm:py-6"><slot /></main>
    </div>
  </div>
</template>
