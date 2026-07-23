const quartierService = require('../services/quartier.service');
const asyncHandler = require('../utils/asyncHandler');

const getAll = asyncHandler(async (req, res) => {
  const quartiers = await quartierService.getAll();
  res.status(200).json({ status: 'success', data: { quartiers } });
});

const getById = asyncHandler(async (req, res) => {
  const quartier = await quartierService.getById(req.params.id);
  res.status(200).json({ status: 'success', data: { quartier } });
});

const create = asyncHandler(async (req, res) => {
  const quartier = await quartierService.create(req.body);
  res.status(201).json({ status: 'success', data: { quartier } });
});

const update = asyncHandler(async (req, res) => {
  const quartier = await quartierService.update(req.params.id, req.body);
  res.status(200).json({ status: 'success', data: { quartier } });
});

const remove = asyncHandler(async (req, res) => {
  await quartierService.remove(req.params.id);
  res.status(204).send();
});

module.exports = { getAll, getById, create, update, remove };
