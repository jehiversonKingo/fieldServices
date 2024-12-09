import createDataContext from './createDataContext';
import { handleSignInFirebase, handleSignOutFirebase } from '../functions/fncFirebase';

const authReducer = (state, action) => {
  switch (action.type) {
    case 'signOut':
      return { ...state, token: null, user: '', isLoading:false };
    case 'signIn':
      return { ...state, token: action.payload.token, user: action.payload.user, code: ''};
    case 'signInError':
      return {
        token: null,
        error: action.payload.error,
        message: action.payload.message,
        isLoading: false,
      };
    case 'loadingOut':
      return { ...state, isLoading: false, session: action.payload.session, code: '' };
    case 'loading':
        return {...state, isLoading: true, code: '' };
    case 'codeChangeTask':
        return {...state, code: action.payload.code };
    case 'inline':
        return {...state, inline: action.payload.inline };
    default:
      return state;
  }
};

const signIn = dispatch => {
  return async ({ user, password }) => {
    let tokenId = await handleSignInFirebase(user, password);
    if (tokenId.error) {
      console.log("Error en el login", tokenId.message);
      dispatch({
        type: 'signInError',
        payload: {
          error: true,
          message: tokenId.message,
        },
      });
      return false
    } else {
      dispatch({
        type: 'signIn',
        payload: {
          token: tokenId,
          user, session: true,
        },
      });
      return true
    }
  };
};

const signOut = dispatch => {
  return () => {
    handleSignOutFirebase();
    dispatch({ type: 'signOut' });
  };
};

const validSession = dispatch => {
  return async ({ type, session }) => {
    dispatch({
      type,
      payload: {session},
    });
  };
};

const setLoadingState = dispatch => {
  return async () => {
    dispatch({
      type:'loading',
      payload: {},
    });
  };
};

const changeCodeTask = dispatch => {
  return async (code) => {
    dispatch({
      type:'codeChangeTask',
      payload: {code},
    });
  };
};

const offlineSession = dispatch => {
  return async (inline) => {
    console.log('CONTEXTO', inline);
    dispatch({
      type:'inline',
      payload: {inline},
    });
  };
};


export const { Provider, Context } = createDataContext(
  authReducer,
  { signIn, signOut, validSession, setLoadingState, changeCodeTask, offlineSession },
  { token: null, user: null, isLoading: true, code: '', inline: true },
);
