import * as core from '@actions/core'
import {SES} from './ses'
import {findTemplates} from './templates'

export async function run(): Promise<void> {
    try {
        const srcDir: string = core.getInput('dir', {required: true})

        const ses = new SES()
        const storedTemplates = await ses.listTemplates()

        core.info(`Found ${storedTemplates.length} templates in SES`)

        const localTemplates = await findTemplates(srcDir)
        core.info(`Found ${localTemplates.length} templates locally`)

        for (const localTemplate of localTemplates) {
            core.info(`Processing template ${localTemplate.basename} ("${localTemplate.subject}")`)

            if (storedTemplates.includes(localTemplate.basename)) {
                await ses.updateTemplate(localTemplate)
            } else {
                await ses.createTemplate(localTemplate)
            }
        }

        core.info('Finished')
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message)
        }
    }
}
