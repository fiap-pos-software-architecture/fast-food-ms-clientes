import { Customer } from '../../domain/entities/customer'
import { CustomerOperationResponse } from '../../domain/entities/customer-operation-response'
import { ICustomerRepository } from '../../domain/ports/customer-repository'
import { EntityCreationError } from '../../domain/exceptions/entity-creation-error'

export class UpdateCustomerUseCase {
    constructor(private readonly customerRepository: ICustomerRepository) { }

    async execute(id: string, customerData: Partial<Customer>): Promise<CustomerOperationResponse> {
        try {
            const existingCustomer = await this.customerRepository.findById(id)
            if (!existingCustomer) {
                return CustomerOperationResponse.failure(`Customer with id ${id} not found`)
            }

            if (customerData.email && customerData.email !== existingCustomer.email) {
                const customerWithEmail = await this.customerRepository.findByField('email', customerData.email)
                if (customerWithEmail) {
                    return CustomerOperationResponse.failure(`Email ${customerData.email} is already in use`)
                }
            }

            if (customerData.documentNum && customerData.documentNum !== existingCustomer.documentNum) {
                const customerWithDocNum = await this.customerRepository.findByField('documentNum', customerData.documentNum)
                if (customerWithDocNum) {
                    return CustomerOperationResponse.failure(`Document number ${customerData.documentNum} is already in use`)
                }
            }

            const updatedCustomer = await this.customerRepository.updateById(id, customerData)
            if (!updatedCustomer) {
                return CustomerOperationResponse.failure('Failed to update customer')
            }

            return CustomerOperationResponse.success(updatedCustomer)
        } catch (error) {
            if (error instanceof EntityCreationError) {
                return CustomerOperationResponse.failure(error.message)
            }
            if (error instanceof Error) {
                return CustomerOperationResponse.failure(`Unexpected error during customer update: ${error.message}`)
            }
            return CustomerOperationResponse.failure('Unexpected error during customer update')
        }
    }

    async updateMany(query: Record<string, any>, updateData: Partial<Customer>): Promise<CustomerOperationResponse[]> {
        const customers = await this.customerRepository.findAll(query)
        const results: CustomerOperationResponse[] = []

        for (const customer of customers) {
            const result = await this.execute(customer.id.toString(), updateData)
            results.push(result)
        }

        return results
    }
}