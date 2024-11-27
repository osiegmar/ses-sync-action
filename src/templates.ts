import fs from 'node:fs'

export async function findTemplates(srcDir: string): Promise<LocalTemplate[]> {
    const templates: LocalTemplate[] = []

    const files = fs.readdirSync(srcDir)
    for (const file of files) {
        if (file.endsWith('.json')) {
            const basename = file.substring(0, file.length - 5)
            templates.push(new LocalTemplate(srcDir, basename))
        }
    }

    return templates
}

export class LocalTemplate {
    private readonly _path: string
    private readonly _basename: string

    constructor(path: string, basename: string) {
        this._path = path
        this._basename = basename
    }

    get basename(): string {
        return this._basename
    }

    get subject(): string {
        const config = fs.readFileSync(`${this._path}/${this._basename}.json`, 'utf8')
        const data = JSON.parse(config)
        return data.subject
    }

    get html(): string {
        return fs.readFileSync(`${this._path}/${this._basename}.html`, 'utf8')
    }

    get text(): string {
        return fs.readFileSync(`${this._path}/${this._basename}.txt`, 'utf8')
    }
}
