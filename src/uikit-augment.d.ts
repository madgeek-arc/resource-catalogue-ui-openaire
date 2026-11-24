// @types/uikit (3.14, the nearest to UIkit 3.7) leaves out UIkit.getComponent and a slideshow's current index,
// which the slideshow dot navigation on the home and service overview pages reads.
import 'uikit';

declare global {
  /**
   * The UIkit that angular.json loads as a script (window.UIkit), the only copy the app runs. Use this global:
   * `import UIkit from 'uikit'` would bundle and boot a second copy (about 137 kB) into the importing chunk.
   */
  const UIkit: typeof import('uikit').default;
}

declare module 'uikit/dist/js/uikit' {
  namespace UIkit {
    /** The slideshow component on element; the callers only ask for one that is on the page. */
    function getComponent(element: Element | null, name: 'slideshow'): UIkitSlidershowElement & {index: number};
  }
}
