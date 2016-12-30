import {createSelector} from 'reselect';
import {getSortedTransactions} from './transactions';
import {getAccountsById} from './accounts';
import {getCategoriesById} from './categories';

// Converts the transactions to TransactionView
export const getTransactionsForRendering = createSelector(
  getSortedTransactions,
  getAccountsById,
  getCategoriesById,
  (transactions, accountsById, categoriesById) => {
    const result = [];

    transactions.forEach(tr => {
      const tr_result = {
        ...tr,
        account: accountsById.get(tr.account_id).name,
        payee: tr.payee || tr.transfer_account_id && accountsById.get(tr.transfer_account_id).name,
        is_transfer: !!tr.transfer_account_id,
      };

      if (tr.type === 'to_be_budgeted') {
        tr_result.category = "To be budgeted";
      }
      if (tr.type === 'split') {
        tr_result.category = "Split";
      }
      if (tr.type === 'regular' && tr.category_id) {
        tr_result.category = categoriesById.get(tr.category_id).name;
      }

      result.push(tr_result);
      tr.subtransactions.forEach((str, strIndex) => {
        const str_result = {
          id: 's' + ((str.id) ? str.id : ('i' + strIndex)),
          account_id: tr.account_id,
          category: str.category_id ? categoriesById.get(str.category_id).name : '',
          description: str.description,
          amount: str.amount,
          subtransaction: true,
          parent_transaction: tr.id
        };
        result.push(str_result);
      });
    });

    return result;
  }
);
