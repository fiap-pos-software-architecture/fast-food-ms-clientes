import { DeleteCustomerUseCase } from '../../../src/application/use-cases/delete-customer';
import { ICustomerRepository } from '../../../src/domain/ports/customer-repository';
import { Customer } from '../../../src/domain/entities/customer';
import { CustomerOperationResponse } from '../../../src/domain/entities/customer-operation-response';
import { EntityCreationError } from '../../../src/domain/exceptions/entity-creation-error';

describe('DeleteCustomerUseCase', () => {
    let mockRepository: jest.Mocked<ICustomerRepository>;
    let deleteCustomerUseCase: DeleteCustomerUseCase;

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
        deleteCustomerUseCase = new DeleteCustomerUseCase(mockRepository);
    });

    describe('execute', () => {
        it('should delete a customer by id successfully', async () => {
            const mockCustomer = Customer.create({
                id: '1',
                name: 'John Doe',
                documentNum: '12345678901',
                dateBirthday: '1990-01-01',
                email: 'john@example.com'
            });
            mockRepository.findById.mockResolvedValueOnce(mockCustomer);
            mockRepository.deleteById.mockResolvedValueOnce(true);

            const result = await deleteCustomerUseCase.execute('1');

            expect(result).toEqual(CustomerOperationResponse.success(mockCustomer));
            expect(mockRepository.findById).toHaveBeenCalledWith('1');
            expect(mockRepository.deleteById).toHaveBeenCalledWith('1');
        });

        it('should return failure response when customer is not found', async () => {
            mockRepository.findById.mockResolvedValueOnce(null);

            const result = await deleteCustomerUseCase.execute('1');

            expect(result).toEqual(CustomerOperationResponse.failure('Customer with id 1 not found'));
            expect(mockRepository.findById).toHaveBeenCalledWith('1');
            expect(mockRepository.deleteById).not.toHaveBeenCalled();
        });

        it('should return failure response when deletion fails', async () => {
            const mockCustomer = Customer.create({
                id: '1',
                name: 'John Doe',
                documentNum: '12345678901',
                dateBirthday: '1990-01-01',
                email: 'john@example.com'
            });
            mockRepository.findById.mockResolvedValueOnce(mockCustomer);
            mockRepository.deleteById.mockResolvedValueOnce(false);

            const result = await deleteCustomerUseCase.execute('1');

            expect(result).toEqual(CustomerOperationResponse.failure('Failed to delete customer with id 1'));
            expect(mockRepository.findById).toHaveBeenCalledWith('1');
            expect(mockRepository.deleteById).toHaveBeenCalledWith('1');
        });
    });

    describe('executeByCpf', () => {
        it('should delete a customer by CPF successfully', async () => {
            const mockCustomer = Customer.create({
                id: '1',
                name: 'John Doe',
                documentNum: '12345678901',
                dateBirthday: '1990-01-01',
                email: 'john@example.com'
            });
            mockRepository.findByField.mockResolvedValueOnce(mockCustomer);
            mockRepository.deleteByCPF.mockResolvedValueOnce(true);

            const result = await deleteCustomerUseCase.executeByCpf('12345678901');

            expect(result).toEqual(CustomerOperationResponse.success(mockCustomer));
            expect(mockRepository.findByField).toHaveBeenCalledWith('documentNum', '12345678901');
            expect(mockRepository.deleteByCPF).toHaveBeenCalledWith('12345678901');
        });

        it('should return failure response when customer is not found by CPF', async () => {
            mockRepository.findByField.mockResolvedValueOnce(null);

            const result = await deleteCustomerUseCase.executeByCpf('12345678901');

            expect(result).toEqual(CustomerOperationResponse.failure('Customer with CPF 12345678901 not found'));
            expect(mockRepository.findByField).toHaveBeenCalledWith('documentNum', '12345678901');
            expect(mockRepository.deleteByCPF).not.toHaveBeenCalled();
        });

        it('should return failure response when deletion by CPF fails', async () => {
            const mockCustomer = Customer.create({
                id: '1',
                name: 'John Doe',
                documentNum: '12345678901',
                dateBirthday: '1990-01-01',
                email: 'john@example.com'
            });
            mockRepository.findByField.mockResolvedValueOnce(mockCustomer);
            mockRepository.deleteByCPF.mockResolvedValueOnce(false);

            const result = await deleteCustomerUseCase.executeByCpf('12345678901');

            expect(result).toEqual(CustomerOperationResponse.failure('Failed to delete customer with CPF 12345678901'));
            expect(mockRepository.findByField).toHaveBeenCalledWith('documentNum', '12345678901');
            expect(mockRepository.deleteByCPF).toHaveBeenCalledWith('12345678901');
        });
    });

    describe('deleteMany', () => {
        it('should delete multiple customers successfully', async () => {
            const mockCustomers = [
                Customer.create({
                    id: '1',
                    name: 'John Doe',
                    documentNum: '12345678901',
                    dateBirthday: '1990-01-01',
                    email: 'john@example.com'
                }),
                Customer.create({
                    id: '2',
                    name: 'Jane Doe',
                    documentNum: '98765432109',
                    dateBirthday: '1992-05-15',
                    email: 'jane@example.com'
                })
            ];
            mockRepository.findAll.mockResolvedValueOnce(mockCustomers);
            mockRepository.findById.mockResolvedValueOnce(mockCustomers[0]).mockResolvedValueOnce(mockCustomers[1]);
            mockRepository.deleteById.mockResolvedValueOnce(true).mockResolvedValueOnce(true);

            const result = await deleteCustomerUseCase.deleteMany({});

            expect(result).toEqual(CustomerOperationResponse.success(mockCustomers));
            expect(mockRepository.findAll).toHaveBeenCalledWith({});
            expect(mockRepository.findById).toHaveBeenCalledTimes(2);
            expect(mockRepository.deleteById).toHaveBeenCalledTimes(2);
        });

        it('should handle partial deletion when some customers fail to delete', async () => {
            const mockCustomers = [
                Customer.create({
                    id: '1',
                    name: 'John Doe',
                    documentNum: '12345678901',
                    dateBirthday: '1990-01-01',
                    email: 'john@example.com'
                }),
                Customer.create({
                    id: '2',
                    name: 'Jane Doe',
                    documentNum: '98765432109',
                    dateBirthday: '1992-05-15',
                    email: 'jane@example.com'
                })
            ];
            mockRepository.findAll.mockResolvedValueOnce(mockCustomers);
            mockRepository.findById.mockResolvedValueOnce(mockCustomers[0]).mockResolvedValueOnce(mockCustomers[1]);
            mockRepository.deleteById.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

            const result = await deleteCustomerUseCase.deleteMany({});

            expect(result).toEqual(CustomerOperationResponse.success([mockCustomers[0]]));
            expect(mockRepository.findAll).toHaveBeenCalledWith({});
            expect(mockRepository.findById).toHaveBeenCalledTimes(2);
            expect(mockRepository.deleteById).toHaveBeenCalledTimes(2);
        });

        it('should return an empty array when no customers are found', async () => {
            mockRepository.findAll.mockResolvedValueOnce([]);

            const result = await deleteCustomerUseCase.deleteMany({});

            expect(result).toEqual(CustomerOperationResponse.success([]));
            expect(mockRepository.findAll).toHaveBeenCalledWith({});
            expect(mockRepository.findById).not.toHaveBeenCalled();
            expect(mockRepository.deleteById).not.toHaveBeenCalled();
        });
    });

    describe('Customer creation error handling', () => {
        it('should throw EntityCreationError for invalid customer data', () => {
            expect(() => {
                Customer.create({
                    name: '',
                    documentNum: '12345',
                    dateBirthday: '2025-01-01',
                    email: 'invalid-email'
                });
            }).toThrow(EntityCreationError);
        });
    });
});