import { nextTick, ref, watch } from 'vue'
import type { z } from 'zod'

/** Validation stays quiet until blur or submit; then updates as the user corrects fields. */
export function useZodForm<T extends Record<string, unknown>>(schema: z.ZodType<T>, values: T) {
  const form = ref<HTMLFormElement>()
  const errors = ref<Record<string, string>>({})
  const touched = new Set<string>()
  let submitted = false
  function parse() {
    const result = schema.safeParse(values)
    const nextErrors: Record<string, string> = {}
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = String(issue.path[0])
        if ((submitted || touched.has(field)) && !nextErrors[field]) nextErrors[field] = issue.message
      }
    }
    errors.value = nextErrors
    return result
  }
  function blur(field: string) { touched.add(field); parse() }
  function resetValidation() { touched.clear(); submitted = false; errors.value = {} }
  async function validate(): Promise<T | undefined> {
    submitted = true
    const result = parse()
    if (result.success) return result.data
    await nextTick()
    form.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return undefined
  }
  watch(values, () => { if (submitted || touched.size) parse() }, { deep: true })
  return { form, errors, blur, validate, resetValidation }
}
