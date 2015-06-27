// https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2427.025627400336!2d5.7054621!3d52.53297049999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c62af804c48d73%3A0xd5432db93e242c44!2sCarolusgulden+4%2C+8253+DB+Dronten!5e0!3m2!1snl!2snl!4v1434135811073
/*global define, console, $, mango */
define(function (require) {
    'use strict';

    var componentTemplate = require('lib/text!components/googleMapsView/template.html'),
        underscore = require('lib/underscore');
    
    // We define an object that has properties and functions.
    return {

        // Set template
        template: componentTemplate,
        
        // Another function in this scope.
        constructComponent: function (data, args) {
            mango.logger.log('[component](' + args.ID + '): constructing gridView.');
            var html = _.template(this.template),
                output = html(data);
            
            output = output.split('[component.id]').join(this.ID);
            $(args.htmlID).replaceWith('<div id="' + args.ID + '">' + output + '</div>');
            
        },
        
        // Create component
        createComponent: function (htmlID, action) {
            mango.logger.log('[component]: creating new googleMapsView.');

            mango.actions.get(action, function (err, actions, args) {
                if (err) {
                    mango.logger.error('[component](' + this.ID + '): ' + err);
                    return;
                }
                mango.actions.interperActions(action, actions, mango.hitch(this, function (data, args) {
                    this.constructComponent(data.json, args);
                }, args));
            }, this, {
                ID: mango.client.components.register('googlemaps', this),
                htmlID: htmlID
            });

        }

    };

});