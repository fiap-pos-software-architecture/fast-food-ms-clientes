import { Request, Response } from 'express'
import { GetCustomerUseCase } from '../../../application/use-cases/get-customer'
import { CreateCustomerUseCase } from '../../../application/use-cases/create-customer'
import { DeleteCustomerUseCase } from '../../../application/use-cases/delete-customer'
import { UpdateCustomerUseCase } from '../../../application/use-cases/update-customer'

export class CustomerController {
    constructor(
        private readonly createCustomerUseCase: CreateCustomerUseCase,
        private readonly updateCustomerUseCase: UpdateCustomerUseCase,
        private readonly getCustomerUseCase: GetCustomerUseCase,
        private readonly deleteCustomerUseCase: DeleteCustomerUseCase
    ) { }

    async createCustomer(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.createCustomerUseCase.execute(req.body)
            if (result.success) {
                res.status(201).json(result)
            } else {
                res.status(400).json(result)
            }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Internal server error' })
        }
    }

    async createManyCustomers(req: Request, res: Response): Promise<void> {
        try {
            const results = await this.createCustomerUseCase.createMany(req.body)
            res.status(201).json(results)
        } catch (error) {
            res.status(500).json({ success: false, error: 'Internal server error' })
        }
    }

    async updateCustomer(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.updateCustomerUseCase.execute(req.params.id, req.body)
            if (result.success) {
                res.json(result)
            } else {
                res.status(400).json(result)
            }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Internal server error' })
        }
    }

    async updateManyCustomers(req: Request, res: Response): Promise<void> {
        try {
            const results = await this.updateCustomerUseCase.updateMany(req.body.query, req.body.updateData)
            res.json(results)
        } catch (error) {
            res.status(500).json({ success: false, error: 'Internal server error' })
        }
    }

    async getCustomer(req: Request, res: Response): Promise<void> {
        try {
            const customer = await this.getCustomerUseCase.execute(req.params.id)
            if (customer.success) {
                res.json(customer)
            } else {
                res.status(404).json({ success: false, error: 'Customer not found' })
            }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Internal server error' })
        }
    }

    async getAllCustomers(req: Request, res: Response): Promise<void> {
        try {
            const customers = await this.getCustomerUseCase.findAll(req.query)
            res.json(customers)
        } catch (error) {
            res.status(500).json({ success: false, error: 'Internal server error' })
        }
    }

    async searchCustomers(req: Request, res: Response): Promise<void> {
        try {
            const customers = await this.getCustomerUseCase.search(req.query, req.body.options)
            res.json(customers)
        } catch (error) {
            res.status(500).json({ success: false, error: 'Internal server error' })
        }
    }

    async countCustomers(req: Request, res: Response): Promise<void> {
        try {
            const count = await this.getCustomerUseCase.count(req.query)
            res.json(count)
        } catch (error) {
            res.status(500).json({ success: false, error: 'Internal server error' })
        }
    }

    async customerExists(req: Request, res: Response): Promise<void> {
        try {
            const exists = await this.getCustomerUseCase.existsById(req.params.id)
            res.json(exists)
        } catch (error) {
            res.status(500).json({ success: false, error: 'Internal server error' })
        }
    }

    async deleteCustomer(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.deleteCustomerUseCase.execute(req.params.id);
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            res.status(500).json({ success: false, data: null, error: 'Internal server error' });
        }
    }

    async deleteCustomerByCPF(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.deleteCustomerUseCase.executeByCpf(req.params.cpf);
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            res.status(500).json({ success: false, data: null, error: 'Internal server error' });
        }
    }
}