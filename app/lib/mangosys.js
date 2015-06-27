/*jslint plusplus: true */
/*global location, document, define, $, alert, mango, console, window */
(function () {
    'use strict';
    
    /* =========================
        Mango Business Intelligent Layer
       ========================= */
    window.mango = {};
    
    /* =========================
        Mango hitch
       ========================= */
    window.mango.hitch = function (scope, method, arr) {
        if (!method) {
            method = scope;
            scope = null;
        }
        return !scope ? method : function () {
            var args = Array.prototype.slice.call(arguments);
            args.push(arr);
            return method.apply(scope, args || []);
        }; // Function
    };

    /* =========================
        Mango Security
       ========================= */
    window.mango.security = {
        getCsrfToken: function () {
            var d = new Date(),
                fullURI = location.protocol + '//' + location.hostname;
            mango.logger.log(fullURI);
            return window.btoa('768954' + d.getDate() + (d.getMonth() + 1) + d.getFullYear() + fullURI);
        }
    };

    /* =========================
        Mango Client
       ========================= */
    window.mango.client = {
        table: {
            get: function (name, callback, scope) {
                var host = location.hostname.split(".");
                if (typeof name !== "undefined" && name !== "") {
                    $.getJSON("sites/" + host[0] + "/data/" + name + ".json", function (data) {
                        callback.call(scope, null, data);
                    }).fail(function (err) {
                        callback.call(scope, "There was no table name defined in the call." + JSON.stringify(err), {});
                    });
                } else {
                    callback.call(scope, "There was no table name defined in the call.", {});
                }
            }
        },
        cookie: {
            save: function (cname, cvalue, exdays) {
                var d, expires;
                d = new Date();
                d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                expires = "expires=" + d.toUTCString();
                document.cookie = cname + "=" + cvalue + "; " + expires;
            },
            get: function (cname) {
                var name, ca, cl, i, c;
                name = cname + "=";
                ca = document.cookie.split(';');
                for (i = 0; i < ca.length; i++) {
                    c = ca[i];
                    while (c.charAt(0) === ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) === 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return "";
            }
        }
    };

    /* =========================
        Mango Server
       ========================= */
    window.mango.server = {
        login: function (data, success) {

            $.ajax({
                url: '/gwy/',
                type: 'POST',
                data: data,
                headers: {
                    'csrfToken' : mango.security.getCsrfToken()
                },
                dataType: 'json',
                success: success
            });

        },
        request : function (data, success) {

            $.ajax({
                url: '/gwy/',
                type: 'POST',
                data: data,
                headers: {
                    'csrfToken' : mango.security.getCsrfToken()
                },
                dataType: 'json',
                success: success
            });

        },
        pay : function (data) {
            var form = $('<form></form>');

            form.attr('method', 'post');
            form.attr('style', 'display: none;');
            form.attr('action', 'pay.php');

            $.each(data, function (key, value) {
                var field = $('<input></input>');

                field.attr('type', 'hidden');
                field.attr('name', key);
                field.attr('value', value);

                form.append(field);
            });

            // The form needs to be a part of the document in
            // order for us to be able to submit it.
            $(document.body).append(form);
            form.submit();
        },
        download : function (data) {
            $.download('/gwy/', data);
        }
    };

    /* =========================
        Mango Actions
       ========================= */
    window.mango.logger = {
        enabled: false,
        log: function (arg) {
            if (mango.logger.enabled) {
                console.log(arg);
            }
        },
        warn: function (arg) {
            if (mango.logger.enabled) {
                console.warn(arg);
            }
        },
        error: function (arg) {
            if (mango.logger.enabled) {
                console.error(arg);
            }
        }
    };
    /* =========================
        Mango Actions
       ========================= */
    window.mango.actions = {

        data: {},

        objectDefinitions: {},

        actionsLoaded: [],

        doCreateObject: function (name, action, callback) {
            var uuid = this.createUUID();
            this.data[name] = {
                "name": action.variable,
                "type": "object",
                "uuid": uuid,
                "meta": this.objectDefinitions[action.params.name],
                "json": {},
                "get": function (name) {
                    return this.jsondata[name];
                },
                "set": function (name, value) {
                    this.jsondata[name] = value;
                },
                "getUUID": function () {
                    return this.uuid;
                }
            };
            callback();
        },

        createObject: function (name, action, callback) {

            if (typeof this.objectDefinitions[action.params.name] !== "undefined") {
                this.doCreateObject(name, action, callback);
            }

            var host = location.hostname.split(".");
            $.ajax({
                url: "sites/" + host[0] + "/data/" + action.params.name + ".json",
                dataType: 'json',
                success: mango.hitch(this, function (data) {
                    this.objectDefinitions[action.params.name] = data;
                    this.doCreateObject(name, action, callback);
                })
            });

        },

        changeObject: function (name, action, callback) {
            var i, j, object;
            for (object in this.data) {
                if (this.data.hasOwnProperty(object)) {
                    if (object === name) {
                        if (this.data[name].name === action.params.variable) {
                            for (j = 0; j < action.params.set.length; j++) {
                                this.data[name].json[action.params.set[j].name] = action.params.set[j].value;
                            }
                        }
                    }
                }
            }
            callback();
        },

        commitObject: function (name, action, callback) {
            callback();
        },

        returnData: function (name, action) {
            var i, object;
            if (action.params.value === "object") {
                for (object in this.data) {
                    if (this.data.hasOwnProperty(object)) {
                        if (object === name) {
                            if (this.data[name].name === action.params.variable) {
                                object = this.data[name];
                                delete object.name;
                                return object;
                            }
                        }
                    }
                }
            }
            return {};
        },

        createUUID: function () {
            function p8(s) {
                var p = (Math.random().toString(16) + "000000000").substr(2, 8);
                return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
            }
            return p8() + p8(true) + p8(true) + p8();
        },

        // Start interperting actions!
        createObjectFunc: function (callback, data) {
            this.createObject(data.name, data.action, callback);
        },
        changeObjectFunc: function (callback, data) {
            this.changeObject(data.name, data.action, callback);
        },
        commitObjectFunc: function (callback, data) {
            this.commitObject(data.name, data.action, callback);
        },
        returnFunc: function (callback, data) {
            var result = this.returnData(data.name, data.action);
            callback(result);
        },
        interperActions: function (name, actions, callback) {

            var data = [], i, arr = [];

            for (i = 0; i < actions.actions.length; i++) {
                switch (actions.actions[i].type) {
                case "createObject":
                    arr.push(mango.hitch(this, this.createObjectFunc, { action: actions.actions[i], name: name }));
                    break;
                case "changeObject":
                    arr.push(mango.hitch(this, this.changeObjectFunc, { action: actions.actions[i], name: name }));
                    break;
                case "commitObject":
                    arr.push(mango.hitch(this, this.commitObjectFunc, { action: actions.actions[i], name: name }));
                    break;
                case "return":
                    arr.push(mango.hitch(this, this.returnFunc, { action: actions.actions[i], name: name }));
                    break;
                }
            }

            async.waterfall(arr, function (data) {
                callback(data);
            });

        },

        get: function (name, callback, scope, args) {
            // No arguments applyed then use default
            if (args === null) {
                args = {};
            }
            var host = location.hostname.split(".");
            if (typeof name !== "undefined" && name !== "") {
                mango.logger.log("[get action]: sites/" + host[0] + "/actions/" + name + ".json");
                $.getJSON("sites/" + host[0] + "/actions/" + name + ".json", function (data) {
                    callback.call(scope, null, data, args);
                }).fail(function (err) {
                    callback.call(scope, "There was no table name defined in the call." + JSON.stringify(err), {}, args);
                });
            } else {
                callback.call(scope, "There was no table name defined in the call.", {}, args);
            }
        }

    };

    return {
        mango: window.mango
    };

}());