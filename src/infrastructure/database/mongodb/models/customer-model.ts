import mongoose, { Schema, Document } from 'mongoose'

export interface CustomerDocument extends Document {
    name: string
    documentNum: string
    dateBirthday: Date
    email: string
}

const CustomerSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    documentNum: {
        type: String,
        required: [true, 'Document number is required'],
        trim: true,
        validate: {
            validator: function (v: string) {
                return v.length >= 11
            },
            message: (props: { value: any }) => `${props.value} is not a valid document number. It must be at least 11 characters long.`
        }
    },
    dateBirthday: {
        type: Date,
        required: [true, 'Date of birth is required'],
        validate: {
            validator: function (v: Date) {
                return v <= new Date()
            },
            message: (props: { value: any }) => `${props.value} is not a valid birth date. It cannot be in the future.`
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v: string) {
                return /^\S+@\S+\.\S+$/.test(v)
            },
            message: (props: { value: any }) => `${props.value} is not a valid email address.`
        }
    }
})

export const CustomerModel = mongoose.model<CustomerDocument>('Customer', CustomerSchema)