import config from '../config';

export const getMainCurrency = currency => {
  if (!currency) {
    return {
      style: 'currency',
      currency: config.currency,
      currencyDisplay: 'symbol',
      useGrouping: true,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };
  }
  // const userCurrency = config.currency;
  // switch (currency) {
  //   case config.additionalCurrency:
  //     userCurrency = config.additionalCurrency;
  //     break;
  //   case config.additionalCurrencyEuro:
  //     userCurrency = config.additionalCurrencyEuro;
  //     break;
  //   default:
  //     userCurrency = config.currency;
  // }
  const userCurrency =
    currency === config.additionalCurrency ? config.additionalCurrency : config.currency;
  // userCurrency =
  //   currency === config.additionalCurrencyEuro ? config.additionalCurrencyEuro : config.currency;
  return {
    style: 'currency',
    currency: userCurrency,
    currencyDisplay: 'symbol',
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
};
