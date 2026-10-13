const Vessel = require('../models/Vessel');
const Catch = require('../models/Catch');
const FuelLog = require('../models/FuelLog');
const Net = require('../models/Net');

// GET /api/vessels
exports.getAll = async (req, res) => {
  try {
    const vessels = await Vessel.find().sort({ name: 1 });
    res.json(vessels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/vessels/:id
exports.getOne = async (req, res) => {
  try {
    const vessel = await Vessel.findById(req.params.id);
    if (!vessel) return res.status(404).json({ error: 'Navire non trouvé' });
    res.json(vessel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/vessels
exports.create = async (req, res) => {
  try {
    const vessel = await Vessel.create(req.body);
    res.status(201).json(vessel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /api/vessels/:id
exports.update = async (req, res) => {
  try {
    const vessel = await Vessel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vessel) return res.status(404).json({ error: 'Navire non trouvé' });
    res.json(vessel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/vessels/:id/dashboard – KPIs d'un navire
exports.dashboard = async (req, res) => {
  try {
    const vesselId = req.params.id;
    const vessel = await Vessel.findById(vesselId);
    if (!vessel) return res.status(404).json({ error: 'Navire non trouvé' });

    const [catches, fuelLogs, nets, speciesAgg] = await Promise.all([
      Catch.find({ vessel: vesselId }).sort({ catchDate: -1 }).limit(50),
      FuelLog.find({ vessel: vesselId }).sort({ timestamp: -1 }).limit(30),
      Net.find({ vessel: vesselId }),
      // Totaux réels sur TOUTES les captures (et non plus seulement les 50 dernières)
      Catch.aggregate([
        { $match: { vessel: vessel._id } },
        { $group: { _id: '$species', kg: { $sum: '$quantityKg' }, count: { $sum: 1 } } },
        { $sort: { kg: -1 } },
      ]),
    ]);

    const totalCatchKg = speciesAgg.reduce((sum, s) => sum + s.kg, 0);
    const totalCatchCount = speciesAgg.reduce((sum, s) => sum + s.count, 0);
    const bySpecies = speciesAgg.reduce((acc, s) => {
      acc[s._id] = s.kg;
      return acc;
    }, {});

    const netsToInspect = nets.filter((n) => n.status === 'a_inspecter' || n.status === 'a_remplacer');

    res.json({
      vessel,
      kpis: {
        totalCatchKg,
        totalCatchCount,
        bySpecies,
        currentFuelLiters: vessel.currentFuel,
        fuelCapacity: vessel.capacity?.fuel,
        fuelPercent: vessel.capacity?.fuel
          ? Math.round((vessel.currentFuel / vessel.capacity.fuel) * 100)
          : null,
        activeNets: nets.filter((n) => n.status === 'operationnel').length,
        netsAlert: netsToInspect.length,
        lastSync: vessel.lastSyncAt,
        isOnline: vessel.isOnline,
      },
      recentCatches: catches.slice(0, 10),
      recentFuel: fuelLogs.slice(0, 10),
      nets,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
