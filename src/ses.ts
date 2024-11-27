import {
    CreateEmailTemplateCommand,
    ListEmailTemplatesCommand,
    SESv2Client,
    UpdateEmailTemplateCommand
} from '@aws-sdk/client-sesv2'
import {Wait} from './wait'

export class SES {
    private client: SESv2Client
    private wait: Wait

    constructor() {
        this.client = new SESv2Client({})
        this.wait = new Wait()
    }

    async listTemplates(): Promise<string[]> {
        // SES allows 1 request per second
        await this.wait.wait('list-templates', 1000)

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

    async createTemplate(templateName: string, subject: string, html: string, text: string): Promise<void> {
        // SES allows 1 request per second
        await this.wait.wait('create-template', 1000)

        const command = new CreateEmailTemplateCommand({
            TemplateName: templateName,
            TemplateContent: {
                Subject: subject,
                Html: html,
                Text: text
            }
        })
        /*
        const response = await this.client.send(command)

        if (response.$metadata.httpStatusCode !== 200) {
            throw new Error(`Failed to create template ${templateName}:
                SES responded with status ${response.$metadata.httpStatusCode}`)
        }
         */
    }

    async updateTemplate(templateName: string, subject: string, html: string, text: string): Promise<void> {
        // SES allows 1 request per second
        await this.wait.wait('update-template', 1000)

        const command = new UpdateEmailTemplateCommand({
            TemplateName: templateName,
            TemplateContent: {
                Subject: subject,
                Html: html,
                Text: text
            }
        })
        /*
        const response = await this.client.send(command)

        if (response.$metadata.httpStatusCode !== 200) {
            throw new Error(`Failed to update template ${templateName}:
                SES responded with status ${response.$metadata.httpStatusCode}`)
        }
         */
    }
}
