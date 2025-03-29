// We only need to check for build phase in one place
if (process.env.NEXT_PHASE === 'build') {
  module.exports = {
    // Provide empty models during build to avoid connection issues
    Meta: {},
    Apontamento: {},
    Unidade: {}
  };
} else {
  // In non-build environments, export the actual models
  const Meta = require('./Meta');
  const Apontamento = require('./Apontamento');
  const Unidade = require('./Unidade');
  
  module.exports = {
    Meta,
    Apontamento,
    Unidade
  };
} 