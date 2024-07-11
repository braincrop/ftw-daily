import React from 'react';
import { string, bool } from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';
import { Form, PrimaryButton, FieldTextInput, IconEnquiry } from '../../components';
import * as validators from '../../util/validators';
import { propTypes } from '../../util/types';

import css from './EnquiryForm.module.css';
import BookingTimeForm from '../BookingTimeForm/BookingTimeForm';

const EnquiryFormComponent = props => {
  const {
    unitType,
    updateDiscount,
    promocode,
    rootClassName,
    className,
    titleClassName,
    listing,
    isOwnListing,
    onSubmit,
    // onSubmitBooking,
    title,
    subTitle,
    authorDisplayName,
    onManageDisableScrolling,
    onFetchTimeSlots,
    monthlyTimeSlots,
    timeSlots,
    fetchTimeSlotsError,
    history,
    location,
    intl,
    onFetchTransactionLineItems,
    lineItems,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    bookingType,
    toggleBookingType,
    updateEnquiryDateTime,
    enquiryDateTimeDataError,
    updateEnquiryDateTimeError,
  } = props;

  const onSubmitBooking = e => {
    // console.log('Enquiry Form', e);
    updateEnquiryDateTimeError(false);
    updateEnquiryDateTime(e);
  };
  const dateFormattingOptions = { month: 'short', day: 'numeric', weekday: 'short' };

  const { price, availabilityPlan, state, publicData } = listing.attributes;

  const { discount, minimumLength, minBooking } = publicData || {};
  const { minBookingCount, minBookingType } = minBooking || {};
  const timeZone = availabilityPlan && availabilityPlan.timezone;
  return (
    <FinalForm
      {...props}
      render={fieldRenderProps => {
        const {
          rootClassName,
          className,
          submitButtonWrapperClassName,
          formId,
          handleSubmit,
          inProgress,
          intl,
          listingTitle,
          authorDisplayName,
          sendEnquiryError,
        } = fieldRenderProps;

        const messageLabel = intl.formatMessage(
          {
            id: 'EnquiryForm.messageLabel',
          },
          { authorDisplayName }
        );
        const messagePlaceholder = intl.formatMessage(
          {
            id: 'EnquiryForm.messagePlaceholder',
          },
          { authorDisplayName }
        );
        const messageRequiredMessage = intl.formatMessage({ id: 'EnquiryForm.messageRequired' });

        const messageRequired = validators.requiredAndNonEmptyString(messageRequiredMessage);

        // message warning

        const firstWarning = intl.formatMessage({ id: 'TransactionPage.warningNotification1' });
        const secondWarning = intl.formatMessage({ id: 'TransactionPage.warningNotification2' });
        const thirdWarning = intl.formatMessage({ id: 'TransactionPage.warningNotification3' });

        const classes = classNames(rootClassName || css.root, className);
        const submitInProgress = inProgress;
        const submitDisabled = submitInProgress;

        return (
          <Form
            className={classes}
            onSubmit={handleSubmit}
            enforcePagePreloadFor="OrderDetailsPage"
          >
            <IconEnquiry className={css.icon} />
            <h2 className={css.heading}>
              <FormattedMessage
                id="EnquiryForm.heading"
                values={{ listingTitle, authorDisplayName }}
              />
            </h2>
            <BookingTimeForm
              updateDiscount={updateDiscount}
              promocode={promocode}
              key={bookingType}
              className={css.bookingForm}
              formId="BookingPanel"
              submitButtonWrapperClassName={css.submitButtonWrapper}
              unitType={unitType}
              onSubmit={onSubmitBooking}
              price={price}
              isOwnListing={isOwnListing}
              listingId={listing.id}
              monthlyTimeSlots={monthlyTimeSlots}
              onFetchTimeSlots={onFetchTimeSlots}
              startDatePlaceholder={intl.formatDate(new Date(), dateFormattingOptions)}
              endDatePlaceholder={intl.formatDate(new Date(), dateFormattingOptions)}
              timeZone={timeZone}
              onFetchTransactionLineItems={onFetchTransactionLineItems}
              lineItems={lineItems}
              fetchLineItemsInProgress={fetchLineItemsInProgress}
              fetchLineItemsError={fetchLineItemsError}
              minBookingCount={minBookingCount}
              minBookingType={minBookingType}
              isFromEnquiry={true}
            />
            {enquiryDateTimeDataError && (
              <p style={{ color: 'red', fontSize: 13 }}>
                *Please click button to save data/time data
              </p>
            )}
            <FieldTextInput
              className={css.field}
              type="textarea"
              name="message"
              id={formId ? `${formId}.message` : 'message'}
              label={messageLabel}
              placeholder={messagePlaceholder}
              validate={messageRequired}
            />

            <div className={css.containerWarningMessage}>
              <p>{firstWarning}</p>
              <br></br>
              <p>{secondWarning}</p>
              <br></br>
              <p>{thirdWarning}</p>
            </div>
            <div className={submitButtonWrapperClassName}>
              {sendEnquiryError ? (
                <p className={css.error}>
                  <FormattedMessage id="EnquiryForm.sendEnquiryError" />
                </p>
              ) : null}
              <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
                <FormattedMessage id="EnquiryForm.submitButtonText" />
              </PrimaryButton>
            </div>
          </Form>
        );
      }}
    />
  );
};
EnquiryFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  submitButtonWrapperClassName: null,
  inProgress: false,
  sendEnquiryError: null,
};

EnquiryFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  submitButtonWrapperClassName: string,

  inProgress: bool,

  listingTitle: string.isRequired,
  authorDisplayName: string.isRequired,
  sendEnquiryError: propTypes.error,

  // from injectIntl
  intl: intlShape.isRequired,
};

const EnquiryForm = compose(injectIntl)(EnquiryFormComponent);

EnquiryForm.displayName = 'EnquiryForm';

export default EnquiryForm;
