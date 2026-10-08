import { Routes } from '@angular/router';

export const RESOURCE_ASSET_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/views/iot-device-list/iot-device-list').then((m) => m.IoTDeviceList),
  },
];
