import num2fraction from 'num2fraction'
import React from 'react'
import {
  Form,
  OverlayTrigger,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import ControlLabel from './ControlLabel'
import { CalculatorData } from 'data/calculate'
import { CheckBoxFormValue } from 'data/data'

export const SegmentedControl: React.FunctionComponent<{
  id: keyof CalculatorData
  setter: (value: CalculatorData) => void
  data: CalculatorData
  source: { [key: string]: CheckBoxFormValue }
  label?: string
  header?: string
  helpText?: string
  popover?: JSX.Element
  hideRisk?: boolean
  className?: string
  labelFactory?: (value: string) => string
  variant?: string
}> = (props) => {
  const dataValue = props.id in props.data ? props.data[props.id] : ''
  const activeValue = typeof dataValue === 'string' ? dataValue : ''
  const { t } = useTranslation()
  // 0.25 -> "1/4x"
  function formatRiskMultiplierInternal(multiplier: number): string {
    if (multiplier === 1) {
      return t('calculator.baseline_risk_short')
    } else if (multiplier > 0 && multiplier < 1) {
      const frac = num2fraction(multiplier)
      return t('calculator.risk_modifier_multiple_short', { multiplier: frac })
    } else {
      return t('calculator.risk_modifier_multiple_short', {
        multiplier: multiplier,
      })
    }
  }
  const formatRiskMultiplier = (hideRisk?: boolean, multiplier?: number) => {
    if (hideRisk || multiplier === undefined) {
      return ''
    }
    return formatRiskMultiplierInternal(multiplier)
  }

  return (
    <div className="form-group">
      <ControlLabel
        id={props.id}
        label={props.label}
        header={props.header}
        popover={props.popover}
      />
      <div className="segmented-scrollable">
        <ToggleButtonGroup
          type="radio"
          name={props.id}
          id={props.id}
          className={'segmented-wrap ' + props.className}
          value={activeValue}
        >
          {Object.keys(props.source).map((value, index) => (
            <OverlayTrigger
              placement="top"
              key={value}
              overlay={
                <Tooltip
                  id={props.id + '-tooltip-' + value}
                  className="segmented-tooltip"
                  // DONOTSUBMIT show={props.data[props.id] === value}
                >
                  {props.source[value].value}
                </Tooltip>
              }
            >
              <ToggleButton
                key={index}
                type="radio"
                variant={props.variant}
                name={props.id}
                value={value}
                className="segmented-button"
                checked={props.data[props.id] === value}
                onChange={(e) => {
                  props.setter({
                    ...props.data,
                    [props.id]: e.currentTarget.value,
                  })
                }}
              >
                <span className="segmented-label">
                  {props.labelFactory
                    ? props.labelFactory(value)
                    : props.source[value].label}
                </span>
                <span className="segmented-multiplier">
                  {props.labelFactory
                    ? ''
                    : formatRiskMultiplier(
                        props.hideRisk,
                        props.source[value].multiplier,
                      )}
                </span>
                <span className="segmented-value">
                  {props.source[value].value}
                </span>
              </ToggleButton>
            </OverlayTrigger>
          ))}
        </ToggleButtonGroup>
        <Form.Text id={props.id + 'HelpText'} muted>
          {props.helpText}
        </Form.Text>
      </div>
    </div>
  )
}
