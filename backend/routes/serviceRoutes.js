const express = require("express")

const router = express.Router()

const {
  createService,
  getProviderServices,
  getAllServices,
  updateService,
  deleteService,
} = require(
  "../controllers/serviceController"
)

const {
  protect,
} = require("../middleware/authMiddleware")

router.post(
  "/create",
  protect,
  createService
)

router.get(
  "/provider",
  protect,
  getProviderServices
)

router.get(
  "/all",
  getAllServices
)

router.put(
  "/update/:id",
  protect,
  updateService
)

router.delete(
  "/delete/:id",
  protect,
  deleteService
)

module.exports = router