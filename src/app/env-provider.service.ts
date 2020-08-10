import { Injectable } from '@angular/core';

import { environment } from '../environments/environment';

@Injectable()
export class EnvProviderService {

  constructor() { }

  getBaseUrl() {
    return environment.base_url;
  }
}
