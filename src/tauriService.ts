/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WillpowerRule } from './types';
import { INITIAL_WILLPOWER_RULES } from './data';

// Detect if running inside the Tauri container
const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined;

export async function fetchWillpowerRules(): Promise<WillpowerRule[]> {
  if (isTauri) {
    try {
      // @ts-ignore
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<WillpowerRule[]>('get_rules');
    } catch (e) {
      console.error("Tauri get_rules command failed, falling back to storage: ", e);
    }
  }

  // Fallback to local storage
  const local = localStorage.getItem('monk_mode_rules');
  if (local) {
    return JSON.parse(local);
  }
  // Initialize with defaults if empty
  localStorage.setItem('monk_mode_rules', JSON.stringify(INITIAL_WILLPOWER_RULES));
  return INITIAL_WILLPOWER_RULES;
}

export async function addWillpowerRule(rule: Omit<WillpowerRule, 'id'>): Promise<number> {
  if (isTauri) {
    try {
      // @ts-ignore
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<number>('add_rule', {
        title: rule.title,
        condition: rule.condition,
        intervention: rule.intervention,
        details: rule.details
      });
    } catch (e) {
      console.error("Tauri add_rule failed, falling back: ", e);
    }
  }

  const rules = await fetchWillpowerRules();
  const nextId = rules.length > 0 ? Math.max(...rules.map((r) => r.id)) + 1 : 1;
  const newRule: WillpowerRule = {
    id: nextId,
    title: rule.title,
    condition: rule.condition,
    intervention: rule.intervention,
    details: rule.details
  };
  localStorage.setItem('monk_mode_rules', JSON.stringify([...rules, newRule]));
  return nextId;
}

export async function updateWillpowerRule(rule: WillpowerRule): Promise<void> {
  if (isTauri) {
    try {
      // @ts-ignore
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('update_rule', {
        id: rule.id,
        title: rule.title,
        condition: rule.condition,
        intervention: rule.intervention,
        details: rule.details
      });
      return;
    } catch (e) {
      console.error("Tauri update_rule failed, falling back: ", e);
    }
  }

  const rules = await fetchWillpowerRules();
  const updated = rules.map((r) => r.id === rule.id ? rule : r);
  localStorage.setItem('monk_mode_rules', JSON.stringify(updated));
}

export async function deleteWillpowerRule(id: number): Promise<void> {
  if (isTauri) {
    try {
      // @ts-ignore
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('delete_rule', { id });
      return;
    } catch (e) {
      console.error("Tauri delete_rule failed, falling back: ", e);
    }
  }

  const rules = await fetchWillpowerRules();
  const filtered = rules.filter((r) => r.id !== id);
  localStorage.setItem('monk_mode_rules', JSON.stringify(filtered));
}
