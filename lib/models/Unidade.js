const mongoose = require('mongoose');

const UnidadeSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'O nome da unidade é obrigatório'],
    enum: ['Total', 'Caieiras', 'Francisco Morato', 'Mairiporã', 'SP - Perus', 'Franco da Rocha'],
    unique: true
  },
  codigo: {
    type: String,
    required: [true, 'O código da unidade é obrigatório'],
    unique: true
  },
  endereco: {
    rua: {
      type: String,
      required: false
    },
    numero: {
      type: String,
      required: false
    },
    complemento: {
      type: String,
      required: false
    },
    bairro: {
      type: String,
      required: false
    },
    cidade: {
      type: String,
      required: false
    },
    estado: {
      type: String,
      required: false
    },
    cep: {
      type: String,
      required: false
    }
  },
  telefone: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, forneça um e-mail válido']
  },
  responsavel: {
    type: String,
    required: false
  },
  funcionarios: {
    type: Number,
    required: false,
    default: 0,
    min: 0
  },
  ativo: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to validate that the 'Total' unit is unique
UnidadeSchema.pre('save', async function(next) {
  if (this.nome === 'Total') {
    // Check if there's already a 'Total' unit
    const totalCount = await mongoose.models.Unidade.countDocuments({ nome: 'Total' });
    
    // If this is a new document (no _id) or we're updating a document that isn't 'Total'
    if (totalCount > 0 && (!this._id || !(await mongoose.models.Unidade.findOne({ _id: this._id, nome: 'Total' })))) {
      return next(new Error('Já existe uma unidade com o nome "Total"'));
    }
  }
  next();
});

// Auto-populate códigos if not provided
UnidadeSchema.pre('save', function(next) {
  if (!this.codigo) {
    // Generate a code based on the name
    const codigoMap = {
      'Total': 'TOT',
      'Caieiras': 'CAI',
      'Francisco Morato': 'FMO',
      'Mairiporã': 'MAI',
      'SP - Perus': 'SPE',
      'Franco da Rocha': 'FRO'
    };
    
    this.codigo = codigoMap[this.nome] || this.nome.substring(0, 3).toUpperCase();
  }
  next();
});

// This will only be created if Unidade doesn't already exist
module.exports = mongoose.models.Unidade || mongoose.model('Unidade', UnidadeSchema); 