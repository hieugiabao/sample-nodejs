import signale from 'signale';

signale.config({
  displayTimestamp: true,
  displayDate: true,
});

export const logger = signale;
