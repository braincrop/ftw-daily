import React, { useEffect, useState, useCallback } from 'react';
import { oneOf, shape, string } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import {
  IconCloseCustom,
  NamedLink,
  SearchFiltersMobile,
  SearchFiltersPrimary,
} from '../../components';
import Slider from 'react-slick';

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
import { manageDisableScrolling } from '../../ducks/UI.duck';
import { useDispatch } from 'react-redux';
import { isAnyFilterActive } from '../../util/search';

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
  const dispatch = useDispatch();

  const filterConfig = props.filterConfig;
  const { ...searchInURL } = parse(defaultLocation.search, {
    latlng: ['origin'],
    latlngBounds: ['bounds'],
  });
  const urlQueryParams = validURLParamsForExtendedData(searchInURL, filterConfig);

  const [imageArr, setImageArr] = useState(expertArr);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  // const [selectedCategoriesLength, setSelectedCategoriesLength] = useState(0);
  const [currentActiveCategory, setCurrentActiveCategory] = useState(null);
  const [currentQueryParams, setCurrentQueryParams] = useState(urlQueryParams);
  const [isSearchMapOpenOnMobile, setIsSearchMapOpenOnMobile] = useState(props.tab === 'map');
  let selectedCategoriesLength = null;
  //! Search Bar Working

  const primaryFilters = filterConfig.filter(f => f.group === 'primary');

  const isWindowDefined = typeof window !== 'undefined';
  const isMobileLayout = isWindowDefined && window.innerWidth < MODAL_BREAKPOINT;

  let searchParamsForPagination = parse(defaultLocation.search);
  const isCategoryFilterEnabled =
    searchParamsForPagination && !!searchParamsForPagination.pub_category;

  const isAmenitiesFilterEnabled =
    searchParamsForPagination && !!searchParamsForPagination.pub_amenities;

  // const categoryChildren = filterConfig.filter(c => c.props.isCategory);

  // console.log('Section Hero props => ', selectedCategoriesLength);

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

          !isMobileLayout &&
            history.push(
              createResourceLocatorString(
                'SearchPage',
                routeConfiguration(),
                {},
                !!selectedCategoriesLength && !!search?.pub_category
                  ? search
                  : delete search.pub_category
              )
            );
          history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, search));
        }
      };
      // this.setState(updater, callback);
      updater();
      callback();
    };
  }

  function onManageDisableScrolling(componentId, disableScrolling) {
    dispatch(manageDisableScrolling(componentId, disableScrolling));
  }

  const onMapIconClick = () => {
    // this.useLocationSearchBounds = true;
    setIsSearchMapOpenOnMobile(true);
  };
  function onOpenMobileModal() {
    setIsMobileModalOpen(true);
  }
  function onCloseMobileModal() {
    setIsMobileModalOpen(false);
  }

  function resetAll(e) {
    const { history } = props;
    const filterQueryParamNames = filterConfig.map(f => f.queryParamNames);

    // Reset state
    setCurrentQueryParams({});

    // Reset routing params
    const queryParams = omit(urlQueryParams, filterQueryParamNames);
    !!queryParams?.pub_pricePerDayFilter && delete queryParams.pub_pricePerDayFilter;
    !!queryParams?.pub_pricePerWeekFilter && delete queryParams.pub_pricePerWeekFilter;
    !!queryParams?.pub_pricePerMonthFilter && delete queryParams.pub_pricePerMonthFilter;
    history.push(createResourceLocatorString('SearchPage', routeConfiguration(), {}, queryParams));
  }
  function onOpenCategoryFilter() {
    setIsCategoryFilterOpen(!isCategoryFilterOpen);
  }

  function onCloseCategoryFilter() {
    setIsCategoryFilterOpen(false);
  }

  function setCurrentActiveCategoryFunc(category) {
    if (category === currentActiveCategory) {
      setCurrentActiveCategory(null);
    } else {
      setCurrentActiveCategory(category);
    }
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
          {/* <NamedLink
            className={css.heroButtonPink}
            name="SearchPage"
            to={{ search: 'address=&bounds=59.49417013%2C4.15978193%2C49.54972301%2C-10.51994741' }}
          >
            <FormattedMessage id="SectionHero.browseButton" />
          </NamedLink> */}

          {/* Search Bar open*/}
          <button
            className={css.searchBar}
            onClick={() => onOpenCategoryFilter()}
            disabled={isCategoryFilterOpen}
          >
            <h4 className={classNames(css.catSearch, css.searchBarBtns)}>
              What are you searching for
            </h4>
            <h4 className={classNames(css.filterSearch, css.searchBarBtns)}>Location</h4>{' '}
            <IconHourGlass />
          </button>

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
                />
              );
            })}
          </SearchFiltersPrimary>

          {/* Search Bar closed */}

          {/* <NamedLink
            name="SearchPage"
            to={{ search: locationParams + searchQuery }}
            className={css.category}
          >
            <div className={css.imageWrapper}>
              <div className={css.aspectWrapper}>
                <LazyImage src={image} alt={name} className={css.categoryImage} />
              </div>
            </div>
            <div className={css.linkText}>
              <FormattedMessage
                id="SectionPatchCategories.categoriesInLocation"
                values={{ category: nameText }}
              />
            </div>
          </NamedLink> */}
        </div>
      </div>

      <div className={classNames(css.heroButtonsContainer, css.heroButtonsContainerMobile)}>
        <NamedLink
          className={css.heroButtonPink}
          name="SearchPage"
          to={{ search: 'address=&bounds=59.49417013%2C4.15978193%2C49.54972301%2C-10.51994741' }}
        >
          <FormattedMessage id="SectionHero.browseButton" />
        </NamedLink>

        {/* Search Bar open*/}
        {/* <button
          className={css.searchBar}
          onClick={() => onOpenCategoryFilter()}
          disabled={isCategoryFilterOpen}
        >
          <h4 className={classNames(css.catSearch, css.searchBarBtns)}>
            What are you searching for
          </h4>
          <h4 className={classNames(css.filterSearch, css.searchBarBtns)}>Location</h4>{' '}
          <IconHourGlass />
        </button>
        <SearchFiltersMobile
          className={css.searchFiltersMobile}
          urlQueryParams={urlQueryParams}
          sortByComponent={sortBy('mobile')}
          // listingsAreLoaded={listingsAreLoaded}
          // resultsCount={totalItems}
          // searchInProgress={searchInProgress}
          // searchListingsError={searchListingsError}
          showAsModalMaxWidth={MODAL_BREAKPOINT}
          onMapIconClick={onMapIconClick}
          onManageDisableScrolling={onManageDisableScrolling}
          onOpenModal={onOpenMobileModal}
          onCloseModal={onCloseMobileModal}
          resetAll={resetAll}
          // selectedFiltersCount={selectedFiltersCount}
          mainCategoriesImages={categoryImages.mainCategoriesImages}
          subCategoriesImages={categoryImages.subCategoriesImages}
          currentActiveCategory={currentActiveCategory}
          initialValues={initialValues}
          filterConfig={filterConfig}
        >
          {filterConfig.map(config => {
            return (
              <FilterComponent
                key={`SearchFiltersMobile.${config.id}`}
                idPrefix="SearchFiltersMobile"
                filterConfig={config}
                urlQueryParams={urlQueryParams}
                initialValues={initialValues}
                getHandleChangedValueFn={getHandleChangedValueFn}
                liveEdit
                showAsPopup={false}
                mainCategoriesImages={categoryImages.mainCategoriesImages}
                subCategoriesImages={categoryImages.subCategoriesImages}
                onOpenCategoryFilter={onOpenCategoryFilter}
                isCategory={!!config.config.isCategory}
                isCategoryAmenities={!!config.config.isCategoryAmenities}
                setCurrentActiveCategory={setCurrentActiveCategoryFunc}
                isCategoryFilterEnabled={isCategoryFilterEnabled}
                isAmenitiesFilterEnabled={isAmenitiesFilterEnabled}
                currentActiveCategory={currentActiveCategory}
                setSelectedCategoriesLength={setSelectedCategoriesLengthFunc}
              />
            );
          })}
        </SearchFiltersMobile> */}
      </div>
    </div>
  );
};

SectionHero.defaultProps = {
  rootClassName: null,
  className: null,
  filterConfig: config.custom.filters,
  sortConfig: config.custom.sortConfig,
  tab: 'listings',
};

SectionHero.propTypes = {
  rootClassName: string,
  className: string,
  filterConfig: propTypes.filterConfig,
  sortConfig: propTypes.sortConfig,
  location: shape({
    search: string.isRequired,
  }).isRequired,
  tab: oneOf(['filters', 'listings', 'map']).isRequired,
};

export default SectionHero;
