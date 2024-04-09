import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from '../../util/reactIntl';
import classNames from 'classnames';
import { ACCOUNT_SETTINGS_PAGES } from '../../routeConfiguration';
import { propTypes } from '../../util/types';
import config from '../../config';
import TopbarDropDown from './TopbarDropDown';
import { withRouter } from 'react-router-dom';

import {
  Avatar,
  InlineTextButton,
  Logo,
  Menu,
  MenuLabel,
  MenuContent,
  MenuItem,
  NamedLink,
  ExternalLink,
} from '../../components';
import { TopbarSearchForm } from '../../forms';

import css from './TopbarDesktop.module.css';

const TopbarDesktop = props => {
  const {
    className,
    currentUser,
    history,
    currentPage,
    rootClassName,
    currentUserHasListings,
    notificationCount,
    intl,
    isAuthenticated,
    onLogout,
    onSearchSubmit,
    initialSearchFormValues,
    currentSearchParams,
  } = props;
  const { generalCategories, categories } = config.custom;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const [category, setCategory] = useState('Categories');
  const [genCats, setGenCats] = useState(generalCategories);

  // console.log('search Cat:', categories);

  function createSearchBar() {
    const catKeys =
      category && category !== 'Categories'
        ? categories.find(cat => cat.label === category).config.catKeys
        : '';

    return (
      <TopbarSearchForm
        className={css.searchLink}
        desktopInputRoot={css.topbarSearchWithLeftPadding}
        onSubmit={onSearchSubmit}
        initialValues={initialSearchFormValues}
        // dropdown={topbarDropDown}
        selectedCategories={catKeys}
      />
    );
  }

  let search;
  const onDropDownClick = selectedText => {
    const locationParams =
      's?address=&bounds=59.49417013%2C4.15978193%2C49.54972301%2C-10.51994741/';
    const result = categories.filter(obj => {
      return obj.label === selectedText;
    });

    const newCategory = selectedText === 'Clear' ? 'Categories' : selectedText;
    let link;
    setCategory(newCategory);
    newCategory !== 'Categories'
      ? (link =
          '&pub_category=has_any%3A' +
          result.map(e => e.config.catKeys)[0]?.split(',')[0] +
          '%2C' +
          result
            .map(e => e.config.catKeys)[0]
            ?.split(',')
            .join('%2C', 1))
      : '';
    const newGenCats = Object.assign(genCats, { label: newCategory });
    setGenCats(newGenCats);
    search = createSearchBar();
    forceUpdate();
    return link ? history.push(`${window.location.pathname}${locationParams}${link}`) : '';
  };

  const topbarDropDown = (
    <TopbarDropDown
      onClick={onDropDownClick}
      generalCategories={genCats}
      currentSearchParams={currentSearchParams}
      initialValues={initialSearchFormValues}
    />
  );

  const authenticatedOnClientSide = mounted && isAuthenticated;
  const isAuthenticatedOrJustHydrated = isAuthenticated || !mounted;

  const classes = classNames(rootClassName || css.root, className);

  search = createSearchBar();

  const notificationDot = notificationCount > 0 ? <div className={css.notificationDot} /> : null;

  const inboxLink = authenticatedOnClientSide ? (
    <NamedLink
      className={css.inboxLink}
      name="InboxPage"
      params={{ tab: currentUserHasListings ? 'sales' : 'orders' }}
    >
      <span className={css.inbox}>
        <FormattedMessage id="TopbarDesktop.inbox" />
        {notificationDot}
      </span>
    </NamedLink>
  ) : null;

  const blog = (
    <ExternalLink href="https://www.hotpatch.com/blog/" className={css.inboxLink}>
      <span className={css.inbox}>
        <FormattedMessage id="Footer.toBlogPage" />
        {notificationDot}
      </span>
    </ExternalLink>
  );

  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    return currentPage === page || isAccountSettingsPage ? css.currentPage : null;
  };

  const profileMenu = authenticatedOnClientSide ? (
    <Menu>
      <MenuLabel className={css.profileMenuLabel} isOpenClassName={css.profileMenuIsOpen}>
        <Avatar className={css.avatar} user={currentUser} disableProfileLink />
      </MenuLabel>
      <MenuContent className={css.profileMenuContent}>
        <MenuItem key="ManageListingsPage">
          <NamedLink
            className={classNames(css.yourListingsLink, currentPageClass('ManageListingsPage'))}
            name="ManageListingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.yourListingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="ProfileSettingsPage">
          <NamedLink
            className={classNames(css.profileSettingsLink, currentPageClass('ProfileSettingsPage'))}
            name="ProfileSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.profileSettingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="AccountSettingsPage">
          <NamedLink
            className={classNames(css.yourListingsLink, currentPageClass('AccountSettingsPage'))}
            name="AccountSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.accountSettingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="logout">
          <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.logout" />
          </InlineTextButton>
        </MenuItem>
      </MenuContent>
    </Menu>
  ) : null;

  const signupLink = isAuthenticatedOrJustHydrated ? null : (
    <NamedLink name="SignupPage" className={css.signupLink}>
      <span className={css.signup}>
        <FormattedMessage id="TopbarDesktop.signup" />
      </span>
    </NamedLink>
  );

  const loginLink = isAuthenticatedOrJustHydrated ? null : (
    <NamedLink name="LoginPage" className={css.loginLink}>
      <span className={css.login}>
        <FormattedMessage id="TopbarDesktop.login" />
      </span>
    </NamedLink>
  );

  const locationParams = '?address=&bounds=59.49417013%2C4.15978193%2C49.54972301%2C-10.51994741';
  const hairBeautyUrlParams = `${locationParams}&pub_category=has_any%3Ahair-stylist%2Cbarber%2Cmakeup-artist%2Cnail-technician%2Ccosmetics%2Caesthetics%2Ctattoo-and-piercing`;
  const wellnessUrlParams = `${locationParams}&pub_category=has_any%3Atherapy-room%2Cmassage-room%2Cclinical-room`;
  const fitnessUrlParams = `${locationParams}&pub_category=has_any%3Afitness%2Cyoga-studio%2Cdance-studio%2Csports-hall%2Coutdoor-sport-space%2Cactivity-room`;
  const photographyAndFilmUrlParams = `${locationParams}&pub_category=has_any%3Alocation-shoot%2Coutdoor-site%2Cphotography`;
  const coworkingUrlParams = `${locationParams}&pub_category=has_any%3Adesk-space%2Coffice-space%2Cmeeting-room-space%2Cconference-room%2Cclassroom`;
  const musicAndArtsUrlParams = `${locationParams}&pub_category=has_any%3Amusic-studio%2Crecording-studio%2Cgallery-space%2Cart-studio%2Crehearsal-space%2Cdrama-studio%2Ctheatre-space`;
  const eventsAndVenuesUrlParams = `${locationParams}&pub_category=has_any%3Amusic-venue%2Cprivate-event-space%2Csports-venue%2Cconference-exhibition%2Coutdoor-events%2Cprivate-dining`;
  const kitchensAndPopUpsUrlParams = `${locationParams}&pub_category=has_any%3Akitchen-space%2Cpop-up-space`;

  const categoriesMenuContent = [
    { titleId: 'TopbarDesktop.hairBeauty', url: hairBeautyUrlParams },
    { titleId: 'TopbarDesktop.wellness', url: wellnessUrlParams },
    { titleId: 'TopbarDesktop.fitness', url: fitnessUrlParams },
    { titleId: 'TopbarDesktop.photographyAndFilm', url: photographyAndFilmUrlParams },
    { titleId: 'TopbarDesktop.coworking', url: coworkingUrlParams },
    { titleId: 'TopbarDesktop.musicAndArts', url: musicAndArtsUrlParams },
    { titleId: 'TopbarDesktop.eventsAndVenues', url: eventsAndVenuesUrlParams },
    { titleId: 'TopbarDesktop.kitchensAndPopUps', url: kitchensAndPopUpsUrlParams },
  ];

  const categoriesBtn = currentPage !== 'SearchPage' && (
    <Menu>
      <MenuLabel className={css.categoriesBtn}>
        <FormattedMessage id="TopbarDesktop.categories" />
      </MenuLabel>
      <MenuContent className={css.categoriesMenuContent}>
        {categoriesMenuContent.map(item => {
          return (
            <MenuItem key={item.titleId}>
              <NamedLink className={css.categoriesLink} name="SearchPage" to={{ search: item.url }}>
                <span className={css.menuItemBorder} />
                <FormattedMessage id={item.titleId} onClick={() => alert('1')} />
              </NamedLink>
            </MenuItem>
          );
        })}
      </MenuContent>
    </Menu>
  );

  return (
    <nav className={classes}>
      <NamedLink className={css.logoLink} name="LandingPage">
        <Logo
          format="desktop"
          className={css.logo}
          alt={intl.formatMessage({ id: 'TopbarDesktop.logo' })}
        />
      </NamedLink>
      {/* {search} */}
      <div style={{ width: '60%' }} />
      {categoriesBtn}
      <NamedLink className={css.createListingLink} name="NewListingPage">
        <span className={css.createListing}>
          <FormattedMessage id="TopbarDesktop.createListing" />
        </span>
      </NamedLink>
      {blog}
      {inboxLink}
      {profileMenu}
      {loginLink}
      {signupLink}
    </nav>
  );
};

const { bool, func, object, number, string } = PropTypes;

TopbarDesktop.defaultProps = {
  rootClassName: null,
  className: null,
  currentUser: null,
  currentPage: null,
  notificationCount: 0,
  initialSearchFormValues: {},
};

TopbarDesktop.propTypes = {
  rootClassName: string,
  className: string,
  currentUserHasListings: bool.isRequired,
  currentUser: propTypes.currentUser,
  currentPage: string,
  isAuthenticated: bool.isRequired,
  onLogout: func.isRequired,
  notificationCount: number,
  onSearchSubmit: func.isRequired,
  initialSearchFormValues: object,
  intl: intlShape.isRequired,
};

export default withRouter(TopbarDesktop);
