import React, { Component, useEffect, useState } from 'react';
import { string, bool, func } from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import classNames from 'classnames';
import {
  Form,
  PrimaryButton,
  FieldTextInput,
  IconEnquiry,
  FieldDateInput,
  FieldSelect,
  FieldRadioButton,
  FieldDateRangeInput,
} from '../../components';
import * as validators from '../../util/validators';
import { propTypes } from '../../util/types';

import css from './EnquiryForm.module.css';
import BookingTimeForm from '../BookingTimeForm/BookingTimeForm';
import { SingleDatePicker } from 'react-dates';
import { timeOfDayFromLocalToTimeZone, timeOfDayFromTimeZoneToLocal } from '../../util/dates';

import { Field, Form as FinalForm, FormSpy } from 'react-final-form';
import { formatMoney } from '../../util/currency';
import { types as sdkTypes } from '../../util/sdkLoader';
import { getAvailablePrices, getLowestPrice, getTypeDuration } from '../../util/data';
// import {
//   HOURLY_PRICE,
// } from '../../util/types';

import _css from '../../components/BookingTypes/BookingTypes.module.css';
import FieldRadioButtonComponentOnChange from '../../components/FieldRadioButton/FieldRadioButtonOnChange';
import BookingDatesForm from '../BookingDatesForm/BookingDatesForm';

const { Money } = sdkTypes;

class BookingTypesEnquiry extends React.Component {
  handleOnChange = values => {
    console.log('handleOnChange', values.bookingTypeEnquiry);
    this.props.onChange(values.bookingTypeEnquiry);
  };

  componentDidMount() {
    if (this.props.bookingTypeRadio === null) {
      const prices = getAvailablePrices(this.props.listing);
      if (prices && prices.length > 0) {
        console.log('componentDidMount', prices[0].key);
        this.props.onChange(prices[0].key);
      }
    }
  }

  render() {
    const { listing, intl } = this.props;
    const prices = getAvailablePrices(listing);
    const { key } = getLowestPrice(listing);
    const initialValues = { bookingTypeEnquiry: key || null };

    return (
      <FinalForm
        initialValues={initialValues}
        onSubmit={() => {}} // empty submit function
        render={({ handleSubmit, form }) => (
          <form
            onSubmit={e => {
              e.preventDefault();
            }}
          >
            <FormSpy
              subscription={{ values: true }}
              onChange={({ values }) => this.handleOnChange(values)}
            />
            <div className={css.types}>
              {prices.map(({ key, value }) => {
                const { currency, amount } = value;
                const price = formatMoney(intl, new Money(amount, currency));
                return (
                  <div className={css.sessionCheckboxItem} key={key}>
                    <FieldRadioButtonComponentOnChange
                      id={`bookingTypeEnquiry${key}`}
                      name="bookingTypeEnquiry"
                      label={intl.formatMessage({ id: `BookingTypes.${key}Label` }, { price })}
                      value={key}
                    />
                  </div>
                );
              })}
            </div>
          </form>
        )}
      />
    );
  }
}

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
    currentPlanType,
    enquiryDateTimeDataError,
  } = props;

  //! Enquiry Date/Time Form Configs
  const [planType, setPlanType] = useState(null);
  const [bookingTypeRadio, setBookingTypeRadio] = useState(null);

  useEffect(() => {
    updateEnquiryDateTime('planType', bookingTypeRadio);
  }, [bookingTypeRadio]);

  const [bookingStartDate, setBookingStartDate] = useState('');
  const [bookingEndDate, setBookEndDate] = useState('');
  const [bookingStartTime, setBookingStartTime] = useState('');
  const [bookingEndTime, setBookingEndTime] = useState('');

  const onBookingTypeChange = e => {
    toggleBookingType(e);
    setBookingTypeRadio(e);
  };
  const _timeStamp = [
    '00:00',
    '01:00',
    '02:00',
    '03:00',
    '04:00',
    '05:00',
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00',
    '24:00',
  ];

  console.log('Enquiry', planType);

  function onBookingDateChange(e) {
    if (e.values.bookingDates) {
      const { endDate, startDate } = e?.values?.bookingDates;
      console.log('onBookingDateChange', endDate, startDate, e?.values?.bookingDates);
      if (endDate) {
        setBookEndDate(endDate);
        updateEnquiryDateTime('EndDate', endDate);
      } else {
        setBookingStartDate(startDate);
        updateEnquiryDateTime('StartDate', startDate);
      }
    }
  }
  function onBookingStartDateChange(startDate) {
    setBookingStartDate(startDate.date);
    updateEnquiryDateTime('StartDate', startDate.date);
  }
  function onBookingStartTimeChange(e) {
    setBookingStartTime(e);
    updateEnquiryDateTime('StartTime', e);
    // updateEnquiryDateTime('planType', planType);
  }

  function onBookingEndTimeChange(e) {
    setBookingEndTime(e);
    updateEnquiryDateTime('EndTime', e);
    // updateEnquiryDateTime('planType', planType);
  }

  const filteredEndTimes = bookingStartTime
    ? _timeStamp.filter(time => time > bookingStartTime)
    : _timeStamp;

  //! ENQUIRY DATE/TIME FORM CONFIG END

  const dateFormattingOptions = { month: 'short', day: 'numeric', weekday: 'short' };

  const { price, availabilityPlan, state, publicData } = listing.attributes;

  const { discount, minimumLength, minBooking } = publicData || {};
  const { minBookingCount, minBookingType } = minBooking || {};
  const timeZone = availabilityPlan && availabilityPlan.timezone;

  // console.log(
  //   'Enquiry Form',
  //   { unitType },
  //   { minimumLength },
  //   { minimumLength },
  //   { timeSlots },
  //   { fetchLineItemsInProgress },
  //   { minBookingCount },
  //   { minBookingType },
  //   { bookingType }
  // );

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
            <BookingTypesEnquiry
              intl={intl}
              listing={listing}
              bookingTypeRadio={bookingTypeRadio}
              onChange={e => onBookingTypeChange(e)}
            />

            <div className={css.formRow}>
              {bookingTypeRadio === 'price' ? (
                <div className={classNames(css.field, css.fieldDate, css.startDate)}>
                  <FieldDateInput
                    className={css.fieldDateInput}
                    name="bookingStartDate"
                    id={'bookingStartDate'}
                    label={'Start Date'}
                    placeholderText={'Start Date'}
                    format={v =>
                      v && v.date ? { date: timeOfDayFromTimeZoneToLocal(v.date, timeZone) } : v
                    }
                    parse={v =>
                      v && v.date ? { date: timeOfDayFromLocalToTimeZone(v.date, timeZone) } : v
                    }
                    onChange={onBookingStartDateChange}
                    showErrorMessage={true}
                  />
                </div>
              ) : (
                <BookingDatesForm
                  updateDiscount={updateDiscount}
                  promocode={promocode}
                  key={bookingType}
                  className={css.bookingForm}
                  formId="BookingPanel"
                  submitButtonWrapperClassName={css.bookingDatesSubmitButtonWrapper}
                  unitType={unitType}
                  minimumLength={getTypeDuration(bookingType)}
                  onSubmit={onSubmit}
                  price={price}
                  discount={discount}
                  listingId={listing.id}
                  isOwnListing={isOwnListing}
                  timeSlots={timeSlots}
                  fetchTimeSlotsError={fetchTimeSlotsError}
                  onFetchTransactionLineItems={onFetchTransactionLineItems}
                  lineItems={lineItems}
                  fetchLineItemsInProgress={fetchLineItemsInProgress}
                  fetchLineItemsError={fetchLineItemsError}
                  bookingType={bookingType}
                  // seats={seats}
                  minBookingCount={minBookingCount}
                  minBookingType={minBookingType}
                  isFromEnquiry={true}
                  enquiryOnChangeDates={e => onBookingDateChange(e)}
                />
              )}
            </div>
            {bookingTypeRadio === 'price' && (
              <div className={css.formRow}>
                <div className={css.fieldTime}>
                  <FieldSelect
                    name="bookingStartTime"
                    id="bookingStartTime"
                    className={css.fieldSelect}
                    selectClassName={css.select}
                    label="Start Time"
                    onChange={onBookingStartTimeChange}
                  >
                    {_timeStamp.map(p => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </FieldSelect>
                </div>

                <div className={css.lineBetween}>-</div>

                <div className={css.fieldTime}>
                  <FieldSelect
                    name="bookingEndTime"
                    id="bookingEndTime"
                    className={css.fieldSelect}
                    selectClassName={css.select}
                    label="End Time"
                    onChange={onBookingEndTimeChange}
                  >
                    {filteredEndTimes.map(p => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </FieldSelect>
                </div>
              </div>
            )}
            {enquiryDateTimeDataError && (
              <p style={{ color: '#ef7171', fontSize: 16, fontFamily: 'sofiapro', margin: 0 }}>
                *Please select when you want to book
              </p>
            )}
            {/* <BookingTimeForm
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
            /> */}

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
