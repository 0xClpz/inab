import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './TransactionForm.scss';
import {Field, FieldArray, formValueSelector} from 'redux-form';
import {SimpleSelectField} from './fields/SimpleSelectField';
import {connect} from 'react-redux';
import DatePickerField from './fields/DatePickerField';
import ButtonDelete from '../ButtonDelete';
import ButtonIcon from '../ButtonIcon';
import Button from '../Button';
import moment from 'moment';
import {FormActionBar} from './FormActionBar';
import {crud} from '../../hoc/crud';
import {
  AccountResource,
  amountFromCents,
  amountToCents,
  CategoryResource,
  getSortedPayees,
  PayeeResource,
  TransactionResource
} from 'inab-shared';
import {arraySelector, resourceForm} from 'hw-react-shared';
import {InputField} from './fields/InputField';

/**
 * Component used for rendering the subtransaction forms
 */
const renderSubtransactions = ({fields, categories}) => (
  <div>
    {fields.map((subtransaction, index) => (
      <div key={index} className="tr-form-container">
        <div />
        <div />

        <div>
          <div className="btn-group btn-group-sm">
            <Button>{index + 1}</Button>
            <ButtonDelete onClick={() => fields.remove(index)} />
          </div>
        </div>

        <div>
          <Field
            name={`${subtransaction}.category`}
            component={SimpleSelectField}
            placeholder="Category"
            options={categories}
          />
        </div>

        <Field
          name={`${subtransaction}.description`}
          component={InputField}
          type="text"
          placeholder="Description"
        />

        <Field
          name={`${subtransaction}.amount`}
          component={InputField}
          type="number"
          step="0.01"
          placeholder="Amount"
        />
      </div>
    ))}
    <div className="tr-form-container str-form-container">
      <div />
      <div />
      <div>
        <ButtonIcon
          className="btn btn-info"
          onClick={() => fields.push({})}
          icon="plus"
        >
          Subtransaction
        </ButtonIcon>
      </div>
      <div />
      <div />
      <div />
    </div>
  </div>
);

renderSubtransactions.propTypes = {
  fields: PropTypes.object.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired
    })
  ).isRequired
};

const selector = formValueSelector(TransactionResource.path);

const mapStateToProps = state => ({
  accounts: arraySelector(AccountResource)(state),
  categories: arraySelector(CategoryResource)(state),
  payees: getSortedPayees(state),
  payeeValue: selector(state, 'payee'),
  categoryValue: selector(state, 'category')
});

const formToResource = data => {
  const transaction = {...data};

  // Compute the type of transaction
  transaction.type = 'regular';
  if (data.category === 'tbb') {
    transaction.type = 'to_be_budgeted';
    transaction.category = null;
  } else if (data.category === 'split') {
    transaction.type = 'split';
    transaction.category = null;
  } else {
    transaction.category_uuid = data.category;
  }

  // Compute the transfer_account_uuid
  transaction.payee_uuid = data.payee;
  transaction.transfer_account_uuid = null;
  if (data.payee && data.payee.startsWith('transfer:')) {
    transaction.transfer_account_uuid = data.payee.slice('transfer:'.length);
    transaction.payee_uuid = null;
  }

  transaction.amount = amountToCents(data.amount);

  // Update the subtransactions
  if (data.category === 'split' && data.subtransactions) {
    transaction.subtransactions = data.subtransactions.map(str => ({
      amount: amountToCents(str.amount),
      category_uuid: str.category,
      description: str.description
    }));
  } else {
    transaction.subtransactions = [];
  }
  transaction.tags = [];

  return transaction;
};

const resourceToForm = (transaction, props) => {
  const formData = {
    account_uuid: props.selectedAccountId,
    date: moment().format('YYYY-MM-DD')
  };

  if (transaction) {
    formData.account_uuid = transaction.account_uuid;
    formData.date = transaction.date;
    formData.description = transaction.description;
    formData.amount = amountFromCents(transaction.amount);

    if (transaction.transfer_account_uuid) {
      formData.payee = 'transfer:' + transaction.transfer_account_uuid;
    } else {
      formData.payee = transaction.payee_uuid;
    }

    if (transaction.type === 'to_be_budgeted') {
      formData.category = 'tbb';
    } else if (transaction.type === 'split') {
      formData.category = 'split';
    } else {
      formData.category = transaction.category_uuid;
    }

    formData.subtransactions = transaction.subtransactions.map(str => ({
      amount: amountFromCents(str.amount),
      description: str.description,
      category: str.category_uuid
    }));
  }

  return formData;
};

function validateAmount(value, data) {
  if (data.subtransactions && data.subtransactions.length > 0) {
    const sum = data.subtransactions
      .map(st => Number(st.amount) || 0)
      .reduce((acc, value) => acc + value, 0);
    if (sum !== Number(value)) {
      return "Sum doesn't match subtransactions";
    }
  }
  return undefined;
}

@connect(mapStateToProps)
@resourceForm({
  crud,
  resource: TransactionResource,
  formToResource,
  resourceToForm
})
export class TransactionForm extends Component {
  static propTypes = {
    isCreate: PropTypes.bool.isRequired,
    isUpdate: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    pristine: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    deleteResource: PropTypes.func.isRequired,
    // Reference data
    accounts: PropTypes.arrayOf(AccountResource.propType).isRequired,
    categories: PropTypes.arrayOf(CategoryResource.propType).isRequired,
    payees: PropTypes.arrayOf(PayeeResource.propType).isRequired,
    payeeValue: PropTypes.string,
    categoryValue: PropTypes.string,
    onCancel: PropTypes.func
  };

  render() {
    const categoryOptions = [
      {label: 'To be budgeted', value: 'tbb'},
      {label: 'Split', value: 'split'},
      ...this.props.categories.map(c => ({label: c.name, value: c.uuid}))
    ];

    const subtransactionCategoryOptions = [
      {label: 'To be budgeted', value: 'tbb'},
      ...this.props.categories.map(c => ({label: c.name, value: c.uuid}))
    ];

    const payeeOptions = [
      ...this.props.accounts.map(a => ({
        label: 'Transfer to ' + a.name,
        value: 'transfer:' + a.uuid
      })),
      ...this.props.payees.map(c => ({label: c.name, value: c.uuid}))
    ];

    return (
      <form className="box-container">
        <div className="tr-form-container">
          <div>
            <label>Account</label>
            <Field
              name="account_uuid"
              component={SimpleSelectField}
              placeholder="Account"
              options={this.props.accounts.map(cg => ({
                label: cg.name,
                value: cg.uuid
              }))}
            />
          </div>

          <div>
            <label>Date</label>
            <div>
              <Field name="date" component={DatePickerField} />
            </div>
          </div>

          <div>
            <label>Payee</label>
            <Field
              name="payee"
              component={SimpleSelectField}
              placeholder="Payee"
              options={payeeOptions}
            />
          </div>

          <div>
            <label>Category</label>
            <Field
              name="category"
              component={SimpleSelectField}
              placeholder={
                this.props.payeeValue &&
                this.props.payeeValue.startsWith('transfer:')
                  ? 'No category for transfers'
                  : 'Category'
              }
              disabled={
                this.props.payeeValue &&
                this.props.payeeValue.startsWith('transfer:')
              }
              options={categoryOptions}
            />
          </div>

          <Field
            name="description"
            component={InputField}
            type="text"
            label="Description"
          />

          <Field
            name="amount"
            component={InputField}
            type="number"
            step="0.01"
            label="Amount"
            validate={[validateAmount]}
          />
        </div>
        {this.props.categoryValue === 'split' && (
          <FieldArray
            name="subtransactions"
            categories={subtransactionCategoryOptions}
            component={renderSubtransactions}
          />
        )}

        <FormActionBar
          handleSubmit={this.props.handleSubmit}
          isCreate={this.props.isCreate}
          isUpdate={this.props.isUpdate}
          disableReset={this.props.pristine || this.props.submitting}
          reset={this.props.reset}
          remove={this.props.deleteResource}
          cancel={this.props.onCancel}
        />
      </form>
    );
  }
}