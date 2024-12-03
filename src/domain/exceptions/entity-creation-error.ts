export class EntityCreationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'EntityCreationError'

        Object.setPrototypeOf(this, EntityCreationError.prototype)
    }
}