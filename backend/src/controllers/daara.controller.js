const daaraService = require('../services/daara.service');
const asyncHandler = require('../utils/asyncHandler');

const getAll = asyncHandler(async (req, res) => {
  const result = await daaraService.getAll(req.query);
  res.status(200).json({ status: 'success', ...result });
});

const getById = asyncHandler(async (req, res) => {
  const daara = await daaraService.getById(req.params.id);
  res.status(200).json({ status: 'success', data: { daara } });
});

const getStats = asyncHandler(async (req, res) => {
  const stats = await daaraService.getStats();
  res.status(200).json({ status: 'success', data: { stats } });
});

const getConcentration = asyncHandler(async (req, res) => {
  const data = await daaraService.getConcentrationByQuartier();
  res.status(200).json({ status: 'success', data });
});

const create = asyncHandler(async (req, res) => {
  const daara = await daaraService.create(req.body, req.user);
  res.status(201).json({ status: 'success', data: { daara } });
});

const update = asyncHandler(async (req, res) => {
  const daara = await daaraService.update(req.params.id, req.body, req.user);
  res.status(200).json({ status: 'success', data: { daara } });
});

const remove = asyncHandler(async (req, res) => {
  await daaraService.remove(req.params.id, req.user);
  res.status(204).send();
});

module.exports = { getAll, getById, getStats, getConcentration, create, update, remove };
