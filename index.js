const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const paths = require("react-app-rewired/scripts/utils/paths");
const NameAllModulesPlugin = require("name-all-modules-plugin");

// Heavily based on https://github.com/facebookincubator/create-react-app/pull/3145

paths.appVendors = path.join(paths.appSrc, "vendors.js");

const extractVendors = () => {
  if (!fs.existsSync(paths.appVendors)) {
    return null;
  }
  const vendors = require(paths.appVendors);
  if (Array.isArray(vendors)) {
    if (vendors.length === 0) {
      return null;
    }
    if (Array.isArray(vendors[0])) {
      vendors.forEach(vendor => {
        if (!Array.isArray(vendor)) {
          throw new Error("Wrong vendors");
        }
      });
      // vendors are defined as: [['moduleA', 'moduleB'], ['moduleC', 'moduleD']]
      const outputVendors = {};
      vendors.forEach((vendor, index) => {
        outputVendors[`vendor${index}`] = vendor;
      });
      return outputVendors;
    } else {
      vendors.forEach(vendor => {
        if (!(typeof vendor === "string")) {
          throw new Error("Wrong vendors");
        }
      });
      // vendors are defined as: ['moduleA', 'moduleB']
      return { vendors };
    }
  } else if (typeof vendors === "object") {
    // vendors are defined as: { vendorA: ['moduleA', 'moduleB'] }
    return vendors;
  } else {
    throw new Error("Wrong vendors");
  }
};

const packageSort = packages => {
  return (left, right) => {
    const leftIndex = packages.indexOf(left.names[0]);
    const rightindex = packages.indexOf(right.names[0]);
    if (rightindex < 0) return -1;
    if (leftIndex < 0) return 1;
    if (leftIndex > rightindex) return 1;
    return -1;
  };
};

const getPluginIndex = (config, name) => {
  const index = config.plugins.findIndex(
    plugin => plugin.constructor.name === name
  );
  return index;
};

function rewireVendorSplitting(config, env) {
  if (env !== "production") {
    return config;
  }

  config.entry = { ...config.entry, ...(extractVendors() || {}) };

  config.plugins.push(new webpack.NamedModulesPlugin());

  config.plugins.push(
    new webpack.NamedChunksPlugin(chunk => {
      if (chunk.name) {
        return chunk.name;
      }
      const chunkNames = chunk.mapModules(m => m);
      chunkNames.sort((chunkA, chunkB) => chunkA.depth - chunkB.depth);
      const fileName = chunkNames[0].resource;
      return path.basename(fileName, path.extname(fileName));
    })
  );

  if (fs.existsSync(paths.appVendors)) {
    config.plugins.push(
      new webpack.optimize.CommonsChunkPlugin({
        names: [...Object.keys(extractVendors())],
        minChunks: Infinity
      })
    );
  }

  config.plugins.push(
    new webpack.optimize.CommonsChunkPlugin({
      name: "runtime"
    })
  );

  config.plugins.push(new NameAllModulesPlugin());

  const etpIndex = getPluginIndex(config, "ExtractTextPlugin");
  if (!!~etpIndex) {
    config.plugins[etpIndex].options.allChunks = true;
  }

  return config;
}

module.exports = rewireVendorSplitting;
