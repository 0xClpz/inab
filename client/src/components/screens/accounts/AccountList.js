import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {arraySelector} from 'hw-react-shared';
import {AccountResource} from 'inab-shared';
import {Link} from 'react-router-dom';

const mapStateToProps = state => ({
  accounts: arraySelector(AccountResource)(state)
});

@connect(mapStateToProps)
export class AccountList extends React.Component {
  static propTypes = {
    accounts: PropTypes.arrayOf(AccountResource.propType).isRequired
  };

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-8">
            <div className="box">
              <h4>Accounts</h4>

              <div className="my-3">
                <Link to="/accounts/new" className="btn btn-primary">
                  New account
                </Link>
              </div>

              <div className="list-group">
                {this.props.accounts.map(account =>
                  <Link
                    key={account.uuid}
                    to={`/accounts/edit/${account.uuid}`}
                    className="list-group-item list-group-item-action"
                  >
                    {account.name}
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="col-sm-4">
            <div className="box">
              <h4>Statistics</h4>
              <h5>
                {this.props.accounts.length} accounts
              </h5>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
