const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
 
async function postPredictHandler(request, h) {
  const { ph, turbidity, temperature } = request.payload;
 
  const { label, explanation, suggestion } = await predictClassification(model, ph, turbidity, temperature );
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
 
  const data = {
    "id": id,
    "result": label,
    "explanation": explanation,
    "suggestion": suggestion,
    "createdAt": createdAt
  }
 
  const response = h.response({
    status: 'success',
    message: 'Model is predicted successfully but under threshold. Please use the correct picture',
    data
  })
  response.code(201);
  return response;
}
 
module.exports = postPredictHandler;