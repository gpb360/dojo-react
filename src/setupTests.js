// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');

// Mock for the single-spa functions
jest.mock('single-spa', () => ({
  registerApplication: jest.fn(),
  start: jest.fn(),
  setMountMaxTime: jest.fn(),
  setBootstrapMaxTime: jest.fn(),
  setUnmountMaxTime: jest.fn()
}));

// Mock for Dojo requirements in test environment
global.dojoConfig = {
  async: true,
  isDebug: true
};

// Set up window.dojo and window.dijit mocks for testing Dojo adapters
global.window.dojo = {
  ready: jest.fn(callback => callback()),
  byId: jest.fn(id => document.getElementById(id)),
  create: jest.fn((tag, attrs, refNode) => {
    const element = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'innerHTML') {
          element.innerHTML = value;
        } else if (key === 'className') {
          element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
          Object.assign(element.style, value);
        } else {
          element.setAttribute(key, value);
        }
      });
    }
    if (refNode) {
      refNode.appendChild(element);
    }
    return element;
  }),
  connect: jest.fn(),
  on: jest.fn(),
  addClass: jest.fn(),
  removeClass: jest.fn()
};

global.window.dijit = {
  byId: jest.fn(),
  form: {
    Button: jest.fn().mockImplementation(function() {
      this.startup = jest.fn();
      this.set = jest.fn();
      this.on = jest.fn();
      this.destroy = jest.fn();
      return this;
    }),
    TextBox: jest.fn().mockImplementation(function() {
      this.startup = jest.fn();
      this.set = jest.fn();
      this.on = jest.fn();
      this.destroy = jest.fn();
      this.get = jest.fn();
      return this;
    }),
    CheckBox: jest.fn().mockImplementation(function() {
      this.startup = jest.fn();
      this.set = jest.fn();
      this.on = jest.fn();
      this.destroy = jest.fn();
      this.get = jest.fn();
      return this;
    })
  }
}; 