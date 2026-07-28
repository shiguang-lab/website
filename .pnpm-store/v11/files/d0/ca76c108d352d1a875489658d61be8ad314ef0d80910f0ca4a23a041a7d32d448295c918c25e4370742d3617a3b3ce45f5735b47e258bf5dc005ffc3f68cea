import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import { compose, getAbsolutePath } from "./utils";
/**
 * 获取柯里化 cssLoader
 */
export function getCssLoader(_ref) {
  var plugins = _ref.plugins,
    replace = _ref.replace;
  return function (code) {
    var src = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    var base = arguments.length > 2 ? arguments[2] : undefined;
    return compose(plugins.map(function (plugin) {
      return plugin.cssLoader;
    }))(replace ? replace(code) : code, src, base);
  };
}

/**
 * 获取柯里化 jsLoader
 */
export function getJsLoader(_ref2) {
  var plugins = _ref2.plugins,
    replace = _ref2.replace;
  return function (code) {
    var src = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    var base = arguments.length > 2 ? arguments[2] : undefined;
    return compose(plugins.map(function (plugin) {
      return plugin.jsLoader;
    }))(replace ? replace(code) : code, src, base);
  };
}

/**
 * 获取预置插件
 */

export function getPresetLoaders(loaderType, plugins) {
  var loaders = plugins.map(function (plugin) {
    return plugin[loaderType];
  }).filter(function (loaders) {
    return loaders === null || loaders === void 0 ? void 0 : loaders.length;
  });
  var res = loaders.reduce(function (preLoaders, curLoaders) {
    return preLoaders.concat(curLoaders);
  }, []);
  return loaderType === "cssBeforeLoaders" ? res.reverse() : res;
}

/**
 * 获取影响插件
 */

export function getEffectLoaders(loaderType, plugins) {
  return plugins.map(function (plugin) {
    return plugin[loaderType];
  }).filter(function (loaders) {
    return loaders === null || loaders === void 0 ? void 0 : loaders.length;
  }).reduce(function (preLoaders, curLoaders) {
    return preLoaders.concat(curLoaders);
  }, []);
}

// 判断 url 是否符合loader的规则
export function isMatchUrl(url, effectLoaders) {
  return effectLoaders.some(function (loader) {
    return typeof loader === "string" ? url === loader : loader.test(url);
  });
}

/**
 * 转换子应用css内的相对地址成绝对地址
 */
function cssRelativePathResolve(code, src, base) {
  var baseUrl = src ? getAbsolutePath(src, base) : base;
  /**
   * https://developer.mozilla.org/en-US/docs/Web/CSS/url
   *
   * 旧: const urlReg = /(url\((?!['"]?(?:data):)['"]?)([^'")]*)(['"]?\))/g;
   *
   * 这里修改一下正则匹配，先匹配url(xxx)内的xxx，需要兼容一下嵌套括号，
   * 再判断是否为base64，不再预先忽略data:前缀，防止base64的svg内仍有url被匹配
   *
   * eg:
   * background: url(data:image/svg+xml;charset=utf-8,<svg><path fill=url(#a)></path></svg>)
   * 以上样式会匹配出#a并进行修改，svg填充的路径就出问题了。
   *
   *  */
  var urlReg = /url\((['"]?)((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))*)(\1)\)/g;
  return code.replace(urlReg, function (_m, pre, url, post) {
    var base64Regx = /^data:/;
    var isBase64 = base64Regx.test(url);

    /** 如果匹配到data:前缀，则认为是base64文件，直接不进行路径替换吧 */
    if (isBase64) {
      return _m;
    }
    return "url(".concat(pre).concat(getAbsolutePath(url, baseUrl)).concat(post, ")");
  });
}
var defaultPlugin = {
  cssLoader: cssRelativePathResolve,
  // fix https://github.com/Tencent/wujie/issues/455
  cssBeforeLoaders: [{
    content: "html {view-transition-name: none;}"
  }]
};
export function getPlugins(plugins) {
  return Array.isArray(plugins) ? [defaultPlugin].concat(_toConsumableArray(plugins)) : [defaultPlugin];
}
export default defaultPlugin;
//# sourceMappingURL=plugin.js.map