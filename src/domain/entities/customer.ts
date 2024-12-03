import { EntityCreationError } from "../exceptions/entity-creation-error"
import crypto from 'crypto'

export class Customer {
    private constructor(
        public readonly id: string | number,
        public readonly name: string,
        public readonly documentNum: string,
        public readonly dateBirthday: Date,
        public readonly email: string
    ) { }

    static create(params: {
        id?: string | number
        name: string
        documentNum: string
        dateBirthday: string | Date
        email: string
    }): Customer {
        const { id, name, documentNum, dateBirthday, email } = params

        if (typeof name !== 'string' || typeof documentNum !== 'string' || typeof email !== 'string') {
            throw new EntityCreationError("Name, document number, and email must be strings")
        }

        if (name.trim() === "" || documentNum.trim() === "" || email.trim() === "") {
            throw new EntityCreationError("All fields must be filled")
        }

        if (documentNum.length < 11) {
            throw new EntityCreationError("Document number must be at least 11 characters long")
        }

        let dateBirthdayFormatted: Date

        if (typeof dateBirthday === 'string') {
            if (!Customer.isValidDateString(dateBirthday)) {
                throw new EntityCreationError("Invalid date format or value. Use YYYY-MM-DD and ensure it's a valid date.")
            }
            dateBirthdayFormatted = new Date(dateBirthday)
        } else if (dateBirthday instanceof Date) {
            dateBirthdayFormatted = dateBirthday
        } else {
            throw new EntityCreationError("Invalid date type")
        }

        if (isNaN(dateBirthdayFormatted.getTime()) || dateBirthdayFormatted > new Date()) {
            throw new EntityCreationError("Invalid birth date")
        }

        const generatedId = id || crypto.randomUUID()

        return new Customer(generatedId, name.trim(), documentNum.trim(), dateBirthdayFormatted, email.trim())
    }

    private static isValidDateString(dateString: string): boolean {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(dateString)) {
            return false
        }

        const [year, month, day] = dateString.split('-').map(Number)
        const date = new Date(year, month - 1, day)
        return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        )
    }
}

