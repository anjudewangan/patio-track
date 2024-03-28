import { Snackbar, Alert } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious } from '../../reactHelper';
import { errorsActions } from '../../store';

const ErrorHandler = () => {
  const dispatch = useDispatch();

  const error = useSelector((state) => state.errors.errors.find(() => true));
  const previousError = usePrevious(error);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(errorsActions.pop());
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  return (
    <Snackbar open={!!error}>
      <Alert
        elevation={6}
        onClose={() => dispatch(errorsActions.pop())}
        severity="error"
        variant="filled"
      >
        {error || previousError}
      </Alert>
    </Snackbar>
  );
};

export default ErrorHandler;
