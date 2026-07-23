const Quartier = require('../models/Quartier.model');
const Daara = require('../models/Daara.model');
const AppError = require('../utils/AppError');

const getAll = async () => {
  const quartiers = await Quartier.find({ isActive: true }).sort({ nomFr: 1 });

  /* Attach daara count to each quartier */
  const counts = await Daara.aggregate([
    { $group: { _id: '$quartier', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));

  return quartiers.map((q) => {
    const obj = q.toJSON();
    obj.totalDaara = countMap[q._id.toString()] ?? 0;
    return obj;
  });
};

const getById = async (id) => {
  const q = await Quartier.findById(id);
  if (!q) throw new AppError('Quartier introuvable.', 404);
  return q;
};

const create = async (data) => {
  const existing = await Quartier.findOne({ nomAr: data.nomAr });
  if (existing) throw new AppError('Un quartier avec ce nom arabe existe déjà.', 409);
  return Quartier.create(data);
};

const update = async (id, data) => {
  const updated = await Quartier.findByIdAndUpdate(id, data, {
    new: true, runValidators: true,
  });
  if (!updated) throw new AppError('Quartier introuvable.', 404);
  return updated;
};

const remove = async (id) => {
  const daara = await Daara.countDocuments({ quartier: id });
  if (daara > 0) {
    throw new AppError(
      `Impossible de supprimer : ${daara} daara sont liés à ce quartier.`, 409
    );
  }
  const q = await Quartier.findByIdAndDelete(id);
  if (!q) throw new AppError('Quartier introuvable.', 404);
};

module.exports = { getAll, getById, create, update, remove };
