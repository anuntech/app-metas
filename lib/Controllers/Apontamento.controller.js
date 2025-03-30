import { 
  addNewApontamentoService, 
  deleteApontamentoService, 
  getAllApontamentosService, 
  getApontamentoByIdService, 
  getApontamentosWithFiltersService,
  updateApontamentoService 
} from "../Services/Apontamento.service";
import dbConnect from "../dbConnect";

const getAllApontamentosController = async () => {
  await dbConnect();
  const result = await getAllApontamentosService();
  return result;
};

const getApontamentosWithFiltersController = async (filters) => {
  await dbConnect();
  const result = await getApontamentosWithFiltersService(filters);
  return result;
};

const getApontamentoByIdController = async (apontamentoId) => {
  await dbConnect();
  const result = await getApontamentoByIdService(apontamentoId);
  return result;
};

const addNewApontamentoController = async (body) => {
  await dbConnect();
  const result = await addNewApontamentoService(body);
  return result;
};

const updateApontamentoController = async (apontamentoId, updatedData) => {
  await dbConnect();
  const result = await updateApontamentoService(apontamentoId, updatedData);
  return result;
};

const deleteApontamentoController = async (apontamentoId) => {
  await dbConnect();
  const result = await deleteApontamentoService(apontamentoId);
  return result;
};

export {
  getAllApontamentosController,
  getApontamentosWithFiltersController,
  getApontamentoByIdController,
  addNewApontamentoController,
  updateApontamentoController,
  deleteApontamentoController,
}; 