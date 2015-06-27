/*global define, console, $, mango */
define(function (require) {
    'use strict';

    // We define an object that has properties and functions.
    return {
        
        // Internal variables
        ID: null,

        // Create component
        createComponent: function (htmlID, action) {
            mango.logger.log('[component]: creating new objectView.');

            this.ID = mango.client.components.register('objectView', this);

            mango.actions.get(action, function (err, actions) {
                if (err) {
                    mango.logger.error('[component](' + this.ID + '): ' + err);
                    return;
                }
                mango.actions.interperActions(action, actions, mango.hitch(this, function (data) {
                    mango.logger.log(data);
                }));
            }, this);

        }

    };

});