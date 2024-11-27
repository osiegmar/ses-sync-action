import * as core from '@actions/core'
import {SES} from './ses'
import * as fs from 'node:fs'

export async function run(): Promise<void> {
    try {
        const srcDir: string = core.getInput('dir', {required: true})

        const ses = new SES()
        const storedTemplates = await ses.listTemplates()

        core.info(`Found ${storedTemplates.length} templates in SES`)

        const localTemplates = await findTemplates(srcDir)
        core.info(`Found ${localTemplates.length} templates locally`)

        for (const localTemplate of localTemplates) {
            if (storedTemplates.includes(localTemplate.basename)) {
                core.info(`Template ${localTemplate.basename} already exists in SES – updating`)
                await ses.updateTemplate(
                    localTemplate.basename,
                    localTemplate.subject,
                    localTemplate.html,
                    localTemplate.text
                )
            } else {
                core.info(`Creating template ${localTemplate.basename}`)
                await ses.createTemplate(
                    localTemplate.basename,
                    localTemplate.subject,
                    localTemplate.html,
                    localTemplate.text
                )
            }
        }

        core.info('Finished')
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message)
        }
    }
}

async function findTemplates(srcDir: string): Promise<LocalTemplate[]> {
    const templates: LocalTemplate[] = []

    const files = fs.readdirSync(srcDir)
    for (const file of files) {
        if (file.endsWith('.json')) {
            const basename = file.substring(0, file.length - 5)
            templates.push(new LocalTemplate(`./templates/${basename}`))
        }
    }

    return templates
}

class LocalTemplate {
    private readonly _basename: string

    constructor(basename: string) {
        this._basename = basename
    }

    get basename(): string {
        return this._basename
    }

    get subject(): string {
        const config = fs.readFileSync(`${this._basename}.json`, 'utf8')
        const data = JSON.parse(config)
        return data.subject
    }

    get html(): string {
        return fs.readFileSync(`${this._basename}.html`, 'utf8')
    }

    get text(): string {
        return fs.readFileSync(`${this._basename}.txt`, 'utf8')
    }
}
