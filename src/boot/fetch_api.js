import { boot } from 'quasar/wrappers';
import { Notify } from 'quasar';

async function remoteProcedureCall(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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

export default boot(() => {});

export { remoteProcedureCall };
