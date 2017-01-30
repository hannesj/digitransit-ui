// React
import React from 'react';
import ReactDOM from 'react-dom/server';

// Routing and state handling
import match from 'react-router/lib/match';
import Helmet from 'react-helmet';
import createHistory from 'react-router/lib/createMemoryHistory';
import Relay from 'react-relay';
import IsomorphicRouter from 'isomorphic-relay-router';
import { RelayNetworkLayer, urlMiddleware, gqErrorsMiddleware, retryMiddleware } from 'react-relay-network-layer';
import provideContext from 'fluxible-addons-react/provideContext';

// Libraries
import serialize from 'serialize-javascript';
import { IntlProvider } from 'react-intl';
import polyfillService from 'polyfill-service';
import fs from 'fs';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import find from 'lodash/find';

// Application
import appCreator from './app';
import config from './config';
import translations from './translations';
import ApplicationHtml from './html';
import MUITheme from './MuiTheme';

const port = process.env.HOT_LOAD_PORT || 9000;

// Disable relay query cache in order tonot leak memory, see facebook/relay#754
Relay.disableQueryCaching();

function getStringOrArrayElement(arrayOrString, index) {
  if (Array.isArray(arrayOrString)) {
    return arrayOrString[index];
  } else if (typeof arrayOrString === 'string') {
    return arrayOrString;
  }
  throw new Error(`Not array or string: ${arrayOrString}`);
}

// Look up paths for various asset files
const appRoot = `${process.cwd()}/`;

const defaultNetworkLayer = new RelayNetworkLayer([
  retryMiddleware({ fetchTimeout: 1000, retryDelays: [] }),
  urlMiddleware({
    url: `${config.URL.OTP}index/graphql`,
    batchUrl: `${config.URL.OTP}index/graphql/batch`,
  }),
  gqErrorsMiddleware(),
], { disableBatchQuery: false });

const robotNetworkLayer = new RelayNetworkLayer([
  retryMiddleware({ fetchTimeout: 10000, retryDelays: [] }),
  urlMiddleware({
    url: `${config.URL.OTP}index/graphql`,
    batchUrl: `${config.URL.OTP}index/graphql/batch`,
  }),
  gqErrorsMiddleware(),
], { disableBatchQuery: false });

let stats;
let manifest;
let css;
let svgSprite;

if (process.env.NODE_ENV !== 'development') {
  stats = require('../stats.json'); // eslint-disable-line global-require, import/no-unresolved

  const manifestFile = getStringOrArrayElement(stats.assetsByChunkName.manifest, 0);
  manifest = fs.readFileSync(`${appRoot}_static/${manifestFile}`);
  css = [
    <link
      key="main_css"
      rel="stylesheet"
      type="text/css"
      href={`${config.APP_PATH}/${getStringOrArrayElement(stats.assetsByChunkName.main, 1)}`}
    />,
    <link
      key="theme_css"
      rel="stylesheet"
      type="text/css"
      href={`${config.APP_PATH}/${
        getStringOrArrayElement(stats.assetsByChunkName[`${config.CONFIG}_theme`], 1)
      }`}
    />,
  ];

  svgSprite = (
    <script
      dangerouslySetInnerHTML={{ __html: `
        fetch('${
          config.APP_PATH}/${find(stats.modules, { name: `./static/svg-sprite.${config.CONFIG}.svg` }).assets[0]
        }').then(function(response) {return response.text();}).then(function(blob) {
          var div = document.createElement('div');
          div.innerHTML = blob;
          document.body.insertBefore(div, document.body.childNodes[0]);
        })
    ` }}
    />
  );
} else {
  svgSprite = (
    <div
      dangerouslySetInnerHTML={{
        __html: fs.readFileSync(`${appRoot}_static/svg-sprite.${config.CONFIG}.svg`).toString(),
      }}
    />
  );
}

function getPolyfills(userAgent) {
  // Do not trust Samsung, LG
  // see https://digitransit.atlassian.net/browse/DT-360
  // https://digitransit.atlassian.net/browse/DT-445
  // Also https://github.com/Financial-Times/polyfill-service/issues/727
  if (!userAgent ||
    /(IEMobile|LG-|GT-|SM-|SamsungBrowser|Google Page Speed Insights)/.test(userAgent)
  ) {
    userAgent = ''; // eslint-disable-line no-param-reassign
  }

  const features = {
    'caniuse:console-basic': { flags: ['gated'] },
    default: { flags: ['gated'] },
    es5: { flags: ['gated'] },
    es6: { flags: ['gated'] },
    es7: { flags: ['gated'] },
    fetch: { flags: ['gated'] },
    Intl: { flags: ['gated'] },
    matchMedia: { flags: ['gated'] },
  };

  config.availableLanguages.forEach((language) => {
    features[`Intl.~locale.${language}`] = {
      flags: ['gated'],
    };
  });

  return polyfillService.getPolyfillString({
    uaString: userAgent,
    features,
    minify: true,
    unknown: 'polyfill',
  });
}

function getScripts(req) {
  if (process.env.NODE_ENV === 'development') {
    const host =
      (req.headers.host && req.headers.host.split(':')[0]) || 'localhost';

    return <script async src={`//${host}:${port}/js/bundle.js`} />;
  }
  return [
    <script key="manifest "dangerouslySetInnerHTML={{ __html: manifest }} />,
    <script
      key="common_js"
      src={`${config.APP_PATH}/${getStringOrArrayElement(stats.assetsByChunkName.common, 0)}`}
    />,
    <script
      key="leaflet_js"
      src={`${config.APP_PATH}/${getStringOrArrayElement(stats.assetsByChunkName.leaflet, 0)}`}
    />,
    <script
      key="min_js"
      src={`${config.APP_PATH}/${getStringOrArrayElement(stats.assetsByChunkName.main, 0)}`}
    />,
  ];
}

const ContextProvider = provideContext(IntlProvider, {
  config: React.PropTypes.object,
  url: React.PropTypes.string,
  headers: React.PropTypes.object,
});

function getContent(context, renderProps, locale, userAgent) {
  // TODO: This should be moved to a place to coexist with similar content from client.js
  return ReactDOM.renderToString(
    <ContextProvider
      locale={locale}
      messages={translations[locale]}
      context={context.getComponentContext()}
    >
      <MuiThemeProvider
        muiTheme={getMuiTheme(MUITheme(context.getComponentContext().config), { userAgent })}
      >
        {IsomorphicRouter.render(renderProps)}
      </MuiThemeProvider>
    </ContextProvider>,
  );
}

function getHtml(application, context, locale, [polyfills, relayData], req) {
  // eslint-disable-next-line no-unused-vars
  const content = relayData != null ? getContent(context, relayData.props, locale, req.headers['user-agent']) : undefined;
  const head = Helmet.rewind();
  return ReactDOM.renderToStaticMarkup(
    <ApplicationHtml
      css={process.env.NODE_ENV === 'development' ? false : css}
      svgSprite={svgSprite}
      content=""
      // TODO: temporarely disable server-side rendering in order to fix issue with having different
      // content from the server, which breaks leaflet integration. Should be:
      // content={content}
      polyfill={polyfills}
      state={`window.state=${serialize(application.dehydrate(context))};`}
      locale={locale}
      scripts={getScripts(req)}
      fonts={config.URL.FONT}
      relayData={relayData != null ? relayData.data : []}
      head={head}
    />,
  );
}

const isRobotRequest = agent =>
  agent &&
  (agent.indexOf('facebook') !== -1 ||
   agent.indexOf('Twitterbot') !== -1);

export default function (req, res, next) {
   // 1. use locale from cookie (user selected) 2. browser preferred 3. default
  let locale = req.cookies.lang ||
    req.acceptsLanguages(config.availableLanguages);

  if (config.availableLanguages.indexOf(locale) === -1) {
    locale = config.defaultLanguage;
  }

  if (req.cookies.lang === undefined || req.cookies.lang !== locale) {
    res.cookie('lang', locale);
  }

  const application = appCreator(config);

  const context = application.createContext({ url: req.url, headers: req.headers, config });

  context
    .getComponentContext()
    .getStore('MessageStore')
    .addConfigMessages(config);

  // required by material-ui
  global.navigator = { userAgent: req.headers['user-agent'] };

  const location = createHistory({ basename: config.APP_PATH }).createLocation(req.url);

  match({
    routes: context.getComponent(),
    location,
  }, (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      res.redirect(301, redirectLocation.pathname + redirectLocation.search);
    } else if (error) {
      next(error);
    } else if (!renderProps) {
      res.status(404).send('Not found');
    } else {
      const agent = req.headers['user-agent'];
      let networkLayer = defaultNetworkLayer;
      if (isRobotRequest(agent)) {
        networkLayer = robotNetworkLayer;
      }
      const promises = [
        getPolyfills(agent),
        // Isomorphic rendering is ok to fail due timeout
        IsomorphicRouter.prepareData(renderProps, networkLayer).catch(() => null),
      ];

      Promise.all(promises).then(results =>
        res.send(`<!doctype html>${getHtml(application, context, locale, results, req)}`),
      ).catch((err) => {
        if (err) { next(err); }
      });
    }
  });
}
