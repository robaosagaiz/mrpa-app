export interface MeasurementInput {
  pas: number
  pad: number
  pulse: number
}

export interface ValidationResult {
  isDiscrepant: boolean
  warnings: string[]
}

export function validateMeasurement(m: MeasurementInput): ValidationResult {
  const warnings: string[] = []

  if (m.pas < 70) warnings.push("PAS abaixo de 70 mmHg")
  if (m.pas > 250) warnings.push("PAS acima de 250 mmHg")

  if (m.pad < 40) warnings.push("PAD abaixo de 40 mmHg")
  if (m.pad > 140) warnings.push("PAD acima de 140 mmHg")

  const pulsePressure = m.pas - m.pad
  if (pulsePressure < 20) warnings.push("Diferença PAS-PAD menor que 20 mmHg")
  if (pulsePressure > 100) warnings.push("Diferença PAS-PAD maior que 100 mmHg")

  return {
    isDiscrepant: warnings.length > 0,
    warnings,
  }
}
