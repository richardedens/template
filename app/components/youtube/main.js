/*global define, console, $, mango */
define(function (require) {
    'use strict';

    var componentTemplate = require('lib/text!components/youtube/template.html'),
        underscore = require('lib/underscore');
    
    // We define an object that has properties and functions.
    return {

        // Set template
        template: componentTemplate,
        


        // Another function in this scope.
        constructComponent: function (data, args) {
            mango.logger.log('[component](' + args.ID + '): constructing gridView.');
            var html = _.template(this.template),
                output = html(data),
                container = null,
                youtube = null,
                aspectRatioWidth = null,
                aspectRatioHeight = null,
                aspectRatioTop = null;
            
            output = output.split('[component.id]').join(this.ID);
            $(args.htmlID).replaceWith('<div id="' + args.ID + '">' + output + '</div>');
        
            container = $("#" + args.ID + " .youtube-container");
            youtube = container.find('iframe');

            aspectRatioWidth = container.width();
            aspectRatioHeight = Math.ceil((405 * container.width()) / 720);
            aspectRatioTop = Math.ceil((aspectRatioHeight - container.height()) / 2);

            container.css('height', '350px');
            container.css('overflow', 'hidden');
            container.css('position', 'relative');
            
            // Reload youtube again!
            youtube.attr('width', aspectRatioWidth + 'px');
            youtube.attr('height', aspectRatioHeight + 'px');
            youtube.css('width', aspectRatioWidth + 'px');
            youtube.css('height', aspectRatioHeight + 'px');
            if (aspectRatioTop !== 0) {
                youtube.css('position', 'absolute');
                youtube.css('top', '-' + aspectRatioTop + 'px');
                youtube.css('left', '0');
            }
            
        },
        
        // Create component
        createComponent: function (htmlID, action) {
            mango.logger.log('[component]: creating new youtube.');

            mango.actions.get(action, function (err, actions, args) {
                if (err) {
                    mango.logger.error('[component](' + this.ID + '): ' + err);
                    return;
                }
                mango.actions.interperActions(action, actions, mango.hitch(this, function (data, args) {

                    this.constructComponent(data.json, args);

                }, args));
            }, this, {
                ID: mango.client.components.register('youtube', this),
                htmlID: htmlID
            });

        }

    };

});