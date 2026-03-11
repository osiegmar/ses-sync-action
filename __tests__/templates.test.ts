import { jest } from '@jest/globals'

const mockReaddirSync = jest.fn()
const mockReadFileSync = jest.fn()

jest.unstable_mockModule('node:fs', () => ({
  default: {
    readdirSync: mockReaddirSync,
    readFileSync: mockReadFileSync
  },
  readdirSync: mockReaddirSync,
  readFileSync: mockReadFileSync
}))

const { findTemplates, LocalTemplate } = await import('../src/templates.js')

describe('findTemplates', () => {
  it('should discover templates by .json files', async () => {
    mockReaddirSync.mockReturnValue([
      'welcome.json',
      'welcome.html',
      'welcome.txt',
      'reset.json',
      'reset.html',
      'reset.txt'
    ])

    const templates = await findTemplates('/templates')

    expect(templates).toHaveLength(2)
    expect(templates[0].basename).toBe('welcome')
    expect(templates[1].basename).toBe('reset')
  })

  it('should ignore non-json files', async () => {
    mockReaddirSync.mockReturnValue([
      'readme.md',
      'welcome.json',
      'welcome.html',
      'welcome.txt'
    ])

    const templates = await findTemplates('/templates')

    expect(templates).toHaveLength(1)
    expect(templates[0].basename).toBe('welcome')
  })

  it('should return empty array for empty directory', async () => {
    mockReaddirSync.mockReturnValue([])

    const templates = await findTemplates('/templates')

    expect(templates).toHaveLength(0)
  })
})

describe('LocalTemplate', () => {
  it('should return basename', () => {
    const template = new LocalTemplate('/templates', 'welcome')
    expect(template.basename).toBe('welcome')
  })

  it('should read subject from json file', () => {
    mockReadFileSync.mockReturnValue('{"subject":"Hello World"}')

    const template = new LocalTemplate('/templates', 'welcome')
    expect(template.subject).toBe('Hello World')
    expect(mockReadFileSync).toHaveBeenCalledWith(
      '/templates/welcome.json',
      'utf8'
    )
  })

  it('should read html body', () => {
    mockReadFileSync.mockReturnValue('<h1>Hello</h1>')

    const template = new LocalTemplate('/templates', 'welcome')
    expect(template.html).toBe('<h1>Hello</h1>')
    expect(mockReadFileSync).toHaveBeenCalledWith(
      '/templates/welcome.html',
      'utf8'
    )
  })

  it('should read text body', () => {
    mockReadFileSync.mockReturnValue('Hello plain text')

    const template = new LocalTemplate('/templates', 'welcome')
    expect(template.text).toBe('Hello plain text')
    expect(mockReadFileSync).toHaveBeenCalledWith(
      '/templates/welcome.txt',
      'utf8'
    )
  })
})
