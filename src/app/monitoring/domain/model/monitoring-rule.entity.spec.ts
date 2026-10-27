import { MonitoringRule } from './monitoring-rule.entity';
import { Measurement } from './measurement.entity';
import { Threshold } from './threshold';

const measurement = (type: Measurement['type'], value: number) =>
  new Measurement('msr-1', 'tel-1', type, value, '%', new Date('2026-10-08T09:00:00Z'));

describe('MonitoringRule', () => {
  const rule = new MonitoringRule(
    'rul-1',
    'High humidity',
    'HUMIDITY',
    new Threshold(85, 'GREATER_THAN_OR_EQUAL'),
    true,
    new Date('2026-04-02T15:00:00Z'),
  );

  it('evaluates measurements of its type against the threshold', () => {
    expect(rule.evaluate(measurement('HUMIDITY', 85))).toBe(true);
    expect(rule.evaluate(measurement('HUMIDITY', 84.9))).toBe(false);
    expect(rule.evaluate(measurement('TEMPERATURE', 90))).toBe(false);
  });

  it('does not evaluate measurements while disabled', () => {
    expect(rule.disable().evaluate(measurement('HUMIDITY', 95))).toBe(false);
    expect(rule.disable().enable().evaluate(measurement('HUMIDITY', 95))).toBe(true);
  });
});

describe('Threshold', () => {
  it.each([
    ['GREATER_THAN', 10, false],
    ['GREATER_THAN_OR_EQUAL', 10, true],
    ['LESS_THAN', 9, true],
    ['LESS_THAN_OR_EQUAL', 10, true],
    ['EQUAL', 10, true],
  ] as const)('%s 10 with value %d is %s', (operator, value, expected) => {
    expect(new Threshold(10, operator).evaluate(value)).toBe(expected);
  });
});
