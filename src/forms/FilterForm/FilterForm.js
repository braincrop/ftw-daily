import React from 'react';
import { bool, func, node, object } from 'prop-types';
import classNames from 'classnames';
import { Form as FinalForm, FormSpy } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';

import { Form, IconCloseCustom } from '../../components';
import css from './FilterForm.module.css';

const MODAL_BREAKPOINT = 768; // Search is in modal on mobile layout

const FilterFormComponent = props => {
  const { liveEdit, onChange, onSubmit, onCancel, onClear, ...rest } = props;

  if (liveEdit && !onChange) {
    throw new Error('FilterForm: if liveEdit is true you need to provide onChange function');
  }

  if (!liveEdit && !(onCancel && onClear && onSubmit)) {
    throw new Error(
      'FilterForm: if liveEdit is false you need to provide onCancel, onClear, and onSubmit functions'
    );
  }

  const handleChange = formState => {
    if (formState.dirty) {
      onChange(formState.values);
    }
  };

  const isMobileLayout = !!window && window.innerWidth < MODAL_BREAKPOINT;

  const formCallbacks = liveEdit ? { onSubmit: () => null } : { onSubmit, onCancel, onClear };
  return (
    <FinalForm
      {...rest}
      {...formCallbacks}
      mutators={{ ...arrayMutators }}
      render={formRenderProps => {
        const {
          id,
          form,
          handleSubmit,
          onClear,
          onCancel,
          style,
          paddingClasses,
          intl,
          children,
          isCategory,
          isCategoryAmenities,
          activeCategory,
          closeSubCategory,
          // mobile
          isSubCategoryOpen,
          toggleIsSubCategoryOpen,
          selectedItemsCounter,
        } = formRenderProps;

        const handleCancel = () => {
          // reset the final form to initialValues
          form.reset();
          onCancel();
        };

        const clear = intl.formatMessage({ id: 'FilterForm.clear' });
        const cancel = intl.formatMessage({ id: 'FilterForm.cancel' });
        const submit = intl.formatMessage({ id: 'FilterForm.submit' });

        const classes = classNames(css.root, { [css.subCategoryItem]: isCategory });

        // console.log('isFromLandingPageSearch', props.isFromLandingPageSearch);
        return (
          <Form
            id={id}
            className={classes}
            onSubmit={handleSubmit}
            tabIndex="0"
            style={{ ...style }}
          >
            {isCategory ? (
              <div
                className={
                  props.isFromLandingPageSearch ? css.LandingWrapper : css.LandingWrapperMain
                }
              >
                <div
                  className={classNames(
                    !props.isFromLandingPageSearch
                      ? css.subcategoryHeading
                      : css.subcategoryHeadingMain,
                    {
                      [css.subcategoryHeading]: isSubCategoryOpen,
                    }
                  )}
                  onClick={toggleIsSubCategoryOpen}
                  style={isMobileLayout ? {} : { display: 'flex' }}
                >
                  <div className={css.LandingSubcategoryHeadingResp}>
                    <span className={css.subcategoryHeadingDesktop}>
                      <FormattedMessage id="FilterForm.patchCategory" />
                    </span>
                    <span className={css.subcategoryHeadingMobile}>
                      <FormattedMessage id="FilterForm.patchCategory" />
                      {!!selectedItemsCounter && ` • ${selectedItemsCounter}`}
                    </span>
                  </div>
                  <span className={css.activeCategory} onClick={closeSubCategory}>
                    {activeCategory}
                  </span>
                </div>
                {!props.isFromLandingPageSearch ? (
                  (!isMobileLayout || isSubCategoryOpen) && (
                    <>
                      <div
                        className={
                          props.isFromLandingPageSearch
                            ? `${css.subcategorySubHeadingLanding}  ${css.subcategorySubHeading}`
                            : css.subcategorySubHeading
                        }
                      >
                        <div>
                          <FormattedMessage
                            isFromLandingPageSearch={props.isFromLandingPageSearch}
                            id={`${
                              props.isFromLandingPageSearch
                                ? 'FilterForm.subcategoryLandingSearch'
                                : 'FilterForm.subcategory'
                            }`}
                          />
                          <span style={{ color: '#b2b2b2' }}>&nbsp;(Optional)</span>
                        </div>
                        <button
                          className={css.subcategoryClearButton}
                          type="button"
                          style={props.isFromLandingPageSearch ? { display: 'none' } : {}}
                          onClick={onClear}
                        >
                          <FormattedMessage id="FilterForm.reset" />
                        </button>
                      </div>
                      <div className={classNames(paddingClasses || css.contentWrapper)}>
                        {children}
                      </div>
                    </>
                  )
                ) : (
                  <>
                    <div
                      className={
                        props.isFromLandingPageSearch
                          ? `${css.subcategorySubHeadingLanding}  ${css.subcategorySubHeading}`
                          : css.subcategorySubHeading
                      }
                    >
                      <FormattedMessage
                        isFromLandingPageSearch={props.isFromLandingPageSearch}
                        id={`${
                          props.isFromLandingPageSearch
                            ? 'FilterForm.subcategoryLandingSearch'
                            : 'FilterForm.subcategory'
                        }`}
                      />
                      <span style={{ color: '#b2b2b2' }}>&nbsp;(Optional)</span>
                      <button
                        className={css.subcategoryClearButton}
                        type="button"
                        style={props.isFromLandingPageSearch ? { display: 'none' } : {}}
                        onClick={onClear}
                      >
                        <FormattedMessage id="FilterForm.reset" />
                      </button>
                    </div>
                    <div className={classNames(paddingClasses || css.contentWrapper)}>
                      {children}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className={classNames(paddingClasses || css.contentWrapper)}>{children}</div>
            )}

            {liveEdit ? (
              <FormSpy onChange={handleChange} subscription={{ values: true, dirty: true }} />
            ) : (
              <div className={css.buttonsWrapper}>
                <button className={css.clearButton} type="button" onClick={onClear}>
                  {clear}
                </button>
                <button
                  // style={props.isFromLandingPageSearch ? { display: 'none' } : {}}
                  className={
                    props.isFromLandingPageSearch ? css.submitLandingSearchButton : css.submitButton
                  }
                  type="submit"
                >
                  {submit}
                </button>
                <button className={css.cancelButton} type="button" onClick={handleCancel}>
                  {isCategory ? <IconCloseCustom /> : cancel}
                </button>
              </div>
            )}
          </Form>
        );
      }}
    />
  );
};

FilterFormComponent.defaultProps = {
  liveEdit: false,
  style: null,
  onCancel: null,
  onChange: null,
  onClear: null,
  isFromLandingPageSearch: false,
  onSubmit: null,
};

FilterFormComponent.propTypes = {
  liveEdit: bool,
  onCancel: func,
  onChange: func,
  onClear: func,
  onSubmit: func,
  style: object,
  children: node.isRequired,
  isFromLandingPageSearch: bool,

  // form injectIntl
  intl: intlShape.isRequired,
};

const FilterForm = injectIntl(FilterFormComponent);

export default FilterForm;
