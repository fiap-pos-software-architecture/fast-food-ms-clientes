import { Customer } from './customer'

export class CustomerOperationResponse {
  constructor(
    public readonly success: boolean,
    public readonly data: Customer | Customer[] | number | boolean | null,
    public readonly error: string | null
  ) { }

  static success(data: Customer | Customer[] | number | boolean): CustomerOperationResponse {
    return new CustomerOperationResponse(true, data, null)
  }

  static failure(error: string): CustomerOperationResponse {
    return new CustomerOperationResponse(false, null, error)
  }
}

