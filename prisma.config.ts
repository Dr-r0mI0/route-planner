import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  migrate: {
    async url() {
      return 'postgresql://admin:rout2024secure@postgres-db:5432/routplanner'
    },
  },
})