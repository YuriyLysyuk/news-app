'use strict';

/**
 * News App — learning project
 **/

(function () {
  // HTTP request
  const http = new httpRequest();

  // UI
  const h1El = document.querySelector('h1');
  const searchFormEl = document.forms.searchForm;
  const searchFormQueryEl = searchFormEl.elements.query;
  const newsListEl = document.querySelector('.news-list');
  const progressBarEl = document.querySelector('.progress-bar');
  const progressWrapEl = progressBarEl.parentElement;

  // Events
  searchFormEl.addEventListener('submit', onSubmitSearchFormHandler);
  document.addEventListener('DOMContentLoaded', () => {
    loadNews('topHeadlines');
  });

  /**
   * API service
   */
  const newsService = (function () {
    // API settings
    const apiURL = 'https://newsapi.org/v2';
    const apiKey = '9bce02c8cb67464199bd49b6af983528';

    // Get top headlines news from API
    function topHeadlines(callback) {
      // Endpoint
      const endpoint = '/top-headlines';

      // Build query params
      const params = {
        country: getSelectCountryValue().code,
      };

      // Build query URL
      const url = _buildQueryUrl(endpoint, params);

      // Make request
      http.get(url, callback);
    }

    function everything(callback) {
      // Endpoint
      const endpoint = '/everything';

      // Build query params
      const params = {
        q: getSearchQuery(),
      };

      // Build query URL
      const url = _buildQueryUrl(endpoint, params);

      // Make request
      http.get(url, callback);
    }

    function _buildQueryUrl(endpoint, params) {
      let paramsStr = '';
      // If params has anything
      if (Object.keys(params)) {
        // Append params to url
        for (let key in params) {
          // If value not empty
          if (params[key]) {
            // Add param to url
            paramsStr += `&${key}=${params[key]}`;
          }
        }
      }

      return `${apiURL}${endpoint}?apiKey=${apiKey}${paramsStr}`;
    }

    return {
      topHeadlines,
      everything,
    };
  })();

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
    function get(url, callback) {
      _makeRequest('GET', url, callback);
    }

    // Make request
    function _makeRequest(method, url, callback) {
      try {
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
  function renderNewsList({ totalResults, articles }) {
    newsListEl.innerHTML = '';

    // If total result is empty, show message about
    if (!totalResults) {
      newsListEl.innerHTML = `
        <p class="note note-warning">
          Nothing was found for the query <strong>${getSearchQuery()}</strong>, try changing the query.
        </p>
      `;
      return;
    }

    const newsListHtml = articles.reduce((html, article) => {
      return html + newsItemTemplate(article);
    }, '');

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

  // Render h1 text
  function renderH1Text(searchQuery = '') {
    if (searchQuery) {
      h1El.textContent = `Search results for: ${searchQuery}`;
    } else {
      h1El.textContent = `${getSelectCountryValue().name} today`;
    }
  }

  /**
   * Event handlers
   */

  // On submit search form handler
  function onSubmitSearchFormHandler(e) {
    e.preventDefault();

    const searchQuery = getSearchQuery();
    // If has user query
    if (searchQuery) {
      // Search news from everything
      loadNews('everything');
      // Render h1 title
      renderH1Text(searchQuery);
    } else {
      // Get top headlines news
      loadNews('topHeadlines');
      // Render h1 title
      renderH1Text();
    }
  }

  /**
   * Helpers
   */

  // Load news
  function loadNews(service = '') {
    if (!service) {
      console.error('Service is not defined');
      return;
    }
    // Load selected news: topHeadlines or everything
    newsService[service](callbackGetNewsHTTP);
  }

  // Get select country from search form
  function getSelectCountryValue() {
    // Get country radio elements and transform it to array
    const countryEls = [...searchFormEl.elements.country];
    const selectedCountryValue = {};

    // Find selected value
    countryEls.forEach((countryEl) => {
      if (countryEl.checked) {
        selectedCountryValue.code = countryEl.value;
        selectedCountryValue.name = countryEl.dataset.countryName;
      }
    });

    return selectedCountryValue;
  }

  // Get search query
  function getSearchQuery() {
    return searchFormQueryEl.value;
  }

  // Calc difference between date and now
  function calcDifferenceDateAndNow(date) {
    // Parse publish date
    date = Date.parse(date);
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
})();
