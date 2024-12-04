import { CreateCustomerUseCase } from '../../../src/application/use-cases/create-customer';
import { ICustomerRepository } from '../../../src/domain/ports/customer-repository';
import { Customer } from '../../../src/domain/entities/customer';
import { CustomerOperationResponse } from '../../../src/domain/entities/customer-operation-response';
import { EntityCreationError } from '../../../src/domain/exceptions/entity-creation-error';

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

    describe('execute', () => {
        const customerData = {
            name: 'John Doe',
            documentNum: '12345678901',
            dateBirthday: new Date('1990-01-01'),
            email: 'john@example.com',
        };

        it('should create a customer successfully', async () => {
            const createdCustomer = Customer.create({ id: '1', ...customerData });

            mockRepository.findByField.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
            mockRepository.create.mockResolvedValueOnce(createdCustomer);
            mockRepository.findById.mockResolvedValueOnce(createdCustomer);

            const result = await createCustomerUseCase.execute(customerData);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(createdCustomer);
            expect(result.error).toBeNull();
        });

        it('should fail to create a customer with existing document number', async () => {
            mockRepository.findByField.mockResolvedValueOnce(Customer.create({ id: '2', ...customerData }));

            const result = await createCustomerUseCase.execute(customerData);

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Customer with document number 12345678901 already exists');
        });

        it('should fail to create a customer with existing email', async () => {
            mockRepository.findByField.mockResolvedValueOnce(null).mockResolvedValueOnce(Customer.create({ id: '2', ...customerData }));

            const result = await createCustomerUseCase.execute(customerData);

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Customer with email john@example.com already exists');
        });

        it('should fail when customer creation fails', async () => {
            mockRepository.findByField.mockResolvedValue(null);
            mockRepository.create.mockResolvedValueOnce(Customer.create({ id: '1', ...customerData }));
            mockRepository.findById.mockResolvedValueOnce(null);

            const result = await createCustomerUseCase.execute(customerData);

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Customer creation failed: Unable to verify created customer');
        });

        it('should handle EntityCreationError', async () => {
            mockRepository.findByField.mockResolvedValue(null);
            mockRepository.create.mockRejectedValue(new EntityCreationError('Invalid customer data'));

            const result = await createCustomerUseCase.execute(customerData);

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Invalid customer data');
        });

        it('should handle generic Error', async () => {
            mockRepository.findByField.mockResolvedValue(null);
            mockRepository.create.mockRejectedValue(new Error('Database error'));

            const result = await createCustomerUseCase.execute(customerData);

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Unexpected error during customer creation: Database error');
        });

        it('should handle unknown error', async () => {
            mockRepository.findByField.mockResolvedValue(null);
            mockRepository.create.mockRejectedValue('Unknown error');

            const result = await createCustomerUseCase.execute(customerData);

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Unexpected error during customer creation');
        });
    });

    describe('createMany', () => {
        const customersData = [
            {
                name: 'John Doe',
                documentNum: '12345678901',
                dateBirthday: new Date('1990-01-01'),
                email: 'john@example.com',
            },
            {
                name: 'Jane Doe',
                documentNum: '98765432109',
                dateBirthday: new Date('1992-05-15'),
                email: 'jane@example.com',
            },
        ];

        it('should handle mixed success and failure in createMany', async () => {
            mockRepository.findByField.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
            mockRepository.create.mockResolvedValueOnce(Customer.create({ id: '1', ...customersData[0] }));
            mockRepository.findById.mockResolvedValueOnce(Customer.create({ id: '1', ...customersData[0] }));
            mockRepository.findByField.mockResolvedValueOnce(Customer.create({ id: '2', ...customersData[1] }));

            const results = await createCustomerUseCase.createMany(customersData);

            expect(results).toHaveLength(2);
            expect(results[0].success).toBe(true);
            expect(results[1].success).toBe(false);
            expect(results[1].error).toBe('Customer with document number 98765432109 already exists');
        });
    });
});