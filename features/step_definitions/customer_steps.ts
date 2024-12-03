import { Given, When, Then, Before } from '@cucumber/cucumber'
import assert from 'assert'
import { Customer } from '../../src/domain/entities/customer'
import { CustomerOperationResponse } from '../../src/domain/entities/customer-operation-response'
import { CreateCustomerUseCase } from '../../src/application/use-cases/create-customer'
import { GetCustomerUseCase } from '../../src/application/use-cases/get-customer'
import { UpdateCustomerUseCase } from '../../src/application/use-cases/update-customer'
import { DeleteCustomerUseCase } from '../../src/application/use-cases/delete-customer'
import { MockCustomerRepository } from '../support/mock_customer_repository'

const repository = new MockCustomerRepository();
const createCustomerUseCase = new CreateCustomerUseCase(repository);
const getCustomerUseCase = new GetCustomerUseCase(repository);
const updateCustomerUseCase = new UpdateCustomerUseCase(repository);
const deleteCustomerUseCase = new DeleteCustomerUseCase(repository);

let testCustomer: Customer;
let operationResult: CustomerOperationResponse;

Before(() => {
    repository.clear();
});

Given('I have customer details', function () {
    testCustomer = Customer.create({
        name: 'John Doe',
        documentNum: '12345678901',
        dateBirthday: '1990-01-01',
        email: 'john@example.com'
    });
});

When('I create a new customer', async function () {
    operationResult = await createCustomerUseCase.execute(testCustomer);
});

Then('the customer should be saved successfully', function () {
    assert.strictEqual(operationResult.success, true);
    assert.ok(operationResult.data);
});

Given('a customer exists in the system', async function () {
    testCustomer = Customer.create({
        name: 'Jane Doe',
        documentNum: '98765432109',
        dateBirthday: '1992-05-15',
        email: 'jane@example.com'
    });
    operationResult = await createCustomerUseCase.execute(testCustomer);

    assert.strictEqual(operationResult.success, true);
});

When('I request the customer\'s details', async function () {
    operationResult = await getCustomerUseCase.execute(testCustomer.id.toString());
});

Then('I should receive the correct customer information', function () {
    assert.strictEqual(operationResult.success, true);
    assert.deepStrictEqual(operationResult.data, testCustomer);
});

When('I update the customer\'s information', async function () {
    const updateData = { name: 'Jane Smith' };
    operationResult = await updateCustomerUseCase.execute(testCustomer.id.toString(), updateData);
});

Then('the customer\'s details should be updated successfully', function () {
    assert.strictEqual(operationResult.success, true);
    assert.ok(operationResult.data);

    if (operationResult.data && typeof operationResult.data === 'object' && !Array.isArray(operationResult.data)) {
        const updatedCustomer = operationResult.data as Customer;
        assert.strictEqual(updatedCustomer.name, 'Jane Smith');
    } else {
        assert.fail('Updated customer data is not in the expected format');
    }
});

When('I try to update the customer with an existing email', async function () {
    const existingCustomer = Customer.create({
        name: 'Existing Customer',
        documentNum: '11111111111',
        dateBirthday: '1985-01-01',
        email: 'existing@example.com'
    });
    await createCustomerUseCase.execute(existingCustomer);

    const updateData = { email: 'existing@example.com' };
    operationResult = await updateCustomerUseCase.execute(testCustomer.id.toString(), updateData);
});

Then('the update should fail due to email conflict', function () {
    assert.strictEqual(operationResult.success, false);
    assert.strictEqual(operationResult.error, 'Email existing@example.com is already in use');
});

When('I try to update the customer with an existing document number', async function () {
    const existingCustomer = Customer.create({
        name: 'Another Customer',
        documentNum: '22222222222',
        dateBirthday: '1988-01-01',
        email: 'another@example.com'
    });
    await createCustomerUseCase.execute(existingCustomer);

    const updateData = { documentNum: '22222222222' };
    operationResult = await updateCustomerUseCase.execute(testCustomer.id.toString(), updateData);
});

Then('the update should fail due to document number conflict', function () {
    assert.strictEqual(operationResult.success, false);
    assert.strictEqual(operationResult.error, 'Document number 22222222222 is already in use');
});

When('I delete the customer', async function () {
    operationResult = await deleteCustomerUseCase.execute(testCustomer.id.toString());
});

Then('the customer should be removed from the system', async function () {
    assert.strictEqual(operationResult.success, true);
    const getResult = await getCustomerUseCase.execute(testCustomer.id.toString());
    assert.strictEqual(getResult.success, false);
    assert.strictEqual(getResult.data, null);
});