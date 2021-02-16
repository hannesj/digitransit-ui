/* eslint-disable prefer-template */
import safeJsonParse from '../util/safeJsonParser';
import { BIKEAVL_UNKNOWN } from '../util/citybikes';

const CONFIG = 'osijek';
const APP_TITLE = 'Digitransit - Grad Osijek';
const API_URL = process.env.API_URL || 'https://api.cityrouting.e-gpp.hr';
const GEOCODING_BASE_URL = `${API_URL}/geocoding/v1`;
const MAP_URL = process.env.MAP_URL || 'https://api.maptiler.com/maps/basic/';
const APP_PATH = process.env.APP_CONTEXT || '';
const { SENTRY_DSN } = process.env;
const PORT = process.env.PORT || 8080;
const APP_DESCRIPTION = 'Dobrodošli u lokalnu navigaciju grada osijeka';
const OTP_TIMEOUT = process.env.OTP_TIMEOUT || 12000;
const YEAR = 1900 + new Date().getYear();
const realtime = require('./realtimeUtils').default;

const REALTIME_PATCH = safeJsonParse(process.env.REALTIME_PATCH) || {};

/**
 * Map boundaries
 */
const minLat = 45.3244;
const maxLat = 45.8938;
const minLon = 18.2342;
const maxLon = 19.1046;

export default {
  SENTRY_DSN,
  PORT,
  CONFIG,
  OTPTimeout: OTP_TIMEOUT,
  URL: {
    API_URL,
    ASSET_URL: process.env.ASSET_URL,
    MAP_URL,
    OTP: `https://digitransit-dev.osijek.hr/otp/routers/default/`,
    MAP: { default: MAP_URL },
    STOP_MAP: `https://digitransit-dev.osijek.hr/otp/routers/default/vectorTiles/stations,stops/`,
    CITYBIKE_MAP: `https://digitransit-dev.osijek.hr/otp/routers/default/vectorTiles/bikes/`,
    FONT:
      'https://fonts.googleapis.com/css?family=Lato:300,400,900%7CPT+Sans+Narrow:400,700',
    PELIAS: `${process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL}/search`,
    PELIAS_REVERSE_GEOCODER: `${
      process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
    }/reverse`,
    PELIAS_PLACE: `${
      process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
    }/place`,
    ROUTE_TIMETABLES: {},
    STOP_TIMETABLES: {},
    WEATHER_DATA:
      'https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::forecast::hirlam::surface::point::simple&timestep=5&parameters=temperature,WindSpeedMS,WeatherSymbol3',
  },

  appBarLinks: [
    { name: 'Grad Osijek', href: 'https://www.osijek.hr/' },
    { name: 'GPP', href: 'https://www.gpp-osijek.com/' },
    { name: 'HŽPP', href: 'https://prodaja.hzpp.hr/' },
    { name: 'Flixbus', href: 'https://global.flixbus.com/' },
  ],

  APP_PATH: `${APP_PATH}`,
  indexPath: '',
  title: APP_TITLE,

  textLogo: false,
  // Navbar logo
  logo: 'osijek/logo.png',

  favicon: './app/configurations/images/osijek/favicon.png',

  contactName: {
    sv: 'Digitransit',
    fi: 'Digitransit',
    default: "Digitransit's",
  },

  // Default labels for manifest creation
  name: APP_TITLE,
  shortName: 'Digitransit',

  searchParams: {
    'boundary.rect.min_lat': minLat,
    'boundary.rect.max_lat': maxLat,
    'boundary.rect.min_lon': minLon,
    'boundary.rect.max_lon': maxLon,
  },
  feedIds: [],

  realTime: realtime,
  realTimePatch: REALTIME_PATCH,

  showNewMqtt: !process.env.DISABLE_NEW_MQTT_FEATURES,

  // Google Tag Manager id
  GTMid: process.env.GTM_ID || null,

  /*
   * by default search endpoints from all but gtfs sources, correct gtfs source
   * figured based on feedIds config variable
   */
  searchSources: ['osm', 'openstreetmap'],

  search: {
    suggestions: {
      useTransportIcons: false,
    },
    usePeliasStops: false,
    mapPeliasModality: false,
    peliasMapping: {},
    peliasLayer: null,
    peliasLocalization: null,
    minimalRegexp: new RegExp('.{2,}'),
  },

  nearbyRoutes: {
    radius: 10000,
    bucketSize: 1000,
  },

  omitNonPickups: true,
  maxNearbyStopAmount: 50,
  maxNearbyStopDistance: 2000,

  defaultSettings: {
    accessibilityOption: 0,
    bikeSpeed: 5.55,
    ticketTypes: 'none',
    walkBoardCost: 600,
    walkReluctance: 2,
    walkSpeed: 1.2,
    includeBikeSuggestions: true,
  },

  /**
   * These are used for dropdown selection of values to override the default
   * settings. This means that values ought to be relative to the current default.
   * If not, the selection may not make any sense.
   */
  defaultOptions: {
    walkBoardCost: {
      least: 3600,
      less: 1200,
      more: 360,
      most: 120,
    },
    walkReluctance: {
      least: 5,
      less: 3,
      more: 1,
      most: 0.2,
    },
    walkSpeed: [0.69, 0.97, 1.2, 1.67, 2.22],
    bikeSpeed: [2.77, 4.15, 5.55, 6.94, 8.33],
  },

  walkBoardCost: 600,
  walkBoardCostHigh: 1200,

  maxWalkDistance: 10000,
  suggestWalkMaxDistance: 5000,
  maxBikingDistance: 100000,
  suggestBikeMaxDistance: 15000,
  itineraryFiltering: 1.5, // drops 66% worse routes
  useUnpreferredRoutesPenalty: 1200, // adds 10 minute (weight) penalty to routes that are unpreferred
  minTransferTime: 120,
  optimize: 'GREENWAYS',
  transferPenalty: 0,
  availableLanguages: ['hr', 'en'],
  defaultLanguage: 'hr',
  // This timezone data will expire in 2037
  timezoneData:
    'Europe/Belgrade|CET CEST|-10 -20|01010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-19RC0 3IP0 WM0 1fA0 1cM0 1cM0 1rc0 Qo0 1vmo0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|12e5',

  allowLogin: false,
  mainMenu: {
    // Whether to show the left menu toggle button at all
    show: true,
    showDisruptions: false,
    showLoginCreateAccount: false,
    showOffCanvasList: true,
  },

  itinerary: {
    // How long vehicle should be late in order to mark it delayed. Measured in seconds.
    delayThreshold: 180,
    // Wait time to show "wait leg"? e.g. 180 means over 3 minutes are shown as wait time.
    // Measured in seconds.
    waitThreshold: 180,
    enableFeedback: false,

    timeNavigation: {
      enableButtonArrows: false,
    },

    showZoneLimits: false,
    // Number of days to include to the service time range from the future (DT-3317)
    serviceTimeRange: 30,
  },

  nearestStopDistance: {
    maxShownDistance: 5000,
  },

  map: {
    useRetinaTiles: true,
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 9,
    maxZoom: 18,
    controls: {
      zoom: {
        // available controls positions: 'topleft', 'topright', 'bottomleft, 'bottomright'
        position: 'bottomright',
      },
      scale: {
        position: 'bottomright',
      },
    },
    genericMarker: {
      // Do not render name markers at zoom levels below this value
      nameMarkerMinZoom: 18,

      popup: {
        offset: [106, 16],
        maxWidth: 250,
        minWidth: 250,
      },
    },

    line: {
      halo: {
        weight: 7,
        thinWeight: 2,
      },

      leg: {
        weight: 6,
        thinWeight: 2,
      },

      passiveColor: '#758993',
    },

    showZoomControl: true, // DT-3470
    showLayerSelector: true, // DT-3470
    showStopMarkerPopupOnMobile: true, // DT-3470
    showScaleBar: true, // DT-3470
    attribution:
      '<a tabIndex="-1" href="https://osm.org/copyright">© OpenStreetMap</a>', // DT-3470, DT-3397

    useModeIconsInNonTileLayer: false,
  },

  stopCard: {
    header: {
      showDescription: true,
      showStopCode: true,
      showDistance: true,
      showZone: false,
    },
  },

  autoSuggest: {
    // Let Pelias suggest based on current user location
    locationAware: true,
  },

  cityBike: {
    showCityBikes: true,
    // Config for map features. NOTE: availability for routing is controlled by
    // transportModes.citybike.availableForSelection
    showStationId: false,
    cityBikeMinZoom: 14,
    cityBikeSmallIconZoom: 14,
    // When should bikeshare availability be rendered in orange rather than green
    fewAvailableCount: 3,
    networks: {
      'osijek-bikes': {
        icon: 'citybike',
        name: {
          hr: 'Gradski bicikl',
          en: 'Osijek Bike Share',
        },
        type: 'citybike',
        url: {
          hr: 'https://gpp-osijek.com/',
          en: 'https://gpp-osijek.com/',
        },
      },
      'osijek-cars': {
        icon: 'citybike-secondary',
        name: {
          hr: 'Gradski automobil',
          en: 'Osijek Car Share',
        },
        type: 'citybike',
        url: {
          hr: 'https://gpp-osijek.com/',
          en: 'https://gpp-osijek.com/',
        },
      },
    },
    capacity: BIKEAVL_UNKNOWN,
  },

  // Lowest level for stops and terminals are rendered
  stopsMinZoom: 13,
  // Highest level when stops and terminals are still rendered as small markers
  stopsSmallMaxZoom: 14,
  // Highest level when terminals are still rendered instead of individual stops
  terminalStopsMaxZoom: 18,
  terminalStopsMinZoom: 12,
  // lowest zoom level when to draw rail platforms
  railPlatformsMinZoom: 15,
  terminalNamesZoom: 16,
  stopsIconSize: {
    small: 8,
    selected: 28,
    default: 18,
  },

  appBarLink: { name: 'Digitransit', href: 'https://www.digitransit.fi/' },
  appBarStyle: 'default', // DT-3375

  colors: {
    primary: '#285cab',
  },

  sprites: 'assets/svg-sprite.default.svg',

  disruption: {
    showInfoButton: true,
  },

  agency: {
    show: true,
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  meta: {
    description: APP_DESCRIPTION,
    keywords: 'digitransit',
  },

  // Ticket information feature toggle
  showTicketInformation: false,
  ticketInformation: {
    // This is the name of the primary agency operating in the area.
    // It is used when a ticket price cannot be shown to the user, indicating
    // that the primary agency is not responsible for ticketing.
    /*
    primaryAgencyName: ...,
    */
  },

  useTicketIcons: false,
  showRouteInformation: false,

  modeToOTP: {
    bus: 'BUS',
    tram: 'TRAM',
    rail: 'RAIL',
    subway: 'SUBWAY',
    citybike: 'BICYCLE_RENT',
    airplane: 'AIRPLANE',
    ferry: 'FERRY',
    walk: 'WALK',
  },

  // Control what transport modes that should be possible to select in the UI
  // and whether the transport mode is used in trip planning by default.
  transportModes: {
    bus: {
      availableForSelection: true,
      defaultValue: true,
    },

    tram: {
      availableForSelection: true,
      defaultValue: true,
    },

    rail: {
      availableForSelection: true,
      defaultValue: true,
    },

    subway: {
      availableForSelection: false,
      defaultValue: false,
    },

    airplane: {
      availableForSelection: false,
      defaultValue: false,
    },

    ferry: {
      availableForSelection: false,
      defaultValue: false,
    },

    citybike: {
      availableForSelection: true,
      defaultValue: false, // always false
    },
  },

  // modes that should not coexist with BICYCLE mode
  modesWithNoBike: ['BICYCLE_RENT', 'WALK'],

  moment: {
    relativeTimeThreshold: {
      seconds: 55,
      minutes: 59,
      hours: 23,
      days: 26,
      months: 11,
    },
  },

  customizeSearch: {
    walkReluctance: {
      available: true,
    },

    walkBoardCost: {
      available: true,
    },

    transferMargin: {
      available: true,
    },

    walkingSpeed: {
      available: true,
    },

    ticketOptions: {
      available: false,
    },

    accessibility: {
      available: true,
    },
    transferpenalty: {
      available: true,
    },
  },

  areaPolygon: [
    [minLon, minLat],
    [minLon, maxLat],
    [maxLon, maxLat],
    [maxLon, minLat],
  ],

  // Minimun distance between from and to locations in meters. User is noticed
  // if distance is less than this.
  minDistanceBetweenFromAndTo: 20,

  // If certain mode(s) only exist in limited number of areas, listing the areas as a list of polygons for
  // selected mode key will remove the mode(s) from queries if no coordinates in the query are within the polygon(s).
  // This reduces complexity in finding routes for the query.
  modePolygons: {},

  footer: {
    content: [
      { label: `© Grad Osijek ${YEAR}` },
      // Spacer
      {},
      {
        name: 'footer-feedback',
        nameEn: 'Submit feedback',
        href: 'mailto:info@osijek.hr',
        icon: 'icon-icon_speech-bubble',
      },
      {
        name: 'about-this-service',
        nameEn: 'About this service',
        route: '/o-usluzi',
        icon: 'icon-icon_info',
      },
    ],
  },

  // Default origin endpoint to use when user is outside of area
  defaultEndpoint: {
    address: 'Željeznički kolodvor Osijek',
    lon: 18.68376,
    lat: 45.55281,
  },
  defaultOrigins: [
    {
      icon: 'icon-icon_info',
      label: 'Trg Ante Starčevića ',
      lon: 18.677,
      lat: 45.56156,
    },
    {
      icon: 'icon-icon_info',
      label: 'Tvrđa ',
      lon: 18.69599,
      lat: 45.56085,
    },
    {
      icon: 'icon-icon_bus',
      label: 'Autobusni kolodvor Osijek',
      lon: 18.67992,
      lat: 45.55303,
    },
    {
      icon: 'icon-icon_rail',
      label: 'Željeznički kolodvor Osijek',
      lon: 18.68376,
      lat: 45.55281,
    },
  ],

  availableRouteTimetables: {},

  routeTimetableUrlResolver: {},

  aboutThisService: {
    hr: [
      {
        header: 'O usluzi',
        paragraphs: [
          'Ovu uslugu nudi Grad Osijek za planiranje putovanja unutar urbane Aglomeracije grada. Usluga pokriva javni, željeznički, međugradski prijevoz te pješačke rute. Usluga je temeljena na Digitransit sustavu.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by City of Osijek for route planning in Osijek-Baranja region. The service covers public transport, train, intercity bus and walking. Service is built on Digitransit platform.',
        ],
      },
    ],
  },

  staticMessages: [],

  staticIEMessage: [
    {
      id: '3',
      priority: -1,
      shouldTrigger: true,
      content: {
        en: [
          {
            type: 'text',
            content:
              'The service does not support the browser you are using. Update your browser or download a new browser using the links below.\n',
          },
          {
            type: 'a',
            content: 'Google Chrome',
            href: 'https://www.google.com/chrome/',
          },
          {
            type: 'a',
            content: 'Firefox',
            href: 'https://www.mozilla.org/fi/firefox/new/',
          },
          {
            type: 'a',
            content: 'Microsoft Edge',
            href: 'https://www.microsoft.com/en-us/windows/microsoft-edge',
          },
        ],

        hr: [
          {
            type: 'text',
            content:
              'The service does not support the browser you are using. Update your browser or download a new browser using the links below.\n',
          },
          {
            type: 'a',
            content: 'Google Chrome',
            href: 'https://www.google.com/chrome/',
          },
          {
            type: 'a',
            content: 'Firefox',
            href: 'https://www.mozilla.org/fi/firefox/new/',
          },
          {
            type: 'a',
            content: 'Microsoft Edge',
            href: 'https://www.microsoft.com/en-us/windows/microsoft-edge',
          },
        ],
      },
    },
  ],

  minutesToDepartureLimit: 9,

  imperialEnabled: false,
  // this flag when true enables imperial measurements  'feet/miles system'

  showAllBusses: false,
  showVehiclesOnStopPage: false,
  // DT-3551: Link to traffic information page.
  trafficNowLink: '',

  timetables: {},

  // DT-3611
  showVehiclesOnSummaryPage: false,

  showWeatherInformation: true,
  showBikeAndPublicItineraries: false,
  showBikeAndParkItineraries: false,

  includeBikeSuggestions: true,

  showNearYouButtons: true,
  nearYouModes: ['bus', 'tram', 'rail', 'citybike'],

  zoneIconsAsSvg: false,

  /* Option to disable the "next" column of the Route panel as it can be confusing sometimes: https://github.com/mfdz/digitransit-ui/issues/167 */
  displayNextDeparture: true,

  messageBarAlerts: false,
};
