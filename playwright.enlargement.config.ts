import {defineConfig} from '@playwright/test';
import base from './playwright.compat.config';
/** Supplemental native Chromium zoom/font review against built assets. */
export default defineConfig({...base,testMatch:['e2e/enlargement.spec.ts'],projects:[{name:'chromium-native-production',use:{browserName:'chromium'}}]});
