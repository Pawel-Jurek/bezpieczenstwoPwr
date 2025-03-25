// Di  - Input pulse: covered distance
// t0i - Initialization time: displacement in the time axis
// μi  - Log-temporal delay
// σi  - Impulse response time of the neuromotor system
// θsi - Starting angle of the stroke
// θei -  Ending angle of the stroke

// velocity profile of strokes
//
const SQRT_2PI = Math.sqrt(2 * Math.PI);

interface Stroke {
  D: number;
  sigma: number;
  t0: number;
  mu: number;
}

function strokeVelocityProfile(i: Stroke, t: number): number {
  if (t <= i.t0) return 0;

  const denominator = SQRT_2PI * i.sigma * (t - i.t0);

  const exponent = Math.exp(
    -Math.pow(Math.log(t - i.t0) - i.mu, 2) / (2 * Math.pow(i.sigma, 2)),
  );

  return (i.D / denominator) * exponent;
}

// entire hand movement
function velocityProfile(strokes: Stroke[], t: number) { }

class VelocityProfile {
  constructor(data: unknown) { }
}
