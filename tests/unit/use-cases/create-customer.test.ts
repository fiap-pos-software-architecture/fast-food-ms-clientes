import { CreateCustomerUseCase } from '../../../src/application/use-cases/create-customer';
import { ICustomerRepository } from '../../../src/domain/ports/customer-repository';
import { Customer } from '../../../src/domain/entities/customer';
import { CustomerOperationResponse } from '../../../src/domain/entities/customer-operation-response';

describe('CreateCustomerUseCase', () => {
    let mockRepository: jest.Mocked<ICustomerRepository>;
    let createCustomerUseCase: CreateCustomerUseCase;

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
        } as jest.Mocked<ICustomerRepository>;
        createCustomerUseCase = new CreateCustomerUseCase(mockRepository);
    });

    it('should create a customer successfully', async () => {
        const customerData = {
            name: 'John Doe',
            documentNum: '12345678901',
            dateBirthday: new Date('1990-01-01'),
            email: 'john@example.com',
        };

        const createdCustomer = Customer.create({ id: '1', ...customerData });

        mockRepository.findByField.mockResolvedValueOnce(null);
        mockRepository.create.mockResolvedValueOnce(createdCustomer);
        mockRepository.findById.mockResolvedValueOnce(createdCustomer);

        const result = await createCustomerUseCase.execute(customerData);

        expect(result).toBeInstanceOf(CustomerOperationResponse);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(createdCustomer);
        expect(result.error).toBeNull();
    });

    it('should fail to create a customer with existing document number', async () => {
        const customerData = {
            name: 'John Doe',
            documentNum: '12345678901',
            dateBirthday: new Date('1990-01-01'),
            email: 'john@example.com',
        };

        mockRepository.findByField.mockResolvedValueOnce(Customer.create({ id: '2', ...customerData }));

        const result = await createCustomerUseCase.execute(customerData);

        expect(result).toBeInstanceOf(CustomerOperationResponse);
        expect(result.success).toBe(false);
        expect(result.data).toBeNull();
        expect(result.error).toBe('Customer with document number 12345678901 already exists');
    });

    it('should fail to create a customer with existing email', async () => {
        const customerData = {
            name: 'John Doe',
            documentNum: '12345678901',
            dateBirthday: new Date('1990-01-01'),
            email: 'john@example.com',
        };

        mockRepository.findByField.mockResolvedValueOnce(null).mockResolvedValueOnce(Customer.create({ id: '2', ...customerData }));

        const result = await createCustomerUseCase.execute(customerData);

        expect(result).toBeInstanceOf(CustomerOperationResponse);
        expect(result.success).toBe(false);
        expect(result.data).toBeNull();
        expect(result.error).toBe('Customer with email john@example.com already exists');
    });
});