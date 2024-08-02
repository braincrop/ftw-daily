import React from 'react';
import { node, string, bool } from 'prop-types';
import classNames from 'classnames';
import { Field } from 'react-final-form';
import css from './FieldRadioButton.module.css';

const FieldRadioButtonComponentOnChange = props => {
  const { rootClassName, className, id, label, required, labelCss, ...rest } = props;

  const classes = classNames(rootClassName || css.root, className);
  const radioButtonProps = {
    id,
    component: 'input',
    type: 'radio',
    required,
    ...rest,
  };

  return (
    <span className={classes}>
      <Field {...radioButtonProps}>
        {({ input }) => (
          <div className={css.inline}>
            <input
              {...input}
              id={id}
              className={css.inputCheck}
              style={{ width: '20px', height: '20px', border: '2px solid pink' }}
            />

            <label htmlFor={id} className={`${css.label} ${labelCss}`}>
              <span className={css.text}>{label}</span>
            </label>
          </div>
        )}
      </Field>
    </span>
  );
};

FieldRadioButtonComponentOnChange.defaultProps = {
  className: null,
  rootClassName: null,
  required: false,
  label: null,
  labelCss: null,
};

FieldRadioButtonComponentOnChange.propTypes = {
  className: string,
  rootClassName: string,
  required: bool,
  id: string.isRequired,
  label: node,
  name: string.isRequired,
  value: string.isRequired,
  labelCss: string,
};

export default FieldRadioButtonComponentOnChange;
