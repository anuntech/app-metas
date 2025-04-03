import { getDashboardSummaryService, getUnitsDashboardService, completeTotalMetaService, completeUnitMetaService, getActiveMetaLevelsService } from "../Services/Dashboard.service";
import dbConnect from "../dbConnect";

/**
 * Get dashboard summary data
 */
const getDashboardSummaryController = async (startDate, endDate, metaLevel) => {
  await dbConnect();
  const result = await getDashboardSummaryService(startDate, endDate, metaLevel);
  return result;
};

/**
 * Get units dashboard data
 */
const getUnitsDashboardController = async (startDate, endDate, metaLevel) => {
  await dbConnect();
  const result = await getUnitsDashboardService(startDate, endDate, metaLevel);
  return result;
};

/**
 * Mark a Total meta as complete
 */
const completeTotalMetaController = async (metaLevel, month, year) => {
  await dbConnect();
  const result = await completeTotalMetaService(metaLevel, month, year);
  return result;
};

/**
 * Mark a unit meta as complete
 */
const completeUnitMetaController = async (unitName, metaLevel, month, year) => {
  await dbConnect();
  const result = await completeUnitMetaService(unitName, metaLevel, month, year);
  return result;
};

/**
 * Get the highest incomplete meta level for each unit
 */
const getActiveMetaLevelsController = async (month, year) => {
  await dbConnect();
  const result = await getActiveMetaLevelsService(month, year);
  return result;
};

export {
  getDashboardSummaryController,
  getUnitsDashboardController,
  completeTotalMetaController,
  completeUnitMetaController,
  getActiveMetaLevelsController
}; 