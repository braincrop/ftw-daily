import React from 'react';
import { bool, func, shape, string } from 'prop-types';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { intlShape, injectIntl, FormattedMessage } from '../../util/reactIntl';
import { findOptionsForSelectFilter } from '../../util/search';
import { propTypes } from '../../util/types';
import config from '../../config';
import { Button, FieldCheckboxGroup, Form, FieldTextInput } from '../../components';

import css from './EditListingFeaturesForm.module.css';

const EditListingFeaturesFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        disabled,
        ready,
        intl,
        rootClassName,
        className,
        name,
        handleSubmit,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        filterConfig,
        category,
      } = formRenderProps;


      const miscLabel = intl.formatMessage({
        id: 'EditListingFeaturesForm.miscLabel',
      });

      const miscPlaceholder = intl.formatMessage({
        id: 'EditListingFeaturesForm.miscPlaceholder',
      });

      const equipmentProvidedLabel = intl.formatMessage({
        id: 'EditListingFeaturesForm.equipmentProvidedLabel',
      });

      const equipmentProvidedPlaceholder = intl.formatMessage({
        id: 'EditListingFeaturesForm.equipmentProvidedPlaceholder',
      });

      const classes = classNames(rootClassName || css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = disabled || submitInProgress;

      const { updateListingError, showListingsError } = fetchErrors || {};
      const errorMessage = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingFeaturesForm.updateFailed" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingFeaturesForm.showListingFailed" />
        </p>
      ) : null;
      
      const amenities = config.custom.amenities || [];
      // const isCategory = [];

      const amenitiesCheckboxGroups = amenities.map((amen, i) => {
        const catGroupForThisAmen = amen.config.catKeys.split(',');
        // for (let i = 0; i < arrayCategory.length; i++) {
        //   isCategory = catGroupForThisAmen.includes(arrayCategory[i]); 
        // }
        const arrayCategory = category.map(a => a.value);

        const shouldDisplayTheseAmenties = catGroupForThisAmen.includes(category) || arrayCategory.some(o => catGroupForThisAmen.includes(o)) || amen.config.catKeys === 'all';

        return shouldDisplayTheseAmenties
          ? (
            <details>
            {/* <span key={`${i}.${name}`}> */}
            <summary><h3>{amen.label}</h3></summary>
              <FieldCheckboxGroup
                className={css.features}
                id={name}
                name={name}
                options={amen.config.options}
              />
              
            {/* </span> */}
            
            </details>
          )
          : null
      });

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {errorMessage}
          {errorMessageShowListing}

          { amenitiesCheckboxGroups }

          <p className={css.note}>
            <FormattedMessage id ="EditListingFeaturesForm.equipmentProvidedNote"/>
          </p>

          <FieldTextInput
            id="miscAmenities"
            name="miscAmenities"
            className={css.features}
            type="textarea"
            label={miscLabel}
            placeholder={miscPlaceholder}
          />
          
          <FieldTextInput
            id="equipmentProvided"
            name="equipmentProvided"
            className={css.features}
            type="textarea"
            label={equipmentProvidedLabel}
            placeholder={equipmentProvidedPlaceholder}
          />

          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
        </Form>
      );
    }}
  />
);

EditListingFeaturesFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  fetchErrors: null,
  filterConfig: config.custom.filters,
};

EditListingFeaturesFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  name: string.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  intl: intlShape.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  filterConfig: propTypes.filterConfig,
};

const EditListingFeaturesForm = EditListingFeaturesFormComponent;

export default injectIntl(EditListingFeaturesForm);
