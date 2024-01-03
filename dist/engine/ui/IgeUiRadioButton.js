import { IgeUiButton } from "../../export/exports.js"
import { registerClass } from "../../export/exports.js"
export class IgeUiRadioButton extends IgeUiButton {
    classId = "IgeUiRadioButton";
    _uiRadioGroup;
    _uiOnSelect;
    _uiOnDeSelect;
    _uiSelected = false;
    _parent = null;
    radioGroup(val) {
        if (val !== undefined) {
            this._uiRadioGroup = val;
            return this;
        }
        return this._uiRadioGroup;
    }
    select(val) {
        if (val !== undefined) {
            this._uiOnSelect = val;
            return this;
        }
        if (this._parent) {
            // Loop the parent object's children, find any
            // radio buttons that belong to this radio group
            // and then deselect them
            const arr = this._parent._children;
            let arrCount = arr.length, item;
            while (arrCount--) {
                item = arr[arrCount];
                if (item !== this) {
                    if (item._uiRadioGroup === this._uiRadioGroup) {
                        // The item is part of the same radio group!
                        if (item._uiSelected) {
                            // The item is selected so un-select it!
                            item._uiSelected = false;
                            // Fire the item's onDeSelect method
                            if (item._uiOnDeSelect) {
                                item._uiOnDeSelect();
                            }
                        }
                    }
                }
            }
        }
        // Now set this item as selected
        this._uiSelected = true;
        // Fire this item's onSelect method
        if (this._uiOnSelect) {
            this._uiOnSelect();
        }
        return this;
    }
    deSelect(val) {
        if (val !== undefined) {
            this._uiOnDeSelect = val;
            return this;
        }
        this._uiSelected = false;
        if (this._uiOnDeSelect) {
            this._uiOnDeSelect();
        }
        return this;
    }
}
registerClass(IgeUiRadioButton);
