import { Customer } from "../entities/customer"
import { CustomerOperationResponse } from "../entities/customer-operation-response"

export interface ICustomerRepository {
    create(customer: Customer): Promise<Customer>
    findById(id: string): Promise<Customer | null>
    findAll(query: Record<string, any>): Promise<Customer[]>
    updateById(id: string, updateData: Partial<Customer>): Promise<Customer | null>
    updateMany(query: Record<string, any>, updateData: Partial<Customer>): Promise<CustomerOperationResponse[]>
    deleteById(id: string): Promise<boolean>
    deleteByCPF(cpf: string): Promise<boolean>
    findByField(field: string, value: any): Promise<Customer | null>
    count(query: Record<string, any>): Promise<number>
    existsById(id: string): Promise<boolean>
    search(query: Record<string, any>, options?: { sort?: any; projection?: any }): Promise<Customer[]>
}