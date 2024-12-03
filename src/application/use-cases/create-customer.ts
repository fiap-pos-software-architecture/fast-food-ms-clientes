import { Customer } from '../../domain/entities/customer'
import { CustomerOperationResponse } from '../../domain/entities/customer-operation-response'
import { ICustomerRepository } from '../../domain/ports/customer-repository'
import { EntityCreationError } from '../../domain/exceptions/entity-creation-error'

export class CreateCustomerUseCase {
    constructor(private readonly customerRepository: ICustomerRepository) { }

    async execute(params: Omit<Parameters<typeof Customer.create>[0], 'id'>): Promise<CustomerOperationResponse> {
        try {
            const existingCustomer = await this.customerRepository.findByField('documentNum', params.documentNum)
            if (existingCustomer) {
                return CustomerOperationResponse.failure(`Customer with document number ${params.documentNum} already exists`)
            }

            const existingEmail = await this.customerRepository.findByField('email', params.email)
            if (existingEmail) {
                return CustomerOperationResponse.failure(`Customer with email ${params.email} already exists`)
            }

            const customer = Customer.create(params)

            const createdCustomer = await this.customerRepository.create(customer)

            const verifiedCustomer = await this.customerRepository.findById(createdCustomer.id.toString())
            if (!verifiedCustomer) {
                return CustomerOperationResponse.failure('Customer creation failed: Unable to verify created customer')
            }

            return CustomerOperationResponse.success(createdCustomer)
        } catch (error) {
            if (error instanceof EntityCreationError) {
                return CustomerOperationResponse.failure(error.message)
            }
            if (error instanceof Error) {
                return CustomerOperationResponse.failure(`Unexpected error during customer creation: ${error.message}`)
            }
            return CustomerOperationResponse.failure('Unexpected error during customer creation')
        }
    }

    async createMany(customers: Array<Omit<Parameters<typeof Customer.create>[0], 'id'>>): Promise<CustomerOperationResponse[]> {
        const results: CustomerOperationResponse[] = []
        for (const customerData of customers) {
            const result = await this.execute(customerData)
            results.push(result)
        }
        return results
    }
}