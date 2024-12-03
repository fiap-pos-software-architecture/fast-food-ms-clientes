import { ICustomerRepository } from '../../domain/ports/customer-repository'
import { CustomerOperationResponse } from '../../domain/entities/customer-operation-response'
import { Customer } from '../../domain/entities/customer'

export class DeleteCustomerUseCase {
    constructor(private readonly customerRepository: ICustomerRepository) { }

    async execute(id: string): Promise<CustomerOperationResponse> {
        return this.deleteCustomer(
            () => this.customerRepository.deleteById(id),
            () => this.customerRepository.findById(id),
            'id',
            id
        )
    }

    async executeByCpf(cpf: string): Promise<CustomerOperationResponse> {
        return this.deleteCustomer(
            () => this.customerRepository.deleteByCPF(cpf),
            () => this.customerRepository.findByField('documentNum', cpf),
            'CPF',
            cpf
        )
    }

    async deleteMany(query: Record<string, any>): Promise<CustomerOperationResponse> {
        const customersToDelete = await this.customerRepository.findAll(query)
        const deletionResults = await Promise.all(
            customersToDelete.map(customer => this.execute(customer.id.toString()))
        )
        const deletedCustomers = deletionResults
            .filter(result => result.success)
            .map(result => result.data as Customer)
        return CustomerOperationResponse.success(deletedCustomers)
    }

    private async deleteCustomer(
        deleteOperation: () => Promise<boolean>,
        findOperation: () => Promise<Customer | null>,
        identifierType: string,
        identifierValue: string
    ): Promise<CustomerOperationResponse> {
        const customer = await findOperation()
        if (!customer) {
            return this.customerNotFoundResponse(identifierType, identifierValue)
        }

        const isDeleted = await deleteOperation()
        return isDeleted
            ? this.successfulDeletionResponse(customer)
            : this.failedDeletionResponse(identifierType, identifierValue)
    }

    private customerNotFoundResponse(identifierType: string, identifierValue: string): CustomerOperationResponse {
        return CustomerOperationResponse.failure(`Customer with ${identifierType} ${identifierValue} not found`)
    }

    private successfulDeletionResponse(customer: Customer): CustomerOperationResponse {
        return CustomerOperationResponse.success(customer)
    }

    private failedDeletionResponse(identifierType: string, identifierValue: string): CustomerOperationResponse {
        return CustomerOperationResponse.failure(`Failed to delete customer with ${identifierType} ${identifierValue}`)
    }
}