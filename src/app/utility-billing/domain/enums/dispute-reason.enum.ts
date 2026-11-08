/** Reason a tenant gives when disputing a bill. */
export enum DisputeReason {
  ConsumptionAboveBaseline = 'CONSUMPTION_ABOVE_BASELINE',
  Rate = 'RATE',
  MeterReading = 'METER_READING',
  Other = 'OTHER',
}
