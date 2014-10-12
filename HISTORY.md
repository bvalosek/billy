# Change History

## v1.7.0 (2014-10-12)

* Added `Application#registerDefaultInstance` method
* Added `Application#registerInstance` convenience method
* Added `Application#registerSingleton` convenience method

## v1.6.0 (2014-10-01)

* Deprecate `Application#config` -- will be removing all `ConfigStore` stuff in v2

## v1.5.2 (2014-09-22)

* JSDoc updates / documention generation script

## v1.5.1 (2014-09-15)

* Expose `ConfigStore` class on the package

## v1.5.0 (2014-08-30)

* `container()` method deprecated
* Updated dependencies
* Updated documentation

## v1.4.1 (2014-06-10)

* Updated dependencies
* Using `bluebird` for promises now

## v1.4.0 (2014-05-31)

* Added `stop()` method to shutdown services in reverse order
* Removed nasty deferred-style `.started` property
* Expose the `Application` object directly off of module

## 1.3.1 (2014-05-29)

* Fixed issue with logging timing

## 1.3.0 (2014-05-28)

* `manifest()` is deprecated now -- semi pointless
* Added debugging statements
* Fixed bug with old IE

## 1.2.0 (2014-05-27)

* Added default implicit sets when getting a config key.

## 1.1.0 (2014-05-20)

* Fixed bug when accessing deep configs that are missing
* Added `manifest()` method to declaratively setup services and configs

## 1.0.2 (2014-05-17)

* Updated NPM dependencies.

## 1.0.1 (2014-05-16)

* Use `~` instead of `^` in `package.json` for installing with old versions of `npm`.

## 1.0.0 (2014-04-22)

* First release
