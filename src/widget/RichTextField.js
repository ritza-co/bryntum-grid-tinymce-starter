/**
 * @module Core/widget/RichTextField
 */

import { DomHelper, Field } from '@bryntum/grid';

/**
 * An interface class designed to be used with rich text field editors such as TinyMCE, CKEditor or Quill.
 *
 * This field uses a simple DIV as the input "field" which the libraries will use as their target element. To use
 * this field, you should subclass this class and implement the `onPaint` method to initialize the rich text editor.
 *
 * ```javascript
 * import RichTextField from './lib/Core/widget/RichTextField.js';
 *
 * export default class TinyMceField extends RichTextField {
 *     static $name = 'TinyMceField';
 *     static type = 'tinymcefield';
 *
 *     onPaint() {
 *         // Initialize TinyMCE when we have a target element
 *         globalThis.tinymce.init({
 *             target : this.input,
 *             inline : true,
 *             // Update the TinyMceField instance value silently when the TinyMCE content changes
 *             setup  : editor => editor.on('NodeChange', () => this.richText = editor.getContent())
 *         }).then(() => this.input.focus());
 *     }
 *
 *     // Ensure the CellEdit feature is aware of our ownership of TinyMCEs floating toolbar element
 *     owns(target) {
 *         return super.owns(target) || target?.closest('.tox-tinymce');
 *     }
 * }
 *
 * TinyMceField.initClass();
 * ```
 *
 * @extends Core/widget/Field
 * @classtype richtextfield
 * @inputfield
 * @abstract
 */

export default class RichTextField extends Field {
    static $name = 'RichTextField';
    static type = 'richtextfield';

    get innerElements() {
        if (!this.input) {
            this.input = DomHelper.createElement({
                tag   : 'textarea',
                class : 'b-richtextfield-input'
            });
        }
        return [this.input];
    }

    get inputValueAttr() {
        return 'innerHTML';
    }

    /**
     * Use this property to update this field´s value silently while the rich text contents of this field is being
     * edited. Otherwise it would reset caret position and completely overwrite the context.
     * @member {Boolean}
     */
    get richText() {
        return this.value;
    }

    set richText(value) {
        this.setValue(value, { silent : true });
    }
}

// Register this widget type with its Factory
RichTextField.initClass();