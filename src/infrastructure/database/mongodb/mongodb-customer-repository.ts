import { Model } from 'mongoose'
import { Customer } from '../../../domain/entities/customer'
import { ICustomerRepository } from '../../../domain/ports/customer-repository'
import { CustomerDocument } from './models/customer-model'
import { CustomerOperationResponse } from '../../../domain/entities/customer-operation-response'

export class MongoDBCustomerRepository implements ICustomerRepository {
    constructor(private readonly customerModel: Model<CustomerDocument>) { }

    async create(customer: Customer): Promise<Customer> {
        const createdCustomer = await this.customerModel.create(customer)
        return this.mapToCustomer(createdCustomer)
    }

    async findById(id: string): Promise<Customer | null> {
        const customer = await this.customerModel.findById(id)
        return customer ? this.mapToCustomer(customer) : null
    }

    async findAll(query: Record<string, any>): Promise<Customer[]> {
        const customers = await this.customerModel.find(query)
        return customers.map(this.mapToCustomer)
    }

    async updateById(id: string, updateData: Partial<Customer>): Promise<Customer | null> {
        const updatedCustomer = await this.customerModel.findByIdAndUpdate(id, updateData, { new: true })
        return updatedCustomer ? this.mapToCustomer(updatedCustomer) : null
    }

    async updateMany(query: Record<string, any>, updateData: Partial<Customer>): Promise<CustomerOperationResponse[]> {
        await this.customerModel.updateMany(query, updateData)
        const updatedCustomers = await this.customerModel.find(query)
        return updatedCustomers.map(customerDoc => {
            const customer = this.mapToCustomer(customerDoc)
            return CustomerOperationResponse.success(customer)
        })
    }

    async deleteById(id: string): Promise<boolean> {
        const result = await this.customerModel.findByIdAndDelete(id)
        return !!result
    }

    async deleteByCPF(cpf: string): Promise<boolean> {
        const result = await this.customerModel.findOneAndDelete({ documentNum: cpf })
        return !!result
    }

    async findByField(field: string, value: any): Promise<Customer | null> {
        const customer = await this.customerModel.findOne({ [field]: value })
        return customer ? this.mapToCustomer(customer) : null
    }

    async count(query: Record<string, any>): Promise<number> {
        return this.customerModel.countDocuments(query)
    }

    async existsById(id: string): Promise<boolean> {
        const count = await this.customerModel.countDocuments({ _id: id })
        return count > 0
    }

    async search(query: Record<string, any>, options?: { sort?: any, projection?: any }): Promise<Customer[]> {
        let findQuery = this.customerModel.find(query)

        if (options?.sort) {
            findQuery = findQuery.sort(options.sort)
        }

        if (options?.projection) {
            findQuery = findQuery.select(options.projection)
        }

        const customers = await findQuery.exec()
        return customers.map(this.mapToCustomer)
    }

    private mapToCustomer(customerDoc: CustomerDocument): Customer {
        return Customer.create({
            id: `${customerDoc._id}`,
            name: customerDoc.name,
            documentNum: customerDoc.documentNum,
            dateBirthday: customerDoc.dateBirthday,
            email: customerDoc.email
        })
    }
}