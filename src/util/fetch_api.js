import { Notify } from 'quasar';
import { hasAccessToken, getAccessToken, authStateChange } from './auth';
import { set } from 'lodash';
const { fetch: originalFetch } = window;

async function _fetch(...args) {
  let [resource, options] = args;
  if (!options) {
    options = {};
  }

  // request interceptor here
  if (hasAccessToken()) {
    set(options, 'headers.authorization', `Bearer ${getAccessToken()}`); // headers are all lowercased by originalfetch
  }

  const response = await originalFetch(resource, options);

  // response interceptor here
  if (response.status == 401) {
    // could add redirect here?
    authStateChange(null); // change state to logout, so ui can require login again.
    throw 'You are not authorized or authorization invalidated after timeout.';
  }

  return response;
}

async function remoteProcedureCall(url) {
  let headers = { 'Content-Type': 'application/json' };

  try {
    const response = await _fetch(url, {
      method: 'GET',
      headers: headers,
    });
    console.log(response);
    if (!response.ok) {
      throw `Error: ${response.status} ${response.statusText}`;
    }
  } catch (error) {
    console.error(error);
    Notify.create({
      message: error,
      caption: 'Request Error!',
      color: 'negative',
    });
  }
}

export { remoteProcedureCall, _fetch };
