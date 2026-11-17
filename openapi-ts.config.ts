import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: 'http://localhost:8000/api/openapi.json',
  output: 'src/dto/generated',
  parser: {
    transforms: {
      propertiesRequiredByDefault: true,
      readWrite: { enabled: false },
    },
  },
  plugins: ['@hey-api/typescript'],
})
