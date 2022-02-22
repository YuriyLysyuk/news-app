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
   * API functions
   */

  // Get top headlines news from API
  function getTopHeadlinesNewsAPI(callback) {
    // API endpoint
    const endpoint = '/top-headlines';

    // Build query params
    const params = {
      country: getSelectCountryValue(),
    };

    http.get(endpoint, params, callback);
  }
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

  /**
   * Helpers
   */

  // Get select country from search form
  function getSelectCountryValue() {
    // Get country radio elements and transform it to array
    const countryEls = [...searchFormEl.elements.country];
    let selectedCountryValue;

    // Find selected value
    countryEls.forEach((countryEl) => {
      if (countryEl.checked) {
        selectedCountryValue = countryEl.value;
      }
    });

    return selectedCountryValue;
  }
})();
