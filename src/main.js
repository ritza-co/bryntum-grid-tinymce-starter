import { Grid } from '@bryntum/grid';
import './lib/TinyMceField.js';

const grid = new Grid({
    appendTo : 'container',
    columns  : [
        {
            text  : 'Name',
            field : 'name',
            flex  : 1
        }, {
            text     : 'Email',
            field    : 'email',
            type     : 'template',
            template : ({ value }) => `<a href="mailto:${value}">${value}</a>`,
            flex     : 1
        }, {
            text  : 'City',
            field : 'city',
            flex  : 1
        }, {
            text               : 'Description',
            field              : 'description',
            flex               : 2,
            minWidth           : 334,
            type               : 'template',
            template           : ({ value }) => value,
            autoHeight         : true,
            revertOnEscape     : false,
            managedCellEditing : false,
            cellEditor         : {
                // The rich text editor is allowed to overflow the cell height.
                matchSize : {
                    height : false
                }
            },
            editor : {
                type   : 'tinymcefield',
                inline : false,
                height : 400
            }
        },
        {
            text   : 'Date',
            field  : 'date',
            type   : 'date',
            format : 'YYYY-MM-DD',
            flex   : 1
        },
        {
            text  : 'Color',
            field : 'color',
            type  : 'color',
            width : 80
        }
    ],

    store : {
        readUrl  : 'foodies.json',
        autoLoad : true
    }
});
