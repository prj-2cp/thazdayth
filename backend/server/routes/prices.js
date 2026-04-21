const express = require("express");
const {body, validationResult} = require("express-validator");
const OliveCategory = require("../models/oliveCategoryModel");
const PressingService = require("../models/pressingServiceModel");
const {authenticate, ownerOnly} = require("../middleware/auth");
const router = express.Router()

