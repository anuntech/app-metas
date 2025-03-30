import { getDashboardSummaryService, getUnitsDashboardService } from "../Services/Dashboard.service";
import dbConnect from "../dbConnect";

/**
 * Get dashboard summary data
 */
const getDashboardSummaryController = async (startDate, endDate) => {
  await dbConnect();
  const result = await getDashboardSummaryService(startDate, endDate);
  return result;
};

/**
 * Get units dashboard data
 */
const getUnitsDashboardController = async (startDate, endDate) => {
  await dbConnect();
  const result = await getUnitsDashboardService(startDate, endDate);
  return result;
};

export {
  getDashboardSummaryController,
  getUnitsDashboardController
}; 