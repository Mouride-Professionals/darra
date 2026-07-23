const Joi = require('joi');
const AppError = require('../utils/AppError');

/** Returns middleware that validates req[target] against schema */
const validate = (schema, target = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[target], { abortEarly: false, stripUnknown: true });
  if (error) {
    const message = error.details.map((d) => d.message).join('; ');
    return next(new AppError(message, 422, 'VALIDATION_ERROR'));
  }
  req[target] = value;
  next();
};

/* ── Reusable field definitions ── */
const fields = {
  nomAr:       Joi.string().trim().required().label('Nom arabe'),
  nomFr:       Joi.string().trim().required().label('Nom français'),
  color:       Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#0C3B2E'),
  lat:         Joi.number().min(-90).max(90).required(),
  lng:         Joi.number().min(-180).max(180).required(),
  objectId:    Joi.string().hex().length(24).required(),
  email:       Joi.string().email().lowercase().trim().required(),
  password:    Joi.string().min(8).max(72).required(),
  nonNegInt:   Joi.number().integer().min(0).default(0),
};

const authSchemas = {
  register: Joi.object({
    nom:             Joi.string().trim().min(2).max(100).required(),
    email:           fields.email,
    password:        fields.password,
    role:            Joi.string().valid('SUPER_ADMIN', 'ADMIN', 'LECTEUR').optional(),
    quartierAssigne: Joi.string().hex().length(24).optional().allow(null),
  }),
  login: Joi.object({
    email:    fields.email,
    password: Joi.string().required(),
  }),
  updatePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword:     fields.password,
  }),
};

const daaraSchemas = {
  create: Joi.object({
    proprietaire: Joi.string().trim().min(2).max(200).required(),
    tel:          Joi.string().trim().allow('').default(''),
    quartier:     fields.objectId,
    garcons:      fields.nonNegInt,
    filles:       fields.nonNegInt,
    statut:       Joi.string().valid('ACTIF', 'INACTIF').default('ACTIF'),
  }),
  update: Joi.object({
    proprietaire: Joi.string().trim().min(2).max(200),
    tel:          Joi.string().trim().allow(''),
    quartier:     Joi.string().hex().length(24),
    garcons:      fields.nonNegInt,
    filles:       fields.nonNegInt,
    statut:       Joi.string().valid('ACTIF', 'INACTIF'),
  }),
  query: Joi.object({
    page:       Joi.number().integer().min(1).default(1),
    limit:      Joi.number().integer().min(1).max(500).default(20),
    search:     Joi.string().trim().allow(''),
    quartierId: Joi.string().hex().length(24),
    statut:     Joi.string().valid('ACTIF', 'INACTIF'),
  }),
};

const quartierSchemas = {
  create: Joi.object({
    nomAr: fields.nomAr,
    nomFr: fields.nomFr,
    color: fields.color,
    lat:   fields.lat,
    lng:   fields.lng,
  }),
  update: Joi.object({
    nomAr: Joi.string().trim(),
    nomFr: Joi.string().trim(),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
    lat:   Joi.number().min(-90).max(90),
    lng:   Joi.number().min(-180).max(180),
    isActive: Joi.boolean(),
  }),
};

module.exports = { validate, authSchemas, daaraSchemas, quartierSchemas };