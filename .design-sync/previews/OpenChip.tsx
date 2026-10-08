import { OpenChip } from '@balibu/design-system';

export const OpenNow = () => <OpenChip state={{ open: true, label: 'Open now · until 9 pm' }} />;

export const OpensLater = () => <OpenChip state={{ open: false, label: 'Opens 10 am' }} />;

export const ClosedTonight = () => <OpenChip state={{ open: false, label: 'Closed · opens 10 am tomorrow' }} />;
