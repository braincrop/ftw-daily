import React, { Component } from 'react';
import { bool, func, node, number, object, string } from 'prop-types';
import classNames from 'classnames';
import { injectIntl, intlShape } from '../../util/reactIntl';

import { OutsideClickHandler } from '../../components';
import { FilterForm } from '../../forms';
import css from './FilterPopup.module.css';


const KEY_CODE_ESCAPE = 27;

class FilterPopup extends Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };
    this.filter = null;
    this.filterContent = null;

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.toggleOpen = this.toggleOpen.bind(this);
    this.positionStyleForContent = this.positionStyleForContent.bind(this);
  }

  handleSubmit(values) {
    const { onSubmit, setSelectedCategoriesLength } = this.props;
    this.setState({ isOpen: false });
    this.props.isCategory && this.props.onOpenCategoryFilter();

    const valuesLength = Object.values(values)?.[0]?.length
    !!setSelectedCategoriesLength && setSelectedCategoriesLength(valuesLength)

    onSubmit(values);
  }

  handleClear() {
    const { onSubmit, onClear, setSelectedCategoriesLength } = this.props;
    this.setState({ isOpen: false });
    this.props.isCategory && this.props.onOpenCategoryFilter();

    !!setSelectedCategoriesLength && setSelectedCategoriesLength(0)

    if (onClear) {
      onClear();
    }

    onSubmit(null);
  }

  handleCancel() {
    const { onSubmit, onCancel, initialValues, isCategory } = this.props;
    this.setState({ isOpen: false });

    if (onCancel) {
      onCancel();
    }

    if(!isCategory) {
      onSubmit(initialValues);
    }
  }

  handleBlur() {
    this.setState({ isOpen: false });
  }

  handleKeyDown(e) {
    // Gather all escape presses to close menu
    if (e.keyCode === KEY_CODE_ESCAPE) {
      this.toggleOpen(false);
    }
  }

  toggleOpen(enforcedState) {
    if (enforcedState) {
      this.setState({ isOpen: enforcedState });
    } else {
      this.setState(prevState => ({ isOpen: !prevState.isOpen }));
    }
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
      popupClassName,
      id,
      label,
      labelImg,
      labelMaxWidth,
      isSelected,
      children,
      initialValues,
      keepDirtyOnReinitialize,
      contentPlacementOffset,
      isCategory,
      mainCategoriesImages,
      isCategoryFilterEnabled,
    } = this.props;

  
    const classes = classNames(rootClassName || css.root, className, {[css.categoryFilterItem]: isCategory});
    const popupClasses = classNames(css.popup, { [css.isOpen]: this.state.isOpen }, {[css.subCategories]: isCategory});
    const popupSizeClasses = popupClassName || css.popupSize;
    const labelStyles = isSelected ? css.labelSelected : css.label;
    const labelMaxWidthMaybe = labelMaxWidth ? { maxWidth: `${labelMaxWidth}px` } : {};
    const labelMaxWidthStyles = labelMaxWidth ? css.labelEllipsis : null;
    const contentStyle = this.positionStyleForContent();


    let categoryImg;

    switch(labelImg) {
      case 'coworking':
        categoryImg = <img src={mainCategoriesImages.coworking} alt ="coworking" className={css.categoryImg} />
        break;
      case 'fitness':
        categoryImg = <img src={mainCategoriesImages.fitness}  alt="fitness" className={css.categoryImg} />
        break;
      case 'hairBeauty':
        categoryImg = <img src={mainCategoriesImages.hairBeauty}  alt="hairBeauty" className={css.categoryImg} />
        break;
      case 'kitchensAndPopUps':
        categoryImg = <img src={mainCategoriesImages.kitchensAndPopUps}  alt="kitchensAndPopUps" className={css.categoryImg} />
        break;
      case 'musicAndArts':
        categoryImg = <img src={mainCategoriesImages.musicAndArts}  alt="musicAndArts" className={css.categoryImg} />
        break;
      case 'eventsAndVenues':
        categoryImg = <img src={mainCategoriesImages.eventsAndVenues}  alt="eventsAndVenues" className={css.categoryImg} />
        break;
      case 'photographyAndFilm':
        categoryImg = <img src={mainCategoriesImages.photographyAndFilm}  alt="photographyAndFilm" className={css.categoryImg} />
        break;
      case 'wellness':
        categoryImg = <img src={mainCategoriesImages.wellness}  alt="wellness" className={css.categoryImg} />
        break;
      default: null;
    }

    const wrapperClasses = classNames(
      {[css.categoryClickHandler]: isCategory},
      {[css.categorySelected]: isSelected},
      {[css.categoryNotSelected]: !isSelected && !!isCategoryFilterEnabled}
    )


  
    return (
      <OutsideClickHandler onOutsideClick={this.handleBlur} rootClassName={wrapperClasses}>
        <div
          className={classes}
          onKeyDown={this.handleKeyDown}
          ref={node => {
            this.filter = node;
          }}
        >
          <button
            className={classNames(labelStyles, labelMaxWidthStyles)}
            style={labelMaxWidthMaybe}
            onClick={() => this.toggleOpen()}
          >
            {isCategory && labelImg && categoryImg}
            <span className={css.labelText}>
              {label}
            </span>
          </button>
          <div
            id={id}
            className={popupClasses}
            ref={node => {
              this.filterContent = node;
            }}
            style={contentStyle}
          >
            {this.state.isOpen ? (
              <FilterForm
                id={`${id}.form`}
                paddingClasses={!isCategory &&  popupSizeClasses}
                showAsPopup
                contentPlacementOffset={contentPlacementOffset}
                initialValues={initialValues}
                keepDirtyOnReinitialize={keepDirtyOnReinitialize}
                onSubmit={this.handleSubmit}
                onCancel={this.handleCancel}
                onClear={this.handleClear}
                isCategory={isCategory}
                activeCategory={label}
                closeSubCategory={this.handleBlur}
              >
                {children}
              </FilterForm>
            ) : null}
          </div>
        </div>
      </OutsideClickHandler>
    );
  }
}

FilterPopup.defaultProps = {
  rootClassName: null,
  className: null,
  popupClassName: null,
  initialValues: null,
  keepDirtyOnReinitialize: false,
  contentPlacementOffset: 0,
  liveEdit: false,
  label: null,
  labelMaxWidth: null,
};

FilterPopup.propTypes = {
  rootClassName: string,
  className: string,
  popupClassName: string,
  id: string.isRequired,
  onSubmit: func.isRequired,
  initialValues: object,
  keepDirtyOnReinitialize: bool,
  contentPlacementOffset: number,
  label: string.isRequired,
  labelMaxWidth: number,
  isSelected: bool.isRequired,
  children: node.isRequired,

  // form injectIntl
  intl: intlShape.isRequired,
};

export default injectIntl(FilterPopup);
