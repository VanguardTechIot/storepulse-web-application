/**
 * Devices of the gallery as Resource and Asset Management reports them: only what the
 * dashboard needs (US-50: disconnected devices).
 */
export interface DeviceConnectivitySummary {
  total: number;
  disconnected: number;
}
