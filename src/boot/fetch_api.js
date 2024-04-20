import { boot } from 'quasar/wrappers';

async function remoteProcedureCall(url) {
  try {
    const response = await fetch(url);
    console.log(response);
  } catch (error) {
    console.error(error);

    // Notify.create({
    //   message: 'error getting scheme! check logs',
    //   color: 'red',
    // });
  }
}

export default boot(({}) => {});

export { remoteProcedureCall };
