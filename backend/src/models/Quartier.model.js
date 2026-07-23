const mongoose = require('mongoose');

const quartierSchema = new mongoose.Schema(
  {
    nomAr: { type: String, required: true, trim: true, unique: true },
    nomFr: { type: String, required: true, trim: true },
    color: { type: String, default: '#0C3B2E', match: /^#[0-9A-Fa-f]{6}$/ },
    lat:   { type: Number, required: true, min: -90,  max: 90  },
    lng:   { type: Number, required: true, min: -180, max: 180 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (_, obj) => { delete obj.__v; return obj; } },
  }
);

quartierSchema.virtual('totalDaara').get(function () {
  return this._totalDaara ?? undefined;
});

const Quartier = mongoose.model('Quartier', quartierSchema);
module.exports = Quartier;
