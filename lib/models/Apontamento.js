const mongoose = require('mongoose');

const ApontamentoSchema = new mongoose.Schema({
  dataInicio: {
    type: Date,
    required: [true, 'A data de início é obrigatória']
  },
  dataFim: {
    type: Date,
    required: [true, 'A data de fim é obrigatória']
  },
  periodo: {
    type: String,
    required: [true, 'O período é obrigatório']
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
  recebimento: {
    type: Number,
    required: [true, 'O recebimento é obrigatório'],
    min: 0
  },
  despesa: {
    type: Number,
    required: [true, 'A despesa é obrigatória'],
    min: 0
  },
  inadimplenciaPercentual: {
    type: Number,
    required: [true, 'A inadimplência percentual é obrigatória'],
    min: 0,
    max: 100
  },
  inadimplenciaValor: {
    type: Number,
    required: [true, 'O valor da inadimplência é obrigatório'],
    min: 0
  },
  nivel: {
    type: String,
    required: [true, 'O nível é obrigatório'],
    enum: ['I', 'II', 'III', 'IV', 'V', 'VI']
  },
  metaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meta',
    required: false // Optional connection to a Meta
  },
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

// Compound index to ensure uniqueness of period entries for a unit
ApontamentoSchema.index({ dataInicio: 1, dataFim: 1, unidade: 1 }, { unique: true });

// Add a pre-save hook to auto-generate the periodo field based on dataInicio and dataFim
ApontamentoSchema.pre('save', function(next) {
  // Extract day and month from dates
  const startDay = this.dataInicio.getDate();
  const endDay = this.dataFim.getDate();
  const startMonth = this.dataInicio.getMonth();
  const endMonth = this.dataFim.getMonth();
  
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  
  // Format the periodo based on the date range
  if (startMonth === endMonth) {
    this.periodo = `${startDay} a ${endDay} de ${months[startMonth]}`;
  } else {
    this.periodo = `${startDay} de ${months[startMonth]} a ${endDay} de ${months[endMonth]}`;
  }
  
  // Set mes and ano from dataInicio
  this.mes = months[startMonth].charAt(0).toUpperCase() + months[startMonth].slice(1);
  this.ano = this.dataInicio.getFullYear();
  
  next();
});

// This will only be created if Apontamento doesn't already exist
module.exports = mongoose.models.Apontamento || mongoose.model('Apontamento', ApontamentoSchema); 