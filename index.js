'use strict';

const path = require('path');
const fastbootTransform = require('fastboot-transform');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const resolve = require('resolve');

module.exports = {
  name: require('./package').name,

  included: function(app) {
    this._super.included.apply(this, arguments);

    let config = app.options.intlTelInput;
    let vendorPath = `vendor/${this.name}`;
    let host = this._findHost();

    if (config && true === config.includeUtilsScript) {
      host.import(path.join(vendorPath, 'utils.js'));
    }

    host.import(path.join(vendorPath, 'intlTelInput.js'));
  },

  treeForVendor() {
    let intlInputPath = path.join(this.resolvePackagePath('intl-tel-input'), 'src', 'js');

    let intlInputJs = fastbootTransform(new Funnel(intlInputPath, {
      files: ['intlTelInput.js', 'utils.js'],
      destDir: this.name
    }));

    return mergeTrees([intlInputJs]);
  },

  treeForPublic() {
    let intlInputImagePath = path.join(this.resolvePackagePath('intl-tel-input'), 'build', 'img');

    let imagesDir = new Funnel(intlInputImagePath, {
      include: ['*.png'],
      destDir: 'img'
    });

    return mergeTrees([imagesDir]);
  },

  treeForStyles(tree) {
    let styleTrees = [];
    let host = this._findHost();
    let scssPath = path.join(this.resolvePackagePath('intl-tel-input'), 'src', 'css')

    if (host.project.findAddonByName('ember-cli-sass')) {
      styleTrees.push(new Funnel(scssPath, {
        files: ['intlTelInput.scss', 'sprite.scss'],
        destDir: this.name
      }));
    }

    if (tree) {
      styleTrees.push(tree);
    }

    return mergeTrees(styleTrees, { overwrite: true });
  },

  resolvePackagePath(packageName) {
    let host = this._findHost();
    return path.dirname(resolve.sync(`${packageName}/package.json`, { basedir: host.project.root }));
  },

  _ensureFindHost() {
    if (!this._findHost) {
      this._findHost = function findHostShim() {
        let current = this;
        let app;

        do {
          app = current.app || app;
        } while (current.parent.parent && (current = current.parent));

        return app;
      };
    }
  }
};
