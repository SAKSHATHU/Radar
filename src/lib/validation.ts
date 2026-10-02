export type Errors = Partial<Record<'name' | 'cost' | 'nextCharge', string>>;

export function validate(values: { name: string; cost: string; nextCharge: string }): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = 'Name is required.';
  const cost = Number(values.cost);
  if (values.cost.trim() === '' || Number.isNaN(cost) || cost <= 0) errors.cost = 'Enter a cost greater than 0.';
  if (!values.nextCharge) errors.nextCharge = 'Pick the next charge date.';
  return errors;
}
