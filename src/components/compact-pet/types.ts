/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CompactPetChar = 'blob' | 'bunny' | 'ghost' | 'dino';

export type CompactPetThemeId = 'red' | 'pink' | 'purple' | 'blue' | 'green' | 'orange';

export interface CompactPetTheme {
  id: CompactPetThemeId;
  name: string;
  primary: string;
  secondary: string;
  dark: string;
  ring: string;
  glow: string;
}
