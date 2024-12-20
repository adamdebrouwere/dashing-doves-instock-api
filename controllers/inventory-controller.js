import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);
import inventoryValidator from "../validators/inventoryValidator.js";

// Get all inventory items with warehouse name
export const getAllInventoryItems = async (req, res) => {
  try {
    const inventoryItems = await knex("inventories")
      .join("warehouses", "inventories.warehouse_id", "=", "warehouses.id")
      .select(
        "inventories.id",
        "warehouses.warehouse_name",
        "inventories.item_name",
        "inventories.description",
        "inventories.category",
        "inventories.status",
        "inventories.quantity"
      );

    res.json(inventoryItems);
  } catch (err) {
    console.error("Error fetching inventory items:", err);
    res.status(500).json({
      message: "Error occurred",
      error: err,
      status: 500,
    });
  }
};

// Get a single inventory item by ID with warehouse name
export const getInventoryItemById = async (req, res) => {
  try {
    const inventoryItem = await knex("inventories")
      .join("warehouses", "inventories.warehouse_id", "=", "warehouses.id")
      .where("inventories.id", req.params.id)
      .select(
        "inventories.id",
        "inventories.warehouse_id",
        "warehouses.warehouse_name",
        "inventories.item_name",
        "inventories.description",
        "inventories.category",
        "inventories.status",
        "inventories.quantity"
      )
      .first();

    if (inventoryItem) {
      res.json(inventoryItem);
    } else {
      res.status(404).json({
        message: "Inventory item not found",
      });
    }
  } catch (err) {
    console.error("Error fetching inventory item by ID:", err);
    res.status(500).json({
      message: "Error occurred",
      error: err,
      status: 500,
    });
  }
};

// POST/CREATE a New Inventory Item
export const postNewInventoryItem = async (req, res) => {
  const validation = inventoryValidator(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      message: validation.message,
      status: 400,
    });
  }

  const { warehouse_id, item_name, description, category, status, quantity } =
    req.body;

  try {
    const warehouseExists = await knex("warehouses")
      .where("id", warehouse_id)
      .first();
    if (!warehouseExists) {
      return res.status(400).json({
        message: "The provided warehouse_id does not exist.",
      });
    }

    const [newInventoryItem] = await knex("inventories")
      .insert({
        warehouse_id,
        item_name,
        description,
        category,
        status,
        quantity,
      })
      .returning([
        "id",
        "warehouse_id",
        "item_name",
        "description",
        "category",
        "status",
        "quantity",
      ]);

    res.status(201).json({
      message: "Successfully posted a new item in the inventory.",
      item: newInventoryItem,
    });
  } catch (error) {
    console.error("Error creating new inventory item:", error);
    res.status(500).json({
      message: "Error occurred while creating a new inventory item.",
      error: error.message,
    });
  }
};

//PUT/EDIT and Inventory Item

export const editInventoryItem = async (req, res) => {
  const validation = inventoryValidator(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      message: validation.message,
      status: 400,
    });
  }

  const { warehouse_id, item_name, description, category, status, quantity } =
    req.body;

  try {
    const warehouseExists = await knex("warehouses")
      .where("id", warehouse_id)
      .first();
    if (!warehouseExists) {
      return res
        .status(400)
        .json({ message: "The provided warehouse_id does not exist." });
    }

    const inventoryItem = await knex("inventories")
      .where("id", req.params.id)
      .first();
    if (!inventoryItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    await knex("inventories").where("id", req.params.id).update({
      warehouse_id,
      item_name,
      description,
      category,
      status,
      quantity,
    });

    const updatedInventoryItem = await knex("inventories")
      .where("id", req.params.id)
      .first();

    res.status(200).json({
      message: "Successfully updated the inventory item.",
      item: updatedInventoryItem,
    });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    res.status(500).json({
      message: "Error occurred while updating the inventory item.",
      error: error.message,
    });
  }
};

export const deleteInventoryById = async (req, res) => {
  try {
    const inventoryDeleted = await knex("inventories")
      .where({ id: req.params.id })
      .delete();

    if (inventoryDeleted === 0) {
      return res
        .status(404)
        .json({
          message: `Inventory with ID ${req.params.id} not found`,
          status: 404,
        });
    }

    res
      .status(204)
      .json({
        message: `Inventory with ID ${req.params.id} successfully deleted`,
      });
  } catch (error) {
    console.error("Error inventory warehouse", error);
    res.status(500).json({
      message: `Unable to delete inventory: ${error}`,
    });
  }
};

export const getInventoriesByWarehouseId = async (req, res) => {
  const { id } = req.params;

  try {
    const warehouseExists = await knex("warehouses").where("id", id).first();

    if (!warehouseExists) {
      return res.status(404).json({
        message: `Warehouse with ID ${id} not found.`,
      });
    }

    const inventories = await knex("inventories")
      .where("warehouse_id", id)
      .select("id", "item_name", "category", "status", "quantity");

    res.status(200).json(inventories);
  } catch (error) {
    console.error("Error fetching inventories by warehouse ID:", error);
    res.status(500).json({
      message: "Error occurred while fetching inventories.",
      error: error.message,
    });
  }
};
