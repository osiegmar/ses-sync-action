import { jest } from '@jest/globals'

const mockInfo = jest.fn()
const mockSetFailed = jest.fn()
const mockGetInput = jest.fn()

const mockListTemplates = jest.fn().mockResolvedValue([])
const mockCreateTemplate = jest.fn().mockResolvedValue(undefined)
const mockUpdateTemplate = jest.fn().mockResolvedValue(undefined)

jest.unstable_mockModule('@actions/core', () => ({
  info: mockInfo,
  getInput: mockGetInput,
  setFailed: mockSetFailed
}))

jest.unstable_mockModule('../src/ses.js', () => ({
  SES: jest.fn().mockImplementation(() => ({
    listTemplates: mockListTemplates,
    createTemplate: mockCreateTemplate,
    updateTemplate: mockUpdateTemplate
  }))
}))

const mockFindTemplates = jest.fn().mockResolvedValue([])

jest.unstable_mockModule('../src/templates.js', () => ({
  findTemplates: mockFindTemplates,
  LocalTemplate: jest.fn()
}))

const { run } = await import('../src/main.js')

function makeTemplate(basename: string): {
  basename: string
  subject: string
  html: string
  text: string
} {
  return {
    basename,
    subject: `Subject for ${basename}`,
    html: `<h1>${basename}</h1>`,
    text: basename
  }
}

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetInput.mockReturnValue('/templates')
  })

  it('should create new templates not in SES', async () => {
    mockListTemplates.mockResolvedValue([])
    mockFindTemplates.mockResolvedValue([makeTemplate('welcome')])

    await run()

    expect(mockCreateTemplate).toHaveBeenCalledTimes(1)
    expect(mockUpdateTemplate).not.toHaveBeenCalled()
    expect(mockSetFailed).not.toHaveBeenCalled()
  })

  it('should update existing templates', async () => {
    mockListTemplates.mockResolvedValue(['welcome'])
    mockFindTemplates.mockResolvedValue([makeTemplate('welcome')])

    await run()

    expect(mockCreateTemplate).not.toHaveBeenCalled()
    expect(mockUpdateTemplate).toHaveBeenCalledTimes(1)
    expect(mockSetFailed).not.toHaveBeenCalled()
  })

  it('should handle mix of new and existing templates', async () => {
    mockListTemplates.mockResolvedValue(['welcome'])
    mockFindTemplates.mockResolvedValue([
      makeTemplate('welcome'),
      makeTemplate('reset')
    ])

    await run()

    expect(mockUpdateTemplate).toHaveBeenCalledTimes(1)
    expect(mockCreateTemplate).toHaveBeenCalledTimes(1)
    expect(mockSetFailed).not.toHaveBeenCalled()
  })

  it('should do nothing when no local templates exist', async () => {
    mockListTemplates.mockResolvedValue(['welcome'])
    mockFindTemplates.mockResolvedValue([])

    await run()

    expect(mockCreateTemplate).not.toHaveBeenCalled()
    expect(mockUpdateTemplate).not.toHaveBeenCalled()
    expect(mockInfo).toHaveBeenCalledWith('Finished')
  })

  it('should call setFailed on error', async () => {
    mockListTemplates.mockRejectedValue(new Error('SES unavailable'))

    await run()

    expect(mockSetFailed).toHaveBeenCalledWith('SES unavailable')
  })

  it('should read dir input', async () => {
    mockGetInput.mockReturnValue('/my/templates')
    mockListTemplates.mockResolvedValue([])
    mockFindTemplates.mockResolvedValue([])

    await run()

    expect(mockGetInput).toHaveBeenCalledWith('dir', { required: true })
    expect(mockFindTemplates).toHaveBeenCalledWith('/my/templates')
  })

  it('should log template counts', async () => {
    mockListTemplates.mockResolvedValue(['a', 'b', 'c'])
    mockFindTemplates.mockResolvedValue([makeTemplate('a'), makeTemplate('d')])

    await run()

    expect(mockInfo).toHaveBeenCalledWith('Found 3 templates in SES')
    expect(mockInfo).toHaveBeenCalledWith('Found 2 templates locally')
  })
})
