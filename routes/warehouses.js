import express from "express";
import * as warehouseController from "../controllers/warehouse-controller.js";
import { getInventoriesByWarehouseId } from "../controllers/inventory-controller.js"; 

const router = express.Router();

router.route("/").get(warehouseController.index).post(warehouseController.add);

router
  .route("/:id")
  .get(warehouseController.findOne)
  .put(warehouseController.edit)
  .delete(warehouseController.del);

router.route("/:id/inventories").get(getInventoriesByWarehouseId);

export default router;
