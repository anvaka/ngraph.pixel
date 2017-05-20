/**
 * Simple Pormise based ajax wrapper
 */
module.exports = function request(url, requestOptions) {
  return new Promise((resolve, reject) => {
    const oReq = new XMLHttpRequest();
    Object.assign(oReq, requestOptions);

    oReq.addEventListener('load', resolveBound);
    oReq.addEventListener('error', reject);

    const method = 'GET';
    oReq.open(method,url);
    oReq.send();

    function resolveBound() {
      resolve(this);
    }
  });
}
