// @types/uikit (3.14, the nearest to UIkit 3.7) leaves out UIkit.getComponent and a slideshow's current index,
// which the slideshow dot navigation on the home and service overview pages reads.
import 'uikit';

declare module 'uikit/dist/js/uikit' {
  namespace UIkit {
    /** The slideshow component on element; the callers only ask for one that is on the page. */
    function getComponent(element: Element | null, name: 'slideshow'): UIkitSlidershowElement & {index: number};
  }
}
