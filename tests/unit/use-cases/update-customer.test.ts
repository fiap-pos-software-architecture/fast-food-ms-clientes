import { UpdateCustomerUseCase } from '../../../src/application/use-cases/update-customer';
import { ICustomerRepository } from '../../../src/domain/ports/customer-repository';
import { Customer } from '../../../src/domain/entities/customer';
import { CustomerOperationResponse } from '../../../src/domain/entities/customer-operation-response';

describe('UpdateCustomerUseCase', () => {
    let mockRepository: jest.Mocked<ICustomerRepository>;
    let updateCustomerUseCase: UpdateCustomerUseCase;

    beforeEach(() => {
        mockRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            findByField: jest.fn(),
            updateById: jest.fn(),
            updateMany: jest.fn(),
            deleteById: jest.fn(),
            deleteByCPF: jest.fn(),
            findAll: jest.fn(),
            count: jest.fn(),
            existsById: jest.fn(),
            search: jest.fn(),
        } as jest.Mocked<ICustomerRepository>
        updateCustomerUseCase = new UpdateCustomerUseCase(mockRepository);
    });

    it('should update a customer successfully', async () => {
        const existingCustomer = Customer.create({
            id: '1',
            name: 'John Doe',
            documentNum: '12345678901',
            dateBirthday: new Date('1990-01-01'),
            email: 'john@example.com',
        });

        const updateData = {
            name: 'John Updated',
            email: 'john.updated@example.com',
        };

        const updatedCustomer = Customer.create({ ...existingCustomer, ...updateData });

        mockRepository.findById.mockResolvedValueOnce(existingCustomer);
        mockRepository.findByField.mockResolvedValueOnce(null);
        mockRepository.updateById.mockResolvedValueOnce(updatedCustomer);

        const result = await updateCustomerUseCase.execute('1', updateData);

        expect(result).toBeInstanceOf(CustomerOperationResponse);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(updatedCustomer);
        expect(result.error).toBeNull();
    });

    it('should fail to update a non-existent customer', async () => {
        mockRepository.findById.mockResolvedValueOnce(null);

        const result = await updateCustomerUseCase.execute('1', { name: 'John Updated' });

        expect(result).toBeInstanceOf(CustomerOperationResponse);
        expect(result.success).toBe(false);
        expect(result.data).toBeNull();
        expect(result.error).toBe('Customer with id 1 not found');
    });

    it('should fail to update a customer with an existing email', async () => {
        const existingCustomer = Customer.create({
            id: '1',
            name: 'John Doe',
            documentNum: '12345678901',
            dateBirthday: new Date('1990-01-01'),
            email: 'john@example.com',
        });

        mockRepository.findById.mockResolvedValueOnce(existingCustomer);
        mockRepository.findByField.mockResolvedValueOnce(Customer.create({
            id: '2',
            name: 'Jane Doe',
            documentNum: '98765432109',
            dateBirthday: new Date('1992-05-15'),
            email: 'jane@example.com',
        }));

        const result = await updateCustomerUseCase.execute('1', { email: 'jane@example.com' });

        expect(result).toBeInstanceOf(CustomerOperationResponse);
        expect(result.success).toBe(false);
        expect(result.data).toBeNull();
        expect(result.error).toBe('Email jane@example.com is already in use');
    });
});