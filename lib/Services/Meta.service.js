import { Meta } from "../models";

const getAllMetasService = async () => {
  try {
    const metas = await Meta.find({}).sort({ ano: -1, mes: 1, unidade: 1 });
    return { status: 200, data: metas };
  } catch (error) {
    console.error("Error getting all metas:", error);
    return { status: 500, message: error.message };
  }
};

const getMetasWithFiltersService = async (filters) => {
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
    
    const metas = await Meta.find(query).sort({ ano: -1, mes: 1, unidade: 1 });
    return { status: 200, data: metas };
  } catch (error) {
    console.error("Error getting filtered metas:", error);
    return { status: 500, message: error.message };
  }
};

const getMetaByIdService = async (metaId) => {
  try {
    const meta = await Meta.findOne({ _id: metaId });
    if (!meta) {
      return { status: 404, message: 'Meta not found' };
    }
    return { status: 200, data: meta };
  } catch (error) {
    console.error("Error getting meta:", error);
    return { status: 500, message: error.message };
  }
};

const addNewMetaService = async (newMeta) => {
  try {
    const result = await Meta.create(newMeta);
    return { status: 201, message: result._id };
  } catch (error) {
    console.error("Error creating meta:", error);
    
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
      errorMessage = `Já existe uma meta cadastrada para ${error.keyValue.mes}/${error.keyValue.ano} na unidade ${error.keyValue.unidade}`;
    }
    
    return { status: 400, message: errorMessage };
  }
};

const updateMetaService = async (metaId, updatedData) => {
  try {
    console.log(`Attempting to update meta ${metaId}`);
    
    const meta = await Meta.findOneAndUpdate(
      { _id: metaId },
      updatedData,
      { new: true, runValidators: true }
    );
    
    if (!meta) {
      console.error(`Meta ${metaId} not found for update`);
      return { status: 404, message: 'Meta not found' };
    }
    
    console.log(`Successfully updated meta ${metaId}`);
    return { status: 200, data: meta };
  } catch (error) {
    console.error(`Error updating meta ${metaId}:`, error);
    
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
      errorMessage = `Já existe uma meta cadastrada para ${error.keyValue.mes}/${error.keyValue.ano} na unidade ${error.keyValue.unidade}`;
    }
    
    return { status: 500, message: errorMessage };
  }
};

const deleteMetaService = async (metaId) => {
  try {
    const result = await Meta.findOneAndDelete({ _id: metaId });
    if (!result) {
      return { status: 404, message: 'Meta not found' };
    }
    return { status: 200, message: 'Meta deleted successfully' };
  } catch (error) {
    console.error("Error deleting meta:", error);
    return { status: 500, message: error.message };
  }
};

export {
  getAllMetasService,
  getMetasWithFiltersService,
  getMetaByIdService,
  addNewMetaService,
  updateMetaService,
  deleteMetaService,
}; 