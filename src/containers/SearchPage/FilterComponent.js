import React from 'react';
import {
  BookingDateRangeFilter,
  PriceFilter,
  KeywordFilter,
  SelectSingleFilter,
  SelectMultipleFilter,
} from '../../components';
import { bool } from 'prop-types';

/**
 * FilterComponent is used to map configured filter types
 * to actual filter components
 */
const FilterComponent = props => {
  const {
    idPrefix,
    filterConfig,
    urlQueryParams,
    initialValues,
    getHandleChangedValueFn,
    mainCategoriesImages,
    subCategoriesImages,
    onOpenCategoryFilter,
    isCategoryFilterEnabled,
    isAmenitiesFilterEnabled,
    isCategory,
    isCategoryAmenities,
    setCurrentActiveCategory,
    currentActiveCategory,
    isMobileLayout,
    setSelectedCategoriesLength,
    isFromLandingPageSearch,
    ...rest
  } = props;
  const { id, type, queryParamNames, label, labelImg, labelMobile, config } = filterConfig;
  const { liveEdit, showAsPopup } = rest;

  const useHistoryPush = liveEdit || showAsPopup;
  const prefix = idPrefix || 'SearchPage';
  const componentId = `${prefix}.${id.toLowerCase()}`;
  const name = id.replace(/\s+/g, '-').toLowerCase();
  // console.log('type:', type);

  switch (type) {
    case 'SelectSingleFilter': {
      return (
        <SelectSingleFilter
          id={componentId}
          label={label}
          queryParamNames={queryParamNames}
          initialValues={initialValues(queryParamNames)}
          onSelect={getHandleChangedValueFn(useHistoryPush)}
          {...config}
          {...rest}
        />
      );
    }
    case 'SelectMultipleFilter': {
      return (
        <SelectMultipleFilter
          id={componentId}
          filterId={id}
          filterConfigId={id}
          label={label}
          labelMobile={labelMobile}
          labelImg={labelImg}
          filterConfig={filterConfig}
          name={name}
          queryParamNames={queryParamNames}
          initialValues={initialValues(queryParamNames)}
          onSubmit={getHandleChangedValueFn(useHistoryPush)}
          mainCategoriesImages={mainCategoriesImages}
          subCategoriesImages={subCategoriesImages}
          onOpenCategoryFilter={onOpenCategoryFilter}
          isCategoryFilterEnabled={isCategoryFilterEnabled}
          isAmenitiesFilterEnabled={isAmenitiesFilterEnabled}
          setCurrentActiveCategory={setCurrentActiveCategory}
          isCategoryAmenities={isCategoryAmenities}
          currentActiveCategory={currentActiveCategory}
          isMobileLayout={isMobileLayout}
          setSelectedCategoriesLength={setSelectedCategoriesLength}
          isFromLandingPageSearch={isFromLandingPageSearch}
          {...config}
          {...rest}
        />
      );
    }
    case 'BookingDateRangeFilter': {
      return (
        <BookingDateRangeFilter
          id={componentId}
          label={label}
          queryParamNames={queryParamNames}
          initialValues={initialValues(queryParamNames)}
          onSubmit={getHandleChangedValueFn(useHistoryPush)}
          {...config}
          {...rest}
        />
      );
    }
    case 'PriceFilter': {
      return (
        <PriceFilter
          id={componentId}
          label={label}
          queryParamNames={queryParamNames}
          // initialValues={initialValues(queryParamNames)}
          urlQueryParams={urlQueryParams}
          onSubmit={getHandleChangedValueFn(useHistoryPush)}
          {...config}
          {...rest}
        />
      );
    }
    case 'KeywordFilter':
      return (
        <KeywordFilter
          id={componentId}
          label={label}
          name={name}
          queryParamNames={queryParamNames}
          initialValues={initialValues(queryParamNames)}
          onSubmit={getHandleChangedValueFn(useHistoryPush)}
          {...config}
          {...rest}
        />
      );
    default:
      return null;
  }
};

FilterComponent.defaultProps = {
  isFromLandingPageSearch: false,
};
FilterComponent.propTypes = {
  isFromLandingPageSearch: bool,
};

export default FilterComponent;
