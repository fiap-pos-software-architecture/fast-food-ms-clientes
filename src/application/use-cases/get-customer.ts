import { CustomerOperationResponse } from '../../domain/entities/customer-operation-response'
import { ICustomerRepository } from '../../domain/ports/customer-repository'

export class GetCustomerUseCase {
    constructor(private readonly customerRepository: ICustomerRepository) { }

    async execute(id: string): Promise<CustomerOperationResponse> {
        try {
            const customer = await this.customerRepository.findById(id)
            return customer
                ? CustomerOperationResponse.success(customer)
                : CustomerOperationResponse.failure('Customer not found')
        } catch (error: unknown) {
            return CustomerOperationResponse.failure(`Error fetching customer: ${this.getErrorMessage(error)}`)
        }
    }

    async findAll(query: Record<string, any>): Promise<CustomerOperationResponse> {
        try {
            const customers = await this.customerRepository.findAll(query)
            return CustomerOperationResponse.success(customers)
        } catch (error: unknown) {
            return CustomerOperationResponse.failure(`Error fetching customers: ${this.getErrorMessage(error)}`)
        }
    }

    async findByField(field: string, value: any): Promise<CustomerOperationResponse> {
        try {
            const customer = await this.customerRepository.findByField(field, value)
            return customer
                ? CustomerOperationResponse.success(customer)
                : CustomerOperationResponse.failure(`Customer not found with ${field}: ${value}`)
        } catch (error: unknown) {
            return CustomerOperationResponse.failure(`Error fetching customer by field: ${this.getErrorMessage(error)}`)
        }
    }

    async count(query: Record<string, any>): Promise<CustomerOperationResponse> {
        try {
            const count = await this.customerRepository.count(query)
            return CustomerOperationResponse.success(count)
        } catch (error: unknown) {
            return CustomerOperationResponse.failure(`Error counting customers: ${this.getErrorMessage(error)}`)
        }
    }

    async existsById(id: string): Promise<CustomerOperationResponse> {
        try {
            const exists = await this.customerRepository.existsById(id)
            return CustomerOperationResponse.success(exists)
        } catch (error: unknown) {
            return CustomerOperationResponse.failure(`Error checking customer existence: ${this.getErrorMessage(error)}`)
        }
    }

    async search(query: Record<string, any>, options?: { sort?: any; projection?: any }): Promise<CustomerOperationResponse> {
        try {
            const customers = await this.customerRepository.search(query, options)
            return CustomerOperationResponse.success(customers)
        } catch (error: unknown) {
            return CustomerOperationResponse.failure(`Error searching customers: ${this.getErrorMessage(error)}`)
        }
    }

    private getErrorMessage(error: unknown): string {
        if (error instanceof Error) return error.message;
        return String(error);
    }
}

