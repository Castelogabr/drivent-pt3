import { ApplicationError } from '@/protocols';

export function paymentError(): ApplicationError {
  return {
    name: 'PaymentError',
    message: 'No result for this search!',
  };
}
