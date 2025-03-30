import { Apontamento } from "../models";
import mongoose from 'mongoose';

// Check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getAllApontamentosService = async () => {
  try {
    const apontamentos = await Apontamento.find({}).sort({ ano: -1, mes: 1, unidade: 1 });
    return { status: 200, data: apontamentos };
  } catch (error) {
    console.error("Error getting all apontamentos:", error);
    return { status: 500, message: error.message };
  }
};

const getApontamentosWithFiltersService = async (filters) => {
  try {
    const query = {};
    
    // Add filters to query if they exist
    if (filters.ano) {
      query.ano = filters.ano;
    }
    
    if (filters.mes) {
      query.mes = filters.mes;
    }
    
    if (filters.unidade) {
      query.unidade = filters.unidade;
    }
    
    if (filters.nivel) {
      query.nivel = filters.nivel;
    }
    
    if (filters.periodo) {
      query.periodo = filters.periodo;
    }
    
    if (filters.metaId) {
      query.metaId = filters.metaId;
    }
    
    const apontamentos = await Apontamento.find(query).sort({ ano: -1, mes: 1, unidade: 1 });
    
    return { status: 200, data: apontamentos };
  } catch (error) {
    console.error("Error getting filtered apontamentos:", error);
    return { status: 500, message: error.message };
  }
};

const getApontamentoByIdService = async (apontamentoId) => {
  try {
    // Validate if apontamentoId is a valid MongoDB ObjectId
    if (!isValidObjectId(apontamentoId)) {
      return { 
        status: 400, 
        message: `Invalid ID format: "${apontamentoId}" is not a valid MongoDB ObjectId` 
      };
    }
    
    const apontamento = await Apontamento.findOne({ _id: apontamentoId });
    if (!apontamento) {
      return { status: 404, message: 'Apontamento not found' };
    }
    return { status: 200, data: apontamento };
  } catch (error) {
    console.error("Error getting apontamento:", error);
    return { status: 500, message: error.message };
  }
};

const addNewApontamentoService = async (newApontamento) => {
  try {
    const result = await Apontamento.create(newApontamento);
    return { status: 201, message: result._id };
  } catch (error) {
    console.error("Error creating apontamento:", error);
    
    // Provide more detailed error information
    let errorMessage = error.message;
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(field => {
        return `${field}: ${error.errors[field].message}`;
      });
      errorMessage = `Validation errors: ${validationErrors.join(', ')}`;
    }
    
    // Check for duplicate key errors
    if (error.code === 11000) {
      errorMessage = `Já existe um apontamento cadastrado para o período e unidade especificados`;
    }
    
    return { status: 400, message: errorMessage };
  }
};

const updateApontamentoService = async (apontamentoId, updatedData) => {
  try {
    console.log(`Attempting to update apontamento ${apontamentoId}`);
    
    // Validate if apontamentoId is a valid MongoDB ObjectId
    if (!isValidObjectId(apontamentoId)) {
      return { 
        status: 400, 
        message: `Invalid ID format: "${apontamentoId}" is not a valid MongoDB ObjectId` 
      };
    }
    
    const apontamento = await Apontamento.findOneAndUpdate(
      { _id: apontamentoId },
      updatedData,
      { new: true, runValidators: true }
    );
    
    if (!apontamento) {
      console.error(`Apontamento ${apontamentoId} not found for update`);
      return { status: 404, message: 'Apontamento not found' };
    }
    
    console.log(`Successfully updated apontamento ${apontamentoId}`);
    return { status: 200, data: apontamento };
  } catch (error) {
    console.error(`Error updating apontamento ${apontamentoId}:`, error);
    
    // Provide more detailed error information
    let errorMessage = error.message;
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(field => {
        return `${field}: ${error.errors[field].message}`;
      });
      errorMessage = `Validation errors: ${validationErrors.join(', ')}`;
    }
    
    // Check for duplicate key errors
    if (error.code === 11000) {
      errorMessage = `Já existe um apontamento cadastrado para o período e unidade especificados`;
    }
    
    return { status: 500, message: errorMessage };
  }
};

const deleteApontamentoService = async (apontamentoId) => {
  try {
    // Validate if apontamentoId is a valid MongoDB ObjectId
    if (!isValidObjectId(apontamentoId)) {
      return { 
        status: 400, 
        message: `Invalid ID format: "${apontamentoId}" is not a valid MongoDB ObjectId` 
      };
    }
    
    const result = await Apontamento.findOneAndDelete({ _id: apontamentoId });
    if (!result) {
      return { status: 404, message: 'Apontamento not found' };
    }
    return { status: 200, message: 'Apontamento deleted successfully' };
  } catch (error) {
    console.error("Error deleting apontamento:", error);
    return { status: 500, message: error.message };
  }
};

export {
  getAllApontamentosService,
  getApontamentosWithFiltersService,
  getApontamentoByIdService,
  addNewApontamentoService,
  updateApontamentoService,
  deleteApontamentoService,
}; 