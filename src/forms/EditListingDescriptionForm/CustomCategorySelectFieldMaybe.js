import React from 'react';
import { required } from '../../util/validators';
import { FieldMultiSelect } from '../../components';

import css from './EditListingDescriptionForm.module.css';

const CustomCategorySelectFieldMaybe = props => {
  const { name, id, categories, intl } = props;
  const categoryLabel = intl.formatMessage({
    id: 'EditListingDescriptionForm.categoryLabel',
  });
  const categoryPlaceholder = intl.formatMessage({
    id: 'EditListingDescriptionForm.categoryPlaceholder',
  });
  const categoryRequired = required(
    intl.formatMessage({
      id: 'EditListingDescriptionForm.categoryRequired',
    })
  );

  const categoryOptions = categories.map(cat => {
    return cat.children && cat.children.length
      ? (
        <optgroup key={cat.label} label={cat.label}>
          { cat.children.map(c => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          )) }
        </optgroup>
      )
      : (
        <option key={cat.key} value={cat.key}>
          {cat.label}
        </option>
      )
  });

  return categories ? 
  <FieldMultiSelect
    className={css.category}
    name={name}
    id={id}
    placeholder={categoryPlaceholder}
    label={categoryLabel}
    validate={categoryRequired}
    options={categories}
    />
 : null;
};

export default CustomCategorySelectFieldMaybe;
