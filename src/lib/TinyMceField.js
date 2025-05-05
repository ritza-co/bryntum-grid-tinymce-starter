import { DomHelper, GlobalEvents } from '@bryntum/grid';
import RichTextField from '../widget/RichTextField';

export default class TinyMceField extends RichTextField {
    static $name = 'TinyMceField';
    static type = 'tinymcefield';

    tinymce = null;

    //region Config

    static configurable = {
        /*
         * The tinyMCE configuration options.
         *
         * This object is a proxy for all [tinyMCE configuration options](https://www.tiny.cloud/docs/tinymce/latest/initial-configuration/)
         * that should be passed to the editor.
         *
         * Note that some of the config options have defaults for seamless integration into the Bryntum components.
         * @config {Object}
         * @default
         */
        tinyMceConfig : {},

        /**
         * [tinyMCE license key](https://www.tiny.cloud/docs/tinymce/latest/license-key/) that needs to be provided by the customer.
         * @config {String}
         * @default
         */
        licenseKey : 'your-api-key',

        /**
         * The operation mode of the tinyMCE editor. Set to `true` to use content editing instead of the default
         * iFrame based editor. An inline use demonstration is provided in the
         * [Grid Rich text editor example](https://bryntum.com/products/grid/examples/tinymce-editor/).
         * @config {Boolean}
         * @default
         */
        inline : false,

        /**
         * To allow resizing in vertical or both axes, set to `true` or `'both'`.
         * @config {Boolean|'both'}
         * @default
         */
        resize : false,

        /**
         * Define if the dropdown menubar should be displayed (default false).
         * @config {Boolean}
         * @default
         */
        menubar : false,

        /**
         * Focus the editor after it becomes visible. Set to false when this is undesirable in a form where a
         * different control should be initially focused.
         * @config {Boolean}
         * @default
         */
        autoFocus : true,

        /**
         * The default root block of tinyMCE is traditionally a <p>. When integrated with Bryntum components,
         * a <div> element without browser default margins is more useful.
         * @config {String} forced_root_block
         * @default
         */
        rootBlock : 'div',

        /**
         * The default input element to be replaced by the tinyMCE editor in the Bryntum environment.
         *
         * @config {DomConfig}
         * @default
         */
        inputAttributes : {
            tag : 'textarea'
        }
    };

    construct(config = {}) {
        super.construct(config);

        const me = this;

        GlobalEvents.ion({
            theme   : 'destroyEditor',
            thisObj : me
        });

        // tinyMCE does not cooperate well with popups and loses its connection to associated DOM elements.
        // So we need to find its popup parent (might not be the direct owner but a grandparent) and destroy
        // the tinyMCE instance when the popup closes.
        me.up(w => w.isPopup)?.ion({
            hide    : 'destroyEditor',
            thisObj : me
        });

        // public event handler `onPaint` must not be used directly, so we listen for the associated event, and invoke
        // a private handler
        me.ion({
            paint   : '_onPaint',
            thisObj : me
        });
    }

    _onPaint() {
        const me = this;

        // If we still have a TinyMCE handle but its iframe/document is gone
        //     (that happens after the cell-editor overlay is hidden), dispose of it
        //     so the next part can rebuild cleanly.

        if (me.editor) {
            me.destroyEditor(); // frees the orphaned instance
        }

        // Create a new editor instance and seed it with the cell value
        if (!me.editor) {
            const html = me.value ?? '';
            me.input.value = html; // textarea content TinyMCE picks up

            globalThis.tinymce.init({
                ...me.tinyMceConfig,
                license_key       : me.licenseKey,
                auto_focus        : me.autoFocus,
                inline            : me.inline,
                forced_root_block : me.rootBlock,
                menubar           : me.menubar,
                resize            : me.resize,
                height            : me.height,
                target            : me.input,
                skin              : DomHelper.themeInfo?.name
                    ?.toLowerCase().endsWith('-dark')
                    ? 'oxide-dark'
                    : 'oxide',
                ui_mode : 'split',

                setup : editor => {
                    // Ensure the initial HTML is correct
                    editor.on('init', () => editor.setContent(html, { format : 'html' }));
                    // Mirror user edits back to the Bryntum field value
                    editor.on('NodeChange', () => {
                        if (me.isDestroying) return;

                        const newVal = editor.getContent();
                        if (newVal !== me.value) {
                            // Update the TinyMceField instance value silently when the tinyMCE content changes
                            me.richText = newVal;
                            me.triggerFieldChange({
                                value      : newVal,
                                oldValue   : me.value,
                                userAction : true
                            });
                        }
                    });
                    // when editor loses focus, finish editing
                    editor.on('blur', () => {
                        const grid = me.up('grid');
                        // need to do this because description field column has managedCellEditing set to false
                        grid.finishEditing();
                    });
                }
            }).then(editors => (me.editor = editors[0]));
        }
    }


    // Ensure the CellEdit feature is aware of our ownership of tinyMCEs floating toolbar element
    owns(target) {
        return super.owns(target) || Boolean(target?.closest('.tox-tinymce'));
    }

    destroyEditor() {
        this.editor?.destroy(); // Destroy the existing instance
        this.editor = null;
    }
}

TinyMceField.initClass();