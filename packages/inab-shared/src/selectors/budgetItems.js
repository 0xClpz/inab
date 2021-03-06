// @flow
import {groupBy, head, map, prop} from 'ramda'
import {createSelector} from 'reselect'
import {
  createInMonthSelectors,
  createUpToMonthSelectors,
  sumOfAmounts,
} from './utils'
import type {BudgetItem} from '../entities/BudgetItem'
import {BudgetItemResource} from '../entities/BudgetItem'
import {select} from 'redux-crud-provider'

export const budgetItemsInMonth = createInMonthSelectors(
  select(BudgetItemResource).asArray,
  (bi: BudgetItem) => bi.month
)

export const budgetItemsUpToMonth = createUpToMonthSelectors(
  select(BudgetItemResource).asArray,
  (bi: BudgetItem) => bi.month
)

export const getSelectedMonthBudgetItemByCategoryId = createSelector(
  budgetItemsInMonth.selected,
  (budgetItems: BudgetItem[]) =>
    map(head)(groupBy(prop('category_uuid'), budgetItems))
)

export const getBudgetItemsSumUpToPreviousMonth = createSelector(
  budgetItemsUpToMonth.previous,
  (budgetItems: BudgetItem[]) => sumOfAmounts(budgetItems)
)
