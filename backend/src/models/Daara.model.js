const mongoose = require('mongoose');

const daaraSchema = new mongoose.Schema(
  {
    proprietaire: { type: String, required: true, trim: true, maxlength: 200 },
    tel:      { type: String, trim: true, default: '' },
    quartier: { type: mongoose.Schema.Types.ObjectId, ref: 'Quartier', required: true },
    garcons:  { type: Number, default: 0, min: 0 },
    filles:   { type: Number, default: 0, min: 0 },
    statut:   { type: String, enum: ['ACTIF', 'INACTIF'], default: 'ACTIF' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, obj) => { delete obj.__v; return obj; },
    },
  }
);

daaraSchema.virtual('total').get(function () {
  return (this.garcons ?? 0) + (this.filles ?? 0);
});

daaraSchema.index({ quartier: 1 });
daaraSchema.index({ proprietaire: 'text', tel: 'text' });

const Daara = mongoose.model('Daara', daaraSchema);
module.exports = Daara;
