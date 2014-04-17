module.exports = {

  /**
   * Add getter function to the target object to shadow the properties of the
   * source object. Optionally you may pass a property list; the default is
   * whatever is returned by `Object.keys()`.
   */
  linkProperties: function(target, src, props) {
    props = props || Object.keys(src);
    props.forEach(function(prop) {
      if (!target.hasOwnProperty(prop)) {
        Object.defineProperty(target, prop, {
          get: function() {
            return src[prop];
          }
        });
      }
    });
  }

};
