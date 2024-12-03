import { GetCustomerUseCase } from '../../../src/application/use-cases/get-customer';
import { ICustomerRepository } from '../../../src/domain/ports/customer-repository';
import { Customer } from '../../../src/domain/entities/customer';

describe('GetCustomerUseCase', () => {
    let mockRepository: jest.Mocked<ICustomerRepository>;
    let getCustomerUseCase: GetCustomerUseCase;

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
        getCustomerUseCase = new GetCustomerUseCase(mockRepository);
    });

    describe('execute', () => {
        it('should get a customer by id', async () => {
            const customer = Customer.create({
                id: '1',
                name: 'John Doe',
                documentNum: '12345678901',
                dateBirthday: new Date('1990-01-01'),
                email: 'john@example.com',
            });

            mockRepository.findById.mockResolvedValueOnce(customer);

            const result = await getCustomerUseCase.execute('1');

            expect(result.success).toBe(true);
            expect(result.data).toEqual(customer);
            expect(result.error).toBeNull();
        });

        it('should return failure response for non-existent customer', async () => {
            mockRepository.findById.mockResolvedValueOnce(null);

            const result = await getCustomerUseCase.execute('1');

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Customer not found');
        });

        it('should handle errors', async () => {
            mockRepository.findById.mockRejectedValueOnce(new Error('Database error'));

            const result = await getCustomerUseCase.execute('1');

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Error fetching customer: Database error');
        });
    });

    describe('findAll', () => {
        it('should find all customers', async () => {
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

            const result = await getCustomerUseCase.findAll({});

            expect(result.success).toBe(true);
            expect(result.data).toEqual(customers);
            expect(result.error).toBeNull();
        });

        it('should handle errors in findAll', async () => {
            mockRepository.findAll.mockRejectedValueOnce(new Error('Database error'));

            const result = await getCustomerUseCase.findAll({});

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Error fetching customers: Database error');
        });
    });

    describe('findByField', () => {
        it('should find a customer by field', async () => {
            const customer = Customer.create({
                id: '1',
                name: 'John Doe',
                documentNum: '12345678901',
                dateBirthday: new Date('1990-01-01'),
                email: 'john@example.com',
            });

            mockRepository.findByField.mockResolvedValueOnce(customer);

            const result = await getCustomerUseCase.findByField('email', 'john@example.com');

            expect(result.success).toBe(true);
            expect(result.data).toEqual(customer);
            expect(result.error).toBeNull();
        });

        it('should return failure response when customer not found by field', async () => {
            mockRepository.findByField.mockResolvedValueOnce(null);

            const result = await getCustomerUseCase.findByField('email', 'nonexistent@example.com');

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Customer not found with email: nonexistent@example.com');
        });
    });

    describe('count', () => {
        it('should count customers', async () => {
            mockRepository.count.mockResolvedValueOnce(2);

            const result = await getCustomerUseCase.count({});

            expect(result.success).toBe(true);
            expect(result.data).toBe(2);
            expect(result.error).toBeNull();
        });

        it('should handle errors in count', async () => {
            mockRepository.count.mockRejectedValueOnce(new Error('Database error'));

            const result = await getCustomerUseCase.count({});

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Error counting customers: Database error');
        });
    });

    describe('existsById', () => {
        it('should check if customer exists by id', async () => {
            mockRepository.existsById.mockResolvedValueOnce(true);

            const result = await getCustomerUseCase.existsById('1');

            expect(result.success).toBe(true);
            expect(result.data).toBe(true);
            expect(result.error).toBeNull();
        });

        it('should handle errors in existsById', async () => {
            mockRepository.existsById.mockRejectedValueOnce(new Error('Database error'));

            const result = await getCustomerUseCase.existsById('1');

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Error checking customer existence: Database error');
        });
    });

    describe('search', () => {
        it('should search customers', async () => {
            const customers = [
                Customer.create({
                    id: '1',
                    name: 'John Doe',
                    documentNum: '12345678901',
                    dateBirthday: new Date('1990-01-01'),
                    email: 'john@example.com',
                }),
            ];

            mockRepository.search.mockResolvedValueOnce(customers);

            const result = await getCustomerUseCase.search({ name: 'John' });

            expect(result.success).toBe(true);
            expect(result.data).toEqual(customers);
            expect(result.error).toBeNull();
        });

        it('should handle errors in search', async () => {
            mockRepository.search.mockRejectedValueOnce(new Error('Database error'));

            const result = await getCustomerUseCase.search({ name: 'John' });

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Error searching customers: Database error');
        });
    });
});