import videojs from 'video.js';

var Component = videojs.getComponent('Component');


export var TopBar = videojs.extend(Component, {
  constructor: function(player, options) {
    Component.apply(this, arguments); // invoke superclass constructor
    this.init(options);
  },

  createEl: () => { // create DOM element
    return videojs.createEl('div', { className: 'vjs-top-bar'});
  },

  init: function(options) {
    let text = options.text;

    const backButton = videojs.createEl('i', {
      className:'fa-solid fa-arrow-left-long vjs-back-button h-75 w-75', 
      onclick: options.onClickBack
    });
    const buttonHolder = videojs.createEl('div', {
      className:'col-1 h-100 d-flex justify-content-end align-items-center'
    }, {}, backButton);
    const textHolder = videojs.createEl('div', {className:'col-10 text-center'}, {}, text);
    const placeholder = videojs.createEl('div', {className:'col-1'});

    videojs.emptyEl(this.el());
    videojs.appendContent(this.el(), buttonHolder);
    videojs.appendContent(this.el(), textHolder);
    videojs.appendContent(this.el(), placeholder);
  }
});

videojs.registerComponent('TopBar', TopBar); // register component with Video.js
