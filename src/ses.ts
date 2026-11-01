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
    const templates: string[] = []

    let NextToken: string | undefined = undefined
    for (;;) {
      // the SDK throws on non-2xx responses
      const response: ListEmailTemplatesCommandOutput = await this.client.send(
        new ListEmailTemplatesCommand({
          PageSize: 100,
          NextToken
        })
      )

      for (const e of response.TemplatesMetadata ?? []) {
        if (e.TemplateName) {
          templates.push(e.TemplateName)
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
    await this.client.send(command)
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
    await this.client.send(command)
  }
}
