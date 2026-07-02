/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  tech: string[];
  link: string;
  github?: string;
  category: 'web' | 'design' | 'experimental';
  featured: boolean;
}

export interface Skill {
  name: string;
  category: 'Frontend' | 'Design' | 'Tools & Backend';
  level: number; // 1 to 5
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}
