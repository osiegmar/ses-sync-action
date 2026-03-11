import {
  CreateEmailTemplateCommand,
  ListEmailTemplatesCommand,
  type ListEmailTemplatesCommandOutput,
  SESv2Client,
  UpdateEmailTemplateCommand
} from '@aws-sdk/client-sesv2'
import * as core from '@actions/core'
import { LocalTemplate } from './templates.js'

export class SES {
  private client: SESv2Client

  constructor() {
    // SES template API is limited to 1 request per second
    this.client = new SESv2Client({ maxAttempts: 10 })
  }

  async listTemplates(): Promise<string[]> {
    let templates: string[] = []

    let NextToken: string | undefined = undefined
    for (;;) {
      const response: ListEmailTemplatesCommandOutput = await this.client.send(
        new ListEmailTemplatesCommand({
          PageSize: 100,
          NextToken
        })
      )

      if (response.$metadata.httpStatusCode !== 200) {
        throw new Error(
          `Failed to list templates: SES responded with status ${response.$metadata.httpStatusCode}`
        )
      }

      for (const e of response.TemplatesMetadata ?? []) {
        if (e.TemplateName) {
          templates = templates.concat(e.TemplateName)
        }
      }

      if (response.NextToken === undefined) {
        break
      }

      NextToken = response.NextToken
    }

    return templates
  }

  async createTemplate(localTemplate: LocalTemplate): Promise<void> {
    core.info(`Creating template ${localTemplate.basename}`)

    const command = new CreateEmailTemplateCommand({
      TemplateName: localTemplate.basename,
      TemplateContent: {
        Subject: localTemplate.subject,
        Html: localTemplate.html,
        Text: localTemplate.text
      }
    })
    const response = await this.client.send(command)

    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error(
        `Failed to create template ${localTemplate.basename}: SES responded with status ${response.$metadata.httpStatusCode}`
      )
    }
  }

  async updateTemplate(localTemplate: LocalTemplate): Promise<void> {
    core.info(`Updating template ${localTemplate.basename}`)

    const command = new UpdateEmailTemplateCommand({
      TemplateName: localTemplate.basename,
      TemplateContent: {
        Subject: localTemplate.subject,
        Html: localTemplate.html,
        Text: localTemplate.text
      }
    })
    const response = await this.client.send(command)

    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error(
        `Failed to update template ${localTemplate.basename}: SES responded with status ${response.$metadata.httpStatusCode}`
      )
    }
  }
}
