/*global define, console, $, mango */
define(function (require) {
    'use strict';

    // We define an object that has properties and functions.
    return {
        
        // Internal variables
        ID: null,

        // Create component
        createComponent: function (htmlID, action) {
            console.log('[component]: creating new listObjectView.');

            this.ID = mango.client.components.register('listObjectView', this);

            mango.actions.get(action, function (err, actions) {
                if (err) {
                    console.error('[component](' + this.ID + '): ' + err);
                    return;
                }
                mango.actions.interperActions(action, actions, function (data) {
                    console.log(data);
                });
            }, this);

        }

    };

});