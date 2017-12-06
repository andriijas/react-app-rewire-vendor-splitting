# react-app-rewire-vendor-splitting

Add vendor splitting to

Add
[Long term caching and vendor splitting](https://github.com/facebookincubator/create-react-app/pull/3145)
to your
[create-react-app](https://github.com/facebookincubator/create-react-app) via
[react-app-rewired](https://github.com/timarney/react-app-rewired).

This rewire is heavily based on the upcoming changes to `create-react-app` in
this pull request
https://github.com/facebookincubator/create-react-app/pull/3145

Thanks [@ayc0](https://github.com/Ayc0) for making it happen. This rewire will
try to keep up to the PR, making it a drop in replacement the day the PR is
accepted.

Example app using the rewire:
https://github.com/andriijas/create-react-app-playground

## Installation

```
npm install --save-dev react-app-rewire-vendor-splitting
```

OR

```
yarn add --dev react-app-rewire-vendor-splitting
```

### Example

In your react-app-rewired configuration:

```javascript
/* config-overrides.js */

const rewireVendorSplitting = require("./react-app-rewire-vendor-splitting");

module.exports = function override(config, env) {
  config = rewireVendorSplitting(config, env);

  return config;
};
```

```javascript
/* src/vendors.js */

module.exports = {
  vendors: [
    "prop-types",
    "react",
    "react-dom",
    "react-router-dom",
    "react-router-redux",
    "react-redux",
    "redux"
  ]
};
```
