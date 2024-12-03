import express from 'express'
import { MongoDBCustomerRepository } from './infrastructure/database/mongodb/mongodb-customer-repository'
import { CreateCustomerUseCase } from './application/use-cases/create-customer'
import { GetCustomerUseCase } from './application/use-cases/get-customer'
import { DeleteCustomerUseCase } from './application/use-cases/delete-customer'
import { UpdateCustomerUseCase } from './application/use-cases/update-customer'
import { CustomerController } from './infrastructure/adapters/controllers/customer-controller'
import { CustomerModel } from './infrastructure/database/mongodb/models/customer-model'
import { connectToDatabase } from './infrastructure/database/database'

const app = express()
app.use(express.json())

const startServer = async () => {
    await connectToDatabase()

    const customerRepository = new MongoDBCustomerRepository(CustomerModel)
    const createCustomerUseCase = new CreateCustomerUseCase(customerRepository)
    const getCustomerUseCase = new GetCustomerUseCase(customerRepository)
    const deleteCustomerUseCase = new DeleteCustomerUseCase(customerRepository)
    const updateCustomerUseCase = new UpdateCustomerUseCase(customerRepository)
    const customerController = new CustomerController(
        createCustomerUseCase,
        updateCustomerUseCase,
        getCustomerUseCase,
        deleteCustomerUseCase
    )

    app.post('/customers', customerController.createCustomer.bind(customerController))
    app.post('/customers/bulk', customerController.createManyCustomers.bind(customerController))
    app.get('/customers/:id', customerController.getCustomer.bind(customerController))
    app.get('/customers', customerController.getAllCustomers.bind(customerController))
    app.post('/customers/search', customerController.searchCustomers.bind(customerController))
    app.get('/customers/count', customerController.countCustomers.bind(customerController))
    app.get('/customers/:id/exists', customerController.customerExists.bind(customerController))
    app.delete('/customers/:id', customerController.deleteCustomer.bind(customerController))
    app.delete('/customers/cpf/:cpf', customerController.deleteCustomerByCPF.bind(customerController))
    app.put('/customers/:id', customerController.updateCustomer.bind(customerController))
    app.put('/customers', customerController.updateManyCustomers.bind(customerController))

    app.listen(3000, '0.0.0.0', () => {
        console.log('Server is running on port 3000');
    });
}

startServer().catch((err) => {
    console.error('Failed to start server:', err)
})
