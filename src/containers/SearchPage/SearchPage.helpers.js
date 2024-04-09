import intersection from 'lodash/intersection';
import config from '../../config';
import { createResourceLocatorString } from '../../util/routes';
import { parseSelectFilterOptions } from '../../util/search';
import { createSlug } from '../../util/urlHelpers';
import routeConfiguration from '../../routeConfiguration';

const flatten = (acc, val) => acc.concat(val);

/**
 * Validates a filter search param agains a filters configuration.
 *
 * All invalid param names and values are dropped
 *
 * @param {String} queryParamName Search parameter name
 * @param {Object} paramValue Search parameter value
 * @param {Object} filters Filters configuration
 */

export const validURLParamForExtendedData = (queryParamName, paramValueRaw, filters) => {
  //NOTE v2s1 filterupdate -- v5 update deleted below
  // const filtersArray = Object.values(filters);
  // console.log(queryParamName, paramValueRaw, filters)
  // Resolve configuration for this filter
  const filterConfig = filters.filter(f => {
    const isArray = Array.isArray(f.queryParamNames);
    return isArray
      ? f.queryParamNames.includes(queryParamName)
      : f.queryParamNames === queryParamName;
  });
  //NOTE v2s1 filterupdate -- before v5 update, was below
  // const filterConfig = filtersArray.find(f => f.paramName === paramName);

  const paramValue = paramValueRaw.toString();

  //NOTE v2s1 filterupdate -- before v5 update, was below
  // if (filterConfig && valueArray.length > 0) {
  //    const { min, max, active } = filterConfig.config || {};
  //
  //    if (filterConfig.options) {
  //      // Single and multiselect filters
  //      const allowedValues = filterConfig.options.map(o => o.key);
  //      const allowedValues = flattenOptions(filterConfig.options);  //edited for custom nested filters
  if (filterConfig) {
    const { min, max } = filterConfig.config || {};

    if (['SelectSingleFilter', 'SelectMultipleFilter'].includes(filterConfig.type)) {
      // Pick valid select options only
      const allowedValues = filterConfig.config.options.map(o => o.key);
      const valueArray = parseSelectFilterOptions(paramValue);
      const validValues = intersection(valueArray, allowedValues).join(',');

      return validValues.length > 0 ? { [queryParamName]: validValues } : {};
    } else if (filterConfig.type === 'PriceFilter') {
      // Restrict price range to correct min & max
      const valueArray = paramValue ? paramValue.split(',') : [];
      const validValues = valueArray.map(v => {
        return v < min ? min : v > max ? max : v;
      });
      return validValues.length === 2 ? { [queryParamName]: validValues.join(',') } : {};
    } else if (filterConfig) {
      // Generic filter - remove empty params
      return paramValue.length > 0 ? { [queryParamName]: paramValue } : {};
    }
  }
  return {};
};

//NOTE DELETEME? v2s1 filterupdate -- previous custom nested code
// // Flatten nested options
// const flattenOptions = options => {
//   return options.reduce((acc, o) => {
//     o.children && o.children.length
//       ? o.children.map(c => acc.push(c.key))
//       : acc.push(o.key)
//
//     return acc
//   }, [])
// };

/**
 * Checks filter param value validity.
 *
 * Non-filter params are dropped.
 *
 * @param {Object} params Search params
 * @param {Object} filters Filters configuration
 */
export const validFilterParams = (params, filters) => {
  const filterParamNames = filters.map(f => f.queryParamNames).reduce(flatten, []);
  const paramEntries = Object.entries(params);

  return paramEntries.reduce((validParams, entry) => {
    const [paramName, paramValue] = entry;

    return filterParamNames.includes(paramName)
      ? {
          ...validParams,
          ...validURLParamForExtendedData(paramName, paramValue, filters),
        }
      : { ...validParams };
  }, {});
};

/**
 * Checks filter param value validity.
 *
 * Non-filter params are returned as they are.
 *
 * @param {Object} params Search params
 * @param {Object} filters Filters configuration
 */
export const validURLParamsForExtendedData = (params, filters) => {
  const filterParamNames = filters.map(f => f.queryParamNames).reduce(flatten, []);
  const paramEntries = Object.entries(params);

  return paramEntries.reduce((validParams, entry) => {
    const [paramName, paramValue] = entry;
    return filterParamNames.includes(paramName)
      ? {
          ...validParams,
          ...validURLParamForExtendedData(paramName, paramValue, filters),
        }
      : { ...validParams, [paramName]: paramValue };
  }, {});
};

// Flatten nested options
const flattenOptions = options => {
  return options.reduce((acc, o) => {
    o.children && o.children.length ? o.children.map(c => acc.push(c.key)) : acc.push(o.key);

    return acc;
  }, []);
};

// extract search parameters, including a custom URL params
// which are validated by mapping the values to marketplace custom config.
export const pickSearchParamsOnly = (params, filters, sortConfig) => {
  const { address, origin, bounds, pub_category, ...rest } = params || {};

  const boundsMaybe = bounds ? { bounds } : {};
  const originMaybe = config.sortSearchByDistance && origin ? { origin } : {};
  const filterParams = validFilterParams(rest, filters);
  const sort = rest[sortConfig.queryParamName];
  const sortMaybe = sort ? { sort } : {};

  return {
    ...boundsMaybe,
    ...originMaybe,
    ...filterParams,
    ...sortMaybe,
  };
};

export const createSearchResultSchema = (listings, address, intl, pub_category, filterConfig) => {
  // Schema for search engines (helps them to understand what this page is about)
  // http://schema.org
  // We are using JSON-LD format
  const siteTitle = config.siteTitle;
  const newAddress = address && address.substring(0, address.indexOf(','));
  const searchAddress =
    newAddress ||
    (address === 'World Wide'
      ? intl.formatMessage({ id: 'SearchPage.schemaMapSearchWW' })
      : intl.formatMessage({ id: 'SearchPage.schemaMapSearch' }));
  const schemaDescription = intl.formatMessage({ id: 'SearchPage.schemaDescription' });
  // const nail = [
  //   'nail-technician',
  //   'hair-stylist',
  //   'cosmetics',
  //   'makeup-artist',
  //   'beauty-treatment-room',
  //   'barber',
  // ];
  // const fitness = ['fitness', 'therapy-room', 'wellness-treatment-room'];
  // const art = ['photography', 'art', 'music'];
  // const event = ['event-space', 'outdoor-site', 'shoot-location'];
  // const space = ['desk-space', 'office-space', 'meeting-room-space'];
  const filt = pub_category ? pub_category.replace('has_any:', '').split(',') : '';
  let schemaTitle;
  if (address === 'World Wide') {
    schemaTitle = intl.formatMessage({ id: 'SearchPage.schemaTitleWW' }, { address, siteTitle });
    console.log('helpers1: ', searchAddress, address);
  } else if (searchAddress == 'United Kingdom' && address !== 'World Wide') {
    schemaTitle = intl.formatMessage(
      { id: 'SearchPage.schemaTitleUK' },
      { searchAddress, siteTitle }
    );
    console.log('helpers2: ', searchAddress, address);
  } else {
    schemaTitle = intl.formatMessage(
      { id: 'SearchPage.schemaTitle' },
      { searchAddress, siteTitle }
    );
    console.log('helpers3: ', searchAddress, address);
  }
  let firstThreeCategoryTitle;

  const arrayCategory = filterConfig.filter(e => e.queryParamNames[0] === 'pub_category');
  arrayCategory.forEach(e => {
    // let article = 'to rent';
    const arrForHire = [
      'tattoo-and-piercing',
      'dance-studio',
      'sports-hall',
      'outdoor-site',
      'meeting-room-space',
      'conference-room',
      'classroom',
      'recording-studio',
      'gallery-space',
      'rehearsal-space',
      'music-venue',
      'private-event-space',
      'sports-venue',
      'conference-exhibition',
      'outdoor-events',
      'private-dining',
    ];

    const arrToHire = [
      'activity-room',
      'classroom',
      'recording-studio',
      'drama-studio',
      'theatre-space',
    ];
    const arrForHireSpace = [
      'hair-stylist',
      'barber',
      'makeup-artist',
      'nail-technician',
      'cosmetics',
      'beauty-treatment-room',
    ];

    const cat = e.config.catKeys.split(',');

    if (!!filt && filt.sort().join(',') === cat.sort().join(',') && filt.includes('hair-stylist')) {
      firstThreeCategoryTitle = intl.formatMessage(
        { id: 'SearchPage.schemaTitleNairBeauty' },
        { searchAddress, siteTitle }
      );
    } else if (
      !!filt &&
      filt.sort().join(',') === cat.sort().join(',') &&
      filt.includes('therapy-room')
    ) {
      firstThreeCategoryTitle = intl.formatMessage(
        { id: 'SearchPage.schemaTitleWellness' },
        { searchAddress, siteTitle }
      );
    } else if (
      !!filt &&
      filt.sort().join(',') === cat.sort().join(',') &&
      filt.includes('fitness')
    ) {
      firstThreeCategoryTitle = intl.formatMessage(
        { id: 'SearchPage.schemaTitleFitness' },
        { searchAddress, siteTitle }
      );
    }

    if (!!filt && filt.every(e => cat.includes(e))) {
      const article = filt.some(e => arrToHire.includes(e))
        ? 'to hire'
        : // filt.some(e => arrForHire.includes(e)) ? 'for hire' : filt.some(e => arrForHireSpace.includes(e)) ? 'space to rent' : 'to rent';
        filt.some(e => arrForHire.includes(e))
        ? 'for hire'
        : 'to rent';

      const aaa = e.config.options.filter(el => filt.indexOf(el.key) != -1).map(e => e.metaLabel);
      const ddd =
        aaa.includes('Kitchen Space') && aaa.length >= 2
          ? aaa.filter(item => item !== 'Kitchen Space')
          : aaa;
      const uniqueCategory = ddd.join(', ');
      const eventsCat = cat.filter(e => e !== 'kitchen-space');

      // console.log(cat, "!!!!!!!cat");
      // console.log(uniqueCategory, "!!!!!!!!uniqueCategory");

      !uniqueCategory
        ? (schemaTitle = intl.formatMessage(
            { id: 'SearchPage.schemaTitle' },
            { searchAddress, siteTitle }
          ))
        : filt.sort().join(',') === cat.sort().join(',') && filt.includes('hair-stylist')
        ? (schemaTitle = intl.formatMessage(
            { id: 'SearchPage.schemaTitleNairBeauty' },
            { searchAddress, siteTitle }
          ))
        : filt.sort().join(',') === cat.sort().join(',') && filt.includes('therapy-room')
        ? (schemaTitle = intl.formatMessage(
            { id: 'SearchPage.schemaTitleWellness' },
            { searchAddress, siteTitle }
          ))
        : filt.sort().join(',') === cat.sort().join(',') && filt.includes('fitness')
        ? (schemaTitle = intl.formatMessage(
            { id: 'SearchPage.schemaTitleFitness' },
            { searchAddress, siteTitle }
          ))
        : filt.sort().join(',') === cat.sort().join(',') && filt.includes('photography')
        ? (schemaTitle = intl.formatMessage(
            { id: 'SearchPage.schemaTitlePhotographyFilm' },
            { searchAddress, siteTitle }
          ))
        : filt.sort().join(',') === cat.sort().join(',') && filt.includes('desk-space')
        ? (schemaTitle = intl.formatMessage(
            { id: 'SearchPage.schemaTitleCoworking' },
            { searchAddress, siteTitle }
          ))
        : filt.sort().join(',') === cat.sort().join(',') && filt.includes('music-studio')
        ? (schemaTitle = intl.formatMessage(
            { id: 'SearchPage.schemaTitleMusicArts' },
            { searchAddress, siteTitle }
          ))
        : filt.sort().join(',') === cat.sort().join(',') && filt.includes('music-venue')
        ? (schemaTitle = intl.formatMessage(
            { id: 'SearchPage.schemaTitleEventsVenues' },
            { searchAddress, siteTitle }
          ))
        : filt.sort().join(',') === cat.sort().join(',') && filt.includes('kitchen-space')
        ? (schemaTitle = intl.formatMessage(
            { id: 'SearchPage.schemaTitleKitchensandPopUps' },
            { searchAddress, siteTitle }
          ))
        : address !== 'World Wide'
        ? (schemaTitle = intl.formatMessage(
            { id: 'SearchPage.schemaTitleNew' },
            { uniqueCategory, article, searchAddress, siteTitle }
          ))
        : (schemaTitle = intl.formatMessage(
            { id: 'SearchPage.schemaTitleNewWW' },
            { uniqueCategory, article, searchAddress, siteTitle }
          ));
    }
  });

  // SearchPage.schemaTitleStudios
  const schemaListings = listings.map((l, i) => {
    const title = l.attributes.title;
    const pathToItem = createResourceLocatorString('ListingPage', routeConfiguration(), {
      id: l.id.uuid,
      slug: createSlug(title),
    });
    return {
      '@type': 'ListItem',
      position: i,
      url: `${config.canonicalRootURL}${pathToItem}`,
      name: title,
    };
  });

  const schemaMainEntity = JSON.stringify({
    '@type': 'ItemList',
    name: searchAddress,
    itemListOrder: 'http://schema.org/ItemListOrderAscending',
    itemListElement: schemaListings,
  });
  return {
    title: firstThreeCategoryTitle || schemaTitle,
    description: schemaDescription,
    schema: {
      '@context': 'http://schema.org',
      '@type': 'SearchResultsPage',
      description: schemaDescription,
      name: schemaTitle,
      mainEntity: [schemaMainEntity],
    },
  };
};
