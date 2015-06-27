/*global define, console, $, mango, _ */
define(function (require) {
    'use strict';

    var componentTemplate = require('lib/text!components/webshopProductView/template.html'),
        underscore = require('lib/underscore');

    // We define an object that has properties and functions.
    return {

        // This object collects outer JavaScript classes.
        template: componentTemplate,

        // Internal variables.
        tableName: null,
        ID: null,
        htmlID: null,

        // Create interaction
        setInteraction: function (data) {
            var self = this;
            console.log('[component](' + this.ID + '): setInteraction webshopProductView.');
            $('#' + this.ID + '_submit').on('click', function (event) {
                event.stopPropagation();
                var target = event.currentTarget || event.target;
                if ($(target).hasClass('mx-submit')) {
                    console.log('[component](' + self.ID + '): webshopProductView -> submit button clicked!.');
                }
            });
        },

        // Another function in this scope.
        constructComponent: function (data) {
            console.log('[component](' + this.ID + '): constructing webshopProductView.');
            var html = _.template(this.template),
                output = html(data);
            output = output.split('[component.id]').join(this.ID);
            $(this.htmlID).replaceWith('<div id="' + this.ID + '">' + output + '</div>');
            this.setInteraction(data);
        },

        // The function will get the META data information of the table.
        getMetadata: function () {
            mango.client.table.get(this.tableName, function (err, data) {
                if (err) {
                    console.error('[component](' + this.ID + '): ' + err);
                    return;
                }
                console.log('[component](' + this.ID + '): got META data from the table.');
                this.constructComponent(data);
            }, this);
        },

        // Create component
        createComponent: function (htmlID, action) {
            console.log('[component]: creating new webshopProductView.');
            this.htmlID = htmlID;
            this.ID = mango.client.components.register('webshopProductView', this);
            mango.actions.get(action, function (err, actions) {
                if (err) {
                    console.error('[component](' + this.ID + '): ' + err);
                    return;
                }
                mango.actions.interperActions(action, actions, mango.hitch(this, function (data) {
                    console.log('[component](' + this.ID + ') - got data from action: ' + data);
                    this.constructComponent(data);
                }));
            }, this);
        }

    };

});