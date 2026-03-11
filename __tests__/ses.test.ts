import { jest } from '@jest/globals'

const mockSend = jest.fn()
const mockInfo = jest.fn()

jest.unstable_mockModule('@actions/core', () => ({
  info: mockInfo
}))

jest.unstable_mockModule('@aws-sdk/client-sesv2', () => ({
  SESv2Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
  CreateEmailTemplateCommand: jest
    .fn()
    .mockImplementation((params: unknown) => ({ input: params })),
  ListEmailTemplatesCommand: jest
    .fn()
    .mockImplementation((params: unknown) => ({ input: params })),
  UpdateEmailTemplateCommand: jest
    .fn()
    .mockImplementation((params: unknown) => ({ input: params }))
}))

const { SES } = await import('../src/ses.js')
const { LocalTemplate } = await import('../src/templates.js')

jest.unstable_mockModule('node:fs', () => ({
  default: {
    readdirSync: jest.fn(),
    readFileSync: jest.fn()
  },
  readdirSync: jest.fn(),
  readFileSync: jest.fn()
}))

function makeTemplate(): LocalTemplate {
  const t = new LocalTemplate('/tpl', 'welcome')
  Object.defineProperty(t, 'subject', { get: () => 'Hello Subject' })
  Object.defineProperty(t, 'html', { get: () => '<h1>Hello</h1>' })
  Object.defineProperty(t, 'text', { get: () => 'Hello plain' })
  return t
}

describe('SES', () => {
  describe('listTemplates', () => {
    it('should return template names', async () => {
      mockSend.mockResolvedValueOnce({
        $metadata: { httpStatusCode: 200 },
        NextToken: undefined,
        TemplatesMetadata: [
          { TemplateName: 'welcome' },
          { TemplateName: 'reset' }
        ]
      })

      const ses = new SES()
      const templates = await ses.listTemplates()

      expect(templates).toEqual(['welcome', 'reset'])
    })

    it('should handle pagination', async () => {
      mockSend
        .mockResolvedValueOnce({
          $metadata: { httpStatusCode: 200 },
          NextToken: 'token1',
          TemplatesMetadata: [{ TemplateName: 'welcome' }]
        })
        .mockResolvedValueOnce({
          $metadata: { httpStatusCode: 200 },
          NextToken: undefined,
          TemplatesMetadata: [{ TemplateName: 'reset' }]
        })

      const ses = new SES()
      const templates = await ses.listTemplates()

      expect(templates).toEqual(['welcome', 'reset'])
      expect(mockSend).toHaveBeenCalledTimes(2)
    })

    it('should throw on non-200 status', async () => {
      mockSend.mockResolvedValueOnce({
        $metadata: { httpStatusCode: 403 },
        TemplatesMetadata: []
      })

      const ses = new SES()
      await expect(ses.listTemplates()).rejects.toThrow(
        'Failed to list templates'
      )
    })

    it('should handle empty TemplatesMetadata', async () => {
      mockSend.mockResolvedValueOnce({
        $metadata: { httpStatusCode: 200 },
        NextToken: undefined,
        TemplatesMetadata: undefined
      })

      const ses = new SES()
      const templates = await ses.listTemplates()

      expect(templates).toEqual([])
    })

    it('should skip entries without TemplateName', async () => {
      mockSend.mockResolvedValueOnce({
        $metadata: { httpStatusCode: 200 },
        NextToken: undefined,
        TemplatesMetadata: [
          { TemplateName: 'welcome' },
          { TemplateName: undefined },
          { TemplateName: 'reset' }
        ]
      })

      const ses = new SES()
      const templates = await ses.listTemplates()

      expect(templates).toEqual(['welcome', 'reset'])
    })
  })

  describe('createTemplate', () => {
    it('should send create command and log', async () => {
      mockSend.mockResolvedValueOnce({
        $metadata: { httpStatusCode: 200 }
      })

      const ses = new SES()
      await ses.createTemplate(makeTemplate())

      expect(mockInfo).toHaveBeenCalledWith('Creating template welcome')
      expect(mockSend).toHaveBeenCalledTimes(1)
    })

    it('should throw on non-200 status', async () => {
      mockSend.mockResolvedValueOnce({
        $metadata: { httpStatusCode: 500 }
      })

      const ses = new SES()
      await expect(ses.createTemplate(makeTemplate())).rejects.toThrow(
        'Failed to create template welcome'
      )
    })
  })

  describe('updateTemplate', () => {
    it('should send update command and log', async () => {
      mockSend.mockResolvedValueOnce({
        $metadata: { httpStatusCode: 200 }
      })

      const ses = new SES()
      await ses.updateTemplate(makeTemplate())

      expect(mockInfo).toHaveBeenCalledWith('Updating template welcome')
      expect(mockSend).toHaveBeenCalledTimes(1)
    })

    it('should throw on non-200 status', async () => {
      mockSend.mockResolvedValueOnce({
        $metadata: { httpStatusCode: 500 }
      })

      const ses = new SES()
      await expect(ses.updateTemplate(makeTemplate())).rejects.toThrow(
        'Failed to update template welcome'
      )
    })
  })
})
