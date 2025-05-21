const mongoose = require('mongoose');

const MetaSchema = new mongoose.Schema({
  mes: {
    type: String,
    required: [true, 'O mês é obrigatório'],
    enum: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
  },
  ano: {
    type: Number,
    required: [true, 'O ano é obrigatório'],
    min: 2000,
    max: 2100
  },
  unidade: {
    type: String,
    required: [true, 'A unidade é obrigatória'],
    enum: ['Total', 'Caieiras', 'Francisco Morato', 'Mairiporã', 'SP - Perus', 'Franco da Rocha']
  },
  faturamento: {
    type: Number,
    required: [true, 'O faturamento é obrigatório'],
    min: 0
  },
  funcionarios: {
    type: Number,
    required: [true, 'A quantidade de funcionários é obrigatória'],
    min: 0
  },
  despesa: {
    type: Number,
    required: [true, 'A despesa é obrigatória'],
    min: 0,
    max: 100
  },
  inadimplencia: {
    type: Number,
    required: [true, 'A inadimplência é obrigatória'],
    min: 0,
    max: 100
  },
  quantidadeContratos: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  nivel: {
    type: String,
    required: [true, 'O nível é obrigatório'],
    enum: ['I', 'II', 'III', 'IV', 'V', 'VI']
  },
  isComplete: {
    type: Boolean,
    default: false
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

// Compound index to ensure uniqueness of mes + ano + unidade + nivel
MetaSchema.index({ mes: 1, ano: 1, unidade: 1, nivel: 1 }, { unique: true });

// This will only be created if Meta doesn't already exist
module.exports = mongoose.models.Meta || mongoose.model('Meta', MetaSchema); 