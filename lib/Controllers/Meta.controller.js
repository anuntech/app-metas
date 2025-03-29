import { 
  addNewMetaService, 
  deleteMetaService, 
  getAllMetasService, 
  getMetaByIdService, 
  getMetasWithFiltersService,
  updateMetaService 
} from "../Services/Meta.service";
import dbConnect from "../dbConnect";

const getAllMetasController = async () => {
  await dbConnect();
  const result = await getAllMetasService();
  return result;
};

const getMetasWithFiltersController = async (filters) => {
  await dbConnect();
  const result = await getMetasWithFiltersService(filters);
  return result;
};

const getMetaByIdController = async (metaId) => {
  await dbConnect();
  const result = await getMetaByIdService(metaId);
  return result;
};

const addNewMetaController = async (body) => {
  await dbConnect();
  const result = await addNewMetaService(body);
  return result;
};

const updateMetaController = async (metaId, updatedData) => {
  await dbConnect();
  const result = await updateMetaService(metaId, updatedData);
  return result;
};

const deleteMetaController = async (metaId) => {
  await dbConnect();
  const result = await deleteMetaService(metaId);
  return result;
};

export {
  getAllMetasController,
  getMetasWithFiltersController,
  getMetaByIdController,
  addNewMetaController,
  updateMetaController,
  deleteMetaController,
}; 