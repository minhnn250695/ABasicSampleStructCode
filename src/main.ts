import 'core-js';
import 'reflect-metadata';
import 'zone.js/dist/zone';
/**
 * Hammerjs must be imported for gestures
 */
import 'hammerjs';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { enableProdMode } from '@angular/core';

enableProdMode();
platformBrowserDynamic().bootstrapModule(AppModule);