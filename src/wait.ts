import * as core from '@actions/core'

export class Wait {
    private scopes = new Map<string, number>()

    async wait(scope: string, milliseconds: number): Promise<void> {
        const nextCall = this.scopes.get(scope)
        const currentTime = Date.now()

        if (nextCall === undefined || nextCall <= currentTime) {
            this.scopes.set(scope, currentTime + milliseconds)
            return
        }

        const timeToWait = nextCall - currentTime
        await new Promise(resolve => {
            core.info(`Waiting ${timeToWait} milliseconds in scope ${scope}`)
            setTimeout(resolve, timeToWait)
        })
        this.scopes.set(scope, currentTime + milliseconds)
    }
}
