var environments = {
  dev: {
    baseUrl: '/',
    videosPath: '/videos/',
    env: 'dev'
  },
  prod: {
    baseUrl: 'http://www.dddrawings.com/',
    videosPath: 'http://juancgonzalez.com/lab/videos/',
    env: 'prod'
  },
  deploy: {
    baseUrl: 'http://www.dddrawings.com/',
    videosPath: 'http://juancgonzalez.com/lab/videos/',
    env: 'deploy'
  },
  clean: {
    env: 'clean'
  }
};

var defaults = {
  siteTitle: 'Data Driven Drawings',
  siteSubtitle: 'An Approach to Autobiographical Animation',
  author: 'Juan Camilo González',
  email: 'info@juancgonzalez.com',
  siteDescription: 'PhD dissertation.',
  twitter: '@1cgonza',
  github: '1cgonza',
  googlePlus: 'https://plus.google.com/+JuanCamiloGonz%C3%A1lezJ/posts',
  defaultImage: 'https://farm9.staticflickr.com/8592/16218761572_2f7b03d274_b.jpg',
  defaultThumb: 'https://farm9.staticflickr.com/8592/16218761572_2f7b03d274.jpg',
  extLibraries: {
    jquery: 'jquery-2.1.4.min',
    jqueryUi: 'jquery-ui-1.11.4.min',
    d3: 'd3-3.5.6.min',
    momentTimezone: 'moment',
  },
  gFont: 'Inconsolata:400,700'
};

function attachOptionsToDefaults(options) {
  for (var option in options) {
    defaults[option] = options[option];
  }
  return defaults;
}

var defineEnvironment = function(args) {
  var env = attachOptionsToDefaults(environments.dev);

  args.forEach(function(val) {
    if (val === '--prod') {
      env = attachOptionsToDefaults(environments.prod);
    } else if (val === '--deploy') {
      env = attachOptionsToDefaults(environments.deploy);
    } else if (val === '--clean') {
      env = environments.clean;
    }
  });

  return env;
};

module.exports = defineEnvironment;
