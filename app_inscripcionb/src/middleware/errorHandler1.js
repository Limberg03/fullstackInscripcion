const { ApiError } = require('../errors/ApiError');

const errorHandler1 = (err, req, res, next) => {
  console.error('❌ ERROR ATRAPADO POR EL MANEJADOR:', err);

  if (err instanceof ApiError) {
    const errorBody = {
      success: false,
      error: err.name.replace('Error', '').toUpperCase(), 
      message: err.message,
    };
    
    if (err.errors) {
      errorBody.errors = err.errors;
    }
    
    return res.status(err.statusCode).json(errorBody);
  }

  return res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Ha ocurrido un error inesperado en el servidor.'
  });
};

module.exports = errorHandler1;