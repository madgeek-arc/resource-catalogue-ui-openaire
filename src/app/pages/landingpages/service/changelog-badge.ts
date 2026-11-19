/** Background colour of a change-log entry's type badge; undefined for types without one. */
export function changeLogBadgeColor(status: string): string | undefined {
  switch (status) {
    case 'Add':
    case 'Changed':
      return 'rgb(76, 137, 242)';
    case 'Added':
      return 'rgb(20, 179, 119)';
    case 'Fixed':
      return 'rgb(240, 80, 110)';
    case 'Removed':
      return 'rgb(250, 160, 90)';
    default:
      return undefined;
  }
}
