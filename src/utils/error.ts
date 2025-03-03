import { IError } from "../types/error.type";

/**
 * Creates and throws a formatted error object
 * @param message Error message
 * @param status HTTP status code
 */
const throwError = (message: string, status: number): never => {
  const error: IError = new Error(message);
  error.status = status;
  error.intentional = true;

  throw error;
};

export default throwError;
