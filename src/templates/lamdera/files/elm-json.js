/**
 * Valid elm.json generator for Lamdera projects
 * Ensures no duplicate dependencies
 */

export const generateElmJson = (options = {}) => {
  const { testing = true, auth = false } = options;
  
  const elmJson = {
    "type": "application",
    "source-directories": ["src"],
    "elm-version": "0.19.1",
    "dependencies": {
      "direct": {
        "elm/browser": "1.0.2",
        "elm/core": "1.0.5",
        "elm/html": "1.0.0",
        "elm/json": "1.1.3",
        "elm/url": "1.0.0",
        "lamdera/codecs": "1.0.0",
        "lamdera/core": "1.0.0"
      },
      "indirect": {
        "elm/bytes": "1.0.8",
        "elm/file": "1.0.5",
        "elm/virtual-dom": "1.0.3"
      }
    },
    "test-dependencies": {
      "direct": {},
      "indirect": {}
    }
  };
  
  // Add auth dependencies
  if (auth) {
    elmJson.dependencies.direct["elm/http"] = "2.0.0";
    elmJson.dependencies.direct["elm/time"] = "1.0.0";
    elmJson.dependencies.direct["elm/random"] = "1.0.0";
    elmJson.dependencies.indirect["elm/bytes"] = "1.0.8";
  }
  
  // Add test dependencies
  if (testing) {
    elmJson["test-dependencies"].direct["elm-explorations/test"] = "2.1.1";
    elmJson["test-dependencies"].direct["lamdera/program-test"] = "3.0.0";
    elmJson["test-dependencies"].indirect["elm/random"] = "1.0.0";
  }
  
  return elmJson;
};