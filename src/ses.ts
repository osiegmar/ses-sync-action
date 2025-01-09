import {
    CreateEmailTemplateCommand,
    ListEmailTemplatesCommand,
    SESv2Client,
    UpdateEmailTemplateCommand
} from '@aws-sdk/client-sesv2'
import {Wait} from './wait'
import * as core from '@actions/core'
import {LocalTemplate} from './templates'

export class SES {
    private client: SESv2Client
    private wait: Wait

    constructor() {
        this.client = new SESv2Client({})
        this.wait = new Wait()
    }

    // SES allows 1 request per second. Another 100ms is added to be safe (experienced rate errors otherwise).
    private readonly _wait_duration = 1100

    async listTemplates(): Promise<string[]> {
        let templates: string[] = []

        let NextToken = undefined
        for (;;) {
            const command: ListEmailTemplatesCommand = new ListEmailTemplatesCommand({
                PageSize: 100,
                NextToken
            })
            const response = await this.client.send(command)

            if (response.$metadata.httpStatusCode !== 200) {
                throw new Error(`Failed to list templates:
                    SES responded with status ${response.$metadata.httpStatusCode}`)
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

        // Ensure we don't exceed the SES rate limit
        await this.wait.wait('create-template', this._wait_duration)

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
            throw new Error(`Failed to create template ${localTemplate.basename}:
                SES responded with status ${response.$metadata.httpStatusCode}`)
        }
    }

    async updateTemplate(localTemplate: LocalTemplate): Promise<void> {
        core.info(`Updating template ${localTemplate.basename}`)

        // Ensure we don't exceed the SES rate limit
        await this.wait.wait('update-template', this._wait_duration)

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
            throw new Error(`Failed to update template ${localTemplate.basename}:
                SES responded with status ${response.$metadata.httpStatusCode}`)
        }
    }
}
