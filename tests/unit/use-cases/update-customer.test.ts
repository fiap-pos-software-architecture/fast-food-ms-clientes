import { UpdateCustomerUseCase } from '../../../src/application/use-cases/update-customer';
import { ICustomerRepository } from '../../../src/domain/ports/customer-repository';
import { Customer } from '../../../src/domain/entities/customer';
import { EntityCreationError } from '../../../src/domain/exceptions/entity-creation-error';

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
        } as jest.Mocked<ICustomerRepository>;
        updateCustomerUseCase = new UpdateCustomerUseCase(mockRepository);
    });

    describe('execute', () => {
        const existingCustomer = Customer.create({
            id: '1',
            name: 'John Doe',
            documentNum: '12345678901',
            dateBirthday: new Date('1990-01-01'),
            email: 'john@example.com',
        });

        it('should update a customer successfully', async () => {
            const updateData = {
                name: 'John Updated',
                email: 'john.updated@example.com',
            };

            const updatedCustomer = Customer.create({ ...existingCustomer, ...updateData });

            mockRepository.findById.mockResolvedValueOnce(existingCustomer);
            mockRepository.findByField.mockResolvedValueOnce(null);
            mockRepository.updateById.mockResolvedValueOnce(updatedCustomer);

            const result = await updateCustomerUseCase.execute('1', updateData);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(updatedCustomer);
            expect(result.error).toBeNull();
        });

        it('should fail to update a non-existent customer', async () => {
            mockRepository.findById.mockResolvedValueOnce(null);

            const result = await updateCustomerUseCase.execute('1', { name: 'John Updated' });

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Customer with id 1 not found');
        });

        it('should fail to update a customer with an existing email', async () => {
            mockRepository.findById.mockResolvedValueOnce(existingCustomer);
            mockRepository.findByField.mockResolvedValueOnce(Customer.create({
                id: '2',
                name: 'Jane Doe',
                documentNum: '98765432109',
                dateBirthday: new Date('1992-05-15'),
                email: 'jane@example.com',
            }));

            const result = await updateCustomerUseCase.execute('1', { email: 'jane@example.com' });

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Email jane@example.com is already in use');
        });

        it('should fail to update a customer with an existing document number', async () => {
            mockRepository.findById.mockResolvedValueOnce(existingCustomer);
            mockRepository.findByField.mockResolvedValueOnce(Customer.create({
                id: '2',
                name: 'Jane Doe',
                documentNum: '98765432109',
                dateBirthday: new Date('1992-05-15'),
                email: 'jane@example.com',
            }));

            const result = await updateCustomerUseCase.execute('1', { documentNum: '98765432109' });

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Document number 98765432109 is already in use');
        });

        it('should handle EntityCreationError during update', async () => {
            mockRepository.findById.mockResolvedValueOnce(existingCustomer);
            mockRepository.findByField.mockResolvedValueOnce(null);
            mockRepository.updateById.mockRejectedValueOnce(new EntityCreationError('Invalid customer data'));

            const result = await updateCustomerUseCase.execute('1', { name: 'John Updated' });

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Invalid customer data');
        });

        it('should handle generic Error during update', async () => {
            mockRepository.findById.mockResolvedValueOnce(existingCustomer);
            mockRepository.findByField.mockResolvedValueOnce(null);
            mockRepository.updateById.mockRejectedValueOnce(new Error('Database error'));

            const result = await updateCustomerUseCase.execute('1', { name: 'John Updated' });

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Unexpected error during customer update: Database error');
        });

        it('should handle unknown error during update', async () => {
            mockRepository.findById.mockResolvedValueOnce(existingCustomer);
            mockRepository.findByField.mockResolvedValueOnce(null);
            mockRepository.updateById.mockRejectedValueOnce('Unknown error');

            const result = await updateCustomerUseCase.execute('1', { name: 'John Updated' });

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Unexpected error during customer update');
        });

        it('should handle failed update with null response', async () => {
            mockRepository.findById.mockResolvedValueOnce(existingCustomer);
            mockRepository.findByField.mockResolvedValueOnce(null);
            mockRepository.updateById.mockResolvedValueOnce(null);

            const result = await updateCustomerUseCase.execute('1', { name: 'John Updated' });

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Failed to update customer');
        });
    });

    describe('updateMany', () => {
        it('should update multiple customers successfully', async () => {
            const customers = [
                Customer.create({
                    id: '1',
                    name: 'John Doe',
                    documentNum: '12345678901',
                    dateBirthday: new Date('1990-01-01'),
                    email: 'john@example.com',
                }),
                Customer.create({
                    id: '2',
                    name: 'Jane Doe',
                    documentNum: '98765432109',
                    dateBirthday: new Date('1992-05-15'),
                    email: 'jane@example.com',
                }),
            ];

            mockRepository.findAll.mockResolvedValueOnce(customers);

            // Mock successful update for first customer
            mockRepository.findById.mockResolvedValueOnce(customers[0]);
            mockRepository.findByField.mockResolvedValueOnce(null);
            mockRepository.updateById.mockResolvedValueOnce(Customer.create({
                ...customers[0],
                name: 'Updated Name',
            }));

            // Mock successful update for second customer
            mockRepository.findById.mockResolvedValueOnce(customers[1]);
            mockRepository.findByField.mockResolvedValueOnce(null);
            mockRepository.updateById.mockResolvedValueOnce(Customer.create({
                ...customers[1],
                name: 'Updated Name',
            }));

            const results = await updateCustomerUseCase.updateMany({}, { name: 'Updated Name' });

            expect(results).toHaveLength(2);
            expect(results[0].success).toBe(true);
            expect(results[1].success).toBe(true);
            expect(mockRepository.findAll).toHaveBeenCalledWith({});
        });

        it('should handle mixed success and failure in updateMany', async () => {
            const customers = [
                Customer.create({
                    id: '1',
                    name: 'John Doe',
                    documentNum: '12345678901',
                    dateBirthday: new Date('1990-01-01'),
                    email: 'john@example.com',
                }),
                Customer.create({
                    id: '2',
                    name: 'Jane Doe',
                    documentNum: '98765432109',
                    dateBirthday: new Date('1992-05-15'),
                    email: 'jane@example.com',
                }),
            ];

            mockRepository.findAll.mockResolvedValueOnce(customers);

            // Mock successful update for first customer
            mockRepository.findById.mockResolvedValueOnce(customers[0]);
            mockRepository.findByField.mockResolvedValueOnce(null);
            mockRepository.updateById.mockResolvedValueOnce(Customer.create({
                ...customers[0],
                name: 'Updated Name',
            }));

            // Mock failed update for second customer
            mockRepository.findById.mockResolvedValueOnce(customers[1]);
            mockRepository.updateById.mockResolvedValueOnce(null);

            const results = await updateCustomerUseCase.updateMany({}, { name: 'Updated Name' });

            expect(results).toHaveLength(2);
            expect(results[0].success).toBe(true);
            expect(results[1].success).toBe(false);
        });
    });
});