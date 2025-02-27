import _extends from '@babel/runtime/helpers/extends';
import * as primitives from '@react-pdf/primitives';
export * from '@react-pdf/primitives';
import queue from 'queue';
import React, { useRef, useState, useEffect } from 'react';
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _regeneratorRuntime from '@babel/runtime/regenerator';
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

var _excluded$1 = ["style", "children"],
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
          var props = _objectWithoutPropertiesLoose(_ref2, _excluded$1);

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

var usePDF = function usePDF(_ref) {
  var document = _ref.document;
  var pdfInstance = useRef(null);

  var _useState = useState({
    url: null,
    blob: null,
    error: null,
    loading: false
  }),
      state = _useState[0],
      setState = _useState[1]; // Setup rendering queue


  useEffect(function () {
    var renderQueue = queue({
      autostart: true,
      concurrency: 1
    });

    var queueDocumentRender = function queueDocumentRender() {
      setState(function (prev) {
        return _extends({}, prev, {
          loading: true
        });
      });
      renderQueue.splice(0, renderQueue.length, function () {
        return state.error ? Promise.resolve() : pdfInstance.current.toBlob();
      });
    };

    var onRenderFailed = function onRenderFailed(error) {
      console.error(error);
      setState(function (prev) {
        return _extends({}, prev, {
          error: error
        });
      });
    };

    var onRenderSuccessful = function onRenderSuccessful(blob) {
      setState({
        blob: blob,
        error: null,
        loading: false,
        url: URL.createObjectURL(blob)
      });
    };

    pdfInstance.current = pdf();
    pdfInstance.current.on('change', queueDocumentRender);
    pdfInstance.current.updateContainer(document);
    renderQueue.on('error', onRenderFailed);
    renderQueue.on('success', onRenderSuccessful);
    return function () {
      renderQueue.end();
      pdfInstance.current.removeListener('change', queueDocumentRender);
    };
  }, []); // Revoke old unused url instances

  useEffect(function () {
    return function () {
      if (state.url) {
        URL.revokeObjectURL(state.url);
      }
    };
  }, [state.url]);

  var update = function update() {
    pdfInstance.current.updateContainer(document);
  };

  return [state, update];
};

var _excluded = ["title", "style", "className", "children", "innerRef", "showToolbar"];
var PDFViewer = function PDFViewer(_ref) {
  var title = _ref.title,
      style = _ref.style,
      className = _ref.className,
      children = _ref.children,
      innerRef = _ref.innerRef,
      _ref$showToolbar = _ref.showToolbar,
      showToolbar = _ref$showToolbar === void 0 ? true : _ref$showToolbar,
      props = _objectWithoutPropertiesLoose(_ref, _excluded);

  var _usePDF = usePDF({
    document: children
  }),
      instance = _usePDF[0],
      updateInstance = _usePDF[1];

  useEffect(updateInstance, [children]);
  var src = instance.url ? instance.url + "#toolbar=" + (showToolbar ? 1 : 0) : null;
  return /*#__PURE__*/React.createElement("iframe", _extends({
    src: src,
    title: title,
    ref: innerRef,
    style: style,
    className: className
  }, props));
};

/* eslint-disable no-console */
var BlobProvider = function BlobProvider(_ref) {
  var doc = _ref.document,
      children = _ref.children;

  var _usePDF = usePDF({
    document: doc
  }),
      instance = _usePDF[0],
      updateInstance = _usePDF[1];

  useEffect(updateInstance, [doc]);

  if (!doc) {
    console.warn('You should pass a valid document to BlobProvider');
    return null;
  }

  return children(instance);
};

/* eslint-disable no-console */
var PDFDownloadLink = function PDFDownloadLink(_ref) {
  var style = _ref.style,
      children = _ref.children,
      className = _ref.className,
      doc = _ref.document,
      _ref$fileName = _ref.fileName,
      fileName = _ref$fileName === void 0 ? 'document.pdf' : _ref$fileName,
      onClick = _ref.onClick;

  var _usePDF = usePDF({
    document: doc
  }),
      instance = _usePDF[0],
      updateInstance = _usePDF[1];

  useEffect(updateInstance, [children]);

  if (!doc) {
    console.warn('You should pass a valid document to PDFDownloadLink');
    return null;
  }

  var handleDownloadIE = function handleDownloadIE() {
    if (window.navigator.msSaveBlob) {
      // IE
      window.navigator.msSaveBlob(instance.blob, fileName);
    }
  };

  var handleClick = function handleClick(event) {
    handleDownloadIE();
    if (typeof onClick === 'function') onClick(event, instance);
  };

  return /*#__PURE__*/React.createElement("a", {
    style: style,
    href: instance.url,
    download: fileName,
    className: className,
    onClick: handleClick
  }, typeof children === 'function' ? children(instance) : children);
};

var throwEnvironmentError = function throwEnvironmentError(name) {
  throw new Error(name + " is a Node specific API. You're either using this method in a browser, or your bundler is not loading react-pdf from the appropriate web build.");
};

var renderToStream = function renderToStream() {
  throwEnvironmentError('renderToStream');
};
var renderToString = function renderToString() {
  throwEnvironmentError('renderToString');
};
var renderToFile = function renderToFile() {
  throwEnvironmentError('renderToFile');
};
var render = function render() {
  throwEnvironmentError('render');
};
var index = _extends({
  pdf: pdf,
  usePDF: usePDF,
  Font: Font,
  version: version,
  StyleSheet: StyleSheet,
  PDFViewer: PDFViewer,
  BlobProvider: BlobProvider,
  PDFDownloadLink: PDFDownloadLink,
  renderToStream: renderToStream,
  renderToString: renderToString,
  renderToFile: renderToFile,
  render: render
}, primitives);

export { BlobProvider, Font, PDFDownloadLink, PDFViewer, StyleSheet, createRenderer, index as default, pdf, render, renderToFile, renderToStream, renderToString, usePDF, version };
//# sourceMappingURL=react-pdf.browser.es.js.map
