import { Request, Response } from 'express';
import { CustomerController } from '../../../src/infrastructure/adapters/controllers/customer-controller';
import { CreateCustomerUseCase } from '../../../src/application/use-cases/create-customer';
import { UpdateCustomerUseCase } from '../../../src/application/use-cases/update-customer';
import { GetCustomerUseCase } from '../../../src/application/use-cases/get-customer';
import { DeleteCustomerUseCase } from '../../../src/application/use-cases/delete-customer';
import { Customer } from '../../../src/domain/entities/customer';
import { CustomerOperationResponse } from '../../../src/domain/entities/customer-operation-response';

describe('CustomerController', () => {
    let mockCreateCustomerUseCase: jest.Mocked<CreateCustomerUseCase>;
    let mockUpdateCustomerUseCase: jest.Mocked<UpdateCustomerUseCase>;
    let mockGetCustomerUseCase: jest.Mocked<GetCustomerUseCase>;
    let mockDeleteCustomerUseCase: jest.Mocked<DeleteCustomerUseCase>;
    let customerController: CustomerController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        mockCreateCustomerUseCase = {
            execute: jest.fn(),
            createMany: jest.fn(),
        } as any;
        mockUpdateCustomerUseCase = {
            execute: jest.fn(),
            updateMany: jest.fn(),
        } as any;
        mockGetCustomerUseCase = {
            execute: jest.fn(),
            findAll: jest.fn(),
            search: jest.fn(),
            count: jest.fn(),
            existsById: jest.fn(),
        } as any;
        mockDeleteCustomerUseCase = {
            execute: jest.fn(),
            executeByCpf: jest.fn(),
        } as any;

        customerController = new CustomerController(
            mockCreateCustomerUseCase,
            mockUpdateCustomerUseCase,
            mockGetCustomerUseCase,
            mockDeleteCustomerUseCase
        );

        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };
    });

    describe('createCustomer', () => {
        it('should create a customer successfully', async () => {
            const customerData = {
                name: 'John Doe',
                documentNum: '12345678901',
                dateBirthday: new Date('1990-01-01'),
                email: 'john@example.com',
            };
            const createdCustomer = Customer.create({ id: '1', ...customerData });
            mockCreateCustomerUseCase.execute.mockResolvedValue(CustomerOperationResponse.success(createdCustomer));

            mockRequest.body = customerData;
            await customerController.createCustomer(mockRequest as Request, mockResponse as Response);

            expect(mockCreateCustomerUseCase.execute).toHaveBeenCalledWith(customerData);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: createdCustomer,
                error: null
            }));
        });

        it('should handle customer creation failure', async () => {
            mockCreateCustomerUseCase.execute.mockResolvedValue(CustomerOperationResponse.failure('Creation failed'));

            mockRequest.body = {};
            await customerController.createCustomer(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                error: 'Creation failed',
            }));
        });

        it('should handle internal server error', async () => {
            mockCreateCustomerUseCase.execute.mockRejectedValue(new Error('Internal error'));

            mockRequest.body = {};
            await customerController.createCustomer(mockRequest as Request, mockResponse as Response);
         
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: 'Internal server error',
            });
        });
    });

    describe('createManyCustomers', () => {
        it('should create multiple customers successfully', async () => {
            const customersData = [
                { name: 'John Doe', documentNum: '12345678901', dateBirthday: new Date('1990-01-01'), email: 'john@example.com' },
                { name: 'Jane Doe', documentNum: '98765432109', dateBirthday: new Date('1992-05-15'), email: 'jane@example.com' },
            ];
            const createdCustomers = customersData.map((data, index) => Customer.create({ id: `${index + 1}`, ...data }));
            mockCreateCustomerUseCase.createMany.mockResolvedValue(createdCustomers.map(customer => CustomerOperationResponse.success(customer)));

            mockRequest.body = customersData;
            await customerController.createManyCustomers(mockRequest as Request, mockResponse as Response);

            expect(mockCreateCustomerUseCase.createMany).toHaveBeenCalledWith(customersData);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ success: true, data: expect.any(Object), error: null }),
                expect.objectContaining({ success: true, data: expect.any(Object), error: null }),
            ]));
        });

        it('should handle internal server error', async () => {
            mockCreateCustomerUseCase.createMany.mockRejectedValue(new Error('Internal error'));

            mockRequest.body = [];
            await customerController.createManyCustomers(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: 'Internal server error',
            });
        });
    });

    describe('updateCustomer', () => {
        it('should update a customer successfully', async () => {
            const customerId = '1';
            const updateData = { name: 'John Updated' };
            const updatedCustomer = Customer.create({ id: customerId, ...updateData, documentNum: '12345678901', dateBirthday: new Date('1990-01-01'), email: 'john@example.com' });
            mockUpdateCustomerUseCase.execute.mockResolvedValue(CustomerOperationResponse.success(updatedCustomer));

            mockRequest.params = { id: customerId };
            mockRequest.body = updateData;
            await customerController.updateCustomer(mockRequest as Request, mockResponse as Response);

            expect(mockUpdateCustomerUseCase.execute).toHaveBeenCalledWith(customerId, updateData);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: updatedCustomer,
                error: null
            }));
        });

        it('should handle customer update failure', async () => {
            mockUpdateCustomerUseCase.execute.mockResolvedValue(CustomerOperationResponse.failure('Update failed'));

            mockRequest.params = { id: '1' };
            mockRequest.body = {};
            await customerController.updateCustomer(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                error: 'Update failed',
            }));
        });

        it('should handle internal server error during update', async () => {
            mockUpdateCustomerUseCase.execute.mockRejectedValue(new Error('Internal error'));

            mockRequest.params = { id: '1' };
            mockRequest.body = {};
            await customerController.updateCustomer(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: 'Internal server error',
            });
        });
    });

    describe('updateManyCustomers', () => {
        it('should update multiple customers successfully', async () => {
            const query = { city: 'New York' };
            const updateData = { status: 'active' };
            const updatedCustomers = [
                Customer.create({ id: '1', name: 'John Doe', documentNum: '12345678901', dateBirthday: new Date('1990-01-01'), email: 'john@example.com' }),
                Customer.create({ id: '2', name: 'Jane Doe', documentNum: '98765432109', dateBirthday: new Date('1992-05-15'), email: 'jane@example.com' }),
            ];
            mockUpdateCustomerUseCase.updateMany.mockResolvedValue(updatedCustomers.map(customer => CustomerOperationResponse.success(customer)));

            mockRequest.body = { query, updateData };
            await customerController.updateManyCustomers(mockRequest as Request, mockResponse as Response);

            expect(mockUpdateCustomerUseCase.updateMany).toHaveBeenCalledWith(query, updateData);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ success: true, data: expect.any(Object), error: null }),
                expect.objectContaining({ success: true, data: expect.any(Object), error: null }),
            ]));
        });

        it('should handle internal server error', async () => {
            mockUpdateCustomerUseCase.updateMany.mockRejectedValue(new Error('Internal error'));

            mockRequest.body = { query: {}, updateData: {} };
            await customerController.updateManyCustomers(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: 'Internal server error',
            });
        });
    });

    describe('getCustomer', () => {
        it('should get a customer successfully', async () => {
            const customer = Customer.create({ id: '1', name: 'John Doe', documentNum: '12345678901', dateBirthday: new Date('1990-01-01'), email: 'john@example.com' });
            mockGetCustomerUseCase.execute.mockResolvedValue(CustomerOperationResponse.success(customer));

            mockRequest.params = { id: '1' };
            await customerController.getCustomer(mockRequest as Request, mockResponse as Response);

            expect(mockGetCustomerUseCase.execute).toHaveBeenCalledWith('1');
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: customer,
                error: null
            });
        });

        it('should handle customer not found', async () => {
            mockGetCustomerUseCase.execute.mockResolvedValue(CustomerOperationResponse.failure('Customer not found'));

            mockRequest.params = { id: '1' };
            await customerController.getCustomer(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: 'Customer not found',
            });
        });

        it('should handle internal server error', async () => {
            mockGetCustomerUseCase.execute.mockRejectedValue(new Error('Internal error'));

            mockRequest.params = { id: '1' };
            await customerController.getCustomer(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: 'Internal server error',
            });
        });
    });

    describe('getAllCustomers', () => {
        it('should get all customers successfully', async () => {
            const customers = [
                Customer.create({ id: '1', name: 'John Doe', documentNum: '12345678901', dateBirthday: new Date('1990-01-01'), email: 'john@example.com' }),
                Customer.create({ id: '2', name: 'Jane Doe', documentNum: '98765432109', dateBirthday: new Date('1992-05-15'), email: 'jane@example.com' }),
            ];
            mockGetCustomerUseCase.findAll.mockResolvedValue(CustomerOperationResponse.success(customers));

            mockRequest.query = {};
            await customerController.getAllCustomers(mockRequest as Request, mockResponse as Response);

            expect(mockGetCustomerUseCase.findAll).toHaveBeenCalledWith({});
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: customers,
                error: null
            });
        });

        it('should handle internal server error', async () => {
            mockGetCustomerUseCase.findAll.mockRejectedValue(new Error('Internal error'));

            mockRequest.query = {};
            await customerController.getAllCustomers(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: 'Internal server error',
            });
        });
    });

    describe('searchCustomers', () => {
        it('should search customers successfully', async () => {
            const customers = [
                Customer.create({ id: '1', name: 'John Doe', documentNum: '12345678901', dateBirthday: new Date('1990-01-01'), email: 'john@example.com' }),
            ];
            mockGetCustomerUseCase.search.mockResolvedValue(CustomerOperationResponse.success(customers));

            mockRequest.query = { name: 'John' };
            mockRequest.body = { options: { sort: { name: 1 } } };
            await customerController.searchCustomers(mockRequest as Request, mockResponse as Response);

            expect(mockGetCustomerUseCase.search).toHaveBeenCalledWith({ name: 'John' }, { sort: { name: 1 } });
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: customers,
                error: null
            });
        });

        it('should handle internal server error during search', async () => {
            mockGetCustomerUseCase.search.mockRejectedValue(new Error('Internal error'));

            mockRequest.query = { name: 'John' };
            mockRequest.body = { options: {} };
            await customerController.searchCustomers(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: 'Internal server error',
            });
        });
    });

    describe('countCustomers', () => {
        it('should count customers successfully', async () => {
            mockGetCustomerUseCase.count.mockResolvedValue(CustomerOperationResponse.success(2));

            mockRequest.query = {};
            await customerController.countCustomers(mockRequest as Request, mockResponse as Response);

            expect(mockGetCustomerUseCase.count).toHaveBeenCalledWith({});
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: 2,
                error: null
            });
        });

        it('should handle internal server error during count', async () => {
            mockGetCustomerUseCase.count.mockRejectedValue(new Error('Internal error'));

            mockRequest.query = {};
            await customerController.countCustomers(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: 'Internal server error',
            });
        });
    });

    describe('customerExists', () => {
        it('should check if customer exists successfully', async () => {
            mockGetCustomerUseCase.existsById.mockResolvedValue(CustomerOperationResponse.success(true));

            mockRequest.params = { id: '1' };
            await customerController.customerExists(mockRequest as Request, mockResponse as Response);

            expect(mockGetCustomerUseCase.existsById).toHaveBeenCalledWith('1');
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: true,
                error: null
            });
        });

        it('should handle internal server error during existence check', async () => {
            mockGetCustomerUseCase.existsById.mockRejectedValue(new Error('Internal error'));

            mockRequest.params = { id: '1' };
            await customerController.customerExists(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: 'Internal server error',
            });
        });
    });

    describe('deleteCustomer', () => {
        it('should delete a customer successfully', async () => {
            const mockCustomer = Customer.create({
                id: '1',
                name: 'John Doe',
                documentNum: '12345678901',
                dateBirthday: '1990-01-01',
                email: 'john@example.com'
            });
            mockDeleteCustomerUseCase.execute.mockResolvedValue(CustomerOperationResponse.success(mockCustomer));

            mockRequest.params = { id: '1' };
            await customerController.deleteCustomer(mockRequest as Request, mockResponse as Response);

            expect(mockDeleteCustomerUseCase.execute).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockCustomer,
                error: null
            });
        });

        it('should handle customer not found during deletion', async () => {
            mockDeleteCustomerUseCase.execute.mockResolvedValue(CustomerOperationResponse.failure('Customer not found'));

            mockRequest.params = { id: '1' };
            await customerController.deleteCustomer(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                data: null,
                success: false,
                error: 'Customer not found'
            });
        });

        it('should handle internal server error during deletion', async () => {
            mockDeleteCustomerUseCase.execute.mockRejectedValue(new Error('Internal error'));

            mockRequest.params = { id: '1' };
            await customerController.deleteCustomer(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                data: null,
                success: false,
                error: 'Internal server error'
            });
        });
    });

    describe('deleteCustomerByCPF', () => {
        it('should delete a customer by CPF successfully', async () => {
            const mockCustomer = Customer.create({
                id: '1',
                name: 'John Doe',
                documentNum: '12345678901',
                dateBirthday: '1990-01-01',
                email: 'john@example.com'
            });
            mockDeleteCustomerUseCase.executeByCpf.mockResolvedValue(CustomerOperationResponse.success(mockCustomer));

            mockRequest.params = { cpf: '12345678901' };
            await customerController.deleteCustomerByCPF(mockRequest as Request, mockResponse as Response);

            expect(mockDeleteCustomerUseCase.executeByCpf).toHaveBeenCalledWith('12345678901');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockCustomer,
                error: null
            });
        });

        it('should handle customer not found during deletion by CPF', async () => {
            mockDeleteCustomerUseCase.executeByCpf.mockResolvedValue(CustomerOperationResponse.failure('Customer not found'));

            mockRequest.params = { cpf: '12345678901' };
            await customerController.deleteCustomerByCPF(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                data: null,
                success: false,
                error: 'Customer not found'
            });
        });

        it('should handle internal server error during deletion by CPF', async () => {
            mockDeleteCustomerUseCase.executeByCpf.mockRejectedValue(new Error('Internal error'));

            mockRequest.params = { cpf: '12345678901' };
            await customerController.deleteCustomerByCPF(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                data: null,
                success: false,
                error: 'Internal server error'
            });
        });
    });
});

