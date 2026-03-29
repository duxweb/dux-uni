import uni from '@uni-helper/eslint-config'

export default uni({
  unocss: true,
}).prepend({
  ignores: [
    'src/pages/**',
    'src/runtime/**',
  ],
})
