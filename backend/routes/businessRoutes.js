const express = require("express")

const router = express.Router()

const {
  createBusiness,
  getProviderBusiness,
  getAllBusinesses,
  approveBusiness,
  rejectBusiness,
} = require("../controllers/businessController")

const {
  protect,
} = require("../middleware/authMiddleware")

router.post(
  "/create",
  protect,
  createBusiness
)

router.get(
  "/my-business",
  protect,
  getProviderBusiness
)

router.get(
  "/all",
  protect,
  getAllBusinesses
)

router.put(
  "/approve/:id",
  protect,
  approveBusiness
)

router.put(
  "/reject/:id",
  protect,
  rejectBusiness
)

module.exports = router