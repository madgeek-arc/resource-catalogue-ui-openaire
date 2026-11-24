import BitSet from 'bitset';

/** Progress through a form's tabs. Kept apart from dynamic-form-model so that bitset loads only with the form, not in the main bundle. */
export class Tab {
  valid: boolean;
  order: number;
  requiredOnTab: number;
  remainingOnTab: number;
  bitSet: BitSet;

  constructor() {
    this.valid = false;
    this.order = 0;
    this.requiredOnTab = 0;
    this.remainingOnTab = 0;
    this.bitSet = new BitSet();
  }
}

export class Tabs {
  tabs: Map<string, Tab>;
  requiredTabs: number;
  completedTabs: number;
  completedTabsBitSet: BitSet;
  requiredTotal: number;

  /** chapter-edit fills these in initializations() before its template renders. */
  constructor() {
    this.tabs = new Map();
    this.requiredTabs = 0;
    this.completedTabs = 0;
    this.completedTabsBitSet = new BitSet();
    this.requiredTotal = 0;
  }
}
