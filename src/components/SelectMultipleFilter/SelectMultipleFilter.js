import React, { Component } from 'react';
import { array, arrayOf, func, node, number, object, string } from 'prop-types';
import classNames from 'classnames';
import { injectIntl, intlShape } from '../../util/reactIntl';
import { parseSelectFilterOptions } from '../../util/search';
import { FieldCheckbox } from '../../components';

import { FilterPopup, FilterPlain } from '../../components';
import css from './SelectMultipleFilter.module.css';

// SelectMultipleFilter doesn't need array mutators since it doesn't require validation.
// TODO: Live edit didn't work with FieldCheckboxGroup
//       There's a mutation problem: formstate.dirty is not reliable with it.
const GroupOfFieldCheckboxes = props => {
  const {
    id,
    className,
    name,
    options,
    isCategory,
    subCategoryImage,
  } = props;

  //NOTE v2s1 filterupdate -- customizations removed in v5 update
  // const item = option => {
  //   const fieldId = `${id}.${option.key}`;
  //
  //   return (
  //     <li key={fieldId} className={css.item}>
  //       <FieldCheckbox id={fieldId} name={name} label={option.label} value={option.key} />
  //     </li>
  //   );
  // };

  return (
    <fieldset className={className}>
      <ul className={classNames(css.list, { [css.listWithImages]: isCategory })}>
        {options.map((option, index) => {
          //NOTE v2s1 filterupdate -- customizations removed in v5 update
          // if (option.children && option.children.length) return (
          //   <ul className={css.item} key={`${id}.${option.label}`}>
          //     <li><h3>{option.label}</h3></li>
          //     {option.children.map((c, i) => (item(c)))}
          //   </ul>
          // );
          //
          // if (option.key) return item(option)
          // return null

          const fieldId = `${id}.${option.key || option.value}`;
          return (
            <li key={fieldId} className={css.item}>
              <FieldCheckbox
                id={fieldId}
                name={name}
                label={option.label}
                labelImg={option.labelImg}
                value={option.key || option.value}
                isCategory={isCategory}
                subCategoryImage={subCategoryImage}
              />
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
};

const getQueryParamName = queryParamNames => {
  return Array.isArray(queryParamNames) ? queryParamNames[0] : queryParamNames;
};

// Format URI component's query param: { pub_key: 'has_all:a,b,c' }
const format = (selectedOptions, queryParamName, searchMode) => {
  const hasOptionsSelected = selectedOptions && selectedOptions.length > 0;
  const mode = searchMode ? `${searchMode}:` : '';
  const value = hasOptionsSelected ? `${mode}${selectedOptions.join(',')}` : null;
  return { [queryParamName]: value };
};

class SelectMultipleFilter extends Component {
  constructor(props) {
    super(props);

    this.filter = null;
    this.filterContent = null;

    this.positionStyleForContent = this.positionStyleForContent.bind(this);
  }

  positionStyleForContent() {
    if (this.filter && this.filterContent) {
      // Render the filter content to the right from the menu
      // unless there's no space in which case it is rendered
      // to the left
      const distanceToRight = window.innerWidth - this.filter.getBoundingClientRect().right;
      const labelWidth = this.filter.offsetWidth;
      const contentWidth = this.filterContent.offsetWidth;
      const contentWidthBiggerThanLabel = contentWidth - labelWidth;
      const renderToRight = distanceToRight > contentWidthBiggerThanLabel;
      const contentPlacementOffset = this.props.contentPlacementOffset;

      const offset = renderToRight
        ? { left: contentPlacementOffset }
        : { right: contentPlacementOffset };
      // set a min-width if the content is narrower than the label
      const minWidth = contentWidth < labelWidth ? { minWidth: labelWidth } : null;

      return { ...offset, ...minWidth };
    }
    return {};
  }

  render() {
    const {
      rootClassName,
      className,
      id,
      filterId,
      filterConfigId,
      name,
      label,
      labelImg,
      labelMobile,
      options,
      isCategory,
      isCategoryAmenities,
      catKeys,
      initialValues,
      contentPlacementOffset,
      onSubmit,
      queryParamNames,
      searchMode,
      intl,
      showAsPopup,
      filterConfig,
      mainCategoriesImages,
      subCategoriesImages,
      onOpenCategoryFilter,
      isCategoryFilterEnabled,
      isAmenitiesFilterEnabled,
      setCurrentActiveCategory,
      currentActiveCategory,
      isMobileLayout,
      setSelectedCategoriesLength,
      ...rest
    } = this.props;

    const classes = classNames(rootClassName || css.root, className);

    //NOTE v2s1 filterupdate -- updated in v5
    // const hasInitialValues = initialValues.length > 0;
    const queryParamName = getQueryParamName(queryParamNames);
    let hasInitialValues = !!initialValues && !!initialValues[queryParamName];

    // Parse options from param strings like "has_all:a,b,c" or "a,b,c"
    let selectedOptions = hasInitialValues
      ? parseSelectFilterOptions(initialValues[queryParamName])
      : [];

    if (!!isCategory && selectedOptions.length > 0) {
      const subCategories = catKeys ? catKeys.split(',') : [];
      selectedOptions = selectedOptions.filter(cat => subCategories.includes(cat));
      if (selectedOptions.length === 0) {
        hasInitialValues = false;
      }
    }

    const selectedItemsCounter = filterConfig.config.options.map(e => e.key).filter(v => selectedOptions.includes(v)).length || filterConfig.config.options.map(e => e.value).filter(v => selectedOptions.includes(v)).length

    const labelText = isMobileLayout ? !!labelMobile ? labelMobile : label : label

    const labelForPopup = hasInitialValues && !isCategory && !!selectedItemsCounter
      ? intl.formatMessage(
        { id: 'SelectMultipleFilter.labelSelected' },
        { labelText: filterConfig.label, count: selectedItemsCounter }
      )
      : label;

    const labelForPlain = hasInitialValues && !!selectedItemsCounter
      ? intl.formatMessage(
        { id: 'SelectMultipleFilterPlainForm.labelSelected' },
        { labelText: (isMobileLayout && filterConfig.labelMobile) || filterConfig.label, count: selectedItemsCounter }
      )
      : labelText;

    const filterConfigArr = {
      id: filterConfig.idCategory || filterConfig.id,
      options: filterConfig.config.options
    }

    const selectedValuePresent = filterConfigArr.options.some(item => item.key === filterConfig.config.options.map(e => e.key).filter(v => selectedOptions.includes(v))[0])

    const contentStyle = this.positionStyleForContent();

    // pass the initial values with the name key so that
    // they can be passed to the correct field
    const namedInitialValues = { [name]: selectedOptions };

    const handleSubmit = (values) => {
      const usedValue = values ? values[name] : values;
      onSubmit(format(usedValue, queryParamName, searchMode), filterConfigId);
    };

  

    return showAsPopup ? (
      <FilterPopup
        className={classes}
        rootClassName={rootClassName}
        popupClassName={css.popupSize}
        name={name}
        label={labelForPopup}
        labelImg={labelImg}
        isSelected={hasInitialValues}
        id={`${id}.popup`}
        showAsPopup
        contentPlacementOffset={contentPlacementOffset}
        onSubmit={handleSubmit}
        initialValues={namedInitialValues}
        keepDirtyOnReinitialize
        isCategory={isCategory}
        mainCategoriesImages={mainCategoriesImages}
        subCategoryImage={subCategoriesImages}
        onOpenCategoryFilter={onOpenCategoryFilter}
        isCategoryFilterEnabled={isCategoryFilterEnabled}
        setSelectedCategoriesLength={setSelectedCategoriesLength}
        {...rest}
      >
        <GroupOfFieldCheckboxes
          className={css.fieldGroup}
          name={name}
          id={`${id}-checkbox-group`}
          options={options}
          isCategory={isCategory}
          subCategoryImage={subCategoriesImages}
        />
      </FilterPopup>
    ) : (
      <FilterPlain
        className={className}
        rootClassName={rootClassName}
        label={labelForPlain}
        labelWithoutCounter={label}
        isSelected={selectedValuePresent}
        id={`${id}.plain`}
        filterId={filterId}
        liveEdit
        contentPlacementOffset={contentStyle}
        onSubmit={handleSubmit}
        initialValues={namedInitialValues}
        isCategory={isCategory}
        isCategoryAmenities={isCategoryAmenities}
        mainCategoriesImages={mainCategoriesImages}
        subCategoryImage={subCategoriesImages}
        labelImg={labelImg}
        setCurrentActiveCategory={setCurrentActiveCategory}
        isCategoryFilterEnabled={isCategoryFilterEnabled}
        isAmenitiesFilterEnabled={isAmenitiesFilterEnabled}
        currentActiveCategory={currentActiveCategory}
        filterConfig={filterConfig}
        selectedItemsCounter={selectedItemsCounter}
        isMobileLayout={isMobileLayout}
        setSelectedCategoriesLength={setSelectedCategoriesLength}
        {...rest}
      >
        <GroupOfFieldCheckboxes
          className={classNames(css.fieldGroupPlain, { [css.fieldGroupPlainCategory]: isCategory })}
          name={name}
          id={`${id}-checkbox-group`}
          options={options}
          isCategory={isCategory}
          subCategoryImage={subCategoriesImages}
        />
      </FilterPlain>
    );
  }
}

SelectMultipleFilter.defaultProps = {
  rootClassName: null,
  className: null,
  initialValues: null,
  contentPlacementOffset: 0,
};

SelectMultipleFilter.propTypes = {
  rootClassName: string,
  className: string,
  id: string.isRequired,
  filterConfig: object,
  name: string.isRequired,
  queryParamNames: arrayOf(string).isRequired,
  label: node.isRequired,
  onSubmit: func.isRequired,
  options: array.isRequired,
  initialValues: object,
  contentPlacementOffset: number,

  // form injectIntl
  intl: intlShape.isRequired,
};

export default injectIntl(SelectMultipleFilter);
