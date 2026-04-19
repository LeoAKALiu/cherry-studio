import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockFetch } = vi.hoisted(() => ({
  mockFetch: vi.fn()
}))

vi.mock('@logger', () => ({
  loggerService: {
    withContext: () => ({
      error: vi.fn(),
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn()
    })
  }
}))

vi.mock('../utils/file', () => ({
  getConfigDir: vi.fn(() => '/tmp/cherry-config')
}))

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/cherry-userdata')
  },
  net: {
    fetch: mockFetch
  },
  safeStorage: {
    encryptString: vi.fn((value: string) => Buffer.from(value)),
    decryptString: vi.fn(() => 'decrypted-token')
  }
}))

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => false),
    promises: {
      mkdir: vi.fn(),
      writeFile: vi.fn(),
      readFile: vi.fn(),
      access: vi.fn(),
      unlink: vi.fn()
    }
  }
}))

import CopilotService from '../CopilotService'

function makeTextResponse(text: string) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    text: vi.fn().mockResolvedValue(text),
    json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token'))
  }
}

describe('CopilotService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAuthMessage', () => {
    it('parses x-www-form-urlencoded device flow responses', async () => {
      mockFetch.mockResolvedValue(
        makeTextResponse(
          'device_code=abc123&user_code=ABCD-EFGH&verification_uri=https%3A%2F%2Fgithub.com%2Flogin%2Fdevice'
        )
      )

      const result = await CopilotService.getAuthMessage({} as Electron.IpcMainInvokeEvent)

      expect(result).toEqual({
        device_code: 'abc123',
        user_code: 'ABCD-EFGH',
        verification_uri: 'https://github.com/login/device'
      })
    })
  })

  describe('getCopilotToken', () => {
    it('parses x-www-form-urlencoded access token responses', async () => {
      mockFetch.mockResolvedValue(makeTextResponse('access_token=gho_test_token&token_type=bearer&scope=read%3Auser'))

      const result = await CopilotService.getCopilotToken({} as Electron.IpcMainInvokeEvent, 'device-code')

      expect(result).toEqual({ access_token: 'gho_test_token' })
    })
  })
})
