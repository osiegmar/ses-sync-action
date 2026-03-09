import * as core from '@actions/core'

export class Wait {
    private scopes = new Map<string, number>()

    async wait(scope: string, milliseconds: number): Promise<void> {
        const nextCall = this.scopes.get(scope)
        const currentTime = Date.now()

        if (nextCall === undefined || nextCall <= currentTime) {
            return
        }

        const timeToWait = nextCall - currentTime
        await new Promise(resolve => {
            core.info(`Waiting ${timeToWait} milliseconds in scope ${scope}`)
            setTimeout(resolve, timeToWait)
        })
    }

    track(scope: string, milliseconds: number): void {
        this.scopes.set(scope, Date.now() + milliseconds)
    }
}
