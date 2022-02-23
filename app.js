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

  // UI
  const searchFormEl = document.forms.searchForm;
  const newsListEl = document.querySelector('.news-list');
  const progressBarEl = document.querySelector('.progress-bar');
  const progressWrapEl = progressBarEl.parentElement;

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
   * Callbacks
   */

  // Get news http callback
  function callbackGetNewsHTTP(error, response) {
    // Check error
    if (error) {
      console.log(error, response);
      return;
    }

    // Render news list
    renderNewsList(response);
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

        xhr.addEventListener('loadstart', () => {
          // Reset the progress bar
          progressBarStatus(0, 100);
        });

        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            callback(`Error: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          callback(null, response);

          // Load complete, show full bar
          progressBarStatus(100, 100);
        });

        xhr.addEventListener('progress', (e) => {
          // If server sent header Content-Length
          if (e.lengthComputable) {
            // Show current progress
            progressBarStatus(e.loaded, e.total);
          }
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
   * Render functions
   */

  // Render news list
  function renderNewsList({ articles }) {
    const newsListHtml = articles.reduce((html, article) => {
      return html + newsItemTemplate(article);
    }, '');

    newsListEl.innerHTML = '';
    newsListEl.insertAdjacentHTML('afterbegin', newsListHtml);
  }

  // News item template
  function newsItemTemplate(article) {
    return `
    <div class="col">
      <div class="card">
        ${
          article.urlToImage
            ? `<div class="bg-image hover-overlay ripple">
                <img
                  src="${article.urlToImage}"
                  class="img-fluid"
                />
                <a href="${article.url}" target="_blank">
                  <div
                    class="mask"
                    style="background-color: rgba(251, 251, 251, 0.15)"
                  ></div>
                </a>
              </div>`
            : ''
        }
        <div class="card-body">
          <h5 class="card-title">${article.title}</h5>
          ${
            article.author
              ? `<h6 class="card-subtitle mb-2 text-muted">by ${article.author}</h6>`
              : ''
          }
          ${
            article.description
              ? `<p class="card-text">${article.description}</p>`
              : ''
          }
          

          <a href="${
            article.url
          }" target="_blank" class="btn btn-primary">Read</a>
        </div>
        <div class="card-footer text-muted">
          ${article.source.name} | ${calcDifferenceDateAndNow(
      article.publishedAt
    )}
        </div>
      </div>
    </div>
    `;
  }

  /**
   * Event handlers
   */

  // On submit search form handler
  function onSubmitSearchFormHandler(e) {
    e.preventDefault();

    // Get top headlines news
    getTopHeadlinesNewsAPI(callbackGetNewsHTTP);
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

  // Calc difference between date and now
  function calcDifferenceDateAndNow(date) {
    // Parse publish date
    date = Date.parse('2022-02-22T05:51:57Z');
    // Get now date
    const now = Date.now();
    // Calc different
    const difference = now - date;

    return getDateTimeAgoString(difference);
  }

  // Get date time ago string
  function getDateTimeAgoString(difference) {
    // In milliseconds
    const inMilliseconds = {
      week: 604800000,
      day: 86400000,
      hour: 3600000,
      minute: 60000,
      second: 1000,
    };

    let agoStr = '';

    // Сheck the number of full weeks, days, etc.
    for (let key in inMilliseconds) {
      let div = Math.floor(difference / inMilliseconds[key]);
      if (div >= 1) {
        agoStr = `${div} ${key}s ago`;
        break;
      }
    }

    return agoStr;
  }

  // Progress bar status
  function progressBarStatus(now, max) {
    const width = (now * 100) / max;

    progressBarEl.setAttribute('aria-valuemax', max);
    progressBarEl.setAttribute('aria-valuenow', now);
    progressBarEl.style.width = `${width}%`;

    switch (now === max) {
      // If load complete
      case true:
        // Hide bar after 1 second
        setTimeout(() => {
          progressWrapEl.classList.add('d-none');
        }, 1000);
        break;

      // If load on progress
      case false:
        // Make sure the progress bar is visible
        if (progressWrapEl.classList.contains('d-none')) {
          progressWrapEl.classList.remove('d-none');
        }
        break;
    }
  }

  // Init App — get top headlines news
  getTopHeadlinesNewsAPI(callbackGetNewsHTTP);
})();
