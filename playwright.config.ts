import { defineConfig } from '@playwright/test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const port = Number(process.env.ESQUISSE_TEST_PORT || 3489)
const baseURL = 'http://127.0.0.1:' + port
// Workers inherit this path, so they can check how many submissions reached the stub.
process.env.ESQUISSE_TEST_CALLS ||= path.join(mkdtempSync(path.join(tmpdir(), 'esquisse-calls-')), 'calls.jsonl')
export default defineConfig({
  testDir: './tests',
  use: { baseURL, channel: process.env.PLAYWRIGHT_CHANNEL || undefined },
  webServer: {
    command: 'node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ' + port,
    url: baseURL,
    env: {
      ESQUISSE_DATA_DIR: mkdtempSync(path.join(tmpdir(), 'esquisse-test-')),
      ESQUISSE_TEST_CALLS: process.env.ESQUISSE_TEST_CALLS,
      BFL_API_KEY: 'test-only',
      NODE_OPTIONS: [process.env.NODE_OPTIONS, '--require=./tests/mock-bfl.cjs'].filter(Boolean).join(' ')
    }
  }
})
