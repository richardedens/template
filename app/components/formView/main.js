/*global define, console, $, _, mango */
define(function (require) {
    'use strict';

    var componentTemplate = require('lib/text!components/formView/template.html'),
        underscore = require('lib/underscore');

    // We define an object that has properties and functions.
    return {

        // This object collects outer JavaScript classes.
        template: componentTemplate,

        // Internal variables.
        tableName: null,
        ID: null,
        htmlID: null,

        setRecaptcha: function () {
            grecaptcha.render($('.recaptcha.' + this.ID)[0], {
              'sitekey' : '6LdKKggTAAAAAJoG_NTQKxuOMY0lkpf7-yXTjdYP',
              'theme' : 'light'
            });
        },
        
        // Create interaction
        setInteraction: function (data) {
            var self = this;
            mango.logger.log('[component](' + this.ID + '): setInteraction formView.');
            $('#' + this.ID + '_submit').on('click', function (event) {
                event.stopPropagation();
                var target = event.currentTarget || event.target;
                if ($(target).hasClass('mx-submit')) {
                    mango.logger.log('[component](' + self.ID + '): formView -> submit button clicked!.');
                }
            });
            this.setRecaptcha();
        },

        // Another function in this scope.
        constructComponent: function (data) {
            mango.logger.log('[component](' + this.ID + '): constructing gridView.');
            var html = _.template(this.template),
                output = html(data);
            // Inline template is used
            if ($(this.htmlID).html() !== '') {
                html = _.template(mango.dom.html(this.htmlID));
                output = html(data);
            }
            output = output.split('[component.id]').join(this.ID);
            $(this.htmlID).replaceWith('<div id="' + this.ID + '">' + output + '</div>');
            this.setInteraction(data);
        },

        // The function will get the META data information of the table.
        getMetadata: function () {
            mango.client.table.get(this.tableName, function (err, data) {
                if (err) {
                    mango.logger.error('[component](' + this.ID + '): ' + err);
                    return;
                }
                mango.logger.log('[component](' + this.ID + '): got META data from the table.');
                this.constructComponent(data);
            }, this);
        },

        // Create component
        createComponent: function (htmlID, table) {
            mango.logger.log('[component]: creating new formView.');
            this.htmlID = htmlID;
            this.tableName = table;
            this.ID = mango.client.components.register('formView', this);
            this.getMetadata(htmlID);
        }

    };

});