const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = Object.freeze({ SUPER_ADMIN: 'SUPER_ADMIN', ADMIN: 'ADMIN', LECTEUR: 'LECTEUR' });

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String, required: true, unique: true,
      lowercase: true, trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.LECTEUR },
    /** Admin peut etre restreint a un seul quartier */
    quartierAssigne: { type: mongoose.Schema.Types.ObjectId, ref: 'Quartier', default: null },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    refreshTokenHash: { type: String, select: false, default: null },
  },
  { timestamps: true }
);

/* ── Hash password before save ── */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* ── Instance methods ── */
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    nom: this.nom,
    email: this.email,
    role: this.role,
    quartierAssigne: this.quartierAssigne,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };
};

/* ── Prevent password from leaking in toJSON ── */
userSchema.set('toJSON', {
  transform: (_, obj) => {
    delete obj.password;
    delete obj.refreshTokenHash;
    delete obj.__v;
    return obj;
  },
});

const User = mongoose.model('User', userSchema);
module.exports = { User, ROLES };
