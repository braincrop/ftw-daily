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

  // Resolve configuration for this filter
  const filterConfig = filters.find(f => {
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

export const createSearchResultSchema = (listings, address, intl, pub_category) => {
  // Schema for search engines (helps them to understand what this page is about)
  // http://schema.org
  // We are using JSON-LD format
  const siteTitle = config.siteTitle;
  const newAdress = address.substring(0, address.indexOf(','));
  const searchAddress = newAdress || intl.formatMessage({ id: 'SearchPage.schemaMapSearch' });
  const schemaDescription = intl.formatMessage({ id: 'SearchPage.schemaDescription' });
  const nail = [
    'nail-technician',
    'hair-stylist',
    'cosmetics',
    'makeup-artist',
    'beauty-treatment-room',
    'barber',
  ];
  const fitness = ['fitness', 'therapy-room', 'wellness-treatment-room'];
  const art = ['photography', 'art', 'music'];
  const event = ['event-space', 'outdoor-site', 'shoot-location'];
  const space = ['desk-space', 'office-space', 'meeting-room-space'];

  let schemaTitle;
  if (
    pub_category?.match(new RegExp('(' + nail.join(')|(') + ')', 'i')) &&
    !pub_category?.match(new RegExp('(' + fitness.join(')|(') + ')', 'i')) &&
    !pub_category?.match(new RegExp('(' + art.join(')|(') + ')', 'i')) &&
    !pub_category?.match(new RegExp('(' + event.join(')|(') + ')', 'i')) &&
    !pub_category?.match(new RegExp('(' + space.join(')|(') + ')', 'i'))
  ) {
    schemaTitle = intl.formatMessage(
      { id: 'SearchPage.schemaTitleNail' },
      { searchAddress, siteTitle }
    );
  } else if (pub_category?.match(new RegExp('(' + fitness.join(')|(') + ')', 'i'))&&
  !pub_category?.match(new RegExp('(' + nail.join(')|(') + ')', 'i')) &&
  !pub_category?.match(new RegExp('(' + art.join(')|(') + ')', 'i')) &&
  !pub_category?.match(new RegExp('(' + event.join(')|(') + ')', 'i')) &&
  !pub_category?.match(new RegExp('(' + space.join(')|(') + ')', 'i'))
  ) {
    schemaTitle = intl.formatMessage(
      { id: 'SearchPage.schemaTitleFitness' },
      { searchAddress, siteTitle }
    );
  } else if (pub_category?.match(new RegExp('(' + art.join(')|(') + ')', 'i')) &&
  !pub_category?.match(new RegExp('(' + nail.join(')|(') + ')', 'i')) &&
  !pub_category?.match(new RegExp('(' + fitness.join(')|(') + ')', 'i')) &&
  !pub_category?.match(new RegExp('(' + event.join(')|(') + ')', 'i')) &&
  !pub_category?.match(new RegExp('(' + space.join(')|(') + ')', 'i'))
  ) {
    schemaTitle = intl.formatMessage(
      { id: 'SearchPage.schemaTitleStudios' },
      { searchAddress, siteTitle }
    );
  } else if (pub_category?.match(new RegExp('(' + event.join(')|(') + ')', 'i'))&&
  !pub_category?.match(new RegExp('(' + nail.join(')|(') + ')', 'i')) &&
  !pub_category?.match(new RegExp('(' + fitness.join(')|(') + ')', 'i')) &&
  !pub_category?.match(new RegExp('(' + art.join(')|(') + ')', 'i')) &&
  !pub_category?.match(new RegExp('(' + space.join(')|(') + ')', 'i'))
  ) {
    schemaTitle = intl.formatMessage(
      { id: 'SearchPage.schemaTitleEvents' },
      { searchAddress, siteTitle }
    );
  } else if (pub_category?.match(new RegExp('(' + space.join(')|(') + ')', 'i')) &&
  !pub_category?.match(new RegExp('(' + nail.join(')|(') + ')', 'i')) &&
  !pub_category?.match(new RegExp('(' + fitness.join(')|(') + ')', 'i')) &&
  !pub_category?.match(new RegExp('(' + art.join(')|(') + ')', 'i')) &&
  !pub_category?.match(new RegExp('(' + event.join(')|(') + ')', 'i'))
  ) {
    schemaTitle = intl.formatMessage(
      { id: 'SearchPage.schemaTitleCoworking' },
      { searchAddress, siteTitle }
    );
  } else {
    schemaTitle = intl.formatMessage(
      { id: 'SearchPage.schemaTitle' },
      { searchAddress, siteTitle }
    );
  }

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
    title: schemaTitle,
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
