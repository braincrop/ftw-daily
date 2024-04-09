import React, { Component } from 'react';
import { bool, func, object, node, number, shape, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { withRouter } from 'react-router-dom';

import { parseSelectFilterOptions } from '../../util/search';

import routeConfiguration from '../../routeConfiguration';
import { createResourceLocatorString } from '../../util/routes';
import { ModalInMobile, Button } from '../../components';
import css from './SearchFiltersMobile.module.css';

class SearchFiltersMobileComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFiltersOpenOnMobile: true,
      initialQueryParams: null,
      isCategoryFiltersOpenOnMobile: true,
    };

    this.openFilters = this.openFilters.bind(this);
    this.openCategoryFilters = this.openCategoryFilters.bind(this);
    this.cancelFilters = this.cancelFilters.bind(this);
    this.closeFilters = this.closeFilters.bind(this);
    this.resetAll = this.resetAll.bind(this);
  }

  // Open filters modal, set the initial parameters to current ones
  openFilters() {
    const { onOpenModal, urlQueryParams } = this.props;
    onOpenModal();
    this.setState({ isFiltersOpenOnMobile: true, initialQueryParams: urlQueryParams });
  }

  openCategoryFilters() {
    this.setState({ isCategoryFiltersOpenOnMobile: !this.state.isCategoryFiltersOpenOnMobile });
  }

  // Close the filters by clicking cancel, revert to the initial params
  cancelFilters() {
    const { history, onCloseModal } = this.props;

    history.push(
      createResourceLocatorString(
        'SearchPage',
        routeConfiguration(),
        {},
        this.state.initialQueryParams
      )
    );
    onCloseModal();
    this.setState({ isFiltersOpenOnMobile: false, initialQueryParams: null });
  }

  // Close the filter modal
  closeFilters() {
    this.props.onCloseModal();
    this.setState({ isFiltersOpenOnMobile: false });
  }

  // Reset all filter query parameters
  resetAll(e) {
    this.props.resetAll(e);

    // blur event target if event is passed
    if (e && e.currentTarget) {
      e.currentTarget.blur();
    }
  }

  render() {
    const {
      rootClassName,
      className,
      children,
      sortByComponent,
      listingsAreLoaded,
      resultsCount,
      searchInProgress,
      showAsModalMaxWidth,
      onMapIconClick,
      onManageDisableScrolling,
      selectedFiltersCount,
      intl,
      currentActiveCategory,
      filterConfig,
      initialValues,
      isFromLandingPageSearch,
    } = this.props;

    const classes = classNames(rootClassName || css.root, className);
    const categoryChildren = children.filter(c => c.props.isCategory);

    const nonCategoryChildren = children.filter(
      c => !c.props.isCategory && !c.props.isCategoryAmenities
    );

    const resultsFound = (
      <FormattedMessage id="SearchFiltersMobile.foundResults" values={{ count: resultsCount }} />
    );
    const noResults = <FormattedMessage id="SearchFiltersMobile.noResults" />;
    const loadingResults = <FormattedMessage id="SearchFiltersMobile.loadingResults" />;
    const filtersHeading = intl.formatMessage({ id: 'SearchFiltersMobile.heading' });
    const modalCloseButtonMessage = intl.formatMessage({ id: 'SearchFiltersMobile.cancel' });

    const showListingsLabel = intl.formatMessage(
      { id: 'SearchFiltersMobile.showListings' },
      { count: resultsCount }
    );

    const filtersButtonClasses =
      selectedFiltersCount > 0 ? css.filtersButtonSelected : css.filtersButton;

    // const generalAmenitiesOptions = filterConfig.find(item => item.id === "general_amenities").config.options
    // const generalAmenitiesSelectedOptions = parseSelectFilterOptions(initialValues(["pub_amenities"]).pub_amenities)

    // const generalAmenitiesFilterActive = generalAmenitiesOptions
    //   && generalAmenitiesSelectedOptions
    //   && generalAmenitiesOptions.some(item => item.key === generalAmenitiesSelectedOptions?.[0])

    return (
      <div className={classes}>
        <div
          className={css.searchResultSummary}
          style={isFromLandingPageSearch ? { display: 'none' } : {}}
        >
          {listingsAreLoaded && resultsCount > 0 ? resultsFound : null}
          {listingsAreLoaded && resultsCount === 0 ? noResults : null}
          {searchInProgress ? loadingResults : null}
        </div>
        <div className={css.buttons} style={isFromLandingPageSearch ? { display: 'none' } : {}}>
          <Button rootClassName={filtersButtonClasses} onClick={this.openFilters}>
            <FormattedMessage
              id="SearchFiltersMobile.filtersButtonLabel"
              className={css.mapIconText}
            />
          </Button>
          {sortByComponent}
          <div className={css.mapIcon} onClick={onMapIconClick}>
            <FormattedMessage id="SearchFiltersMobile.openMapView" className={css.mapIconText} />
          </div>
        </div>
        <ModalInMobile
          id="SearchFiltersMobile.filters"
          isModalOpenOnMobile={this.state.isFiltersOpenOnMobile}
          onClose={this.cancelFilters}
          showAsModalMaxWidth={showAsModalMaxWidth}
          onManageDisableScrolling={onManageDisableScrolling}
          containerClassName={css.modalContainer}
          closeButtonMessage={modalCloseButtonMessage}
        >
          <div className={css.modalHeadingWrapper}>
            <span className={css.modalHeading}>{filtersHeading}</span>
            <button
              style={isFromLandingPageSearch ? { display: 'none' } : {}}
              className={css.resetAllButton}
              onClick={e => this.resetAll(e)}
            >
              <FormattedMessage id={'SearchFiltersMobile.resetAll'} />
            </button>
          </div>

          {this.state.isFiltersOpenOnMobile ? (
            <>
              <div
                className={classNames(css.filtersWrapperTitle, {
                  [css.filtersWrapperTitleActive]: this.state.isCategoryFiltersOpenOnMobile,
                })}
                onClick={this.openCategoryFilters}
              >
                <FormattedMessage id={'FilterForm.patchCategoryMobile'} />
              </div>
              <div className={css.filtersWrapper}>
                {this.state.isCategoryFiltersOpenOnMobile && (
                  <div className={css.categoryItemsHolder}>
                    {categoryChildren.map((category, i) => {
                      const categoryAmenities = children.filter(
                        item =>
                          item.props.filterConfig.idCategory === category.props.filterConfig.id
                      );
                      const categoryItemClasses = classNames(
                        css.categoryItem,
                        {
                          [css.categoryItemActive]:
                            category.props.filterConfig.id === currentActiveCategory,
                        },
                        {
                          [css.categoryItemNotActive]:
                            !!currentActiveCategory &&
                            category.props.filterConfig.id !== currentActiveCategory,
                        }
                        // { [css.generalAmenitiesFilterActive]: generalAmenitiesFilterActive }
                      );

                      return (
                        <div key={`category-${i}`} className={categoryItemClasses}>
                          {categoryAmenities}
                          {category}
                        </div>
                      );
                    })}
                  </div>
                )}
                {isFromLandingPageSearch || nonCategoryChildren}
              </div>
            </>
          ) : null}

          <div
            style={isFromLandingPageSearch ? { display: 'none' } : {}}
            className={css.showListingsContainer}
          >
            <Button className={css.showListingsButton} onClick={this.closeFilters}>
              {showListingsLabel}
            </Button>
          </div>
        </ModalInMobile>
      </div>
    );
  }
}

SearchFiltersMobileComponent.defaultProps = {
  rootClassName: null,
  className: null,
  sortByComponent: null,
  resultsCount: null,
  searchInProgress: false,
  selectedFiltersCount: 0,
  isFromLandingPageSearch: false,
};

SearchFiltersMobileComponent.propTypes = {
  rootClassName: string,
  className: string,
  urlQueryParams: object.isRequired,
  sortByComponent: node,
  listingsAreLoaded: bool.isRequired,
  resultsCount: number,
  searchInProgress: bool,
  isFromLandingPageSearch: bool,
  showAsModalMaxWidth: number.isRequired,
  onMapIconClick: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  onOpenModal: func.isRequired,
  onCloseModal: func.isRequired,
  resetAll: func.isRequired,
  selectedFiltersCount: number,
  //NOTE v2s1 filterupdate -- customizations: categoriesFilter -> categoryFilter, now its deleted (v5 update)
  // categoryFilter: propTypes.filterConfig,

  // from injectIntl
  intl: intlShape.isRequired,

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
};

const SearchFiltersMobile = injectIntl(withRouter(SearchFiltersMobileComponent));

export default SearchFiltersMobile;
