import { Customer } from '../../../src/domain/entities/customer';
import { EntityCreationError } from '../../../src/domain/exceptions/entity-creation-error';

describe('Customer', () => {
    describe('create', () => {
        const validCustomerData = {
            name: 'John Doe',
            documentNum: '12345678901',
            dateBirthday: '1990-01-01',
            email: 'john@example.com'
        };

        it('should create a customer with valid data', () => {
            const customer = Customer.create(validCustomerData);

            expect(customer).toBeInstanceOf(Customer);
            expect(customer.name).toBe('John Doe');
            expect(customer.documentNum).toBe('12345678901');
            expect(customer.email).toBe('john@example.com');
            expect(customer.dateBirthday).toEqual(new Date('1990-01-01'));
            expect(typeof customer.id).toBe('string');
        });

        it('should create a customer with provided ID', () => {
            const customerWithId = Customer.create({
                ...validCustomerData,
                id: '123'
            });

            expect(customerWithId.id).toBe('123');
        });

        it('should accept Date object for dateBirthday', () => {
            const customer = Customer.create({
                ...validCustomerData,
                dateBirthday: new Date('1990-01-01')
            });

            expect(customer.dateBirthday).toEqual(new Date('1990-01-01'));
        });

        it('should trim whitespace from string fields', () => {
            const customer = Customer.create({
                ...validCustomerData,
                name: '  John Doe  ',
                documentNum: '  12345678901  ',
                email: '  john@example.com  '
            });

            expect(customer.name).toBe('John Doe');
            expect(customer.documentNum).toBe('12345678901');
            expect(customer.email).toBe('john@example.com');
        });

        describe('validation errors', () => {
            it('should throw error for non-string name', () => {
                expect(() => Customer.create({
                    ...validCustomerData,
                    name: 123 as any
                })).toThrow(EntityCreationError);
                expect(() => Customer.create({
                    ...validCustomerData,
                    name: 123 as any
                })).toThrow('Name, document number, and email must be strings');
            });

            it('should throw error for non-string document number', () => {
                expect(() => Customer.create({
                    ...validCustomerData,
                    documentNum: 123 as any
                })).toThrow(EntityCreationError);
            });

            it('should throw error for non-string email', () => {
                expect(() => Customer.create({
                    ...validCustomerData,
                    email: 123 as any
                })).toThrow(EntityCreationError);
            });

            it('should throw error for empty name', () => {
                expect(() => Customer.create({
                    ...validCustomerData,
                    name: ''
                })).toThrow(EntityCreationError);
                expect(() => Customer.create({
                    ...validCustomerData,
                    name: ''
                })).toThrow('All fields must be filled');
            });

            it('should throw error for empty document number', () => {
                expect(() => Customer.create({
                    ...validCustomerData,
                    documentNum: ''
                })).toThrow(EntityCreationError);
            });

            it('should throw error for empty email', () => {
                expect(() => Customer.create({
                    ...validCustomerData,
                    email: ''
                })).toThrow(EntityCreationError);
            });

            it('should throw error for document number less than 11 characters', () => {
                expect(() => Customer.create({
                    ...validCustomerData,
                    documentNum: '1234567890'
                })).toThrow(EntityCreationError);
                expect(() => Customer.create({
                    ...validCustomerData,
                    documentNum: '1234567890'
                })).toThrow('Document number must be at least 11 characters long');
            });

            it('should throw error for invalid date string format', () => {
                expect(() => Customer.create({
                    ...validCustomerData,
                    dateBirthday: '1990/01/01'
                })).toThrow(EntityCreationError);
                expect(() => Customer.create({
                    ...validCustomerData,
                    dateBirthday: '1990/01/01'
                })).toThrow('Invalid date format or value. Use YYYY-MM-DD and ensure it\'s a valid date.');
            });

            it('should throw error for invalid date type', () => {
                expect(() => Customer.create({
                    ...validCustomerData,
                    dateBirthday: 123 as any
                })).toThrow(EntityCreationError);
                expect(() => Customer.create({
                    ...validCustomerData,
                    dateBirthday: 123 as any
                })).toThrow('Invalid date type');
            });

            it('should throw error for future birth date', () => {
                const futureDate = new Date();
                futureDate.setFullYear(futureDate.getFullYear() + 1);

                expect(() => Customer.create({
                    ...validCustomerData,
                    dateBirthday: futureDate.toISOString().split('T')[0]
                })).toThrow(EntityCreationError);
                expect(() => Customer.create({
                    ...validCustomerData,
                    dateBirthday: futureDate.toISOString().split('T')[0]
                })).toThrow('Invalid birth date');
            });

            it('should throw error for invalid date values', () => {
                expect(() => Customer.create({
                    ...validCustomerData,
                    dateBirthday: '2023-13-45' // invalid month and day
                })).toThrow(EntityCreationError);
            });

            it('should throw error for invalid date object', () => {
                const invalidDate = new Date('invalid');
                expect(() => Customer.create({
                    ...validCustomerData,
                    dateBirthday: invalidDate
                })).toThrow(EntityCreationError);
                expect(() => Customer.create({
                    ...validCustomerData,
                    dateBirthday: invalidDate
                })).toThrow('Invalid birth date');
            });
        });

        describe('date validation', () => {
            it('should validate correct date string format', () => {
                const customer = Customer.create({
                    ...validCustomerData,
                    dateBirthday: '2000-12-31'
                });
                expect(customer.dateBirthday).toEqual(new Date('2000-12-31'));
            });

            it('should handle leap years correctly', () => {
                const customer = Customer.create({
                    ...validCustomerData,
                    dateBirthday: '2000-02-29' // valid leap year date
                });
                expect(customer.dateBirthday).toEqual(new Date('2000-02-29'));
            });

            it('should reject invalid leap year dates', () => {
                expect(() => Customer.create({
                    ...validCustomerData,
                    dateBirthday: '2001-02-29' // invalid - not a leap year
                })).toThrow(EntityCreationError);
            });
        });
    });
});