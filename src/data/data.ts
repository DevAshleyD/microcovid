import i18n from '../i18n'

import { fixedPointPrecisionPercent } from 'components/calculator/util/FormatPrecision'

export interface CheckBoxFormValue extends FormValue {
  value: string
  sublabel?: string
}

export interface BaseFormValue {
  label: string
  multiplier?: number
}

export interface FormValue extends BaseFormValue {
  multiplier: number
  housemateMultiplier?: number // Different multiplier to apply if the contact is a housemate.
}

export interface PersonRiskValue extends BaseFormValue {
  label: string
  personalMultiplier: number
  numHousemates: number
  numOtherTraceableContacts: number // Not including housemates
  contactsMultiplier: number
}

const formValue = function (label: string, multiplier: number): FormValue {
  return { label, multiplier }
}

export const TOP_LOCATION_MANUAL_ENTRY = 'MANUAL_DATA'

export const B117_CONTAGIOUSNESS_ADJUSTMENT = 1.5

export const oneTimeMult = 0.06 * B117_CONTAGIOUSNESS_ADJUSTMENT
export const housemateMult = 0.3
export const partnerMult = 0.48

export const Interaction: { [key: string]: FormValue } = {
  oneTime: {
    label: i18n.t('data.oneTime', {
      percentage: fixedPointPrecisionPercent(oneTimeMult),
    }),
    multiplier: oneTimeMult,
  },
  repeated: {
    label: i18n.t('data.repeated', {
      percentage: fixedPointPrecisionPercent(housemateMult),
    }),
    multiplier: housemateMult,
  },
  partner: {
    label: i18n.t('data.partner', {
      percentage: fixedPointPrecisionPercent(partnerMult),
    }),
    multiplier: partnerMult,
  },
}

export const Setting: { [key: string]: FormValue } = {
  indoor: { label: i18n.t('data.indoor'), multiplier: 1 },
  outdoor: { label: i18n.t('data.outdoor'), multiplier: 0.05 },
  filtered: { label: i18n.t('data.filtered'), multiplier: 0.25 },
  transit: { label: i18n.t('data.transit'), multiplier: 0.25 },
  plane: { label: i18n.t('data.plane'), multiplier: 1 / 6 },
  carWindowsDown: { label: i18n.t('data.car_windows_down'), multiplier: 0.25 },
  partiallyEnclosed: {
    label: i18n.t('data.partially_enclosed'),
    multiplier: 0.25,
  },
}

export const intimateDurationFloor = 60

export const Distance: { [key: string]: FormValue } = {
  intimate: formValue(i18n.t('data.intimate_distance'), 2),
  close: formValue(i18n.t('data.close_distance'), 2),
  normal: formValue(i18n.t('data.normal_distance'), 1),
  sixFt: formValue(i18n.t('data.sixft_distance'), 0.5),
  tenFt: formValue(i18n.t('data.tenft_distance'), 0.25),
}

const noneLabel = i18n.t('data.no_mask')
const thinLabel = i18n.t('data.thin_mask')
const basicLabel = i18n.t('data.basic_mask')
const surgicalLabel = i18n.t('data.surgical_mask')
const filteredLabel = i18n.t('data.filtered_mask')
const kn95Label = i18n.t('data.kn95_mask')
const n95Label = i18n.t('data.n95_mask')
const n95SealedLabel = i18n.t('data.n95_sealed_mask')
const p100Label = i18n.t('data.p100_mask')
export const TheirMask: { [key: string]: FormValue } = {
  none: formValue(noneLabel, 1.0),
  thin: formValue(thinLabel, 1 / 2),
  basic: formValue(basicLabel, 1 / 3),
  surgical: formValue(surgicalLabel, 1 / 4),
  filtered: formValue(filteredLabel, 1 / 4),
  kn95: formValue(kn95Label, 1 / 6),
  n95: formValue(n95Label, 1 / 6),
  n95Sealed: formValue(n95SealedLabel, 1 / 16),
  p100: formValue(p100Label, 1 / 3),
}
export const YourMask: { [key: string]: FormValue } = {
  none: formValue(noneLabel, 1.0),
  thin: formValue(thinLabel, 1.0),
  basic: formValue(basicLabel, 2 / 3),
  surgical: formValue(surgicalLabel, 1 / 2),
  filtered: formValue(filteredLabel, 1 / 2),
  kn95: formValue(kn95Label, 1 / 3),
  n95: formValue(n95Label, 1 / 3),
  n95Sealed: formValue(n95SealedLabel, 1 / 8),
  p100: formValue(p100Label, 1 / 20),
}
export const Voice: { [key: string]: FormValue } = {
  silent: {
    label: i18n.t('data.silent_voice'),
    multiplier: 0.2,
  },
  normal: { label: i18n.t('data.normal_voice'), multiplier: 1 },
  loud: {
    label: i18n.t('data.loud_voice'),
    multiplier: 5,
  },
}

export const BUDGET_ONE_PERCENT = 10000
export const BUDGET_ONE_TENTH_PERCENT = 1000

export const budgetOptions = [
  {
    label: i18n.t('calculator.risk_tolerance_1_percent_label'),
    sublabel: i18n.t('calculator.risk_tolerance_1_percent_explanation'),
    multiplier: 1,
    value: BUDGET_ONE_PERCENT.toString(),
  },
  {
    label: i18n.t('calculator.risk_tolerance_point1_percent_label'),
    sublabel: i18n.t('calculator.risk_tolerance_point1_percent_explanation'),
    multiplier: 0.1,
    value: BUDGET_ONE_TENTH_PERCENT.toString(),
  },
]

// TODO(beshaya): Move RiskProfile to it's own file.
/*
 * Exposed to ten (silent distanced masked) average people indoors,
 * while wearing a surgical mask, one-time, for one hour per week.
 */
export const livingAloneMult =
  10 *
  Voice.silent.multiplier *
  Distance.sixFt.multiplier *
  TheirMask.basic.multiplier *
  YourMask.surgical.multiplier *
  Interaction.oneTime.multiplier *
  Setting.indoor.multiplier

const HEALTHCARE_MULT = 2.0
const SYMPTOM_FREE_LAST_SEEN_TODAY_MULT = 0.5
const SYMPTOM_FREE_LAST_SEEN_MORE_THAN_THREE_DAYS_AGO = 1 / 7

export const personRiskMultiplier: (arg: {
  riskProfile: PersonRiskValue
  isHousemate: boolean
  symptomsChecked: string
}) => number = ({ riskProfile, isHousemate, symptomsChecked }) => {
  const symptomFreeMult =
    symptomsChecked !== 'no' ? SYMPTOM_FREE_LAST_SEEN_TODAY_MULT : 1
  const housemateSymptomFreeMult = symptomFreeMult
  const contactSymptomFreeMult =
    symptomsChecked === 'yesThreeDays'
      ? SYMPTOM_FREE_LAST_SEEN_MORE_THAN_THREE_DAYS_AGO
      : symptomFreeMult

  // Remove the person doing the calculation from the number of contacts if applicable.
  const housematesNotIncludingUser = Math.max(
    0,
    riskProfile.numHousemates - (isHousemate ? 1 : 0),
  )
  const housematesRisk =
    housemateSymptomFreeMult *
    housematesNotIncludingUser *
    riskProfile.contactsMultiplier
  const otherContactsRisk =
    contactSymptomFreeMult *
    riskProfile.numOtherTraceableContacts *
    riskProfile.contactsMultiplier

  const riskFromAllContacts =
    (housematesRisk + otherContactsRisk) * housemateMult

  return (
    (riskProfile.personalMultiplier + riskFromAllContacts) * symptomFreeMult
  )
}

// Shorthand for filling in RiskProfiles with no contacts
const noContacts = {
  numHousemates: 0,
  numOtherTraceableContacts: 0,
  contactsMultiplier: 0,
}

export const RiskProfile: { [key: string]: PersonRiskValue } = {
  average: {
    label: i18n.t('data.person.average'),
    personalMultiplier: 1.0,
    ...noContacts,
  },
  livingAlone: {
    label: i18n.t('data.person.livingAlone'),
    personalMultiplier: livingAloneMult,
    ...noContacts,
  },

  livingWithPartner: {
    label: i18n.t('data.person.livingWithPartner'),
    personalMultiplier: livingAloneMult,
    numHousemates: 1,
    numOtherTraceableContacts: 0,
    contactsMultiplier: livingAloneMult,
  },

  closedPod4: {
    label: i18n.t('data.person.closedPod4'),
    personalMultiplier: livingAloneMult,
    numHousemates: 3,
    numOtherTraceableContacts: 0,
    contactsMultiplier: livingAloneMult,
  },

  closedPod10: {
    label: i18n.t('data.person.closedPod10'),
    personalMultiplier: livingAloneMult,
    numHousemates: 9,
    numOtherTraceableContacts: 0,
    contactsMultiplier: livingAloneMult,
  },

  closedPod20: {
    label: i18n.t('data.person.closedPod20'),
    personalMultiplier: livingAloneMult,
    numHousemates: 19,
    numOtherTraceableContacts: 0,
    contactsMultiplier: livingAloneMult,
  },

  contact1: {
    label: i18n.t('data.person.contact1'),
    personalMultiplier: livingAloneMult,
    numHousemates: 0,
    numOtherTraceableContacts: 1,
    contactsMultiplier: 1,
  },

  contact4: {
    label: i18n.t('data.person.contact4'),
    personalMultiplier: livingAloneMult,
    numHousemates: 0,
    numOtherTraceableContacts: 3,
    contactsMultiplier: 1,
  },

  contact10: {
    label: i18n.t('data.person.contact10'),
    personalMultiplier: livingAloneMult,
    numHousemates: 0,
    numOtherTraceableContacts: 9,
    contactsMultiplier: 1,
  },

  contactWorks: {
    label: i18n.t('data.person.contactWorks'),
    personalMultiplier: livingAloneMult,
    numHousemates: 0,
    numOtherTraceableContacts: 1,
    contactsMultiplier: HEALTHCARE_MULT,
  },

  bars: {
    label: i18n.t('data.person.bars'),
    /*
     * Six hours of indoor exposure to a dozen people (2 near you, 10 six feet away)
     * who are not wearing masks and are talking loudly.
     */
    personalMultiplier:
      6 *
      Interaction.oneTime.multiplier *
      (2 + 10 * Distance.sixFt.multiplier * Voice.loud.multiplier),
    ...noContacts,
  },
}

// Special keys for RiskProfile that need to be checked elsewhere.
export const RiskProfileEnum = {
  ONE_PERCENT: 'onePercent',
  DECI_PERCENT: 'deciPercent',
  HAS_COVID: 'hasCovid',
}

RiskProfile[RiskProfileEnum.ONE_PERCENT] = {
  label: i18n.t('data.person.microcovid_budget_one_percent'),
  personalMultiplier: NaN,
  numHousemates: NaN,
  numOtherTraceableContacts: NaN,
  contactsMultiplier: NaN,
}

RiskProfile[RiskProfileEnum.DECI_PERCENT] = {
  label: i18n.t('data.person.microcovid_budget_deci_percent'),
  personalMultiplier: NaN,
  numHousemates: NaN,
  numOtherTraceableContacts: NaN,
  contactsMultiplier: NaN,
}

RiskProfile[RiskProfileEnum.HAS_COVID] = {
  label: i18n.t('data.person.hasCovid'),
  personalMultiplier: NaN,
  numHousemates: NaN,
  numOtherTraceableContacts: NaN,
  contactsMultiplier: NaN,
}
