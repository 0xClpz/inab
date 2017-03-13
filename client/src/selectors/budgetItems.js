import {createSelector} from 'reselect';
import {createInMonthSelectors, createUpToMonthSelectors} from './ui';
import {createMappingSelector, sumOfAmounts} from './utils';
import {selectBudgetItems} from './resources';

// Filters
export const inMonth = createInMonthSelectors(selectBudgetItems, (bi) => bi.month);
export const upToMonth = createUpToMonthSelectors(selectBudgetItems, (bi) => bi.month);

// Grouping
export const getSelectedMonthBudgetItemsByCategoryId = createMappingSelector(inMonth.current, 'category_uuid');

// Sums
export const getBudgetItemsSumUpToPreviousMonth = createSelector(
  upToMonth.previous,
  budgetItems => sumOfAmounts(budgetItems)
);
