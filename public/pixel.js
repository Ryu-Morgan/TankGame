// Copyright (C) 2013-2014 rastating
//
// Version 0.9b
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see http://www.gnu.org/licenses/.

var PixelJS = {
    AnimatedSprite: function () { },
    Asset: function () { },
    Engine: function () { },
    Entity: function () { },
    FPSCounter: function () { },
    Layer: function () { },
    Player: function () { },
    Sprite: function () { },
    SpriteSheet: function () { },
    Tile: function () { },
    
    _assetCache: [],
    assetPath: 'assets',
    
    existsInArray: function (item, arrayToSearch) {
        var i = arrayToSearch.length;
        while (i--) {
            if (arrayToSearch[i] == item) {
                return true;
            }
        }
        return false;
    },
    
    extend: function (childClass, parentClass) {
        childClass.prototype = new parentClass();
        childClass.prototype.constructor = childClass;
    },
    
    proxy: function (callback, context, additionalArguments) {
        if (additionalArguments !== undefined) {
            callback.apply(context);
        }
        else {
            callback.apply(context, additionalArguments);
        }
    },
    
    Keys: {
        Space: 32,
        Backspace: 8,
        Tab: 9,
        Enter: 13,
        Shift: 16,
        Control: 17,
        Alt: 18,
        Pause: 19,
        Break: 19,
        CapsLock: 20,
        Escape: 27,
        PageUp: 33,
        PageDown: 34,
        End: 35,
        Home: 36,
        Left: 37,
        Up: 38,
        Right: 39,
        Down: 40,
        Insert: 45,
        Delete: 46,
        Zero: 48,
        One: 49,
        Two: 50,
        Three: 51,
        Four: 52,
        Five: 53,
        Six: 54,
        Seven: 55,
        Eight: 56,
        Nine: 57,
        Colon: 59,
        NumPadFour: 100,
        NumPadFive: 101,
        NumPadSix: 102,
        NumPadSeven: 103,
        NumPadEight: 104,
        NumPadNine: 105,
        NumPadAsterisk: 106,
        NumPadPlus: 107,
        NumPadMinus: 109,
        Equals: 61,
        A: 65,
        B: 66,
        C: 67,
        D: 68,
        E: 69,
        NumPadPeriod: 110,
        NumPadSlash: 111,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F: 70,
        G: 71,
        H: 72,
        I: 73,
        J: 74,
        K: 75,
        L: 76,
        M: 77,
        N: 78,
        O: 79,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123,
        P: 80,
        Q: 81,
        R: 82,
        S: 83,
        T: 84,
        U: 85,
        V: 86,
        W: 87,
        X: 88,
        Y: 89,
        Z: 90,
        Windows: 91,
        ContextMenu: 93,
        NumPadZero: 96,
        NumPadOne: 97,
        NumPadTwo: 98,
        NumPadThree: 99,
        NumLock: 144,
        ScrollLock: 145,
        Pipe: 220,
        BackSlash: 220,
        OpeningSquareBracket: 219,
        OpeningCurlyBracket: 219,
        ClosingSquareBracket: 221,
        ClosingCurlyBracket: 221,
        Comma: 188,
        Period: 190,
        ForwardSlash: 191,
        Tilde: 222,
        Hash: 222
    },
    
    Directions: {
        Left: 1,
        Right: 2,
        Up: 4,
        Down: 8
    },
    
    Buttons: {
        Left: 1,
        Right: 2,
        Middle: 4
    }
};



PixelJS.Asset = function () {
    "use strict";
    this._prepInfo = undefined;
};

PixelJS.Asset.prototype._loaded = false;
PixelJS.Asset.prototype._onLoad = undefined;
PixelJS.Asset.prototype.load = function (info, callback) { };
PixelJS.Asset.prototype.name = '';

PixelJS.Asset.prototype.onLoad = function (callback) {
    this._onLoad = callback;
    return this;
};

PixelJS.Asset.prototype.prepare = function (info) {
    this._prepInfo = info;
    return this;
};

Object.defineProperty(PixelJS.Asset.prototype, "loaded", {
    get: function () { 
        return this._loaded; 
    },
    set: function (val) { 
        this._loaded = val;
        if (this._onLoad !== undefined) {
            this._onLoad(this);
        }
    },
    configurable: false,
    enumerable: false
});



PixelJS.Engine = function () {
    "use strict";

    this.scene = { container: undefined, width: 0, height: 0 };
    this._deltaTime = 0; // _deltaTime contains the time in fractional seconds since the last update
    this._fullscreenRequested = false;
    this._events = { keydown: [], keyup: [], mousemove: [], mousedown: [], mouseup: [] };
    this._inputLayer = [];
    this._layerKeys = [];
    this._layers = {};
    this._originalContainerStyle = {};
    this._previousElapsedTime = 0;
    this._size = { width: 0, height: 0 };
    this._soundKeys = [];
    this._sounds = {};
    this._gameLoopCallbacks = [];

    var self = this;
    document.onkeydown = function (e) {
        e = e || event; // Small hack to get the event args in IE
        var keyCode = e.keyCode;
        var listeners = self._events.keydown;
        if (listeners.length > 0) {
            e.preventDefault();
            listeners.forEach(function(listener) {
                listener(keyCode);
            });
        }
    };

    document.onkeyup = function (e) {
        e = e || event; // Small hack to get the event args in IE
        var keyCode = e.keyCode;
        var listeners = self._events.keyup;
        if (listeners.length > 0) {
            e.preventDefault();
            listeners.forEach(function(listener) {
                listener(keyCode);
            });
        }
    };

    this._resizeHandler = function () {
        self.scene.container.style.width =  window.innerWidth + "px";
        self.scene.container.style.height = window.innerHeight + "px";
    };

    this._screenModeChangeHandler = function () {
        if (!self._fullscreenRequested) {
            var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            var fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;

            if (fullscreenElement === null || fullscreenElement === undefined) {
                document.removeEventListener("fullscreenchange", self._screenModeChangeHandler, false);
                document.removeEventListener("webkitfullscreenchange", self._screenModeChangeHandler, false);
                document.removeEventListener("mozfullscreenchange", self._screenModeChangeHandler, false);
                self.fullscreen = false;
            }
        }
        else {
            self._fullscreenRequested = false;
        }
    }
};

PixelJS.Engine.prototype._checkForCollissions = function () {
    for (var keyIndex = 0; keyIndex < this._layerKeys.length; keyIndex++) {
        // Check for collisions within the layer's own collidables
        var collidables = this._layers[this._layerKeys[keyIndex]]._collidables;
        for (var s = 0; s < collidables.length; s++) {
            for (var t = 0; t < collidables.length; t++) {
                if (s !== t) {
                    if (collidables[s].collidesWith(collidables[t])) {
                        collidables[s]._onCollide(collidables[t]);
                    }
                }
            }
        }

        // Check for collisions with the other layers' collidables
        for (var k = 0; k < this._layerKeys.length; k++) {
            if (k !== keyIndex) {
                var otherCollidables = this._layers[this._layerKeys[k]]._collidables;
                for (var s = 0; s < collidables.length; s++) {
                    for (var t = 0; t < otherCollidables.length; t++) {
                        if (collidables[s].collidesWith(otherCollidables[t])) {
                            collidables[s]._onCollide(otherCollidables[t]);
                        }
                    }
                }
            }
        }
    }
};

PixelJS.Engine.prototype._displayFPS = false;
PixelJS.Engine.prototype._fullscreen = false;
PixelJS.Engine.prototype.maxDeltaTime = 33;

PixelJS.Engine.prototype._registerGameLoopCallback = function (callback) {
    this._gameLoopCallbacks.push(callback);
};

PixelJS.Engine.prototype._unregisterGameLoopCallback = function (callback) {
    for (var i = this._gameLoopCallbacks.length - 1; i >= 0; i--) {
        if (this._gameLoopCallbacks[i] == callback) {
            this._gameLoopCallbacks.splice(i, 1);
        }
    }
};

PixelJS.Engine.prototype._toggleFPSLayer = function () {
    if (this._displayFPS) {
        if (this._layers["__pixeljs_performanceLayer"] === undefined) {
            var layer = this.createLayer("__pixeljs_performanceLayer");
            var counter = new PixelJS.FPSCounter(layer);
            counter.pos = { x: 5, y: 20 };
            layer.addComponent(counter);
            layer.zIndex = 9999;
        }
        else {
            this._layers["__pixeljs_performanceLayer"].visible = true;
        }
    }
    else {
        if (this._layers["__pixeljs_performanceLayer"] !== undefined) {
            this._layers["__pixeljs_performanceLayer"].visible = false;
        }
    }
};

PixelJS.Engine.prototype._updateScreenMode = function () {
    if (this._fullscreen) {
        this._fullscreenRequested = true;

        if (this.scene.container.requestFullScreen) {
            this.scene.container.requestFullScreen();
        }
        else if (this.scene.container.webkitRequestFullScreen) {
            this.scene.container.webkitRequestFullScreen();
        }
        else {
            this.scene.container.mozRequestFullScreen();
        }

        this.scene.container.style.position = 'absolute';
        this.scene.container.style.top = 0;
        this.scene.container.style.left = 0;
        window.addEventListener('resize', this._resizeHandler);

        document.addEventListener("fullscreenchange", this._screenModeChangeHandler, false);
        document.addEventListener("webkitfullscreenchange", this._screenModeChangeHandler, false);
        document.addEventListener("mozfullscreenchange", this._screenModeChangeHandler, false);
    }
    else {
        window.removeEventListener('resize', this._resizeHandler);

        this.scene.container.style.position = this._originalContainerStyle.position;
        this.scene.container.style.width = this._originalContainerStyle.width;
        this.scene.container.style.height = this._originalContainerStyle.height;

        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }
};

PixelJS.Engine.prototype.addSound = function (key, sound) {
    this._sounds[key] = sound;
    return this;
};

PixelJS.Engine.prototype.createLayer = function (name) {
    var layer = new PixelJS.Layer(this);
    this._layers[name] = layer;
    this._layerKeys.push(name);
    return layer;
};

PixelJS.Engine.prototype.createSound = function (name) {
    var sound = new PixelJS.Sound();
    this._sounds[name] = sound;
    this._soundKeys.push(name);
    return sound;
}

PixelJS.Engine.prototype.init = function (info) {
    this.scene.container = document.getElementById(info.container);
    this.scene.width = info.width;
    this.scene.height = info.height;

    this._originalContainerStyle.position = this.scene.container.style.position;
    this._originalContainerStyle.width = this.scene.container.style.width;
    this._originalContainerStyle.height = this.scene.container.style.height;
    this._originalContainerStyle.top = this.scene.container.style.top;
    this._originalContainerStyle.left = this.scene.container.style.left;

    if (info.maxDeltaTime !== undefined) {
        this.maxDeltaTime = info.maxDeltaTime;
    }
    
    var self = this;
    this._inputLayer = document.createElement('div');
    this._inputLayer.width = this.scene.width;
    this._inputLayer.height = this.scene.height;
    this._inputLayer.style.position = 'absolute';
    this._inputLayer.style.top = 0;
    this._inputLayer.style.left = 0;
    this._inputLayer.style.width = '100%';
    this._inputLayer.style.height = '100%';
    this._inputLayer.className = 'scene-layer';
    this._inputLayer.style.zIndex = '9999';
    this._inputLayer.onmousemove = function (e) {
        var listeners = self._events.mousemove;
        if (listeners.length > 0) {
            var point = self._inputLayer.relMouseCoords(e);
            listeners.forEach(function(listener) {
                listener(point);
            });
        }
    };
    
    this._inputLayer.onmousedown = function (e) {
        var listeners = self._events.mousedown;
        if (listeners.length > 0) {
            // The middle button is usually 1 but should be dispatched
            // as 4 to allow bitwise operations in the future.
            var button = e.button == 1 ? 4 : e.button == 0 ? 1 : 2;
            var point = self._inputLayer.relMouseCoords(e);
            
            listeners.forEach(function(listener) {
                listener(point, button);
            });
        }
    };
    
    this._inputLayer.onmouseup = function (e) {
        var listeners = self._events.mouseup;
        if (listeners.length > 0) {
            // The middle button is usually 1 but should be dispatched
            // as 4 to allow bitwise operations in the future.
            var button = e.button == 1 ? 4 : e.button == 0 ? 1 : 2;
            var point = self._inputLayer.relMouseCoords(e);
            
            listeners.forEach(function(listener) {
                listener(point, button);
            });
        }
    };
    
    this.scene.container.appendChild(this._inputLayer);
    return this;
};

PixelJS.Engine.prototype.loadAndRun = function (gameLoop) {
    var self = this;
    self.loadScene(function () {
        self.loadSounds(function () {
            self.run(gameLoop);
        });
    });
    
    return this;
};

PixelJS.Engine.prototype.loadScene = function (callback) {
    var loading = this._layerKeys.length;
    for (var k = 0; k < this._layerKeys.length; k++) {
        this._layers[this._layerKeys[k]].load(function () {
            loading -= 1;
            if (loading === 0) {
                callback();
            }
        });
    }
    
    return this;
};

PixelJS.Engine.prototype.loadSounds = function (callback) {
    var loading = this._soundKeys.length;
    if (loading === 0) {
        callback();
    }
    else {
        for (var k = 0; k < this._soundKeys.length; k++) {
            var key = this._soundKeys[k];
            if (this._sounds[key]._canPlay || this._sounds[key]._prepInfo === undefined) {
                loading -= 1;
                if (loading === 0) {
                    callback();
                }
            }
            else {
                this._sounds[key].load(this._sounds[key]._prepInfo, function () {
                    loading -= 1;
                    if (loading === 0) {
                        callback();
                    }
                });
            }
        }
    }
    
    return this;
};

PixelJS.Engine.prototype.off = function (event, callback) {
    for (var i = this._events[event.toLowerCase()].length - 1; i >= 0; i--) {
        if (this._events[event.toLowerCase()][i] == callback) {
            this._events[event.toLowerCase()].splice(i, 1);
        }
    }

    return this;
};

PixelJS.Engine.prototype.on = function (event, callback) {
    this._events[event.toLowerCase()].push(callback);
    return this;
};

PixelJS.Engine.prototype.playSound = function (key) {
    this._sounds[key].play();
    return this;
}

PixelJS.Engine.prototype.run = function (gameLoop) {
    var self = this;
    (function loop(elapsedTime) {
        requestAnimationFrame(loop);
        self._deltaTime = Math.min(elapsedTime - self._previousElapsedTime, self.maxDeltaTime) / 1000;

        if (!isNaN(self._deltaTime)) {
            for (var i = 0; i < self._layerKeys.length; i++) {
                self._layers[self._layerKeys[i]].update(elapsedTime, self._deltaTime);
            }
            
            for (var i = 0; i < self._gameLoopCallbacks.length; i++) {
                self._gameLoopCallbacks[i](elapsedTime, self._deltaTime);
            }

            self._checkForCollissions();

            gameLoop(elapsedTime, self._deltaTime);

            for (var i = 0; i < self._layerKeys.length; i++) {
                self._layers[self._layerKeys[i]].draw();
            }
        }

        self._previousElapsedTime = elapsedTime;
    }());
    
    return this;
};

Object.defineProperty(PixelJS.Engine.prototype, "deltaTime", {
    get: function () { return this._deltaTime; },
    configurable: false,
    enumerable: false
});

Object.defineProperty(PixelJS.Engine.prototype, "displayFPS", {
    get: function () { return this._displayFPS; },
    set: function (val) {
        this._displayFPS = val;
        this._toggleFPSLayer();
    },
    configurable: false,
    enumerable: false
});

Object.defineProperty(PixelJS.Engine.prototype, "fullscreen", {
    get: function () { return this._fullscreen; },
    set: function (val) {
        if (this._fullscreen !== val) {
            this._fullscreen = val;
            this._updateScreenMode();
        }
    },
    configurable: false,
    enumerable: true
});




PixelJS.Entity = function (layer) {
    "use strict";
    
    this._dragAnchorPoint = { x: 0, y: 0 };
    this.asset = undefined;
    this.layer = layer;
    this.opacity = 1.0;
    this.pos = { x: 0, y: 0 };
    this.size = { width: 0, height: 0 };
    this.velocity = { x: 0, y: 0 };
};

PixelJS.Entity.prototype._isClickable = false;
PixelJS.Entity.prototype._isCollidable = false;
PixelJS.Entity.prototype._isDraggable = false;
PixelJS.Entity.prototype._isDragging = false;
PixelJS.Entity.prototype._isMouseDown = false;
PixelJS.Entity.prototype._isHoverable = false;
PixelJS.Entity.prototype._isHovered = false;
PixelJS.Entity.prototype.canMoveLeft = true;
PixelJS.Entity.prototype.canMoveUp = true;
PixelJS.Entity.prototype.canMoveRight = true;
PixelJS.Entity.prototype.canMoveDown = true;
PixelJS.Entity.prototype.dragButton = PixelJS.Buttons.Left;
PixelJS.Entity.prototype.visible = true;

PixelJS.Entity.prototype._onCollide = function (entity) {
};

PixelJS.Entity.prototype._onDrag = function (point) {
    this.pos.x = point.x - this._dragAnchorPoint.x;
    this.pos.y = point.y - this._dragAnchorPoint.y;
    this._onDragCallback(this.pos);
};

PixelJS.Entity.prototype._onDragCallback = function (point) {
};

PixelJS.Entity.prototype._onDrop = function (point) {
};

PixelJS.Entity.prototype._onMouseDown = function (point, button) {
    if (point.x >= this.pos.x && point.x <= this.pos.x + this.size.width) {
        if (point.y >= this.pos.y && point.y <= this.pos.y + this.size.height) {            
            if (this._isDraggable && button == this.dragButton) {
                this._dragAnchorPoint.x = point.x - this.pos.x;
                this._dragAnchorPoint.y = point.y - this.pos.y;
                this._isDragging = true;
            }
            
            if (this._isClickable) {
                this._isMouseDown = true;
                this._onMouseDownCallback(point, button);
            }
        }
    }
};

PixelJS.Entity.prototype._onMouseDownCallback = function (point, button) {
};

PixelJS.Entity.prototype._onMouseHover = function (point, isHovering) {
};

PixelJS.Entity.prototype._onMouseUpCallback = function (point, button) {
};


PixelJS.Entity.prototype._onMouseUp = function (point, button) {
    if (this._isDraggable && this._isDragging && button == this.dragButton) {
        this._isDragging = false;
        this._onDrop(this.pos);
    }
    
    if (this._isClickable && this._isMouseDown) {
        this._isMouseDown = false;
        this._onMouseUpCallback(point, button);
    }
}

PixelJS.Entity.prototype._setIsClickable = function (val) {
    this._isClickable = val;
    if (val) {
        var self = this;
           
        // If the entity is already registered as a draggable, the mouse event
        // hooks will already be in place and don't need to be re-added.
        if (!this._isDraggable) {
            this._mousedownHook = function (p, b) { self._onMouseDown(p, b); };
            this._mouseupHook = function (p, b) { self._onMouseUp(p, b); };
            this.layer.engine.on('mousedown', this._mousedownHook);
            this.layer.engine.on('mouseup', this._mouseupHook);
        }
    }
};

PixelJS.Entity.prototype._setIsCollidable = function (val) {
    if (val && !this._isCollidable) {
        this._isCollidable = val;
        this.layer.registerCollidable(this);
    }
    else {
        this._isCollidable = val;
    }
};

PixelJS.Entity.prototype._setIsDraggable = function (val) {
    this._isDraggable = val;
    if (val) {
        var self = this;
        
        // If the entity is already registered as a clickable, the mouse event
        // hooks will already be in place and don't need to be re-added.
        if (!this._isClickable) {
            this._mousedownHook = function (p, b) { self._onMouseDown(p, b); };
            this._mouseupHook = function (p, b) { self._onMouseUp(p, b); };
            this.layer.engine.on('mousedown', this._mousedownHook);
            this.layer.engine.on('mouseup', this.mouseupHook);
        }
        
        this.layer._registerDraggable(this);
    }
};

PixelJS.Entity.prototype.addToLayer = function (layer) {
    this.layer = layer;
    layer.addComponent(this);
    return this;
}

PixelJS.Entity.prototype.collidesWith = function (entity) {
    "use strict";
    return this.pos.x + this.size.width > entity.pos.x &&
        this.pos.x < entity.pos.x + entity.size.width &&
        this.pos.y + this.size.height > entity.pos.y &&
        this.pos.y < entity.pos.y + entity.size.height;
};

PixelJS.Entity.prototype.dispose = function () {
    this.layer.removeComponent(this);
    
    if (this._isHoverable) {
        this.layer.engine.off('mousemove', this._mousemoveHook);
    }
    
    if (this.isClickable || this.isDraggable) {
        this.layer.engine.off('mousedown', this._mousedownHook);
        this.layer.engine.off('mouseup', this._mouseupHook);
    }
    
    return this;
};

PixelJS.Entity.prototype.draw = function() {
    this.asset.draw(this);
    return this;
};

PixelJS.Entity.prototype.fadeTo = function (opacity, duration, callback) {
    duration = duration === undefined ? 1 : duration;

    var animationSpeed = (this.opacity - opacity) / duration;
    var increasingOpacity = this.opacity < opacity;
    var self = this;
    
    if (self._animateOpacity !== undefined) {
        self.layer.engine._unregisterGameLoopCallback(self._animateOpacity);
    }
    
    this._animateOpacity = function (elapsedTime, dt) {
        dt = dt * 1000; // Convert into milliseconds from fractional seconds.
        
        if (increasingOpacity) {
            self.opacity += animationSpeed * dt;
        }
        else {
            self.opacity -= animationSpeed * dt;
        }
        
        if ((self.opacity >= opacity && increasingOpacity) || (self.opacity <= opacity && !increasingOpacity)) {
            self.opacity = opacity;
            self.layer.engine._unregisterGameLoopCallback(self._animateOpacity);
            self._animateOpacity = undefined;
            if (callback !== undefined) {
                PixelJS.proxy(callback, self);
            }
        }
    };
    
    this.layer.engine._registerGameLoopCallback(this._animateOpacity);
    return this;
};

PixelJS.Entity.prototype.moveLeft = function () {
    if (this.canMoveLeft) {
        this.pos.x -= this.velocity.x * this.layer.engine._deltaTime;
    }
    
    return this;
};
    
PixelJS.Entity.prototype.moveRight = function () {
    if (this.canMoveRight) {
        this.pos.x += this.velocity.x * this.layer.engine._deltaTime;
    }
    
    return this;
};
    
PixelJS.Entity.prototype.moveDown = function () {
    if (this.canMoveDown) {
        this.pos.y += this.velocity.y * this.layer.engine._deltaTime;
    }
    
    return this;
};

PixelJS.Entity.prototype.moveTo = function (x, y, duration, callback) {
    duration = duration === undefined ? 1 : duration;
    
    var velocityX = (this.pos.x - x) / duration;
    var velocityY = (this.pos.y - y) / duration;
    var targetIsToTheLeft = x < this.pos.x;
    var targetIsAbove = y < this.pos.y;
    var self = this;
    
    if (this._animateMovement !== undefined) {
        self.layer.engine._unregisterGameLoopCallback(self._animateMovement);
    }
    
    this._animateMovement = function (elapsedTime, dt) {
        dt = dt * 1000; // Convert into milliseconds from fractional seconds.
        if (targetIsToTheLeft) {
            self.pos.x -= velocityX * dt;
        }
        else {
            self.pos.x += (velocityX * -1) * dt;
        }
        
        if (targetIsAbove) {
            self.pos.y -= velocityY * dt;
        }
        else {
            self.pos.y += (velocityY * -1) * dt;
        }
        
        if (((targetIsToTheLeft && self.pos.x <= x) || (!targetIsToTheLeft && self.pos.x >= x)) && ((targetIsAbove && self.pos.y <= y) || (!targetIsAbove && self.pos.y >= y))) {
            self.pos.x = x;
            self.pos.y = y;
            self.layer.engine._unregisterGameLoopCallback(self._animateMovement);
            self._animateMovement = undefined;
            if (callback !== undefined) {
                callback(self);
            }
        }
    };
    
    this.layer.engine._registerGameLoopCallback(this._animateMovement);
    return this;
};

PixelJS.Entity.prototype.moveUp = function () {
    if (this.canMoveUp) {
        this.pos.y -= this.velocity.y * this.layer.engine._deltaTime;
    }
    
    return this;
};

PixelJS.Entity.prototype.onCollide = function (callback) {
    if (!this.isCollidable) {
        this.isCollidable = true;
    }
    
    this._onCollide = callback;
    return this;    
};

PixelJS.Entity.prototype.onDrag = function (callback) {
    if (!this.isDraggable) {
        this.isDraggable = true;
    }
    
    this._onDragCallback = callback;
    return this;
};

PixelJS.Entity.prototype.onDrop = function (callback) {
    if (!this.isDraggable) {
        this.isDraggable = true;
    }
    
    this._onDrop = callback;
    return this;
};

PixelJS.Entity.prototype.onMouseDown = function (callback) {
    if (!this.isClickable) {
        this.isClickable = true;
    }
    
    this._onMouseDownCallback = callback;
    return this;
};

PixelJS.Entity.prototype.onMouseHover = function (callback) {
    if (!this._isHoverable) {
        var self = this;
        this._mousemoveHook = function (point) {
            if (point.x >= self.pos.x && point.x <= self.pos.x + self.size.width) {
                if (point.y >= self.pos.y && point.y <= self.pos.y + self.size.height) {
                    if (!self._isHovered) {
                        self._onMouseHover(point, true);
                        self._isHovered = true;
                    }
                }
                else {
                    if (self._isHovered) {
                        self._onMouseHover(point, false);
                    }
                    self._isHovered = false;
                }
            }
            else {
                if (self._isHovered) {
                    self._onMouseHover(point, false);
                }
                self._isHovered = false;
            }
        };
        
        this.layer.engine.on('mousemove', this._mousemoveHook);
        this._isHoverable = true;
    }
    
    this._onMouseHover = callback;
    return this;
};

PixelJS.Entity.prototype.onMouseUp = function (callback) {
    if (!this.isClickable) {
        this.isClickable = true;
    }
    
    this._onMouseUpCallback = callback;
    return this;
};

PixelJS.Entity.prototype.update = function(elapsedTime, dt) {
};

Object.defineProperty(PixelJS.Entity.prototype, "isClickable", {
    get: function () { return this._isClickable; },
    set: function (val) { this._setIsClickable(val) },
    configurable: false,
    enumerable: false
});

Object.defineProperty(PixelJS.Entity.prototype, "isCollidable", {
    get: function () { return this._isCollidable; },
    set: function (val) { this._setIsCollidable(val) },
    configurable: false,
    enumerable: false
});

Object.defineProperty(PixelJS.Entity.prototype, "isDraggable", {
    get: function () { return this._isDraggable; },
    set: function (val) { this._setIsDraggable(val) },
    configurable: false,
    enumerable: false
});

Object.defineProperty(PixelJS.Entity.prototype, "isDragging", {
    get: function () { return this._isDragging; },
    configurable: false,
    enumerable: false
});



PixelJS.FPSCounter = function (layer) {
    var self = this;
    this.fps = 0;
    this._lastUpdate = 1;
    this.layer = layer;
};

PixelJS.extend(PixelJS.FPSCounter, PixelJS.Entity);

PixelJS.FPSCounter.prototype.update = function (elapsedTime, dt) {
    if (this._lastUpdate >= 1) {
        this.fps = 1 / dt;
        this._lastUpdate = 0;
    }
    else {
        this._lastUpdate += dt;   
    }
    
    return this;
};

PixelJS.FPSCounter.prototype.draw = function () {
    this.layer.drawText('FPS: ' + Math.round(this.fps, 2), 
        this.pos.x, 
        this.pos.y, 
        '18px "Courier New", Courier, monospace',
        '#00FF00'
    );
    
    return this;
};



PixelJS.Layer = function (engine) {
    "use strict";
    
    this._backBuffer = undefined;
    this._backBufferCtx = undefined;
    this._canvas = undefined;
    this._ctx = undefined;
    this._components = [];
    this._collidables = [];
    this._draggables = [];
    this.engine = engine;
    
    this._insertIntoDom();
};

PixelJS.Layer.prototype.redraw = true;
PixelJS.Layer.prototype.static = false;
PixelJS.Layer.prototype.visible = true;

PixelJS.Layer.prototype._insertIntoDom = function() {
    var container = this.engine.scene.container;
    this._canvas = document.createElement('canvas');
    this._canvas.width = this.engine.scene.width;
    this._canvas.height = this.engine.scene.height;
    this._canvas.style.position = 'absolute';
    this._canvas.style.top = 0;
    this._canvas.style.left = 0;
    this._canvas.style.width = '100%';
    this._canvas.style.height = '100%';
    this._canvas.className = 'scene-layer';
    this._ctx = this._canvas.getContext('2d');
    container.appendChild(this._canvas);
    
    this._backBuffer = document.createElement('canvas');
    this._backBuffer.width = this._canvas.width;
    this._backBuffer.height = this._canvas.height;
    this._backBufferCtx = this._backBuffer.getContext('2d');
};

PixelJS.Layer.prototype._registerDraggable = function (draggable) {
    if (this._draggables.length == 0) {
        var self = this;
        this.engine.on('mousemove', function (point) {
            for (var i = 0; i < self._draggables.length; i++) {
                if (self._draggables[i].isDragging) {
                    self._draggables[i]._onDrag(point);
                }
            }
        });
    }
    
    if (!PixelJS.existsInArray(draggable, this._draggables)) {
        this._draggables.push(draggable);
    }
    
    return this;
};

PixelJS.Layer.prototype._unregisterDraggable = function (draggable) {
    for (var i = this._draggables.length - 1; i >= 0; i--) {
        if (this._draggables[i] == draggable) {
            this._draggables.splice(i, 1);
        }
    }
    
    return this;
};

PixelJS.Layer.prototype.addComponent = function (component) {
    this._components.push(component);
    return this;
};

PixelJS.Layer.prototype.createEntity = function () {
    var entity = new PixelJS.Entity(this);
    this._components.push(entity);
    
    return entity;
};

PixelJS.Layer.prototype.draw = function () {
    if (this.redraw) {
        if (this.visible) {
            for (var i = 0; i < this._components.length; i++) {
                this._components[i].draw();
            }
        }
        
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._ctx.drawImage(this._backBuffer, 0, 0);
        this._backBufferCtx.clearRect(0, 0, this._backBuffer.width, this._backBuffer.height);
        
        if (this.static) {
            this.redraw = false;
        }
    }
    
    return this;
};

PixelJS.Layer.prototype.drawImage = function (img, x, y, rotation, opacity) {
    if (rotation == undefined || rotation == 0) {
        this._backBufferCtx.save();
        
        if (opacity < 1) {
            this._backBufferCtx.globalAlpha = opacity;
        }
        
        this._backBufferCtx.drawImage(img, x, y);
        this._backBufferCtx.restore();
    }
    else {
        this._backBufferCtx.save();
        this._backBufferCtx.translate(x + (img.width / 2), y + (img.height / 2));
        this._backBufferCtx.rotate(rotation * Math.PI / 180);
        if (opacity < 1) {
            this._backBufferCtx.globalAlpha = opacity;
        }
        this._backBufferCtx.drawImage(img, (img.width / 2) * -1, (img.height / 2) * -1);
        this._backBufferCtx.restore();
    }
    
    return this;
};

PixelJS.Layer.prototype.drawFromCanvas = function (canvas, x, y) {
    this._backBufferCtx.drawImage(canvas, x, y);
    return this;
};

PixelJS.Layer.prototype.drawRectangle = function (x, y, width, height, style) {
    this._backBufferCtx.save();
    this._backBufferCtx.beginPath();
    this._backBufferCtx.rect(x, y, width, height);
    
    if (style.fill !== undefined) {
        this._backBufferCtx.fillStyle = style.fill;
        this._backBufferCtx.fill();
    }
    
    if (style.stroke !== undefined) {
        this._backBufferCtx.strokeStyle = style.stroke;
        this._backBufferCtx.stroke();
    }
    
    this._backBufferCtx.closePath();
    this._backBufferCtx.restore();
    return this;
};

PixelJS.Layer.prototype.drawText = function (text, x, y, font, fillStyle, textAlign) {
    this._backBufferCtx.save();
    this._backBufferCtx.font = font;
    this._backBufferCtx.fillStyle = fillStyle;
    this._backBufferCtx.textAlign = textAlign;
    this._backBufferCtx.fillText(text, x, y);
    this._backBufferCtx.restore();
    return this;
};

PixelJS.Layer.prototype.load = function (callback) {
    var loading = this._components.length;
    if (loading === 0) {
        callback();
    }
    else {
        for (var i = 0; i < this._components.length; i++) {
            var c = this._components[i];
            if (c.asset !== undefined && c.asset._prepInfo !== undefined) {
                c.asset.load(c.asset._prepInfo, function () {
                    loading -= 1;
                    if (loading === 0) {
                        callback();
                    }
                });
            }
            else {
                loading -= 1;
                if (loading === 0) {
                    callback();
                }
            }
        }
    }
    return this;
};

PixelJS.Layer.prototype.registerCollidable = function (collidable) {
    if (!PixelJS.existsInArray(collidable, this._collidables)) {
        this._collidables.push(collidable);
    }
    
    return this;
};

PixelJS.Layer.prototype.removeComponent = function (component) {
  for (var i = this._components.length - 1; i >= 0; i--) {
        if (this._components[i] == component) {
            this._components.splice(i, 1);
            
            if (component.isCollidable) {
                this.unregisterCollidable(component);
            }
            
            if (component.isDraggable) {
                this._unregisterDraggable(component);
            }
        }
    }
    
    return this;
};

PixelJS.Layer.prototype.unregisterCollidable = function (collidable) {
    for (var i = this._collidables.length - 1; i >= 0; i--) {
        if (this._collidables[i] == collidable) {
            this._collidables.splice(i, 1);
        }
    }
    
    return this;
};

PixelJS.Layer.prototype.update = function(elapsedTime, dt) {
    for (var i = 0; i < this._components.length; i++) {
        this._components[i].update(elapsedTime, dt);
    }
    
    return this;
};

Object.defineProperty(PixelJS.Layer.prototype, "zIndex", {
    get: function () { return this._canvas.style.zIndex; },
    set: function (val) { this._canvas.style.zIndex = val; },
    configurable: false,
    enumerable: false
});



PixelJS.Player = function () {
    this._directionRowMap = {
        down: 0,
        left: 1,
        right: 2,
        up: 3
    };
    
    this.direction = 0;
    this.allowDiagonalMovement = false;
};

PixelJS.extend(PixelJS.Player, PixelJS.Entity);
PixelJS.Player.prototype.isAnimatedSprite = true;

PixelJS.Player.prototype.addToLayer = function (layer) {
    var self = this;
    layer.addComponent(this);
    this.layer = layer;
    
    this.layer.engine.on('keydown', function (keyCode) {
        switch (keyCode) {
            case PixelJS.Keys.Left:
                self.direction |= PixelJS.Directions.Left;
                break;
                
            case PixelJS.Keys.Up:
                self.direction |= PixelJS.Directions.Up;
                break;
                
            case PixelJS.Keys.Right:
                self.direction |= PixelJS.Directions.Right;
                break;
                
            case PixelJS.Keys.Down:
                self.direction |= PixelJS.Directions.Down;
                break;
        }
        
        self.layer.requiresDraw = true;
    });
        
    this.layer.engine.on('keyup', function (keyCode) {
        switch (keyCode) {
            case PixelJS.Keys.Left:
                self.direction &= ~PixelJS.Directions.Left;
                break;
                
            case PixelJS.Keys.Up:
                self.direction &= ~PixelJS.Directions.Up;
                break;
                
            case PixelJS.Keys.Right:
                self.direction &= ~PixelJS.Directions.Right;
                break;
                
            case PixelJS.Keys.Down:
                self.direction &= ~PixelJS.Directions.Down;
                break;
        }
        
        self.layer.requiresDraw = true;
    });
    
    return this;
}

PixelJS.Player.prototype.update = function (elapsedTime, dt) {
    if (this.allowDiagonalMovement) {
        if ((this.direction & PixelJS.Directions.Right) != 0) {
            this.moveRight();
        }
        
        if ((this.direction & PixelJS.Directions.Left) != 0) {
            this.moveLeft();
        }
        
        if ((this.direction & PixelJS.Directions.Up) != 0) {
            this.moveUp();
        }
        
        if ((this.direction & PixelJS.Directions.Down) != 0) {
            this.moveDown();
        }
    }
    else {
        if ((this.direction & PixelJS.Directions.Right) != 0) {
            if (this.isAnimatedSprite) {
                this.asset.startAnimating();
                this.asset.row = this._directionRowMap.right;
            }
            this.moveRight();
        }
        else if ((this.direction & PixelJS.Directions.Up) != 0) {
            if (this.isAnimatedSprite) {
                this.asset.row = this._directionRowMap.up;
                this.asset.startAnimating();
            }
            this.moveUp();
        }
        else if ((this.direction & PixelJS.Directions.Left) != 0) {
            if (this.isAnimatedSprite) {
                this.asset.row = this._directionRowMap.left;
                this.asset.startAnimating();
            }
            this.moveLeft();
        }
        else if ((this.direction & PixelJS.Directions.Down) != 0) {
            if (this.isAnimatedSprite) {
                this.asset.row = this._directionRowMap.down;
                this.asset.startAnimating();
            }
            this.moveDown();
        }
        else {
            if (this.isAnimatedSprite) {
                this.asset.stopAnimating();
            }
        }
    }
    
    return this;
};

(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

/**
 * Provides requestAnimationFrame in a cross browser way.
 * @author paulirish / http://paulirish.com/
 */
 
if ( !window.requestAnimationFrame ) {
 
    window.requestAnimationFrame = ( function() {
 
        return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
 
            window.setTimeout( callback, 1000 / 60 );
 
        };
 
    } )();
}

HTMLDivElement.prototype.relMouseCoords = function (event) {
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do {
        totalOffsetX += currentElement.offsetLeft;
        totalOffsetY += currentElement.offsetTop;
    }
    while (currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    // Fix for variable canvas width
    canvasX = Math.round( canvasX * (this.width / this.offsetWidth) );
    canvasY = Math.round( canvasY * (this.height / this.offsetHeight) );

    return {x:canvasX, y:canvasY}
}



PixelJS.Sound = function () {
    this._element = undefined;
    this._canPlay = false;
    this._prepInfo = undefined;
};

PixelJS.Sound.prototype.load = function (info, callback) {
    var self = this;
    this._element = document.createElement('audio');
    this._element.setAttribute('src', PixelJS.assetPath + '/sounds/' + info.name);
    this._element.addEventListener('canplaythrough', function () {
        self._canPlay = true;
        if (callback !== undefined) {
            callback(self);
        }
    }, true);
    this._element.load();
    
    return this;
};

PixelJS.Sound.prototype.pause = function () {
    if (this._canPlay) {
        this._element.pause();
    }
    
    return this;
};

PixelJS.Sound.prototype.play = function () {
    if (this._canPlay) {
        this._element.play();
    }
    
    return this;
};

PixelJS.Sound.prototype.prepare = function (info) {
    this._prepInfo = info;
    return this;
};

PixelJS.Sound.prototype.seek = function (time) {
    if (this._canPlay) {
        this._element.currentTime = time;
    }
    
    return this;
};

Object.defineProperty(PixelJS.Sound.prototype, "duration", {
    get: function () { return this._element.duration; },
    configurable: false,
    enumerable: true
});

Object.defineProperty(PixelJS.Sound.prototype, "loop", {
    get: function () { return this._element.loop; },
    set: function (val) { this._element.loop = val; },
    configurable: false,
    enumerable: true
});

Object.defineProperty(PixelJS.Sound.prototype, "muted", {
    get: function () { return this._element.muted; },
    set: function (val) { this._element.muted = val; },
    configurable: false,
    enumerable: true
});

Object.defineProperty(PixelJS.Sound.prototype, "paused", {
    get: function () { return this._element.paused; },
    configurable: false,
    enumerable: true
});

Object.defineProperty(PixelJS.Sound.prototype, "playbackRate", {
    get: function () { return this._element.defaultPlaybackRate; },
    set: function (val) { this._element.defaultPlaybackRate = Math.max(val, 0.1); },
    configurable: false,
    enumerable: true
});

Object.defineProperty(PixelJS.Sound.prototype, "volume", {
    get: function () { return this._element.volume; },
    set: function (val) { this._element.volume = val; },
    configurable: false,
    enumerable: true
});



PixelJS.Sprite = function () {
    "use strict";
    this.image = new Image();
};

PixelJS.extend(PixelJS.Sprite, PixelJS.Asset);

PixelJS.Sprite.prototype.transparencyKey = undefined;

PixelJS.Sprite.prototype._applyTransparencyKey = function (img, transparencyKey) {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    var pixels = ctx.getImageData(0, 0, img.width, img.height);
    var pixelData = pixels.data;
    
    // Each pixel consists of 4 integers to represent the RGBA value, hence stepping by 4.
    for (var i = 0, len = pixels.data.length; i < len; i += 4) {
        var r = pixelData[i];
        var g = pixelData[i + 1];
        var b = pixelData[i + 2];
        
        // If the RGB values match, set the alpha pixel to zero (i.e. transparent).
        if (r === transparencyKey.r && g === transparencyKey.g && b === transparencyKey.b) {
            pixelData[i + 3] = 0;
        }
        
        // Data is supposed to be read only and thus this line will fail
        // in strict mode. A work around for this needs to be looked at.
        pixels.data = pixelData;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(pixels, 0, 0);
    
    img.src = canvas.toDataURL();
};

PixelJS.Sprite.prototype.load = function (info, callback) {
    "use strict";
    var self = this;
    
    if (info !== undefined) {
        if (info.name !== undefined) {
            this.name = info.name;
        }
        
        if (info.transparencyKey !== undefined) {
            this.transparencyKey = info.transparencyKey;
        }
        
        if (info.callback !== undefined) {
            this.onLoad(info.callback);
        }
    }
    
    if (callback !== undefined) {
        this.onLoad(callback);
    }
    
    this.image.src = PixelJS.assetPath + '/sprites/' + this.name;
    this.image.onload = function () {
        self.image.onload = undefined;
        
        if (self.transparencyKey !== undefined) {
            self._applyTransparencyKey(self.image, self.transparencyKey);
        }
        
        self.loaded = true;
    };
    
    return this;
};

PixelJS.Sprite.prototype.draw = function (entity) {
    if (this.loaded && entity.visible) {
        entity.layer.drawImage(this.image, entity.pos.x, entity.pos.y, undefined, entity.opacity);
    }
    
    return this;
};




PixelJS.AnimatedSprite = function () {
    this.spriteSheet = {};
};

PixelJS.extend(PixelJS.AnimatedSprite, PixelJS.Sprite);

PixelJS.AnimatedSprite.prototype._currentFrame = 0;
PixelJS.AnimatedSprite.prototype._frameTickCount = 0;
PixelJS.AnimatedSprite.prototype._isAnimating = true;
PixelJS.AnimatedSprite.prototype.defaultFrame = 0;
PixelJS.AnimatedSprite.prototype.row = 0;
PixelJS.AnimatedSprite.prototype.speed = 0.2;
PixelJS.AnimatedSprite.prototype.resetFrame = 0;

Object.defineProperty(PixelJS.AnimatedSprite.prototype, "isAnimating", {
    get: function () { return this._isAnimating; },
    configurable: false,
    enumerable: false
});

PixelJS.AnimatedSprite.prototype.startAnimating = function () {
    this._isAnimating = true;
    return this;
}

PixelJS.AnimatedSprite.prototype.stopAnimating = function () {
    this._isAnimating = false;
    return this;
}

PixelJS.AnimatedSprite.prototype.load = function (info, callback) {
    "use strict";
    var self = this;
    
    if (info !== undefined) {
        if (info.name !== undefined) {
            this.name = info.name;
        }
        
        if (info.transparencyKey !== undefined) {
            this.transparencyKey = info.transparencyKey;
        }
        
        if (info.defaultFrame !== undefined) {
            this.defaultFrame = info.defaultFrame;
        }
        
        if (info.speed !== undefined) {
            this.speed = info.speed;
        }
        
        if (info.callback !== undefined) {
            this.onLoad(info.callback);
        }
    }
    
    if (callback !== undefined) {
        this.onLoad(callback);
    }
    
    this.spriteSheet = new PixelJS.SpriteSheet();
    this.spriteSheet.load(info, function () {
        self.loaded = true;
    });
    
    return this;
};
                          
PixelJS.AnimatedSprite.prototype.draw = function (entity) {
    "use strict";
    
    if (this.loaded) {
        if (this.speed > 0 && this._isAnimating) {
            if (!isNaN(entity.layer.engine._deltaTime)) {
                this._frameTickCount += entity.layer.engine._deltaTime * 1000;
                if (this._frameTickCount >= this.speed) {
                    this._frameTickCount = 0;
                    if (this.resetFrame < 1) {
                        this._currentFrame = this._currentFrame == this.spriteSheet.frameCount - 1 ? 0 : this._currentFrame + 1;
                    }
                    else {
                        this._currentFrame = this._currentFrame >= this.resetFrame ? 0 : this._currentFrame + 1;
                    }
                }
            }
        }
        else {
            this._currentFrame = this.defaultFrame;   
        }
        
        if (entity.visible) {
            entity.layer.drawImage(this.spriteSheet._frameImages[this.row][this._currentFrame], entity.pos.x, entity.pos.y, undefined, entity.opacity);
        }
    }
    
    return this;
};



PixelJS.SpriteSheet = function () {
    "use strict";
    this.image = new Image();
    
    this._frameImages = [];
    this._frameSize = { width: 0, height: 0 };
    this._frameCount = 0;
    this._rowCount = 1;
};

PixelJS.extend(PixelJS.SpriteSheet, PixelJS.Asset);

Object.defineProperty(PixelJS.SpriteSheet.prototype, "frameSize", {
    get: function () { return this._frameSize; },
    configurable: false,
    enumerable: false
});

Object.defineProperty(PixelJS.SpriteSheet.prototype, "frameCount", {
    get: function () { return this._frameCount; },
    configurable: false,
    enumerable: false
});

Object.defineProperty(PixelJS.SpriteSheet.prototype, "rowCount", {
    get: function () { return this._rowCount; },
    configurable: false,
    enumerable: false
});

PixelJS.SpriteSheet.prototype._getFrameData = function (row, frame, transparencyKey) {
    var canvas = document.createElement('canvas');
    canvas.width = this._frameSize.width;
    canvas.height = this._frameSize.height;

    var ctx = canvas.getContext('2d');
    ctx.drawImage(
        this.image, 
        0 + Math.ceil(this._frameSize.width * frame),
        0 + Math.ceil(this._frameSize.height * row),
        this._frameSize.width, this._frameSize.height,
        0, 
        0, 
        this._frameSize.width, this._frameSize.height
    );
    
    var pixels = ctx.getImageData(0, 0, this._frameSize.width, this._frameSize.height);
    if (transparencyKey !== undefined) {
        // Each pixel consists of 4 integers to represent the RGBA value, hence stepping by 4.
        var pixelData = pixels.data;
        
        for (var i = 0, len = pixels.data.length; i < len; i += 4) {
            var r = pixelData[i];
            var g = pixelData[i + 1];
            var b = pixelData[i + 2];
            
            // If the RGB values match, set the alpha pixel to zero (i.e. transparent).
            if (r === transparencyKey.r && g === transparencyKey.g && b === transparencyKey.b) {
                pixelData[i + 3] = 0;
            }
        }
        
        pixels.data = pixelData;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(pixels, 0, 0);
    
    var retval = new Image();
    retval.src = canvas.toDataURL();
    
    return retval;
};

PixelJS.SpriteSheet.prototype.load = function (info, callback) {
    "use strict";
    var self = this;
    var rows = info.rows != undefined ? info.rows : 1;
    this._rowCount = rows;
    this._frameCount = info.frames;
    
    if (info !== undefined) {
        if (info.name !== undefined) {
            this.name = info.name;
        }
    }
    
    this.image.src = PixelJS.assetPath + '/sprite_sheets/' + this.name;
    this.image.onload = function () {
        self._frameSize.width = Math.floor(self.image.width / info.frames);
        self._frameSize.height = Math.floor(self.image.height / rows);
        
        for (var r = 0; r < rows; r++) {
            self._frameImages[r] = [];
            for (var f = 0; f < info.frames; f++) {
                self._frameImages[r][f] = self._getFrameData(r, f, info.transparencyKey);
            }
        }
        
        callback(self);
    };
    
    return this;
};



PixelJS.Tile = function () {
    "use strict";
    this._scaledTile = new Image();
};

PixelJS.extend(PixelJS.Tile, PixelJS.Asset);
    
PixelJS.Tile.prototype.load = function (info, callback) {
    var self = this;
    
    if (info !== undefined) {
        if (info.name !== undefined) {
            this.name = info.name;
        }
        
        if (info.size !== undefined) {
            this.size = info.size;
        }
        
        if (info.callback !== undefined) {
            this.onLoad(info.callback);
        }
    }
    
    if (callback !== undefined) {
        this.onLoad(callback);
    }
    
    var img = new Image();
    img.onload = function () {
        var buffer = document.createElement('canvas');
        var ctx = buffer.getContext('2d');
        var pattern = ctx.createPattern(this, "repeat");

        buffer.width = self.size.width;
        buffer.height = self.size.height;
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, self.size.width, self.size.height);
        
        self._scaledTile.onload = function () {
            self.loaded = true;
        };
        
        self._scaledTile.src = buffer.toDataURL();
    };
    
    img.src = PixelJS.assetPath + '/tiles/' + this.name;
    return this;
};

PixelJS.Tile.prototype.update = function (elapsedTime, dt) {
};
    
PixelJS.Tile.prototype.draw = function (entity) {
    if (this.loaded) {
        entity.layer.drawImage(this._scaledTile, entity.pos.x, entity.pos.y, undefined, entity.opacity);
    }
    
    return this;
};

