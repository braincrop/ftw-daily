import { types as sdkTypes } from '../../util/sdkLoader';
import { resetToStartOfDay, getDefaultTimeZoneOnBrowser } from '../../util/dates';
import { denormalisedResponseEntities, ensureOwnListing } from '../../util/data';
import { storableError } from '../../util/errors';
// import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { fetchCurrentUser } from '../../ducks/user.duck';
import { LISTING_STATE_PUBLISHED } from '../../util/types';
// import { getOwnBookings } from '../../util/api';
import moment from 'moment';
import { getTransactions } from '../../util/api';

import isEmpty from 'lodash/isEmpty';
import { getMonthBoundries } from '../../util/dates';

// ================ Action types ================ //

export const BOOKING_REQUEST = 'app/BookingPanel/BOOKING_REQUEST';
export const BOOKING_SUCCESS = 'app/BookingPanel/BOOKING_SUCCESS';
export const BOOKING_ERROR = 'app/BookingPanel/BOOKING_ERROR';

// ================ Reducer ================ //

const initialState = {
    bookingPanelError: null,
  bookingPanelInProgress: false,
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case BOOKING_REQUEST:
      return {
        ...state,
        bookingPanelInProgress: true,
        bookingPanelError: null,
      };
    case BOOKING_SUCCESS:
      return { ...state, data: payload, bookingPanelInProgress: false };
    case BOOKING_ERROR:
      return { ...state, bookingPanelInProgress: false, bookingPanelError: payload };
    default:
      return state;
  }
}

// ================ Action creators ================ //

export const bookingPanelRequest = () => ({ type: BOOKING_REQUEST });
export const bookingPanelSuccess = data => ({ type: BOOKING_SUCCESS, payload: data });
export const bookingPanelError = error => ({ type: BOOKING_ERROR, payload: error, error: true });

// ================ Thunks ================ //

export const fetchData = (listing) => (dispatch, getState, sdk) => {
    // dispatch(bookingPanelRequest());

    
    const now = new Date();
    const weekBoundries = getMonthBoundries(new Date());

    const { start, end } = weekBoundries;
    // const data = {
    //     listId: listing.id
    //   }
       getTransactions({
        listId: listing.id,
        // createdAtStart: start,
        // createdAtEnd: end,
        // include: ['booking']
      })

      return sdk.bookings
    .query({ listingId: listing.id, start, end }, { expand: true })
    .then(res => {
        return dispatch(bookingPanelSuccess(res));
      })
    //   .then(res => {
    //     return dispatch(bookingPanelSuccess(res));
    //   })
      .catch(e => {
        console.log(e, 'eee');
        return dispatch(bookingPanelError(storableError(e)));
      });
  };