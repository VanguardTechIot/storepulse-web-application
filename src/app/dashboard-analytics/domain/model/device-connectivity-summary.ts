/**
 * Devices of the gallery as Resource and Asset Management reports them: only what the
 * dashboard needs: registered and disconnected devices.
 */
export interface DeviceConnectivitySummary {
  total: number;
  disconnected: number;
}
