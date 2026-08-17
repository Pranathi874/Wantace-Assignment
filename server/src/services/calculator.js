export function calculateEstimate(config, answers) {
  const questions = config.questions || [];
  const modifiers = config.modifiers || {};

  const roofArea = Number(answers['roof_area'] || 0);

  const getOption = (key) => {
    const q = questions.find((x) => x.key === key);
    if (!q || !q.options) return null;
    return q.options.find((o) => o.value === answers[key]) || null;
  };

  const materialOpt = getOption('material');
  const pitchOpt = getOption('pitch');
  const layersOpt = getOption('layers');
  const storiesOpt = getOption('stories');

  const Rm = Number(materialOpt?.rate_per_sqft || 0);
  const Mp = Number(pitchOpt?.multiplier || 1.0);
  const Mt = Number(storiesOpt?.multiplier || 1.0);
  const Rt = Number(layersOpt?.tear_off_per_sqft || 0);

  const W = Number(modifiers.waste_factor ?? 0.1);
  const Fp = Number(modifiers.permit_flat_fee ?? 350);
  const S = Number(modifiers.range_spread_pct ?? 12) / 100;

  const baseMaterialCost = roofArea * Rm * (1 + W);
  const tearOffCost = roofArea * Rt;
  const adjustedSubtotal = (baseMaterialCost + tearOffCost) * Mp * Mt;
  const Emid = adjustedSubtotal + Fp;

  const Elow = Math.round(Emid * (1 - S));
  const Ehigh = Math.round(Emid * (1 + S));

  return { estimate_low: Elow, estimate_high: Ehigh, mid: Math.round(Emid) };
}
