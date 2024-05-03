import React, { useEffect, useState } from 'react';
import { object, oneOf, shape, string } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { NamedLink, SearchFiltersPrimary } from '../../components';
import Slider from 'react-slick';
import swal from 'sweetalert2';
import css from './SectionHero.module.css';

import hotPatch1 from './images/newSlider/Hero 11.jpg';
import hotPatch2 from './images/newSlider/Hero 22.jpg';
import hotPatch3 from './images/newSlider/Hero 33.jpg';
import hotPatch4 from './images/newSlider/Hero 44.jpg';
import hotPatch5 from './images/newSlider/Hero 55.jpg';

import hotPatchMobile1 from './images/sliderMobile/hero 111.jpg';
import hotPatchMobile2 from './images/sliderMobile/hero 222.jpg';
import hotPatchMobile3 from './images/sliderMobile/hero 333.jpg';
import hotPatchMobile4 from './images/sliderMobile/hero 444.jpg';
import hotPatchMobile5 from './images/sliderMobile/hero 555.jpg';
import IconHourGlass from '../LocationAutocompleteInput/IconHourGlass';
import config from '../../config';
import { propTypes } from '../../util/types';
import FilterComponent from '../../containers/SearchPage/FilterComponent';
import { sortBy } from 'lodash';
import { parse } from '../../util/urlHelpers';
import categoryImages from '../../containers/SearchPage/filterImages';
import { validURLParamsForExtendedData } from '../../containers/SearchPage/SearchPage.helpers';
import { createResourceLocatorString } from '../../util/routes';
import routeConfiguration from '../../routeConfiguration';
import { isAnyFilterActive } from '../../util/search';
import { TopbarSearchForm } from '../../forms';

const expertArr = [hotPatch4, hotPatch1, hotPatch5, hotPatch3, hotPatch2];
const mobileExpertArr = [
  hotPatchMobile4,
  hotPatchMobile1,
  hotPatchMobile5,
  hotPatchMobile3,
  hotPatchMobile2,
];

const MODAL_BREAKPOINT = 768; // Search is in modal on mobile layout
const FILTER_DROPDOWN_OFFSET = -14;

let defaultLocation = {
  pathname: '/s',
  search: '?address=&bounds=89.94693418%2C180%2C-89.50929449%2C-180',
  hash: '',
  key: 'eee0kc',
};

const SectionHero = props => {
  const { rootClassName, className } = props;
  const { categories } = config.custom;

  const filterConfig = props.filterConfig;
  const { ...searchInURL } = parse(defaultLocation.search, {
    latlng: ['origin'],
    latlngBounds: ['bounds'],
  });
  const urlQueryParams = validURLParamsForExtendedData(searchInURL, filterConfig);

  const [imageArr, setImageArr] = useState(expertArr);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [currentQueryParams, setCurrentQueryParams] = useState(urlQueryParams);
  const [category, setCategory] = useState('Categories');
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [SearchQueryData, setSearchQueryData] = useState({
    pub_category: '',
    address: 'World Wide',
    bounds: {},
  });

  let selectedCategoriesLength = null;
  // console.log('Section Hero', selectedCategoriesLength);
  //! Search Bar Working

  const primaryFilters = filterConfig.filter(f => f.group === 'primary');

  const isWindowDefined = typeof window !== 'undefined';
  const isMobileLayout = isWindowDefined && window.innerWidth < MODAL_BREAKPOINT;

  let searchParamsForPagination = parse(defaultLocation.search);
  const isCategoryFilterEnabled =
    searchParamsForPagination && !!searchParamsForPagination.pub_category;

  //Location Search

  const { address, origin, bounds } = parse(props.location.search, {
    latlng: ['origin'],
    latlngBounds: ['bounds'],
  });
  const locationFieldsPresent = config.sortSearchByDistance
    ? address && origin && bounds
    : address && bounds;
  const initialSearchFormValues = {
    location: locationFieldsPresent
      ? {
          search: address,
          selectedPlace: { address, origin, bounds },
        }
      : null,
  };

  function handleSubmit(values) {
    const { currentSearchParams } = props;
    const { search, selectedPlace } = values.location;
    const { categories } = values;
    const { origin, bounds } = selectedPlace;
    const originMaybe = config.sortSearchByDistance ? { origin } : {};
    let searchParams = {
      ...currentSearchParams,
      ...originMaybe,
      address: search,
      bounds,
    };
    if (categories) {
      searchParams['pub_category'] = categories;
    }
    // console.log('search Location:', searchParams);

    setSearchQueryData(prev => ({
      ...prev,
      address: searchParams.address,
      bounds: searchParams.bounds,
    }));
    // history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, searchParams));
  }

  function createSearchBar() {
    const catKeys =
      category && category !== 'Categories'
        ? categories.find(cat => cat.label === category).config.catKeys
        : '';

    return (
      <TopbarSearchForm
        className={css.searchLink}
        desktopInputRoot={css.topbarSearchWithLeftPadding}
        onSubmit={handleSubmit}
        initialValues={initialSearchFormValues}
        // dropdown={topbarDropDown}
        selectedCategories={catKeys}
        isFromLandingPageSearch={true}
      />
    );
  }
  let search = createSearchBar();

  const cleanSearchFromConflictingParams = (searchParams, sortConfig, filterConfig) => {
    // Single out filters that should disable SortBy when an active
    // keyword search sorts the listings according to relevance.
    // In those cases, sort parameter should be removed.

    const sortingFiltersActive = isAnyFilterActive(
      sortConfig.conflictingFilters,
      searchParams,
      filterConfig
    );
    return sortingFiltersActive
      ? { ...searchParams, [sortConfig.queryParamName]: null }
      : searchParams;
  };
  function initialValues(queryParamNames) {
    // Query parameters that are visible in the URL
    const _urlQueryParams = urlQueryParams;
    // Query parameters that are in state (user might have not yet clicked "Apply")
    const currentQueryParams = urlQueryParams;

    // Get initial value for a given parameter from state if its there.
    const getInitialValue = paramName => {
      const currentQueryParam = currentQueryParams[paramName];
      const hasQueryParamInState = typeof currentQueryParam !== 'undefined';
      return hasQueryParamInState ? currentQueryParam : _urlQueryParams[paramName];
    };

    // Return all the initial values related to given queryParamNames
    // InitialValues for "amenities" filter could be
    // { amenities: "has_any:towel,jacuzzi" }

    const isArray = Array.isArray(queryParamNames);
    return isArray
      ? queryParamNames.reduce((acc, paramName) => {
          return { ...acc, [paramName]: getInitialValue(paramName) };
        }, {})
      : {};
  }

  function setSelectedCategoriesLengthFunc(categoriesLength) {
    selectedCategoriesLength = categoriesLength;
  }

  function getHandleChangedValueFn(useHistoryPush) {
    const { sortConfig, history } = props;

    // history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, 'search'));
    return (updatedURLParams, filterConfigId) => {
      const updater = prevState => {
        // Address and bounds are handled outside of MainPanel.
        // I.e. TopbarSearchForm && search by moving the map.
        // We should always trust urlQueryParams with those.
        const { address, bounds } = urlQueryParams;

        const mergedQueryParams = { ...urlQueryParams, ...currentQueryParams };
        // delete mergedQueryParams.pub_category
        // !!isMobileLayout && this.state.selectedCategoriesLength == 0 ? delete mergedQueryParams.pub_category : mergedQueryParams

        const { price } = updatedURLParams || {};

        let selectedPrice;
        let selectedDates;

        if (price) {
          selectedPrice =
            typeof price === 'string'
              ? { price }
              : Object.keys(price).reduce((o, key) => ({ ...o, [`pub_${key}`]: price[key] }), {});
        } else if (price === null) {
          selectedPrice = null;
        }

        // if (dates) {
        //   selectedDates = typeof dates === 'string' ?
        //     { dates } :
        //     Object.keys(dates).reduce((o, key) => ({ ...o, [`pub_${key}`]: price[key] }), {});
        // } else if (dates === null) {
        //   selectedDates = null;
        // }

        const emptyPrices = {
          price: null,
          pub_pricePerDayFilter: null,
          pub_pricePerWeekFilter: null,
          pub_pricePerMonthFilter: null,
        };
        const priceMaybe =
          selectedPrice || selectedPrice === null
            ? { ...emptyPrices, ...(selectedPrice || {}) }
            : {};

        // const dateMaybe = selectedDates || selectedDates === null ?
        // { ...(selectedDates || {}) } :
        // {};

        const arrayN = {
          hair_and_beauty: filterConfig
            .find(i => i.id === 'hair_and_beauty')
            .config.catKeys.split(','),
          wellness: filterConfig.find(i => i.id === 'wellness').config.catKeys.split(','),
          fitness: filterConfig.find(i => i.id === 'fitness').config.catKeys.split(','),
          photography_and_film: filterConfig
            .find(i => i.id === 'photography_and_film')
            .config.catKeys.split(','),
          coworking: filterConfig.find(i => i.id === 'coworking').config.catKeys.split(','),
          music_and_arts: filterConfig
            .find(i => i.id === 'music_and_arts')
            .config.catKeys.split(','),
          events_and_venues: filterConfig
            .find(i => i.id === 'events_and_venues')
            .config.catKeys.split(','),
          kitchensand_pop_ups: filterConfig
            .find(i => i.id === 'kitchensand_pop_ups')
            .config.catKeys.split(','),
        };

        const findValue = value => {
          let res = [];
          for (let name in arrayN) {
            if (arrayN.hasOwnProperty(name)) {
              value.forEach(e => {
                if (arrayN[name].includes(e)) {
                  return res.includes(name) ? '' : res.push(name);
                }
              });
            }
          }
          return res;
        };
        // Since we have multiple filters with the same query param, 'pub_category'
        // we dont want to lose the prev ones, we want all of them

        const pc = 'pub_category';

        const isCategoryCleared =
          updatedURLParams && pc in updatedURLParams && !updatedURLParams[pc];
        const selectedFilter = filterConfig.find(f => f.id === filterConfigId);
        const selectedFilterOptions = selectedFilter && selectedFilter.config.catKeys.split(',');

        // if (pc in updatedURLParams) {
        if (pc in updatedURLParams && !isMobileLayout) {
          if (!isCategoryCleared && pc in mergedQueryParams) {
            const updatedURLParamsCutted = updatedURLParams[pc].includes('has_any:')
              ? updatedURLParams[pc].replace('has_any:', '')
              : updatedURLParams[pc];
            const mergedQueryParamsCutted = mergedQueryParams[pc].includes('has_any:')
              ? mergedQueryParams[pc].replace('has_any:', '')
              : mergedQueryParams[pc];

            const up_pc = updatedURLParams[pc] ? updatedURLParamsCutted.split(',') : [];
            const mp_pc = mergedQueryParams[pc] ? mergedQueryParamsCutted.split(',') : [];
            // const up_pc = updatedURLParams[pc] ? updatedURLParams[pc].split(',') : [];
            // const mp_pc = mergedQueryParams[pc] ? mergedQueryParams[pc].split(',') : [];
            const asas = mp_pc.filter(x => !up_pc.includes(x));
            const newMp = [...new Set([...up_pc, ...mp_pc])].filter(x => !asas.includes(x));

            if (findValue(mp_pc).filter(x => findValue(up_pc).includes(x)).length === 0) {
              updatedURLParams[pc] = 'has_any:' + [...new Set([...up_pc, ...mp_pc])].join(',');
            } else if (findValue(mp_pc).filter(x => findValue(up_pc).includes(x)).length > 0) {
              let difference = findValue(mp_pc).filter(x => findValue(up_pc).includes(x));
              let rer = asas.filter(x => !arrayN[difference].includes(x));

              updatedURLParams[pc] = 'has_any:' + [...new Set([...rer, ...newMp])].join(',');
            }
          } else if (isCategoryCleared) {
            const mp_pc = mergedQueryParams[pc]
              ? mergedQueryParams[pc]
                  .replace('has_any:', '')
                  .split(',')
                  .filter(item => !selectedFilterOptions.includes(item))
              : [];
            // const mp_pc = mergedQueryParams[pc] ? mergedQueryParams[pc].split(',').filter(item => !selectedFilterOptions.includes(item)) : []

            updatedURLParams[pc] = !!mp_pc.length
              ? 'has_any:' + [...new Set([...mp_pc])].join(',')
              : [...new Set([...mp_pc])].join(',');
          }
        }
        if (updatedURLParams[pc]?.length === 0) {
          delete updatedURLParams.pub_category;
        }

        // console.log('updater:', mergedQueryParams, updatedURLParams, priceMaybe, address, bounds);

        return {
          currentQueryParams: {
            ...mergedQueryParams,
            ...updatedURLParams,
            ...priceMaybe,
            address,
            bounds,
          },
        };
      };

      const callback = () => {
        if (useHistoryPush) {
          // let _pubCatValue = insertPubCategoryIntoSearchParamsFilter(filterConfigId)
          const _pubCat = { pub_category: filterConfigId };
          const searchParams = { ...updatedURLParams, ...currentQueryParams };
          const search = cleanSearchFromConflictingParams(searchParams, sortConfig, filterConfig);
          const _selectedMainCat = primaryFilters.find(
            c => c.config.isCategory && _pubCat.pub_category === c.id
          );
          if (!!search.pub_category) {
            // console.log('search if:', search);
            setSearchQueryData(prev => ({
              ...prev,
              pub_category: search.pub_category,
            }));
          } else {
            const _def_pubCat = `${_selectedMainCat.config.searchMode}:${_selectedMainCat.config.catKeys}`;
            // console.log('_def_pubCat', _def_pubCat);

            setSearchQueryData(prev => ({
              ...prev,
              pub_category: _def_pubCat,
            }));
          }

          setSelectedMainCategory(_selectedMainCat);

          // !isMobileLayout &&
          // history.push(
          //   createResourceLocatorString(
          //     'SearchPage',
          //     routeConfiguration(),
          //     {},
          //     !!selectedCategoriesLength && !!search?.pub_category
          //       ? search
          //       : delete search.pub_category
          //   )
          // );
          // history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, search));
        }
      };
      // this.setState(updater, callback);
      updater();
      callback();
    };
  }
  console.log('setSearchQueryData', SearchQueryData);

  function onOpenCategoryFilter() {
    setIsCategoryFilterOpen(!isCategoryFilterOpen);
  }

  function onCloseCategoryFilter() {
    setIsCategoryFilterOpen(false);
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 550) setImageArr(mobileExpertArr);
    else setImageArr(expertArr);
  }, []);

  typeof window !== 'undefined' &&
    window.addEventListener('resize', () => {
      if (window.innerWidth < 550) setImageArr(mobileExpertArr);
      else setImageArr(expertArr);
    });

  //! Search Bar Working

  const classes = classNames(rootClassName || css.root, className);
  const makeSpaceWork = (
    <span className={css.bold}>
      <FormattedMessage id="SectionHero.subTitleBold" />
    </span>
  );

  const settings = {
    infinite: true,
    speed: 500,
    autoplay: true,
    slidesToScroll: 1,
    slidesToShow: 1,
    autoplaySpeed: 5000,
    useCSS: true,
    pauseOnHover: false,
  };

  // console.log('SearchQueryData:', filterConfig);

  const handleSearchLanding = () => {
    const { history } = props;
    const { address, bounds, pub_category } = SearchQueryData;
    // console.log('handleSearchLanding', SearchQueryData);

    if (pub_category == '') {
      swal.fire({
        title: 'Please select Category.',
        showClass: {
          popup: `
            animate__animated
            animate__fadeInUp
            animate__faster
          `,
        },
        hideClass: {
          popup: `
            animate__animated
            animate__fadeOutDown
            animate__faster
          `,
        },
      });
    } else {
      history.push(
        createResourceLocatorString('SearchPage', routeConfiguration(), {}, SearchQueryData)
      );
    }
  };
  return (
    <div className={classes}>
      <Slider className={css.slider} {...settings}>
        {imageArr &&
          imageArr.map(el => (
            <div className={css.card} key={el}>
              <img src={el} alt="avatar" />
            </div>
          ))}
      </Slider>

      <div className={css.heroTitleBlock}>
        <h1 className={css.heroMainTitle}>
          <FormattedMessage id="SectionHero.title" />
        </h1>
        <h2 className={css.heroSubTitle}>
          <FormattedMessage id="SectionHero.subTitle" values={{ subText: makeSpaceWork }} />
        </h2>

        <div className={classNames(css.heroButtonsContainer, css.heroButtonsContainerDesktop)}>
          <div
            className={css.searchBar}
            // onClick={() => onOpenCategoryFilter()}
            // disabled={isCategoryFilterOpen}
          >
            <button
              onClick={() => onOpenCategoryFilter()}
              disabled={isCategoryFilterOpen}
              className={classNames(css.catSearch, css.searchBarBtns)}
            >
              {selectedMainCategory == null
                ? 'What are you searching for?'
                : selectedMainCategory.label}
            </button>
            <div className={css.filterSearchMobile} />

            {search}

            <div
              className={css.SearchBtnDesktop}
              style={{ width: '7%', cursor: 'pointer' }}
              onClick={() => handleSearchLanding()}
            >
              <IconHourGlass />
            </div>
            <button onClick={() => handleSearchLanding()} className={css.SearchBtnMobile}>
              Search
            </button>
          </div>

          <SearchFiltersPrimary
            className={css.searchFiltersPrimary}
            sortByComponent={sortBy('desktop')}
            // listingsAreLoaded={listingsAreLoaded}
            // resultsCount={totalItems}
            // searchInProgress={searchInProgress}
            // searchListingsError={searchListingsError}
            mainCategoriesImages={categoryImages.mainCategoriesImages}
            subCategoriesImages={categoryImages.subCategoriesImages}
            isCategoryFilterOpen={isCategoryFilterOpen}
            onOpenCategoryFilter={onOpenCategoryFilter}
            onCloseCategoryFilter={onCloseCategoryFilter}
            isCategoryFilterEnabled={isCategoryFilterEnabled}
            setSelectedCategoriesLength={setSelectedCategoriesLengthFunc}
            isFromLandingPageSearch={true}
            getHandleChangedValueFn={getHandleChangedValueFn}
            // {...propsForSecondaryFiltersToggle}
          >
            {primaryFilters.map(config => {
              return (
                <FilterComponent
                  key={`SearchFiltersPrimary.${config.id}`}
                  idPrefix="SearchFiltersPrimary"
                  filterConfig={config}
                  urlQueryParams={urlQueryParams}
                  initialValues={initialValues}
                  getHandleChangedValueFn={getHandleChangedValueFn}
                  showAsPopup
                  contentPlacementOffset={FILTER_DROPDOWN_OFFSET}
                  isCategory={!!config.config.isCategory}
                  mainCategoriesImages={categoryImages.mainCategoriesImages}
                  subCategoriesImages={categoryImages.subCategoriesImages}
                  onOpenCategoryFilter={onOpenCategoryFilter}
                  isCategoryFilterEnabled={isCategoryFilterEnabled}
                  setSelectedCategoriesLength={setSelectedCategoriesLengthFunc}
                  isFromLandingPageSearch={true}
                />
              );
            })}
          </SearchFiltersPrimary>
        </div>
      </div>

      <NamedLink
        className={css.heroButtonPink}
        name="SearchPage"
        to={{ search: 'address=&bounds=59.49417013%2C4.15978193%2C49.54972301%2C-10.51994741' }}
      >
        <FormattedMessage id="SectionHero.browseButton" />
      </NamedLink>
      {/* Search Bar open*/}
    </div>
  );
};

SectionHero.defaultProps = {
  rootClassName: null,
  className: null,
  filterConfig: config.custom.filters,
  sortConfig: config.custom.sortConfig,
  currentSearchParams: null,
  tab: 'listings',
};

SectionHero.propTypes = {
  rootClassName: string,
  className: string,
  filterConfig: propTypes.filterConfig,
  sortConfig: propTypes.sortConfig,
  currentSearchParams: object,
  location: shape({
    search: string.isRequired,
  }).isRequired,
  tab: oneOf(['filters', 'listings', 'map']).isRequired,
};

export default SectionHero;
