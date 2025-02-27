import _extends from '@babel/runtime/helpers/extends';
import * as primitives from '@react-pdf/primitives';
export * from '@react-pdf/primitives';
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import fs from 'fs';
import FontStore from '@react-pdf/font';
import renderPDF from '@react-pdf/render';
import PDFDocument from '@react-pdf/pdfkit';
import layoutDocument from '@react-pdf/layout';
import _objectWithoutPropertiesLoose from '@babel/runtime/helpers/objectWithoutPropertiesLoose';
import ReactFiberReconciler from 'react-reconciler';
import { unstable_scheduleCallback, unstable_cancelCallback } from 'scheduler';

/* eslint-disable no-continue */

/**
 * Checks if two sets of props are equal (recursively)
 *
 * @param {Object} props A
 * @param {Object} props B
 * @returns {Boolean} props equals?
 *
 */
var propsEqual = function propsEqual(a, b) {
  var oldPropsKeys = Object.keys(a);
  var newPropsKeys = Object.keys(b);

  if (oldPropsKeys.length !== newPropsKeys.length) {
    return false;
  }

  for (var i = 0; i < oldPropsKeys.length; i += 1) {
    var propName = oldPropsKeys[i];

    if (propName === 'render' && !a[propName] !== !b[propName]) {
      return false;
    }

    if (propName !== 'children' && a[propName] !== b[propName]) {
      if (typeof a[propName] === 'object' && typeof b[propName] === 'object' && propsEqual(a[propName], b[propName])) {
        continue;
      }

      return false;
    }

    if (propName === 'children' && (typeof a[propName] === 'string' || typeof b[propName] === 'string')) {
      return a[propName] === b[propName];
    }
  }

  return true;
};

var _excluded = ["style", "children"],
    _excluded2 = ["style"];
var emptyObject = {};

var appendChild = function appendChild(parentInstance, child) {
  var isParentText = parentInstance.type === 'TEXT';
  var isChildTextInstance = child.type === 'TEXT_INSTANCE';
  var isOrphanTextInstance = isChildTextInstance && !isParentText; // Ignore orphan text instances.
  // Caused by cases such as <>{name && <Text>{name}</Text>}</>

  if (isOrphanTextInstance) {
    console.warn("Invalid '" + child.value + "' string child outside <Text> component");
    return;
  }

  parentInstance.children.push(child);
};

var createRenderer = function createRenderer(_ref) {
  var _ref$onChange = _ref.onChange,
      onChange = _ref$onChange === void 0 ? function () {} : _ref$onChange;
  return ReactFiberReconciler({
    schedulePassiveEffects: unstable_scheduleCallback,
    cancelPassiveEffects: unstable_cancelCallback,
    supportsMutation: true,
    isPrimaryRenderer: false,
    warnsIfNotActing: false,
    appendInitialChild: appendChild,
    createInstance: function createInstance(type, _ref2) {
      var style = _ref2.style;
          _ref2.children;
          var props = _objectWithoutPropertiesLoose(_ref2, _excluded);

      return {
        type: type,
        box: {},
        style: style || {},
        props: props || {},
        children: []
      };
    },
    createTextInstance: function createTextInstance(text, rootContainerInstance) {
      return {
        type: 'TEXT_INSTANCE',
        value: text
      };
    },
    finalizeInitialChildren: function finalizeInitialChildren(element, type, props) {
      return false;
    },
    getPublicInstance: function getPublicInstance(instance) {
      return instance;
    },
    prepareForCommit: function prepareForCommit() {// Noop
    },
    clearContainer: function clearContainer() {// Noop
    },
    prepareUpdate: function prepareUpdate(element, type, oldProps, newProps) {
      return !propsEqual(oldProps, newProps);
    },
    resetAfterCommit: onChange,
    resetTextContent: function resetTextContent(element) {// Noop
    },
    getRootHostContext: function getRootHostContext() {
      return emptyObject;
    },
    getChildHostContext: function getChildHostContext() {
      return emptyObject;
    },
    shouldSetTextContent: function shouldSetTextContent(type, props) {
      return false;
    },
    now: Date.now,
    useSyncScheduling: true,
    appendChild: appendChild,
    appendChildToContainer: function appendChildToContainer(parentInstance, child) {
      if (parentInstance.type === 'ROOT') {
        parentInstance.document = child;
      } else {
        appendChild(parentInstance, child);
      }
    },
    insertBefore: function insertBefore(parentInstance, child, beforeChild) {
      var _parentInstance$child;

      var index = (_parentInstance$child = parentInstance.children) === null || _parentInstance$child === void 0 ? void 0 : _parentInstance$child.indexOf(beforeChild);
      if (index === undefined) return;
      if (index !== -1 && child) parentInstance.children.splice(index, 0, child);
    },
    removeChild: function removeChild(parentInstance, child) {
      var _parentInstance$child2;

      var index = (_parentInstance$child2 = parentInstance.children) === null || _parentInstance$child2 === void 0 ? void 0 : _parentInstance$child2.indexOf(child);
      if (index === undefined) return;
      if (index !== -1) parentInstance.children.splice(index, 1);
    },
    removeChildFromContainer: function removeChildFromContainer(parentInstance, child) {
      var _parentInstance$child3;

      var index = (_parentInstance$child3 = parentInstance.children) === null || _parentInstance$child3 === void 0 ? void 0 : _parentInstance$child3.indexOf(child);
      if (index === undefined) return;
      if (index !== -1) parentInstance.children.splice(index, 1);
    },
    commitTextUpdate: function commitTextUpdate(textInstance, oldText, newText) {
      textInstance.value = newText;
    },
    commitUpdate: function commitUpdate(instance, updatePayload, type, oldProps, newProps) {
      var style = newProps.style,
          props = _objectWithoutPropertiesLoose(newProps, _excluded2);

      instance.props = props;
      instance.style = style;
    }
  });
};

var version = "2.3.0";

var fontStore = new FontStore(); // We must keep a single renderer instance, otherwise React will complain

var renderer; // The pdf instance acts as an event emitter for DOM usage.
// We only want to trigger an update when PDF content changes

var events = {};

var pdf = function pdf(initialValue) {
  var onChange = function onChange() {
    var _events$change;

    var listeners = ((_events$change = events.change) === null || _events$change === void 0 ? void 0 : _events$change.slice()) || [];

    for (var i = 0; i < listeners.length; i += 1) {
      listeners[i]();
    }
  };

  var container = {
    type: 'ROOT',
    document: null
  };
  renderer = renderer || createRenderer({
    onChange: onChange
  });
  var mountNode = renderer.createContainer(container);

  var updateContainer = function updateContainer(doc) {
    renderer.updateContainer(doc, mountNode, null);
  };

  if (initialValue) updateContainer(initialValue);

  var render = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(compress) {
      var props, pdfVersion, language, pageLayout, pageMode, ctx, layout;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (compress === void 0) {
                compress = true;
              }

              props = container.document.props || {};
              pdfVersion = props.pdfVersion, language = props.language, pageLayout = props.pageLayout, pageMode = props.pageMode;
              ctx = new PDFDocument({
                compress: compress,
                pdfVersion: pdfVersion,
                lang: language,
                displayTitle: true,
                autoFirstPage: false,
                pageLayout: pageLayout,
                pageMode: pageMode
              });
              _context.next = 6;
              return layoutDocument(container.document, fontStore);

            case 6:
              layout = _context.sent;
              return _context.abrupt("return", renderPDF(ctx, layout));

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function render(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  var callOnRender = function callOnRender(params) {
    if (params === void 0) {
      params = {};
    }

    if (container.document.props.onRender) {
      container.document.props.onRender(params);
    }
  };

  var toBlob = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
      var chunks, instance;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              chunks = [];
              _context2.next = 3;
              return render();

            case 3:
              instance = _context2.sent;
              return _context2.abrupt("return", new Promise(function (resolve, reject) {
                instance.on('data', function (chunk) {
                  chunks.push(chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk));
                });
                instance.on('end', function () {
                  try {
                    var blob = new Blob(chunks, {
                      type: 'application/pdf'
                    });
                    callOnRender({
                      blob: blob
                    });
                    resolve(blob);
                  } catch (error) {
                    reject(error);
                  }
                });
              }));

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function toBlob() {
      return _ref2.apply(this, arguments);
    };
  }();

  var toBuffer = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3() {
      return _regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              callOnRender();
              return _context3.abrupt("return", render());

            case 2:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function toBuffer() {
      return _ref3.apply(this, arguments);
    };
  }();

  var toString = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4() {
      var result, instance;
      return _regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              result = '';
              _context4.next = 3;
              return render(false);

            case 3:
              instance = _context4.sent;
              return _context4.abrupt("return", new Promise(function (resolve, reject) {
                try {
                  instance.on('data', function (buffer) {
                    result += buffer;
                  });
                  instance.on('end', function () {
                    callOnRender();
                    resolve(result);
                  });
                } catch (error) {
                  reject(error);
                }
              }));

            case 5:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    return function toString() {
      return _ref4.apply(this, arguments);
    };
  }();

  var on = function on(event, listener) {
    if (!events[event]) events[event] = [];
    events[event].push(listener);
  };

  var removeListener = function removeListener(event, listener) {
    if (!events[event]) return;
    var idx = events[event].indexOf(listener);
    if (idx > -1) events[event].splice(idx, 1);
  };

  return {
    on: on,
    container: container,
    toBlob: toBlob,
    toBuffer: toBuffer,
    toString: toString,
    removeListener: removeListener,
    updateContainer: updateContainer
  };
};

var Font = fontStore;
var StyleSheet = {
  create: function create(s) {
    return s;
  }
};

var renderToFile = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(element, filePath, callback) {
    var instance, output, stream;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            instance = pdf(element);
            _context.next = 3;
            return instance.toBuffer();

          case 3:
            output = _context.sent;
            stream = fs.createWriteStream(filePath);
            output.pipe(stream);
            return _context.abrupt("return", new Promise(function (resolve, reject) {
              stream.on('finish', function () {
                if (callback) callback(output, filePath);
                resolve(output);
              });
              stream.on('error', reject);
            }));

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function renderToFile(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var renderToStream = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(element) {
    var instance, buffer;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            instance = pdf(element);
            _context.next = 3;
            return instance.toBuffer();

          case 3:
            buffer = _context.sent;
            return _context.abrupt("return", buffer);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function renderToStream(_x) {
    return _ref.apply(this, arguments);
  };
}();

var renderToString = function renderToString(element) {
  var instance = pdf(element);
  return instance.toString();
};

var throwEnvironmentError = function throwEnvironmentError(name) {
  throw new Error(name + " is a web specific API. You're either using this component on Node, or your bundler is not loading react-pdf from the appropriate web build.");
};

var usePDF = function usePDF() {
  throwEnvironmentError('usePDF');
};
var PDFViewer = function PDFViewer() {
  throwEnvironmentError('PDFViewer');
};
var PDFDownloadLink = function PDFDownloadLink() {
  throwEnvironmentError('PDFDownloadLink');
};
var BlobProvider = function BlobProvider() {
  throwEnvironmentError('BlobProvider');
};
var render = renderToFile;
var index = _extends({
  pdf: pdf,
  Font: Font,
  version: version,
  StyleSheet: StyleSheet,
  usePDF: usePDF,
  PDFViewer: PDFViewer,
  BlobProvider: BlobProvider,
  PDFDownloadLink: PDFDownloadLink,
  renderToStream: renderToStream,
  renderToString: renderToString,
  renderToFile: renderToFile,
  render: render
}, primitives);

export { BlobProvider, Font, PDFDownloadLink, PDFViewer, StyleSheet, createRenderer, index as default, pdf, render, renderToFile, renderToStream, renderToString, usePDF, version };
//# sourceMappingURL=react-pdf.es.js.map
