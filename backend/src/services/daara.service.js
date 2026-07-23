const Daara = require('../models/Daara.model');
const Quartier = require('../models/Quartier.model');
const AppError = require('../utils/AppError');
const { ROLES } = require('../models/User.model');

const BASE_POPULATE = { path: 'quartier', select: 'nomAr nomFr color lat lng' };

/** Enforce quartier-level restriction for ADMIN role */
const assertQuartierAccess = (user, quartierId) => {
  if (user.role === ROLES.SUPER_ADMIN) return;
  if (user.role === ROLES.ADMIN) {
    if (!user.quartierAssigne || user.quartierAssigne.toString() !== quartierId?.toString()) {
      throw new AppError("Vous n'avez pas accès à ce quartier.", 403);
    }
    return;
  }
  throw new AppError("Action non autorisée.", 403);
};

const getAll = async ({ page = 1, limit = 20, search, quartierId, statut }) => {
  const filter = {};
  if (quartierId) filter.quartier = quartierId;
  if (statut) filter.statut = statut;
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Daara.find(filter).populate(BASE_POPULATE).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Daara.countDocuments(filter),
  ]);

  return { data, total, page, totalPages: Math.ceil(total / limit) };
};

const getById = async (id) => {
  const daara = await Daara.findById(id).populate(BASE_POPULATE);
  if (!daara) throw new AppError('Daara introuvable.', 404);
  return daara;
};

const getStats = async () => {
  const result = await Daara.aggregate([
    {
      $group: {
        _id: null,
        totalDaara:   { $sum: 1 },
        totalGarcons: { $sum: '$garcons' },
        totalFilles:  { $sum: '$filles' },
        totalEleves:  { $sum: { $add: ['$garcons', '$filles'] } },
      },
    },
  ]);
  return result[0] ?? { totalDaara: 0, totalGarcons: 0, totalFilles: 0, totalEleves: 0 };
};

const getConcentrationByQuartier = async () => {
  return Daara.aggregate([
    {
      $group: {
        _id: '$quartier',
        count:        { $sum: 1 },
        totalGarcons: { $sum: '$garcons' },
        totalFilles:  { $sum: '$filles' },
        totalEleves:  { $sum: { $add: ['$garcons', '$filles'] } },
      },
    },
    {
      $lookup: {
        from: 'quartiers', localField: '_id',
        foreignField: '_id', as: 'quartier',
      },
    },
    { $unwind: '$quartier' },
    {
      $project: {
        quartier: { _id: 1, nomAr: 1, nomFr: 1, color: 1, lat: 1, lng: 1 },
        count: 1, totalGarcons: 1, totalFilles: 1, totalEleves: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);
};

const create = async (data, user) => {
  assertQuartierAccess(user, data.quartier);

  const quartier = await Quartier.findById(data.quartier);
  if (!quartier) throw new AppError('Quartier introuvable.', 404);

  const daara = await Daara.create(data);
  return daara.populate(BASE_POPULATE);
};

const update = async (id, data, user) => {
  const existing = await Daara.findById(id);
  if (!existing) throw new AppError('Daara introuvable.', 404);

  assertQuartierAccess(user, existing.quartier);

  /* If quartier is being changed, check access to new quartier too */
  if (data.quartier && data.quartier.toString() !== existing.quartier.toString()) {
    assertQuartierAccess(user, data.quartier);
    const newQ = await Quartier.findById(data.quartier);
    if (!newQ) throw new AppError('Quartier cible introuvable.', 404);
  }

  const updated = await Daara.findByIdAndUpdate(id, data, {
    new: true, runValidators: true,
  }).populate(BASE_POPULATE);

  return updated;
};

const remove = async (id, user) => {
  const daara = await Daara.findById(id);
  if (!daara) throw new AppError('Daara introuvable.', 404);
  assertQuartierAccess(user, daara.quartier);
  await daara.deleteOne();
};

module.exports = { getAll, getById, getStats, getConcentrationByQuartier, create, update, remove };
