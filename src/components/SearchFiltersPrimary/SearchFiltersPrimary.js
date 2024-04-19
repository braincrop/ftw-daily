import React from 'react';
import { bool, func, node, number, string } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { OutsideClickHandler, IconCloseCustom, InlineTextButton } from '../../components';

import css from './SearchFiltersPrimary.module.css';
import { Classnames } from 'react-alice-carousel';

const SearchFiltersPrimaryComponent = props => {
  const {
    rootClassName,
    className,
    children,
    sortByComponent,
    listingsAreLoaded,
    resultsCount,
    searchInProgress,
    isSecondaryFiltersOpen,
    toggleSecondaryFiltersOpen,
    selectedSecondaryFiltersCount,
    onOpenCategoryFilter,
    onCloseCategoryFilter,
    isCategoryFilterOpen,
    isCategoryFilterEnabled,
    isFromLandingPageSearch,
    getHandleChangedValueFn,
  } = props;

  const hasNoResult = listingsAreLoaded && resultsCount === 0;
  const classes = classNames(rootClassName || css.root, className);

  const toggleSecondaryFiltersOpenButtonClasses =
    isSecondaryFiltersOpen || selectedSecondaryFiltersCount > 0
      ? css.searchFiltersPanelOpen
      : css.searchFiltersPanelClosed;
  const toggleSecondaryFiltersOpenButton = toggleSecondaryFiltersOpen ? (
    <button
      className={toggleSecondaryFiltersOpenButtonClasses}
      onClick={() => {
        toggleSecondaryFiltersOpen(!isSecondaryFiltersOpen);
      }}
    >
      <FormattedMessage
        id="SearchFiltersPrimary.moreFiltersButtonWithOutCounter"
        // id="SearchFiltersPrimary.moreFiltersButton"
        // values={{ count: selectedSecondaryFiltersCount }}
      />
    </button>
  ) : null;

  // console.log('child: ', children);
  const nonCategoryChildren = children.filter(c => !c.props.isCategory);
  const categoryChildren = children.filter(c => c.props.isCategory);
  const categoriesText = (
    <div className={css.catTxtDiv}>
      <span className={css.catTxtSpan}>
        <FormattedMessage id="SearchFiltersPrimary.categories" />
      </span>
    </div>
  );

  return (
    <div className={isFromLandingPageSearch ? css.rootLanding : classes}>
      <div className={css.searchOptions}>
        {listingsAreLoaded ? (
          <div className={css.searchResultSummary}>
            <span className={css.resultsFound}>
              <FormattedMessage
                id="SearchFiltersPrimary.foundResults"
                values={{ count: resultsCount }}
              />
            </span>
          </div>
        ) : null}

        <div className={css.filters}>
          <OutsideClickHandler
            onOutsideClick={(isCategoryFilterOpen && onOpenCategoryFilter) || onCloseCategoryFilter}
          >
            <button
              className={classNames(css.searchFiltersPanelClosed, {
                [css.active]: isCategoryFilterEnabled,
              })}
              style={isFromLandingPageSearch ? { display: 'none' } : {}}
              onClick={onOpenCategoryFilter}
            >
              <FormattedMessage id="SearchFiltersPrimary.categoriesBtn" />
            </button>
            {isCategoryFilterOpen && (
              <div
                className={
                  isFromLandingPageSearch
                    ? css.categoryItemsWrapperLanding
                    : css.categoryItemsWrapper
                }
              >
                <div className={css.categoryItems}>
                  <h3 className={css.categoryItemsTitle}>
                    <FormattedMessage id="SearchFiltersPrimary.categories" />
                    {/* <button
                      // style={props.isFromLandingPageSearch ? { display: 'none' } : {}}
                      className={css.submitLandingSearchButton}
                      onClick={isFromLandingPageSearch && getHandleChangedValueFn(true)}
                    >
                      Apply
                    </button> */}
                    <div onClick={onCloseCategoryFilter}>
                      <IconCloseCustom />
                    </div>
                  </h3>

                  <div className={css.categoryItemsHolder}>
                    {categoryChildren.map((category, i) => {
                      return <React.Fragment key={`category-${i}`}>{category}</React.Fragment>;
                    })}
                  </div>
                </div>
              </div>
            )}
          </OutsideClickHandler>
        </div>

        {isFromLandingPageSearch || nonCategoryChildren}
        {isFromLandingPageSearch || toggleSecondaryFiltersOpenButton}
        {isFromLandingPageSearch || sortByComponent}
      </div>

      {hasNoResult ? (
        <div className={css.noSearchResults}>
          <FormattedMessage id="SearchFiltersPrimary.noResults" />
        </div>
      ) : null}

      {searchInProgress ? (
        <div className={css.loadingResults}>
          <FormattedMessage id="SearchFiltersPrimary.loadingResults" />
        </div>
      ) : null}
    </div>
  );
};

SearchFiltersPrimaryComponent.defaultProps = {
  rootClassName: null,
  className: null,
  resultsCount: null,
  searchInProgress: false,
  isSecondaryFiltersOpen: false,
  toggleSecondaryFiltersOpen: null,
  selectedSecondaryFiltersCount: 0,
  sortByComponent: null,
  getHandleChangedValueFn: null,
  isFromLandingPageSearch: false,
};

SearchFiltersPrimaryComponent.propTypes = {
  rootClassName: string,
  className: string,
  listingsAreLoaded: bool.isRequired,
  resultsCount: number,
  searchInProgress: bool,
  isSecondaryFiltersOpen: bool,
  toggleSecondaryFiltersOpen: func,
  selectedSecondaryFiltersCount: number,
  sortByComponent: node,
  isFromLandingPageSearch: bool,
  getHandleChangedValueFn: func,
};

const SearchFiltersPrimary = SearchFiltersPrimaryComponent;

export default SearchFiltersPrimary;
