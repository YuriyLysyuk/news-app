'use strict';

/**
 * News App — learning project
 **/

(function () {
  // API settings
  const apiURL = 'https://newsapi.org/v2';
  const apiKey = '9bce02c8cb67464199bd49b6af983528';

  // HTTP request
  const http = new httpRequest();

  /**
   * HTTP request
   */
  function httpRequest() {
    // Get from API
    function get(endpoint, params, callback) {
      _makeRequest('GET', endpoint, params, callback);
    }

    // Make request
    function _makeRequest(method, endpoint, params = {}, callback) {
      try {
        // Prepare url
        let url = `${apiURL}${endpoint}?apiKey=${apiKey}`;

        // If has url params
        if (Object.keys(params)) {
          // Append params to url
          for (let key in params) {
            url += `&${key}=${params[key]}`;
          }
        }

        const xhr = new XMLHttpRequest();

        xhr.open(method, url);

        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            callback(`Error: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          callback(null, response);
        });

        xhr.addEventListener('error', () => {
          callback(`Error: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        callback(error);
      }
    }

    return {
      get,
    };
  }
})();
