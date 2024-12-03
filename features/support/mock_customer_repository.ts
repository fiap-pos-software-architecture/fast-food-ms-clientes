import { Customer } from "../../src/domain/entities/customer"
import { CustomerOperationResponse } from "../../src/domain/entities/customer-operation-response"
import { ICustomerRepository } from "../../src/domain/ports/customer-repository"

export class MockCustomerRepository implements ICustomerRepository {
    private customers: Customer[] = []

    clear(): void {
        this.customers = []
    }

    async create(customer: Customer): Promise<Customer> {
        this.customers.push(customer)
        return customer
    }

    async findById(id: string): Promise<Customer | null> {
        return this.customers.find(c => c.id === id) || null
    }

    async findAll(query: Record<string, any>): Promise<Customer[]> {
        return this.customers
    }

    async updateById(id: string, updateData: Partial<Customer>): Promise<Customer | null> {
        const index = this.customers.findIndex(c => c.id === id);
        if (index !== -1) {
            this.customers[index] = Customer.create({
                ...this.customers[index],
                ...updateData,
                id: this.customers[index].id
            });
            return this.customers[index];
        }
        return null;
    }

    async updateMany(query: Record<string, any>, updateData: Partial<Customer>): Promise<CustomerOperationResponse[]> {
        return this.customers.map(customer => {
            if (this.matchesQuery(customer, query)) {
                const updatedCustomer = { ...customer, ...updateData } as Customer
                return CustomerOperationResponse.success(updatedCustomer)
            }
            return CustomerOperationResponse.failure(`Customer ${customer.id} did not match query`)
        })
    }

    async deleteById(id: string): Promise<boolean> {
        const index = this.customers.findIndex(c => c.id === id)
        if (index !== -1) {
            this.customers.splice(index, 1)
            return true
        }
        return false
    }

    async deleteByCPF(cpf: string): Promise<boolean> {
        const index = this.customers.findIndex(c => c.documentNum === cpf)
        if (index !== -1) {
            this.customers.splice(index, 1)
            return true
        }
        return false
    }

    async findByField(field: string, value: any): Promise<Customer | null> {
        return this.customers.find(c => (c as any)[field] === value) || null
    }

    async count(query: Record<string, any>): Promise<number> {
        return this.customers.filter(customer => this.matchesQuery(customer, query)).length
    }

    async existsById(id: string): Promise<boolean> {
        return this.customers.some(c => c.id === id)
    }

    async search(query: Record<string, any>, options?: { sort?: any; projection?: any }): Promise<Customer[]> {
        let results = this.customers.filter(customer => this.matchesQuery(customer, query))

        if (options?.sort) {
            results = this.sortCustomers(results, options.sort)
        }

        if (options?.projection) {
            results = this.projectCustomers(results, options.projection)
        }

        return results
    }

    private matchesQuery(customer: Customer, query: Record<string, any>): boolean {
        return Object.entries(query).every(([key, value]) => (customer as any)[key] === value)
    }

    private sortCustomers(customers: Customer[], sort: any): Customer[] {
        return customers.sort((a, b) => {
            for (const [key, order] of Object.entries(sort)) {
                if ((a as any)[key] < (b as any)[key]) return order === 1 ? -1 : 1
                if ((a as any)[key] > (b as any)[key]) return order === 1 ? 1 : -1
            }
            return 0
        })
    }

    private projectCustomers(customers: Customer[], projection: any): Customer[] {
        return customers.map(customer => {
            const projectedCustomer: Partial<Customer> = {}
            for (const key of Object.keys(projection)) {
                if (projection[key]) {
                    (projectedCustomer as any)[key] = (customer as any)[key]
                }
            }
            return projectedCustomer as Customer
        })
    }
}