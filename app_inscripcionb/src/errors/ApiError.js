class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends ApiError {
  constructor(message = 'Errores de validación', errorsArray) {
    super(message, 400); // Bad Request
    this.errors = errorsArray;
  }
}

class ConflictError extends ApiError {
  constructor(message) {
    super(message, 409); // Conflict
  }
}

class UnprocessableEntityError extends ApiError {
  constructor(message) {
    super(message, 422); // Unprocessable Entity
  }
}

class NotFoundError extends ApiError {
  constructor(message) {
    super(message, 404); // Not 
  }
}

module.exports = {
  ApiError,
  ValidationError,
  ConflictError,
  UnprocessableEntityError,
  NotFoundError 
};