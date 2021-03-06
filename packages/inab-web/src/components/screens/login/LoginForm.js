import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {reduxForm, Field} from 'redux-form'
import axios from 'axios'
import {addError} from '../../../actions/error'
import {setCredentials} from '../../../reducers/credentials'
import {requiredField} from '../../../utils/fieldValidation'
import {InputField} from '../../forms/fields/InputField'

const mapStateToProps = state => ({
  initialValues: {
    backend: state.credentials.backend,
    email: state.credentials.email,
  },
})

const mapDispatchToProps = {
  addError,
  setCredentials,
}

@connect(mapStateToProps, mapDispatchToProps)
@reduxForm({form: 'login', enableReinitialize: true})
export class LoginForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    setCredentials: PropTypes.func.isRequired,
    addError: PropTypes.func.isRequired,
  }

  onSubmit = ({backend, email, password}) => {
    axios
      .post(`${backend}/login`, {
        email,
        password,
      })
      .then(response => {
        if (response.headers.authorization) {
          const token = response.headers.authorization
          const {is_admin} = response.data
          this.props.setCredentials({backend, email, is_admin, token})
        } else {
          this.props.addError('Authentication failed.')
        }
      })
      .catch(error => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          this.props.addError(error.response.data.message)
        } else {
          this.props.addError('Authentication failed.')
        }
      })
  }

  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.onSubmit)}>
        <Field
          name="backend"
          component={InputField}
          type="text"
          label="Backend"
          required
          validate={requiredField}
        />

        <Field
          name="email"
          component={InputField}
          type="email"
          label="Email"
          autoComplete="email"
          required
          validate={requiredField}
        />

        <Field
          name="password"
          component={InputField}
          type="password"
          label="Password"
          autoComplete="current-password"
          required
          validate={requiredField}
        />

        <button type="submit" className="btn btn-secondary">
          Login
        </button>
      </form>
    )
  }
}
