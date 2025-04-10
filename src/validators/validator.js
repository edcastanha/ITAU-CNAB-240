/**
 * Middleware de validação para as requisições da API CNAB 240
 */

const schemas = require('./schemas');

/**
 * Middleware para validação de requisições usando Joi
 * @param {Object} schema - Esquema Joi para validação
 * @returns {Function} - Middleware Express
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        message: detail.message,
        path: detail.path
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors: errorDetails
      });
    }
    
    next();
  };
};

// Exportação dos middlewares de validação para cada tipo de requisição
module.exports = {
  validateFornecedores: validateRequest(schemas.fornecedoresRequestSchema),
  validateBoletos: validateRequest(schemas.boletosRequestSchema),
  validatePIX: validateRequest(schemas.pixRequestSchema),
  validateTributos: validateRequest(schemas.tributosRequestSchema),
  validateSalarios: validateRequest(schemas.salariosRequestSchema),
  validatePersonalizado: validateRequest(schemas.personalizadoRequestSchema)
};
